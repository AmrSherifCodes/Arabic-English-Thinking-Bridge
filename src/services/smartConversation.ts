import type { UserProfile } from '../types';
import type { ConversationHistoryItem } from './geminiLexicon';
import { lookupPedagogicalWordBridge, searchOfflineDictionary } from '../utils/dictionarySearch';

interface DialogueTopic {
  keywords: string[];
  responses: string[];
  followUps: string[];
}

const TOPICS: DialogueTopic[] = [
  {
    keywords: ['hi', 'hello', 'hey', 'morning', 'evening', 'peace', 'salam', 'ازيك', 'مرحبا', 'اهلا', 'أهلاً', 'صباح', 'سلام'],
    responses: [
      "Hello there! I'm Amr, so glad to chat with you today.",
      "Hey! Ready to level up your English thinking today?",
      "Welcome back! It's always great practicing together."
    ],
    followUps: [
      "How is your day going so far?",
      "What did you do earlier today?",
      "Tell me: what is one thing you want to talk about today?"
    ]
  },
  {
    keywords: ['how are you', 'how r u', 'how are u', 'how is it going', 'how do you do', 'عامل ايه', 'اخبارك', 'أخبارك', 'تمام'],
    responses: [
      "I'm doing fantastic, thank you for asking! Feeling fully energized.",
      "I'm feeling great and really excited to practice with you today!",
      "Doing wonderful! Watching your progress always makes my day."
    ],
    followUps: [
      "How about you? How are you feeling right now?",
      "Did you have a busy day or a relaxing one?",
      "What are you up to this afternoon?"
    ]
  },
  {
    keywords: ['who are you', 'what is your name', 'whats your name', 'what are you', 'انت مين', 'اسمك ايه', 'مين انت', 'عمرو'],
    responses: [
      "I'm Amr Sherif, your Egyptian AI English speaking tutor and thinking bridge!",
      "My name is Amr! I'm here to help you stop translating in your head and start thinking naturally in English.",
      "I'm Amr! Think of me as your personal English conversational gym partner."
    ],
    followUps: [
      "What is your main English goal right now: travel, career, or daily fluency?",
      "Have you practiced your English speaking today?",
      "What topic do you feel most comfortable talking about?"
    ]
  },
  {
    keywords: ['tired', 'exhausted', 'sleepy', 'hard day', 'busy day', 'تعبان', 'مرهق', 'مشغول', 'يوم صعب', 'طويل'],
    responses: [
      "I completely understand! A long day can really drain your energy.",
      "Take a deep breath. Even 5 minutes of practice while tired shows true dedication!",
      "Sounds like you worked hard today! Make sure you get some well-deserved rest."
    ],
    followUps: [
      "What kept you so busy today?",
      "Do you have some relaxing plans for tonight?",
      "Would you like to keep our chat light and easy?"
    ]
  },
  {
    keywords: ['chemistry', 'chem', 'catalyst', 'reaction', 'lab', 'atom', 'molecule', 'كيمياء', 'تفاعل', 'معمل', 'عنصر'],
    responses: [
      "Chemistry is fascinating! In English, thinking about grammar is just like balancing a chemical equation.",
      "Just like an enzyme or catalyst speeds up a reaction, practicing aloud speeds up your fluency!",
      "I love science! Precision in English scientific vocabulary gives your thoughts immense clarity."
    ],
    followUps: [
      "What kind of chemical reaction or experiment interests you most?",
      "Are you currently studying or working in a lab or research field?",
      "How would you describe your favorite scientific concept in simple English?"
    ]
  },
  {
    keywords: ['travel', 'airport', 'hotel', 'flight', 'ticket', 'vacation', 'trip', 'سفر', 'مطار', 'فندق', 'رحلة', 'حجز'],
    responses: [
      "Traveling is one of the best adventures in life!",
      "Speaking English when you travel gives you instant confidence in any country.",
      "Great topic! Let's practice some essential travel phrases."
    ],
    followUps: [
      "If you could fly anywhere in the world tomorrow, where would you go?",
      "Do you prefer a relaxing beach trip or exploring historic cities?",
      "Imagine you're checking into a hotel right now: how would you greet the receptionist?"
    ]
  },
  {
    keywords: ['job', 'interview', 'work', 'boss', 'colleague', 'meeting', 'career', 'office', 'شغل', 'عمل', 'وظيفة', 'مقابلة', 'انترفيو'],
    responses: [
      "Professional English is all about sounding polite, clear, and confident.",
      "Workplace conversations get much easier once you master simple sentence structures.",
      "Great focus! Clear English opens up amazing global career opportunities."
    ],
    followUps: [
      "What do you do for work or what career are you preparing for?",
      "How often do you need to write or speak English in your job?",
      "Imagine an interviewer asks: 'Tell me about yourself' — how would you start?"
    ]
  },
  {
    keywords: ['hobby', 'free time', 'football', 'soccer', 'music', 'game', 'reading', 'movie', 'هواية', 'كورة', 'موسيقى', 'قراءة', 'فيلم'],
    responses: [
      "Hobbies are the absolute best way to practice speaking naturally!",
      "Talking about things you love makes vocabulary stick ten times faster.",
      "That's wonderful! Having personal passions makes conversations exciting."
    ],
    followUps: [
      "What is your absolute favorite hobby when you have free time?",
      "Do you prefer watching sports, playing games, or watching movies?",
      "Have you watched any good movies or TV shows in English recently?"
    ]
  },
  {
    keywords: ['food', 'eat', 'dinner', 'lunch', 'breakfast', 'restaurant', 'coffee', 'tea', 'اكل', 'مطعم', 'قهوة', 'شاي', 'غدا', 'عشا'],
    responses: [
      "Food is universal! And talking about delicious meals is always fun.",
      "Egyptian and international food are both amazing topics to discuss in English.",
      "Yum! Food vocabulary is essential for daily conversation."
    ],
    followUps: [
      "What did you have to eat or drink recently?",
      "Do you prefer traditional Egyptian food like Koshary, or fast food?",
      "How do you like to take your coffee or tea in the morning?"
    ]
  }
];

/**
 * Checks for common L1 Arabic transfer mistakes and provides immediate pedagogical feedback.
 */
export function detectAndCorrectTransferErrors(input: string): string | null {
  const norm = input.trim();
  const lower = norm.toLowerCase();

  // 1. "I am agree"
  if (lower.includes('i am agree') || lower.includes("i'm agree")) {
    return "I completely agree with you! 💡 Quick tip: in English, 'agree' is already a full verb, so we say **'I agree'** instead of 'I am agree' (أنا أوافق). Tell me more about your thoughts!";
  }

  // 2. "married from"
  if (lower.includes('married from')) {
    return "Nice! 💡 Collocation tip: in English we say **'married to'** rather than 'married from' (متزوج من).";
  }

  // 3. "afraid from" / "scared from"
  if (lower.includes('afraid from') || lower.includes('scared from')) {
    return "I hear you! 💡 In English, we say **'afraid of'** or **'scared of'** rather than 'from' (خائف من). What else makes you feel that way?";
  }

  // 4. "angry from"
  if (lower.includes('angry from')) {
    return "💡 English preposition bridge: we say **'angry with'** or **'angry at'** someone, not 'angry from' (غضبان من).";
  }

  // 5. "listen music"
  if (/\blisten\s+(music|radio|podcast|me|teacher)\b/i.test(norm)) {
    const m = norm.match(/\blisten\s+(music|radio|podcast|me|teacher)\b/i);
    return `💡 Remember: 'listen' always needs the preposition 'to' before the object: **'listen to ${m ? m[1] : 'music'}'** (استمع إلى).`;
  }

  // 6. "look to" instead of "look at"
  if (/\blook\s+to\s+(the\s+)?(screen|picture|photo|board|me|sky)\b/i.test(norm)) {
    return "💡 Preposition tip: we say **'look at'** when directing our eyes toward something, rather than 'look to' (انظر إلى).";
  }

  // 7. "do a mistake"
  if (lower.includes('do a mistake') || lower.includes('did a mistake') || lower.includes('make mistake')) {
    return "💡 Natural collocation: in English we **'make a mistake'**, not 'do a mistake' (يخطئ). Don't worry at all, making mistakes is how we learn!";
  }

  // 8. "take a photo" vs "make a photo"
  if (lower.includes('make a photo') || lower.includes('do a photo')) {
    return "💡 Collocation bridge: we say **'take a photo'** (التقط صورة), not 'make a photo'.";
  }

  // 9. "open the light" / "close the light"
  if (lower.includes('open the light') || lower.includes('close the light')) {
    return "💡 Idiomatic tip: for electrical appliances and lights, we say **'turn on the light'** (شغّل النور) and **'turn off the light'** (اطفئ النور) instead of open/close.";
  }

  // 10. "explain me"
  if (lower.includes('explain me')) {
    return "💡 Grammar bridge: in English, 'explain' requires 'to' before the person: **'explain to me'** (اشرح لي).";
  }

  // 11. Copula omission ("I student", "He doctor", "She teacher", "I ready")
  const copulaMatch = norm.match(/\b(i|he|she|they|we)\s+([a-zA-Z]+)\b/i);
  if (copulaMatch) {
    const subj = copulaMatch[1].toLowerCase();
    const nextWord = copulaMatch[2].toLowerCase();
    const commonNouns = ['student', 'teacher', 'doctor', 'engineer', 'tired', 'happy', 'ready', 'egyptian', 'arab', 'hungry'];
    if (commonNouns.includes(nextWord)) {
      const beForm = subj === 'i' ? 'am' : subj === 'he' || subj === 'she' ? 'is' : 'are';
      const article = ['tired', 'happy', 'ready', 'egyptian', 'arab', 'hungry'].includes(nextWord) ? '' : ' a';
      return `Great thought! 💡 Notice that in English, every nominal sentence requires a linking verb: **'${subj} ${beForm}${article} ${nextWord}'** (أنا/هو يكون...). What made you say that?`;
    }
  }

  // 12. "I have car" (missing indefinite article)
  if (/\b(i|he|she|we)\s+have\s+([a-z]+)\b/i.test(norm)) {
    const m = norm.match(/\b(i|he|she|we)\s+have\s+([a-z]+)\b/i);
    if (m && ['car', 'book', 'problem', 'question', 'job', 'dog', 'cat', 'pen', 'phone', 'computer'].includes(m[2].toLowerCase())) {
      return `Got it! 💡 Just remember that singular countable nouns in English require 'a' or 'an': **'I have a ${m[2]}'**. Can you tell me a little more about it?`;
    }
  }

  return null;
}

/**
 * Handles Egyptian colloquial learning questions and dictionary inquiries.
 */
function handleEgyptianQuestions(cleanPrompt: string): string | null {
  const norm = cleanPrompt.trim();

  // 1. "ازاي اقول [x]" / "كيف اقول [x]"
  const sayMatch = norm.match(/(?:ازاي|ازّاي|كيف|عايز)\s+اقول\s+(.+)/i);
  if (sayMatch) {
    const targetWord = sayMatch[1].replace(/[؟?!.]/g, '').trim();
    const hit = searchOfflineDictionary(targetWord, 'ar');
    if (hit) {
      return `عشان تقول **"${targetWord}"** بالإنجليزي، بنقول:\n\n🎯 **"${hit}"**\n\n💡 جرب تنطقها معايا دلوقتي بصوت عالي!`;
    }
    const bridge = lookupPedagogicalWordBridge(targetWord);
    if (bridge) {
      return `عشان تقول **"${targetWord}"** بالإنجليزي، بنقول:\n\n🎯 **"${bridge.en}"**\n${bridge.exampleEn ? `💡 مثال: "${bridge.exampleEn}"\n` : ''}ممتاز، جرب تستخدمها في جملة كاملة!`;
    }
  }

  // 2. "يعني ايه [x]" / "معنى [x]"
  const meanMatch = norm.match(/(?:يعني\s+ايه|معنى|معنى\s+كلمة)\s+([a-zA-Z\u0600-\u06FF\s]+)/i);
  if (meanMatch) {
    const term = meanMatch[1].replace(/[؟?!.]/g, '').trim();
    const isTermAr = /[\u0600-\u06FF]/.test(term);
    const hit = searchOfflineDictionary(term, isTermAr ? 'ar' : 'en');
    if (hit) {
      return `كلمة **"${term}"** معناها: **"${hit}"**.\n\n💡 حاول متترجمش حرفياً في دماغك، اربط الكلمة بالصورة أو الفكرة مباشرة!`;
    }
    const bridge = lookupPedagogicalWordBridge(term);
    if (bridge) {
      return `كلمة **"${bridge.ar}"** بالإنجليزي هي: **"${bridge.en}"**.\n${bridge.exampleEn ? `🎯 مثال عليها: "${bridge.exampleEn}"\n` : ''}${bridge.note ? `📌 ملحوظة: ${bridge.note}\n` : ''}`;
    }
  }

  // 3. "ليه بنقول [am/is/are]"
  if (/ليه\s+(?:بنقول|بنحط|لازم)\s+(?:am|is|are|الكينونة)/i.test(norm)) {
    return "سؤال عبقري! 🧠\nفي العربي بنقول: «أنا طالب» بدون أي فعل، وده اسمه جملة اسمية.\nلكن في الإنجليزي: **مفيش أي جملة بتعيش بدون فعل!** عشان كده لازم نضيف فعل الكينونة:\n👉 **I am a student** (أنا أكون طالب).\n👉 **He is ready** (هو يكون جاهز).\nده أول جسر بنبنيه عشان نبطل نترجم حرفي!";
  }

  // 4. "ليه مش بنقول I am agree"
  if (/ليه\s+(?:مش\s+بنقول|غلط)\s+i\s+am\s+agree/i.test(norm)) {
    return "ممتاز إنك سألت عن دي! 👏\nكلمة **agree** في الإنجليزي هي أصلاً **فعل** معناه «أوافق»، مش صفة!\nيعني لما تقول:\n✅ **I agree with you** = أنا أوافقك.\nلو حطيت 'am'، هتبقى كأنك بتقول «أنا أكون أوافق» وده تكرار غلط.\nعشان كده بنقول دايماً: **I agree** فقط!";
  }

  return null;
}

/**
 * Generates an intelligent, context-aware, bilingual English conversational response.
 * Handles domain hints (chemistry, travel, business), user goals, and maintains natural dialogue flow.
 */
export function generateSmartConversationReply(
  prompt: string,
  history: ConversationHistoryItem[] = [],
  profile?: UserProfile
): string {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    return "I'm listening! Feel free to say anything in English or Arabic, even just a simple sentence.";
  }

  const lowerPrompt = cleanPrompt.toLowerCase();
  const isArabicInput = /[\u0600-\u06FF]/.test(cleanPrompt);

  // 1. Check for specific grammatical / L1 transfer corrections first
  const correction = detectAndCorrectTransferErrors(cleanPrompt);
  if (correction) {
    return correction;
  }

  // 2. Check for colloquial Egyptian questions (ازاي اقول، يعني ايه، ليه)
  const egyptianReply = handleEgyptianQuestions(cleanPrompt);
  if (egyptianReply) {
    return egyptianReply;
  }

  // 3. Handle pure Arabic input with bilingual bridge
  if (isArabicInput) {
    if (lowerPrompt.includes('ازيك') || lowerPrompt.includes('عامل ايه') || lowerPrompt.includes('اخبارك')) {
      return "الحمد لله تمام جداً يا بطل! In English, you can ask me: **'How are you doing today?'** How has your day been so far?";
    }
    if (lowerPrompt.includes('اسمك ايه') || lowerPrompt.includes('انت مين')) {
      return "أنا عمرو شريف، شريكك لتدريب المحادثة بالإنجليزي! In English, say: **'What is your name?'** Ready to practice speaking together?";
    }
    if (lowerPrompt.includes('مش عارف') || lowerPrompt.includes('صعب') || lowerPrompt.includes('مش قادر')) {
      return "ولا يهمك خالص، الموضوع محتاج ممارسة وتكرار بس! You can say: **'I am doing my best!'** What is one simple word you want to practice right now?";
    }

    // Try finding direct dictionary match for whatever Arabic thought the user typed
    const dictHit = searchOfflineDictionary(cleanPrompt, 'ar');
    if (dictHit) {
      return `فهمتك تمام! عشا تعبر عن الفكرة دي بالإنجليزي:\n🎯 **"${dictHit}"**\nجرب تقولها معايا بالإنجليزي، واغلط براحتك إحنا بنتعلم!`;
    }

    return "فهمتك تمام! Let's say that thought in natural English. Try speaking a short sentence in English, and don't worry at all about mistakes—I'm here to support you!";
  }

  // 4. Match predefined conversational topics
  for (const topic of TOPICS) {
    if (topic.keywords.some((kw) => lowerPrompt.includes(kw))) {
      const seedIdx = (history.length + cleanPrompt.length) % topic.responses.length;
      const followUpIdx = (history.length + 1) % topic.followUps.length;
      return `${topic.responses[seedIdx]} ${topic.followUps[followUpIdx]}`;
    }
  }

  // 5. Adapt to user profile focus / goal
  const focus = String(profile?.focusArea || '').toLowerCase();
  const goal = String(profile?.goal || '').toLowerCase();

  if (focus.includes('chem') || focus.includes('science')) {
    return `That's an interesting point! In science and chemistry, describing observations clearly in English is a superpower. How would you explain that in one simple English sentence?`;
  }

  if (goal === 'travel') {
    return `I love that! When traveling abroad, speaking smoothly and politely makes every trip ten times more fun. Where are you planning to travel next?`;
  }

  if (goal === 'work' || goal === 'business') {
    return `Well said! In a professional workplace or meeting, expressing your ideas clearly builds immediate trust. What is your favorite part about your work?`;
  }

  // 6. General intelligent conversational replies
  const defaultResponses = [
    "That makes total sense! I really like how you expressed that.",
    "Interesting! You're speaking with great confidence today.",
    "I hear you! That's a great thought to explore in English.",
    "Very well said! Your sentence structure is getting smoother every day."
  ];

  const defaultFollowUps = [
    "Can you tell me a little more about that?",
    "What do you think is the most important part of that?",
    "How does that usually work in your daily routine?",
    "What's the next step you want to take with that?"
  ];

  const rIdx = (history.length + cleanPrompt.length) % defaultResponses.length;
  const fIdx = (history.length + 2) % defaultFollowUps.length;

  return `${defaultResponses[rIdx]} ${defaultFollowUps[fIdx]}`;
}
