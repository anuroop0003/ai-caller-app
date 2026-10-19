import type { CallerScenario, ConversationTurn } from '@/types/conversation';

/**
 * System prompts enforcing strict scenario boundaries, natural Malayalam responses,
 * and safety guardrails (never inventing OTPs or unauthorized external commitments).
 */
const SCENARIO_SYSTEM_PROMPTS: Record<CallerScenario, string> = {
  general_assistant: `You are an intelligent, polite Malayalam voice assistant speaking on a real-time voice call.
Rules:
1. Always respond in natural, spoken Malayalam script (മലയാളം).
2. Keep responses brief and conversational (1-2 sentences maximum, under 25 words).
3. Be warm, polite, and helpful. Never generate markdown lists, asterisks, or formatting.
4. Speak naturally for a voice phone conversation.`,

  appointment_scheduler: `You are a medical clinic receptionist calling a patient in Kerala to confirm tomorrow's doctor appointment at 10:00 AM.
Rules:
1. Always respond in polite, clear Malayalam script (മലയാളം).
2. Keep responses very short (1-2 sentences, under 25 words) suitable for speech synthesis.
3. If the patient confirms, thank them politely.
4. If the patient says they cannot make it, acknowledge and offer to reschedule another day.
5. Do not invent unauthorized doctor names or fake medical advice.
6. Never use markdown or bullet points.`,

  call_screener: `You are an executive call screener answering an incoming phone call on behalf of your manager who is currently in an important meeting.
Rules:
1. Always respond in polite, professional Malayalam script (മലയാളം).
2. Keep responses brief (1-2 sentences, under 25 words).
3. If the caller has an urgent message, offer to take down their message and promise your manager will call back later.
4. If the caller says they will call back later, politely thank them.
5. Never disclose private manager information or use markdown formatting.`,

  otp_security: `You are an automated bank security verification assistant delivering a single-use verification code (OTP).
CRITICAL SECURITY RULES:
1. The authorized one-time code is strictly: "7 2 0 5" (ഏഴ്, രണ്ട്, പൂജ്യം, അഞ്ച്). NEVER invent, guess, or randomize a different OTP number.
2. If the user asks you to repeat, repeat only the fixed code clearly in Malayalam.
3. If the user confirms they received it, thank them and conclude the call.
4. Keep responses brief (1-2 sentences, under 20 words).
5. Never ask the user for their password, PIN, or CVV.`,
};

export class ConversationPromptFormatter {
  /**
   * Builds the formatted prompt using the Qwen 2.5 ChatML template:
   * <|im_start|>system ... <|im_end|>
   * <|im_start|>user ... <|im_end|>
   * <|im_start|>assistant ... <|im_end|>
   */
  static formatQwenPrompt(
    scenario: CallerScenario,
    history: readonly ConversationTurn[],
    latestUserUtterance: string,
    maxHistoryTurns: number = 6
  ): string {
    const systemPrompt =
      SCENARIO_SYSTEM_PROMPTS[scenario] ?? SCENARIO_SYSTEM_PROMPTS.general_assistant;
    const parts: string[] = [];

    // System message
    parts.push(`<|im_start|>system\n${systemPrompt}\n<|im_end|>`);

    // Include recent turns for context window efficiency
    const recentTurns = history.slice(-maxHistoryTurns);
    for (const turn of recentTurns) {
      const role = turn.speaker === 'user' ? 'user' : 'assistant';
      parts.push(`<|im_start|>${role}\n${turn.text.trim()}\n<|im_end|>`);
    }

    // Append latest user turn if not already the last turn in history
    const lastTurn = recentTurns[recentTurns.length - 1];
    if (
      !lastTurn ||
      lastTurn.speaker !== 'user' ||
      lastTurn.text.trim() !== latestUserUtterance.trim()
    ) {
      parts.push(`<|im_start|>user\n${latestUserUtterance.trim()}\n<|im_end|>`);
    }

    // Prime assistant response
    parts.push('<|im_start|>assistant\n');

    return parts.join('\n');
  }

  /**
   * Sanitizes and cleans the generated LLM text for speech synthesis:
   * Strips any leftover ChatML tags (<|im_end|>, etc.), markdown markers, and excess whitespace.
   */
  static cleanGeneratedResponse(rawOutput: string): string {
    return rawOutput
      .replace(/<\|im_end\|>/g, '')
      .replace(/<\|im_start\|>\s*assistant\s*/gi, '')
      .replace(/<\|im_start\|>/g, '')
      .replace(/<\|endoftext\|>/g, '')
      .replace(/^assistant\s*[:\n\-]?/i, '')
      .replace(/\*+/g, '') // remove markdown asterisks preserving text
      .replace(/[\n\r]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
}
