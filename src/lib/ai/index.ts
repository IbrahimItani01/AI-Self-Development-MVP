import OpenAI from "openai";
import { z } from "zod";
import { createUsageLog } from "@/lib/db/usage";
import { cleanAIGeneratedText } from "@/lib/utils/text";
import type {
	CheckInAnswers,
	GrowthPlan,
	Message,
	Student,
	UsageType,
} from "@/types";
import {
	AI_SYSTEM_INSTRUCTION,
	FOLLOW_UP_CLASSIFIER_INSTRUCTION,
	studentToneInstruction,
} from "./prompts";

const model = process.env.AI_MODEL || "gpt-4o-mini";

const growthPlanSchema = z.object({
	focusArea: z.string(),
	mainGoal: z.string(),
	focusAreas: z.array(z.string()).min(1).max(5),
	weeklyActions: z.array(z.string()).min(1).max(5),
	reflectionPrompt: z.string(),
	suggestedNextStep: z.string(),
});

const checkInSummarySchema = z.object({
	summary: z.string(),
	suggestedNextStep: z.string(),
});

const followUpSchema = z.object({
	followUpRecommended: z.boolean(),
	severity: z.enum(["low", "medium", "high"]),
	title: z.string(),
	summary: z.string(),
	recommendedAction: z.string(),
});

type FollowUpClassification = z.infer<typeof followUpSchema>;

const humanFollowUpToolSchema = followUpSchema.omit({ followUpRecommended: true });

export type HumanFollowUpToolRequest = z.infer<typeof humanFollowUpToolSchema>;

export interface ChatReplyResult {
	reply: string;
	humanFollowUpRequest: HumanFollowUpToolRequest | null;
}

const humanFollowUpTool: OpenAI.Chat.Completions.ChatCompletionTool = {
	type: "function",
	function: {
		name: "flag_human_follow_up",
		description:
			"Create a school dashboard follow-up flag when the student asks for human help or shares a concern that may benefit from mentor/counselor follow-up.",
		parameters: {
			type: "object",
			additionalProperties: false,
			properties: {
				severity: {
					type: "string",
					enum: ["low", "medium", "high"],
					description:
						"Use high only for urgent school follow-up signals. Keep this non-diagnostic.",
				},
				title: {
					type: "string",
					description: "Short school-facing title for the follow-up flag.",
				},
				summary: {
					type: "string",
					description:
						"Cautious school-facing summary. Do not include detailed dangerous content.",
				},
				recommendedAction: {
					type: "string",
					description:
						"Practical human follow-up action for a mentor, counselor, or school admin.",
				},
			},
			required: ["severity", "title", "summary", "recommendedAction"],
		},
	},
};

const outputTokenCaps: Record<UsageType, number> = {
	chat: 220,
	summary: 180,
	check_in: 190,
	classification: 180,
	growth_plan: 450,
};

function client(): OpenAI | null {
	if (!process.env.OPENAI_API_KEY) return null;
	return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function estimateUsageCost(
	inputTokens: number,
	outputTokens: number,
	usedModel = model,
): number {
	const rates: Record<string, { input: number; output: number }> = {
		"gpt-4o-mini": { input: 0.00000015, output: 0.0000006 },
		"gpt-4o": { input: 0.000005, output: 0.000015 },
	};
	const rate = rates[usedModel] ?? rates["gpt-4o-mini"]!;
	return inputTokens * rate.input + outputTokens * rate.output;
}

async function callAI(input: {
	organizationId: string;
	studentId?: string | null;
	type: UsageType;
	system: string;
	prompt: string;
	responseFormat?: "json";
	tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
}): Promise<{
	text: string;
	inputTokens: number;
	outputTokens: number;
	toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
}> {
	const openai = client();
	if (!openai) {
		const fallback = fallbackResponse(input.type, input.prompt);
		await createUsageLog({
			organizationId: input.organizationId,
			studentId: input.studentId,
			type: input.type,
			model: `${model}-mock`,
			inputTokens: Math.ceil(input.prompt.length / 4),
			outputTokens: Math.ceil(fallback.length / 4),
			estimatedCost: 0,
		});
		return { text: fallback, inputTokens: 0, outputTokens: 0, toolCalls: [] };
	}

	const completion = await openai.chat.completions.create({
		model,
		messages: [
			{ role: "system", content: input.system },
			{ role: "user", content: input.prompt },
		],
		temperature: input.responseFormat === "json" ? 0.2 : 0.6,
		max_tokens: outputTokenCaps[input.type],
		response_format:
			input.responseFormat === "json" ? { type: "json_object" } : undefined,
		tools: input.tools,
		tool_choice: input.tools ? "auto" : undefined,
	});

	const message = completion.choices[0]?.message;
	const text = message?.content?.trim() || "";
	const toolCalls = message?.tool_calls ?? [];
	const inputTokens =
		completion.usage?.prompt_tokens ?? Math.ceil(input.prompt.length / 4);
	const outputTokens =
		completion.usage?.completion_tokens ?? Math.ceil(text.length / 4);
	await createUsageLog({
		organizationId: input.organizationId,
		studentId: input.studentId,
		type: input.type,
		model,
		inputTokens,
		outputTokens,
		estimatedCost: estimateUsageCost(inputTokens, outputTokens, model),
	});
	return { text, inputTokens, outputTokens, toolCalls };
}

function fallbackResponse(type: UsageType, prompt: string): string {
	if (type === "growth_plan") {
		return JSON.stringify({
			focusArea: "Goal setting",
			mainGoal: "Build clearer weekly progress",
			focusAreas: ["Clarity", "Habits", "Confidence"],
			weeklyActions: [
				"Choose one priority each week",
				"Write one short reflection",
				"Ask for feedback when stuck",
			],
			reflectionPrompt: "What small action helped you move forward this week?",
			suggestedNextStep:
				"Pick one 15-minute action you can complete before tomorrow.",
		});
	}
	if (type === "classification") {
		return JSON.stringify({
			followUpRecommended: false,
			severity: "low",
			title: "No immediate follow-up signal",
			summary:
				"The reflection appears suitable for normal student development support.",
			recommendedAction: "Continue regular check-ins.",
		});
	}
	if (type === "check_in") {
		return JSON.stringify({
			summary:
				"You made progress by noticing what helped and what felt difficult.",
			suggestedNextStep:
				"Choose one small realistic action for the coming week.",
		});
	}
	if (type === "summary") {
		return `Recent reflection summary: ${prompt.slice(0, 500)}`;
	}
	return "Thanks for sharing that. What is one small step you could take next that feels realistic this week?";
}

function parseJson<T>(text: string, schema: z.ZodSchema<T>, fallback: T): T {
	try {
		return schema.parse(JSON.parse(text));
	} catch (error) {
		console.error("AI JSON parse failed", error, text);
		return fallback;
	}
}

function parseHumanFollowUpToolRequest(
	toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
): HumanFollowUpToolRequest | null {
	for (const toolCall of toolCalls) {
		if (toolCall.type !== "function" || toolCall.function.name !== "flag_human_follow_up") {
			continue;
		}
		try {
			return humanFollowUpToolSchema.parse(JSON.parse(toolCall.function.arguments));
		} catch (error) {
			console.error("AI follow-up tool call parse failed", error);
			return null;
		}
	}
	return null;
}

export async function generateGrowthPlan(
	student: Student,
	onboardingAnswers: Record<string, unknown>,
): Promise<Omit<GrowthPlan, "id" | "createdAt" | "updatedAt">> {
	const prompt = `Create a concise student development growth plan.
Student: ${student.displayName}
Grade: ${student.gradeLevel ?? "Not provided"}
Answers: ${JSON.stringify(onboardingAnswers)}
Return JSON with focusArea, mainGoal, focusAreas, weeklyActions, reflectionPrompt, suggestedNextStep.
Keep every field concise. weeklyActions must be short, age-appropriate actions.`;
	const result = await callAI({
		organizationId: student.organizationId,
		studentId: student.id,
		type: "growth_plan",
		system: `${AI_SYSTEM_INSTRUCTION}\n${studentToneInstruction(student)}`,
		prompt,
		responseFormat: "json",
	});
	const parsed = parseJson(
		result.text,
		growthPlanSchema,
		growthPlanSchema.parse(JSON.parse(fallbackResponse("growth_plan", prompt))),
	);
	return {
		studentId: student.id,
		organizationId: student.organizationId,
		...parsed,
	};
}

export async function generateChatReply(
	student: Student,
	conversationSummary: string | null | undefined,
	recentMessages: Message[],
	userMessage: string,
): Promise<ChatReplyResult> {
	const recent = recentMessages
		.map((message) => `${message.role}: ${message.content}`)
		.join("\n");
	const prompt = `Student: ${student.displayName}
Grade: ${student.gradeLevel ?? "Not provided"}
Focus area: ${student.selectedFocusArea ?? "Not set"}
Main goal: ${student.mainGoal ?? "Not set"}
Running summary: ${conversationSummary || "No summary yet"}
Recent messages:
${recent}

Student message:
${userMessage}

Reply as a student development companion. Keep it concise and ask one useful question or suggest one small next step.

If the student explicitly asks for a human to step in, asks to talk to a counselor/mentor/admin/teacher, says they cannot handle the situation alone, or shares a concern that may benefit from human follow-up, call flag_human_follow_up. Use cautious, school-appropriate, non-diagnostic wording. Still write a brief supportive reply for the student when possible.`;
	const result = await callAI({
		organizationId: student.organizationId,
		studentId: student.id,
		type: "chat",
		system: `${AI_SYSTEM_INSTRUCTION}\n${studentToneInstruction(student)}`,
		prompt,
		tools: [humanFollowUpTool],
	});
	const humanFollowUpRequest = parseHumanFollowUpToolRequest(result.toolCalls);
	return {
		reply:
			result.text ||
			(humanFollowUpRequest
				? "Thanks for telling me. I will flag this for a trusted school adult to follow up. If this feels urgent right now, please speak with a trusted adult near you."
				: fallbackResponse("chat", prompt)),
		humanFollowUpRequest,
	};
}

export async function summarizeConversation(
	student: Student,
	recentMessages: Message[],
): Promise<string> {
	const prompt = `Summarize the student's recent development conversation for school-facing progress memory.
Student: ${student.displayName}
Grade: ${student.gradeLevel ?? "Not provided"}
Messages:
${recentMessages.map((message) => `${message.role}: ${message.content}`).join("\n")}

Do not include sensitive details. Focus on goals, progress, blockers, and next steps. Keep it under 600 characters.`;
	const result = await callAI({
		organizationId: student.organizationId,
		studentId: student.id,
		type: "summary",
		system: `${AI_SYSTEM_INSTRUCTION}\n${studentToneInstruction(student)}`,
		prompt,
	});
	return result.text || "No summary available yet.";
}

export async function generateCheckInSummary(
	student: Student,
	checkInAnswers: CheckInAnswers,
): Promise<{ summary: string; suggestedNextStep: string }> {
	const prompt = `Create a concise weekly check-in summary and next step.
Student: ${student.displayName}
Grade: ${student.gradeLevel ?? "Not provided"}
Answers: ${JSON.stringify(checkInAnswers)}
Return strict JSON with:
{
  "summary": string,
  "suggestedNextStep": string
}
Do not use markdown, asterisks, headings, labels, bullets, or quotation marks around the values.
Keep summary under 420 characters and suggestedNextStep under 260 characters.
Use school-appropriate, polished prose.`;
	const result = await callAI({
		organizationId: student.organizationId,
		studentId: student.id,
		type: "check_in",
		system: `${AI_SYSTEM_INSTRUCTION}\n${studentToneInstruction(student)}`,
		prompt,
		responseFormat: "json",
	});
	const parsed = parseJson(
		result.text,
		checkInSummarySchema,
		checkInSummarySchema.parse(JSON.parse(fallbackResponse("check_in", prompt))),
	);
	return {
		summary: cleanAIGeneratedText(parsed.summary) || checkInAnswers.progress,
		suggestedNextStep:
			cleanAIGeneratedText(parsed.suggestedNextStep) || checkInAnswers.nextStep,
	};
}

export async function classifyFollowUpNeed(
	student: Student,
	textOrSummary: string,
): Promise<FollowUpClassification> {
	const prompt = `Student: ${student.displayName}
Grade: ${student.gradeLevel ?? "Not provided"}
Focus area: ${student.selectedFocusArea ?? "Not set"}
Text to classify:
${textOrSummary}`;
	const result = await callAI({
		organizationId: student.organizationId,
		studentId: student.id,
		type: "classification",
		system: `${AI_SYSTEM_INSTRUCTION}\n${studentToneInstruction(student)}\n${FOLLOW_UP_CLASSIFIER_INSTRUCTION}`,
		prompt,
		responseFormat: "json",
	});
	return parseJson(result.text, followUpSchema, {
		followUpRecommended: false,
		severity: "low",
		title: "No immediate follow-up signal",
		summary: "No additional human follow-up signal was identified.",
		recommendedAction: "Continue regular check-ins.",
	});
}
