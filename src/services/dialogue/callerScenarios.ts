import type { CallerScenario, CallerScenarioConfig } from '@/types/conversation';

export const CALLER_SCENARIOS: Record<CallerScenario, CallerScenarioConfig> = {
  general_assistant: {
    id: 'general_assistant',
    title: 'AI Voice Assistant',
    subtitle: 'General Inquiry & Assistance',
    description:
      'Answering questions, offering guidance, and basic conversational banter in Malayalam.',
    initialGreeting:
      'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI അസിസ്റ്റന്റാണ്. എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?',
    supportedIntents: [
      'greeting',
      'repeat_request',
      'affirmative',
      'negative',
      'call_closing',
      'clarification',
    ],
  },
  appointment_scheduler: {
    id: 'appointment_scheduler',
    title: 'Clinic Appointment',
    subtitle: 'Appointment Booking & Confirmations',
    description: 'Doctor appointment reminder, confirmation, time rescheduling, and clinic info.',
    initialGreeting:
      'നമസ്കാരം! നാളെ രാവിലെ പത്ത് മണിക്ക് നിങ്ങളുടെ ഡോക്ടറുടെ അപ്പോയിന്റ്മെന്റ് നിശ്ചയിച്ചിട്ടുണ്ട്. നിങ്ങൾ എത്തുമോ?',
    supportedIntents: [
      'greeting',
      'appointment_confirm',
      'appointment_reschedule',
      'repeat_request',
      'affirmative',
      'negative',
      'call_closing',
    ],
  },
  call_screener: {
    id: 'call_screener',
    title: 'Call Screener',
    subtitle: 'Executive In-Meeting Screening',
    description: 'Screening incoming callers when the user is in an important meeting or busy.',
    initialGreeting:
      'ക്ഷമിക്കണം, അദ്ദേഹം ഇപ്പോൾ ഒരു പ്രധാന മീറ്റിംഗിലാണ്. എന്തെങ്കിലും അത്യാവശ്യ സന്ദേശം അറിയിക്കാനുണ്ടോ?',
    supportedIntents: [
      'greeting',
      'call_screening_busy',
      'call_screening_message',
      'repeat_request',
      'affirmative',
      'negative',
      'call_closing',
    ],
  },
  otp_security: {
    id: 'otp_security',
    title: 'Verification Hotline',
    subtitle: 'Security OTP Alert',
    description: 'Delivering and confirming one-time passwords for account logins or verification.',
    initialGreeting: 'സുരക്ഷാ പരിശോധനയ്ക്കുള്ള കോൾ. നിങ്ങളുടെ സ്ഥിരീകരണ കോഡ് കേൾക്കാൻ തയ്യാറാണോ?',
    supportedIntents: [
      'greeting',
      'otp_received',
      'otp_repeat',
      'repeat_request',
      'affirmative',
      'negative',
      'call_closing',
    ],
  },
} as const;

export const DEFAULT_CALLER_SCENARIO: CallerScenario = 'appointment_scheduler';
