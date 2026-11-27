// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import type { ExerciseItem, LessonNode } from '../progression/types';
import type { TargetLanguage } from '../types';

export interface TravelSprintDay {
  day: number; // 1..21
  week: 1 | 2 | 3;
  icon: string;
  titleAr: string;
  titleEn: string;
  focusAr: string;
  focusEn: string;
  estimatedMinutes: number;
  isBossDay?: boolean;
  phrases: Record<'en' | 'de' | 'es' | 'it' | 'fr' | 'ar', Array<{
    promptAr: string;
    promptEn: string;
    target: string;
    tipAr: string;
    tipEn: string;
  }>>;
}

interface DayBlueprint {
  day: number;
  week: 1 | 2 | 3;
  icon: string;
  titleAr: string;
  titleEn: string;
  focusAr: string;
  focusEn: string;
  isBossDay?: boolean;
  en: [string, string, string, string];
  arPrompts: [string, string, string, string];
  de: [string, string, string, string];
  es: [string, string, string, string];
  it: [string, string, string, string];
  fr: [string, string, string, string];
  arTargets: [string, string, string, string];
}

const TRAVEL_DAY_BLUEPRINTS: DayBlueprint[] = [
  // ================= WEEK 1: SURVIVAL ESSENTIALS (DAYS 1-7) =================
  {
    day: 1,
    week: 1,
    icon: '🛫',
    titleAr: 'المطار وبوابة الصعود',
    titleEn: 'Airport & Boarding Gate',
    focusAr: 'تسجيل الأمتعة، بطاقة الصعود، وبوابة الطائرة',
    focusEn: 'Check-in, boarding pass, and finding your gate',
    arPrompts: ['أين بوابة الصعود رقم 12؟', 'أريد مقعداً بجانب النافذة من فضلك.', 'هل الرحلة في موعدها؟', 'هذه حقيبتي الوحيدة.'],
    en: ['Where is boarding gate twelve?', 'I would like a window seat, please.', 'Is the flight on time?', 'This is my only bag.'],
    de: ['Wo ist das Boarding-Gate zwölf?', 'Ich hätte gern einen Fensterplatz, bitte.', 'Ist der Flug pünktlich?', 'Das ist mein einziges Gepäckstück.'],
    es: ['¿Dónde está la puerta de embarque doce?', 'Quisiera un asiento junto a la ventana, por favor.', '¿El vuelo sale a tiempo?', 'Esta es mi única maleta.'],
    it: ['Dov è il gate d imbarco dodici?', 'Vorrei un posto vicino al finestrino, per favore.', 'Il volo è in orario?', 'Questa è la mia unica valigia.'],
    fr: ['Où est la porte d embarquement douze ?', 'Je voudrais un siège côté fenêtre, s il vous plaît.', 'Est-ce que le vol est à l heure ?', 'C est mon seul bagage.'],
    arTargets: ['فين بوابة الصعود رقم ١٢؟', 'عايز كرسي جنب الشباك لو سمحت.', 'هل الطيارة في ميعادها؟', 'دي شنطتي الوحيدة.'],
  },
  {
    day: 2,
    week: 1,
    icon: '🛂',
    titleAr: 'الجوازات والجمارك',
    titleEn: 'Immigration & Customs',
    focusAr: 'غرض الزيارة، مدة الإقامة، وعنوان الفندق',
    focusEn: 'Purpose of visit, duration of stay, and hotel address',
    arPrompts: ['أنا هنا للسياحة لمدة أسبوع.', 'تفضل جواز سفري وتذكرة العودة.', 'سأقيم في هذا الفندق.', 'ليس لدي شيء للتصريح عنه.'],
    en: ['I am here for tourism for one week.', 'Here is my passport and return ticket.', 'I will stay at this hotel.', 'I have nothing to declare.'],
    de: ['Ich bin für eine Woche als Tourist hier.', 'Hier sind mein Reisepass und mein Rückflugticket.', 'Ich übernachte in diesem Hotel.', 'Ich habe nichts anzumelden.'],
    es: ['Estoy aquí de turismo por una semana.', 'Aquí tiene mi pasaporte y mi boleto de regreso.', 'Me hospedaré en este hotel.', 'No tengo nada que declarar.'],
    it: ['Sono qui per turismo per una settimana.', 'Ecco il mio passaporto e il biglietto di ritorno.', 'Alloggerò in questo hotel.', 'Non ho nulla da dichiarare.'],
    fr: ['Je suis ici pour le tourisme pendant une semaine.', 'Voici mon passeport et mon billet de retour.', 'Je vais séjourner dans cet hôtel.', 'Je n ai rien à déclarer.'],
    arTargets: ['أنا هنا للسياحة لمدة أسبوع.', 'اتفضل الباسبور وتذكرة الرجوع.', 'هقعد في الفندق ده.', 'ما عنديش حاجة أبلغ عنها.'],
  },
  {
    day: 3,
    week: 1,
    icon: '🚇',
    titleAr: 'التاكسي والمترو والمواصلات',
    titleEn: 'Taxis, Metro & Transit',
    focusAr: 'تذاكر المترو، المحطة الصحيحة، وتكلفة التاكسي',
    focusEn: 'Metro tickets, correct stops, and taxi fares',
    arPrompts: ['كم ثمن تذكرة المترو إلى وسط المدينة؟', 'من فضلك وصلني إلى هذا العنوان.', 'أي خط يذهب إلى المحطة المركزية؟', 'هل يمكنني الدفع بالبطاقة؟'],
    en: ['How much is a metro ticket to downtown?', 'Please take me to this address.', 'Which line goes to the central station?', 'Can I pay by card?'],
    de: ['Wie viel kostet ein U-Bahn-Ticket ins Zentrum?', 'Bitte bringen Sie mich zu dieser Adresse.', 'Welche Linie fährt zum Hauptbahnhof?', 'Kann ich mit Karte bezahlen?'],
    es: ['¿Cuánto cuesta un boleto de metro al centro?', 'Por favor, lléveme a esta dirección.', '¿Qué línea va a la estación central?', '¿Puedo pagar con tarjeta?'],
    it: ['Quanto costa un biglietto della metro per il centro?', 'Per favore, mi porti a questo indirizzo.', 'Quale linea va alla stazione centrale?', 'Posso pagare con la carta?'],
    fr: ['Combien coûte un ticket de métro pour le centre ?', 'S il vous plaît, emmenez-moi à cette adresse.', 'Quelle ligne va à la gare centrale ?', 'Puis-je payer par carte ?'],
    arTargets: ['بكام تذكرة المترو لوسط البلد؟', 'لو سمحت وصلني للعنوان ده.', 'أي خط بيروح المحطة الرئيسية؟', 'ينفع أدفع بالكارت؟'],
  },
  {
    day: 4,
    week: 1,
    icon: '🏨',
    titleAr: 'تسجيل الدخول في الفندق',
    titleEn: 'Hotel Check-In',
    focusAr: 'تأكيد الحجز، الواي فاي، وموعد الإفطار',
    focusEn: 'Reservation confirmation, Wi-Fi, and breakfast hours',
    arPrompts: ['لدي حجز باسم عمرو شريف.', 'ما هي كلمة سر الواي فاي؟', 'في أي ساعة يبدأ الإفطار؟', 'هل يمكنني تسجيل الخروج متأخراً؟'],
    en: ['I have a reservation under Amr Sherif.', 'What is the Wi-Fi password?', 'What time does breakfast start?', 'Can I request a late check-out?'],
    de: ['Ich habe eine Reservierung auf den Namen Amr Sherif.', 'Wie lautet das WLAN-Passwort?', 'Um wie viel Uhr beginnt das Frühstück?', 'Kann ich einen späten Check-out anfragen?'],
    es: ['Tengo una reserva a nombre de Amr Sherif.', '¿Cuál es la contraseña del wifi?', '¿A qué hora empieza el desayuno?', '¿Puedo pedir salida tardía?'],
    it: ['Ho una prenotazione a nome di Amr Sherif.', 'Qual è la password del Wi-Fi?', 'A che ora inizia la colazione?', 'Posso chiedere il check-out posticipato?'],
    fr: ['J ai une réservation au nom de Amr Sherif.', 'Quel est le mot de passe du Wi-Fi ?', 'À quelle heure commence le petit-déjeuner ?', 'Puis-je demander un départ tardif ?'],
    arTargets: ['عندي حجز باسم عمرو شريف.', 'إيه باسورد الواي فاي؟', 'الفطار بيبدأ الساعة كام؟', 'ممكن أعمل خروج متأخر؟'],
  },
  {
    day: 5,
    week: 1,
    icon: '☕',
    titleAr: 'الكافيهات وطلب القهوة',
    titleEn: 'Cafes & Ordering Coffee',
    focusAr: 'طلب المشروبات، السكر، والحساب بسرعة',
    focusEn: 'Ordering drinks, customizations, and the check',
    arPrompts: ['ممكن قهوة بدون سكر لو سمحت؟', 'هل لديكم مياه باردة؟', 'هل يمكنني الجلوس هنا؟', 'الحساب من فضلك.'],
    en: ['Can I have a coffee without sugar, please?', 'Do you have cold water?', 'May I sit here?', 'The check, please.'],
    de: ['Kann ich bitte einen Kaffee ohne Zucker haben?', 'Haben Sie kaltes Wasser?', 'Darf ich hier sitzen?', 'Die Rechnung, bitte.'],
    es: ['¿Me pone un café sin azúcar, por favor?', '¿Tienen agua fría?', '¿Puedo sentarme aquí?', 'La cuenta, por favor.'],
    it: ['Posso avere un caffè senza zucchero, per favore?', 'Avete acqua fredda?', 'Posso sedermi qui?', 'Il conto, per favore.'],
    fr: ['Puis-je avoir un café sans sucre, s il vous plaît ?', 'Avez-vous de l eau fraîche ?', 'Puis-je m asseoir ici ?', 'L addition, s il vous plaît.'],
    arTargets: ['ممكن قهوة من غير سكر لو سمحت؟', 'عندكم مية ساقعة؟', 'ممكن أقعد هنا؟', 'الحساب لو سمحت.'],
  },
  {
    day: 6,
    week: 1,
    icon: '🚨',
    titleAr: 'الطوارئ والصيدلية والطبيب',
    titleEn: 'Emergencies & Pharmacy',
    focusAr: 'طلب المساعدة الفورية، الصيدلية، وفقدان الأغراض',
    focusEn: 'Urgent help, pharmacy needs, and lost items',
    arPrompts: ['أحتاج إلى مساعدة فوراً من فضلك.', 'أين أقرب صيدلية؟', 'فقدت محفظتي في المحطة.', 'أشعر بصداع شديد.'],
    en: ['I need help right away, please.', 'Where is the nearest pharmacy?', 'I lost my wallet at the station.', 'I have a strong headache.'],
    de: ['Ich brauche bitte sofort Hilfe.', 'Wo ist die nächste Apotheke?', 'Ich habe mein Portemonnaie am Bahnhof verloren.', 'Ich habe starke Kopfschmerzen.'],
    es: ['Necesito ayuda de inmediato, por favor.', '¿Dónde está la farmacia más cercana?', 'Perdí mi cartera en la estación.', 'Tengo un fuerte dolor de cabeza.'],
    it: ['Ho bisogno di aiuto subito, per favore.', 'Dov è la farmacia più vicina?', 'Ho perso il portafoglio in stazione.', 'Ho un forte mal di testa.'],
    fr: ['J ai besoin d aide tout de suite, s il vous plaît.', 'Où est la pharmacie la plus proche ?', 'J ai perdu mon portefeuille à la gare.', 'J ai un fort mal de tête.'],
    arTargets: ['محتاج مساعدة فوراً لو سمحت.', 'فين أقرب صيدلية؟', 'محفظتي ضاعت في المحطة.', 'عندي صداع جامد.'],
  },
  {
    day: 7,
    week: 1,
    icon: '🤝',
    titleAr: 'ذوقيات الشارع وتحدي الأسبوع الأول',
    titleEn: 'Polite Essentials & Week 1 Check',
    focusAr: 'الاعتذار اللطيف، طلب الإعادة ببطء، والشكر',
    focusEn: 'Polite apologies, asking natives to slow down, gratitude',
    arPrompts: ['عفواً، هل يمكنك التحدث ببطء أكثر؟', 'أقدّر مساعدتك جداً.', 'أنا آسف على الإزعاج.', 'أتمنى لك يوماً سعيداً!'],
    en: ['Excuse me, could you speak a bit slower?', 'I really appreciate your help.', 'I am sorry to bother you.', 'Have a wonderful day!'],
    de: ['Entschuldigung, könnten Sie etwas langsamer sprechen?', 'Ich schätze Ihre Hilfe sehr.', 'Es tut mir leid, Sie zu stören.', 'Ich wünsche Ihnen einen schönen Tag!'],
    es: ['Disculpe, ¿podría hablar un poco más despacio?', 'Agradezco mucho su ayuda.', 'Siento molestarle.', '¡Que tenga un excelente día!'],
    it: ['Mi scusi, potrebbe parlare un po più lentamente?', 'Apprezzo molto il suo aiuto.', 'Mi dispiace disturbarla.', 'Le auguro una splendida giornata!'],
    fr: ['Excusez-moi, pourriez-vous parler un peu plus lentement ?', 'J apprécie vraiment votre aide.', 'Je suis désolé de vous déranger.', 'Passez une excellente journée !'],
    arTargets: ['لو سمحت، ممكن تتكلم أبطأ شوية؟', 'مقدر مساعدتك جداً.', 'آسف على الإزعاج.', 'يومك سعيد إن شاء الله!'],
  },

  // ================= WEEK 2: SOCIAL & CITY FLOW (DAYS 8-14) =================
  {
    day: 8,
    week: 2,
    icon: '👋',
    titleAr: 'تكوين صداقات جديدة',
    titleEn: 'Making Friends Abroad',
    focusAr: 'التعارف الودي، بلدك، وما الذي تحبه في المدينة',
    focusEn: 'Warm introductions, hometown, and what you love about the city',
    arPrompts: ['تشرفت بمعرفتك، أنا من مصر.', 'دي أول مرة أزور المدينة دي.', 'الناس هنا ودودين جداً.', 'تحب نتقابل على قهوة بكرة؟'],
    en: ['Nice to meet you, I am from Egypt.', 'This is my first time visiting this city.', 'People here are so welcoming.', 'Would you like to grab coffee tomorrow?'],
    de: ['Freut mich, ich komme aus Ägypten.', 'Ich besuche diese Stadt zum ersten Mal.', 'Die Menschen hier sind sehr herzlich.', 'Möchtest du morgen einen Kaffee trinken gehen?'],
    es: ['Mucho gusto, soy de Egipto.', 'Es la primera vez que visito esta ciudad.', 'La gente aquí es muy amable.', '¿Te gustaría tomar un café mañana?'],
    it: ['Piacere di conoscerti, vengo dall Egitto.', 'È la prima volta che visito questa città.', 'Le persone qui sono molto accoglienti.', 'Ti andrebbe di prendere un caffè domani?'],
    fr: ['Enchanté, je viens d Égypte.', 'C est la première fois que je visite cette ville.', 'Les gens ici sont très accueillants.', 'Tu veux prendre un café demain ?'],
    arTargets: ['تشرفت بمعرفتك، أنا من مصر.', 'دي أول مرة أزور المدينة دي.', 'الناس هنا لطاف جداً.', 'تحب نشرب قهوة بكرة؟'],
  },
  {
    day: 9,
    week: 2,
    icon: '💬',
    titleAr: 'الدردشة الخفيفة (Small Talk)',
    titleEn: 'Effortless Small Talk',
    focusAr: 'الطقس، عطلة نهاية الأسبوع، والهوايات اليومية',
    focusEn: 'Weather, weekend plans, and daily hobbies',
    arPrompts: ['الجو النهارده جميل جداً للمشي.', 'إيه خططك لعطلة نهاية الأسبوع؟', 'أنا بحب التصوير والسفر.', 'بقالك قد إيه عايش هنا؟'],
    en: ['The weather is great for a walk today.', 'What are your plans for the weekend?', 'I really enjoy photography and travel.', 'How long have you lived here?'],
    de: ['Das Wetter ist heute toll für einen Spaziergang.', 'Was hast du am Wochenende vor?', 'Ich mag Fotografie und Reisen sehr.', 'Wie lange wohnst du schon hier?'],
    es: ['Hoy hace un tiempo genial para caminar.', '¿Qué planes tienes para el fin de semana?', 'Me encantan la fotografía y viajar.', '¿Cuánto tiempo llevas viviendo aquí?'],
    it: ['Oggi il tempo è perfetto per una passeggiata.', 'Che programmi hai per il fine settimana?', 'Mi piacciono molto la fotografia e i viaggi.', 'Da quanto tempo vivi qui?'],
    fr: ['Il fait un temps superbe pour marcher aujourd hui.', 'Quels sont tes projets pour le week-end ?', 'J aime beaucoup la photographie et les voyages.', 'Depuis combien de temps habites-tu ici ?'],
    arTargets: ['الجو النهارده حلو أوي للمشي.', 'هتعمل إيه في الويك إند؟', 'بحب التصوير والسفر جداً.', 'بقالك قد إيه عايش هنا؟'],
  },
  {
    day: 10,
    week: 2,
    icon: '🛍️',
    titleAr: 'التسوق والأسعار والخصم',
    titleEn: 'Shopping & Bargaining',
    focusAr: 'المقاسات، الأسعار، وطلب خصم بلباقة',
    focusEn: 'Sizes, prices, and polite bargaining',
    arPrompts: ['هل يوجد مقاس أكبر من هذا؟', 'السعر ده غالي شوية، ممكن خصم؟', 'أنا بس بتفرج دلوقتي، شكراً.', 'هل تقبلون الاسترجاع خلال أسبوع؟'],
    en: ['Do you have this in a larger size?', 'That is a bit pricey, could you give a discount?', 'I am just browsing for now, thanks.', 'Do you accept returns within a week?'],
    de: ['Haben Sie das eine Nummer größer?', 'Das ist etwas teuer, gibt es einen Rabatt?', 'Ich schaue mich nur um, danke.', 'Kann ich es innerhalb einer Woche umtauschen?'],
    es: ['¿Tiene esto en una talla más grande?', 'Es un poco caro, ¿me puede hacer un descuento?', 'Solo estoy mirando por ahora, gracias.', '¿Aceptan devoluciones en una semana?'],
    it: ['Ce l avete in una taglia più grande?', 'È un po caro, può farmi uno sconto?', 'Sto solo dando un occhiata, grazie.', 'Accettate resi entro una settimana?'],
    fr: ['Avez-vous ceci dans une taille plus grande ?', 'C est un peu cher, pouvez-vous faire une remise ?', 'Je regarde juste pour l instant, merci.', 'Acceptez-vous les retours sous une semaine ?'],
    arTargets: ['في مقاس أكبر من ده؟', 'غالي شوية، ممكن تعمل خصم؟', 'بتفرج بس دلوقتي، شكراً.', 'في استرجاع خلال أسبوع؟'],
  },
  {
    day: 11,
    week: 2,
    icon: '🍽️',
    titleAr: 'المطاعم والأكل المحلي',
    titleEn: 'Dining Out & Local Food',
    focusAr: 'توصية الطبق الأفضل، الأكل الحلال/النباتي، والمدح',
    focusEn: 'Chef recommendations, dietary preferences, and compliments',
    arPrompts: ['إيه أشهر طبق محلي تنصحني بيه؟', 'هل الطعام ده حلال أم نباتي؟', 'الأكل كان لذيذ جداً، تسلم إيديكم!', 'ممكن تقسيم الحساب على اتنين؟'],
    en: ['What local dish do you recommend?', 'Is this dish halal or vegetarian?', 'The food was delicious, thank you!', 'Could we split the bill in two?'],
    de: ['Welches lokale Gericht empfehlen Sie?', 'Ist dieses Gericht halal oder vegetarisch?', 'Das Essen war köstlich, vielen Dank!', 'Könnten wir die Rechnung teilen?'],
    es: ['¿Qué plato local me recomienda?', '¿Este plato es halal o vegetariano?', '¡La comida estaba deliciosa, gracias!', '¿Podríamos dividir la cuenta en dos?'],
    it: ['Quale piatto locale mi consiglia?', 'Questo piatto è halal o vegetariano?', 'Il cibo era delizioso, grazie!', 'Potremmo dividere il conto in due?'],
    fr: ['Quel plat local me recommandez-vous ?', 'Ce plat est-il halal ou végétarien ?', 'Le repas était délicieux, merci beaucoup !', 'Pouvons-nous partager l addition en deux ?'],
    arTargets: ['إيه أشهر أكلة هنا تنصحني بيها؟', 'الأكل ده حلال ولا نباتي؟', 'الأكل تحفة بجد، تسلم إيديكم!', 'ممكن نقسم الحساب على اتنين؟'],
  },
  {
    day: 12,
    week: 2,
    icon: '🧭',
    titleAr: 'الاتجاهات والمشي في المدينة',
    titleEn: 'Directions & Exploring',
    focusAr: 'المسافة مشياً، يمين ويسار، والمعالم السياحية',
    focusEn: 'Walking distance, turns, and city landmarks',
    arPrompts: ['هل المتحف قريب مشي من هنا؟', 'لف يمين عند الإشارة التانية.', 'أنا تائه شوية، فين الساحة الرئيسية؟', 'المكان ده بياخد كام دقيقة مشي؟'],
    en: ['Is the museum within walking distance?', 'Turn right at the second traffic light.', 'I am a bit lost, where is the main square?', 'How many minutes does it take on foot?'],
    de: ['Ist das Museum von hier aus zu Fuß erreichbar?', 'Biegen Sie an der zweiten Ampel rechts ab.', 'Ich habe mich verlaufen, wo ist der Hauptplatz?', 'Wie viele Minuten dauert es zu Fuß?'],
    es: ['¿Se puede ir caminando al museo desde aquí?', 'Gire a la derecha en el segundo semáforo.', 'Estoy un poco perdido, ¿dónde está la plaza mayor?', '¿Cuántos minutos se tarda a pie?'],
    it: ['Il museo è raggiungibile a piedi da qui?', 'Giri a destra al secondo semaforo.', 'Mi sono un po perso, dov è la piazza principale?', 'Quanti minuti ci vogliono a piedi?'],
    fr: ['Est-ce que le musée est accessible à pied d ici ?', 'Tournez à droite au deuxième feu.', 'Je suis un peu perdu, où est la place principale ?', 'Combien de minutes faut-il à pied ?'],
    arTargets: ['المتحف قريب مشي من هنا؟', 'لف يمين عند تاني إشارة.', 'تُهت شوية، فين الميدان الرئيسي؟', 'بياخد كام دقيقة مشي؟'],
  },
  {
    day: 13,
    week: 2,
    icon: '🎓',
    titleAr: 'الجامعة وبيئة العمل',
    titleEn: 'Campus & Workplace Talk',
    focusAr: 'التقديم المهني، الاجتماعات، والأسئلة الذكية',
    focusEn: 'Professional intros, meetings, and smart questions',
    arPrompts: ['أنا بشتغل مهندس برمجيات ومهتم بالتعليم.', 'ممكن نحدد اجتماع سريع الساعة ٣؟', 'عندي سؤال بخصوص المشروع الجديد.', 'هبعتلك الملخص على الإيميل النهارده.'],
    en: ['I work as a software engineer focused on education.', 'Could we schedule a quick meeting at three?', 'I have a question about the new project.', 'I will send you the summary by email today.'],
    de: ['Ich arbeite als Softwareentwickler im Bildungsbereich.', 'Könnten wir um drei Uhr ein kurzes Treffen vereinbaren?', 'Ich habe eine Frage zum neuen Projekt.', 'Ich schicke Ihnen heute die Zusammenfassung per E-Mail.'],
    es: ['Trabajo como ingeniero de software enfocado en educación.', '¿Podemos programar una reunión rápida a las tres?', 'Tengo una pregunta sobre el nuevo proyecto.', 'Le enviaré el resumen por correo hoy.'],
    it: ['Lavoro come ingegnere informatico nel settore educativo.', 'Possiamo fissare una riunione veloce alle tre?', 'Ho una domanda sul nuovo progetto.', 'Le invierò il riepilogo via email oggi.'],
    fr: ['Je travaille comme ingénieur logiciel dans l éducation.', 'Pouvons-nous prévoir une courte réunion à quinze heures ?', 'J ai une question concernant le nouveau projet.', 'Je vous enverrai le résumé par e-mail aujourd hui.'],
    arTargets: ['أنا مهندس برمجيات ومهتم بالتعليم.', 'ممكن نعمل اجتماع سريع الساعة ٣؟', 'عندي سؤال عن المشروع الجديد.', 'هبعتلك الملخص على الإيميل النهارده.'],
  },
  {
    day: 14,
    week: 2,
    icon: '🎉',
    titleAr: 'تخطيط الخروجات وتحدي الأسبوع الثاني',
    titleEn: 'Making Plans & Week 2 Check',
    focusAr: 'الاتفاق على المواعيد، الدعوة، وتأكيد الخطة',
    focusEn: 'Arranging meetups, invitations, and confirming plans',
    arPrompts: ['إيه رأيك نتقابل قدام المحطة الساعة ٦؟', 'لو اتأخرت ٥ دقايق هبعتلك رسالة.', 'الخطة دي مناسبة ليا جداً.', 'مستني أشوفك بكرة!'],
    en: ['How about we meet outside the station at six?', 'If I am five minutes late, I will text you.', 'That plan works great for me.', 'Looking forward to seeing you tomorrow!'],
    de: ['Wie wäre es, wenn wir uns um sechs vor dem Bahnhof treffen?', 'Falls ich fünf Minuten zu spät bin, schreibe ich dir.', 'Dieser Plan passt mir perfekt.', 'Ich freue mich darauf, dich morgen zu sehen!'],
    es: ['¿Qué tal si nos vemos frente a la estación a las seis?', 'Si llego cinco minutos tarde, te escribo.', 'Ese plan me viene perfecto.', '¡Qué ganas de verte mañana!'],
    it: ['Che ne dici di incontrarci davanti alla stazione alle sei?', 'Se faccio cinque minuti di ritardo, ti scrivo.', 'Questo programma va benissimo per me.', 'Non vedo l ora di vederti domani!'],
    fr: ['Et si on se retrouvait devant la gare à dix-huit heures ?', 'Si j ai cinq minutes de retard, je t envoie un message.', 'Ce programme me convient parfaitement.', 'J ai hâte de te voir demain !'],
    arTargets: ['إيه رأيك نتقابل قدام المحطة الساعة ٦؟', 'لو اتأخرت ٥ دقايق هبعتلك رسالة.', 'الميعاد ده مناسبني جداً.', 'مستني أشوفك بكرة!'],
  },

  // ================= WEEK 3: NATIVE IMMERSION & FLUENCY (DAYS 15-21) =================
  {
    day: 15,
    week: 3,
    icon: '📖',
    titleAr: 'حكي القصص والمواقف',
    titleEn: 'Storytelling & Past Events',
    focusAr: 'سرد موقف سفر طريف بتسلسل زمني طبيعي',
    focusEn: 'Telling a travel story with natural sequencing',
    arPrompts: ['في الأول افتكرت إني ضيعت التذكرة.', 'فجأة، السواق افتكر مكان الشنطة.', 'في الآخر، كل حاجة عدّت على خير.', 'دي كانت أحلى ذكرى في الرحلة كلها.'],
    en: ['At first, I thought I had lost my ticket.', 'Suddenly, the driver remembered where the bag was.', 'In the end, everything worked out smoothly.', 'That became my favorite memory of the whole trip.'],
    de: ['Zuerst dachte ich, ich hätte mein Ticket verloren.', 'Plötzlich erinnerte sich der Fahrer an die Tasche.', 'Am Ende hat alles reibungslos geklappt.', 'Das wurde meine schönste Erinnerung an die Reise.'],
    es: ['Al principio pensé que había perdido mi boleto.', 'De repente, el conductor recordó dónde estaba la maleta.', 'Al final, todo salió de maravilla.', 'Ese fue mi mejor recuerdo de todo el viaje.'],
    it: ['All inizio pensavo di aver perso il biglietto.', 'All improvviso, l autista si è ricordato dov era la borsa.', 'Alla fine è andato tutto per il meglio.', 'È diventato il mio ricordo preferito del viaggio.'],
    fr: ['Au début, j ai cru que j avais perdu mon billet.', 'Soudain, le chauffeur s est souvenu où était le sac.', 'Finalement, tout s est très bien passé.', 'C est devenu mon meilleur souvenir du voyage.'],
    arTargets: ['في الأول افتكرت إني ضيعت التذكرة.', 'فجأة السواق افتكر مكان الشنطة.', 'في الآخر كل حاجة عدت على خير.', 'دي كانت أحلى ذكرى في الرحلة كلها.'],
  },
  {
    day: 16,
    week: 3,
    icon: '⚖️',
    titleAr: 'مناقشة الآراء والاختلاف بلباقة',
    titleEn: 'Debating Opinions Politely',
    focusAr: 'إبداء رأيك بوضوح وتقبّل الرأي الآخر بلباقة',
    focusEn: 'Expressing clear viewpoints and disagreeing gracefully',
    arPrompts: ['أفهم وجهة نظرك، لكن أرى الموضوع بشكل مختلف.', 'الميزة الكبرى هنا هي سهولة الاستخدام.', 'من ناحية أخرى، التكلفة عامل مهم.', 'في رأيي، التوازن هو أفضل حل.'],
    en: ['I see your point, though I view it differently.', 'The biggest advantage here is simplicity.', 'On the other hand, cost is a major factor.', 'In my view, balance is the smartest solution.'],
    de: ['Ich verstehe deinen Punkt, sehe es aber anders.', 'Der größte Vorteil hier ist die Einfachheit.', 'Andererseits sind die Kosten ein wichtiger Faktor.', 'Meiner Meinung nach ist Ausgewogenheit die beste Lösung.'],
    es: ['Entiendo tu punto, aunque lo veo de otra manera.', 'La mayor ventaja aquí es la sencillez.', 'Por otro lado, el costo es un factor clave.', 'En mi opinión, el equilibrio es la mejor solución.'],
    it: ['Capisco il tuo punto di vista, ma la vedo diversamente.', 'Il vantaggio più grande qui è la semplicità.', 'D altro canto, il costo è un fattore decisivo.', 'Secondo me, l equilibrio è la soluzione migliore.'],
    fr: ['Je comprends ton point de vue, mais je vois les choses autrement.', 'Le plus grand avantage ici est la simplicité.', 'D un autre côté, le coût est un facteur essentiel.', 'À mon avis, l équilibre est la meilleure solution.'],
    arTargets: ['فاهم وجهة نظرك، بس شايف الموضوع بشكل مختلف.', 'أكبر ميزة هنا هي البساطة.', 'من ناحية تانية، التكلفة عامل مهم.', 'في رأيي التوازن هو أذكى حل.'],
  },
  {
    day: 17,
    week: 3,
    icon: '🔥',
    titleAr: 'تعبيرات الشارع والأمثال الحية',
    titleEn: 'Street Idioms & Native Slang',
    focusAr: 'كيف يتحدث أهل اللغة فعلاً بعيداً عن الكتب المدرسية',
    focusEn: 'How natives actually speak beyond textbooks',
    arPrompts: ['الموضوع ده سهل جداً ومش محتاج تعقيد.', 'خلينا نلعبها حسب الظروف ونشوف.', 'بجد؟ مش معقول، ده خبر رائع!', 'خلاص، اعتبر الموضوع منتهي.'],
    en: ['That is a piece of cake, no need to overthink it.', 'Let us play it by ear and see how it goes.', 'No way! That is amazing news!', 'Consider it done, you can count on me.'],
    de: ['Das ist ein Kinderspiel, mach dir keinen Kopf.', 'Lass uns einfach spontan entscheiden.', 'Echt jetzt? Das sind ja tolle Neuigkeiten!', 'Abgemacht, du kannst dich auf mich verlassen.'],
    es: ['Eso es pan comido, no te compliques.', 'Vamos improvisando sobre la marcha.', '¿En serio? ¡Qué excelente noticia!', 'Dalo por hecho, cuenta conmigo.'],
    it: ['È un gioco da ragazzi, non complicarti la vita.', 'Vediamo come va e decidiamo sul momento.', 'Davvero? È una notizia fantastica!', 'Consideralo fatto, puoi contare su di me.'],
    fr: ['C est du gâteau, ne te prends pas la tête.', 'On va improviser au fur et à mesure.', 'Sans blague ? C est une super nouvelle !', 'Considère que c est fait, compte sur moi.'],
    arTargets: ['الموضوع ده سهل أوي ومش مستاهل تعقيد.', 'خلينا نشوف الظروف ونمشيها.', 'بجد؟ ده خبر تحفة!', 'خلاص اعتبره حصل، اعتمد عليا.'],
  },
  {
    day: 18,
    week: 3,
    icon: '🎧',
    titleAr: 'فهم السرعة الطبيعية لأهل اللغة',
    titleEn: 'Fast Native Listening',
    focusAr: 'الاختصارات الصوتية والربط السريع في الكلام الحقيقي',
    focusEn: 'Natural reductions, linked speech, and rapid comprehension',
    arPrompts: ['هتعمل إيه بعد ما تخلص الشغل النهارده؟', 'كنت هقولك إن الميعاد اتغيّر.', 'لازم نتحرك دلوقتي وإلا القطار هيفوتنا.', 'ما تقلقش، إحنا سابقين الوقت بعشر دقايق.'],
    en: ['What are you going to do after work today?', 'I was about to tell you the time changed.', 'We have to head out now or we will miss the train.', 'Do not worry, we are ten minutes ahead of schedule.'],
    de: ['Was machst du heute nach der Arbeit?', 'Ich wollte dir gerade sagen, dass sich die Zeit geändert hat.', 'Wir müssen jetzt los, sonst verpassen wir den Zug.', 'Keine Sorge, wir sind zehn Minuten zu früh dran.'],
    es: ['¿Qué vas a hacer hoy después del trabajo?', 'Justo iba a decirte que cambió la hora.', 'Tenemos que salir ya o perderemos el tren.', 'No te preocupes, vamos con diez minutos de ventaja.'],
    it: ['Cosa fai oggi dopo il lavoro?', 'Stavo proprio per dirti che l orario è cambiato.', 'Dobbiamo uscire ora o perdiamo il treno.', 'Non preoccuparti, siamo in anticipo di dieci minuti.'],
    fr: ['Qu est-ce que tu vas faire après le travail aujourd hui ?', 'J allais justement te dire que l heure a changé.', 'On doit partir maintenant sinon on va rater le train.', 'Ne t inquiète pas, on a dix minutes d avance.'],
    arTargets: ['هتعمل إيه بعد الشغل النهارده؟', 'كنت لسه هقولك الميعاد اتغير.', 'لازم نتحرك دلوقتي عشان القطر ما يفوتناش.', 'ما تقلقش، إحنا بدري عشر دقايق.'],
  },
  {
    day: 19,
    week: 3,
    icon: '🛠️',
    titleAr: 'حل مشاكل السفر بهدوء',
    titleEn: 'Handling Travel Problems',
    focusAr: 'تأخير الرحلات، خطأ في الفاتورة، وطلب البديل بثقة',
    focusEn: 'Flight delays, billing mistakes, and confident problem-solving',
    arPrompts: ['رحلتي اتلغت، إيه أقرب بديل متاح؟', 'في خطأ بسيط في الفاتورة، ممكن نراجعه؟', 'التكييف في الغرفة مش شغال كويس.', 'أقدر أغير الحجز لليوم اللي بعده بدون غرامة؟'],
    en: ['My flight was cancelled; what is the next available option?', 'There is a small mistake on the bill; could we check it?', 'The air conditioning in my room is not working properly.', 'Can I move my booking to the next day without a fee?'],
    de: ['Mein Flug wurde gestrichen; was ist die nächste Alternative?', 'Auf der Rechnung ist ein kleiner Fehler; können wir das prüfen?', 'Die Klimaanlage in meinem Zimmer funktioniert nicht richtig.', 'Kann ich meine Buchung kostenlos auf morgen umbuchen?'],
    es: ['Cancelaron mi vuelo; ¿cuál es la siguiente opción disponible?', 'Hay un pequeño error en la cuenta; ¿podemos revisarlo?', 'El aire acondicionado de mi habitación no funciona bien.', '¿Puedo cambiar mi reserva para mañana sin cargo?'],
    it: ['Il mio volo è stato cancellato; qual è la prossima alternativa?', 'C è un piccolo errore sul conto; possiamo controllarlo?', 'L aria condizionata in camera mia non funziona bene.', 'Posso spostare la prenotazione a domani senza penale?'],
    fr: ['Mon vol a été annulé ; quelle est la prochaine option disponible ?', 'Il y a une petite erreur sur la facture ; pouvons-nous vérifier ?', 'La climatisation de ma chambre ne fonctionne pas bien.', 'Puis-je déplacer ma réservation à demain sans frais ?'],
    arTargets: ['طيارتي اتلغت، إيه أقرب بديل؟', 'في غلطة بسيطة في الفاتورة، ممكن نراجعها؟', 'التكييف في الأوضة مش شغال كويس.', 'ممكن أنقل الحجز لبكرة من غير غرامة؟'],
  },
  {
    day: 20,
    week: 3,
    icon: '🎭',
    titleAr: 'تبديل الأسلوب (رسمي vs ودي)',
    titleEn: 'Formal vs. Informal Register',
    focusAr: 'التحدث مع مدير أو موظف مقابل التحدث مع صديق',
    focusEn: 'Switching smoothly between executive politeness and casual warmth',
    arPrompts: ['يسعدني جداً التواصل معكم بخصوص هذا التعاون.', 'يا صاحبي، عامل إيه؟ وحشتني جداً!', 'أرجو إبلاغي بالموعد المناسب لحضرتك.', 'ابعتلي أول ما توصل عشان أستناك.'],
    en: ['I would be delighted to connect regarding this collaboration.', 'Hey buddy, how have you been? Long time no see!', 'Please let me know what time suits you best.', 'Text me as soon as you arrive so I can meet you.'],
    de: ['Ich würde mich sehr über eine Zusammenarbeit freuen.', 'Hey Kumpel, wie geht es dir? Lange nicht gesehen!', 'Bitte teilen Sie mir mit, welcher Termin Ihnen passt.', 'Schreib mir, sobald du ankommst, dann warte ich auf dich.'],
    es: ['Me encantaría ponerme en contacto respecto a esta colaboración.', '¡Hola amigo! ¿Cómo has estado? ¡Cuánto tiempo!', 'Por favor, indíqueme qué horario le conviene mejor.', 'Escríbeme apenas llegues para esperarte.'],
    it: ['Sarei lieto di mettermi in contatto per questa collaborazione.', 'Ehi amico, come stai? Quanto tempo!', 'Per favore, mi faccia sapere quale orario preferisce.', 'Scrivimi appena arrivi così ti aspetto.'],
    fr: ['Je serais ravi d échanger au sujet de cette collaboration.', 'Salut mon ami, comment vas-tu ? Ça fait longtemps !', 'Veuillez m indiquer quel créneau vous convient le mieux.', 'Envoie-moi un message dès que tu arrives.'],
    arTargets: ['يسعدني جداً التواصل مع حضرتك بخصوص التعاون ده.', 'يا صاحبي عامل إيه؟ واحشني جداً!', 'يا ريت تبلغني بالميعاد المناسب لحضرتك.', 'ابعتلي أول ما توصل عشان أقابلك.'],
  },
  {
    day: 21,
    week: 3,
    icon: '🏆',
    titleAr: '⚔️ اختبار البطل: محادثة سفر كاملة',
    titleEn: '⚔️ Boss Test: Full Native Travel Conversation',
    focusAr: 'اجتياز رحلة كاملة من المطار حتى النقاش الاحترافي بطلاقة',
    focusEn: 'Pass a complete end-to-end journey from airport to fluent conversation',
    isBossDay: true,
    arPrompts: ['بصراحة، السفر علمني إزاي أفكر باللغة من غير ترجمة.', 'رغم إن أول يوم كان صعب، دلوقتي بتكلم بثقة كاملة.', 'مش بس قدرت أتصرف في المطار، كمان كونت صداقات جديدة.', 'جاهز للرحلة الجاية في أي مكان في العالم!'],
    en: ['Honestly, traveling taught me how to think directly without translating.', 'Although day one felt challenging, I now speak with full confidence.', 'Not only did I navigate the airport, but I also made genuine friends.', 'I am ready for my next adventure anywhere in the world!'],
    de: ['Ehrlich gesagt hat mir das Reisen gezeigt, direkt ohne Übersetzung zu denken.', 'Obwohl der erste Tag schwer war, spreche ich jetzt voller Selbstvertrauen.', 'Nicht nur habe ich den Flughafen gemeistert, sondern auch echte Freunde gefunden.', 'Ich bin bereit für mein nächstes Abenteuer überall auf der Welt!'],
    es: ['Sinceramente, viajar me enseñó a pensar directamente sin traducir.', 'Aunque el primer día fue difícil, ahora hablo con total confianza.', 'No solo dominé el aeropuerto, sino que también hice grandes amigos.', '¡Estoy listo para mi próxima aventura en cualquier parte del mundo!'],
    it: ['Sinceramente, viaggiare mi ha insegnato a pensare direttamente senza tradurre.', 'Anche se il primo giorno era difficile, ora parlo con piena fiducia.', 'Non solo ho gestito l aeroporto, ma ho anche fatto veri amici.', 'Sono pronto per la mia prossima avventura ovunque nel mondo!'],
    fr: ['Franchement, voyager m a appris à penser directement sans traduire.', 'Bien que le premier jour ait été difficile, je parle maintenant avec confiance.', 'Non seulement j ai géré l aéroport, mais je me suis aussi fait de vrais amis.', 'Je suis prêt pour ma prochaine aventure partout dans le monde !'],
    arTargets: ['بصراحة السفر علمني أفكر باللغة على طول من غير ترجمة.', 'رغم إن أول يوم كان صعب، دلوقتي بتكلم بثقة كاملة.', 'مش بس اتصرفت في المطار، ده كمان كونت صداقات حقيقية.', 'جاهز لرحلتي الجاية في أي مكان في العالم!'],
  },
];

function buildDayPhrases(bp: DayBlueprint): TravelSprintDay['phrases'] {
  const langs: Array<'en' | 'de' | 'es' | 'it' | 'fr' | 'ar'> = ['en', 'de', 'es', 'it', 'fr', 'ar'];
  const result = {} as TravelSprintDay['phrases'];

  for (const lang of langs) {
    const targets = lang === 'ar' ? bp.arTargets : bp[lang];
    result[lang] = targets.map((target, idx) => ({
      promptAr: lang === 'ar' ? bp.en[idx] : bp.arPrompts[idx],
      promptEn: lang === 'ar' ? `${bp.en[idx]} (Arabic Travel Phrase)` : bp.en[idx],
      target,
      tipAr: `مهمة اليوم ${bp.day} (${bp.titleAr}): ركّز على نطق العبارة كوحدة واحدة طبيعية.`,
      tipEn: `Day ${bp.day} (${bp.titleEn}): Speak the whole travel phrase as one natural chunk.`,
    }));
  }

  return result;
}

export const TRAVEL_SPRINT_DAYS: TravelSprintDay[] = TRAVEL_DAY_BLUEPRINTS.map((bp) => ({
  day: bp.day,
  week: bp.week,
  icon: bp.icon,
  titleAr: bp.titleAr,
  titleEn: bp.titleEn,
  focusAr: bp.focusAr,
  focusEn: bp.focusEn,
  estimatedMinutes: bp.isBossDay ? 18 : 15,
  isBossDay: bp.isBossDay,
  phrases: buildDayPhrases(bp),
}));

import {
  TRAVEL_SPRINT_STORAGE_KEY,
  loadCompletedTravelDays,
  markTravelDayCompleted,
  getTravelReadinessPercent,
} from '../utils/travelSprintProgress';

export {
  TRAVEL_SPRINT_STORAGE_KEY,
  loadCompletedTravelDays,
  markTravelDayCompleted,
  getTravelReadinessPercent,
};

export function buildTravelSprintLesson(dayNumber: number, targetLang: TargetLanguage): LessonNode {
  const dayData = TRAVEL_SPRINT_DAYS.find((d) => d.day === dayNumber) || TRAVEL_SPRINT_DAYS[0];
  const langKey: 'en' | 'de' | 'es' | 'it' | 'fr' | 'ar' =
    targetLang === 'en' || targetLang === 'de' || targetLang === 'es' || targetLang === 'it' || targetLang === 'fr' || targetLang === 'ar'
      ? targetLang
      : 'en';

  const phrases = dayData.phrases[langKey];
  const exercises: ExerciseItem[] = phrases.map((item, idx) => ({
    id: `travel-day-${dayData.day}-${langKey}-ex-${idx + 1}`,
    type: idx % 2 === 0 ? 'structure_builder' : 'translate_thought',
    promptAr: item.promptAr,
    promptEn: item.promptEn,
    targetSentence: item.target,
    acceptableAlternatives: [item.target, item.target.replace(/[.,!?;:؟،]/g, '')],
    wordChips: item.target.split(/\s+/).filter(Boolean),
    breakdownChunks: [],
    explanationAr: item.tipAr,
    explanationEn: item.tipEn,
    skillAxes: ['speaking', 'listening', 'vocabulary'],
  }));

  const stage = dayData.week === 1 ? 'A1' : dayData.week === 2 ? 'A2' : dayData.isBossDay ? 'C1' : 'B2';
  const levelId = dayData.week === 1 ? 'A1' : dayData.week === 2 ? 'A2' : dayData.isBossDay ? 'C1' : 'B2';

  return {
    id: `travel-sprint-day-${dayData.day}`,
    unitId: `travel-sprint-week-${dayData.week}`,
    stage,
    levelId,
    phaseId: `${levelId}.1`,
    titleAr: `اليوم ${dayData.day}/21: ${dayData.titleAr}`,
    titleEn: `Day ${dayData.day}/21: ${dayData.titleEn}`,
    descriptionAr: dayData.focusAr,
    descriptionEn: dayData.focusEn,
    icon: dayData.icon,
    estimatedMinutes: dayData.estimatedMinutes,
    isBossGate: Boolean(dayData.isBossDay),
    exercises,
  };
}
