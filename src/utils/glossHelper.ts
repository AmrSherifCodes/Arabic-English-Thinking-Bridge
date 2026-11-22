import { ChunkMapping } from '../types';
import { EGYPTIAN_WORD_GLOSSES } from '../data/egyptianLexicon';
import { getTargetDictionary } from '../data/dictionaries';
import { GERMAN_BRIDGE_LEXICON } from '../data/germanBridgeLexicon';
import { ARAB_TOP_5_LEXICON } from '../data/arabTop5CuratedLexicon';

function stripTashkeelAndPunctuation(str: string): string {
  if (!str) return '';
  return str
    .replace(/[’‘`]/g, "'")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[()（）\[\]{}.,!?،؛:()"¿¡]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة\b/g, 'ه')
    .replace(/اً\b/g, '')
    .replace(/ا\b/g, '')
    .trim()
    .toLowerCase();
}

const ENGLISH_COMMON_WORD_GLOSSES: Record<string, string> = {
  'hi': 'أهلاً',
  'hello': 'أهلاً',
  'how': 'كيف',
  'you': 'أنت / أنتم',
  'your': 'خاصتك / ـك',
  'yourself': 'نفسك',
  'yourselves': 'أنفسكم',
  'my': 'خاصتي / ـي',
  'myself': 'نفسي',
  'me': 'أنا / إياي',
  'our': 'خاصتنا / ـنا',
  'ourselves': 'أنفسنا',
  'their': 'خاصتهم / ـهم',
  'themselves': 'أنفسهم',
  'his': 'خاصته / ـه',
  'himself': 'نفسه',
  'her': 'هي / خاصتها',
  'herself': 'نفسها',
  'i': 'أنا',
  'he': 'هو',
  'him': 'هو / إياه',
  'she': 'هي',
  'it': 'هو / هي (غير عاقل)',
  'its': 'خاصته / خاصتها',
  'itself': 'نفسه',
  'we': 'نحن',
  'us': 'إيانا / نحن',
  'they': 'هم',
  'them': 'هم / إياهم',
  'is': 'يكون',
  'am': 'أكون',
  'are': 'تكون / يكونون',
  'was': 'كان',
  'were': 'كانوا',
  'be': 'يكون',
  'been': 'كان',
  'good': 'جيد / خير',
  'morning': 'صباح',
  'evening': 'مساء',
  'night': 'ليل',
  'thank': 'يشكر / شكراً',
  'thanks': 'شكراً',
  'very': 'جداً',
  'much': 'كثيراً',
  'enough': 'كافٍ / كفاية',
  'a': 'واحد / مفرد',
  'an': 'واحد / مفرد',
  'the': 'الـ',
  'this': 'هذا / هذه',
  'that': 'ذلك / تلك',
  'these': 'هؤلاء',
  'those': 'أولئك',
  'here': 'هنا',
  'there': 'هناك',
  'now': 'الآن',
  'then': 'ثم / حينئذ',
  'today': 'اليوم',
  'tomorrow': 'غداً',
  'yesterday': 'أمس',
  'always': 'دائماً',
  'never': 'أبداً',
  'often': 'غالباً',
  'sometimes': 'أحياناً',
  'usually': 'عادةً',
  'every': 'كل',
  'all': 'كل',
  'some': 'بعض',
  'any': 'أي',
  'many': 'كثير',
  'few': 'قليل',
  'little': 'قليل',
  'more': 'أكثر',
  'most': 'معظم',
  'other': 'آخر',
  'another': 'آخر',
  'same': 'نفس',
  'such': 'مثل / هكذا',
  'what': 'ماذا / ما',
  'where': 'أين',
  'when': 'متى / عندما',
  'why': 'لماذا',
  'who': 'من',
  'which': 'أي',
  'yes': 'نعم',
  'no': 'لا',
  'not': 'ليس / لا',
  'and': 'و',
  'or': 'أو',
  'but': 'لكن',
  'so': 'لذلك / جداً',
  'if': 'إذا / لو',
  'in': 'في',
  'on': 'على',
  'at': 'في / عند',
  'to': 'إلى / أن',
  'from': 'من',
  'for': 'لـ / لأجل',
  'with': 'مع / بـ',
  'by': 'بواسطة / بـ',
  'can': 'يستطيع',
  'could': 'استطاع / يمكن',
  'would': 'سوف / كان سيـ',
  'should': 'يجب / ينبغي',
  'must': 'يجب',
  'might': 'قد / ربما',
  'may': 'قد / ربما',
  'shall': 'سوف',
  'will': 'سوف',
  'couldn\'t': 'لم يستطع',
  'wouldn\'t': 'لم يكن سيـ',
  'shouldn\'t': 'لا ينبغي',
  'mustn\'t': 'لا يجب',
  'can\'t': 'لا يستطيع',
  'won\'t': 'لن',
  'do': 'يفعل / هل',
  'does': 'يفعل / هل',
  'did': 'فعل / هل',
  'have': 'عنده / يملك',
  'has': 'عنده / يملك',
  'had': 'كان لديه',
  'want': 'يريد',
  'like': 'يحب / مثل',
  'need': 'يحتاج',
  'speak': 'يتحدث',
  'speaks': 'يتحدث',
  'spoke': 'تحدث',
  'spoken': 'تحدث',
  'see': 'يرى',
  'sees': 'يرى',
  'saw': 'رأى',
  'seen': 'رأى',
  'eat': 'يأكل',
  'eats': 'يأكل',
  'ate': 'أكل',
  'eaten': 'أكل',
  'drink': 'يشرب',
  'drinks': 'يشرب',
  'drank': 'شرب',
  'drunk': 'شرب',
  'go': 'يذهب',
  'goes': 'يذهب',
  'going': 'ذاهب',
  'went': 'ذهب',
  'gone': 'ذهب',
  'come': 'يأتي',
  'comes': 'يأتي',
  'came': 'جاء',
  'run': 'يجري',
  'runs': 'يجري',
  'ran': 'جري / ركض',
  'running': 'جري',
  'walk': 'يمشي',
  'walks': 'يمشي',
  'walked': 'مشى',
  'walking': 'مشي',
  'work': 'يعمل / عمل',
  'works': 'يعمل',
  'study': 'يدرس',
  'studies': 'يدرس',
  'learn': 'يتعلم',
  'learns': 'يتعلم',
  'play': 'يلعب',
  'plays': 'يلعب',
  'buy': 'يشتري',
  'buys': 'يشتري',
  'bought': 'اشترى',
  'say': 'يقول',
  'says': 'يقول',
  'said': 'قال',
  'tell': 'يخبر',
  'tells': 'يخبر',
  'told': 'أخبر',
  'call': 'يتصل / ينادي',
  'calls': 'يتصل',
  'help': 'مساعدة / يساعد',
  'helps': 'يساعد',
  'start': 'يبدأ',
  'starts': 'يبدأ',
  'started': 'بدأ',
  'meet': 'يلتقي',
  'meets': 'يلتقي',
  'met': 'التقى',
  'take': 'يأخذ',
  'takes': 'يأخذ',
  'took': 'أخذ',
  'taken': 'أخذ',
  'give': 'يعطي',
  'gives': 'يعطي',
  'gave': 'أعطى',
  'given': 'أعطى',
  'find': 'يجد',
  'finds': 'يجد',
  'found': 'وجد',
  'get': 'يحصل',
  'gets': 'يحصل',
  'got': 'حصل',
  'keep': 'يحتفظ',
  'keeps': 'يحتفظ',
  'kept': 'احتفظ',
  'feel': 'يشعر',
  'feels': 'يشعر',
  'felt': 'شعر',
  'think': 'يفكر',
  'thinks': 'يفكر',
  'thought': 'فكر / فكرة',
  'bring': 'يحضر',
  'brings': 'يحضر',
  'brought': 'أحضر',
  'know': 'يعرف',
  'knows': 'يعرف',
  'knew': 'عرف',
  'known': 'معروف / عرف',
  'forget': 'ينسى',
  'forgets': 'ينسى',
  'forgetting': 'نسيان',
  'forgot': 'نسي',
  'forgotten': 'منسي / نسي',
  'remember': 'يتذكر',
  'remembers': 'يتذكر',
  'remembered': 'تذكر',
  'understand': 'يفهم',
  'understands': 'يفهم',
  'understood': 'فهم',
  'become': 'يصبح',
  'becomes': 'يصبح',
  'became': 'أصبح',
  'leave': 'يغادر',
  'leaves': 'يغادر',
  'left': 'غادر / ترك',
  'borrow': 'يستعير',
  'borrows': 'يستعير',
  'borrowed': 'استعار',
  'seldom': 'نادراً',
  'rarely': 'نادراً',
  'hardly': 'بالكاد',
  'scarcely': 'بالكاد',
  'extraordinary': 'استثنائي / رائع',
  'dedication': 'إخلاص / تفانٍ',
  'transparency': 'الشفافية',
  'accountability': 'المساءلة',
  'effort': 'جهد',
  'commitment': 'التزام',
  'success': 'نجاح',
  'achievement': 'إنجاز',
  'progress': 'تقدم',
  'development': 'تطوير',
  'improvement': 'تحسين',
  'strategy': 'إستراتيجية',
  'analysis': 'تحليل',
  'policy': 'سياسة',
  'economy': 'اقتصاد',
  'society': 'مجتمع',
  'culture': 'ثقافة',
  'technology': 'تكنولوجيا',
  'science': 'علم',
  'research': 'بحث',
  'evidence': 'دليل',
  'proof': 'إثبات',
  'conclusion': 'استنتاج',
  'argument': 'حجة / نقاش',
  'discussion': 'مناقشة',
  'debate': 'مناظرة',
  'opinion': 'رأي',
  'perspective': 'منظور',
  'concept': 'مفهوم',
  'context': 'سياق',
  'structure': 'هيكل / بناء',
  'pattern': 'نمط',
  'system': 'نظام',
  'method': 'طريقة',
  'process': 'عملية',
  'function': 'وظيفة',
  'effect': 'تأثير',
  'impact': 'أثر',
  'influence': 'تأثير',
  'change': 'تغيير',
  'growth': 'نمو',
  'future': 'مستقبل',
  'history': 'تاريخ',
  'opportunity': 'فرصة',
  'challenge': 'تحدٍ',
  'solution': 'حل',
  'problem': 'مشكلة',
  'issue': 'مسألة / قضية',
  'goal': 'هدف',
  'purpose': 'غرض',
  'aim': 'هدف',
  'result': 'نتيجة',
  'outcome': 'نتيجة',
  'consequence': 'عاقبة',
  'value': 'قيمة',
  'quality': 'جودة',
  'level': 'مستوى',
  'degree': 'درجة',
  'stage': 'مرحلة',
  'phase': 'مرحلة',
  'step': 'خطوة',
  'action': 'إجراء',
  'behavior': 'سلوك',
  'attitude': 'موقف',
  'skill': 'مهارة',
  'ability': 'قدرة',
  'knowledge': 'معرفة',
  'experience': 'خبرة',
  'practice': 'ممارسة',
  'training': 'تدريب',
  'education': 'تعليم',
  'course': 'دورة',
  'lesson': 'درس',
  'subject': 'موضوع / فاعل',
  'topic': 'موضوع',
  'theme': 'فكرة رئيسية',
  'field': 'مقال / مجال',
  'area': 'منطقة',
  'scope': 'نطاق',
  'scale': 'مقياس',
  'range': 'مدى',
  'limit': 'حد',
  'border': 'حدود',
  'edge': 'حافة',
  'center': 'مركز',
  'core': 'جوهر',
  'basis': 'أساس',
  'base': 'قاعدة',
  'foundation': 'مؤسسة / أساس',
  'source': 'مصدر',
  'origin': 'أصل',
  'root': 'جذر',
  'cause': 'سبب',
  'reason': 'سبب',
  'motive': 'دافع',
  'factor': 'عامل',
  'element': 'عنصر',
  'part': 'جزء',
  'aspect': 'جانب',
  'feature': 'ميزة',
  'detail': 'تفاصيل',
  'point': 'نقطة',
  'item': 'عنصر',
  'unit': 'وحدة',
  'piece': 'قطعة',
  'section': 'قسم',
  'segment': 'جزء',
  'total': 'إجمالي',
  'whole': 'كامل',
  'sum': 'مجموع',
  'amount': 'كمية',
  'number': 'عدد',
  'quantity': 'كمية',
  'rate': 'معدل',
  'speed': 'سرعة',
  'power': 'قوة',
  'energy': 'طاقة',
  'strength': 'قوة',
  'capacity': 'قدرة',
  'role': 'دور',
  'position': 'موقع / وظيفة',
  'status': 'حالة',
  'rank': 'رتبة',
  'order': 'ترتيب / أمر',
  'form': 'صيغة / شكل',
  'type': 'نوع',
  'kind': 'نوع / طيب',
  'style': 'أسلوب',
  'mode': 'وضع',
  'manner': 'طريقة',
  'way': 'طريق / طريقة',
  'path': 'مسار',
  'route': 'طريق',
  'direction': 'اتجاه',
  'target': 'هدف',
  'object': 'مفعول به / شيء',
  'focus': 'تركيز',
  'attention': 'انتباه',
  'care': 'عناية',
  'interest': 'اهتمام',
  'concern': 'اهتمام / قلق',
  'matter': 'أمر / مسألة',
  'thing': 'شيء',
  'event': 'حدث',
  'fact': 'حقيقة',
  'case': 'حالة',
  'situation': 'موقف',
  'state': 'حالة / دولة',
  'condition': 'شرط / حالة',
  'environment': 'بيئة',
  'nature': 'طبيعة',
  'world': 'عالم',
  'life': 'حياة',
  'human': 'إنسان',
  'person': 'شخص',
  'individual': 'فرد',
  'people': 'ناس',
  'community': 'مجتمع',
  'group': 'مجموعة',
  'team': 'فريق',
  'member': 'عضو',
  'leader': 'قائد',
  'partner': 'شريك',
  'friend': 'صديق',
  'colleague': 'زميل',
  'colleagues': 'زملاء',
  'client': 'عميل',
  'customer': 'زبون',
  'user': 'مستخدم',
  'public': 'عام',
  'audience': 'جمهور',
  'nation': 'أمة',
  'country': 'بلد',
  'government': 'حكومة',
  'law': 'قانون',
  'rule': 'قاعدة',
  'principle': 'مبدأ',
  'standard': 'معيار',
  'norm': 'معيار',
  'custom': 'عادة',
  'habit': 'عادة',
  'tradition': 'تقليد',
  'belief': 'اعتقاد',
  'mind': 'عقل',
  'spirit': 'روح',
  'soul': 'روح',
  'body': 'جسم',
  'head': 'رأس',
  'eye': 'عين',
  'hand': 'يد',
  'voice': 'صوت',
  'word': 'كلمة',
  'language': 'لغة',
  'speech': 'خطاب / كلام',
  'text': 'نص',
  'document': 'وثيقة',
  'paper': 'ورقة',
  'book': 'كتاب',
  'job': 'وظيفة',
  'business': 'أعمال',
  'trade': 'تجارة',
  'market': 'سوق',
  'industry': 'صناعة',
  'product': 'منتج',
  'service': 'خدمة',
  'company': 'شركة',
  'firm': 'شركة',
  'organization': 'منظمة',
  'agency': 'وكالة',
  'institution': 'مؤسسة',
  'network': 'شبكة',
  'data': 'بيانات',
  'information': 'معلومات',
  'news': 'أخبار',
  'media': 'إعلام',
  'communication': 'تواصل',
  'message': 'رسالة',
  'letter': 'رسالة',
  'interview': 'مقابلة',
  'statement': 'بيان',
  'claim': 'ادعاء',
  'report': 'تقرير',
  'article': 'مقال',
  'essay': 'مقال',
  'review': 'مراجعة',
  'score': 'نتيجة / درجة',
  'grade': 'درجة',
  'award': 'جائزة',
  'prize': 'جائزة',
  'reward': 'مكافأة',
  'failure': 'فشل',
  'risk': 'خطر',
  'danger': 'خطر',
  'safety': 'أمان',
  'security': 'أمن',
  'protection': 'حماية',
  'aid': 'مساعدة',
  'benefit': 'فائدة',
  'advantage': 'ميزة',
  'profit': 'ربح',
  'gain': 'كسب',
  'loss': 'خسارة',
  'cost': 'تكلفة',
  'price': 'سعر',
  'worth': 'قيمة',
  'share': 'حصة / سهم',
  'stock': 'أسهم',
  'fund': 'صندوق',
  'capital': 'رأس مال',
  'money': 'نقود',
  'cash': 'نقد',
  'credit': 'رصيد',
  'debt': 'دين',
  'pay': 'يدفع',
  'payment': 'دفع',
  'sale': 'بيع',
  'purchase': 'شراء',
  'deal': 'صفقة',
  'offer': 'عرض',
  'proposal': 'مقترح',
  'duty': 'واجب',
  'activity': 'نشاط',
  'attempt': 'محاولة',
  'try': 'يحاول',
  'move': 'تحرك',
  'shift': 'تحول',
  'turn': 'دور / يتجه',
  'return': 'عودة',
  'end': 'نهاية',
  'stop': 'توقف',
  'finish': 'إنهاء',
  'hot': 'حار / ساخن',
  'cold': 'بارد',
  'coffee': 'قهوة',
  'tea': 'شاي',
  'water': 'ماء',
  'milk': 'حليب',
  'food': 'طعام',
  'bread': 'خبز',
  'important': 'مهم',
  'electric': 'كهربائي',
  'green': 'أخضر',
  'place': 'مكان',
  'time': 'وقت',
  'weekend': 'عطلة الأسبوع',
  'brother': 'أخ',
  'sister': 'أخت',
  'father': 'أب',
  'mother': 'أم',
  'son': 'ابن',
  'daughter': 'ابنة',
  'family': 'عائلة',
  'man': 'رجل',
  'woman': 'امرأة',
  'child': 'طفل',
  'children': 'أطفال',
  'bridge': 'جسر',
  'building': 'مبنى / بناء',
  'london': 'لندن',
  'day': 'يوم',
  'year': 'سنة',
  'key': 'مفتاح',
  'keys': 'مفاتيح',
  'furniture': 'أثاث',
  'furnitures': 'أثاث',
  'advice': 'نصيحة',
  'advices': 'نصائح',
  'tip': 'نصيحة',
  'tips': 'نصائح',
  'informations': 'معلومات',
  'office': 'مكتب',
  'boss': 'مدير',
  'contract': 'عقد',
  'idea': 'فكرة',
  'heart': 'قلب',
  'street': 'شارع',
  'road': 'طريق',
  'bus': 'حافلة',
  'train': 'قطار',
  'car': 'سيارة',
  'plane': 'طائرة',
  'ship': 'سفينة',
  'room': 'غرفة',
  'door': 'باب',
  'window': 'نافذة',
  'table': 'طاولة',
  'chair': 'كرسي',
  'bed': 'سرير',
  'clock': 'ساعة',
  'phone': 'هاتف',
  'computer': 'حاسوب',
  'email': 'بريد',
  'story': 'قصة',
  'page': 'صفحة',
  'sentence': 'جملة',
  'exam': 'امتحان',
  'class': 'فصل',
  'anymore': 'بعد الآن',
  'lot': 'كثير',
  'bike': 'دراجة',
  'bicycle': 'دراجة',
  'new': 'جديد',
  'make': 'يجعل / يصنع',
  'makes': 'يجعل / يصنع',
  'don\'t': 'لا',
  'doesn\'t': 'لا',
  'fluent': 'طلاقة',
  'fluently': 'بطلاقة',
  'lives': 'يعيش',
  'needed': 'مطلوب',
  'helping': 'مساعدة',
  'learning': 'تعلم',
  'leaving': 'مغادرة',
  'of': 'من',
  'house': 'بيت',
  'big': 'كبير',
  'small': 'صغير',
  'fast': 'سريع',
  'slow': 'بطيء',
  'old': 'قديم',
  'smart': 'ذكي',
  'plan': 'خطة',
  'clever': 'ذكي',
  'wake': 'يستيقظ',
  'wakes': 'يستيقظ',
  'lose': 'يخسر',
  'visit': 'يزور',
  'accepted': 'مقبول',
  'traveled': 'سافر',
  'rained': 'أمطرت',
  'however': 'ومع ذلك',
  'therefore': 'ولذلك',
  'although': 'بالرغم من',
  'shut': 'يغلق',
  'out': 'خارج',
  'petrol': 'بنزين',
  'surrender': 'استسلام',
  'down': 'أسفل',
  'broke': 'كسر / مفلس',
  'we see': 'نرى',
  'i knew': 'عرفت',
  'anticipate': 'يتوقع',
  'attends': 'يحضر',
  'resigns': 'يستقيل',
  'resigned': 'استقال',
  'moreover': 'علاوة على ذلك',
  'conclusive': 'حاسم',
  'obstacle': 'عقبة',
  'currently': 'حالياً',
  'agreeing': 'موافق',
  'actually': 'في الحقيقة',
  'live': 'يعيش',
  'friendly': 'ودود',
  'solve': 'يحل',
  'made': 'صنع',
  'arrived': 'وصل',
  'cool': 'بارد / رائع',
  'crush': 'يسحق',
  'wish': 'يتمنى',
  'arm': 'ذراع',
  'too': 'أيضاً',
  'proves': 'يثبت',
  'definitely': 'بالتأكيد',
  'shows': 'يظهر',
  'everyone': 'الجميع',
  'surely': 'بالتأكيد',
  'prove': 'يثبت',
  'absolute': 'مطلق',
};

const ARABIC_COMMON_WORD_GLOSSES: Record<string, string> = {
  'إزيك': 'how are you',
  'إزيك؟': 'how are you',
  'ازيك': 'how are you',
  'ازيك؟': 'how are you',
  'باهراً': 'brilliant / impressive',
  'باهر': 'brilliant / impressive',
  'ارتفعت': 'increased / rose',
  'تكاليف': 'costs',
  'الإنتاج': 'production',
  'إنتاج': 'production',
  'وبناءً': 'consequently / based',
  'بناءً': 'consequently / based',
  'اضطرت': 'was forced',
  'الشركة': 'the company',
  'شركة': 'company',
  'تعديل': 'adjusting / modification',
  'أسعارها': 'its prices',
  'أسعار': 'prices',
  'الدراسة': 'the study',
  'دراسة': 'study',
  'شاملة': 'comprehensive',
  'للغاية': 'extremely / very',
  'غاية': 'end / aim',
  'وعلاوة': 'furthermore / moreover',
  'توصيات': 'recommendations',
  'توصية': 'recommendation',
  'عملية': 'actionable / practical',
  'قابلة': 'applicable',
  'للتطبيق': 'for application',
  'تطبيق': 'application',
  'للتنفيذ': 'for execution',
  'تنفيذ': 'execution',
  'تشير': 'suggests / indicates',
  'الأدلة': 'the evidence',
  'أدلة': 'evidence',
  'التفاعل': 'the reaction',
  'تفاعل': 'reaction',
  'الكيميائي': 'chemical',
  'كيميائي': 'chemical',
  'يسلك': 'follows',
  'يتبع': 'follows',
  'مساراً': 'pathway / route',
  'مسار': 'pathway / route',
  'مختلفاً': 'different',
  'مختلف': 'different',
  'المعتقد': 'believed / belief',
  'معتقد': 'believed',
  'نطاق': 'scale / scope',
  'واسع': 'wide / broad',
  'درجة': 'temperature / degree',
  'الحرارة': 'heat / temperature',
  'حرارة': 'temperature',
  'تؤثر': 'affects',
  'معدل': 'rate / average',
  'سرعة': 'speed / rate',
  'النتائج': 'the results / findings',
  'نتائج': 'results / findings',
  'الأولية': 'preliminary / initial',
  'أولية': 'preliminary',
  'يبدو': 'appears / seems',
  'أنها': 'that it / that she',
  'تدعم': 'supports',
  'الفرضية': 'the hypothesis',
  'فرضية': 'hypothesis',
  'نجاحاً': 'success',
  'نجاح': 'success',
  'فشلاً': 'failure',
  'فشل': 'failure',
  'تقدماً': 'progress',
  'تقدم': 'progress',
  'صعوبات': 'difficulties',
  'صعوبة': 'difficulty',
  'تحديات': 'challenges',
  'تحدي': 'challenge',
  'مشاكل': 'problems',
  'مشكلة': 'problem',
  'حلول': 'solutions',
  'حل': 'solution',
  'إنجازات': 'achievements',
  'إنجاز': 'achievement',
  'تطورات': 'developments',
  'تطور': 'development',
  'تغييرات': 'changes',
  'تغيير': 'change',
  'فرص': 'opportunities',
  'فرصة': 'opportunity',
  'كبيراً': 'big / large',
  'كبيرا': 'big',
  'كبير': 'big',
  'كبيرة': 'big',
  'صغيراً': 'small',
  'صغيرا': 'small',
  'صغير': 'small',
  'صغيرة': 'small',
  'تعاطفاً': 'sympathy / empathy',
  'تعاطف': 'sympathy / empathy',
  'احترام': 'respect',
  'احتراماً': 'respect',
  'تقدير': 'appreciation',
  'تقديراً': 'appreciation',
  'تضامن': 'solidarity',
  'تضامناً': 'solidarity',
  'استقرار': 'stability',
  'استقراراً': 'stability',
  'استقلال': 'independence',
  'استقلالاً': 'independence',
  'حرية': 'freedom',
  'حريةً': 'freedom',
  'عدالة': 'justice',
  'عدالةً': 'justice',
  'تسامح': 'tolerance',
  'تسامحاً': 'tolerance',
  'تعاون': 'cooperation',
  'تعاوناً': 'cooperation',
  'شجاعة': 'courage',
  'شجاعةً': 'courage',
  'لمساعدتي': 'to help me',
  'مساعدتي': 'my help',
  'لمساعدتك': 'to help you',
  'لمساعدته': 'to help him',
  'لمساعدتها': 'to help her',
  'لمساعدتنا': 'to help us',
  'لمساعدتهم': 'to help them',
  'متعباً': 'tired',
  'متعب': 'tired',
  'متعبة': 'tired',
  'أنه': 'that he / that it',
  'أنهم': 'that they',
  'أننا': 'that we',
  'أنك': 'that you',
  'أنني': 'that I',
  'أني': 'that I',
  'أن': 'that',
  'إن': 'indeed / that',
  'إنه': 'it is / he is',
  'إنها': 'she is',
  'إنهم': 'they are',
  'إننا': 'we are',
  'إنك': 'you are',
  'إني': 'I am',
  'سنلغي': 'we will cancel',
  'نلغي': 'we cancel',
  'ألغى': 'cancel',
  'يلغي': 'cancels',
  'تلغي': 'cancels',
  'ألغي': 'cancel',
  'لقبلت': 'would accept',
  'قبلت': 'would accept / accepted',
  'قبل': 'accepted / before',
  'يقبل': 'accepts',
  'تقبل': 'accepts',
  'مذهلاً': 'amazing / astonishing',
  'مذهلا': 'amazing',
  'مذهل': 'amazing',
  'مذهلة': 'amazing',
  'زرناه': 'we visited him/it',
  'زرنا': 'we visited',
  'زرته': 'I visited him/it',
  'زرتها': 'I visited her/it',
  'زرناها': 'we visited her/it',
  'تحدثت': 'spoke / talked',
  'تحدث': 'spoke / speak',
  'استعرته': 'I borrowed it',
  'استعرت': 'borrowed',
  'يستعير': 'borrows',
  'تستعير': 'borrows',
  'أستعير': 'borrow',
  'اليابان': 'Japan',
  'اليابان؟': 'Japan',
  'ألمانيا': 'Germany',
  'إسبانيا': 'Spain',
  'فرنسا': 'France',
  'إيطاليا': 'Italy',
  'الصين': 'China',
  'روسيا': 'Russia',
  'الهند': 'India',
  'تركيا': 'Turkey',
  'إسرائيل': 'Israel',
  'البرازيل': 'Brazil',
  'بريطانيا': 'Britain',
  'أمريكا': 'America',
  'زرت': 'visited',
  'زار': 'visited',
  'يزور': 'visits',
  'تزور': 'visits',
  'أزور': 'visit',
  'نزور': 'visit',
  'أبحث': 'search / look for',
  'يبحث': 'searches / looks for',
  'تبحث': 'searches / looks for',
  'بحث': 'searched / looked for',
  'نبحث': 'search / look for',
  'ما زلت': 'I am still / I still',
  'زلت': 'still',
  'ما زال': 'still',
  'ما زالت': 'still',
  'لا زلت': 'still',
  'لا يزال': 'still',
  'لا تزال': 'still',
  'وما': 'and what / and not',
  'ما': 'what / not',
  'فقدت': 'lost',
  'فقد': 'lost',
  'يفقد': 'loses',
  'تفقد': 'loses',
  'أفقد': 'lose',
  'نفقد': 'lose',
  'لاحقاً': 'later',
  'لاحقا': 'later',
  'سابقاً': 'previously',
  'سابقا': 'previously',
  'قريباً': 'soon',
  'قريبا': 'soon',
  'بك': 'with you / to you',
  'بيا': 'with me',
  'بي': 'with me',
  'به': 'with him',
  'بها': 'with her',
  'بنا': 'with us',
  'بهم': 'with them',
  'بكم': 'with you',
  'لك': 'to you / for you',
  'لي': 'to me / for me',
  'له': 'to him / for him',
  'لها': 'to her / for her',
  'لنا': 'to us / for us',
  'لهم': 'to them / for them',
  'لكم': 'to you / for you',
  'عنك': 'about you',
  'عني': 'about me',
  'عنه': 'about him',
  'عنها': 'about her',
  'عنا': 'about us',
  'عنهم': 'about them',
  'إليك': 'to you',
  'إلي': 'to me',
  'إليه': 'to him',
  'إليها': 'to her',
  'إلينا': 'to us',
  'إليهم': 'to them',
  'معك': 'with you',
  'معي': 'with me',
  'معه': 'with him',
  'معها': 'with her',
  'معنا': 'with us',
  'معهم': 'with them',
  'وسأتصل': 'and I will call',
  'سأتصل': 'I will call',
  'أتصل': 'call / contact',
  'سأقول': 'I will say',
  'سأذهب': 'I will go',
  'سأعمل': 'I will work',
  'لدي': 'I have',
  'لديك': 'you have',
  'لديه': 'he has',
  'لديها': 'she has',
  'لدينا': 'we have',
  'لديهم': 'they have',
  'لديكم': 'you have',
  'لدي المساعدة': 'I have help',
  'ليس لدي': 'I do not have',
  'عندي': 'I have',
  'عندك': 'you have',
  'عنده': 'he has',
  'عندها': 'she has',
  'عندنا': 'we have',
  'عندهم': 'they have',
  'عندكم': 'you have',
  'قابلت': 'met',
  'قابل': 'met',
  'يقابل': 'meets',
  'تقابل': 'meets',
  'أقابل': 'meet',
  'نقابل': 'meet',
  'رأيت': 'saw',
  'شربت': 'drank',
  'أكلت': 'ate',
  'قرأت': 'read',
  'كتبت': 'wrote',
  'سافرت': 'traveled',
  'ذهبت': 'went',
  'عملت': 'worked',
  'درست': 'studied',
  'تعلمت': 'learned',
  'لعبت': 'played',
  'اشتريت': 'bought',
  'قلت': 'said',
  'أخبرت': 'told',
  'اتصلت': 'called',
  'ساعدت': 'helped',
  'بدأت': 'started',
  'التقيت': 'met',
  'أخذت': 'took',
  'أعطيت': 'gave',
  'وجدت': 'found',
  'حصلت': 'got',
  'احتفظت': 'kept',
  'شعرت': 'felt',
  'فكرت': 'thought',
  'أحضرت': 'brought',
  'عرفت': 'knew',
  'أصبحت': 'became',
  'غادرت': 'left',
  'بحاجة': 'in need / needing',
  'مساعدتك': 'your help / helping you',
  'مساعدة': 'help',
  'صديق': 'friend',
  'صديقاً': 'friend',
  'صديقة': 'friend',
  'أخوك': 'your brother',
  'اخوك': 'your brother',
  'أخيك': 'your brother',
  'اخيك': 'your brother',
  'أخاك': 'your brother',
  'أخوه': 'his brother',
  'أخاه': 'his brother',
  'أخيه': 'his brother',
  'أبوك': 'your father',
  'ابوك': 'your father',
  'أبيك': 'your father',
  'أباك': 'your father',
  'أبوه': 'his father',
  'أباه': 'his father',
  'أبيه': 'his father',
  'أمك': 'your mother',
  'أختك': 'your sister',
  'ابنك': 'your son',
  'ابنتك': 'your daughter',
  'لندن': 'London',
  'لندن؟': 'London',
  'مصر': 'Egypt',
  'القاهرة': 'Cairo',
  'الإسكندرية': 'Alexandria',
  'اسكندرية': 'Alexandria',
  'أستطيع': 'can',
  'استطيع': 'can',
  'تستطيع': 'can',
  'يستطيع': 'can',
  'نستطيع': 'can',
  'يستطيعون': 'can',
  'تستطيعون': 'can',
  'يمكنني': 'can / could',
  'يمكنك': 'can',
  'يمكنه': 'can',
  'يمكنها': 'can',
  'يمكننا': 'can',
  'يمكنهم': 'can',
  'تحتاج': 'need',
  'يحتاج': 'needs',
  'نحتاج': 'need',
  'تحتاجون': 'need',
  'يحتاجون': 'need',
  'احتجت': 'needed',
  'يريد': 'wants',
  'تريد': 'wants',
  'أريد': 'want',
  'نريد': 'want',
  'يحب': 'likes',
  'تحب': 'likes',
  'أحب': 'like',
  'نحب': 'like',
  'تتحدث': 'speak / speak to',
  'تتحدث؟': 'speak',
  'أتحدث': 'speak',
  'نتحدث': 'speak',
  'يتحدث': 'speaks',
  'يتحدثون': 'speak',
  'تتحدثون': 'speak',
  'يتكلم': 'speaks',
  'تتكلم': 'speaks',
  'أتكلم': 'speak',
  'نتكلم': 'speak',
  'يتكلمون': 'speak',
  'تتكلمون': 'speak',
  'بطلاقة': 'fluently',
  'بطلاقة؟': 'fluently',
  'بطلاقه': 'fluently',
  'طلاقة': 'fluency',
  'طلاقه': 'fluency',
  'تجعلني': 'makes me',
  'يجعلني': 'makes me',
  'تجعلنا': 'makes us',
  'يجعلنا': 'makes us',
  'يجعل': 'makes',
  'تجعل': 'makes',
  'يعيش': 'live',
  'يعيشون': 'live',
  'تعيش': 'live',
  'نعيش': 'live',
  'أعيش': 'live',
  'عاش': 'lived',
  'عاشوا': 'lived',
  'سعيد': 'happy',
  'سعيداً': 'happy',
  'سعيدة': 'happy',
  'سعداء': 'happy',
  'فكرة': 'idea',
  'فكره': 'idea',
  'كفكرة': 'as an idea',
  'كهربائي': 'electric',
  'كهربائية': 'electric',
  'كهربائيه': 'electric',
  'الآن': 'now',
  'الان': 'now',
  'الآن؟': 'now',
  'الان؟': 'now',
  'أهلاً': 'hello',
  'مرحباً': 'hello',
  'كيف': 'how',
  'حالك': 'you / state',
  'صباح': 'morning',
  'الخير': 'goodness',
  'شكراً': 'thank you',
  'جزيلاً': 'very much',
  'بيت': 'house',
  'البيت': 'the house',
  'ليس': 'not',
  'كافٍ': 'enough',
  'وقت': 'time',
  'الوقت': 'the time',
  'أنا': 'I',
  'أنت': 'you',
  'أنتي': 'you',
  'أنتم': 'you',
  'هو': 'he',
  'هي': 'she',
  'نحن': 'we',
  'هم': 'they',
  'العمل': 'work',
  'عمل': 'work',
  'مبكراً': 'early',
  'مبكر': 'early',
  'أبدأ': 'start',
  'دراجة': 'bicycle',
  'جديدة': 'new',
  'جديد': 'new',
  'سيارة': 'car',
  'السيارة': 'the car',
  'كتاب': 'book',
  'الكتاب': 'the book',
  'مدرسة': 'school',
  'المدرسة': 'the school',
  'قهوة': 'coffee',
  'القهوة': 'the coffee',
  'شاي': 'tea',
  'الشاي': 'the tea',
  'ماء': 'water',
  'الماء': 'the water',
  'طالب': 'student',
  'معلم': 'teacher',
  'مهندس': 'engineer',
  'في': 'in',
  'من': 'from',
  'على': 'on',
  'إلى': 'to',
  'مع': 'with',
  'عن': 'about',
  'هذا': 'this',
  'هذه': 'this',
  'ذلك': 'that',
  'أحتاج': 'need',
  'أشرب': 'drink',
  'أدرس': 'study',
  'أتعلم': 'learn',
  'أذهب': 'go',
  'أعمل': 'work',
  'يسافر': 'travel',
  'يقرأ': 'read',
  'يكتب': 'write',
  'يشتري': 'buy',
  'كان': 'was',
  'كانت': 'was',
  'كانوا': 'were',
  'يكون': 'is',
  'تكون': 'is',
  'نكون': 'are',
  'جيد': 'good',
  'جميل': 'beautiful',
  'سريع': 'fast',
  'بطيء': 'slow',
  'قديم': 'old',
  'مهم': 'important',
  'سهل': 'easy',
  'صعب': 'hard',
  'حزين': 'sad',
  'تعبان': 'tired',
  'مريض': 'sick',
  'جاهز': 'ready',
  'مفتوح': 'open',
  'مغلق': 'closed',
  'اليوم': 'today',
  'أمس': 'yesterday',
  'غداً': 'tomorrow',
  'دائماً': 'always',
  'عادةً': 'usually',
  'غالباً': 'often',
  'أحياناً': 'sometimes',
  'أبداً': 'never',
  'كثيراً': 'a lot',
  'قليلاً': 'a little',
  'بشكل': 'in a way / form',
  'مباشر': 'direct',
  'غير': 'not / non',
  'أفضل': 'better',
  'أحسن': 'better',
  'أكبر': 'larger',
  'أصغر': 'smaller',
  'أسرع': 'faster',
  'أبطأ': 'slower',
  'الدخول': 'entering / entry',
  'دخول': 'entering / entry',
};

const GERMAN_COMMON_WORD_GLOSSES: Record<string, string> = {
  'war': 'كان',
  'warst': 'كنت',
  'waren': 'كانوا',
  'wart': 'كنتم',
  'hatte': 'كان لديه',
  'hattest': 'كان لديك',
  'hatten': 'كان لديهم',
  'hattet': 'كان لديكم',
  'für': 'لـ / لأجل',
  'durch': 'عبر / خلال',
  'gegen': 'ضد',
  'ohne': 'بدون',
  'um': 'حول / في',
  'über': 'عن / فوق',
  'unter': 'تحت',
  'vor': 'قبل / أمام',
  'hinter': 'خلف',
  'neben': 'بجانب',
  'zwischen': 'بين',
  'seit': 'منذ',
  'ab': 'منذ',
  'diese': 'هذه',
  'dieser': 'هذا',
  'dieses': 'هذا',
  'diesen': 'هذا',
  'diesem': 'هذا',
  'alle': 'الجميع',
  'jeder': 'كل',
  'jede': 'كل',
  'jedes': 'كل',
  'mein': 'خاصتي / ـي',
  'meine': 'خاصتي / ـي',
  'meinem': 'خاصتي / ـي',
  'meinen': 'خاصتي / ـي',
  'dein': 'خاصتك / ـك',
  'deine': 'خاصتك / ـك',
  'deinem': 'خاصتك / ـك',
  'deinen': 'خاصتك / ـك',
  'sein': 'خاصته / ـه',
  'seine': 'خاصته / ـه',
  'seinem': 'خاصته / ـه',
  'seinen': 'خاصته / ـه',
  'unser': 'خاصتنا / ـنا',
  'unsere': 'خاصتنا / ـنا',
  'unserem': 'خاصتنا / ـنا',
  'unseren': 'خاصتنا / ـنا',
  'euer': 'خاصتكم / ـكم',
  'eure': 'خاصتكم / ـكم',
  'kann': 'يستطيع / يمكن',
  'kannst': 'تستطيع',
  'können': 'يستطيعون / يقدر',
  'könnt': 'تستطيعون',
  'muss': 'يجب',
  'musst': 'يجب',
  'müssen': 'يجب',
  'müsst': 'يجب',
  'will': 'يريد',
  'willst': 'تريد',
  'wollen': 'يريدون',
  'wollt': 'تريدون',
  'darf': 'يسمح',
  'darfst': 'يسمح',
  'dürfen': 'يسمح',
  'dürft': 'يسمح',
  'soll': 'ينبغي',
  'sollst': 'ينبغي',
  'sollen': 'ينبغي',
  'sollt': 'ينبغي',
  'mag': 'يحب',
  'magst': 'تحب',
  'mögen': 'يحبون',
  'mögt': 'تحبون',
  'möchte': 'يرغب',
  'möchtest': 'ترغب',
  'möchten': 'يرغبون',
  'möchtet': 'ترغبون',
  'weiß': 'يعلم',
  'weißt': 'تعلم',
  'wissen': 'يعلمون',
  'wisst': 'تعلمون',
  'frisch': 'طازج',
  'frisches': 'طازج',
  'frische': 'طازج',
  'frischen': 'طازج',
  'dorf': 'قرية',
  'stadt': 'مدينة',
  'land': 'بلد / أرض',
  'haus': 'منزل',
  'zimmer': 'غرفة',
  'straße': 'شارع',
  'weg': 'طريق',
  'ort': 'مكان',
  'platz': 'ميدان / مكان',
  'wetter': 'الطقس',
  'bahnhof': 'محطة قطار',
  'nah': 'قريب',
  'weit': 'بعيد',
  'ticket': 'تذكرة',
  'bahn': 'قطار',
  'zug': 'قطار',
  'pünktlich': 'في الموعد',
  'wünsche': 'أتمنى',
  'wünschen': 'يتمنى',
  'reise': 'رحلة',
  'fahrt': 'رحلة',
  'freund': 'صديق',
  'familie': 'عائلة',
  'nett': 'لطيف',
  'treffen': 'يلتقي / اجتماع',
  'uns': 'أنفسنا',
  'wochenende': 'عطلة الأسبوع',
  'bruder': 'أخ',
  'firma': 'شركة',
  'schule': 'مدرسة',
  'beginnt': 'يبدأ',
  'beginnen': 'يبدأ',
  'später': 'لاحقاً',
  'e-mail': 'بريد إلكتروني',
  'brief': 'رسالة',
  'nachricht': 'رسالة',
  'beenden': 'ينهي',
  'restaurant': 'مطعم',
  'bietet': 'يقدم',
  'bieten': 'يقدم',
  'leckeres': 'لذيذ',
  'lecker': 'لذيذ',
  'garten': 'حديقة',
  'tisch': 'طاولة',
  'zwei': 'اثنان',
  'reservieren': 'يحجز',
  'rechnung': 'فاتورة',
  'karte': 'بطاقة',
  'geld': 'نقود',
  'kostet': 'يكلّف',
  'kosten': 'يكلّف',
  'hemd': 'قميص',
  'hose': 'بنطال',
  'schuh': 'حذاء',
  'bezahlen': 'يدفع',
  'bargeld': 'نقد',
  'euro': 'يورو',
  'geschäft': 'متجر',
  'bis': 'حتى',
  'abends': 'مساءً',
  'geöffnet': 'مفتوح',
  'offen': 'مفتوح',
  'preis': 'سعر',
  'teuer': 'غالٍ',
  'billig': 'رخيص',
  'apfel': 'تفاحة',
  'banane': 'موزة',
  'neues': 'جديد',
  'zeitung': 'جريدة',
  'kürzlich': 'مؤخراً',
  'gereist': 'سافر',
  'wien': 'فيينا',
  'süßen': 'حلو',
  'süß': 'حلو',
  'gegessen': 'أكل',
  'fleißig': 'بجدية',
  'obwohl': 'بالرغم من',
  'dass': 'أن',
  'idee': 'فكرة',
  'verstehst': 'تفهم',
  'wohnen': 'يعيش / يسكن',
  'lernen': 'يتعلم',
  'studieren': 'يدرس',
  'essen': 'يأكل',
  'trinken': 'يشرب',
  'fahren': 'يقود / يسافر',
  'fliegen': 'يطير / يسافر طيراناً',
  'kaufen': 'يشتري',
  'verkaufen': 'يبيع',
  'schlafen': 'ينام',
  'verstehen': 'يفهم',
  'sprechen': 'يتحدث',
  'sagen': 'يقول',
  'glauben': 'يعتقد',
  'denken': 'يفكر',
  'finden': 'يجد',
  'suchen': 'يبحث',
  'kalt': 'بارد',
  'kälter': 'أبرد',
  'heiß': 'حار',
  'heißer': 'أحر',
  'warm': 'دافئ',
  'wärmer': 'أدفأ',
  'alt': 'قديم',
  'älter': 'أقدم',
  'neu': 'جديد',
  'neuer': 'أجدد',
  'jung': 'شاب',
  'jünger': 'أصغر',
  'bitte': 'من فضلك',
  'danke': 'شكراً',
  'ja': 'نعم',
  'nein': 'لا',
  'hallo': 'أهلاً',
  'gut': 'جيد / بخير',
  'guten': 'جيد',
  'tag': 'يوم',
  'morgen': 'صباح / غداً',
  'abend': 'مساء',
  'nacht': 'ليلة',
  'tschüss': 'مع السلامة',
  'auf': 'على / إلى',
  'wiedersehen': 'لقاء',
  'wie': 'كيف',
  'geht': 'يذهب / حال',
  'dir': 'لك',
  'ihnen': 'لحضرتك',
  'mir': 'لي',
  'sehr': 'جداً',
  'jetzt': 'الآن',
  'hier': 'هنا',
  'dort': 'هناك',
  'immer': 'دائماً',
  'nie': 'أبداً',
  'oft': 'غالباً',
  'manchmal': 'أحياناً',
  'auch': 'أيضاً',
  'nur': 'فقط',
  'schon': 'بالفعل',
  'noch': 'لا يزال / بعد',
  'mehr': 'أكثر',
  'viel': 'كثيراً',
  'wenig': 'قليلاً',
  'alles': 'كل شيء',
  'nichts': 'لاشيء',
  'etwas': 'شيء ما',
  'wer': 'من',
  'was': 'ماذا',
  'wo': 'أين',
  'wann': 'متى',
  'warum': 'لماذا',
  'welche': 'أي',
  'schön': 'جميل',
  'schöner': 'أجمل',
  'besser': 'أفضل',
  'groß': 'كبير',
  'größer': 'أكبر',
  'klein': 'صغير',
  'kleiner': 'أصغر',
  'schnell': 'سريع',
  'schneller': 'أسرع',
  'ich': 'أنا',
  'du': 'أنت',
  'er': 'هو',
  'sie': 'هي / هم',
  'es': 'هو / هي (محياد)',
  'wir': 'نحن',
  'ihr': 'أنتم',
  'der': 'الـ (مذكر)',
  'die': 'الـ (مؤنث/جمع)',
  'das': 'الـ (محياد)',
  'ein': 'واحد / مفرد',
  'eine': 'واحدة / مفرد',
  'einen': 'واحد / مفرد (منصوب)',
  'den': 'الـ (منصوب)',
  'dem': 'الـ (مجرور)',
  'heute': 'اليوم',
  'an': 'بـ / في (بادئة اتصال)',
  'mit': 'مع',
  'in': 'في',
  'aus': 'من',
  'zu': 'إلى',
  'nach': 'إلى',
  'bei': 'عند / لدى',
  'von': 'من',
  'und': 'و',
  'oder': 'أو',
  'aber': 'لكن',
  'deutsch': 'الألمانية',
  'deutschland': 'ألمانيا',
  'arbeit': 'عمل',
  'arbeiten': 'يعمل',
  'fange': 'أبدأ',
  'anfangen': 'يبدأ',
  'früh': 'مبكراً',
  'frühe': 'مبكراً',
  'spät': 'متأخراً',
  'zeit': 'وقت',
  'brot': 'خبز',
  'wasser': 'ماء',
  'kaffee': 'قهوة',
  'tee': 'شاي',
  'buch': 'كتاب',
  'kind': 'طفل',
  'frau': 'امرأة',
  'mann': 'رجل',
  'habe': 'عندي / أكون',
  'bin': 'أكون',
  'bist': 'تكون',
  'ist': 'يكون',
  'sind': 'نكون',
  'hat': 'عنده',
  'gehe': 'أذهب',
  'kommen': 'يأتي',
  'sehen': 'يرى',
  'sehe': 'أرى',
  'liest': 'يقرأ',
  'schreiben': 'يكتب',
  'helfen': 'يساعد',
  'rufe': 'أتصل',
  'brauche': 'أحتاج',
};

const SPANISH_COMMON_WORD_GLOSSES: Record<string, string> = {
  'jugar': 'يلعب',
  'pequeña': 'صغيرة',
  'pequeño': 'صغير',
  'blanco': 'أبيض',
  'blanca': 'بيضاء',
  'el': 'الـ (مذكر)',
  'la': 'الـ (مؤنث)',
  'es': 'يكون',
  'casa': 'بيت',
  'niño': 'ولد',
  'juega': 'يلعب',
  'grande': 'كبير',
  'perro': 'كلب',
  'gato': 'قط',
  'comer': 'يأكل',
  'beber': 'يشرب',
  'comimos': 'أكلنا',
  'comí': 'أكلت',
  'hablar': 'يتحدث',
  'hablo': 'أتحدث',
  'habla': 'يتحدث',
  'hablamos': 'نتحدث',
  'vivir': 'يعيش',
  'vivo': 'أعيش',
  'vive': 'يعيش',
  'trabajar': 'يعمل',
  'trabajo': 'أعمل',
  'ir': 'يذهب',
  'voy': 'أذهب',
  'va': 'يذهب',
  'ser': 'يكون',
  'soy': 'أكون',
  'somos': 'نكون',
  'estar': 'يكون',
  'estoy': 'أكون',
  'está': 'يكون',
  'tengo': 'عندي',
  'tiene': 'عنده',
  'tienes': 'عندك',
  'podría': 'هل يمكن / يستطيع',
  'puedo': 'أستطيع',
  'puede': 'يستطيع',
};

const FRENCH_COMMON_WORD_GLOSSES: Record<string, string> = {
  'parler': 'يتحدث',
  'parle': 'أتحدث',
  'parles': 'تتحدث',
  'parlons': 'نتحدث',
  'petit': 'صغير',
  'petite': 'صغيرة',
  'le': 'الـ (مذكر)',
  'les': 'الـ (جمع)',
  'un': 'واحد',
  'une': 'واحدة',
  'maison': 'بيت',
  'garçon': 'ولد',
  'fille': 'بنت',
  'est': 'يكون',
  'ne': 'لا / ليس',
  'pas': 'ليس',
  'manger': 'يأكل',
  'mange': 'آكل',
  'suis': 'أكون',
  'sommes': 'نكون',
  'ai': 'عندي',
  'j\'ai': 'عندي',
  'non': 'لا',
  'oui': 'نعم',
  'moi': 'أنا',
  'toi': 'أنت',
  'lui': 'هو',
  'elle': 'هي',
  'nous': 'نحن',
  'vous': 'أنتم',
  'ils': 'هم',
  'elles': 'هن',
  'ce': 'هذا',
  'comment': 'كيف',
  'tu': 'أنت',
  'je': 'أنا',
  'école': 'مدرسة',
  'jouer': 'يلعب',
};

const ITALIAN_COMMON_WORD_GLOSSES: Record<string, string> = {
  'parlare': 'يتحدث',
  'parlo': 'أتحدث',
  'parli': 'تتحدث',
  'piccolo': 'صغير',
  'piccola': 'صغيرة',
  'ragazzo': 'ولد',
  'ragazza': 'بنت',
  'mangiare': 'يأكل',
  'mangio': 'آكل',
  'sono': 'أكون',
  'è': 'يكون',
  'siamo': 'نكون',
  'come': 'كيف',
  'ho': 'عندي',
  'hai': 'عندك',
  'ha': 'عنده',
  'abbiamo': 'عندنا',
  'puoi': 'يمكنك / تستطيع',
  'posso': 'أستطيع',
};

const PORTUGUESE_COMMON_WORD_GLOSSES: Record<string, string> = {
  'falar': 'يتحدث',
  'falo': 'أتحدث',
  'fala': 'يتحدث',
  'pequeno': 'صغير',
  'pequena': 'صغيرة',
  'o': 'الـ',
  'menino': 'ولد',
  'menina': 'بنت',
  'como': 'آكل / كيف',
  'sou': 'أكون',
  'é': 'يكون',
  'tem': 'عنده',
};

const TURKISH_COMMON_WORD_GLOSSES: Record<string, string> = {
  'öğreniyorum': 'أتعلم',
  'öğreniyoruz': 'نتعلم',
  'öğreniyor': 'يتعلم',
  'yiyoruz': 'نأكل',
  'yiyorum': 'آكل',
  'yiyor': 'يأكل',
  'yiyorsunuz': 'تأكلون',
  'yiyorlar': 'يأكلون',
  'istiyoruz': 'نريد',
  'istiyorsunuz': 'تريدون',
  'istiyorlar': 'يريدون',
  'istiyorsun': 'تريد',
  'istiyorum': 'أريد',
  'istiyor': 'يريد',
  'gidiyorum': 'أذهب',
  'gidiyoruz': 'نذهب',
  'gidiyor': 'يذهب',
  'geliyorum': 'آتي',
  'geliyoruz': 'نأتي',
  'geliyor': 'يأتي',
  'alıyorum': 'أشتري / آخذ',
  'alıyoruz': 'نشتري / نأخذ',
  'alıyor': 'يشتري',
  'bekliyoruz': 'ننتظر',
  'bekliyorum': 'أنتظر',
  'bekliyor': 'ينتظر',
  'yaşıyorum': 'أعيش',
  'yaşıyoruz': 'نعيش',
  'yaşıyor': 'يعيش',
  'çalışıyorum': 'أعمل',
  'çalışıyoruz': 'نعمل',
  'çalışıyor': 'يعمل',
  'seviyorum': 'أحب',
  'seviyoruz': 'نحب',
  'seviyor': 'يحب',
  'okuyorum': 'أقرأ',
  'okuyoruz': 'نقرأ',
  'yazıyorum': 'أكتب',
  'yazıyoruz': 'نكتب',
  'başlıyor': 'يبدأ',
  'bitiyor': 'ينتهي',
  'pişiriyor': 'يطبخ',
  'iş': 'عمل',
  'işe': 'إلى العمل',
  'istanbul': 'إسطنبول',
  'ankara': 'أنقرة',
  'türkiye': 'تركيا',
  'günaydın': 'صباح الخير',
  'nasılsın': 'كيف حالك',
  'nasılsın?': 'كيف حالك',
  'iyiyim': 'أنا بخير',
  'teşekkürler': 'شكراً',
  'ben': 'أنا',
  'bir': 'واحد',
  'kahve': 'قهوة',
  'lütfen': 'من فضلك',
  'çay': 'شاي',
  'su': 'ماء',
  'istanbul’a': 'إلى إسطنبول',
  'istanbula': 'إلى إسطنبول',
  'hoş': 'أهلاً',
  'geldiniz': 'جئتم',
  'çok': 'جداً',
  'teşekkür': 'شكر',
  'ederim': 'أفعل / أشكر',
  'rica': 'عفواً',
  'sağol': 'شكراً',
  'bu': 'هذا',
  'ne': 'ماذا',
  'kadar': 'قدر / كم',
  'kadar?': 'كم',
  'şunlar': 'تلك',
  'kaç': 'كم',
  'para': 'نقود',
  'neredesin': 'أين أنت',
  'şimdi': 'الآن',
  'şimdi?': 'الآن',
  'buradayım': 'أنا هنا',
  'nerede': 'أين',
  'evde': 'في البيت',
  'soğuk': 'بارد',
  'sıcak': 'ساخن',
  'yakında': 'قريباً',
  'görüşürüz': 'إلى اللقاء',
  'hoşça': 'مع السلامة',
  'kal': 'ابقى',
  'sonra': 'بعد',
  'ankara’da': 'في أنقرة',
  'ankarada': 'في أنقرة',
  'istanbul’da': 'في إسطنبول',
  'otobüs': 'حافلة',
  'durağı': 'موقف',
  'istasyon': 'محطة',
  'burada': 'هنا',
  'arabayla': 'بالسيارة',
  'otobüsle': 'بالحافلة',
  'yürüyerek': 'مشيًا',
  'iyi': 'جيد',
  'günler': 'أيام',
  'dilerim': 'أتمنى',
  'akşamlar': 'مساء',
  'geceler': 'ليالي',
  'benim': 'خاصتي',
  'sevgili': 'عزيزي',
  'arkadaşım': 'صديقي',
  'kardeşim': 'أخي',
  'dostum': 'صديقي',
  'ailem': 'عائلتي',
  'orada': 'هناك',
  'birlikte': 'معاً',
  'akşam': 'مساء',
  'yemeği': 'طعام',
  'öğle': 'ظهيرة',
  'kahvaltı': 'إفطار',
  'annem': 'أمي',
  'lezzetli': 'لذيذ',
  'yemek': 'طعام',
  'babama': 'لأبي',
  'güzel': 'جميل',
  'büyük': 'كبير',
  'ofiste': 'في المكتب',
  'küçük': 'صغير',
  'toplantımız': 'اجتماعنا',
  'saat': 'ساعة',
  'onda': 'في العاشرة',
  'dokuzda': 'في التاسعة',
  'yeni': 'جديد',
  'mesaj': 'رسالة',
  'mektup': 'رسالة',
  'sabah': 'صباح',
  'öğlen': 'ظهيرة',
  'restoran': 'مطعم',
  'harika': 'رائع',
  'kötü': 'سيء',
  'iki': 'اثنان',
  'kişilik': 'لأشخاص',
  'masa': 'طاولة',
  'üç': 'ثلاثة',
  'sandalye': 'كرسي',
  'hesap': 'حساب',
  'nakit': 'نقداً',
  'kart': 'بطاقة',
  'türk': 'تركي',
  'çayı': 'شاي',
  'kahvesi': 'قهوة',
  'atkı': 'وشاح',
  'kazak': 'سترة',
  'pantolon': 'بنطال',
  'ödemek': 'يدفع',
  'kartla': 'بالبطاقة',
  'mağaza': 'متجر',
  'kalabalık': 'مزدحم',
  'boş': 'فارغ',
  'görkemli': 'فخم',
  'fiyat': 'سعر',
  'uygun': 'مناسب',
  'pahalı': 'غالٍ',
  'ucuz': 'رخيص',
  'okula': 'إلى المدرسة',
  'eve': 'إلى البيت',
  'kitap': 'كتاب',
  'okulda': 'في المدرسة',
  'fırından': 'من المخبز',
  'ekmek': 'خبز',
  'marketten': 'من المتجر',
  'otobüsü': 'الحافلة',
  'treni': 'القطار',
  'taksiyi': 'التكسي',
  'geçen': 'الماضي',
  'hafta': 'أسبوع',
  'gittim': 'ذهبت',
  'ay': 'شهر',
  'geldim': 'جئت',
  'dün': 'أمس',
  'yedik': 'أكلنا',
  'içtik': 'شربنا',
  'bugün': 'اليوم',
  'çünkü': 'لأن',
  'türkçe': 'اللغة التركية',
  'anladığını': 'أنك تفهم',
  'biliyorum': 'أعلم',
  'gördüğünü': 'أنك رأيت',
  'duyduğumu': 'أنني سمعت',
  'evet': 'نعم',
  'hayır': 'لا',
  'sen': 'أنت',
  'biz': 'نحن',
  'siz': 'أنتم',
  'onlar': 'هم',
  'ev': 'منزل',
  'okul': 'مدرسة',
  'için': 'لأجل / لـ',
  've': 'و',
  'var': 'يوجد',
  'yok': 'لا يوجد',
};

const JAPANESE_COMMON_WORD_GLOSSES: Record<string, string> = {
  'は': 'أداة المبتدأ',
  'が': 'أداة الفاعل',
  'を': 'أداة المفعول',
  'に': 'إلى / في',
  'で': 'في / بواسطة',
  'と': 'مع / و',
  'も': 'أيضاً',
  'の': 'الملكية',
  'か': 'سؤال',
  'あなた': 'أنت',
  '食べる': 'يأكل',
  '飲む': 'يشرب',
  '行きます': 'يذهب',
  '水': 'ماء',
  '今日': 'اليوم',
};

// Populate from ARAB_TOP_5_LEXICON
for (const entry of ARAB_TOP_5_LEXICON) {
  if (entry.targetWord && entry.arabicMeaning) {
    const key = entry.targetWord.toLowerCase().trim();
    if (entry.lang === 'en' && !ENGLISH_COMMON_WORD_GLOSSES[key]) {
      ENGLISH_COMMON_WORD_GLOSSES[key] = entry.arabicMeaning;
    } else if (entry.lang === 'de' && !GERMAN_COMMON_WORD_GLOSSES[key]) {
      GERMAN_COMMON_WORD_GLOSSES[key] = entry.arabicMeaning;
    } else if (entry.lang === 'es' && !SPANISH_COMMON_WORD_GLOSSES[key]) {
      SPANISH_COMMON_WORD_GLOSSES[key] = entry.arabicMeaning;
    } else if (entry.lang === 'fr' && !FRENCH_COMMON_WORD_GLOSSES[key]) {
      FRENCH_COMMON_WORD_GLOSSES[key] = entry.arabicMeaning;
    } else if (entry.lang === 'tr' && !TURKISH_COMMON_WORD_GLOSSES[key]) {
      TURKISH_COMMON_WORD_GLOSSES[key] = entry.arabicMeaning;
    }
  }
}

// Build additional GERMAN_COMMON_WORD_GLOSSES entries from GERMAN_BRIDGE_LEXICON dynamically
for (const entry of GERMAN_BRIDGE_LEXICON) {
  if (entry.de && entry.ar) {
    const key = entry.de.toLowerCase().trim();
    if (!GERMAN_COMMON_WORD_GLOSSES[key]) {
      GERMAN_COMMON_WORD_GLOSSES[key] = entry.ar;
    }
  }
}

// Auto-swap ENGLISH_COMMON_WORD_GLOSSES -> ARABIC_COMMON_WORD_GLOSSES
for (const [enKey, arVal] of Object.entries(ENGLISH_COMMON_WORD_GLOSSES)) {
  const normAr = stripTashkeelAndPunctuation(arVal);
  if (normAr && !ARABIC_COMMON_WORD_GLOSSES[normAr]) {
    ARABIC_COMMON_WORD_GLOSSES[normAr] = enKey;
  }
}

// Build normalized key lookups for all common word glosses dynamically
for (const glossTable of [
  GERMAN_COMMON_WORD_GLOSSES,
  TURKISH_COMMON_WORD_GLOSSES,
  SPANISH_COMMON_WORD_GLOSSES,
  FRENCH_COMMON_WORD_GLOSSES,
  ITALIAN_COMMON_WORD_GLOSSES,
  PORTUGUESE_COMMON_WORD_GLOSSES,
  ARABIC_COMMON_WORD_GLOSSES
]) {
  const extraKeys: Record<string, string> = {};
  for (const [key, val] of Object.entries(glossTable)) {
    const normKey = stripTashkeelAndPunctuation(key);
    if (normKey && !glossTable[normKey]) {
      extraKeys[normKey] = val;
    }
  }
  Object.assign(glossTable, extraKeys);
}

const dictLookupIndexCache: Record<
  string,
  { len: number; wordMap: Map<string, any>; partMap: Map<string, any> }
> = {};

function getDictLookupMaps(
  targetLang: string,
  dict: any[]
): { wordMap: Map<string, any>; partMap: Map<string, any> } {
  const cached = dictLookupIndexCache[targetLang];
  if (cached && cached.len === dict.length) {
    return { wordMap: cached.wordMap, partMap: cached.partMap };
  }
  const wordMap = new Map<string, any>();
  const partMap = new Map<string, any>();
  for (const entry of dict) {
    const entryWord = stripTashkeelAndPunctuation(entry.word || entry.term || entry.germanWord || '');
    const entryEn = stripTashkeelAndPunctuation(entry.englishTranslation || '');
    const entryTrans = (entry.translation || entry.arabicWord || '').toLowerCase();
    if (entryWord && !wordMap.has(entryWord)) {
      wordMap.set(entryWord, entry);
    }
    if (entryEn && !wordMap.has(entryEn)) {
      wordMap.set(entryEn, entry);
    }
    for (const part of entryEn.split(/[\s,;/]+/)) {
      const p = stripTashkeelAndPunctuation(part);
      if (p && !partMap.has(p)) partMap.set(p, entry);
    }
    for (const part of entryWord.split(/[\s,;/]+/)) {
      const p = stripTashkeelAndPunctuation(part);
      if (p && !partMap.has(p)) partMap.set(p, entry);
    }
    for (const part of entryTrans.split(/[\s,;/]+/)) {
      const p = stripTashkeelAndPunctuation(part);
      if (p && !partMap.has(p)) partMap.set(p, entry);
    }
  }
  dictLookupIndexCache[targetLang] = { len: dict.length, wordMap, partMap };
  return { wordMap, partMap };
}

const WIKTIONARY_GLOSS_LEAK_REGEX =
  /\b(verbal noun of|plural of|inflection of|diminutive of|alternative form of|alternative spelling of|apocopic form of|past participle of|present participle of|first-person singular|second-person singular|third-person singular|feminine singular of|masculine singular of)\b/i;

export function sanitizeGloss(rawGloss: string): string {
  if (!rawGloss) return '';
  let cleaned = rawGloss.trim();
  if (cleaned.includes(';')) {
    cleaned = cleaned.split(';')[0].trim();
  }
  if (/name of the/i.test(cleaned)) {
    cleaned = cleaned.replace(/name of the.*/i, '').trim();
  }
  if (WIKTIONARY_GLOSS_LEAK_REGEX.test(cleaned)) {
    return '';
  }
  cleaned = cleaned.replace(/\s*\([^)]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '').trim();
  if (cleaned.includes(',') && (cleaned.length > 20 || cleaned.split(/\s+/).length > 3)) {
    cleaned = cleaned.split(',')[0].trim();
  }
  cleaned = cleaned.replace(/^['"“`’]+|['"”`’]+$/g, '').trim();

  if (cleaned.length > 24) {
    const words = cleaned.split(/\s+/);
    if (words.length > 1) {
      let short = '';
      for (const w of words) {
        if ((short + ' ' + w).trim().length <= 24) {
          short = (short + ' ' + w).trim();
        } else break;
      }
      cleaned = short || words[0].slice(0, 24);
    } else {
      cleaned = cleaned.slice(0, 24);
    }
  }
  return cleaned;
}

function isArabicSourceLanguage(sourceLang: string): boolean {
  return (
    sourceLang === 'ar' ||
    sourceLang === 'arz' ||
    sourceLang === 'apc' ||
    sourceLang === 'afb' ||
    sourceLang === 'ary' ||
    String(sourceLang).startsWith('ar')
  );
}

function isValidGloss(candidate: string, word: string, targetLang: string, sourceLang: string): boolean {
  if (!candidate || WIKTIONARY_GLOSS_LEAK_REGEX.test(candidate)) return false;
  const sanitized = sanitizeGloss(candidate);
  if (!sanitized || WIKTIONARY_GLOSS_LEAK_REGEX.test(sanitized)) return false;

  const cleanWord = stripTashkeelAndPunctuation(word);
  const cleanGloss = stripTashkeelAndPunctuation(sanitized);

  // 1. Self-referential check (word -> word)
  if (sanitized.toLowerCase() === word.toLowerCase() || cleanGloss === cleanWord) {
    return false;
  }

  // 2. Strict language scoping checks
  if (isArabicSourceLanguage(sourceLang) && targetLang !== 'ar') {
    if (!/[\u0600-\u06FF]/.test(sanitized)) return false;
    if (/[A-Za-z]{3,}/.test(sanitized)) return false;
    if (targetLang === 'de' && cleanWord === 'an' && sanitized.includes('واحد')) return false;
  }

  if (sourceLang === 'en' && targetLang === 'ar') {
    if (!/[A-Za-z]/.test(sanitized)) return false;
  }

  return true;
}

export function getGlossForWord(
  word: string,
  chunks: ChunkMapping[] = [],
  targetLang: string = 'en',
  sourceLang: string = 'ar'
): string {
  if (!word) return '';
  const rawWord = word.replace(/^[()（）\[\]{}.,!?،؛:()"¿¡’‘`\s]+|[()（）\[\]{}.,!?،؛:()"¿¡’‘`\s]+$/g, '').trim();
  const clean = stripTashkeelAndPunctuation(word);
  if (!clean) return '';

  const isSourceEnglish = sourceLang === 'en' || sourceLang.startsWith('en');

  // Priority 1: Exact match in exercise.breakdownChunks
  if (chunks && chunks.length > 0) {
    const exactChunk = chunks.find((c) => {
      const srcMatch = stripTashkeelAndPunctuation(c.arabicText || c.sourceText || '') === clean;
      const tgtMatch = stripTashkeelAndPunctuation(c.englishText || c.targetText || '') === clean;
      return srcMatch || tgtMatch;
    });

    if (exactChunk) {
      const candidate = isSourceEnglish
        ? exactChunk.englishText || exactChunk.sourceText || ''
        : (exactChunk.sourceText && /[\u0600-\u06FF]/.test(exactChunk.sourceText)
            ? exactChunk.sourceText
            : exactChunk.arabicText || exactChunk.sourceText || '');
      if (isValidGloss(candidate, word, targetLang, sourceLang)) {
        return sanitizeGloss(candidate);
      }
    }
    // Do NOT match multi-word partial chunks for single function words!
  }

  // Priority 2: Scoped common word glosses
  if (isSourceEnglish && targetLang === 'ar') {
    const commonCandidate = ARABIC_COMMON_WORD_GLOSSES[rawWord] || ARABIC_COMMON_WORD_GLOSSES[clean];
    if (commonCandidate && isValidGloss(commonCandidate, word, targetLang, sourceLang)) {
      return sanitizeGloss(commonCandidate);
    }
    const foundEg = Object.entries(EGYPTIAN_WORD_GLOSSES).find(([ar]) => stripTashkeelAndPunctuation(ar) === clean);
    if (foundEg && isValidGloss(foundEg[1], word, targetLang, sourceLang)) {
      return sanitizeGloss(foundEg[1]);
    }

    // Stemming for Arabic prefixes / suffixes
    const arStems: string[] = [clean];
    if (clean.endsWith('ا') && clean.length >= 4) arStems.push(clean.slice(0, -1));
    if ((clean.startsWith('ل') || clean.startsWith('ب') || clean.startsWith('ف') || clean.startsWith('و') || clean.startsWith('ك')) && clean.length >= 5) {
      const noPrefix = clean.slice(1);
      arStems.push(noPrefix);
      if (noPrefix.endsWith('ي')) arStems.push(noPrefix.slice(0, -1));
      if (noPrefix.endsWith('ك')) arStems.push(noPrefix.slice(0, -1));
      if (noPrefix.endsWith('ه')) arStems.push(noPrefix.slice(0, -1));
      if (noPrefix.endsWith('ها')) arStems.push(noPrefix.slice(0, -2));
      if (noPrefix.endsWith('نا')) arStems.push(noPrefix.slice(0, -2));
      if (noPrefix.endsWith('كم')) arStems.push(noPrefix.slice(0, -2));
      if (noPrefix.endsWith('هم')) arStems.push(noPrefix.slice(0, -2));
    }
    if (clean.startsWith('لق') && clean.length >= 4) arStems.push(clean.slice(1), clean.slice(2));
    if (clean.endsWith('ناه') && clean.length >= 5) arStems.push(clean.slice(0, -1));
    if (clean.endsWith('ناها') && clean.length >= 5) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('ناهم') && clean.length >= 5) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('ناكم') && clean.length >= 5) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('ت') && clean.length >= 4) arStems.push(clean.slice(0, -1));
    if (clean.endsWith('ته') && clean.length >= 5) arStems.push(clean.slice(0, -2) + 'ت', clean.slice(0, -2));
    if (clean.endsWith('تها') && clean.length >= 5) arStems.push(clean.slice(0, -3) + 'ت', clean.slice(0, -3));
    if (clean.endsWith('ي') && clean.length >= 3) arStems.push(clean.slice(0, -1));
    if (clean.endsWith('هم') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('كم') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.startsWith('وسأ') && clean.length >= 5) arStems.push(clean.slice(3));
    if (clean.startsWith('وسا') && clean.length >= 5) arStems.push(clean.slice(3));
    if (clean.startsWith('وس') && clean.length >= 5) arStems.push(clean.slice(2));
    if (clean.startsWith('سأ') && clean.length >= 4) arStems.push(clean.slice(2));
    if (clean.startsWith('سا') && clean.length >= 4) arStems.push(clean.slice(2));
    if (clean.startsWith('س') && clean.length >= 4) arStems.push(clean.slice(1));
    if (clean.endsWith('وك') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('يك') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('اك') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('وه') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('يه') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.startsWith('تت') && clean.length >= 4) arStems.push('يت' + clean.slice(2), clean.slice(2));
    if (clean.startsWith('أت') && clean.length >= 4) arStems.push('يت' + clean.slice(2), clean.slice(2));
    if (clean.startsWith('نت') && clean.length >= 4) arStems.push('يت' + clean.slice(2), clean.slice(2));
    if (clean.startsWith('يت') && clean.length >= 4) arStems.push(clean.slice(2));
    if (clean.startsWith('ك') && clean.length >= 4) arStems.push(clean.slice(1));
    if (clean.startsWith('ب') && clean.length >= 4) arStems.push(clean.slice(1));
    if (clean.startsWith('ف') && clean.length >= 4) arStems.push(clean.slice(1));
    if (clean.startsWith('و') && clean.length >= 3) arStems.push(clean.slice(1));
    if (clean.startsWith('ل') && clean.length >= 4) arStems.push(clean.slice(1));
    if (clean.startsWith('بال') && clean.length >= 5) arStems.push(clean.slice(3));
    if (clean.startsWith('كال') && clean.length >= 5) arStems.push(clean.slice(3));
    if (clean.endsWith('ه') && clean.length >= 4) arStems.push(clean.slice(0, -1));
    if (clean.endsWith('ية') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('يه') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('ون') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('ين') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('وا') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('ات') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('ان') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.startsWith('ت') && clean.endsWith('ين') && clean.length >= 4) arStems.push(clean.slice(1, -2));
    if (clean.startsWith('ي') && clean.endsWith('ون') && clean.length >= 4) arStems.push(clean.slice(1, -2));
    if (clean.startsWith('ت') && clean.endsWith('ون') && clean.length >= 4) arStems.push(clean.slice(1, -2));
    if (clean.startsWith('ت') && clean.endsWith('ني') && clean.length >= 4) arStems.push(clean.slice(1, -2));
    if (clean.startsWith('ي') && clean.endsWith('ني') && clean.length >= 4) arStems.push(clean.slice(1, -2));
    if (clean.startsWith('ت') && clean.endsWith('نا') && clean.length >= 4) arStems.push(clean.slice(1, -2));
    if (clean.startsWith('ي') && clean.endsWith('نا') && clean.length >= 4) arStems.push(clean.slice(1, -2));
    if (clean.startsWith('ن') && clean.length >= 4) arStems.push(clean.slice(1));
    if (clean.startsWith('ي') && clean.length >= 4) arStems.push(clean.slice(1));
    if (clean.startsWith('ت') && clean.length >= 4) arStems.push(clean.slice(1));
    if (clean.startsWith('ال') && clean.length >= 4) arStems.push(clean.slice(2));
    if (clean.endsWith('ني') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('نا') && clean.length >= 4) arStems.push(clean.slice(0, -2));
    if (clean.endsWith('ك') && clean.length >= 3) arStems.push(clean.slice(0, -1));
    if (clean.endsWith('ها') && clean.length >= 4) arStems.push(clean.slice(0, -2));

    for (const stem of [...arStems]) {
      if (stem.endsWith('ت') && stem.length >= 3) {
        arStems.push(stem.slice(0, -1) + 'ه', stem.slice(0, -1) + 'ة');
      }
    }

    for (const stem of arStems) {
      const stemGloss = ARABIC_COMMON_WORD_GLOSSES[stem];
      if (stemGloss && isValidGloss(stemGloss, word, targetLang, sourceLang)) {
        return sanitizeGloss(stemGloss);
      }
      const foundEgStem = Object.entries(EGYPTIAN_WORD_GLOSSES).find(([ar]) => stripTashkeelAndPunctuation(ar) === stem);
      if (foundEgStem && isValidGloss(foundEgStem[1], word, targetLang, sourceLang)) {
        return sanitizeGloss(foundEgStem[1]);
      }
    }
  } else if (targetLang === 'en') {
    const commonCandidate = ENGLISH_COMMON_WORD_GLOSSES[rawWord.toLowerCase()] || ENGLISH_COMMON_WORD_GLOSSES[clean];
    if (commonCandidate && isValidGloss(commonCandidate, word, targetLang, sourceLang)) {
      return sanitizeGloss(commonCandidate);
    }

    // Egyptian lexicon reverse lookup by English value
    const foundEgValue = Object.entries(EGYPTIAN_WORD_GLOSSES).find(([, en]) => {
      const normEn = stripTashkeelAndPunctuation(en);
      if (normEn === clean) return true;
      return normEn.split(/[\s,;/]+/).includes(clean);
    });
    if (foundEgValue && isValidGloss(foundEgValue[0], word, targetLang, sourceLang)) {
      return sanitizeGloss(foundEgValue[0]);
    }

    // Stemming fallback for English verbs/nouns (e.g. wakes -> wake, working -> work)
    const candidateStems: string[] = [];
    if (clean.endsWith('ten') && clean.length > 5) candidateStems.push(clean.slice(0, -3) + 't', clean.slice(0, -3));
    if (clean.endsWith('en') && clean.length > 4) candidateStems.push(clean.slice(0, -2), clean.slice(0, -2) + 'e', clean.slice(0, -1));
    if (clean.endsWith('ies') && clean.length > 4) candidateStems.push(clean.slice(0, -3) + 'y');
    if (clean.endsWith('es') && clean.length > 4) candidateStems.push(clean.slice(0, -2));
    if (clean.endsWith('s') && clean.length > 3) candidateStems.push(clean.slice(0, -1));
    if (clean.endsWith('ing') && clean.length > 5) candidateStems.push(clean.slice(0, -3), clean.slice(0, -3) + 'e');
    if (clean.endsWith('ed') && clean.length > 4) candidateStems.push(clean.slice(0, -2), clean.slice(0, -1));

    for (const stem of candidateStems) {
      const stemGloss = ENGLISH_COMMON_WORD_GLOSSES[stem];
      if (stemGloss && isValidGloss(stemGloss, word, targetLang, sourceLang)) {
        return sanitizeGloss(stemGloss);
      }
    }
  } else if (targetLang === 'de') {
    const commonCandidate = GERMAN_COMMON_WORD_GLOSSES[rawWord.toLowerCase()] || GERMAN_COMMON_WORD_GLOSSES[clean];
    if (commonCandidate && isValidGloss(commonCandidate, word, targetLang, sourceLang)) {
      return sanitizeGloss(commonCandidate);
    }
    const deStems: string[] = [clean];
    if (clean.startsWith('mein')) deStems.push('mein');
    if (clean.startsWith('dein')) deStems.push('dein');
    if (clean.startsWith('sein')) deStems.push('sein');
    if (clean.startsWith('unser')) deStems.push('unser');
    if (clean.startsWith('euer')) deStems.push('euer');
    if (clean.endsWith('test') && clean.length > 5) deStems.push(clean.slice(0, -4) + 'en', clean.slice(0, -2) + 'en');
    if (clean.endsWith('tet') && clean.length > 5) deStems.push(clean.slice(0, -3) + 'en', clean.slice(0, -2) + 'en');
    if (clean.endsWith('st') && clean.length > 4) deStems.push(clean.slice(0, -2) + 'en', clean.slice(0, -2));
    if (clean.endsWith('te') && clean.length > 4) deStems.push(clean.slice(0, -2) + 'en', clean.slice(0, -2));
    if (clean.endsWith('t') && clean.length > 3) deStems.push(clean.slice(0, -1) + 'en', clean.slice(0, -1));
    if (clean.endsWith('e') && clean.length > 3) deStems.push(clean + 'n', clean.slice(0, -1));
    if (clean.endsWith('en') && clean.length > 4) deStems.push(clean.slice(0, -2));
    if (clean.endsWith('er') && clean.length > 4) deStems.push(clean.slice(0, -2));
    if (clean.endsWith('es') && clean.length > 4) deStems.push(clean.slice(0, -2));
    if (clean.endsWith('em') && clean.length > 4) deStems.push(clean.slice(0, -2));
    for (const stem of deStems) {
      const stemGloss = GERMAN_COMMON_WORD_GLOSSES[stem];
      if (stemGloss && isValidGloss(stemGloss, word, targetLang, sourceLang)) {
        return sanitizeGloss(stemGloss);
      }
    }
  } else if (targetLang === 'tr') {
    const commonCandidate = TURKISH_COMMON_WORD_GLOSSES[rawWord.toLowerCase()] || TURKISH_COMMON_WORD_GLOSSES[clean];
    if (commonCandidate && isValidGloss(commonCandidate, word, targetLang, sourceLang)) {
      return sanitizeGloss(commonCandidate);
    }
    const trStems: string[] = [clean];
    if (clean.includes("'")) trStems.push(clean.split("'")[0]);
    if (clean.includes("’")) trStems.push(clean.split("’")[0]);
    if (clean.endsWith('iyorum') || clean.endsWith('iyoruz') || clean.endsWith('iyor') || clean.endsWith('iyorsun')) {
      trStems.push(clean.replace(/iyorum|iyoruz|iyor|iyorsun/, ''));
    }
    if (clean.endsWith('yiyorum') || clean.endsWith('yiyoruz') || clean.endsWith('yiyor')) {
      trStems.push(clean.replace(/yiyorum|yiyoruz|yiyor/, ''));
    }
    if (clean.endsWith('arım') || clean.endsWith('erim') || clean.endsWith('arsın') || clean.endsWith('ersin')) {
      trStems.push(clean.replace(/arım|erim|arsın|ersin/, ''));
    }
    if (clean.endsWith('e') || clean.endsWith('a')) trStems.push(clean.slice(0, -1));
    if (clean.endsWith('de') || clean.endsWith('da') || clean.endsWith('te') || clean.endsWith('ta')) trStems.push(clean.slice(0, -2));
    if (clean.endsWith('den') || clean.endsWith('dan') || clean.endsWith('ten') || clean.endsWith('tan')) trStems.push(clean.slice(0, -3));
    if (clean.endsWith('im') || clean.endsWith('ım') || clean.endsWith('üm') || clean.endsWith('um')) trStems.push(clean.slice(0, -2));
    if (clean.endsWith('in') || clean.endsWith('ın') || clean.endsWith('ün') || clean.endsWith('un')) trStems.push(clean.slice(0, -2));

    for (const stem of trStems) {
      const stemGloss = TURKISH_COMMON_WORD_GLOSSES[stem];
      if (stemGloss && isValidGloss(stemGloss, word, targetLang, sourceLang)) {
        return sanitizeGloss(stemGloss);
      }
    }
  } else if (targetLang === 'es') {
    const commonCandidate = SPANISH_COMMON_WORD_GLOSSES[rawWord.toLowerCase()] || SPANISH_COMMON_WORD_GLOSSES[clean];
    if (commonCandidate && isValidGloss(commonCandidate, word, targetLang, sourceLang)) {
      return sanitizeGloss(commonCandidate);
    }
  } else if (targetLang === 'fr') {
    const commonCandidate = FRENCH_COMMON_WORD_GLOSSES[rawWord.toLowerCase()] || FRENCH_COMMON_WORD_GLOSSES[clean];
    if (commonCandidate && isValidGloss(commonCandidate, word, targetLang, sourceLang)) {
      return sanitizeGloss(commonCandidate);
    }
  } else if (targetLang === 'it') {
    const commonCandidate = ITALIAN_COMMON_WORD_GLOSSES[rawWord.toLowerCase()] || ITALIAN_COMMON_WORD_GLOSSES[clean];
    if (commonCandidate && isValidGloss(commonCandidate, word, targetLang, sourceLang)) {
      return sanitizeGloss(commonCandidate);
    }
  } else if (targetLang === 'pt') {
    const commonCandidate = PORTUGUESE_COMMON_WORD_GLOSSES[rawWord.toLowerCase()] || PORTUGUESE_COMMON_WORD_GLOSSES[clean];
    if (commonCandidate && isValidGloss(commonCandidate, word, targetLang, sourceLang)) {
      return sanitizeGloss(commonCandidate);
    }
  } else if (targetLang === 'ja') {
    const commonCandidate = JAPANESE_COMMON_WORD_GLOSSES[rawWord] || JAPANESE_COMMON_WORD_GLOSSES[clean];
    if (commonCandidate && isValidGloss(commonCandidate, word, targetLang, sourceLang)) {
      return sanitizeGloss(commonCandidate);
    }
  }

  // Priority 3: Target dictionary matching
  try {
    const dict = getTargetDictionary(targetLang);
    if (dict && dict.length > 0) {
      const candidateStems: string[] = [clean];
      if (targetLang === 'en') {
        if (clean.endsWith('ten') && clean.length > 5) candidateStems.push(clean.slice(0, -3) + 't', clean.slice(0, -3));
        if (clean.endsWith('en') && clean.length > 4) candidateStems.push(clean.slice(0, -2), clean.slice(0, -2) + 'e', clean.slice(0, -1));
        if (clean.endsWith('ies') && clean.length > 4) candidateStems.push(clean.slice(0, -3) + 'y');
        if (clean.endsWith('es') && clean.length > 4) candidateStems.push(clean.slice(0, -2));
        if (clean.endsWith('s') && clean.length > 3) candidateStems.push(clean.slice(0, -1));
        if (clean.endsWith('ing') && clean.length > 5) candidateStems.push(clean.slice(0, -3), clean.slice(0, -3) + 'e');
        if (clean.endsWith('ed') && clean.length > 4) candidateStems.push(clean.slice(0, -2), clean.slice(0, -1));
      }

      const { wordMap, partMap } = getDictLookupMaps(targetLang, dict);
      let matchedEntry: any = null;
      for (const targetQuery of candidateStems) {
        matchedEntry = wordMap.get(targetQuery) || partMap.get(targetQuery) || null;
        if (matchedEntry) break;
      }

      // Stemming / prefix stripping for Arabic prefixes/suffixes if exact match not found
      if (!matchedEntry && clean.length >= 3) {
        const arStems: string[] = [];
        if (clean.startsWith('ال') && clean.length >= 4) arStems.push(clean.slice(2));
        if (clean.endsWith('ها') && clean.length >= 3) arStems.push(clean.slice(0, -2));
        if (clean.endsWith('ان') && clean.length >= 4) arStems.push(clean.slice(0, -2));

        for (const stem of arStems) {
          matchedEntry = wordMap.get(stem) || null;
          if (matchedEntry) break;
        }
      }

      if (matchedEntry) {
        const hasArabicWord = /[\u0600-\u06FF]/.test(matchedEntry.word || '');
        const candidate = isSourceEnglish
          ? matchedEntry.englishTranslation || matchedEntry.word || matchedEntry.term || ''
          : (targetLang === 'en' && hasArabicWord)
            ? matchedEntry.word
            : matchedEntry.arabicWord || matchedEntry.translation || matchedEntry.arabicTranslation || matchedEntry.word || '';

        if (isValidGloss(candidate, word, targetLang, sourceLang)) {
          return sanitizeGloss(candidate);
        }
      }
    }
  } catch {}

  // Priority 4: Chunk containment fallback as last resort for exercise context
  if (chunks && chunks.length > 0) {
    const containingChunk = chunks.find((c) => {
      const enText = stripTashkeelAndPunctuation(c.englishText || c.targetText || '');
      const arText = stripTashkeelAndPunctuation(c.arabicText || c.sourceText || '');
      return enText.split(/[\s,;/]+/).includes(clean) || arText.split(/[\s,;/]+/).includes(clean);
    });

    if (containingChunk) {
      const candidate = isSourceEnglish
        ? containingChunk.englishText || containingChunk.sourceText || ''
        : (containingChunk.sourceText && /[\u0600-\u06FF]/.test(containingChunk.sourceText)
            ? containingChunk.sourceText
            : containingChunk.arabicText || containingChunk.sourceText || '');
      if (isValidGloss(candidate, word, targetLang, sourceLang)) {
        return sanitizeGloss(candidate);
      }
    }
  }

  // Priority 5: Multi-word phrase chip fallback (e.g. "ai joué" -> combined glosses)
  if (clean.includes(' ')) {
    const wordParts = clean.split(/\s+/).filter(Boolean);
    const subGlosses = wordParts
      .map((p) => getGlossForWord(p, chunks, targetLang, sourceLang))
      .filter((g) => isValidGloss(g, word, targetLang, sourceLang));
    if (subGlosses.length > 0) {
      return sanitizeGloss(subGlosses.join(' '));
    }
  }

  return '';
}
