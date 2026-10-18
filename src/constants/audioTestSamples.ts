export interface AudioTestSample {
  id: string;
  title: string;
  language: string;
  languageCode: 'ml' | 'hi' | 'ta' | 'manglish' | 'en';
  speakerGender: 'male' | 'female';
  speakerLabel: string;
  durationLabel: string;
  description: string;
  asset: number;
}

export const AUDIO_TEST_SAMPLES: AudioTestSample[] = [
  {
    id: 'ml_conversational',
    title: 'Spoken Dialogue',
    language: 'Malayalam (മലയാളം)',
    languageCode: 'ml',
    speakerGender: 'female',
    speakerLabel: 'Native Malayalam Speakers',
    durationLabel: '6.6s',
    description:
      'Continuous 6.6s multi-clause Malayalam conversation ("നമസ്കാരം... 2001-ലെ ഇന്ത്യൻ...").',
    asset: require('../../assets/audio/samples/ml_conversational.wav'),
  },
  {
    id: 'ml_female_manglish',
    title: 'Historical Cinema',
    language: 'Manglish (മലയാളം + English)',
    languageCode: 'manglish',
    speakerGender: 'female',
    speakerLabel: 'Bhagya Mohan (Native Speaker)',
    durationLabel: '5.3s',
    description: 'Authentic 5.3s human voice recording with years and compound consonants.',
    asset: require('../../assets/audio/samples/ml_female_manglish.wav'),
  },
  {
    id: 'ml_male_manglish',
    title: 'IndicConformer Benchmark',
    language: 'Manglish (മലയാളം + Benchmark)',
    languageCode: 'manglish',
    speakerGender: 'male',
    speakerLabel: 'Native Malayalam Speaker',
    durationLabel: '5.0s',
    description:
      'Official 5.0s reference speech sample bundled with the IndicConformer model distribution.',
    asset: require('../../assets/audio/samples/ml_male_manglish.wav'),
  },
  {
    id: 'hi_female_article',
    title: 'Spoken Hindi Article',
    language: 'Hindi (हिन्दी)',
    languageCode: 'hi',
    speakerGender: 'female',
    speakerLabel: 'Native Hindi Speaker',
    durationLabel: '6.5s',
    description: 'Authentic 6.5s spoken Hindi Wikipedia article excerpt.',
    asset: require('../../assets/audio/samples/hi_female_article.wav'),
  },
  {
    id: 'hi_male_article',
    title: 'Spoken Hindi Narrative',
    language: 'Hindi (हिन्दी)',
    languageCode: 'hi',
    speakerGender: 'female',
    speakerLabel: 'Native Hindi Speaker',
    durationLabel: '6.0s',
    description: 'Authentic 6.0s continuous Hindi spoken narrative phrase.',
    asset: require('../../assets/audio/samples/hi_male_article.wav'),
  },
  {
    id: 'ta_male_article',
    title: 'Spoken Tamil Article',
    language: 'Tamil (தமிழ்)',
    languageCode: 'ta',
    speakerGender: 'male',
    speakerLabel: 'User:Sriveenkat (Native Speaker)',
    durationLabel: '6.8s',
    description: 'Authentic 6.8s spoken Tamil Wikipedia encyclopedia article.',
    asset: require('../../assets/audio/samples/ta_male_article.wav'),
  },
  {
    id: 'ta_spoken_clause',
    title: 'Spoken Tamil Narrative',
    language: 'Tamil (தமிழ்)',
    languageCode: 'ta',
    speakerGender: 'male',
    speakerLabel: 'User:Sriveenkat (Native Speaker)',
    durationLabel: '6.5s',
    description: 'Authentic 6.5s Tamil continuous narrative excerpt.',
    asset: require('../../assets/audio/samples/ta_spoken_clause.wav'),
  },
  {
    id: 'en_in_male_narrative',
    title: 'Indian English Narrative',
    language: 'English (Indian Accent)',
    languageCode: 'en',
    speakerGender: 'male',
    speakerLabel: 'Native Indian English Speaker',
    durationLabel: '5.9s',
    description:
      'Authentic 5.9s Indian English speech ("There was once a merchant who employed many carpenters and masons...").',
    asset: require('../../assets/audio/samples/en_in_male_narrative.wav'),
  },
  {
    id: 'en_in_male_conversational',
    title: 'Indian English Dialogue',
    language: 'English (Indian Accent)',
    languageCode: 'en',
    speakerGender: 'male',
    speakerLabel: 'Native Indian English Speaker',
    durationLabel: '7.2s',
    description:
      'Authentic 7.2s Indian English conversational speech ("Regularly, they would start work in the morning, and take a break for the mid-day meals...").',
    asset: require('../../assets/audio/samples/en_in_male_conversational.wav'),
  },
  {
    id: 'en_in_male_story',
    title: 'Indian English Story',
    language: 'English (Indian Accent)',
    languageCode: 'en',
    speakerGender: 'male',
    speakerLabel: 'Native Indian English Speaker',
    durationLabel: '7.1s',
    description:
      'Authentic 7.1s Indian English narrative ("One day, a group of monkeys arrived at the site of the building...").',
    asset: require('../../assets/audio/samples/en_in_male_story.wav'),
  },
  {
    id: 'en_female_formal',
    title: 'Global Benchmark Reference',
    language: 'English (Benchmark)',
    languageCode: 'en',
    speakerGender: 'female',
    speakerLabel: 'LibriSpeech Reader 1221',
    durationLabel: '6.1s',
    description:
      'Official 6.1s reference benchmark sample ("God as a direct consequence of the sin which man thus punished...").',
    asset: require('../../assets/audio/samples/en_female_formal.wav'),
  },
];
