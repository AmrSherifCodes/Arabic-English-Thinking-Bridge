import type { UserProfile, TargetLanguage } from '../types';
import type { ConversationHistoryItem } from './geminiLexicon';
import { lookupPedagogicalWordBridge, searchOfflineDictionary } from '../utils/dictionarySearch';

export interface FeedbackDraft {
  category: 'bug' | 'feature' | 'content' | 'general';
  title: string;
  polishedMessage: string;
  originalThought: string;
}

export type VoiceCommandIntent = 'repeat' | 'slower' | 'translate-arabic' | null;

export function recognizeVoiceCommand(input: string): VoiceCommandIntent {
  const command = input.trim().toLowerCase().replace(/[.!؟?،,]+$/g, '').trim();
  if (/^(repeat(?: that| it)?|say that again|again|قول تاني|عيدها|كرر(?:ها)?|أعدها)$/.test(command)) {
    return 'repeat';
  }
  if (/^(slower|slow down|more slowly|بالراحة|على مهلك|ببطء)$/.test(command)) {
    return 'slower';
  }
  if (/^(translate to arabic|translate that to arabic|translate it to arabic|ترجم عربي|ترجمها عربي|ترجم إلى العربية)$/.test(command)) {
    return 'translate-arabic';
  }
  return null;
}

export function extractLastSentence(text: string): string {
  const sentences = text.match(/[^.!?؟。！？]+[.!?؟。！？]?/g);
  return sentences?.map((sentence) => sentence.trim()).filter(Boolean).at(-1) || text.trim();
}

/**
 * Extracts a structured feedback draft if user prompt expresses a suggestion, feature request, or bug report.
 */
export function extractFeedbackDraft(input: string): FeedbackDraft | null {
  const norm = input.trim();
  if (!norm || norm.length < 5) return null;

  const isSuggestion =
    /(?:^|[\s،,.;?!])(اقتراح|اقترح|اقتراحي|ياريت|يا\s*ريت|نفسي\s*يكون|عايزكم\s*تضيفوا|ممكن\s*تضيفوا|عاوزين\s*ميزة|عندي\s*فكرة|suggest|suggestion|feedback|i\s*wish|would\s*be\s*great|can\s*you\s*add|please\s*add|feature\s*request)(?:[\s،,.;?!]|$)/i.test(norm);

  const isBug =
    /(?:^|[\s،,.;?!])(عطل|مشكلة|عطلان|مش\s*شغال|مش\s*بيشتغل|الزرار\s*معلق|bug|broken|not\s*working|issue)(?:[\s،,.;?!]|$)/i.test(norm);

  const isContentRequest =
    /(?:^|[\s،,.;?!])(عايز|عاوز|ياريت|زودوا|مزيد\s+من)\s+(?:كلمات|جمل|مفردات|امثلة|أمثلة|سيناريوهات)/i.test(norm);

  if (!isSuggestion && !isBug && !isContentRequest) {
    return null;
  }

  let category: 'bug' | 'feature' | 'content' | 'general' = 'general';
  let title = 'اقتراح لتطوير التطبيق';
  let polished = norm;

  if (isBug) {
    category = 'bug';
    title = 'الإبلاغ عن مشكلة أو عطل';
    polished = `ملاحظة تقنية حول عمل التطبيق: ${norm.replace(/^(في|فيه)\s+مشكلة\s+(في|بـ)?/i, '').trim()}`;
  } else if (isContentRequest) {
    category = 'content';
    title = 'اقتراح توسيع المحتوى والكلمات';
    polished = `طلب إضافة مفردات وسيناريوهات تدريبية جديدة: ${norm.replace(/^(ياريت|يا\s*ريت|عايز|عاوز|ممكن)\s+/i, '').trim()}`;
  } else if (isSuggestion) {
    category = 'feature';
    title = 'اقتراح ميزة جديدة';
    polished = `اقتراح ميزة إضافية لخدمة المتعلمين: ${norm.replace(/^(ياريت|يا\s*ريت|اقترح|اقتراحي|نفسي\s*يكون)\s+/i, '').trim()}`;
  }

  if (!/[\u0600-\u06FF]/.test(norm)) {
    title = isBug ? 'Report Issue' : isContentRequest ? 'Content Expansion' : 'Feature Suggestion';
    polished = norm;
  }

  return {
    category,
    title,
    polishedMessage: polished,
    originalThought: norm
  };
}

/**
 * Checks if prompt is an explicit confirmation to submit feedback.
 */
export function isFeedbackConfirmation(input: string): boolean {
  const norm = input.trim().toLowerCase().replace(/[!.؟?]/g, '');
  return /^(أيوة|ايوه|ابعتها|تمام|أكيد|اه|أه|يلا ابعتها|موافق|ارسلها|أرسلها|نفذ|تمام ابعتها|yes|send it|confirm|sure|go ahead|yes please|yep)$/i.test(norm);
}

/**
 * Checks if prompt cancels feedback submission.
 */
export function isFeedbackCancellation(input: string): boolean {
  const norm = input.trim().toLowerCase().replace(/[!.؟?]/g, '');
  return /^(لا|بلاش|إلغاء|مش دلوقتي|سيبك|الغاء|no|cancel|never mind|not now|don't send)$/i.test(norm);
}

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
      "I'm Amr Sherif, your Egyptian AI language tutor and thinking bridge!",
      "My name is Amr! I'm here to help you stop translating in your head and start thinking naturally.",
      "I'm Amr! Think of me as your personal conversational gym partner."
    ],
    followUps: [
      "What is your main language goal right now: travel, career, or daily fluency?",
      "Have you practiced speaking aloud today?",
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
    keywords: ['travel', 'airport', 'hotel', 'flight', 'ticket', 'vacation', 'trip', 'سفر', 'مطار', 'فندق', 'رحلة', 'حجز'],
    responses: [
      "Traveling is one of the best adventures in life!",
      "Speaking your target language when you travel gives you instant confidence in any country.",
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
      "Professional language is all about sounding polite, clear, and confident.",
      "Workplace conversations get much easier once you master simple sentence structures.",
      "Great focus! Clear communication opens up amazing global career opportunities."
    ],
    followUps: [
      "What do you do for work or what career are you preparing for?",
      "How often do you need to write or speak in your job?",
      "Imagine an interviewer asks: 'Tell me about yourself' — how would you start?"
    ]
  }
];

export function detectAndCorrectTransferErrors(input: string): string | null {
  const norm = input.trim();
  const lower = norm.toLowerCase();

  if (lower.includes('i am agree') || lower.includes("i'm agree")) {
    return "I completely agree with you! 💡 Quick tip: in English, 'agree' is already a full verb, so we say **'I agree'** instead of 'I am agree' (أنا أوافق). Tell me more about your thoughts!";
  }

  if (lower.includes('married from')) {
    return "Nice! 💡 Collocation tip: in English we say **'married to'** rather than 'married from' (متزوج من).";
  }

  if (lower.includes('afraid from') || lower.includes('scared from')) {
    return "I hear you! 💡 In English, we say **'afraid of'** or **'scared of'** rather than 'from' (خائف من). What else makes you feel that way?";
  }

  if (lower.includes('angry from')) {
    return "💡 English preposition bridge: we say **'angry with'** or **'angry at'** someone, not 'angry from' (غضبان من).";
  }

  if (/\blisten\s+(music|radio|podcast|me|teacher)\b/i.test(norm)) {
    const m = norm.match(/\blisten\s+(music|radio|podcast|me|teacher)\b/i);
    return `💡 Remember: 'listen' always needs the preposition 'to' before the object: **'listen to ${m ? m[1] : 'music'}'** (استمع إلى).`;
  }

  if (/\blook\s+to\s+(the\s+)?(screen|picture|photo|board|me|sky)\b/i.test(norm)) {
    return "💡 Preposition tip: we say **'look at'** when directing our eyes toward something, rather than 'look to' (انظر إلى).";
  }

  if (lower.includes('do a mistake') || lower.includes('did a mistake') || lower.includes('make mistake')) {
    return "💡 Natural collocation: in English we **'make a mistake'**, not 'do a mistake' (يخطئ). Don't worry at all, making mistakes is how we learn!";
  }

  if (lower.includes('make a photo') || lower.includes('do a photo')) {
    return "💡 Collocation bridge: we say **'take a photo'** (التقط صورة), not 'make a photo'.";
  }

  if (lower.includes('open the light') || lower.includes('close the light')) {
    return "💡 Idiomatic tip: for electrical appliances and lights, we say **'turn on the light'** (شغّل النور) and **'turn off the light'** (اطفئ النور) instead of open/close.";
  }

  if (lower.includes('explain me')) {
    return "💡 Grammar bridge: in English, 'explain' requires 'to' before the person: **'explain to me'** (اشرح لي).";
  }

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

  if (/\b(i|he|she|we)\s+have\s+([a-z]+)\b/i.test(norm)) {
    const m = norm.match(/\b(i|he|she|we)\s+have\s+([a-z]+)\b/i);
    if (m && ['car', 'book', 'problem', 'question', 'job', 'dog', 'cat', 'pen', 'phone', 'computer'].includes(m[2].toLowerCase())) {
      return `Got it! 💡 Just remember that singular countable nouns in English require 'a' or 'an': **'I have a ${m[2]}'**. Can you tell me a little more about it?`;
    }
  }

  return null;
}

function handleEgyptianQuestions(cleanPrompt: string): string | null {
  const norm = cleanPrompt.trim();

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

  if (/ليه\s+(?:بنقول|بنحط|لازم)\s+(?:am|is|are|الكينونة)/i.test(norm)) {
    return "سؤال عبقري! 🧠\nفي العربي بنقول: «أنا طالب» بدون أي فعل، وده اسمه جملة اسمية.\nلكن في الإنجليزي: **مفيش أي جملة بتعيش بدون فعل!** عشان كده لازم نضيف فعل الكينونة:\n👉 **I am a student** (أنا أكون طالب).\n👉 **He is ready** (هو يكون جاهز).\nده أول جسر بنبنيه عشان نبطل نترجم حرفي!";
  }

  return null;
}

export function generateSmartConversationReply(
  prompt: string,
  history: ConversationHistoryItem[] = [],
  profile?: UserProfile,
  targetLang: TargetLanguage = 'en'
): string {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    return targetLang === 'de'
      ? "Ich höre zu! Sprich einfach auf Deutsch oder Arabisch."
      : targetLang === 'ja'
      ? "聞いていますよ！日本語でもアラビア語でも気軽に話してください。"
      : targetLang === 'es'
      ? "¡Te escucho! Habla en español o en árabe, incluso una frase sencilla."
      : "I'm listening! Feel free to say anything in English or Arabic, even just a simple sentence.";
  }

  const lowerPrompt = cleanPrompt.toLowerCase();
  const isArabicInput = /[\u0600-\u06FF]/.test(cleanPrompt);

  // 1. First priority: Check specific grammatical/L1 transfer and colloquial questions (so questions like "ليه بنقول am في الجملة؟" are answered directly)
  const correction = detectAndCorrectTransferErrors(cleanPrompt);
  if (correction) {
    return correction;
  }

  const egyptianReply = handleEgyptianQuestions(cleanPrompt);
  if (egyptianReply) {
    return egyptianReply;
  }

  // 2. Check if the user is submitting feedback or suggestion
  const feedbackDraft = extractFeedbackDraft(cleanPrompt);
  if (feedbackDraft) {
    const isAr = profile?.language === 'arabic' || isArabicInput;
    const catLabel =
      feedbackDraft.category === 'bug'
        ? 'مشكلة تقنية'
        : feedbackDraft.category === 'content'
        ? 'محتوى ومفردات'
        : 'فكرة وميزة جديدة';
    const catLabelEn =
      feedbackDraft.category === 'bug'
        ? 'Bug Report'
        : feedbackDraft.category === 'content'
        ? 'Content Expansion'
        : 'Feature Idea';

    return isAr
      ? `عاش عليك يا بطل! اقتراح ممتاز 💡 رتبتهولك كرسالة فيدباك واضحة:\n\n💡 **[${catLabel}]**: ${feedbackDraft.polishedMessage}\n\nعايز أبعتها كفيدباك دلوقتي للمطورين؟`
      : `Awesome suggestion! 💡 I drafted it as structured feedback:\n\n💡 **[${catLabelEn}]**: ${feedbackDraft.polishedMessage}\n\nDo you want me to send this as feedback now?`;
  }

  // 3. Check if user is confirming or cancelling feedback
  if (isFeedbackConfirmation(cleanPrompt)) {
    const isAr = profile?.language === 'arabic' || isArabicInput;
    return isAr
      ? "تسلم يا بطل! تم إرسال رسالتك لفريق التطوير مباشرة 🚀 ملاحظاتك بتفرق جداً في تطوير التطبيق. يلا نرجع لتمريننا!"
      : "Thank you so much! Your feedback has been sent directly to the development team 🚀 Let's resume our practice!";
  }

  if (isFeedbackCancellation(cleanPrompt)) {
    const isAr = profile?.language === 'arabic' || isArabicInput;
    return isAr
      ? "تمام ولا يهمك خالص يا بطل! لغيت الإرسال. تحب نكمل تمريننا في إيه؟"
      : "No problem at all! Cancelled. What would you like to practice next?";
  }

  // 4. German Target Experience
  if (targetLang === 'de') {
    if (lowerPrompt.includes('hallo') || lowerPrompt.includes('guten tag') || lowerPrompt.includes('hi')) {
      return "Hallo! Ich freue mich sehr, mit dir Deutsch zu üben. Wie geht es dir heute?";
    }
    if (lowerPrompt.includes('wie geht') || lowerPrompt.includes('wie gehts')) {
      return "Mir geht es fantastisch, danke! 💡 Denk an die Verb-Zweit-Regel: **'Heute lerne ich Deutsch'**. Was machst du heute noch?";
    }
    if (isArabicInput) {
      return "فهمتك تمام! بالألماني بنقول الفكرة دي بتركيز على مكان الفعل (رقم 2 دايماً في الجملة الأساسية). جرب تقول جملة قصيرة بالألماني!";
    }
    return "Das ist ein super Gedanke! Dein Deutsch klingt schon sehr flüssig. Kannst du mir mehr darüber auf Deutsch erzählen?";
  }

  // 5. Japanese Target Experience
  if (targetLang === 'ja') {
    if (lowerPrompt.includes('konnichiwa') || lowerPrompt.includes('こんにちは') || lowerPrompt.includes('ohayo')) {
      return "こんにちは！一緒に日本語で考える練習をしましょう。今日はどんな一日でしたか？";
    }
    if (lowerPrompt.includes('genki') || lowerPrompt.includes('元気')) {
      return "はい、とても元気です！ありがとう！💡 تذكر دايماً في اليابانية: الفعل بييجي في آخر الجملة تماماً (SOV). 何を飲みたいですか？";
    }
    if (isArabicInput) {
      return "فهمتك تمام! باليابانية بنبدأ بالفاعل أو المبتدأ وبعده المفعول ونرمي الفعل في الآخر خالص (SOV). جرب تقول كلمة أو جملة بسيطة بالياباني!";
    }
    return "素晴らしいですね！日本語で直接考える習慣がついてきました。もっと詳しく教えてくれますか？";
  }

  // 5b. Spanish Target Experience
  if (targetLang === 'es') {
    if (lowerPrompt.includes('hola') || lowerPrompt.includes('buenos días') || lowerPrompt.includes('buenas')) {
      return "¡Hola! Me alegra practicar contigo en español. ¿Cómo te va hoy?";
    }
    if (lowerPrompt.includes('cómo estás') || lowerPrompt.includes('que tal')) {
      return "¡Muy bien, gracias! 💡 Recuerda siempre: en español el verbo concuerda con el sujeto (ser vs estar). ¿Qué quieres practicar hoy?";
    }
    if (isArabicInput) {
      return "¡Entendido! En español pensamos con sujeto + verbo + objeto, pero el sujeto suele omitirse porque la terminación del verbo lo indica (pro-drop). Además, ser es para identidad y estar para estado/ubicación. ¡Prueba a decir una frase corta en español!";
    }
    return "¡Excelente! Tu español suena cada vez más natural. ¿Me puedes contar más en español?";
  }

  // 6. English Target Experience (Canonical)
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

    const dictHit = searchOfflineDictionary(cleanPrompt, 'ar');
    if (dictHit) {
      return `فهمتك تمام! عشان تعبر عن الفكرة دي بالإنجليزي:\n🎯 **"${dictHit}"**\nجرب تقولها معايا بالإنجليزي، واغلط براحتك إحنا بنتعلم!`;
    }

    return "فهمتك تمام! Let's say that thought in natural English. Try speaking a short sentence in English, and don't worry at all about mistakes—I'm here to support you!";
  }

  for (const topic of TOPICS) {
    if (topic.keywords.some((kw) => lowerPrompt.includes(kw))) {
      const seedIdx = (history.length + cleanPrompt.length) % topic.responses.length;
      const followUpIdx = (history.length + 1) % topic.followUps.length;
      return `${topic.responses[seedIdx]} ${topic.followUps[followUpIdx]}`;
    }
  }

  const focus = String(profile?.focusArea || '').toLowerCase();
  const goal = String(profile?.goal || '').toLowerCase();

  if (focus.includes('chem') || focus.includes('science')) {
    return "That's an interesting point! In science and chemistry, describing observations clearly in English is a superpower. How would you explain that in one simple English sentence?";
  }

  if (goal === 'travel') {
    return "I love that! When traveling abroad, speaking smoothly and politely makes every trip ten times more fun. Where are you planning to travel next?";
  }

  if (goal === 'work' || goal === 'business') {
    return "Well said! In a professional workplace or meeting, expressing your ideas clearly builds immediate trust. What is your favorite part about your work?";
  }

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

  let finalReply = `${defaultResponses[rIdx]} ${defaultFollowUps[fIdx]}`;

  // Occasional natural feedback invitation
  if (history.length >= 6 && history.length % 6 === 0) {
    finalReply +=
      profile?.language === 'arabic'
        ? "\n\n💬 (بالمناسبة، لو عندك أي اقتراح أو فكرة تحب تشوفها في التطبيق، قولي وأنا أرتبها لك كرسالة فيدباك!)"
        : "\n\n💬 (By the way, if you have any feedback or feature you'd love to see in the app, tell me and I'll draft it for you!)";
  }

  return finalReply;
}
