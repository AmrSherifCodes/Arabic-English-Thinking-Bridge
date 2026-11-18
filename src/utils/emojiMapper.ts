export function getEmojiForWord(word: string, fallback: string): string {
  if (!word) return fallback;

  const text = word.toLowerCase();

  const mappings: Record<string, string[]> = {
    '👨': ['man', 'boy', 'guy', 'male'],
    '👩': ['woman', 'girl', 'lady', 'female'],
    '🧑': ['person', 'people', 'human', 'someone', 'anyone'],
    '🧒': ['child', 'kid', 'baby', 'toddler'],
    '👪': ['family', 'parents', 'relatives'],
    '🏠': ['house', 'home', 'building', 'apartment'],
    '🚗': ['car', 'auto', 'vehicle', 'drive', 'driving'],
    '🍔': ['food', 'eat', 'meal', 'burger', 'hungry'],
    '💧': ['water', 'drink', 'liquid', 'thirsty'],
    '📖': ['book', 'read', 'reading', 'story'],
    '✍️': ['write', 'writing', 'pen', 'pencil'],
    '🏃': ['run', 'running', 'jog', 'sprint'],
    '🚶': ['walk', 'walking', 'stroll', 'step'],
    '🛌': ['sleep', 'sleeping', 'bed', 'rest', 'tired'],
    '💼': ['work', 'job', 'office', 'business', 'company'],
    '🏫': ['school', 'study', 'student', 'teacher', 'learn'],
    '🏙️': ['city', 'town', 'urban', 'street'],
    '⏳': ['time', 'hour', 'minute', 'wait', 'soon'],
    '📅': ['day', 'week', 'month', 'year', 'date', 'today', 'tomorrow', 'yesterday'],
    '💰': ['money', 'cash', 'pay', 'buy', 'sell', 'price', 'cost'],
    '❤️': ['love', 'like', 'heart', 'care'],
    '😊': ['happy', 'smile', 'glad', 'joy'],
    '😢': ['sad', 'cry', 'tears', 'unhappy'],
    '😠': ['angry', 'mad', 'furious'],
    '🗣️': ['speak', 'talk', 'say', 'tell', 'voice'],
    '👁️': ['see', 'look', 'watch', 'eye'],
    '👂': ['hear', 'listen', 'ear'],
    '🧠': ['think', 'mind', 'brain', 'know', 'understand'],
    '👋': ['hello', 'hi', 'bye', 'greet', 'wave'],
    '👍': ['good', 'great', 'awesome', 'yes', 'ok'],
    '👎': ['bad', 'terrible', 'no', 'wrong'],
    '🐶': ['dog', 'puppy', 'pet'],
    '🐱': ['cat', 'kitten'],
    '🍎': ['apple', 'fruit', 'healthy'],
    '☕': ['coffee', 'tea', 'cafe', 'morning'],
    '☀️': ['sun', 'sunny', 'hot', 'summer'],
    '🌧️': ['rain', 'raining', 'wet', 'weather'],
    '❄️': ['snow', 'cold', 'winter', 'ice'],
    '🔥': ['fire', 'hot', 'burn', 'flame'],
    '📱': ['phone', 'mobile', 'call', 'app'],
    '💻': ['computer', 'laptop', 'pc', 'screen'],
    '🌎': ['world', 'earth', 'global', 'planet'],
    '❓': ['question', 'ask', 'why', 'what', 'how', 'when', 'where', 'who'],
    '❗': ['important', 'exclamation', 'alert', 'warning'],
    '✅': ['done', 'finish', 'complete', 'success'],
    '❌': ['error', 'fail', 'stop', 'cancel'],
    '🎵': ['music', 'song', 'sing', 'listen'],
    '🎮': ['game', 'play', 'fun'],
    '⚽': ['football', 'soccer', 'sports', 'ball'],
    '🏀': ['basketball', 'hoop'],
    '🏆': ['win', 'winner', 'prize', 'award'],
    '✈️': ['fly', 'flight', 'airplane', 'travel', 'trip'],
    '🚆': ['train', 'subway', 'metro', 'rail'],
    '🚲': ['bicycle', 'bike', 'ride'],
    '👕': ['shirt', 'clothes', 'wear'],
    '👖': ['pants', 'jeans'],
    '👗': ['dress', 'skirt'],
    '👞': ['shoes', 'boots'],
    '👜': ['bag', 'purse'],
    '🚪': ['door', 'open', 'close', 'enter', 'exit'],
    '🔑': ['key', 'lock', 'secure', 'safe'],
    '🛒': ['shop', 'store', 'cart', 'grocery'],
    '🎁': ['gift', 'present', 'surprise', 'birthday'],
    '🎉': ['party', 'celebrate', 'event', 'fun'],
    '🏥': ['hospital', 'doctor', 'nurse', 'sick', 'health'],
    '💊': ['medicine', 'pill', 'drug', 'pharmacy'],
    '🌳': ['tree', 'forest', 'wood', 'nature'],
    '🌺': ['flower', 'plant', 'bloom'],
    '🌙': ['moon', 'night', 'evening', 'dark'],
    '⭐': ['star', 'sky', 'space'],
    '🎨': ['art', 'paint', 'draw', 'color'],
    '📸': ['photo', 'camera', 'picture', 'snap'],
    '🎬': ['movie', 'film', 'cinema', 'video'],
    '💪': ['strong', 'strength', 'muscle', 'gym', 'workout'],
    '🚑': ['ambulance', 'emergency'],
    '🚓': ['police', 'cop'],
    '🚒': ['firefighter', 'firetruck'],
    '🚀': ['rocket', 'space', 'launch', 'fast'],
    '🛸': ['ufo', 'alien'],
    '🤖': ['robot', 'ai', 'bot', 'machine'],
    '👻': ['ghost', 'scary', 'spooky'],
    '👽': ['alien', 'extraterrestrial'],
    '👾': ['monster', 'arcade'],
    '🤔': ['thinking', 'wonder', 'hmm', 'curious'],
    '😅': ['sweat', 'nervous', 'awkward'],
    '😂': ['laugh', 'funny', 'joke', 'haha'],
    '😭': ['cry', 'sad', 'sob', 'tears'],
    '😴': ['sleep', 'tired', 'zzz'],
    '😍': ['love', 'heart', 'adore'],
    '😎': ['cool', 'sunglasses', 'swag'],
    '🤓': ['nerd', 'smart', 'geek'],
    '🤠': ['cowboy', 'country', 'yeehaw'],
    '🥳': ['party', 'celebrate', 'woohoo'],
    '🤯': ['mindblown', 'wow', 'crazy'],
    '🥶': ['cold', 'freezing', 'brrr'],
    '🥵': ['hot', 'sweat', 'phew'],
    '🤢': ['sick', 'gross', 'eww'],
    '🤡': ['clown', 'joke', 'fool'],
    '🤷': ['shrug', 'dunno', 'whatever'],
    '🤦': ['facepalm', 'ugh', 'sigh'],
    '🧑‍💻': ['developer', 'coder', 'programmer', 'hacker'],
    '🦸': ['hero', 'superhero'],
    '🦹': ['villain', 'supervillain'],
    '🧙': ['wizard', 'mage', 'magic'],
    '🧚': ['fairy', 'pixie'],
    '🧛': ['vampire', 'dracula'],
    '🧜': ['mermaid', 'siren'],
    '🧝': ['elf', 'legolas'],
    '🧞': ['genie', 'djinn'],
    '🧟': ['zombie', 'undead']
  };

  for (const [emoji, keywords] of Object.entries(mappings)) {
    for (const keyword of keywords) {
      // Use regex with boundaries to match whole words.
      // E.g., \bcat\b matches "cat" but not "catch"
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(text)) {
        return emoji;
      }
    }
  }

  // Also try to check the raw text without boundaries for languages that don't use \b well
  // Just for Arabic matching if there are Arabic keywords in the future
  for (const [emoji, keywords] of Object.entries(mappings)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return emoji;
      }
    }
  }

  return fallback;
}
