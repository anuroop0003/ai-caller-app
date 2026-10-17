export interface AudioTestSample {
  id: string;
  title: string;
  language: string;
  languageCode: 'ml' | 'hi' | 'ta' | 'manglish';
  speakerGender: 'male' | 'female';
  speakerLabel: string;
  durationLabel: string;
  description: string;
  asset: number;
}

export const AUDIO_TEST_SAMPLES: AudioTestSample[] = [
  {
    id: 'ml_female_greeting',
    title: 'Greeting',
    language: 'Malayalam (മലയാളം)',
    languageCode: 'ml',
    speakerGender: 'female',
    speakerLabel: 'Bhagya Mohan (Native Speaker)',
    durationLabel: '1.1s',
    description: 'Authentic human voice recording of standard Malayalam greeting.',
    asset: require('../../assets/audio/samples/ml_female_greeting.wav'),
  },
  {
    id: 'ml_male_formal',
    title: 'Spoken Phrase',
    language: 'Malayalam (മലയാളം)',
    languageCode: 'ml',
    speakerGender: 'male',
    speakerLabel: 'Akhilan (Native Speaker)',
    durationLabel: '2.2s',
    description: 'Authentic 2.2s speech snippet ("2001-ലെ ഇന്ത്യൻ..."). Note: Pure ASR outputs spoken words rather than numeric digits.',
    asset: require('../../assets/audio/samples/ml_male_formal.wav'),
  },
  {
    id: 'ml_female_manglish',
    title: 'Historical Cinema',
    language: 'Manglish (മലയാളം + English)',
    languageCode: 'manglish',
    speakerGender: 'female',
    speakerLabel: 'Bhagya Mohan (Native Speaker)',
    durationLabel: '5.3s',
    description: 'Authentic human voice recording with years and compound consonants.',
    asset: require('../../assets/audio/samples/ml_female_manglish.wav'),
  },
  {
    id: 'ml_male_manglish',
    title: 'IndicConformer Benchmark Speech',
    language: 'Manglish (മലയാളം + Benchmark)',
    languageCode: 'manglish',
    speakerGender: 'male',
    speakerLabel: 'Native Malayalam Speaker',
    durationLabel: '5.0s',
    description: 'Official reference speech sample bundled with the IndicConformer model distribution.',
    asset: require('../../assets/audio/samples/ml_male_manglish.wav'),
  },
  {
    id: 'hi_female_greeting',
    title: 'Welcome Greeting',
    language: 'Hindi (हिन्दी)',
    languageCode: 'hi',
    speakerGender: 'female',
    speakerLabel: 'QueerEcofeminist (Native Speaker)',
    durationLabel: '1.3s',
    description: 'Authentic human voice recording of classic Hindi greeting.',
    asset: require('../../assets/audio/samples/hi_female_greeting.wav'),
  },
  {
    id: 'hi_male_formal',
    title: 'Academic Vocabulary',
    language: 'Hindi (हिन्दी)',
    languageCode: 'hi',
    speakerGender: 'male',
    speakerLabel: 'Aryaman (Native Speaker)',
    durationLabel: '1.4s',
    description: 'Authentic human voice recording of formal Hindi vocabulary.',
    asset: require('../../assets/audio/samples/hi_male_formal.wav'),
  },
  {
    id: 'ta_female_greeting',
    title: 'Pronunciation',
    language: 'Tamil (தமிழ்)',
    languageCode: 'ta',
    speakerGender: 'female',
    speakerLabel: 'Tamil Native Speaker',
    durationLabel: '1.5s',
    description: 'Authentic human voice recording of standard Tamil phonetics/pronunciation.',
    asset: require('../../assets/audio/samples/ta_female_greeting.wav'),
  },
  {
    id: 'ta_male_formal',
    title: 'Formal Vocabulary',
    language: 'Tamil (தமிழ்)',
    languageCode: 'ta',
    speakerGender: 'male',
    speakerLabel: 'Felixyog (Native Speaker)',
    durationLabel: '1.1s',
    description: 'Authentic human voice recording of standard Tamil formal vocabulary.',
    asset: require('../../assets/audio/samples/ta_male_formal.wav'),
  },
];
