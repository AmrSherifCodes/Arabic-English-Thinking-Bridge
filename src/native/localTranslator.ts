// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { Capacitor, registerPlugin } from '@capacitor/core';

export type TranslatorLangCode = 'ar' | 'en' | 'de' | 'es' | 'it' | 'fr';

export const SUPPORTED_TRANSLATOR_LANGS: TranslatorLangCode[] = ['ar', 'en', 'de', 'es', 'it', 'fr'];

export const WEB_OFFLINE_APK_BADGE_AR =
  'للمترجم العصبي الكامل بدون إنترنت، حمّل تطبيق الأندرويد (APK)';
export const WEB_OFFLINE_APK_BADGE_EN =
  'For the full neural offline translator, download the Android APK';

export interface ModelStatusResult {
  downloaded: boolean;
  sourceDownloaded: boolean;
  targetDownloaded: boolean;
  estimatedSizeMb: number;
  sourceLang: TranslatorLangCode;
  targetLang: TranslatorLangCode;
  isWebFallback?: boolean;
}

export interface DownloadModelResult {
  downloaded: boolean;
  sourceLang: TranslatorLangCode;
  targetLang: TranslatorLangCode;
  durationMs: number;
}

export interface TranslateResult {
  translatedText: string;
  latencyMs: number;
  engine: 'mlkit-offline' | 'phrasebook-offline' | 'byok-gemini' | 'passthrough';
  matchedScore?: number;
  isWebFallback?: boolean;
}

export interface DeleteModelResult {
  deleted: boolean;
  lang: TranslatorLangCode;
}

interface NativeLocalTranslatorPlugin {
  getModelStatus(options: { sourceLang: string; targetLang: string }): Promise<ModelStatusResult>;
  downloadModel(options: { sourceLang: string; targetLang: string }): Promise<DownloadModelResult>;
  translate(options: { text: string; sourceLang: string; targetLang: string }): Promise<TranslateResult>;
  deleteModel(options: { lang: string }): Promise<DeleteModelResult>;
}

const NativeLocalTranslator = registerPlugin<NativeLocalTranslatorPlugin>('LocalTranslator');

export function normalizeTranslatorLang(raw?: string): TranslatorLangCode {
  const base = (raw || 'en').trim().toLowerCase().split(/[-_]/)[0];
  if (base === 'arz' || base === 'apc' || base === 'afb' || base === 'ary' || base === 'ar') return 'ar';
  if (base === 'de' || base === 'es' || base === 'it' || base === 'fr' || base === 'en') return base;
  return 'en';
}

export interface PhrasebookEntry {
  ar: string;
  arAlt?: string[];
  en: string;
  de: string;
  es: string;
  it: string;
  fr: string;
}

/**
 * 210+ High-Frequency Travel & Street Conversation Sentences (0 ms, 100% offline).
 * Powers instant web fallback on tb-eg.vercel.app and zero-wait emergency survival chips.
 */
export const TRAVEL_PHRASEBOOK: PhrasebookEntry[] = [
  // --- Emergency Survival & Core Essentials (1-25) ---
  { ar: 'أين الحمام؟', arAlt: ['فين الحمام', 'الحمام فين', 'دورة المياه فين'], en: 'Where is the bathroom?', de: 'Wo ist die Toilette?', es: '¿Dónde está el baño?', it: 'Dov’è il bagno?', fr: 'Où sont les toilettes ?' },
  { ar: 'بكم هذا؟', arAlt: ['بكام ده', 'سعره كام', 'كام سعره'], en: 'How much is this?', de: 'Wie viel kostet das?', es: '¿Cuánto cuesta esto?', it: 'Quanto costa questo?', fr: 'Combien coûte ceci ?' },
  { ar: 'هل هذا حلال؟', arAlt: ['ده حلال', 'الأكل ده حلال'], en: 'Is this Halal?', de: 'Ist das Halal?', es: '¿Es esto Halal?', it: 'Questo è Halal?', fr: 'Est-ce que c’est Halal ?' },
  { ar: 'أحتاج مساعدة', arAlt: ['محتاج مساعدة', 'ساعدني من فضلك', 'ممكن تساعدني'], en: 'I need help, please.', de: 'Ich brauche bitte Hilfe.', es: 'Necesito ayuda, por favor.', it: 'Ho bisogno di aiuto, per favore.', fr: 'J’ai besoin d’aide, s’il vous plaît.' },
  { ar: 'مرحباً', arAlt: ['أهلاً', 'سلام عليكم', 'أهلا بيك'], en: 'Hello!', de: 'Hallo!', es: '¡Hola!', it: 'Ciao!', fr: 'Bonjour !' },
  { ar: 'صباح الخير', arAlt: ['صباح النور'], en: 'Good morning.', de: 'Guten Morgen.', es: 'Buenos días.', it: 'Buongiorno.', fr: 'Bonjour.' },
  { ar: 'مساء الخير', arAlt: ['مساء النور'], en: 'Good evening.', de: 'Guten Abend.', es: 'Buenas tardes.', it: 'Buonasera.', fr: 'Bonsoir.' },
  { ar: 'تصبح على خير', en: 'Good night.', de: 'Gute Nacht.', es: 'Buenas noches.', it: 'Buonanotte.', fr: 'Bonne nuit.' },
  { ar: 'شكراً جزيلاً', arAlt: ['شكراً', 'متشكر', 'تسلم'], en: 'Thank you very much.', de: 'Vielen Dank.', es: 'Muchas gracias.', it: 'Grazie mille.', fr: 'Merci beaucoup.' },
  { ar: 'عفواً', arAlt: ['العفو', 'ولا يهمك'], en: 'You are welcome.', de: 'Gern geschehen.', es: 'De nada.', it: 'Prego.', fr: 'De rien.' },
  { ar: 'من فضلك', arAlt: ['لو سمحت', 'بعد إذنك'], en: 'Please / Excuse me.', de: 'Bitte / Entschuldigung.', es: 'Por favor / Disculpe.', it: 'Per favore / Mi scusi.', fr: 'S’il vous plaît / Excusez-moi.' },
  { ar: 'أنا آسف', arAlt: ['آسف جداً', 'معذرة'], en: 'I am sorry.', de: 'Es tut mir leid.', es: 'Lo siento.', it: 'Mi dispiace.', fr: 'Je suis désolé.' },
  { ar: 'نعم', arAlt: ['أيوة', 'تمام'], en: 'Yes.', de: 'Ja.', es: 'Sí.', it: 'Sì.', fr: 'Oui.' },
  { ar: 'لا، شكراً', arAlt: ['لا شكراً', 'لأ شكراً'], en: 'No, thank you.', de: 'Nein, danke.', es: 'No, gracias.', it: 'No, grazie.', fr: 'Non, merci.' },
  { ar: 'لا أفهم', arAlt: ['مش فاهم', 'مفهمتش'], en: 'I do not understand.', de: 'Ich verstehe nicht.', es: 'No entiendo.', it: 'Non capisco.', fr: 'Je ne comprends pas.' },
  { ar: 'هل يمكنك التحدث ببطء؟', arAlt: ['اتكلم بالراحة', 'ممكن تتكلم ببطء'], en: 'Could you speak slowly, please?', de: 'Könnten Sie bitte langsam sprechen?', es: '¿Podría hablar más despacio, por favor?', it: 'Può parlare più lentamente, per favore?', fr: 'Pouvez-vous parler plus lentement, s’il vous plaît ?' },
  { ar: 'هل تتحدث الإنجليزية؟', arAlt: ['بتتكلم إنجليزي'], en: 'Do you speak English?', de: 'Sprechen Sie Englisch?', es: '¿Habla inglés?', it: 'Parla inglese?', fr: 'Parlez-vous anglais ?' },
  { ar: 'هل تتحدث العربية؟', arAlt: ['بتتكلم عربي'], en: 'Do you speak Arabic?', de: 'Sprechen Sie Arabisch?', es: '¿Habla árabe?', it: 'Parla arabo?', fr: 'Parlez-vous arabe ?' },
  { ar: 'ممكن تعيد ذلك من فضلك؟', arAlt: ['قول تاني لو سمحت'], en: 'Could you repeat that, please?', de: 'Könnten Sie das bitte wiederholen?', es: '¿Puede repetir eso, por favor?', it: 'Può ripetere, per favore?', fr: 'Pouvez-vous répéter, s’il vous plaît ?' },
  { ar: 'اسمي عمرو', arAlt: ['اسمي'], en: 'My name is Amr.', de: 'Ich heiße Amr.', es: 'Me llamo Amr.', it: 'Mi chiamo Amr.', fr: 'Je m’appelle Amr.' },
  { ar: 'أنا من مصر', arAlt: ['أنا مصري'], en: 'I am from Egypt.', de: 'Ich komme aus Ägypten.', es: 'Soy de Egipto.', it: 'Vengo dall’Egitto.', fr: 'Je viens d’Égypte.' },
  { ar: 'تشرفت بلقائك', arAlt: ['فرصة سعيدة'], en: 'Nice to meet you.', de: 'Freut mich, Sie kennenzulernen.', es: 'Mucho gusto.', it: 'Piacere di conoscerti.', fr: 'Enchanté.' },
  { ar: 'كيف حالك؟', arAlt: ['إزيك', 'عامل إيه'], en: 'How are you?', de: 'Wie geht es Ihnen?', es: '¿Cómo está?', it: 'Come sta?', fr: 'Comment allez-vous ?' },
  { ar: 'أنا بخير، شكراً', arAlt: ['الحمد لله كويس'], en: 'I am fine, thank you.', de: 'Mir geht es gut, danke.', es: 'Estoy bien, gracias.', it: 'Sto bene, grazie.', fr: 'Je vais bien, merci.' },
  { ar: 'مع السلامة', arAlt: ['وداعاً', 'أشوفك بعدين'], en: 'Goodbye!', de: 'Auf Wiedersehen!', es: '¡Adiós!', it: 'Arrivederci!', fr: 'Au revoir !' },

  // --- Airport & Immigration (26-50) ---
  { ar: 'هذا جواز سفري', arAlt: ['اتفضل الباسبور', 'جواز السفر أهوه'], en: 'Here is my passport.', de: 'Hier ist mein Reisepass.', es: 'Aquí está mi pasaporte.', it: 'Ecco il mio passaporto.', fr: 'Voici mon passeport.' },
  { ar: 'أنا هنا للسياحة', arAlt: ['جاي سياحة', 'زيارة سياحية'], en: 'I am here for tourism.', de: 'Ich bin als Tourist hier.', es: 'Estoy aquí por turismo.', it: 'Sono qui per turismo.', fr: 'Je suis ici pour le tourisme.' },
  { ar: 'أنا هنا في رحلة عمل', arAlt: ['جاي شغل'], en: 'I am here on a business trip.', de: 'Ich bin auf einer Geschäftsreise hier.', es: 'Estoy aquí en un viaje de negocios.', it: 'Sono qui per un viaggio di lavoro.', fr: 'Je suis ici pour un voyage d’affaires.' },
  { ar: 'سأبقى لمدة أسبوع', arAlt: ['هقعد أسبوع'], en: 'I will stay for one week.', de: 'Ich bleibe eine Woche.', es: 'Me quedaré una semana.', it: 'Resterò una settimana.', fr: 'Je vais rester une semaine.' },
  { ar: 'سأبقى لمدة عشرة أيام', en: 'I will stay for ten days.', de: 'Ich bleibe zehn Tage.', es: 'Me quedaré diez días.', it: 'Resterò dieci giorni.', fr: 'Je vais rester dix jours.' },
  { ar: 'هذه تذكرة العودة', arAlt: ['تذكرة الرجوع'], en: 'Here is my return ticket.', de: 'Hier ist mein Rückflugticket.', es: 'Aquí está mi boleto de regreso.', it: 'Ecco il mio biglietto di ritorno.', fr: 'Voici mon billet retour.' },
  { ar: 'سأقيم في هذا الفندق', arAlt: ['عنوان الفندق'], en: 'I am staying at this hotel.', de: 'Ich übernachte in diesem Hotel.', es: 'Me alojo en este hotel.', it: 'Alloggio in questo hotel.', fr: 'Je séjourne dans cet hôtel.' },
  { ar: 'هذا حجز الفندق الخاص بي', en: 'Here is my hotel reservation.', de: 'Hier ist meine Hotelreservierung.', es: 'Aquí está mi reserva de hotel.', it: 'Ecco la mia prenotazione dell’hotel.', fr: 'Voici ma réservation d’hôtel.' },
  { ar: 'أين بوابة الصعود؟', arAlt: ['بوابة الطيارة فين'], en: 'Where is the boarding gate?', de: 'Wo ist das Boarding-Gate?', es: '¿Dónde está la puerta de embarque?', it: 'Dov’è il gate d’imbarco?', fr: 'Où est la porte d’embarquement ?' },
  { ar: 'أين استلام الأمتعة؟', arAlt: ['الشنط فين', 'سير الشنط فين'], en: 'Where is baggage claim?', de: 'Wo ist die Gepäckausgabe?', es: '¿Dónde está la recogida de equipaje?', it: 'Dov’è il ritiro bagagli?', fr: 'Où est la livraison des bagages ?' },
  { ar: 'حقيبتي لم تصل', arAlt: ['شنطتي ضاعت'], en: 'My luggage did not arrive.', de: 'Mein Gepäck ist nicht angekommen.', es: 'Mi equipaje no llegó.', it: 'Il mio bagaglio non è arrivato.', fr: 'Mon bagage n’est pas arrivé.' },
  { ar: 'ليس لدي شيء لأصرح عنه', en: 'I have nothing to declare.', de: 'Ich habe nichts zu verzollen.', es: 'No tengo nada que declarar.', it: 'Non ho nulla da dichiarare.', fr: 'Je n’ai rien à déclarer.' },
  { ar: 'متى تقلع الطائرة؟', en: 'When does the plane depart?', de: 'Wann startet das Flugzeug?', es: '¿Cuándo sale el avión?', it: 'Quando parte l’aereo?', fr: 'Quand décolle l’avion ?' },
  { ar: 'هل الرحلة متأخرة؟', en: 'Is the flight delayed?', de: 'Hat der Flug Verspätung?', es: '¿Está retrasado el vuelo?', it: 'Il volo è in ritardo?', fr: 'Le vol est-il retardé ?' },
  { ar: 'أريد مقعداً بجانب النافذة', en: 'I would like a window seat.', de: 'Ich möchte einen Fensterplatz.', es: 'Quisiera un asiento junto a la ventana.', it: 'Vorrei un posto vicino al finestrino.', fr: 'Je voudrais un siège côté hublot.' },
  { ar: 'أين مكتب الصرافة؟', arAlt: ['أغير فلوس فين'], en: 'Where is the currency exchange?', de: 'Wo ist die Wechselstube?', es: '¿Dónde está la casa de cambio?', it: 'Dov’è il cambio valuta?', fr: 'Où est le bureau de change ?' },
  { ar: 'أين يمكنني شراء شريحة إنترنت؟', arAlt: ['شريحة نت فين'], en: 'Where can I buy a SIM card?', de: 'Wo kann ich eine SIM-Karte kaufen?', es: '¿Dónde puedo comprar una tarjeta SIM?', it: 'Dove posso comprare una scheda SIM?', fr: 'Où puis-je acheter une carte SIM ?' },
  { ar: 'أين مخرج المطار؟', en: 'Where is the airport exit?', de: 'Wo ist der Flughafenausgang?', es: '¿Dónde está la salida del aeropuerto?', it: 'Dov’è l’uscita dell’aeroporto?', fr: 'Où est la sortie de l’aéroport ?' },
  { ar: 'هذه أول زيارة لي هنا', en: 'This is my first visit here.', de: 'Das ist mein erster Besuch hier.', es: 'Esta es mi primera visita aquí.', it: 'Questa è la mia prima visita qui.', fr: 'C’est ma première visite ici.' },
  { ar: 'أزور صديقاً هنا', en: 'I am visiting a friend here.', de: 'Ich besuche hier einen Freund.', es: 'Estoy visitando a un amigo aquí.', it: 'Sto visitando un amico qui.', fr: 'Je rends visite à un ami ici.' },
  { ar: 'هذه تأشيرتي', en: 'Here is my visa.', de: 'Hier ist mein Visum.', es: 'Aquí está mi visa.', it: 'Ecco il mio visto.', fr: 'Voici mon visa.' },
  { ar: 'أين مراقبة الجوازات؟', en: 'Where is passport control?', de: 'Wo ist die Passkontrolle?', es: '¿Dónde está el control de pasaportes?', it: 'Dov’è il controllo passaporti?', fr: 'Où est le contrôle des passeports ?' },
  { ar: 'هل يمكنني شحن هاتفي هنا؟', en: 'Can I charge my phone here?', de: 'Kann ich hier mein Handy laden?', es: '¿Puedo cargar mi teléfono aquí?', it: 'Posso ricaricare il telefono qui?', fr: 'Puis-je recharger mon téléphone ici ?' },
  { ar: 'أين التاكسيات؟', en: 'Where is the taxi stand?', de: 'Wo ist der Taxistand?', es: '¿Dónde está la parada de taxis?', it: 'Dov’è la fermata dei taxi?', fr: 'Où est la station de taxis ?' },
  { ar: 'ما هو رقم البوابة؟', en: 'What is the gate number?', de: 'Wie lautet die Gate-Nummer?', es: '¿Cuál es el número de puerta?', it: 'Qual è il numero del gate?', fr: 'Quel est le numéro de la porte ?' },

  // --- Taxi, Metro & Directions (51-80) ---
  { ar: 'إلى هذا العنوان من فضلك', arAlt: ['وديني العنوان ده'], en: 'To this address, please.', de: 'Zu dieser Adresse, bitte.', es: 'A esta dirección, por favor.', it: 'A questo indirizzo, per favore.', fr: 'À cette adresse, s’il vous plaît.' },
  { ar: 'كم ستكلف الرحلة؟', arAlt: ['المشوار بكام'], en: 'How much will the ride cost?', de: 'Wie viel kostet die Fahrt?', es: '¿Cuánto costará el viaje?', it: 'Quanto costerà la corsa?', fr: 'Combien coûtera la course ?' },
  { ar: 'شغّل العداد من فضلك', en: 'Please turn on the meter.', de: 'Bitte schalten Sie das Taxameter ein.', es: 'Por favor, encienda el taxímetro.', it: 'Per favore, accenda il tassametro.', fr: 'Veuillez mettre le compteur, s’il vous plaît.' },
  { ar: 'توقف هنا من فضلك', arAlt: ['اقف هنا', 'على جنب هنا'], en: 'Stop here, please.', de: 'Halten Sie bitte hier an.', es: 'Pare aquí, por favor.', it: 'Si fermi qui, per favore.', fr: 'Arrêtez-vous ici, s’il vous plaît.' },
  { ar: 'إلى وسط المدينة من فضلك', en: 'To the city center, please.', de: 'Ins Stadtzentrum, bitte.', es: 'Al centro de la ciudad, por favor.', it: 'In centro città, per favore.', fr: 'Au centre-ville, s’il vous plaît.' },
  { ar: 'إلى المطار من فضلك', en: 'To the airport, please.', de: 'Zum Flughafen, bitte.', es: 'Al aeropuerto, por favor.', it: 'All’aeroporto, per favore.', fr: 'À l’aéroport, s’il vous plaît.' },
  { ar: 'إلى محطة القطار من فضلك', en: 'To the train station, please.', de: 'Zum Bahnhof, bitte.', es: 'A la estación de tren, por favor.', it: 'Alla stazione ferroviaria, per favore.', fr: 'À la gare, s’il vous plaît.' },
  { ar: 'أين أقرب محطة مترو؟', arAlt: ['محطة المترو فين'], en: 'Where is the nearest metro station?', de: 'Wo ist die nächste U-Bahn-Station?', es: '¿Dónde está la estación de metro más cercana?', it: 'Dov’è la stazione metro più vicina?', fr: 'Où est la station de métro la plus proche ?' },
  { ar: 'أريد تذكرة ذهاب وعودة', en: 'I would like a round-trip ticket.', de: 'Ich möchte eine Hin- und Rückfahrkarte.', es: 'Quisiera un boleto de ida y vuelta.', it: 'Vorrei un biglietto di andata e ritorno.', fr: 'Je voudrais un billet aller-retour.' },
  { ar: 'أريد تذكرة ليوم واحد', en: 'I would like a day pass.', de: 'Ich möchte eine Tageskarte.', es: 'Quisiera un pase de un día.', it: 'Vorrei un biglietto giornaliero.', fr: 'Je voudrais un pass journée.' },
  { ar: 'هل هذا القطار يذهب إلى وسط المدينة؟', en: 'Does this train go to the city center?', de: 'Fährt dieser Zug ins Stadtzentrum?', es: '¿Este tren va al centro?', it: 'Questo treno va in centro?', fr: 'Ce train va-t-il au centre-ville ?' },
  { ar: 'في أي محطة يجب أن أنزل؟', en: 'Which stop should I get off at?', de: 'An welcher Haltestelle muss ich aussteigen?', es: '¿En qué parada debo bajarme?', it: 'A quale fermata devo scendere?', fr: 'À quel arrêt dois-je descendre ?' },
  { ar: 'كم يستغرق الوصول؟', arAlt: ['المشوار ياخد قد إيه'], en: 'How long does it take to get there?', de: 'Wie lange dauert es bis dorthin?', es: '¿Cuánto tiempo se tarda en llegar?', it: 'Quanto tempo ci vuole per arrivare?', fr: 'Combien de temps faut-il pour y arriver ?' },
  { ar: 'انعطف يميناً', en: 'Turn right.', de: 'Biegen Sie rechts ab.', es: 'Gire a la derecha.', it: 'Giri a destra.', fr: 'Tournez à droite.' },
  { ar: 'انعطف يساراً', en: 'Turn left.', de: 'Biegen Sie links ab.', es: 'Gire a la izquierda.', it: 'Giri a sinistra.', fr: 'Tournez à gauche.' },
  { ar: 'سر للأمام مباشرة', en: 'Go straight ahead.', de: 'Gehen Sie geradeaus.', es: 'Siga todo recto.', it: 'Vada sempre dritto.', fr: 'Allez tout droit.' },
  { ar: 'هل هو قريب مشياً؟', arAlt: ['قريب أتمشى له'], en: 'Is it within walking distance?', de: 'Kann man das zu Fuß erreichen?', es: '¿Se puede llegar caminando?', it: 'È raggiungibile a piedi?', fr: 'Est-ce accessible à pied ?' },
  { ar: 'أنا تائه، هل يمكنك مساعدتي؟', arAlt: ['أنا تهت'], en: 'I am lost, can you help me?', de: 'Ich habe mich verlaufen, können Sie mir helfen?', es: 'Estoy perdido, ¿puede ayudarme?', it: 'Mi sono perso, può aiutarmi?', fr: 'Je suis perdu, pouvez-vous m’aider ?' },
  { ar: 'هل تقبل البطاقة في التاكسي؟', en: 'Do you accept credit cards?', de: 'Akzeptieren Sie Kreditkarten?', es: '¿Acepta tarjeta de crédito?', it: 'Accetta carte di credito?', fr: 'Acceptez-vous la carte bancaire ?' },
  { ar: 'احتفظ بالباقي', en: 'Keep the change.', de: 'Stimmt so.', es: 'Quédese con el cambio.', it: 'Tenga pure il resto.', fr: 'Gardez la monnaie.' },
  { ar: 'هل يمكنك إعطائي إيصالاً؟', en: 'Could I have a receipt, please?', de: 'Könnte ich bitte eine Quittung bekommen?', es: '¿Me puede dar un recibo, por favor?', it: 'Posso avere una ricevuta, per favore?', fr: 'Puis-je avoir un reçu, s’il vous plaît ?' },
  { ar: 'أين موقف الحافلات؟', en: 'Where is the bus stop?', de: 'Wo ist die Bushaltestelle?', es: '¿Dónde está la parada de autobús?', it: 'Dov’è la fermata dell’autobus?', fr: 'Où est l’arrêt de bus ?' },
  { ar: 'هل يمكنك انتظاري خمس دقائق؟', en: 'Could you wait for me five minutes?', de: 'Könnten Sie fünf Minuten auf mich warten?', es: '¿Podría esperarme cinco minutos?', it: 'Può aspettarmi cinque minuti?', fr: 'Pouvez-vous m’attendre cinq minutes ?' },
  { ar: 'أنا مستعجل قليلاً', en: 'I am in a bit of a hurry.', de: 'Ich habe es etwas eilig.', es: 'Tengo un poco de prisa.', it: 'Ho un po’ di fretta.', fr: 'Je suis un peu pressé.' },
  { ar: 'ما هو الرصيف الصحيح؟', en: 'Which platform is it?', de: 'Von welchem Gleis fährt er ab?', es: '¿Qué andén es?', it: 'Quale binario è?', fr: 'C’est quel quai ?' },
  { ar: 'هل أحتاج إلى تغيير القطار؟', en: 'Do I need to change trains?', de: 'Muss ich umsteigen?', es: '¿Tengo que hacer transbordo?', it: 'Devo cambiare treno?', fr: 'Dois-je changer de train ?' },
  { ar: 'متى آخر مترو الليلة؟', en: 'When is the last metro tonight?', de: 'Wann fährt heute die letzte U-Bahn?', es: '¿Cuándo es el último metro esta noche?', it: 'Quando è l’ultima metro stasera?', fr: 'À quelle heure est le dernier métro ce soir ?' },
  { ar: 'أين يمكنني شراء تذكرة؟', en: 'Where can I buy a ticket?', de: 'Wo kann ich eine Fahrkarte kaufen?', es: '¿Dónde puedo comprar un boleto?', it: 'Dove posso comprare un biglietto?', fr: 'Où puis-je acheter un billet ?' },
  { ar: 'من فضلك أرني على الخريطة', en: 'Please show me on the map.', de: 'Bitte zeigen Sie es mir auf der Karte.', es: 'Por favor, muéstreme en el mapa.', it: 'Per favore, me lo mostri sulla mappa.', fr: 'Montrez-moi sur la carte, s’il vous plaît.' },
  { ar: 'هل هذا هو الاتجاه الصحيح؟', en: 'Is this the right way?', de: 'Ist das der richtige Weg?', es: '¿Es este el camino correcto?', it: 'È questa la strada giusta?', fr: 'Est-ce la bonne direction ?' },

  // --- Hotel Check-in & Room (81-108) ---
  { ar: 'لدي حجز باسمي', arAlt: ['عندي حجز', 'حاجز أوضة'], en: 'I have a reservation under my name.', de: 'Ich habe eine Reservierung auf meinen Namen.', es: 'Tengo una reserva a mi nombre.', it: 'Ho una prenotazione a mio nome.', fr: 'J’ai une réservation à mon nom.' },
  { ar: 'أريد تسجيل الدخول', en: 'I would like to check in.', de: 'Ich möchte einchecken.', es: 'Quisiera hacer el check-in.', it: 'Vorrei fare il check-in.', fr: 'Je voudrais faire le check-in.' },
  { ar: 'أريد تسجيل المغادرة', en: 'I would like to check out.', de: 'Ich möchte auschecken.', es: 'Quisiera hacer el check-out.', it: 'Vorrei fare il check-out.', fr: 'Je voudrais faire le check-out.' },
  { ar: 'ما هي كلمة سر الواي فاي؟', arAlt: ['باسورد الواي فاي إيه'], en: 'What is the Wi-Fi password?', de: 'Wie lautet das WLAN-Passwort?', es: '¿Cuál es la contraseña del Wi-Fi?', it: 'Qual è la password del Wi-Fi?', fr: 'Quel est le mot de passe du Wi-Fi ?' },
  { ar: 'هل الإفطار مشمول في السعر؟', arAlt: ['الفطار موجود مع الحجز'], en: 'Is breakfast included?', de: 'Ist das Frühstück inbegriffen?', es: '¿Está incluido el desayuno?', it: 'La colazione è inclusa?', fr: 'Le petit-déjeuner est-il inclus ?' },
  { ar: 'متى وقت الإفطار؟', en: 'What time is breakfast served?', de: 'Wann gibt es Frühstück?', es: '¿A qué hora es el desayuno?', it: 'A che ora è la colazione?', fr: 'À quelle heure est le petit-déjeuner ?' },
  { ar: 'التكييف لا يعمل', arAlt: ['التكييف بايظ'], en: 'The air conditioning is not working.', de: 'Die Klimaanlage funktioniert nicht.', es: 'El aire acondicionado no funciona.', it: 'L’aria condizionata non funziona.', fr: 'La climatisation ne fonctionne pas.' },
  { ar: 'مفتاح الغرفة لا يعمل', arAlt: ['الكارت مش بيفتح الباب'], en: 'My room key card is not working.', de: 'Meine Zimmerkarte funktioniert nicht.', es: 'La llave de mi habitación no funciona.', it: 'La chiave della mia camera non funziona.', fr: 'La carte de ma chambre ne fonctionne pas.' },
  { ar: 'لا يوجد ماء ساخن', en: 'There is no hot water.', de: 'Es gibt kein warmes Wasser.', es: 'No hay agua caliente.', it: 'Non c’è acqua calda.', fr: 'Il n’y a pas d’eau chaude.' },
  { ar: 'هل يمكنني تغيير الغرفة؟', en: 'Could I change rooms, please?', de: 'Könnte ich bitte das Zimmer wechseln?', es: '¿Podría cambiar de habitación, por favor?', it: 'Potrei cambiare camera, per favore?', fr: 'Pourrais-je changer de chambre, s’il vous plaît ?' },
  { ar: 'أريد غرفة هادئة', en: 'I would like a quiet room.', de: 'Ich möchte ein ruhiges Zimmer.', es: 'Quisiera una habitación tranquila.', it: 'Vorrei una camera silenziosa.', fr: 'Je voudrais une chambre calme.' },
  { ar: 'هل يمكنني ترك حقائبي هنا؟', arAlt: ['ممكن أسيب الشنط هنا'], en: 'Can I leave my luggage here?', de: 'Kann ich mein Gepäck hier lassen?', es: '¿Puedo dejar mi equipaje aquí?', it: 'Posso lasciare i bagagli qui?', fr: 'Puis-je laisser mes bagages ici ?' },
  { ar: 'أحتاج مناشف إضافية', en: 'I need extra towels, please.', de: 'Ich brauche bitte zusätzliche Handtücher.', es: 'Necesito toallas adicionales, por favor.', it: 'Ho bisogno di asciugamani extra, per favore.', fr: 'J’ai besoin de serviettes supplémentaires, s’il vous plaît.' },
  { ar: 'أحتاج وسادة إضافية', en: 'I need an extra pillow, please.', de: 'Ich brauche bitte ein zusätzliches Kissen.', es: 'Necesito una almohada extra, por favor.', it: 'Ho bisogno di un cuscino extra, per favore.', fr: 'J’ai besoin d’un oreiller supplémentaire, s’il vous plaît.' },
  { ar: 'هل يمكنني المغادرة متأخراً؟', en: 'Is late check-out possible?', de: 'Ist ein später Check-out möglich?', es: '¿Es posible hacer un check-out tardío?', it: 'È possibile il check-out posticipato?', fr: 'Est-il possible de faire un départ tardif ?' },
  { ar: 'أين المصعد؟', en: 'Where is the elevator?', de: 'Wo ist der Aufzug?', es: '¿Dónde está el ascensor?', it: 'Dov’è l’ascensore?', fr: 'Où est l’ascenseur ?' },
  { ar: 'هل لديكم غرفة متاحة لليلة؟', en: 'Do you have a room available for tonight?', de: 'Haben Sie heute Nacht ein Zimmer frei?', es: '¿Tienen una habitación disponible para esta noche?', it: 'Avete una camera libera per stasera?', fr: 'Avez-vous une chambre disponible pour ce soir ?' },
  { ar: 'في أي طابق غرفتي؟', en: 'Which floor is my room on?', de: 'In welchem Stock ist mein Zimmer?', es: '¿En qué piso está mi habitación?', it: 'A che piano è la mia camera?', fr: 'À quel étage est ma chambre ?' },
  { ar: 'الواي فاي لا يعمل في غرفتي', en: 'The Wi-Fi is not working in my room.', de: 'Das WLAN funktioniert in meinem Zimmer nicht.', es: 'El Wi-Fi no funciona en mi habitación.', it: 'Il Wi-Fi non funziona nella mia camera.', fr: 'Le Wi-Fi ne fonctionne pas dans ma chambre.' },
  { ar: 'هل يمكنكم طلب تاكسي لي؟', en: 'Could you call a taxi for me?', de: 'Könnten Sie mir bitte ein Taxi rufen?', es: '¿Podría pedirme un taxi?', it: 'Può chiamarmi un taxi?', fr: 'Pouvez-vous m’appeler un taxi ?' },
  { ar: 'هل يوجد مكيّف في الغرفة؟', en: 'Does the room have air conditioning?', de: 'Hat das Zimmer eine Klimaanlage?', es: '¿La habitación tiene aire acondicionado?', it: 'La camera ha l’aria condizionata?', fr: 'La chambre a-t-elle la climatisation ?' },
  { ar: 'من فضلك نظّف الغرفة', en: 'Please clean the room.', de: 'Bitte reinigen Sie das Zimmer.', es: 'Por favor, limpie la habitación.', it: 'Per favore, pulisca la camera.', fr: 'Veuillez nettoyer la chambre, s’il vous plaît.' },
  { ar: 'لا أريد إزعاجاً من فضلك', en: 'Do not disturb, please.', de: 'Bitte nicht stören.', es: 'No molestar, por favor.', it: 'Non disturbare, per favore.', fr: 'Ne pas déranger, s’il vous plaît.' },
  { ar: 'كم سعر الليلة الواحدة؟', en: 'How much is it per night?', de: 'Wie viel kostet es pro Nacht?', es: '¿Cuánto cuesta por noche?', it: 'Quanto costa a notte?', fr: 'Combien coûte la nuit ?' },
  { ar: 'هل توجد خزنة في الغرفة؟', en: 'Is there a safe in the room?', de: 'Gibt es einen Safe im Zimmer?', es: '¿Hay una caja fuerte en la habitación?', it: 'C’è una cassaforte in camera?', fr: 'Y a-t-il un coffre-fort dans la chambre ?' },
  { ar: 'شكراً على حسن الاستقبال', en: 'Thank you for the warm welcome.', de: 'Vielen Dank für den herzlichen Empfang.', es: 'Gracias por la cálida bienvenida.', it: 'Grazie per la calorosa accoglienza.', fr: 'Merci pour l’accueil chaleureux.' },
  { ar: 'سأمدد إقامتي ليلة إضافية', en: 'I would like to extend my stay one night.', de: 'Ich möchte meinen Aufenthalt um eine Nacht verlängern.', es: 'Quisiera extender mi estancia una noche.', it: 'Vorrei prolungare il soggiorno di una notte.', fr: 'Je voudrais prolonger mon séjour d’une nuit.' },
  { ar: 'أين أقرب صراف آلي؟', en: 'Where is the nearest ATM?', de: 'Wo ist der nächste Geldautomat?', es: '¿Dónde está el cajero automático más cercano?', it: 'Dov’è il bancomat più vicino?', fr: 'Où est le distributeur le plus proche ?' },

  // --- Cafe & Restaurant (109-142) ---
  { ar: 'طاولة لشخص واحد من فضلك', en: 'A table for one, please.', de: 'Einen Tisch für eine Person, bitte.', es: 'Una mesa para uno, por favor.', it: 'Un tavolo per uno, per favore.', fr: 'Une table pour une personne, s’il vous plaît.' },
  { ar: 'طاولة لشخصين من فضلك', en: 'A table for two, please.', de: 'Einen Tisch für zwei Personen, bitte.', es: 'Una mesa para dos, por favor.', it: 'Un tavolo per due, per favore.', fr: 'Une table pour deux, s’il vous plaît.' },
  { ar: 'قائمة الطعام من فضلك', arAlt: ['المنيو لو سمحت'], en: 'The menu, please.', de: 'Die Speisekarte, bitte.', es: 'El menú, por favor.', it: 'Il menu, per favore.', fr: 'La carte, s’il vous plaît.' },
  { ar: 'الحساب من فضلك', arAlt: ['الشيك لو سمحت', 'ممكن الحساب'], en: 'The bill, please.', de: 'Die Rechnung, bitte.', es: 'La cuenta, por favor.', it: 'Il conto, per favore.', fr: 'L’addition, s’il vous plaît.' },
  { ar: 'قهوة سوداء من فضلك', en: 'A black coffee, please.', de: 'Einen schwarzen Kaffee, bitte.', es: 'Un café solo, por favor.', it: 'Un caffè nero, per favore.', fr: 'Un café noir, s’il vous plaît.' },
  { ar: 'كابتشينو من فضلك', en: 'A cappuccino, please.', de: 'Einen Cappuccino, bitte.', es: 'Un capuchino, por favor.', it: 'Un cappuccino, per favore.', fr: 'Un cappuccino, s’il vous plaît.' },
  { ar: 'شاي بالنعناع من فضلك', en: 'Mint tea, please.', de: 'Einen Pfefferminztee, bitte.', es: 'Un té de menta, por favor.', it: 'Un tè alla menta, per favore.', fr: 'Un thé à la menthe, s’il vous plaît.' },
  { ar: 'زجاجة ماء من فضلك', arAlt: ['إزازة مية'], en: 'A bottle of water, please.', de: 'Eine Flasche Wasser, bitte.', es: 'Una botella de agua, por favor.', it: 'Una bottiglia d’acqua, per favore.', fr: 'Une bouteille d’eau, s’il vous plaît.' },
  { ar: 'ماء بدون غازات', en: 'Still water, please.', de: 'Stilles Wasser, bitte.', es: 'Agua sin gas, por favor.', it: 'Acqua naturale, per favore.', fr: 'De l’eau plate, s’il vous plaît.' },
  { ar: 'بدون لحم خنزير من فضلك', arAlt: ['مش باكل خنزير'], en: 'No pork, please.', de: 'Bitte kein Schweinefleisch.', es: 'Sin cerdo, por favor.', it: 'Senza carne di maiale, per favore.', fr: 'Sans porc, s’il vous plaît.' },
  { ar: 'بدون كحول من فضلك', en: 'No alcohol, please.', de: 'Bitte keinen Alkohol.', es: 'Sin alcohol, por favor.', it: 'Senza alcol, per favore.', fr: 'Sans alcool, s’il vous plaît.' },
  { ar: 'هل لديكم أطباق نباتية؟', en: 'Do you have vegetarian dishes?', de: 'Haben Sie vegetarische Gerichte?', es: '¿Tienen platos vegetarianos?', it: 'Avete piatti vegetariani?', fr: 'Avez-vous des plats végétariens ?' },
  { ar: 'لدي حساسية من المكسرات', en: 'I am allergic to nuts.', de: 'Ich bin allergisch gegen Nüsse.', es: 'Soy alérgico a los frutos secos.', it: 'Sono allergico alla frutta secca.', fr: 'Je suis allergique aux noix.' },
  { ar: 'بماذا تنصحني؟', en: 'What do you recommend?', de: 'Was können Sie empfehlen?', es: '¿Qué me recomienda?', it: 'Cosa mi consiglia?', fr: 'Que me recommandez-vous ?' },
  { ar: 'أريد هذا الطبق من فضلك', en: 'I would like this dish, please.', de: 'Ich hätte gern dieses Gericht, bitte.', es: 'Quisiera este plato, por favor.', it: 'Vorrei questo piatto, per favore.', fr: 'Je voudrais ce plat, s’il vous plaît.' },
  { ar: 'للتناول هنا أم للسفري؟', en: 'For here or to go?', de: 'Zum Hieressen oder zum Mitnehmen?', es: '¿Para comer aquí o para llevar?', it: 'Da mangiare qui o da asporto?', fr: 'Sur place ou à emporter ?' },
  { ar: 'للسفري من فضلك', arAlt: ['تيك أواي'], en: 'To go, please.', de: 'Zum Mitnehmen, bitte.', es: 'Para llevar, por favor.', it: 'Da asporto, per favore.', fr: 'À emporter, s’il vous plaît.' },
  { ar: 'الطعام لذيذ جداً', arAlt: ['الأكل تحفة', 'الأكل حلو أوي'], en: 'The food is delicious!', de: 'Das Essen ist sehr lecker!', es: '¡La comida está deliciosa!', it: 'Il cibo è delizioso!', fr: 'La nourriture est délicieuse !' },
  { ar: 'هل يمكنني الدفع بالبطاقة؟', arAlt: ['ممكن أدفع فيزا'], en: 'Can I pay by card?', de: 'Kann ich mit Karte zahlen?', es: '¿Puedo pagar con tarjeta?', it: 'Posso pagare con la carta?', fr: 'Puis-je payer par carte ?' },
  { ar: 'سأدفع نقداً', arAlt: ['هدفع كاش'], en: 'I will pay in cash.', de: 'Ich zahle bar.', es: 'Pagaré en efectivo.', it: 'Pago in contanti.', fr: 'Je vais payer en espèces.' },
  { ar: 'بدون سكر من فضلك', en: 'No sugar, please.', de: 'Ohne Zucker, bitte.', es: 'Sin azúcar, por favor.', it: 'Senza zucchero, per favore.', fr: 'Sans sucre, s’il vous plaît.' },
  { ar: 'قليل من السكر من فضلك', en: 'A little sugar, please.', de: 'Etwas Zucker, bitte.', es: 'Un poco de azúcar, por favor.', it: 'Un po’ di zucchero, per favore.', fr: 'Un peu de sucre, s’il vous plaît.' },
  { ar: 'عصير برتقال طازج من فضلك', en: 'Fresh orange juice, please.', de: 'Einen frisch gepressten Orangensaft, bitte.', es: 'Un jugo de naranja natural, por favor.', it: 'Una spremuta d’arancia, per favore.', fr: 'Un jus d’orange frais, s’il vous plaît.' },
  { ar: 'هل هذا الطبق حار؟', en: 'Is this dish spicy?', de: 'Ist dieses Gericht scharf?', es: '¿Es picante este plato?', it: 'Questo piatto è piccante?', fr: 'Ce plat est-il épicé ?' },
  { ar: 'أريد دجاجاً مشوياً', en: 'I would like grilled chicken.', de: 'Ich möchte gegrilltes Hähnchen.', es: 'Quisiera pollo a la parrilla.', it: 'Vorrei del pollo alla griglia.', fr: 'Je voudrais du poulet grillé.' },
  { ar: 'أريد سمكاً مع أرز', en: 'I would like fish with rice.', de: 'Ich möchte Fisch mit Reis.', es: 'Quisiera pescado con arroz.', it: 'Vorrei pesce con riso.', fr: 'Je voudrais du poisson avec du riz.' },
  { ar: 'هل توجد خدمة واي فاي هنا؟', en: 'Do you have Wi-Fi here?', de: 'Haben Sie hier WLAN?', es: '¿Tienen Wi-Fi aquí?', it: 'Avete il Wi-Fi qui?', fr: 'Avez-vous le Wi-Fi ici ?' },
  { ar: 'شوكة وسكين من فضلك', en: 'A fork and knife, please.', de: 'Gabel und Messer, bitte.', es: 'Un tenedor y un cuchillo, por favor.', it: 'Forchetta e coltello, per favore.', fr: 'Une fourchette et un couteau, s’il vous plaît.' },
  { ar: 'مناديل ورقية من فضلك', en: 'Napkins, please.', de: 'Servietten, bitte.', es: 'Servilletas, por favor.', it: 'Tovaglioli, per favore.', fr: 'Des serviettes, s’il vous plaît.' },
  { ar: 'هل الخدمة مشمولة في الفاتورة؟', en: 'Is service included in the bill?', de: 'Ist das Trinkgeld inbegriffen?', es: '¿El servicio está incluido?', it: 'Il servizio è incluso?', fr: 'Le service est-il compris ?' },
  { ar: 'نريد الدفع بشكل منفصل', en: 'We would like to pay separately.', de: 'Wir möchten getrennt zahlen.', es: 'Quisiéramos pagar por separado.', it: 'Vorremmo pagare separatamente.', fr: 'Nous voudrions payer séparément.' },
  { ar: 'هذا ليس ما طلبته', en: 'This is not what I ordered.', de: 'Das habe ich nicht bestellt.', es: 'Esto no es lo que pedí.', it: 'Questo non è quello che ho ordinato.', fr: 'Ce n’est pas ce que j’ai commandé.' },
  { ar: 'أين أقرب مطعم حلال؟', en: 'Where is the nearest Halal restaurant?', de: 'Wo ist das nächste Halal-Restaurant?', es: '¿Dónde está el restaurante Halal más cercano?', it: 'Dov’è il ristorante Halal più vicino?', fr: 'Où est le restaurant Halal le plus proche ?' },
  { ar: 'شكراً، كانت وجبة رائعة', en: 'Thank you, it was a great meal.', de: 'Danke, es war ein tolles Essen.', es: 'Gracias, fue una comida excelente.', it: 'Grazie, è stato un pasto fantastico.', fr: 'Merci, c’était un excellent repas.' },

  // --- Shopping & Prices (143-166) ---
  { ar: 'أنا فقط أتفرج، شكراً', arAlt: ['بتفرج بس'], en: 'I am just looking, thank you.', de: 'Ich schaue mich nur um, danke.', es: 'Solo estoy mirando, gracias.', it: 'Sto solo guardando, grazie.', fr: 'Je regarde juste, merci.' },
  { ar: 'هل لديكم مقاس أكبر؟', arAlt: ['في مقاس أكبر'], en: 'Do you have a larger size?', de: 'Haben Sie das eine Nummer größer?', es: '¿Tiene una talla más grande?', it: 'Ha una taglia più grande?', fr: 'Avez-vous une taille plus grande ?' },
  { ar: 'هل لديكم مقاس أصغر؟', en: 'Do you have a smaller size?', de: 'Haben Sie das eine Nummer kleiner?', es: '¿Tiene una talla más pequeña?', it: 'Ha una taglia più piccola?', fr: 'Avez-vous une taille plus petite ?' },
  { ar: 'هل يمكنني قياس هذا؟', arAlt: ['ممكن أقيس ده'], en: 'Can I try this on?', de: 'Kann ich das anprobieren?', es: '¿Puedo probarme esto?', it: 'Posso provarlo?', fr: 'Puis-je essayer ceci ?' },
  { ar: 'أين غرفة القياس؟', en: 'Where is the fitting room?', de: 'Wo ist die Umkleidekabine?', es: '¿Dónde está el probador?', it: 'Dov’è il camerino?', fr: 'Où est la cabine d’essayage ?' },
  { ar: 'هل يوجد خصم؟', arAlt: ['في خصم', 'آخره كام'], en: 'Is there a discount?', de: 'Gibt es einen Rabatt?', es: '¿Hay algún descuento?', it: 'C’è uno sconto?', fr: 'Y a-t-il une réduction ?' },
  { ar: 'هذا غالٍ قليلاً', arAlt: ['غالي شوية'], en: 'This is a bit expensive.', de: 'Das ist etwas teuer.', es: 'Esto es un poco caro.', it: 'Questo è un po’ caro.', fr: 'C’est un peu cher.' },
  { ar: 'سآخذ هذا', arAlt: ['هاخد ده'], en: 'I will take this one.', de: 'Ich nehme das hier.', es: 'Me llevo este.', it: 'Prendo questo.', fr: 'Je vais prendre celui-ci.' },
  { ar: 'هل لديكم لون آخر؟', en: 'Do you have another color?', de: 'Haben Sie das in einer anderen Farbe?', es: '¿Tiene otro color?', it: 'Ha un altro colore?', fr: 'Avez-vous une autre couleur ?' },
  { ar: 'هل يمكنني استرجاع الضريبة؟', en: 'Can I get a tax-free form?', de: 'Kann ich ein Tax-Free-Formular bekommen?', es: '¿Puedo obtener el formulario Tax-Free?', it: 'Posso avere il modulo Tax-Free?', fr: 'Puis-je avoir un bordereau de détaxe ?' },
  { ar: 'هل يمكنني إرجاع هذا؟', en: 'Can I return this?', de: 'Kann ich das zurückgeben?', es: '¿Puedo devolver esto?', it: 'Posso restituire questo?', fr: 'Puis-je retourner ceci ?' },
  { ar: 'أريد كيساً من فضلك', en: 'A bag, please.', de: 'Eine Tüte, bitte.', es: 'Una bolsa, por favor.', it: 'Una busta, per favore.', fr: 'Un sac, s’il vous plaît.' },
  { ar: 'أبحث عن هدية تذكارية', en: 'I am looking for a souvenir.', de: 'Ich suche ein Souvenir.', es: 'Estoy buscando un recuerdo.', it: 'Cerco un souvenir.', fr: 'Je cherche un souvenir.' },
  { ar: 'متى يغلق المحل؟', en: 'What time does the store close?', de: 'Wann schließt das Geschäft?', es: '¿A qué hora cierra la tienda?', it: 'A che ora chiude il negozio?', fr: 'À quelle heure ferme le magasin ?' },
  { ar: 'هل هذا أصلي؟', en: 'Is this authentic?', de: 'Ist das echt?', es: '¿Es esto auténtico?', it: 'È autentico?', fr: 'Est-ce authentique ?' },
  { ar: 'هل تقبلون الدفع بالهاتف؟', en: 'Do you accept contactless payment?', de: 'Akzeptieren Sie kontaktloses Bezahlen?', es: '¿Aceptan pago sin contacto?', it: 'Accettate pagamenti contactless?', fr: 'Acceptez-vous le paiement sans contact ?' },
  { ar: 'أريد مقاس متوسط', en: 'I wear a medium size.', de: 'Ich trage Größe M.', es: 'Uso talla mediana.', it: 'Porto la taglia media.', fr: 'Je fais une taille M.' },
  { ar: 'أريد مقاس كبير', en: 'I wear a large size.', de: 'Ich trage Größe L.', es: 'Uso talla grande.', it: 'Porto la taglia grande.', fr: 'Je fais une taille L.' },
  { ar: 'أين السوبر ماركت؟', en: 'Where is the supermarket?', de: 'Wo ist der Supermarkt?', es: '¿Dónde está el supermercado?', it: 'Dov’è il supermercato?', fr: 'Où est le supermarché ?' },
  { ar: 'شكراً، سأفكر في الأمر', en: 'Thanks, I will think about it.', de: 'Danke, ich überlege es mir.', es: 'Gracias, lo pensaré.', it: 'Grazie, ci penserò.', fr: 'Merci, je vais y réfléchir.' },
  { ar: 'هل يوجد ضمان؟', en: 'Is there a warranty?', de: 'Gibt es eine Garantie?', es: '¿Tiene garantía?', it: 'C’è una garanzia?', fr: 'Y a-t-il une garantie ?' },
  { ar: 'أريد شاحن هاتف', en: 'I need a phone charger.', de: 'Ich brauche ein Handyladegerät.', es: 'Necesito un cargador de teléfono.', it: 'Ho bisogno di un caricabatterie.', fr: 'J’ai besoin d’un chargeur de téléphone.' },
  { ar: 'أريد محوّل كهرباء للسفر', en: 'I need a travel power adapter.', de: 'Ich brauche einen Reiseadapter.', es: 'Necesito un adaptador de viaje.', it: 'Ho bisogno di un adattatore da viaggio.', fr: 'J’ai besoin d’un adaptateur de voyage.' },
  { ar: 'هل يمكن تغليفها كهدية؟', en: 'Can you gift-wrap this?', de: 'Können Sie das als Geschenk einpacken?', es: '¿Puede envolverlo para regalo?', it: 'Può fare un pacchetto regalo?', fr: 'Pouvez-vous l’emballer comme cadeau ?' },

  // --- Pharmacy & Medical Emergency (167-186) ---
  { ar: 'أين أقرب صيدلية؟', arAlt: ['الصيدلية فين'], en: 'Where is the nearest pharmacy?', de: 'Wo ist die nächste Apotheke?', es: '¿Dónde está la farmacia más cercana?', it: 'Dov’è la farmacia più vicina?', fr: 'Où est la pharmacie la plus proche ?' },
  { ar: 'عندي صداع شديد', arAlt: ['دماغي بتوجعني', 'عندي صداع'], en: 'I have a bad headache.', de: 'Ich habe starke Kopfschmerzen.', es: 'Tengo un fuerte dolor de cabeza.', it: 'Ho un forte mal di testa.', fr: 'J’ai un fort mal de tête.' },
  { ar: 'عندي حمى', arAlt: ['سخن', 'عندي سخونية'], en: 'I have a fever.', de: 'Ich habe Fieber.', es: 'Tengo fiebre.', it: 'Ho la febbre.', fr: 'J’ai de la fièvre.' },
  { ar: 'عندي ألم في المعدة', arAlt: ['بطني بتوجعني'], en: 'I have a stomachache.', de: 'Ich habe Bauchschmerzen.', es: 'Tengo dolor de estómago.', it: 'Ho mal di stomaco.', fr: 'J’ai mal au ventre.' },
  { ar: 'عندي برد وزكام', en: 'I have a cold.', de: 'Ich bin erkältet.', es: 'Tengo un resfriado.', it: 'Ho il raffreddore.', fr: 'J’ai un rhume.' },
  { ar: 'أحتاج مسكن ألم', arAlt: ['عايز مسكن'], en: 'I need painkillers.', de: 'Ich brauche Schmerzmittel.', es: 'Necesito analgésicos.', it: 'Ho bisogno di antidolorifici.', fr: 'J’ai besoin d’antidouleurs.' },
  { ar: 'كم مرة آخذ هذا الدواء؟', en: 'How often should I take this medicine?', de: 'Wie oft soll ich dieses Medikament nehmen?', es: '¿Con qué frecuencia debo tomar esta medicina?', it: 'Quanto spesso devo prendere questa medicina?', fr: 'À quelle fréquence dois-je prendre ce médicament ?' },
  { ar: 'هل أحتاج إلى وصفة طبية؟', en: 'Do I need a prescription?', de: 'Brauche ich ein Rezept?', es: '¿Necesito receta médica?', it: 'Serve la ricetta medica?', fr: 'Ai-je besoin d’une ordonnance ?' },
  { ar: 'لدي تأمين سفر صحي', en: 'I have travel medical insurance.', de: 'Ich habe eine Reisekrankenversicherung.', es: 'Tengo seguro médico de viaje.', it: 'Ho un’assicurazione medica di viaggio.', fr: 'J’ai une assurance médicale de voyage.' },
  { ar: 'أحتاج طبيباً فوراً', en: 'I need a doctor right away.', de: 'Ich brauche sofort einen Arzt.', es: 'Necesito un médico de inmediato.', it: 'Ho bisogno subito di un medico.', fr: 'J’ai besoin d’un médecin tout de suite.' },
  { ar: 'اتصل بالإسعاف من فضلك', arAlt: ['اطلب الإسعاف'], en: 'Call an ambulance, please!', de: 'Rufen Sie bitte einen Krankenwagen!', es: '¡Llame a una ambulancia, por favor!', it: 'Chiami un’ambulanza, per favore!', fr: 'Appelez une ambulance, s’il vous plaît !' },
  { ar: 'أين أقرب مستشفى؟', en: 'Where is the nearest hospital?', de: 'Wo ist das nächste Krankenhaus?', es: '¿Dónde está el hospital más cercano?', it: 'Dov’è l’ospedale più vicino?', fr: 'Où est l’hôpital le plus proche ?' },
  { ar: 'لدي حساسية من هذا الدواء', en: 'I am allergic to this medication.', de: 'Ich bin allergisch gegen dieses Medikament.', es: 'Soy alérgico a este medicamento.', it: 'Sono allergico a questo farmaco.', fr: 'Je suis allergique à ce médicament.' },
  { ar: 'أشعر بدوار', en: 'I feel dizzy.', de: 'Mir ist schwindelig.', es: 'Me siento mareado.', it: 'Ho le vertigini.', fr: 'J’ai des vertiges.' },
  { ar: 'جرحت يدي', en: 'I cut my hand.', de: 'Ich habe mich an der Hand geschnitten.', es: 'Me corté la mano.', it: 'Mi sono tagliato la mano.', fr: 'Je me suis coupé la main.' },
  { ar: 'أحتاج لاصق جروح', en: 'I need bandages.', de: 'Ich brauche Pflaster.', es: 'Necesito curitas.', it: 'Ho bisogno di cerotti.', fr: 'J’ai besoin de pansements.' },
  { ar: 'أحتاج دواء للسعال', en: 'I need cough medicine.', de: 'Ich brauche Hustenmedizin.', es: 'Necesito jarabe para la tos.', it: 'Ho bisogno di uno sciroppo per la tosse.', fr: 'J’ai besoin d’un sirop pour la toux.' },
  { ar: 'هل يسبب هذا الدواء النعاس؟', en: 'Does this medicine cause drowsiness?', de: 'Macht dieses Medikament müde?', es: '¿Esta medicina da sueño?', it: 'Questa medicina provoca sonnolenza?', fr: 'Ce médicament provoque-t-il de la somnolence ?' },
  { ar: 'آخذ هذا قبل الأكل أم بعده؟', en: 'Before or after meals?', de: 'Vor oder nach dem Essen?', es: '¿Antes o después de las comidas?', it: 'Prima o dopo i pasti?', fr: 'Avant ou après les repas ?' },
  { ar: 'أشعر بتحسن الآن، شكراً', en: 'I feel better now, thank you.', de: 'Mir geht es jetzt besser, danke.', es: 'Me siento mejor ahora, gracias.', it: 'Ora mi sento meglio, grazie.', fr: 'Je me sens mieux maintenant, merci.' },

  // --- Street Small Talk & Making a Friend (187-202) ---
  { ar: 'من أين أنت؟', arAlt: ['أنت منين'], en: 'Where are you from?', de: 'Woher kommen Sie?', es: '¿De dónde eres?', it: 'Di dove sei?', fr: 'D’où viens-tu ?' },
  { ar: 'مدينتك جميلة جداً', en: 'Your city is very beautiful!', de: 'Deine Stadt ist wunderschön!', es: '¡Tu ciudad es muy hermosa!', it: 'La tua città è bellissima!', fr: 'Ta ville est très belle !' },
  { ar: 'ما هي أفضل الأماكن للزيارة هنا؟', en: 'What are the best places to visit here?', de: 'Welche Orte sollte man hier unbedingt besuchen?', es: '¿Cuáles son los mejores lugares para visitar aquí?', it: 'Quali sono i posti migliori da visitare qui?', fr: 'Quels sont les meilleurs endroits à visiter ici ?' },
  { ar: 'أحب التصوير والسفر', en: 'I love photography and traveling.', de: 'Ich liebe Fotografie und Reisen.', es: 'Me encanta la fotografía y viajar.', it: 'Amo la fotografia e viaggiare.', fr: 'J’adore la photographie et les voyages.' },
  { ar: 'هل زرت مصر من قبل؟', en: 'Have you ever visited Egypt?', de: 'Warst du schon einmal in Ägypten?', es: '¿Has visitado Egipto alguna vez?', it: 'Hai mai visitato l’Egitto?', fr: 'As-tu déjà visité l’Égypte ?' },
  { ar: 'أنت مرحّب بك في مصر دائماً', en: 'You are always welcome in Egypt!', de: 'Du bist in Ägypten immer willkommen!', es: '¡Siempre eres bienvenido en Egipto!', it: 'Sei sempre il benvenuto in Egitto!', fr: 'Tu es toujours le bienvenu en Égypte !' },
  { ar: 'هل يمكنني التقاط صورة هنا؟', en: 'Can I take a photo here?', de: 'Darf ich hier ein Foto machen?', es: '¿Puedo tomar una foto aquí?', it: 'Posso fare una foto qui?', fr: 'Puis-je prendre une photo ici ?' },
  { ar: 'هل يمكنك التقاط صورة لي؟', en: 'Could you take a photo of me?', de: 'Könntest du ein Foto von mir machen?', es: '¿Podrías tomarme una foto?', it: 'Potresti farmi una foto?', fr: 'Pourrais-tu me prendre en photo ?' },
  { ar: 'هل لديك إنستغرام أو واتساب؟', en: 'Do you have Instagram or WhatsApp?', de: 'Hast du Instagram oder WhatsApp?', es: '¿Tienes Instagram o WhatsApp?', it: 'Hai Instagram o WhatsApp?', fr: 'As-tu Instagram ou WhatsApp ?' },
  { ar: 'دعنا نبقى على تواصل', en: 'Let’s stay in touch!', de: 'Lass uns in Kontakt bleiben!', es: '¡Sigamos en contacto!', it: 'Restiamo in contatto!', fr: 'Restons en contact !' },
  { ar: 'أنا أتعلم لغتك الآن', en: 'I am learning your language now.', de: 'Ich lerne gerade deine Sprache.', es: 'Estoy aprendiendo tu idioma ahora.', it: 'Sto imparando la tua lingua adesso.', fr: 'J’apprends ta langue en ce moment.' },
  { ar: 'كيف تقول هذا بلغتك؟', en: 'How do you say this in your language?', de: 'Wie sagt man das in deiner Sprache?', es: '¿Cómo se dice esto en tu idioma?', it: 'Come si dice questo nella tua lingua?', fr: 'Comment dit-on cela dans ta langue ?' },
  { ar: 'أحب كرة القدم والموسيقى', en: 'I love football and music.', de: 'Ich liebe Fußball und Musik.', es: 'Me encanta el fútbol y la música.', it: 'Amo il calcio e la musica.', fr: 'J’adore le football et la musique.' },
  { ar: 'الطقس جميل اليوم', en: 'The weather is lovely today.', de: 'Das Wetter ist heute schön.', es: 'Hace buen tiempo hoy.', it: 'Il tempo è bello oggi.', fr: 'Il fait beau aujourd’hui.' },
  { ar: 'استمتعت بالحديث معك', en: 'I enjoyed talking with you.', de: 'Es hat Spaß gemacht, mit dir zu reden.', es: 'Disfruté hablar contigo.', it: 'Mi è piaciuto parlare con te.', fr: 'J’ai aimé discuter avec toi.' },
  { ar: 'أتمنى لك يوماً سعيداً', en: 'Have a wonderful day!', de: 'Ich wünsche dir einen schönen Tag!', es: '¡Que tengas un excelente día!', it: 'Buona giornata!', fr: 'Passe une excellente journée !' },

  // --- Lost Item & Police Emergency (203-216) ---
  { ar: 'فقدت جواز سفري', arAlt: ['الباسبور ضاع', 'ضاع جواز سفري'], en: 'I lost my passport.', de: 'Ich habe meinen Reisepass verloren.', es: 'Perdí mi pasaporte.', it: 'Ho perso il mio passaporto.', fr: 'J’ai perdu mon passeport.' },
  { ar: 'فقدت حقيبتي', arAlt: ['شنطتي ضاعت'], en: 'I lost my bag.', de: 'Ich habe meine Tasche verloren.', es: 'Perdí mi bolso.', it: 'Ho perso la mia borsa.', fr: 'J’ai perdu mon sac.' },
  { ar: 'فقدت هاتفي', arAlt: ['موبايلي ضاع'], en: 'I lost my phone.', de: 'Ich habe mein Handy verloren.', es: 'Perdí mi teléfono.', it: 'Ho perso il mio telefono.', fr: 'J’ai perdu mon téléphone.' },
  { ar: 'سُرقت محفظتي', arAlt: ['محفظتي اتسرقت'], en: 'My wallet was stolen.', de: 'Meine Brieftasche wurde gestohlen.', es: 'Me robaron la cartera.', it: 'Mi hanno rubato il portafoglio.', fr: 'On m’a volé mon portefeuille.' },
  { ar: 'أين أقرب مركز شرطة؟', en: 'Where is the nearest police station?', de: 'Wo ist die nächste Polizeiwache?', es: '¿Dónde está la comisaría más cercana?', it: 'Dov’è la stazione di polizia più vicina?', fr: 'Où est le commissariat le plus proche ?' },
  { ar: 'أحتاج إلى محضر شرطة للتأمين', en: 'I need a police report for insurance.', de: 'Ich brauche einen Polizeibericht für die Versicherung.', es: 'Necesito un informe policial para el seguro.', it: 'Ho bisogno di una denuncia per l’assicurazione.', fr: 'J’ai besoin d’un rapport de police pour l’assurance.' },
  { ar: 'أين السفارة المصرية؟', en: 'Where is the Egyptian Embassy?', de: 'Wo ist die ägyptische Botschaft?', es: '¿Dónde está la Embajada de Egipto?', it: 'Dov’è l’Ambasciata d’Egitto?', fr: 'Où est l’Ambassade d’Égypte ?' },
  { ar: 'لدي صورة من جواز سفري على هاتفي', en: 'I have a photo of my passport on my phone.', de: 'Ich habe ein Foto meines Passes auf meinem Handy.', es: 'Tengo una foto de mi pasaporte en mi teléfono.', it: 'Ho una foto del passaporto sul telefono.', fr: 'J’ai une photo de mon passeport sur mon téléphone.' },
  { ar: 'اتصل بالشرطة من فضلك', en: 'Please call the police!', de: 'Bitte rufen Sie die Polizei!', es: '¡Por favor, llame a la policía!', it: 'Per favore, chiami la polizia!', fr: 'Veuillez appeler la police !' },
  { ar: 'رأيتها آخر مرة في محطة المترو', en: 'I last saw it at the metro station.', de: 'Ich habe es zuletzt an der U-Bahn-Station gesehen.', es: 'Lo vi por última vez en la estación de metro.', it: 'L’ho visto l’ultima volta in metropolitana.', fr: 'Je l’ai vu pour la dernière fois au métro.' },
  { ar: 'هل وجد أحد حقيبة سوداء؟', en: 'Has anyone found a black bag?', de: 'Hat jemand eine schwarze Tasche gefunden?', es: '¿Alguien ha encontrado un bolso negro?', it: 'Qualcuno ha trovato una borsa nera?', fr: 'Quelqu’un a-t-il trouvé un sac noir ?' },
  { ar: 'أين مكتب المفقودات؟', en: 'Where is the lost and found office?', de: 'Wo ist das Fundbüro?', es: '¿Dónde está la oficina de objetos perdidos?', it: 'Dov’è l’ufficio oggetti smarriti?', fr: 'Où est le bureau des objets trouvés ?' },
  { ar: 'هذا رقم هاتفي', en: 'Here is my phone number.', de: 'Hier ist meine Telefonnummer.', es: 'Aquí está mi número de teléfono.', it: 'Ecco il mio numero di telefono.', fr: 'Voici mon numéro de téléphone.' },
  { ar: 'شكراً جزيلاً على مساعدتك السريعة', en: 'Thank you so much for your quick help.', de: 'Vielen Dank für Ihre schnelle Hilfe.', es: 'Muchas gracias por su rápida ayuda.', it: 'Grazie mille per il suo rapido aiuto.', fr: 'Merci beaucoup pour votre aide rapide.' },
];

function normalizeForMatch(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // strip Arabic diacritics
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[؟?!.,;:'"()’‘«»¡¿]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i += 1) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j += 1) {
      const temp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return dp[n];
}

export function computePhraseSimilarity(input: string, candidate: string): number {
  const normA = normalizeForMatch(input);
  const normB = normalizeForMatch(candidate);
  if (!normA || !normB) return 0;
  if (normA === normB) return 1;

  // Substring containment boost for short travel queries
  if (normB.includes(normA) && normA.length >= 4) {
    return Math.max(0.82, normA.length / normB.length);
  }
  if (normA.includes(normB) && normB.length >= 4) {
    return Math.max(0.8, normB.length / normA.length);
  }

  const maxLen = Math.max(normA.length, normB.length);
  const levSim = 1 - levenshteinDistance(normA, normB) / maxLen;

  const tokensA = new Set(normA.split(' ').filter(Boolean));
  const tokensB = new Set(normB.split(' ').filter(Boolean));
  let overlap = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) overlap += 1;
  }
  const union = new Set([...tokensA, ...tokensB]).size || 1;
  const jaccard = overlap / union;

  return Math.max(levSim, jaccard * 0.95);
}

/**
 * Exact + fuzzy match against the 210+ sentence offline Travel Phrasebook (0 ms).
 */
export function matchTravelPhrasebook(
  text: string,
  sourceLang: TranslatorLangCode,
  targetLang: TranslatorLangCode
): { translatedText: string; score: number } | null {
  const clean = text.trim();
  if (!clean) return null;
  if (sourceLang === targetLang) return { translatedText: clean, score: 1 };

  let bestScore = 0;
  let bestTarget = '';

  for (const entry of TRAVEL_PHRASEBOOK) {
    const candidates = sourceLang === 'ar' ? [entry.ar, ...(entry.arAlt || [])] : [entry[sourceLang]];
    for (const cand of candidates) {
      const score = computePhraseSimilarity(clean, cand);
      if (score > bestScore) {
        bestScore = score;
        bestTarget = entry[targetLang];
      }
      if (bestScore >= 0.99) {
        return { translatedText: bestTarget, score: 1 };
      }
    }
  }

  if (bestScore >= 0.45 && bestTarget) {
    return { translatedText: bestTarget, score: Number(bestScore.toFixed(2)) };
  }
  return null;
}

function getOptionalByokGeminiKey(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const keys = ['tb_gemini_api_key', 'gemini_api_key', 'BYOK_GEMINI_KEY'];
    for (const k of keys) {
      const val = localStorage.getItem(k);
      if (val && val.trim().length > 20) return val.trim();
    }
  } catch {}
  return null;
}

async function translateViaByokGemini(
  text: string,
  sourceLang: TranslatorLangCode,
  targetLang: TranslatorLangCode,
  apiKey: string
): Promise<string | null> {
  if (typeof fetch === 'undefined') return null;
  const langNames: Record<TranslatorLangCode, string> = {
    ar: 'Arabic',
    en: 'English',
    de: 'German',
    es: 'Spanish',
    it: 'Italian',
    fr: 'French',
  };
  const prompt = `Translate this travel phrase naturally from ${langNames[sourceLang]} to ${langNames[targetLang]}. Return ONLY the translated text without quotes or explanation:\n${text}`;
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const out = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof out === 'string' && out.trim() ? out.trim() : null;
  } catch {
    return null;
  }
}

export async function getLocalTranslatorModelStatus(options: {
  sourceLang: string;
  targetLang: string;
}): Promise<ModelStatusResult> {
  const sourceLang = normalizeTranslatorLang(options.sourceLang);
  const targetLang = normalizeTranslatorLang(options.targetLang);

  if (!Capacitor.isNativePlatform()) {
    return {
      downloaded: true,
      sourceDownloaded: true,
      targetDownloaded: true,
      estimatedSizeMb: 0,
      sourceLang,
      targetLang,
      isWebFallback: true,
    };
  }

  try {
    return await NativeLocalTranslator.getModelStatus({ sourceLang, targetLang });
  } catch {
    return {
      downloaded: false,
      sourceDownloaded: false,
      targetDownloaded: false,
      estimatedSizeMb: 30,
      sourceLang,
      targetLang,
    };
  }
}

export async function downloadLocalTranslatorModel(options: {
  sourceLang: string;
  targetLang: string;
}): Promise<DownloadModelResult> {
  const sourceLang = normalizeTranslatorLang(options.sourceLang);
  const targetLang = normalizeTranslatorLang(options.targetLang);

  if (!Capacitor.isNativePlatform()) {
    return { downloaded: true, sourceLang, targetLang, durationMs: 0 };
  }

  return NativeLocalTranslator.downloadModel({ sourceLang, targetLang });
}

export async function deleteLocalTranslatorModel(options: {
  lang: string;
}): Promise<DeleteModelResult> {
  const lang = normalizeTranslatorLang(options.lang);
  if (!Capacitor.isNativePlatform()) {
    return { deleted: true, lang };
  }
  return NativeLocalTranslator.deleteModel({ lang });
}

export async function translateLocally(options: {
  text: string;
  sourceLang: string;
  targetLang: string;
}): Promise<TranslateResult> {
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const text = options.text.trim();
  const sourceLang = normalizeTranslatorLang(options.sourceLang);
  const targetLang = normalizeTranslatorLang(options.targetLang);

  if (!text) {
    return { translatedText: '', latencyMs: 0, engine: 'passthrough' };
  }

  if (sourceLang === targetLang) {
    return { translatedText: text, latencyMs: 0, engine: 'passthrough' };
  }

  // 1. Native Android ML Kit On-Device Translation (<150ms, 100% offline once downloaded)
  if (Capacitor.isNativePlatform()) {
    try {
      const nativeRes = await NativeLocalTranslator.translate({ text, sourceLang, targetLang });
      if (nativeRes && nativeRes.translatedText) {
        return {
          translatedText: nativeRes.translatedText,
          latencyMs: Number(nativeRes.latencyMs) || 0,
          engine: 'mlkit-offline',
        };
      }
    } catch {
      // If ML Kit model isn't downloaded yet, seamlessly fall back to instant 210+ phrasebook
      const offlineHit = matchTravelPhrasebook(text, sourceLang, targetLang);
      if (offlineHit) {
        return {
          translatedText: offlineHit.translatedText,
          latencyMs: 0,
          engine: 'phrasebook-offline',
          matchedScore: offlineHit.score,
        };
      }
      throw new Error('MODEL_NOT_DOWNLOADED');
    }
  }

  // 2. Web Fallback (tb-eg.vercel.app): Instant 0ms offline Travel Phrasebook (210+ sentences)
  const phraseMatch = matchTravelPhrasebook(text, sourceLang, targetLang);
  if (phraseMatch && phraseMatch.score >= 0.65) {
    return {
      translatedText: phraseMatch.translatedText,
      latencyMs: 0,
      engine: 'phrasebook-offline',
      matchedScore: phraseMatch.score,
      isWebFallback: true,
    };
  }

  // 3. Optional BYOK Gemini fallback on Web if user configured a key and is online
  const byokKey = getOptionalByokGeminiKey();
  const isOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
  if (byokKey && isOnline) {
    const geminiText = await translateViaByokGemini(text, sourceLang, targetLang, byokKey);
    if (geminiText) {
      const elapsed = Math.round(
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt
      );
      return {
        translatedText: geminiText,
        latencyMs: elapsed,
        engine: 'byok-gemini',
        isWebFallback: true,
      };
    }
  }

  // 4. Return best fuzzy phrasebook match if available, otherwise polite passthrough
  if (phraseMatch) {
    return {
      translatedText: phraseMatch.translatedText,
      latencyMs: 0,
      engine: 'phrasebook-offline',
      matchedScore: phraseMatch.score,
      isWebFallback: true,
    };
  }

  return {
    translatedText: text,
    latencyMs: 0,
    engine: 'passthrough',
    isWebFallback: true,
  };
}
