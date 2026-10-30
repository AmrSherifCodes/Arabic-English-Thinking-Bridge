import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(ROOT_DIR, 'public', 'dictionary.json');
const API_KEY = process.env.GEMINI_API_KEY;
const TARGET_WORDS = 8000;
const BATCH_SIZE = 25;
const CONCURRENCY = 1;
const MAX_RATE_LIMIT_RETRIES = 5;
const RATE_LIMIT_RETRY_BASE_MS = 2000;
const DELAY_MS = 2000;
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const SITUATIONS = ['student', 'call-center', 'public-matter'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const DIALECTS = ['egyptian', 'msa'];
const PARTS_OF_SPEECH = [
  'noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction',
  'pronoun', 'interjection', 'phrase',
];

const TOPICS = [
  'Greetings & Introductions', 'Numbers & Counting', 'Days, Months & Seasons', 'Colors & Shapes', 'Family & Relationships',
  'Human Body & Anatomy', 'Clothing & Accessories', 'Home & Rooms', 'Furniture & Appliances', 'Kitchen & Cookware',
  'Fruits & Vegetables', 'Meats, Poultry & Seafood', 'Dairy, Grains & Baking', 'Beverages & Dining Out', 'Spices, Herbs & Condiments',
  'Daily Routines & Chores', 'Personal Hygiene & Grooming', 'Emotions & Feelings', 'Personality Traits', 'Mind, Thought & Belief',
  'City & Urban Infrastructure', 'Transportation & Vehicles', 'Directions & Navigation', 'Travel, Tourism & Hotels', 'Airport & Aviation',
  'Weather & Climate', 'Nature & Landscapes', 'Plants, Trees & Gardening', 'Mammals & Wildlife', 'Birds, Insects & Marine Life',
  'School & Classroom', 'University & Academic Subjects', 'Mathematics & Geometry', 'Physics & Chemistry', 'Biology & Genetics',
  'Astronomy & Space', 'Geography & Earth Sciences', 'History & Archaeology', 'Literature & Writing', 'Languages & Linguistics',
  'Jobs & Professions', 'Office & Business Operations', 'Finance, Banking & Investing', 'Economy, Trade & Commerce', 'Marketing & Advertising',
  'Law, Courts & Crime', 'Politics, Government & Elections', 'Diplomacy & International Relations', 'Military, War & Peace', 'Social Issues & Human Rights',
  'Health, Illness & Symptoms', 'Medicine, Doctors & Hospitals', 'Pharmacy, Drugs & Treatments', 'Fitness, Exercise & Gym', 'Mental Health & Psychology',
  'Sports & Athletics', 'Team Sports (Soccer, Basketball)', 'Outdoor Recreation & Camping', 'Hobbies, Crafts & Games', 'Photography & Visual Arts',
  'Music & Musical Instruments', 'Cinema, Theater & Acting', 'Television, Radio & Media', 'Journalism & Publishing', 'Festivals, Celebrations & Holidays',
  'Religion, Faith & Spirituality', 'Philosophy & Ethics', 'Culture, Traditions & Customs', 'Architecture & Construction', 'Tools, Hardware & DIY',
  'Computers & Hardware', 'Software, Programming & Data', 'Internet, Social Media & Web', 'Telecommunications & Mobile', 'Artificial Intelligence & Robotics',
  'Energy, Electricity & Power', 'Environment, Ecology & Pollution', 'Agriculture, Farming & Livestock', 'Manufacturing, Factories & Industry', 'Mining, Metals & Materials',
  'Time, Frequency & Duration', 'Measurements, Weights & Volumes', 'Sizes, Dimensions & Quantities', 'Speed, Motion & Direction', 'Light, Sound & Acoustics',
  'Textures, Surfaces & Conditions', 'Taste, Smell & Senses', 'Success, Failure & Achievement', 'Effort, Work & Productivity', 'Danger, Safety & Emergencies',
  'Shopping, Retail & E-Commerce', 'Fashion, Style & Textiles', 'Jewelry, Cosmetics & Luxury', 'Real Estate, Renting & Property', 'Postal Service, Shipping & Logistics',
  'Maritime, Ships & Navigation', 'Railways, Trains & Subways', 'Automotive Parts & Driving', 'Police, Fire & Rescue Services', 'Welfare, Charity & Volunteering',
  'Childhood, Parenting & Childcare', 'Aging, Youth & Life Stages', 'Marriage, Weddings & Family Events', 'Friendship, Socializing & Etiquette', 'Conflict, Arguments & Resolution',
  'Agreement, Cooperation & Support', 'Communication, Speech & Debate', 'Gestures, Body Language & Expressions', 'Memory, Learning & Intelligence', 'Doubt, Certainty & Decisions',
  'Plans, Goals & Ambitions', 'Habits, Customs & Behavior', 'Rules, Regulations & Compliance', 'Freedom, Rights & Responsibilities', 'Wealth, Poverty & Social Class',
  'Taxes, Accounting & Auditing', 'Insurance, Risk & Liability', 'Contracts, Negotiations & Deals', 'Management, Leadership & HR', 'Entrepreneurship & Startups',
  'Customer Service & Hospitality', 'Culinary Arts & Food Preparation', 'Housekeeping, Cleaning & Laundry', 'Plumbing, Heating & Ventilation', 'Electrical Systems & Electronics',
  'Carpentry, Woodworking & Masonry', 'Textiles, Sewing & Knitting', 'Optics, Glass & Ceramics', 'Plastics, Rubber & Chemicals', 'Forestry, Timber & Paper',
  'Fishing, Aquaculture & Marine', 'Aviation, Aerospace & Satellites', 'Meteorology & Natural Disasters', 'Geology, Minerals & Gems', 'Oceanography & Water Bodies',
  'Botany, Flowers & Crops', 'Zoology & Animal Behavior', 'Veterinary Medicine & Pets', 'Dentistry & Oral Health', 'Optometry, Vision & Hearing',
  'Surgery, Emergency & ICU', 'Nutrition, Diets & Vitamins', 'Addiction, Recovery & Therapy', 'Mythology, Folklore & Legends', 'Monarchy, Nobility & Empires',
  'Colonialism, Revolution & Independence', 'Constitution, Parliament & Legislation', 'Civil Law, Contracts & Torts', 'Criminal Justice, Prisons & Policing', 'Espionage, Intelligence & Security',
  'Essential Everyday Verbs (Part 1)', 'Essential Everyday Verbs (Part 2)', 'Academic & Formal Verbs', 'Business & Technical Verbs', 'Movement & Physical Action Verbs',
  'Communication & Cognitive Verbs', 'Descriptive Adjectives (Physical)', 'Descriptive Adjectives (Abstract)', 'Adverbs of Manner, Time & Place', 'Conjunctions, Prepositions & Particles',
];

const ENTRY_PROPERTIES = {
  arabicWord: { type: Type.STRING, description: 'The Arabic word with tashkeel where appropriate.' },
  englishTranslation: { type: Type.STRING, description: 'Clear, concise English translation.' },
  dialect: { type: Type.STRING, enum: DIALECTS, description: 'Arabic dialect used for the word and example.' },
  partOfSpeech: { type: Type.STRING, enum: PARTS_OF_SPEECH },
  level: { type: Type.STRING, enum: LEVELS, description: 'Difficulty level for English learners.' },
  situations: { type: Type.ARRAY, items: { type: Type.STRING, enum: SITUATIONS } },
  exampleSentenceArabic: { type: Type.STRING, description: 'A natural Arabic example sentence using the word.' },
  exampleSentenceEnglish: { type: Type.STRING, description: 'The English translation of the example sentence.' },
};
const ENTRY_KEYS = Object.keys(ENTRY_PROPERTIES);
const lexiconSchema = {
  type: Type.ARRAY,
  description: `List of ${BATCH_SIZE} Arabic-English dictionary entries.`,
  items: {
    type: Type.OBJECT,
    properties: ENTRY_PROPERTIES,
    required: ENTRY_KEYS,
    propertyOrdering: ENTRY_KEYS,
  },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeArabic(text) {
  return text.normalize('NFD')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/\u0653/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeEnglish(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getEntryKeys(entry) {
  const arabic = normalizeArabic(entry.arabicWord);
  return [
    `${arabic}|${normalizeEnglish(entry.englishTranslation)}|${entry.dialect ?? 'msa'}`,
    `${arabic}|${entry.partOfSpeech}|${entry.dialect ?? 'msa'}`,
  ];
}

function isValidEntry(entry) {
  return Boolean(
    entry &&
    typeof entry.arabicWord === 'string' && entry.arabicWord.trim() &&
    typeof entry.englishTranslation === 'string' && entry.englishTranslation.trim() &&
    (entry.dialect === undefined || DIALECTS.includes(entry.dialect)) &&
    PARTS_OF_SPEECH.includes(entry.partOfSpeech) &&
    (entry.level === undefined || LEVELS.includes(entry.level)) &&
    Array.isArray(entry.situations) &&
    entry.situations.length >= 1 && entry.situations.length <= 4 &&
    entry.situations.every((situation) => SITUATIONS.includes(situation)) &&
    typeof entry.exampleSentenceArabic === 'string' && entry.exampleSentenceArabic.trim() &&
    typeof entry.exampleSentenceEnglish === 'string' && entry.exampleSentenceEnglish.trim()
  );
}

function loadExistingDictionary() {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  if (!fs.existsSync(OUTPUT_PATH)) return [];

  const raw = fs.readFileSync(OUTPUT_PATH, 'utf8').trim();
  if (!raw) return [];

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`${OUTPUT_PATH} must contain a JSON array; refusing to overwrite it.`);
  }
  if (!parsed.every(isValidEntry)) {
    throw new Error(`${OUTPUT_PATH} contains entries that do not match the app lexicon schema; refusing to overwrite it.`);
  }
  return parsed.map((entry) => ({
    ...entry,
    dialect: entry.dialect ?? 'msa',
  }));
}

function saveDictionary(dictionary) {
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(dictionary, null, 2)}\n`, 'utf8');
}

async function generateBatch(ai, topic, recentWords, dialect) {
  const avoidList = recentWords.length
    ? `\nAvoid repeating these recently added Arabic words: ${recentWords.join(', ')}.`
    : '';
  const dialectName = dialect === 'egyptian'
    ? 'Egyptian Arabic (العامية المصرية / Masri)'
    : 'Modern Standard Arabic (الفصحى / MSA)';
  const dialectInstructions = dialect === 'egyptian'
    ? 'Prioritize authentic everyday Egyptian Arabic and natural expressions used in Egypt. For technical, academic, or formal topics, use the terms commonly used by Egyptians, including standard Arabic terms where appropriate.'
    : 'Use Modern Standard Arabic vocabulary and grammar, avoiding colloquial dialect expressions.';
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate exactly ${BATCH_SIZE} distinct, useful ${dialectName} vocabulary entries about "${topic}".
${dialectInstructions}
Write natural ${dialectName} example sentences. Use clear Arabic spelling and add diacritics only when they help disambiguate pronunciation. Set every entry's dialect field to "${dialect}".
Assign each entry a learner difficulty level: beginner, intermediate, or advanced.
Use only these partOfSpeech values: ${PARTS_OF_SPEECH.join(', ')}.
Use 1 to 4 situations selected only from: ${SITUATIONS.join(', ')}.
Do not use obscure archaic words or duplicate entries within the batch. Return only entries matching the supplied schema.${avoidList}`,
    config: {
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
      responseSchema: lexiconSchema,
      temperature: 0.6,
    },
  });

  if (!response.text) throw new Error('The model returned an empty response.');
  const parsed = JSON.parse(response.text);
  if (!Array.isArray(parsed)) throw new Error('The model response was not a JSON array.');
  return parsed.filter(isValidEntry);
}

function isRateLimitError(error) {
  const status = error?.status ?? error?.response?.status;
  return status === 429 || /\b429\b|rate.?limit|resource_exhausted/i.test(error?.message ?? '');
}

async function generateBatchWithRetry(ai, topic, recentWords, dialect) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await generateBatch(ai, topic, recentWords, dialect);
    } catch (error) {
      const isJsonSyntaxError = error instanceof SyntaxError;
      if ((!isRateLimitError(error) && !isJsonSyntaxError) || attempt >= MAX_RATE_LIMIT_RETRIES) {
        throw error;
      }

      const delay = RATE_LIMIT_RETRY_BASE_MS * 2 ** attempt;
      if (isJsonSyntaxError) {
        console.warn(
          `JSON truncation or syntax error for [${dialect} - ${topic}]; retry ${attempt + 1}/${MAX_RATE_LIMIT_RETRIES} in ${delay / 1000}s.`
        );
      } else {
        console.warn(
          `Rate limited for [${dialect} - ${topic}]; retry ${attempt + 1}/${MAX_RATE_LIMIT_RETRIES} in ${delay / 1000}s.`
        );
      }
      await sleep(delay);
    }
  }
}

async function main() {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is missing. Add it to your .env file (do not use a VITE_ prefix).');
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const dictionary = loadExistingDictionary();
  console.log(`Loaded public/dictionary.json — ${dictionary.length}/${TARGET_WORDS} words.`);

  if (dictionary.length >= TARGET_WORDS) {
    console.log(`Dictionary already has ${TARGET_WORDS}+ words. Nothing to do.`);
    return;
  }

  const seenKeys = new Set(dictionary.flatMap(getEntryKeys));
  let nextBatchIndex = Math.floor(dictionary.length / BATCH_SIZE);

  while (dictionary.length < TARGET_WORDS) {
    const tasks = Array.from({ length: CONCURRENCY }, (_, offset) => {
      const index = nextBatchIndex + offset;
      const topic = TOPICS[index % TOPICS.length];
      const dialect = DIALECTS[index % DIALECTS.length];
      const passNumber = Math.floor(index / TOPICS.length) + 1;
      return {
        index,
        topicLabel: passNumber > 1 ? `${topic} (Set ${passNumber})` : topic,
        dialect,
      };
    });
    nextBatchIndex += tasks.length;

    const recentWords = dictionary.slice(-100).map((entry) => entry.arabicWord);
    const results = await Promise.all(tasks.map(async (task) => {
      try {
        const entries = await generateBatchWithRetry(
          ai,
          task.topicLabel,
          recentWords,
          task.dialect
        );
        return { task, entries };
      } catch (error) {
        return { task, error };
      }
    }));

    let chunkAddedCount = 0;
    const failures = [];
    for (const result of results) {
      if (result.error) {
        console.error(
          `Batch ${result.task.index + 1} (${result.task.topicLabel}, ${result.task.dialect}) failed: ${result.error.message}`
        );
        failures.push(result.error);
        continue;
      }

      let addedCount = 0;
      for (const entry of result.entries) {
        if (dictionary.length >= TARGET_WORDS) break;
        const keys = getEntryKeys(entry);
        if (!keys.some((key) => seenKeys.has(key))) {
          keys.forEach((key) => seenKeys.add(key));
          dictionary.push(entry);
          addedCount++;
        }
      }
      chunkAddedCount += addedCount;
      console.log(
        `Added ${addedCount} ${result.task.dialect} words [${result.task.topicLabel}] — total: ${dictionary.length}/${TARGET_WORDS}.`
      );
    }

    saveDictionary(dictionary);
    if (failures.length > 0) {
      throw new Error(
        `${failures.length} batch request(s) failed; successful results were checkpointed and the script can be resumed.`,
        { cause: failures[0] }
      );
    }
    if (chunkAddedCount === 0 && dictionary.length < TARGET_WORDS) {
      throw new Error(
        'The completed batch chunk added no unique entries; progress is saved and generation stopped to avoid wasting API quota.'
      );
    }

    if (dictionary.length < TARGET_WORDS) await sleep(DELAY_MS);
  }

  console.log(`Completed: ${dictionary.length} words saved to public/dictionary.json.`);
}

main().catch((error) => {
  console.error(`Dictionary generation failed: ${error.message}`);
  process.exitCode = 1;
});
