import { StoryChapter } from '../types/story';

export const chapter1: StoryChapter = {
  id: 'chapter-1-cairo-airport',
  title: {
    ar: 'الفصل الأول: مطار القاهرة',
    en: 'Chapter 1: Cairo Airport',
    de: 'Kapitel 1: Flughafen Kairo',
    fr: 'Chapitre 1 : Aéroport du Caire',
    es: 'Capítulo 1: Aeropuerto de El Cairo',
    ja: '第1章：カイロ空港',
    zh: '第一章：开罗机场',
  },
  description: {
    ar: 'تبدأ رحلتك في تعلم اللغة من لحظة وصولك للمطار.',
    en: 'Your language learning journey begins the moment you arrive at the airport.',
    de: 'Deine Sprachlernreise beginnt in dem Moment, in dem du am Flughafen ankommst.',
    fr: 'Votre voyage d\'apprentissage linguistique commence dès votre arrivée à l\'aéroport.',
    es: 'Tu viaje de aprendizaje de idiomas comienza en el momento en que llegas al aeropuerto.',
    ja: '語学学習の旅は、空港に到着した瞬間から始まります。',
    zh: '你的语言学习之旅从抵达机场的那一刻开始。',
  },
  startSceneId: 'scene-1',
  scenes: {
    'scene-1': {
      id: 'scene-1',
      imageUrl: '/images/cairo-airport.jpg',
      characterName: {
        ar: 'أمين المطار',
        en: 'Airport Security',
        de: 'Flughafensicherheit',
        fr: 'Sécurité de l\'aéroport',
        es: 'Seguridad del aeropuerto',
        ja: '空港警備員',
        zh: '机场保安',
      },
      text: {
        ar: 'أهلاً بك في القاهرة. هل يمكنني رؤية جواز سفرك؟',
        en: 'Welcome to Cairo. Can I see your passport?',
        de: 'Willkommen in Kairo. Kann ich Ihren Reisepass sehen?',
        fr: 'Bienvenue au Caire. Puis-je voir votre passeport ?',
        es: 'Bienvenido a El Cairo. ¿Puedo ver su pasaporte?',
        ja: 'カイロへようこそ。パスポートを見せていただけますか？',
        zh: '欢迎来到开罗。我能看看您的护照吗？',
      },
      choices: [
        {
          id: 'choice-1',
          text: {
            ar: 'نعم، تفضل. هذا جواز سفري.',
            en: 'Yes, here you go. This is my passport.',
            de: 'Ja, bitte schön. Das ist mein Reisepass.',
            fr: 'Oui, voici. C\'est mon passeport.',
            es: 'Sí, aquí tiene. Este es mi pasaporte.',
            ja: 'はい、どうぞ。これが私のパスポートです。',
            zh: '是的，给您。这是我的护照。',
          },
          nextSceneId: 'scene-2',
          isCorrect: true,
          feedback: {
            ar: 'أحسنت! هذا هو الرد الصحيح.',
            en: 'Great job! That is the correct response.',
            de: 'Gut gemacht! Das ist die richtige Antwort.',
            fr: 'Bon travail ! C\'est la bonne réponse.',
            es: '¡Buen trabajo! Esa es la respuesta correcta.',
            ja: 'よくできました！それが正解です。',
            zh: '做得好！那是正确的回应。',
          }
        },
        {
          id: 'choice-2',
          text: {
            ar: 'لا، أنا لا أتحدث الإنجليزية.',
            en: 'No, I don\'t speak English.',
            de: 'Nein, ich spreche kein Englisch.',
            fr: 'Non, je ne parle pas anglais.',
            es: 'No, no hablo inglés.',
            ja: 'いいえ、英語は話せません。',
            zh: '不，我不会说英语。',
          },
          nextSceneId: 'scene-1-fail',
          isCorrect: false,
          feedback: {
            ar: 'ماذا؟! أنت في مطار! حاول مرة أخرى.',
            en: 'What?! You are at an airport! Try again.',
            de: 'Was?! Du bist am Flughafen! Versuch es noch einmal.',
            fr: 'Quoi ?! Vous êtes à l\'aéroport ! Réessayez.',
            es: '¿¡Qué!? ¡Estás en un aeropuerto! Inténtalo de nuevo.',
            ja: '何ですって？！空港ですよ！もう一度試してください。',
            zh: '什么？！你在机场！再试一次。',
          }
        }
      ]
    },
    'scene-1-fail': {
      id: 'scene-1-fail',
      imageUrl: '/images/cairo-airport-confused.jpg',
      characterName: {
        ar: 'أمين المطار',
        en: 'Airport Security',
        de: 'Flughafensicherheit',
        fr: 'Sécurité de l\'aéroport',
        es: 'Seguridad del aeropuerto',
        ja: '空港警備員',
        zh: '机场保安',
      },
      text: {
        ar: 'لا تفهم؟ حسناً، انتظر هنا قليلاً.',
        en: 'You don\'t understand? Okay, wait here a moment.',
        de: 'Du verstehst nicht? Okay, warte einen Moment hier.',
        fr: 'Vous ne comprenez pas ? D\'accord, attendez ici un instant.',
        es: '¿No entiendes? Está bien, espera aquí un momento.',
        ja: '分かりませんか？では、ここで少しお待ちください。',
        zh: '你不明白吗？好的，在这里等一下。',
      },
      choices: [
        {
          id: 'choice-1-retry',
          text: {
            ar: 'آسف، أنا أتعلم. تفضل جواز سفري.',
            en: 'Sorry, I am learning. Here is my passport.',
            de: 'Entschuldigung, ich lerne. Hier ist mein Reisepass.',
            fr: 'Désolé, j\'apprends. Voici mon passeport.',
            es: 'Lo siento, estoy aprendiendo. Aquí está mi pasaporte.',
            ja: 'すみません、勉強中です。これが私のパスポートです。',
            zh: '对不起，我在学习。这是我的护照。',
          },
          nextSceneId: 'scene-2',
          isCorrect: true,
          feedback: {
            ar: 'عمل رائع! الاستمرار في المحاولة هو مفتاح التعلم.',
            en: 'Great job! Continuing to try is the key to learning.',
            de: 'Tolle Arbeit! Weiter zu versuchen ist der Schlüssel zum Lernen.',
            fr: 'Bon travail ! Continuer d\'essayer est la clé de l\'apprentissage.',
            es: '¡Buen trabajo! Seguir intentándolo es la clave del aprendizaje.',
            ja: '素晴らしい！挑戦し続けることが学習の鍵です。',
            zh: '做得好！不断尝试是学习的关键。',
          }
        }
      ]
    },
    'scene-2': {
      id: 'scene-2',
      imageUrl: '/images/cairo-airport-smiling.jpg',
      characterName: {
        ar: 'أمين المطار',
        en: 'Airport Security',
        de: 'Flughafensicherheit',
        fr: 'Sécurité de l\'aéroport',
        es: 'Seguridad del aeropuerto',
        ja: '空港警備員',
        zh: '机场保安',
      },
      text: {
        ar: 'شكراً لك. هل أنت هنا للعمل أم للسياحة؟',
        en: 'Thank you. Are you here for work or tourism?',
        de: 'Danke. Sind Sie zum Arbeiten oder zum Tourismus hier?',
        fr: 'Merci. Êtes-vous ici pour le travail ou le tourisme ?',
        es: 'Gracias. ¿Está aquí por trabajo o turismo?',
        ja: 'ありがとうございます。お仕事ですか、それとも観光ですか？',
        zh: '谢谢。您来这里是为了工作还是旅游？',
      },
      choices: [
        {
          id: 'choice-3',
          text: {
            ar: 'أنا هنا للعمل. أنا مهندس.',
            en: 'I am here for work. I am an engineer.',
            de: 'Ich bin zum Arbeiten hier. Ich bin Ingenieur.',
            fr: 'Je suis ici pour le travail. Je suis ingénieur.',
            es: 'Estoy aquí por trabajo. Soy ingeniero.',
            ja: '仕事で来ました。私はエンジニアです。',
            zh: '我来这里工作。我是一名工程师。',
          },
          nextSceneId: 'scene-3',
          nextSceneIdByAge: { KG: 'scene-age-kg', Elementary: 'scene-age-kg', Middle: 'scene-age-teen', High: 'scene-age-teen', College: 'scene-age-adult', Adult: 'scene-age-adult' },
          isCorrect: true,
          feedback: {
            ar: 'ممتاز! مفردات العمل مهمة جداً.',
            en: 'Excellent! Work vocabulary is very important.',
            de: 'Ausgezeichnet! Arbeitsvokabular ist sehr wichtig.',
            fr: 'Excellent ! Le vocabulaire professionnel est très important.',
            es: '¡Excelente! El vocabulario de trabajo es muy importante.',
            ja: '素晴らしい！仕事の語彙は非常に重要です。',
            zh: '太好了！工作词汇非常重要。',
          }
        },
        {
          id: 'choice-4',
          text: {
            ar: 'أنا هنا للسياحة. أحب الأهرامات.',
            en: 'I am here for tourism. I love the pyramids.',
            de: 'Ich bin zum Tourismus hier. Ich liebe die Pyramiden.',
            fr: 'Je suis ici pour le tourisme. J\'aime les pyramides.',
            es: 'Estoy aquí por turismo. Me encantan las pirámides.',
            ja: '観光で来ました。ピラミッドが大好きです。',
            zh: '我来这里旅游。我喜欢金字塔。',
          },
          nextSceneId: 'scene-3',
          nextSceneIdByAge: { KG: 'scene-age-kg', Elementary: 'scene-age-kg', Middle: 'scene-age-teen', High: 'scene-age-teen', College: 'scene-age-adult', Adult: 'scene-age-adult' },
          isCorrect: true,
          feedback: {
            ar: 'رائع! السياحة أيضاً خيار ممتاز.',
            en: 'Great! Tourism is also an excellent choice.',
            de: 'Großartig! Tourismus ist auch eine ausgezeichnete Wahl.',
            fr: 'Génial ! Le tourisme est aussi un excellent choix.',
            es: '¡Genial! El turismo también es una excelente opción.',
            ja: '素晴らしい！観光も素晴らしい選択です。',
            zh: '太棒了！旅游也是一个极好的选择。',
          }
        }
      ]
    },
    'scene-3': {
      id: 'scene-3',
      imageUrl: '/images/cairo-airport-exit.jpg',
      characterName: {
        ar: 'أمين المطار',
        en: 'Airport Security',
        de: 'Flughafensicherheit',
        fr: 'Sécurité de l\'aéroport',
        es: 'Seguridad del aeropuerto',
        ja: '空港警備員',
        zh: '机场保安',
      },
      text: {
        ar: 'رحلة سعيدة! يمكنك المرور الآن.',
        en: 'Have a good trip! You can pass now.',
        de: 'Gute Reise! Sie können jetzt passieren.',
        fr: 'Bon voyage ! Vous pouvez passer maintenant.',
        es: '¡Buen viaje! Ya puede pasar.',
        ja: '良い旅を！もう通れますよ。',
        zh: '旅途愉快！您现在可以通过了。',
      },
      choices: [
        {
          id: 'choice-5',
          text: {
            ar: 'شكراً جزيلاً لك. مع السلامة.',
            en: 'Thank you very much. Goodbye.',
            de: 'Vielen Dank. Auf Wiedersehen.',
            fr: 'Merci beaucoup. Au revoir.',
            es: 'Muchas gracias. Adiós.',
            ja: 'どうもありがとうございます。さようなら。',
            zh: '非常感谢。再见。',
          },
          nextSceneId: 'scene-4',
          isCorrect: true,
          feedback: {
            ar: 'أنت تتحدث بطلاقة! انتهى الفصل الأول.',
            en: 'You are speaking fluently! Chapter 1 complete.',
            de: 'Du sprichst fließend! Kapitel 1 abgeschlossen.',
            fr: 'Vous parlez couramment ! Chapitre 1 terminé.',
            es: '¡Estás hablando con fluidez! Capítulo 1 completado.',
            ja: '流暢に話せていますね！第1章完了です。',
            zh: '你说得很流利！第一章完成。',
          }
        }
      ]
    },
    'scene-4': {
      id: 'scene-4',
      imageUrl: '/images/cairo-airport-end.jpg',
      characterName: {
        ar: 'الراوي',
        en: 'Narrator',
        de: 'Erzähler',
        fr: 'Narrateur',
        es: 'Narrador',
        ja: 'ナレーター',
        zh: '旁白',
      },
      text: {
        ar: 'لقد أكملت الفصل الأول بنجاح! استعد للفصل الثاني.',
        en: 'You have successfully completed Chapter 1! Prepare for Chapter 2.',
        de: 'Du hast Kapitel 1 erfolgreich abgeschlossen! Bereite dich auf Kapitel 2 vor.',
        fr: 'Vous avez terminé avec succès le chapitre 1 ! Préparez-vous pour le chapitre 2.',
        es: '¡Has completado con éxito el Capítulo 1! Prepárate para el Capítulo 2.',
        ja: '第1章を無事に完了しました！第2章に備えてください。',
        zh: '你已成功完成第一章！准备进入第二章。',
      },
      choices: [
        {
          id: 'choice-6',
          text: {
            ar: 'أنا مستعد!',
            en: 'I am ready!',
            de: 'Ich bin bereit!',
            fr: 'Je suis prêt !',
            es: '¡Estoy listo!',
            ja: '準備はできています！',
            zh: '我准备好了！',
          },
          nextSceneId: 'scene-end',
          isCorrect: true,
          feedback: {
            ar: 'رائع!',
            en: 'Awesome!',
            de: 'Großartig!',
            fr: 'Génial !',
            es: '¡Increíble!',
            ja: '素晴らしい！',
            zh: '太棒了！',
          }
        }
      ]
    },
    'scene-end': {
      id: 'scene-end',
      imageUrl: '/images/chapter-complete.jpg',
      characterName: {
        ar: 'النظام',
        en: 'System',
        de: 'System',
        fr: 'Système',
        es: 'Sistema',
        ja: 'システム',
        zh: '系统',
      },
      text: {
        ar: 'تهانينا! لقد أكملت هذا الجزء من القصة. المزيد قادم قريباً.',
        en: 'Congratulations! You have completed this part of the story. More coming soon.',
        de: 'Herzlichen Glückwunsch! Du hast diesen Teil der Geschichte abgeschlossen. Mehr folgt in Kürze.',
        fr: 'Félicitations ! Vous avez terminé cette partie de l\'histoire. Plus à venir bientôt.',
        es: '¡Felicidades! Has completado esta parte de la historia. Más próximamente.',
        ja: 'おめでとうございます！この部分の物語を完了しました。近日公開予定です。',
        zh: '恭喜！你已完成故事的这一部分。更多内容即将推出。',
      },
      choices: []
    },
    'scene-age-kg': {
      id: 'scene-age-kg',
      imageUrl: '/images/cairo-airport-smiling.jpg',
      characterName: { ar: 'أمين المطار', en: 'Airport Security', de: 'Flughafensicherheit', fr: 'Sécurité', es: 'Seguridad', ja: '警備員', zh: '保安' },
      text: {
        ar: 'مرحباً في مصر! 🇪🇬 هل أنت مستعد للمغامرة؟',
        en: 'Welcome to Egypt! 🇪🇬 Are you ready for an adventure?',
        de: 'Willkommen in Ägypten! 🇪🇬 Bist du bereit für ein Abenteuer?',
        fr: 'Bienvenue en Égypte ! 🇪🇬 Es-tu prêt pour une aventure ?',
        es: '¡Bienvenido a Egipto! 🇪🇬 ¿Estás listo para una aventura?',
        ja: 'エジプトへようこそ！🇪🇬 冒険の準備はいいですか？',
        zh: '欢迎来到埃及！🇪🇬 你准备好去冒险了吗？'
      },
      choices: [
        {
          id: 'choice-kg-1',
          text: {
            ar: 'نعم! أنا متحمس جداً!',
            en: 'Yes! I am very excited!',
            de: 'Ja! Ich bin sehr aufgeregt!',
            fr: 'Oui ! Je suis très excité !',
            es: '¡Sí! ¡Estoy muy emocionado!',
            ja: 'はい！とてもワクワクしています！',
            zh: '是的！我非常兴奋！'
          },
          nextSceneId: 'scene-3'
        }
      ]
    },
    'scene-age-teen': {
      id: 'scene-age-teen',
      imageUrl: '/images/cairo-airport-smiling.jpg',
      characterName: { ar: 'أمين المطار', en: 'Airport Security', de: 'Flughafensicherheit', fr: 'Sécurité', es: 'Seguridad', ja: '警備員', zh: '保安' },
      text: {
        ar: 'أتمنى لك وقتاً ممتعاً. تذكر أن تتعلم الكثير خلال رحلتك وتكون حذراً.',
        en: 'I hope you have a great time. Remember to learn a lot during your trip and stay safe.',
        de: 'Ich hoffe, du hast eine tolle Zeit. Erinnere dich daran, viel auf deiner Reise zu lernen und pass auf dich auf.',
        fr: 'J\'espère que tu passeras un bon moment. N\'oublie pas d\'apprendre beaucoup pendant ton voyage et reste prudent.',
        es: 'Espero que pases un buen rato. Recuerda aprender mucho durante tu viaje y mantente a salvo.',
        ja: '素晴らしい時間を過ごせることを願っています。旅行中にたくさん学び、気をつけてください。',
        zh: '希望你玩得开心。记住在旅行中多学习，并注意安全。'
      },
      choices: [
        {
          id: 'choice-teen-1',
          text: {
            ar: 'بالتأكيد، سأفعل ذلك. شكراً لك.',
            en: 'Absolutely, I will do that. Thank you.',
            de: 'Absolut, das werde ich tun. Danke.',
            fr: 'Absolument, je le ferai. Merci.',
            es: 'Absolutamente, lo haré. Gracias.',
            ja: 'もちろんです、そうします。ありがとうございます。',
            zh: '绝对，我会这么做的。谢谢你。'
          },
          nextSceneId: 'scene-3'
        }
      ]
    },
    'scene-age-adult': {
      id: 'scene-age-adult',
      imageUrl: '/images/cairo-airport-smiling.jpg',
      characterName: { ar: 'أمين المطار', en: 'Airport Security', de: 'Flughafensicherheit', fr: 'Sécurité', es: 'Seguridad', ja: '警備員', zh: '保安' },
      text: {
        ar: 'مرحباً بك في القاهرة. سواء كان الغرض هو استكشاف الفرص المهنية أو السياحة الثقافية، أتمنى لك إقامة مثمرة.',
        en: 'Welcome to Cairo. Whether the purpose is exploring professional opportunities or cultural tourism, I wish you a productive stay.',
        de: 'Willkommen in Kairo. Ob der Zweck nun berufliche Möglichkeiten oder Kulturtourismus ist, ich wünsche Ihnen einen produktiven Aufenthalt.',
        fr: 'Bienvenue au Caire. Que ce soit pour explorer des opportunités professionnelles ou pour le tourisme culturel, je vous souhaite un séjour productif.',
        es: 'Bienvenido a El Cairo. Ya sea que el propósito sea explorar oportunidades profesionales o turismo cultural, le deseo una estancia productiva.',
        ja: 'カイロへようこそ。目的が職業的な機会の探求であれ、文化観光であれ、実りある滞在になることをお祈りします。',
        zh: '欢迎来到开罗。无论目的是探索职业机会还是文化旅游，我都祝您在这里度过一段充实的时光。'
      },
      choices: [
        {
          id: 'choice-adult-1',
          text: {
            ar: 'شكراً جزيلاً لك على الترحيب الحار.',
            en: 'Thank you very much for the warm welcome.',
            de: 'Vielen Dank für den herzlichen Empfang.',
            fr: 'Merci beaucoup pour cet accueil chaleureux.',
            es: 'Muchas gracias por la cálida bienvenida.',
            ja: '温かい歓迎をありがとうございます。',
            zh: '非常感谢您热情的欢迎。'
          },
          nextSceneId: 'scene-3'
        }
      ]
    }
  }
};
