export interface VocabWord {
  id: string;
  ar: string;
  en: string;
  emoji: string;
  category: string;
  bands: string[];
}

export const VOCAB: VocabWord[] = [
  { id: "apple", ar: "تفاحة", en: "apple", emoji: "🍎", category: "food", bands: ["5-7","8-9","10-12"] },
  { id: "banana", ar: "موزة", en: "banana", emoji: "🍌", category: "food", bands: ["5-7","8-9","10-12"] },
  { id: "orange_fruit", ar: "برتقالة", en: "orange", emoji: "🍊", category: "food", bands: ["5-7","8-9","10-12"] },
  { id: "grapes", ar: "عنب", en: "grapes", emoji: "🍇", category: "food", bands: ["5-7","8-9","10-12"] },
  { id: "watermelon", ar: "بطيخ", en: "watermelon", emoji: "🍉", category: "food", bands: ["5-7","8-9","10-12"] },
  { id: "strawberry", ar: "فراولة", en: "strawberry", emoji: "🍓", category: "food", bands: ["5-7","8-9","10-12"] },
  { id: "carrot", ar: "جزرة", en: "carrot", emoji: "🥕", category: "food", bands: ["5-7","8-9","10-12"] },
  { id: "bread", ar: "عيش", en: "bread", emoji: "🍞", category: "food", bands: ["5-7","8-9","10-12"] },
  { id: "cheese", ar: "جبنة", en: "cheese", emoji: "🧀", category: "food", bands: ["5-7","8-9","10-12"] },
  { id: "pizza", ar: "بيتزا", en: "pizza", emoji: "🍕", category: "food", bands: ["5-7","8-9","10-12"] },

  { id: "cat", ar: "قطة", en: "cat", emoji: "🐱", category: "animals", bands: ["5-7","8-9","10-12"] },
  { id: "dog", ar: "كلب", en: "dog", emoji: "🐶", category: "animals", bands: ["5-7","8-9","10-12"] },
  { id: "mouse", ar: "فار", en: "mouse", emoji: "🐭", category: "animals", bands: ["5-7","8-9","10-12"] },
  { id: "rabbit", ar: "أرنب", en: "rabbit", emoji: "🐰", category: "animals", bands: ["5-7","8-9","10-12"] },
  { id: "fox", ar: "تعلب", en: "fox", emoji: "🦊", category: "animals", bands: ["5-7","8-9","10-12"] },
  { id: "bear", ar: "دب", en: "bear", emoji: "🐻", category: "animals", bands: ["5-7","8-9","10-12"] },
  { id: "panda", ar: "باندا", en: "panda", emoji: "🐼", category: "animals", bands: ["5-7","8-9","10-12"] },
  { id: "tiger", ar: "نمر", en: "tiger", emoji: "🐯", category: "animals", bands: ["5-7","8-9","10-12"] },
  { id: "lion", ar: "أسد", en: "lion", emoji: "🦁", category: "animals", bands: ["5-7","8-9","10-12"] },
  { id: "cow", ar: "بقرة", en: "cow", emoji: "🐮", category: "animals", bands: ["5-7","8-9","10-12"] },

  { id: "sea", ar: "بحر", en: "sea", emoji: "🌊", category: "nature", bands: ["5-7","8-9","10-12"] },
  { id: "tree", ar: "شجرة", en: "tree", emoji: "🌳", category: "nature", bands: ["5-7","8-9","10-12"] },
  { id: "sun", ar: "شمس", en: "sun", emoji: "☀️", category: "nature", bands: ["5-7","8-9","10-12"] },
  { id: "moon", ar: "قمر", en: "moon", emoji: "🌙", category: "nature", bands: ["5-7","8-9","10-12"] },
  { id: "star", ar: "نجمة", en: "star", emoji: "⭐", category: "nature", bands: ["5-7","8-9","10-12"] },
  { id: "cloud", ar: "سحابة", en: "cloud", emoji: "☁️", category: "nature", bands: ["5-7","8-9","10-12"] },
  { id: "rain", ar: "مطر", en: "rain", emoji: "🌧️", category: "nature", bands: ["5-7","8-9","10-12"] },
  { id: "fire", ar: "نار", en: "fire", emoji: "🔥", category: "nature", bands: ["5-7","8-9","10-12"] },
  { id: "flower", ar: "وردة", en: "flower", emoji: "🌸", category: "nature", bands: ["5-7","8-9","10-12"] },
  { id: "mountain", ar: "جبل", en: "mountain", emoji: "⛰️", category: "nature", bands: ["5-7","8-9","10-12"] },

  { id: "red", ar: "أحمر", en: "red", emoji: "🔴", category: "colors", bands: ["5-7","8-9","10-12"] },
  { id: "blue", ar: "أزرق", en: "blue", emoji: "🔵", category: "colors", bands: ["5-7","8-9","10-12"] },
  { id: "green", ar: "أخضر", en: "green", emoji: "🟢", category: "colors", bands: ["5-7","8-9","10-12"] },
  { id: "yellow", ar: "أصفر", en: "yellow", emoji: "🟡", category: "colors", bands: ["5-7","8-9","10-12"] },
  { id: "purple", ar: "بنفسجي", en: "purple", emoji: "🟣", category: "colors", bands: ["5-7","8-9","10-12"] },
  { id: "orange_color", ar: "برتقالي", en: "orange", emoji: "🟠", category: "colors", bands: ["5-7","8-9","10-12"] },
  { id: "black", ar: "أسود", en: "black", emoji: "⚫", category: "colors", bands: ["5-7","8-9","10-12"] },
  { id: "white", ar: "أبيض", en: "white", emoji: "⚪", category: "colors", bands: ["5-7","8-9","10-12"] },
  { id: "brown", ar: "بني", en: "brown", emoji: "🟤", category: "colors", bands: ["5-7","8-9","10-12"] },
  { id: "pink", ar: "بمبي", en: "pink", emoji: "🩷", category: "colors", bands: ["5-7","8-9","10-12"] },

  { id: "one", ar: "واحد", en: "one", emoji: "1️⃣", category: "numbers", bands: ["5-7","8-9","10-12"] },
  { id: "two", ar: "اتنين", en: "two", emoji: "2️⃣", category: "numbers", bands: ["5-7","8-9","10-12"] },
  { id: "three", ar: "تلاتة", en: "three", emoji: "3️⃣", category: "numbers", bands: ["5-7","8-9","10-12"] },
  { id: "four", ar: "أربعة", en: "four", emoji: "4️⃣", category: "numbers", bands: ["5-7","8-9","10-12"] },
  { id: "five", ar: "خمسة", en: "five", emoji: "5️⃣", category: "numbers", bands: ["5-7","8-9","10-12"] },
  { id: "six", ar: "ستة", en: "six", emoji: "6️⃣", category: "numbers", bands: ["5-7","8-9","10-12"] },
  { id: "seven", ar: "سبعة", en: "seven", emoji: "7️⃣", category: "numbers", bands: ["5-7","8-9","10-12"] },
  { id: "eight", ar: "تمانية", en: "eight", emoji: "8️⃣", category: "numbers", bands: ["5-7","8-9","10-12"] },
  { id: "nine", ar: "تسعة", en: "nine", emoji: "9️⃣", category: "numbers", bands: ["5-7","8-9","10-12"] },
  { id: "ten", ar: "عشرة", en: "ten", emoji: "🔟", category: "numbers", bands: ["5-7","8-9","10-12"] },

  { id: "car", ar: "عربية", en: "car", emoji: "🚗", category: "transport", bands: ["5-7","8-9","10-12"] },
  { id: "bus", ar: "أتوبيس", en: "bus", emoji: "🚌", category: "transport", bands: ["5-7","8-9","10-12"] },
  { id: "train", ar: "قطر", en: "train", emoji: "🚂", category: "transport", bands: ["5-7","8-9","10-12"] },
  { id: "plane", ar: "طيارة", en: "plane", emoji: "✈️", category: "transport", bands: ["5-7","8-9","10-12"] },
  { id: "boat", ar: "مركب", en: "boat", emoji: "⛵", category: "transport", bands: ["5-7","8-9","10-12"] },

  { id: "book", ar: "كتاب", en: "book", emoji: "📚", category: "school", bands: ["5-7","8-9","10-12"] },
  { id: "pen", ar: "قلم", en: "pen", emoji: "🖊️", category: "school", bands: ["5-7","8-9","10-12"] },
  { id: "bag", ar: "شنطة", en: "bag", emoji: "🎒", category: "school", bands: ["5-7","8-9","10-12"] },
  { id: "ruler", ar: "مسطرة", en: "ruler", emoji: "📏", category: "school", bands: ["5-7","8-9","10-12"] },
  { id: "school", ar: "مدرسة", en: "school", emoji: "🏫", category: "school", bands: ["5-7","8-9","10-12"] },
];