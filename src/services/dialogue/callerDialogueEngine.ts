import type {
  CallerIntentType,
  CallerScenario,
  DialogueEngineInput,
  DialogueEngineOutput,
} from '@/types/conversation';

import { CALLER_SCENARIOS } from './callerScenarios';
import type { IResponseGenerator } from './responseGenerator';

/**
 * Normalizes input text across Malayalam script, Manglish, and punctuation.
 * Strips Unicode Zero-Width Joiners (ZWJ/ZWNJ) to avoid regex mismatches in chillu letters.
 */
export function normalizeUtterance(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width spaces/joiners
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>।]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface IntentPattern {
  readonly intent: CallerIntentType;
  readonly keywords: readonly string[];
}

const INTENT_PATTERNS: readonly IntentPattern[] = [
  {
    intent: 'greeting',
    keywords: [
      'നമസ്കാരം',
      'ഹലോ',
      'സുഖമാണോ',
      'വിശേഷങ്ങൾ',
      'നമസ്തേ',
      'hello',
      'hi',
      'hai',
      'namaskaram',
      'sukhamano',
    ],
  },
  {
    intent: 'repeat_request',
    keywords: [
      'ഒന്നുകൂടി',
      'മനസ്സിലായില്ല',
      'വീണ്ടും പറയൂ',
      'എന്ത് പറഞ്ഞു',
      'കേട്ടില്ല',
      'repeat',
      'again',
      'onnumkoodi',
      'onnekoodi',
      'manasilayilla',
      'ketilla',
    ],
  },
  {
    intent: 'appointment_confirm',
    keywords: [
      'വരാം',
      'ഉറപ്പിച്ചു',
      'എത്തും',
      'സമയത്ത് എത്താം',
      'ഞാൻ വരാം',
      'കൺഫേം',
      'confirm',
      'varam',
      'etham',
      'urappichu',
    ],
  },
  {
    intent: 'appointment_reschedule',
    keywords: [
      'മാറ്റണം',
      'മറ്റൊരു ദിവസം',
      'സമയം മാറ്റുമോ',
      'മാറ്റി വെക്കണം',
      'മറ്റൊരു സമയം',
      'reschedule',
      'change time',
      'postpone',
      'maatanam',
      'matoru divasam',
    ],
  },
  {
    intent: 'call_screening_busy',
    keywords: [
      'തിരക്കിലാണ്',
      'മീറ്റിംഗിലാണ്',
      'പിന്നീട് വിളിക്കാം',
      'busy',
      'meeting',
      'later',
      'pinne vilikkam',
    ],
  },
  {
    intent: 'call_screening_message',
    keywords: [
      'സന്ദേശം',
      'വിളിക്കാൻ പറയൂ',
      'പറഞ്ഞോളൂ',
      'തിരിച്ചു വിളിക്കൂ',
      'അറിയിക്കൂ',
      'message',
      'call back',
      'inform',
      'parayoo',
      'sandhesham',
    ],
  },
  {
    intent: 'otp_repeat',
    keywords: ['കോഡ് പറയൂ', 'ഒടിപി പറയൂ', 'കോഡ് എന്താണ്', 'ഒടിപി എന്താണ്', 'otp', 'code', 'parayu'],
  },
  {
    intent: 'otp_received',
    keywords: ['കിട്ടി', 'ലഭിച്ചു', 'കേട്ടു', 'എഴുതിയെടുത്തു', 'got it', 'received', 'kitti'],
  },
  {
    intent: 'call_closing',
    keywords: [
      'നന്ദി',
      'വെക്കുകയാണ്',
      'ബൈ',
      'ശുഭദിനം',
      'കട്ട് ചെയ്യാം',
      'ശരി ബൈ',
      'bye',
      'thank you',
      'thanks',
      'nandi',
      'shubhadinam',
    ],
  },
  {
    intent: 'affirmative',
    keywords: [
      'ശരി',
      'തീർച്ചയായും',
      'അതെ',
      'യെസ്',
      'ഓക്കേ',
      'തയ്യാറാണ്',
      'yes',
      'ok',
      'okay',
      'athe',
      'sari',
      'sure',
      'correct',
    ],
  },
  {
    intent: 'negative',
    keywords: [
      'ഇല്ല',
      'വരില്ല',
      'വേണ്ട',
      'പറ്റില്ല',
      'നോ',
      'no',
      'illa',
      'varilla',
      'venda',
      'pattilla',
    ],
  },
];

/**
 * Matches an utterance to the best intent based on keyword matches and scenario weights.
 */
export function detectIntent(
  normalizedUtterance: string,
  scenario: CallerScenario
): { intent: CallerIntentType; confidence: number } {
  if (!normalizedUtterance) {
    return { intent: 'unknown', confidence: 0 };
  }

  // 1. Direct keyword scoring
  let bestIntent: CallerIntentType = 'unknown';
  let maxScore = 0;

  for (const pattern of INTENT_PATTERNS) {
    let score = 0;
    for (const kw of pattern.keywords) {
      if (normalizedUtterance.includes(kw)) {
        score += kw.length; // prioritize longer, more specific phrases
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestIntent = pattern.intent;
    }
  }

  // 2. Scenario-specific intent overrides for general affirmative/negative
  if (scenario === 'appointment_scheduler') {
    if (bestIntent === 'affirmative') {
      bestIntent = 'appointment_confirm';
    } else if (bestIntent === 'negative') {
      bestIntent = 'appointment_reschedule';
    }
  } else if (scenario === 'otp_security') {
    if (bestIntent === 'affirmative') {
      bestIntent = 'otp_repeat';
    }
  } else if (scenario === 'call_screener') {
    if (bestIntent === 'affirmative') {
      bestIntent = 'call_screening_message';
    }
  }

  const confidence = maxScore > 0 ? Math.min(1, maxScore / 10) : 0;
  return { intent: bestIntent, confidence };
}

/**
 * Deterministic Malayalam-first offline response generator.
 */
export class DeterministicCallerEngine implements IResponseGenerator {
  readonly id = 'deterministic-offline-v1';
  readonly name = 'Malayalam Offline Rule Engine';

  async generateResponse(input: DialogueEngineInput): Promise<DialogueEngineOutput> {
    const { userUtterance, scenario } = input;
    const normalized = normalizeUtterance(userUtterance);
    const { intent, confidence } = detectIntent(normalized, scenario);

    const scenarioConfig = CALLER_SCENARIOS[scenario] ?? CALLER_SCENARIOS.general_assistant;

    switch (intent) {
      case 'greeting':
        return {
          replyText: 'നമസ്കാരം! ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?',
          intent,
          confidence,
        };

      case 'repeat_request':
        return {
          replyText: `തീർച്ചയായും, ഒരിക്കൽക്കൂടി പറയാം. ${scenarioConfig.initialGreeting}`,
          intent,
          confidence,
        };

      case 'appointment_confirm':
        return {
          replyText:
            'വളരെ സന്തോഷം. നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് ഉറപ്പിച്ചിട്ടുണ്ട്. കൃത്യസമയത്ത് എത്തുമല്ലോ. നന്ദി!',
          intent,
          confidence,
          shouldEndCall: true,
        };

      case 'appointment_reschedule':
        return {
          replyText:
            'ശരി, അപ്പോയിന്റ്മെന്റ് തീയതി മാറ്റിവെക്കാം. ഞങ്ങളുടെ ക്ലിനിക് എക്സിക്യൂട്ടീവ് ഉടൻ തന്നെ തിരികെ വിളിക്കുന്നതാണ്.',
          intent,
          confidence,
          shouldEndCall: true,
        };

      case 'call_screening_message':
        return {
          replyText:
            'തീർച്ചയായും, നിങ്ങളുടെ സന്ദേശം അദ്ദേഹത്തിന് കൈമാറാം. ഉടൻ തിരികെ വിളിക്കാൻ അറിയിക്കാം. നന്ദി!',
          intent,
          confidence,
          shouldEndCall: true,
        };

      case 'call_screening_busy':
        return {
          replyText:
            'ശരി, മീറ്റിംഗ് കഴിഞ്ഞ ശേഷം അദ്ദേഹം നിങ്ങളെ ബന്ധപ്പെടുന്നതാണ്. വിളിച്ചതിന് നന്ദി!',
          intent,
          confidence,
          shouldEndCall: true,
        };

      case 'otp_repeat':
        return {
          replyText:
            'നിങ്ങളുടെ സ്ഥിരീകരണ കോഡ് ഏഴ്, രണ്ട്, പൂജ്യം, അഞ്ച് ആണ്. ഇത് ആരുമായും പങ്കിടരുത്.',
          intent,
          confidence,
        };

      case 'otp_received':
        return {
          replyText:
            'സ്ഥിരീകരണ കോഡ് രേഖപ്പെടുത്തിയതിന് നന്ദി. നിങ്ങളുടെ അക്കൗണ്ട് പരിശോധന പൂർത്തിയായി.',
          intent,
          confidence,
          shouldEndCall: true,
        };

      case 'call_closing':
        return {
          replyText: 'വിളിച്ചതിന് വളരെ നന്ദി. നിങ്ങൾക്ക് നല്ലൊരു ദിവസം ആശംസിക്കുന്നു!',
          intent,
          confidence,
          shouldEndCall: true,
        };

      case 'affirmative':
        return {
          replyText: 'ശരി, കൂടുതൽ വിവരങ്ങൾക്കായി എന്തെങ്കിലും ചോദിക്കാനുണ്ടോ?',
          intent,
          confidence,
        };

      case 'negative':
        return {
          replyText: 'ശരി, ആവശ്യമെങ്കിൽ വീണ്ടും വിളിക്കാമല്ലോ. നന്ദി!',
          intent,
          confidence,
          shouldEndCall: true,
        };

      case 'unknown':
      default:
        return {
          replyText: 'ക്ഷമിക്കണം, നിങ്ങൾ പറഞ്ഞത് വ്യക്തമായില്ല. ഒന്നുകൂടി വ്യക്തമായി പറയാമോ?',
          intent: 'clarification',
          confidence: 0,
        };
    }
  }
}

export const defaultDialogueEngine = new DeterministicCallerEngine();
