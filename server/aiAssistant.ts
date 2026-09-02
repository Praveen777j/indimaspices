import { GoogleGenAI } from '@google/genai';
import { db } from './dataStore';
import { Product } from '../src/types';

interface ChatMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

interface AiAssistantRequest {
  message: string;
  history?: ChatMessage[];
  language?: 'en' | 'kn';
}

interface RecommendedProductSummary {
  id: string;
  name_en: string;
  name_kn: string;
  price: number;
  mrp: number;
  weight: string;
  image?: string;
  category_id?: string;
  inStock: boolean;
  stock: number;
}

interface AiAssistantResponse {
  reply: string;
  recommendedProducts: RecommendedProductSummary[];
  suggestedFollowUps: string[];
}

// Lazy initialization for Gemini API client
let genAiClient: GoogleGenAI | null = null;

// Safe error sanitizer to prevent any secret or API key leakage in server logs
function sanitizeErrorForLog(err: any): string {
  if (!err) return 'Unknown error';
  const raw = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
  return raw
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
    .replace(/key=[^&\s]+/g, 'key=[REDACTED]')
    .replace(/bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [REDACTED_TOKEN]');
}

function safeLogAiWarning(context: string, err: any) {
  const sanitized = sanitizeErrorForLog(err);
  const status = err?.status || err?.statusCode || err?.code || (sanitized.includes('503') ? 503 : sanitized.includes('429') ? 429 : sanitized.includes('500') ? 500 : 'TEMP_UNAVAILABLE');
  console.warn(`[Indima AI Assistant] ⚠️ ${context} (Status/Code: ${status}): ${sanitized}`);
}

function getGenAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Indima AI] ⚠️ GEMINI_API_KEY is not set in environment variables. Running in offline recipe & recommendation mode.');
    return null;
  }
  if (!genAiClient) {
    try {
      genAiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (clientInitErr) {
      safeLogAiWarning('Client initialization error', clientInitErr);
      return null;
    }
  }
  return genAiClient;
}

// Dish to Product Affinity Mapping for strict catalog validation
interface DishAffinity {
  keywords: string[];
  recommendedProductIds: string[];
  excludedProductIds: string[];
  dishName_en: string;
  dishName_kn: string;
  cuisine: string;
  foodType: 'Vegetarian' | 'Non-vegetarian';
  spiceProfile: string;
}

const DISH_AFFINITIES: DishAffinity[] = [
  {
    keywords: ['biryani', 'briyani', 'biriyani', 'pulao', 'pulav', 'dum biryani'],
    recommendedProductIds: ['prod-malnad-garam-masala', 'prod-coorg-pepper', 'prod-byadgi-chillies'],
    excludedProductIds: ['prod-udupi-sambar', 'prod-sambar-powder', 'prod-rasam-powder', 'prod-bisibelebath', 'prod-puliyogare-mix', 'prod-vangibath-powder', 'prod-chutney-pudi', 'prod-karnataka-combo-festive', 'prod-combo-grand'],
    dishName_en: 'Chicken Biryani / Biryani',
    dishName_kn: 'ಚಿಕನ್ ಬಿರಿಯಾನಿ / ಬಿರಿಯಾನಿ',
    cuisine: 'South Indian / Royal Hyderabadi-Karnataka',
    foodType: 'Non-vegetarian',
    spiceProfile: 'Royal aromatic whole spices (cardamom, mace, star anise, cinnamon) and Tellicherry black pepper'
  },
  {
    keywords: ['sambar', 'saambar', 'huli', 'sambar powder', 'sambar recipe', 'udupi sambar', 'brahmin sambar'],
    recommendedProductIds: ['prod-udupi-sambar', 'prod-sambar-powder', 'prod-byadgi-chillies'],
    excludedProductIds: ['prod-malnad-garam-masala', 'prod-rasam-powder', 'prod-bisibelebath', 'prod-puliyogare-mix', 'prod-vangibath-powder', 'prod-chutney-pudi', 'prod-karnataka-combo-festive', 'prod-combo-grand'],
    dishName_en: 'Traditional Karnataka Sambar (Huli)',
    dishName_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಕರ್ನಾಟಕ ಸಾಂಬಾರ್ (ಹುಳಿ)',
    cuisine: 'Karnataka / South Indian',
    foodType: 'Vegetarian',
    spiceProfile: 'Roasted coriander, Byadgi chillies, chana dal, toor dal, roasted fenugreek, cumin and hing'
  },
  {
    keywords: ['rasam', 'saaru', 'charu', 'tomato rasam', 'pepper rasam', 'menasina saaru', 'jeera rasam', 'garlic rasam'],
    recommendedProductIds: ['prod-rasam-powder', 'prod-coorg-pepper'],
    excludedProductIds: ['prod-malnad-garam-masala', 'prod-udupi-sambar', 'prod-sambar-powder', 'prod-bisibelebath', 'prod-puliyogare-mix', 'prod-vangibath-powder', 'prod-chutney-pudi', 'prod-karnataka-combo-festive', 'prod-combo-grand'],
    dishName_en: 'Heritage Maniyara Saaru (Rasam)',
    dishName_kn: 'ಪಾರಂಪರಿಕ ಮನೆಯ ಸಾರು (ರಸಂ)',
    cuisine: 'Karnataka Traditional Home Broth',
    foodType: 'Vegetarian',
    spiceProfile: 'Black pepper, cumin seeds, Salem turmeric, coriander, and hing broth'
  },
  {
    keywords: ['bisibelebath', 'bisi bele bath', 'bisi bele bhath', 'bisibelebath powder'],
    recommendedProductIds: ['prod-bisibelebath'],
    excludedProductIds: ['prod-malnad-garam-masala', 'prod-udupi-sambar', 'prod-sambar-powder', 'prod-rasam-powder', 'prod-puliyogare-mix', 'prod-vangibath-powder', 'prod-chutney-pudi', 'prod-karnataka-combo-festive', 'prod-combo-grand'],
    dishName_en: 'Traditional Mysuru Bisi Bele Bath',
    dishName_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಮೈಸೂರು ಬಿಸಿಬೇಳೆಬಾತ್',
    cuisine: 'Mysuru Karnataka Heritage',
    foodType: 'Vegetarian',
    spiceProfile: 'Marathi Moggu, stone flower (Kalpasi), cinnamon, Byadgi chillies, copra and roasted lentils'
  },
  {
    keywords: ['puliyogare', 'pulihora', 'puliyodarai', 'tamarind rice', 'melukote puliyogare', 'gojju'],
    recommendedProductIds: ['prod-puliyogare-mix'],
    excludedProductIds: ['prod-malnad-garam-masala', 'prod-udupi-sambar', 'prod-sambar-powder', 'prod-rasam-powder', 'prod-bisibelebath', 'prod-vangibath-powder', 'prod-chutney-pudi', 'prod-karnataka-combo-festive', 'prod-combo-grand'],
    dishName_en: 'Melukote Style Puliyogare (Tamarind Rice)',
    dishName_kn: 'ಮೇಕೋಟೆ ಶೈಲಿಯ ಪುಳಿಯೋಗರೆ',
    cuisine: 'Karnataka Temple Heritage',
    foodType: 'Vegetarian',
    spiceProfile: 'Sesame, red chillies, black pepper, fenugreek, mustard, hing and roasted peanuts'
  },
  {
    keywords: ['vangibath', 'vangi bath', 'brinjal rice', 'capsicum bath', 'vangee bath'],
    recommendedProductIds: ['prod-vangibath-powder'],
    excludedProductIds: ['prod-malnad-garam-masala', 'prod-udupi-sambar', 'prod-sambar-powder', 'prod-rasam-powder', 'prod-bisibelebath', 'prod-puliyogare-mix', 'prod-chutney-pudi', 'prod-karnataka-combo-festive', 'prod-combo-grand'],
    dishName_en: 'Traditional Vangi Bath (Brinjal Rice)',
    dishName_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ವಾಂಗೀಬಾತ್',
    cuisine: 'Karnataka Heritage',
    foodType: 'Vegetarian',
    spiceProfile: 'Roasted copra, cloves, cinnamon, cardamom, chana dal and Byadgi chillies'
  },
  {
    keywords: ['chicken curry', 'chicken gravy', 'mutton curry', 'mutton gravy', 'koli saaru', 'meat curry', 'egg curry', 'paneer butter masala', 'korma', 'kurma', 'mutton sukka', 'chicken sukka', 'ghee roast'],
    recommendedProductIds: ['prod-malnad-garam-masala', 'prod-coorg-pepper', 'prod-byadgi-chillies'],
    excludedProductIds: ['prod-udupi-sambar', 'prod-sambar-powder', 'prod-rasam-powder', 'prod-bisibelebath', 'prod-puliyogare-mix', 'prod-vangibath-powder', 'prod-chutney-pudi', 'prod-karnataka-combo-festive', 'prod-combo-grand'],
    dishName_en: 'Karnataka Style Curry / Gravy',
    dishName_kn: 'ಕರ್ನಾಟಕ ಶೈಲಿಯ ಸಾರು / ಗ್ರೇವಿ',
    cuisine: 'South Indian / Karnataka Coastal & Malnad',
    foodType: 'Non-vegetarian',
    spiceProfile: 'Malnad stone-ground garam masala, Tellicherry black pepper and Byadgi red chilli paste'
  },
  {
    keywords: ['chutney', 'chutney pudi', 'shenga', 'peanut chutney', 'jolada rotti', 'dosa podi', 'idli podi'],
    recommendedProductIds: ['prod-chutney-pudi'],
    excludedProductIds: ['prod-malnad-garam-masala', 'prod-udupi-sambar', 'prod-sambar-powder', 'prod-rasam-powder', 'prod-bisibelebath', 'prod-puliyogare-mix', 'prod-vangibath-powder', 'prod-karnataka-combo-festive', 'prod-combo-grand'],
    dishName_en: 'North Karnataka Shenga Chutney Pudi',
    dishName_kn: 'ಉತ್ತರ ಕರ್ನಾಟಕದ ಶೇಂಗಾ ಚಟ್ನಿ ಪುಡಿ',
    cuisine: 'North Karnataka Heritage',
    foodType: 'Vegetarian',
    spiceProfile: 'Roasted peanuts, garlic, Byadgi chillies, cumin, tamarind and jaggery'
  },
  {
    keywords: ['gift', 'combo', 'box', 'festive box', 'master box', 'starter kit', 'all spices', 'hamper', 'basket'],
    recommendedProductIds: ['prod-karnataka-combo-festive', 'prod-combo-grand'],
    excludedProductIds: [],
    dishName_en: 'Karnataka Grand Festive Spice Box',
    dishName_kn: 'ಕರ್ನಾಟಕ ಗ್ರಾಂಡ್ ಹಬ್ಬದ ಮಸಾಲೆ ಬಾಕ್ಸ್',
    cuisine: 'Traditional Karnataka Pantry Essentials',
    foodType: 'Vegetarian',
    spiceProfile: 'Curated 6 heritage stone-ground spice jars'
  }
];

export async function handleAiAssistantRequest(
  payload: AiAssistantRequest
): Promise<AiAssistantResponse> {
  const { message, history = [], language = 'en' } = payload;

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Please provide a message or cooking question.');
  }

  const rawTrimmed = message.trim();
  const lowerMsg = rawTrimmed.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, ' ').trim();
  const isKn = language === 'kn';

  // 1. Fetch current real product catalog (Read-only from memory dataStore)
  const allProducts: Product[] = db.getProducts() || [];
  
  // Filter out any inactive or invalid test items
  const activeProducts = allProducts.filter(
    p => p.active !== false && p.name_en && p.name_en.trim().length > 2 && p.name_en !== '6yyhj'
  );

  // =========================================================================
  // PRIORITY 1: GREETING & CASUAL CONVERSATION HANDLING (ZERO PRODUCT HALLUCINATION)
  // =========================================================================

  // Detect Kanglish input
  const isKanglish = /\b(hegidira|hegidiri|namaskara|namaskar|hege|madodu|maduvudu|beku|idheya|ideya|channagide|dhanyavada|aytu|sari|enu|yenu|ondhu|eradu|neevu|nimma|ivattu|yava|kelabahudu)\b/i.test(lowerMsg);

  // 1. Heritage, History of Spices, Creation, Business Natural Philosophy & FSSAI Certification
  const isHeritageOrBusinessQuery = /\b(history\s*of\s*spices|how\s*(?:are\s*)?spices\s*(?:are\s*)?(?:created|made|prepared)|about\s*(?:indima|business|company|your\s*business)|natural|stone\s*ground|fssai|certified|certification|heritage|licence|license)\b/i.test(lowerMsg) ||
    /(ಇತಿಹಾಸ|ವ್ಯವಹಾರ|ಪರಂಪರೆ|ನೈಸರ್ಗಿಕ|ಕಲ್ಲಿನ|ಪ್ರಮಾಣೀಕೃತ|ಪ್ರಮಾಣಪತ್ರ|ಎಫ್ಎಸ್ಎಸ್ಎಐ|ಸುರಕ್ಷತೆ)/i.test(rawTrimmed);
  if (isHeritageOrBusinessQuery) {
    const heritageReply_en = `**The Heritage of Spices & Indima Spice Co.** 🌿✨

**The Timeless History:**
For centuries, South India's grand spice traditions were built on patience, nature, and pure craftsmanship. Spices were harvested at peak potency and slowly stone-ground at cool ambient temperatures. Unlike high-speed commercial pulverizers that generate extreme friction heat (over 80°C) and destroy volatile aromatic oils, slow stone grinding preserves the essential oils, delicate fragrance, and natural antioxidants for authentic heritage flavor.

**At Indima Spice Co., We Revive This Legacy:**
- 🌿 **100% Pure & Natural**: Farm-sourced single-origin spices with zero artificial colors, zero chemical preservatives, and zero fillers.
- 🪨 **Authentic Slow Stone-Ground**: Traditional cool-friction grinding preserving natural oils, intense aroma, and culinary depth.
- 🛡️ **Recognized & Certified by FSSAI**: Manufactured under strict food safety and hygiene benchmarks (FSSAI Lic. No: **21226194000378**).

Feel free to ask for authentic Karnataka recipes, cooking secrets, or spice recommendations for any dish!`;

    const heritageReply_kn = `**ಮಸಾಲೆಗಳ ಭವ್ಯ ಇತಿಹಾಸ ಮತ್ತು ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ** 🌿✨

**ಮಸಾಲೆಗಳ ಪರಂಪರೆ:**
ಶತಮಾನಗಳಿಂದ ಕರ್ನಾಟಕದ ಅಡುಗೆ ಸಂಸ್ಕೃತಿಯಲ್ಲಿ ಮಸಾಲೆಗಳನ್ನು ನೈಸರ್ಗಿಕ ಕಲ್ಲಿನಲ್ಲಿ ನಿಧಾನವಾಗಿ ಬೀಸಿ ತಯಾರಿಸಲಾಗುತ್ತಿತ್ತು. ಆಧುನಿಕ ಯಂತ್ರಗಳ ಅತಿಯಾದ ಶಾಖಕ್ಕೆ ಮಸಾಲೆಗಳ ನೈಸರ್ಗಿಕ ಸಾರ ಸುಟ್ಟುಹೋಗದೆ, ಕಲ್ಲಿನ ಬೀಸುವಿಕೆಯಿಂದ ನೈಸರ್ಗಿಕ ಸಾರಭೂತ ತೈಲಗಳು (essential oils), ಆಹ್ಲಾದಕರ ಸುವಾಸನೆ ಮತ್ತು ಆಂಟಿಆಕ್ಸಿಡೆಂಟ್‌ಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಉಳಿಯುತ್ತಿದ್ದವು.

**ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ ವೈಶಿಷ್ಟ್ಯ:**
- 🌿 **೧೦೦% ಶುದ್ಧ ಮತ್ತು ನೈಸರ್ಗಿಕ**: ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣ, ರಾಸಾಯನಿಕ ಅಥವಾ ಸಂರಕ್ಷಕ (preservatives) ರಹಿತ ಶುದ್ಧ ಮಸಾಲೆಗಳು.
- 🪨 **ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ**: ಮಸಾಲೆಗಳಲ್ಲಿನ ನೈಸರ್ಗಿಕ ಪೋಷಕಾಂಶಗಳು ಮತ್ತು ಸುವಾಸನೆಯನ್ನು ಅಖಂಡವಾಗಿಡುವ ಪ್ರಾಚೀನ ಪದ್ಧತಿ.
- 🛡️ **FSSAI ನಿಂದ ಮಾನ್ಯತೆ ಮತ್ತು ಪ್ರಮಾಣೀಕೃತ**: ಆಹಾರ ಸುರಕ್ಷತೆಯ ಅತ್ಯುನ್ನತ ಗುಣಮಟ್ಟ (FSSAI Lic. No: **21226194000378**).

ಯಾವುದೇ ಸಾಂಪ್ರದಾಯಿಕ ರೆಸಿಪಿಗಳು ಅಥವಾ ಮಸಾಲೆಗಳ ವಿವರಗಳಿಗಾಗಿ ನನ್ನನ್ನು ಮುಕ್ತವಾಗಿ ಕೇಳಿ!`;

    const heritageReply_kanglish = `**Indima Spice Co. & Masalegala Ithihasa** 🌿✨

**Masalegala Parampara:**
Karnataka da authentic aduge sampradayadalli masalegalannu kallinalli slow aagi beesi tayarisuttiddaru. Machine heat ninda aromatic essential oils nashta aagade, slow stone-grinding inda natural aroma & nutrients complete aagi ulithave.

**Indima Spice Co. Business Highlights:**
- 🌿 **100% Pure & Natural**: No artificial colors, no preservatives, no fillers.
- 🪨 **Traditional Stone-Ground**: Cool-friction process for authentic aroma & taste.
- 🛡️ **Recognized & Certified by FSSAI**: Safe & hygienic certified (FSSAI Lic. No: **21226194000378**).

Nimage yava recipe athava spices bagge info beku? Kelabahudu!`;

    return {
      reply: isKn || /[\u0C80-\u0CFF]/.test(rawTrimmed) ? heritageReply_kn : (isKanglish ? heritageReply_kanglish : heritageReply_en),
      recommendedProducts: [],
      suggestedFollowUps: isKn ? [
        'ಉಡುಪಿ ಸಾಂಬಾರ್ ಪುಡಿ',
        'ಮಲೆನಾಡು ಗರಂ ಮಸಾಲಾ',
        'ಇಂದಿಮಾ ಮಸಾಲೆಗಳ ಪಟ್ಟಿ'
      ] : [
        'What products do you offer?',
        'Udupi Sambar Recipe',
        'Chicken Biryani Spices'
      ]
    };
  }

  // 2. Greetings
  const greetingPhrases = [
    'hi', 'hello', 'hey', 'hi there', 'hello there', 'namaste', 'namaskara', 'namaskar',
    'good morning', 'good evening', 'good afternoon', 'good day', 'hi indima', 'hello indima',
    'helo', 'hii', 'hiii', 'ola', 'vanakkam', 'namaskaram', 'yo', 'sup',
    'ನಮಸ್ಕಾರ', 'ನಮಸ್ತೆ', 'ಹಲೋ', 'ಹಾಯ್', 'ಶುಭೋದಯ', 'ಶುಭ ಸಂಜೆ'
  ];
  if (
    greetingPhrases.includes(lowerMsg) ||
    /^(hi|hello|hey|namaskara|namaste|ನಮಸ್ಕಾರ|ನಮಸ್ತೆ|ಹಲೋ|ಹಾಯ್)\s*(indima|there|ai|bot|team|sir|madam)?$/i.test(lowerMsg) ||
    lowerMsg === 'ನಮಸ್ಕಾರ' || lowerMsg === 'ನಮಸ್ತೆ' || lowerMsg === 'ಹಲೋ' || lowerMsg === 'ಹಾಯ್'
  ) {
    let greetingReply = `Hello! 👋 Welcome to Indima Spice Co. – where authentic heritage meets pure stone-ground spices! I'm your AI recipe and spice assistant. How can I help you today? Feel free to ask for authentic Karnataka recipes, cooking tips, or details on our 100% natural spices!`;
    if (isKn || /[\u0C80-\u0CFF]/.test(rawTrimmed)) {
      greetingReply = `ನಮಸ್ಕಾರ! 👋 ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ ಗೆ ಸುಸ್ವಾಗತ – ಶುದ್ಧತೆ ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಮಸಾಲೆಗಳ ಸಂಗಮ! ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಸಾಲೆ ಮತ್ತು ಅಡುಗೆ ಸಹಾಯಕ. ಇಂದು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ? ನೀವು ಯಾವುದೇ ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆ ವಿಧಾನ, ಅಡುಗೆ ಸಲಹೆಗಳು ಅಥವಾ ಮಸಾಲೆಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು.`;
    } else if (isKanglish) {
      greetingReply = `Namaskara! 👋 Indima Spice Co ge swagatha. Naanu nimma recipe & stone-ground spice assistant. Neevu authentic Karnataka recipes, cooking tips athava Indima pure spices bagge kelabahudu. Heg sahaya madli?`;
    }

    return {
      reply: greetingReply,
      recommendedProducts: [],
      suggestedFollowUps: (isKn || /[\u0C80-\u0CFF]/.test(rawTrimmed)) ? [
        'ಚಿಕನ್ ಬಿರಿಯಾನಿ ರೆಸಿಪಿ',
        'ಉಡುಪಿ ಸಾಂಬಾರ್ ರೆಸಿಪಿ',
        'ಇಂದಿಮಾ ಮಸಾಲೆಗಳು',
        'ಬಿಸಿಬೇಳೆಬಾತ್ ಮಾಡುವ ವಿಧಾನ'
      ] : (isKanglish ? [
        'Chicken Biryani recipe hege madodu?',
        'Udupi Sambar recipe kodi',
        'Indima spices list thorsri'
      ] : [
        'Chicken Biryani Recipe',
        'Authentic Udupi Sambar Recipe',
        'Tell me about Indima spices',
        'Traditional Bisi Bele Bath Recipe'
      ])
    };
  }

  // 3. Casual Conversation: How are you?
  const isHowAreYou = /\b(how\s*(?:are|r|re|is)\s*(?:you|u|ya|things|everything|life|it\s*going|your\s*day)|how're\s*you|how's\s*it\s*going|hows\s*it\s*going|how\s*do\s*you\s*do|how\s*are\s*you\s*doing|how\s*are\s*u\s*doing|wassup|what's\s*up|whatsup|how\s*goes\s*it|how\s*is\s*your\s*day|are\s*you\s*(?:good|ok|okay|fine)|hegidira|hegidiri|hegiddira|channagiddira|neevu\s*hegidira|hege\s*idheera|hegiddiri|hegiddeera)\b/i.test(lowerMsg) ||
    /^(how\s*(?:are|r|re)\s*(?:you|u|ya)|hegidira|hegidiri|hegiddira|channagiddira)[\s?!.]*$/i.test(lowerMsg) ||
    lowerMsg.includes('ಹೇಗಿದ್ದೀರಾ') || lowerMsg.includes('ಹೇಗಿದ್ದೀರಿ') || lowerMsg.includes('ಚೆನ್ನಾಗಿದ್ದೀರಾ') || lowerMsg.includes('ನೀವು ಹೇಗಿದ್ದೀರಾ');
  if (isHowAreYou) {
    return {
      reply: isKn || /[\u0C80-\u0CFF]/.test(rawTrimmed)
        ? `ನಾನು ತುಂಬಾ ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಕೇಳಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು! 😊 ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ ನಲ್ಲಿ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಸಾಲೆ ಮತ್ತು ಪಾಕವಿಧಾನ ಸಹಾಯಕನಾಗಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸದಾ ಸಿದ್ಧನಿದ್ದೇನೆ. ನೀವು ಹೇಗಿದ್ದೀರಿ, ಇಂದು ಯಾವ ರುಚಿಕರವಾದ ಅಡುಗೆ ಮಾಡಲು ಯೋಚಿಸುತ್ತಿದ್ದೀರಿ?`
        : (isKanglish
            ? `Naanu thumba chennagiddene, dhanyavadagalu! 😊 Indima Spice Co nalli nimge sahaya madoke ready iddene. Neevu hegiddira? Ivattu yava dish try madona?`
            : `I'm doing great, thank you for asking! 😊 As your culinary and spice companion at Indima Spice Co., I'm ready to help you with authentic Karnataka recipes, cooking tips, or our pure stone-ground spices. How are you doing today, and what would you like to cook?`),
      recommendedProducts: [],
      suggestedFollowUps: isKn ? [
        'ಚಿಕನ್ ಬಿರಿಯಾನಿ ರೆಸಿಪಿ',
        'ಉಡುಪಿ ಸಾಂಬಾರ್ ರೆಸಿಪಿ',
        'ಇಂದಿಮಾ ಮಸಾಲೆಗಳನ್ನು ತೋರಿಸಿ'
      ] : [
        'Chicken Biryani Recipe',
        'Udupi Sambar Recipe',
        'Show Indima Spices'
      ]
    };
  }

  // 4. Who are you / Identity
  const isIdentityQuery = /\b(who\s*are\s*(you|u)|what\s*is\s*your\s*name|what\s*can\s*you\s*do|tell\s*me\s*about\s*yourself|what\s*are\s*you|neevu\s*yaaru|nimma\s*hesaru)\b/i.test(lowerMsg);
  if (isIdentityQuery) {
    return {
      reply: isKn || /[\u0C80-\u0CFF]/.test(rawTrimmed)
        ? `ನಾನು **ಇಂದಿಮಾ AI** – ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ ನ ಅಧಿಕೃತ ಪಾಕವಿಧಾನ ಮತ್ತು ಮಸಾಲೆ ಸಹಾಯಕ! 🌿 ನಾನು ನಿಮಗೆ ಕರ್ನಾಟಕದ ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆ ವಿಧಾನಗಳು, ನಿಖರ ಮಸಾಲೆ ಅಳತೆಗಳು, ಜನಸಂಖ್ಯೆಗೆ ತಕ್ಕಂತೆ ರೆಸಿಪಿ ಹೊಂದಾಣಿಕೆ ಮತ್ತು ಶುದ್ಧ ಕಲ್ಲಿನ ಮಸಾಲೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಬಲ್ಲೆ.`
        : (isKanglish
            ? `Naanu **Indima AI** – Indima Spice Co na official recipe & spice assistant! 🌿 Authentic Karnataka recipes, spice measurements mathu Indima pure stone-ground spices bagge nimage complete guidance kodthini.`
            : `I am **Indima AI**, the official culinary and spice companion for Indima Spice Co.! 🌿 I can provide step-by-step authentic recipes, calculate exact spice measurements, adjust servings, and recommend our 100% natural, FSSAI-certified stone-ground spices.`),
      recommendedProducts: [],
      suggestedFollowUps: isKn ? ['ಇಂದಿಮಾ ಮಸಾಲೆಗಳು', 'ಉಡುಪಿ ಸಾಂಬಾರ್ ರೆಸಿಪಿ'] : ['Tell me about Indima spices', 'Udupi Sambar Recipe']
    };
  }

  // 5. Casual Conversation: Thanks
  if (['thanks', 'thank you', 'thank u', 'thanks a lot', 'tq', 'thx', 'dhanyavada', 'dhanyavadagalu', 'dhanyavadha', 'many thanks'].some(t => lowerMsg.includes(t))) {
    return {
      reply: isKn
        ? `ತುಂಬಾ ಧನ್ಯವಾದಗಳು! 😊 ಇಂದಿಮಾ ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಮಸಾಲೆಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಅಡುಗೆ ಸದಾ ಸುವಾಸನೆ ಮತ್ತು ರುಚಿಕರವಾಗಿರಲಿ! ಸಂತೋಷದ ಅಡುಗೆ ನಿಮ್ಮದಾಗಲಿ.`
        : `You're very welcome! 😊 Happy cooking with Indima authentic stone-ground spices!`,
      recommendedProducts: [],
      suggestedFollowUps: isKn ? [
        'ಇನ್ನೊಂದು ರೆಸಿಪಿ ಕೇಳಿ',
        'ಇಂದಿಮಾ ಉತ್ಪನ್ನಗಳ ಪಟ್ಟಿ',
        'ಅಡುಗೆ ಸಲಹೆಗಳು'
      ] : [
        'Ask for another recipe',
        'What Indima products do you have?',
        'Master Cooking Tips'
      ]
    };
  }

  // 6. Casual Conversation: Okay / Got it
  if (['okay', 'ok', 'k', 'sure', 'alright', 'got it', 'sari', 'aytu', 'gotcha', 'cool', 'noted', 'fine'].includes(lowerMsg)) {
    return {
      reply: isKn
        ? `ಉತ್ತಮ! ಯಾವುದೇ ಅಡುಗೆ ವಿಧಾನ, ಪದಾರ್ಥಗಳ ನಿಖರ ಅಳತೆ ಅಥವಾ ಮಸಾಲೆಗಳ ಶಿಫಾರಸು ಬೇಕಿದ್ದರೆ ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಕೇಳಿ.`
        : `Great! Let me know if you need any recipe steps, ingredient measurements, or spice recommendations.`,
      recommendedProducts: [],
      suggestedFollowUps: isKn ? [
        'ಚಿಕನ್ ಬಿರಿಯಾನಿ',
        'ಕರ್ನಾಟಕ ಸಾಂಬಾರ್',
        'ಇಂದಿಮಾ ಮಸಾಲೆಗಳು'
      ] : [
        'Chicken Biryani Recipe',
        'Karnataka Sambar Recipe',
        'Show Indima Products'
      ]
    };
  }

  // 7. Casual Conversation: Compliments (Nice, Good, Super)
  if (['nice', 'good', 'great', 'awesome', 'super', 'mast', 'channagide', 'tumba channagide', 'perfect', 'wonderful', 'excellent', 'amazing'].includes(lowerMsg)) {
    return {
      reply: isKn
        ? `ಧನ್ಯವಾದಗಳು! 😊 ಮುಂದೆ ಯಾವ ಅಡುಗೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲು ಬಯಸುತ್ತೀರಿ ಎಂದು ತಿಳಿಸಿ.`
        : `Thank you! Let me know what you would like to cook next or if you need any spice details.`,
      recommendedProducts: [],
      suggestedFollowUps: isKn ? [
        'ಚಿಕನ್ ಕರಿ ರೆಸಿಪಿ',
        'ಮಟನ್ ಸಾರು ರೆಸಿಪಿ',
        'ಇಂದಿಮಾ ಉತ್ಪನ್ನಗಳು'
      ] : [
        'Chicken Curry Recipe',
        'Mutton Curry Recipe',
        'What Indima products do you have?'
      ]
    };
  }

  // 8. Casual Conversation: Bye
  if (['bye', 'goodbye', 'see you', 'tata', 'good night', 'cya', 'bye bye', 'vidaya'].includes(lowerMsg)) {
    return {
      reply: isKn
        ? `ವಿದಾಯ! 👋 ಇಂದಿಮಾ ಮಸಾಲೆಗಳೊಂದಿಗೆ ರುಚಿಕರವಾದ ಅಡುಗೆ ಮಾಡಲು ನೀವು ಸಿದ್ಧರಾದಾಗ ಮತ್ತೆ ಭೇಟಿ ನೀಡಿ.`
        : `Goodbye! 👋 Come back whenever you're ready to cook something delicious with Indima spices.`,
      recommendedProducts: [],
      suggestedFollowUps: isKn ? ['ನಮಸ್ಕಾರ'] : ['Hello']
    };
  }

  // =========================================================================
  // PRIORITY 2: AMBIGUOUS SHORT KEYWORDS (RULE #7: NEVER ASSUME INTENT)
  // =========================================================================
  const words = lowerMsg.split(/\s+/).filter(Boolean);
  const actionKeywords = ['recipe', 'how', 'make', 'cook', 'prepare', 'spices', 'spice', 'buy', 'ingredients', 'cost', 'price', 'show', 'give', 'tell', 'need', 'want', 'recommend', 'suggestion', 'for', 'within', 'budget'];
  const hasActionVerb = words.some(w => actionKeywords.includes(w));

  if (!hasActionVerb && words.length <= 2) {
    if (words.includes('chicken')) {
      return {
        reply: isKn
          ? `ನಿಮಗೆ ಚಿಕನ್ ರೆಸಿಪಿ ಬೇಕೇ (ಉದಾಹರಣೆಗೆ ಚಿಕನ್ ಬಿರಿಯಾನಿ ಅಥವಾ ನಾಟಿ ಶೈಲಿಯ ಚಿಕನ್ ಸಾರು), ಮಸಾಲೆ ಶಿಫಾರಸುಗಳೇ ಅಥವಾ ಇನ್ಯಾವುದಾದರೂ ಮಾಹಿತಿಯೇ?`
          : `Would you like a chicken recipe (such as Chicken Biryani or Karnataka Chicken Curry), spice recommendations, or something else?`,
        recommendedProducts: [],
        suggestedFollowUps: isKn ? [
          'ಚಿಕನ್ ಬಿರಿಯಾನಿ ರೆಸಿಪಿ',
          'ಚಿಕನ್ ಸಾರಿಗೆ ಯಾವ ಮಸಾಲೆಗಳು ಬೇಕು?',
          'ಚಿಕನ್ ಸುಕ್ಕಾ ಮಾಡುವ ವಿಧಾನ'
        ] : [
          'Give me chicken biryani recipe',
          'What spices do I need for chicken curry?',
          'Chicken Sukka Recipe'
        ]
      };
    }

    if (words.includes('biryani') || words.includes('briyani') || words.includes('biriyani')) {
      return {
        reply: isKn
          ? `ನಿಮಗೆ ಸಂಪೂರ್ಣ ಬಿರಿಯಾನಿ ಅಡುಗೆ ವಿಧಾನ ಬೇಕೇ ಅಥವಾ ಇಂದಿಮಾ ಮಸಾಲೆಗಳ ಶಿಫಾರಸು ಬೇಕೇ?`
          : `Would you like a complete biryani recipe or recommendations for Indima spices?`,
        recommendedProducts: [],
        suggestedFollowUps: isKn ? [
          'ಚಿಕನ್ ಬಿರಿಯಾನಿ ರೆಸಿಪಿ',
          'ಬಿರಿಯಾನಿಗೆ ಬೇಕಾಗುವ ಇಂದಿಮಾ ಮಸಾಲೆಗಳು',
          '೪ ಜನರಿಗೆ ಬಿರಿಯಾನಿ ಪ್ರಮಾಣ'
        ] : [
          'Give me chicken biryani recipe',
          'What spices do I need for chicken biryani?',
          'Biryani spices within ₹500'
        ]
      };
    }

    if (words.includes('mutton')) {
      return {
        reply: isKn
          ? `ನಿಮಗೆ ಮಟನ್ ಸಾರು ರೆಸಿಪಿ ಬೇಕೇ, ಮಸಾಲೆ ಶಿಫಾರಸುಗಳೇ ಅಥವಾ ಬೇರೆ ಮಾಹಿತಿಯೇ?`
          : `Would you like a Karnataka Mutton Curry recipe, spice recommendations, or something else?`,
        recommendedProducts: [],
        suggestedFollowUps: isKn ? [
          'ಮಟನ್ ಸಾರು ರೆಸಿಪಿ',
          'ಮಟನ್ ಅಡುಗೆಗೆ ಮಸಾಲೆಗಳು'
        ] : [
          'Mutton Curry Recipe',
          'What spices do I need for mutton curry?'
        ]
      };
    }

    if (words.includes('sambar') || words.includes('saambar') || words.includes('huli')) {
      return {
        reply: isKn
          ? `ನಿಮಗೆ ಸಾಂಪ್ರದಾಯಿಕ ಕರ್ನಾಟಕ ಸಾಂಬಾರ್ ರೆಸಿಪಿ ಬೇಕೇ ಅಥವಾ ಇಂದಿಮಾ ಉಡುಪಿ ಸಾಂಬಾರ್ ಪುಡಿಯ ವಿವರ ಬೇಕೇ?`
          : `Would you like a traditional Karnataka Sambar recipe or recommendations for Indima spices?`,
        recommendedProducts: [],
        suggestedFollowUps: isKn ? [
          'ಉಡುಪಿ ಸಾಂಬಾರ್ ರೆಸಿಪಿ',
          'ಸಾಂಬಾರ್‌ಗೆ ಬೇಕಾಗುವ ಮಸಾಲೆಗಳು'
        ] : [
          'How do I make sambar?',
          'What spices do I need for sambar?'
        ]
      };
    }

    if (words.includes('rasam') || words.includes('saaru')) {
      return {
        reply: isKn
          ? `ನಿಮಗೆ ಪಾರಂಪರಿಕ ರಸಂ (ಸಾರು) ರೆಸಿಪಿ ಬೇಕೇ ಅಥವಾ ಇಂದಿಮಾ ಮನೆಯಾರ ರಸಂ ಪುಡಿಯ ವಿವರ ಬೇಕೇ?`
          : `Would you like a heritage Rasam recipe or recommendations for Indima Rasam Powder?`,
        recommendedProducts: [],
        suggestedFollowUps: isKn ? [
          'ಟೊಮೆಟೊ-ಮೆಣಸಿನ ಸಾರು ರೆಸಿಪಿ',
          'ರಸಂಗೆ ಬೇಕಾಗುವ ಮಸಾಲೆಗಳು'
        ] : [
          'How to prepare rasam?',
          'What spices do I need for rasam?'
        ]
      };
    }

    if (words.includes('bisibelebath') || words.includes('bisi') || words.includes('bath')) {
      return {
        reply: isKn
          ? `ನಿಮಗೆ ಸಾಂಪ್ರದಾಯಿಕ ಮೈಸೂರು ಬಿಸಿಬೇಳೆಬಾತ್ ರೆಸಿಪಿ ಬೇಕೇ ಅಥವಾ ಬಿಸಿಬೇಳೆಬಾತ್ ಪುಡಿಯ ವಿವರ ಬೇಕೇ?`
          : `Would you like a traditional Mysuru Bisi Bele Bath recipe or recommendations for Indima Bisi Bele Bath Powder?`,
        recommendedProducts: [],
        suggestedFollowUps: isKn ? [
          'ಬಿಸಿಬೇಳೆಬಾತ್ ರೆಸಿಪಿ',
          'ಬಿಸಿಬೇಳೆಬಾತ್ ಪುಡಿಯ ವಿವರ'
        ] : [
          'Bisi Bele Bath Recipe',
          'What spices do I need for Bisi Bele Bath?'
        ]
      };
    }

    if (words.includes('puliyogare')) {
      return {
        reply: isKn
          ? `ನಿಮಗೆ ಮೇಳಕೋಟೆ ಶೈಲಿಯ ಪುಳಿಯೋಗರೆ ರೆಸಿಪಿ ಬೇಕೇ ಅಥವಾ ಇಂದಿಮಾ ಪುಳಿಯೋಗರೆ ಗೊಜ್ಜು ಮಿಕ್ಸ್ ವಿವರ ಬೇಕೇ?`
          : `Would you like a Melukote style Puliyogare recipe or recommendations for Indima Puliyogare Mix?`,
        recommendedProducts: [],
        suggestedFollowUps: isKn ? [
          'ಪುಳಿಯೋಗರೆ ರೆಸಿಪಿ',
          'ಪುಳಿಯೋಗರೆ ಮಿಕ್ಸ್ ವಿವರ'
        ] : [
          'Puliyogare Recipe',
          'Show Puliyogare Mix'
        ]
      };
    }

    if (words.includes('paneer') || words.includes('veg') || words.includes('vegetable') || words.includes('egg') || words.includes('fish')) {
      const ingredient = words[0];
      return {
        reply: isKn
          ? `ನಿಮಗೆ ${ingredient} ರೆಸಿಪಿ ಬೇಕೇ ಅಥವಾ ಅದಕ್ಕೆ ಸೂಕ್ತವಾದ ಮಸಾಲೆಗಳ ಶಿಫಾರಸು ಬೇಕೇ?`
          : `Would you like a recipe for ${ingredient}, spice recommendations, or something else?`,
        recommendedProducts: [],
        suggestedFollowUps: isKn ? [
          `${ingredient} ರೆಸಿಪಿ`,
          `${ingredient} ಗೆ ಬೇಕಾಗುವ ಮಸಾಲೆಗಳು`
        ] : [
          `Recipe for ${ingredient}`,
          `What spices do I need for ${ingredient}?`
        ]
      };
    }
  }

  // =========================================================================
  // PRIORITY 3: PRODUCT SEARCH / CATALOG QUESTIONS (NO UNRELATED RECIPES)
  // =========================================================================

  // General catalog list questions
  const isCatalogQuery = [
    'what indima products do you have', 'what products do you sell', 'show me your spices',
    'show products', 'list of spices', 'what spices do you have', 'what do you sell',
    'all products', 'products list', 'show catalogue', 'show catalog', 'spices list',
    'your products', 'indima products'
  ].some(k => lowerMsg.includes(k));

  if (isCatalogQuery) {
    const productSummaries: RecommendedProductSummary[] = activeProducts.map(p => ({
      id: p.id,
      name_en: p.name_en,
      name_kn: p.name_kn,
      price: p.price,
      mrp: p.mrp,
      weight: p.weight,
      image: p.images && p.images[0],
      category_id: p.category_id,
      inStock: (p.stock || 0) > 0,
      stock: p.stock || 0
    }));

    const catalogText_en = `Here are our authentic, stone-ground Karnataka spices and whole spices currently available in the Indima catalog:

${productSummaries.map(p => `- **${p.name_en}** (₹${p.price} • ${p.weight} • ${p.inStock ? `In Stock - ${p.stock} units` : 'Out of Stock'})
  *Category*: ${p.category_id?.replace('cat-', '').replace(/-/g, ' ').toUpperCase()}
  *Description*: Stone-ground traditional formulation without preservatives, artificial colors or fillers.`).join('\n\n')}

You can ask me for complete recipes or spice recommendations for any dish!`;

    const catalogText_kn = `ಇಂದಿಮಾ ಕ್ಯಾಟಲಾಗ್‌ನಲ್ಲಿ ಲಭ್ಯವಿರುವ ಶುದ್ಧ, ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಸಾಂಪ್ರದಾಯಿಕ ಕರ್ನಾಟಕ ಮಸಾಲೆಗಳು:

${productSummaries.map(p => `- **${p.name_kn || p.name_en}** (₹${p.price} • ${p.weight} • ${p.inStock ? `ಲಭ್ಯವಿದೆ - ${p.stock} ಪ್ಯಾಕೆಟ್‌ಗಳು` : 'ಖಾಲಿಯಾಗಿದೆ'})`).join('\n\n')}

ಯಾವುದೇ ಅಡುಗೆ ವಿಧಾನ ಅಥವಾ ನಿರ್ದಿಷ್ಟ ಮಸಾಲೆಯ ವಿವರಗಳಿಗಾಗಿ ನನ್ನನ್ನು ಕೇಳಬಹುದು!`;

    return {
      reply: isKn ? catalogText_kn : catalogText_en,
      recommendedProducts: productSummaries,
      suggestedFollowUps: isKn ? [
        'ಚಿಕನ್ ಬಿರಿಯಾನಿಗೆ ಯಾವ ಮಸಾಲೆ ಬೇಕು?',
        'ಉಡುಪಿ ಸಾಂಬಾರ್ ರೆಸಿಪಿ',
        '₹೫೦೦ ಬಜೆಟ್‌ನಲ್ಲಿ ಮಸಾಲೆಗಳು'
      ] : [
        'What spices do I need for chicken biryani?',
        'How do I make sambar?',
        'Spices within ₹500 budget'
      ]
    };
  }

  // Specific single spice inquiry (e.g., "Do you have turmeric?", "Do you have pepper?", "How much is your chilli powder?")
  if (lowerMsg.includes('turmeric') || lowerMsg.includes('haldi') || lowerMsg.includes('arishina')) {
    return {
      reply: isKn
        ? `ಪ್ರಸ್ತುತ ಇಂದಿಮಾ ಕ್ಯಾಟಲಾಗ್‌ನಲ್ಲಿ ಪ್ರತ್ಯೇಕವಾದ ಅರಿಶಿನ ಪುಡಿ ಲಭ್ಯವಿಲ್ಲ. ಆದರೆ ನಮ್ಮ **ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪಿ ಸಾಂಬಾರ್ ಪುಡಿ** ಮತ್ತು **ಪಾರಂಪರಿಕ ಮನೆಯ ರಸಂ ಪುಡಿ**ಗಳಲ್ಲಿ ಶುದ್ಧ ಸೇಲಂ ಅರಿಶಿನವನ್ನು ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿ ಬೆರೆಸಲಾಗಿದೆ! ಮನೆಯ ಅಡುಗೆಗೆ ನೀವು ನಿಮ್ಮ ಸಾಮಾನ್ಯ ಅರಿಶಿನ ಪುಡಿಯನ್ನು ಬಳಸಬಹುದು.`
        : `I couldn't find a dedicated single-ingredient turmeric powder in our current catalog. However, 100% pure GI Salem turmeric is naturally stone-ground into our signature blends like **Traditional Udupi Temple Sambar Masala** and **Heritage Maniyara Rasam Powder**! For standalone turmeric, you can use your kitchen pantry spice.`,
      recommendedProducts: [],
      suggestedFollowUps: isKn ? ['ಉಡುಪಿ ಸಾಂಬಾರ್ ಪುಡಿ', 'ಮನೆಯ ರಸಂ ಪುಡಿ'] : ['Udupi Sambar Masala', 'Maniyara Rasam Powder']
    };
  }

  if (lowerMsg.includes('coriander powder') || lowerMsg.includes('dhaniya powder') || lowerMsg.includes('kottambari')) {
    return {
      reply: isKn
        ? `ಪ್ರಸ್ತುತ ಇಂದಿಮಾ ಕ್ಯಾಟಲಾಗ್‌ನಲ್ಲಿ ಪ್ರತ್ಯೇಕವಾದ ಧನಿಯಾ ಪುಡಿ ಲಭ್ಯವಿಲ್ಲ. ಆದರೆ ನಮ್ಮ ಎಲ್ಲಾ ಸಾಂಬಾರ್, ರಸಂ ಮತ್ತು ಬಿಸಿಬೇಳೆಬಾತ್ ಮಸಾಲೆಗಳಲ್ಲಿ ಸುಗಂಧಭರಿತ ಧನಿಯಾ ಬೀಜಗಳನ್ನು ಸಾಂಪ್ರದಾಯಿಕವಾಗಿ ಹುರಿದು ಸೇರಿಸಲಾಗಿದೆ!`
        : `I couldn't find a dedicated single-ingredient coriander powder in our current catalog, but rich roasted coriander seeds form the aromatic heart of our signature Sambar, Rasam, and Bisi Bele Bath powders.`,
      recommendedProducts: [],
      suggestedFollowUps: ['Show Indima Products', 'Sambar Masala', 'Rasam Powder']
    };
  }

  // Build rich, authoritative catalog metadata for the AI
  const catalogContext = activeProducts.map(p => {
    let suitableFor = 'General cooking';
    let notSuitableFor = 'None';

    if (p.id === 'prod-malnad-garam-masala' || p.id === 'prod-garam-masala') {
      suitableFor = 'Chicken Biryani, Mutton Biryani, Veg Biryani, Pulao, Chicken Curry, Mutton Curry, Egg Curry, Rich Paneer/Vegetable Gravies, Kurma.';
      notSuitableFor = 'STRICTLY NOT for Sambar, Rasam, Bisi Bele Bath, Puliyogare, or Chutney.';
    } else if (p.id === 'prod-udupi-sambar' || p.id === 'prod-sambar-powder') {
      suitableFor = 'Traditional Karnataka Sambar, Udupi Sambar, Veg Sambar, Onion Sambar, Dal/Lentil Gravy.';
      notSuitableFor = 'STRICTLY NOT for Biryani, Pulao, Rasam, Meat Curries, Bisi Bele Bath, Puliyogare, or Chutney.';
    } else if (p.id === 'prod-rasam-powder') {
      suitableFor = 'Heritage Maniyara Saaru, Tomato Rasam, Pepper-Jeera Rasam, Garlic Rasam, Digestive Herbal Broth.';
      notSuitableFor = 'STRICTLY NOT for Biryani, Sambar, Curries, Bisi Bele Bath, Puliyogare, or Chutney.';
    } else if (p.id === 'prod-bisibelebath') {
      suitableFor = 'Traditional Mysuru Bisi Bele Bath and spiced lentil-rice dishes only.';
      notSuitableFor = 'STRICTLY NOT for Biryani, Sambar, Rasam, Curries, or Puliyogare.';
    } else if (p.id === 'prod-puliyogare-mix') {
      suitableFor = 'Melukote style Puliyogare (Tamarind Rice) and Temple Gojju.';
      notSuitableFor = 'STRICTLY NOT for Biryani, Sambar, Rasam, Curries, or Bisi Bele Bath.';
    } else if (p.id === 'prod-vangibath-powder') {
      suitableFor = 'Vangi Bath (Brinjal Rice), Capsicum Rice, and Vegetable Bath.';
      notSuitableFor = 'STRICTLY NOT for Biryani, Sambar, Rasam, or Meat Curries.';
    } else if (p.id === 'prod-byadgi-chillies') {
      suitableFor = 'Dishes needing natural crimson color & mild aromatic heat: Biryani marination paste, Kundapura Chicken Curry, Mangalore Ghee Roast, Sambar tadka, Rasam tempering.';
      notSuitableFor = 'None (can be used as whole spice where red chillies are required).';
    } else if (p.id === 'prod-coorg-pepper') {
      suitableFor = 'Dishes needing Tellicherry black pepper: Biryani rice boiling pot, Pepper Chicken, Pepper Rasam, Kadai Gravy, Soups, Whole Spice tempering.';
      notSuitableFor = 'None (can be used where whole/crushed black pepper is required).';
    } else if (p.id === 'prod-chutney-pudi') {
      suitableFor = 'Accompaniment for Jolada Rotti, Idli, Dosa, Rice with pure Ghee.';
      notSuitableFor = 'STRICTLY NOT for cooking Biryani, Sambar, Rasam, or Curries.';
    } else if (p.id.includes('combo') || p.id.includes('box')) {
      suitableFor = 'ONLY when customer explicitly asks for gift boxes, full spice hampers, combo value packs, or complete kitchen starter bundles.';
      notSuitableFor = 'STRICTLY NEVER recommend combo boxes for single dish requests (e.g. Do NOT recommend a ₹899 box when customer asks for Biryani or Sambar).';
    }

    return {
      id: p.id,
      name_en: p.name_en,
      name_kn: p.name_kn,
      category: p.category_id,
      price: p.price,
      mrp: p.mrp,
      weight: p.weight,
      in_stock: (p.stock || 0) > 0,
      stock: p.stock || 0,
      ingredients: p.ingredients_en || '',
      description: p.description_en || '',
      suitable_for: suitableFor,
      strictly_not_suitable_for: notSuitableFor
    };
  });

  const systemInstruction = `You are "Indima AI – Your Personal Spice & Recipe Assistant", the master culinary companion and spice expert for Indima Spice Co. (Bengaluru, Karnataka).

Indima Spice Co. crafts authentic, traditional stone-ground homemade masala powders and whole spices without preservatives, additives, chemicals, or artificial colors. Recognized and certified by FSSAI (Lic. No: 21226194000378).

══════════════════════════════════════════════════
AUTHORITATIVE INDIMA PRODUCT CATALOG (READ-ONLY)
══════════════════════════════════════════════════
${JSON.stringify(catalogContext, null, 2)}

══════════════════════════════════════════════════
BEHAVIOR & CONVERSATION RULES (STRICT CHATGPT / GOOGLE AI RELATABILITY)
══════════════════════════════════════════════════

1. CASUAL MESSAGES, GREETINGS & SMALL TALK:
- If the customer asks "How are you?", "How r u?", "Who are you?", "What is your name?", "What can you do?", or sends greetings ("Hi", "Hello", "Namaskara", "Good morning", "Thanks", "Okay", "Bye"):
  * Respond directly, politely, and conversationally in the exact same relatable style as ChatGPT or Google AI.
  * NEVER output unsolicited recipe templates, cooking steps, or product recommendations for casual conversations or greetings.
  * Always output empty <<<RECOMMENDED_PRODUCTS_JSON: []>>> on casual queries.

2. HERITAGE, SPICE HISTORY & BUSINESS INQUIRIES:
- If the customer asks about the history of spices, how spices are created, the business philosophy, or food safety:
  * In stylish, evocative English / Kannada, explain how traditional stone-grinding preserves volatile essential oils and rich aroma without harsh machine heat friction.
  * Emphasize 100% natural, pure farm-sourced ingredients with zero chemicals/preservatives.
  * Highlight that Indima Spice Co. is **Recognized & Certified by FSSAI** (Lic. No: 21226194000378).
  * Output empty <<<RECOMMENDED_PRODUCTS_JSON: []>>> unless they specifically ask which products to purchase.

3. GENERAL QUESTIONS & CULINARY KNOWLEDGE:
- If the customer asks a general question (e.g., "Why are stone ground spices better?", "What makes Byadgi chillies special?", "How should I store spices?", "What is the difference between Sambar and Rasam?"), answer directly, factually, and concisely without dumping full recipe templates.

4. RECIPE REQUESTS (ONLY WHEN EXPLICITLY ASKED FOR A RECIPE):
- When the customer asks for a recipe (e.g., "How to make Udupi Sambar?", "Give me chicken biryani recipe", "Melukote puliyogare recipe kodi"):
  * Structure:
    - **Dish Title**: e.g., 🍛 **Traditional Udupi Sambar**
    - **Overview**: **Servings:** [X] persons | **Prep Time:** [X] mins | **Cooking Time:** [X] mins
    - **Ingredients**: Exact quantities and measurements for all ingredients and spices (e.g. 1.5 tsp, 500g, 2 cups).
    - **Step-by-Step Method**: Clear numbered cooking steps from prep to simmering and tempering.
    - **Chef's Pro Tips**: Authentic regional tips (e.g., tempering in pure ghee, roasting aroma).
    - **🛒 Recommended Indima Spices** (if applicable): Recommend ONLY verified matching products from the catalog.
  * If an ingredient (like turmeric, ginger-garlic paste, salt) is not in our catalog, note that they can use their pantry spice.

5. SPICE / PRODUCT INQUIRIES (WHAT TO USE OR BUY):
- When the customer asks which spices to buy or use for a dish (e.g., "What spices do I need for chicken biryani?", "What products do you have?"):
  * Recommend ONLY genuine matching Indima products from the catalog.
  * Strict dish matching:
    - Biryani / Pulao / Rich Curries -> Stone-Ground Malnad Garam Masala, Coorg Black Pepper, Byadgi Whole Red Chillies.
    - Sambar -> Traditional Udupi Temple Sambar Masala, Byadgi Whole Red Chillies.
    - Rasam -> Heritage Maniyara Rasam Powder, Coorg Black Pepper.
    - Bisi Bele Bath -> Traditional Mysuru Bisi Bele Bath Powder.
    - Puliyogare -> Melukote Style Puliyogare Gojju Mix.
    - Vangi Bath -> Traditional Vangi Bath Powder.
    - Jolada Rotti / Chutney -> North Karnataka Shenga Chutney Pudi.
    - Complete Gift / Pantry Box -> Karnataka Grand Festive Spice Box (ONLY when asked for combos, gifts, or bundles).

6. ZERO PRODUCT HALLUCINATION:
- NEVER invent products, prices, weights, stock counts, or offers not in the catalog.
- Use exact product names, prices (₹), MRP, and weights from the catalog.

7. CONVERSATION CONTEXT & FOLLOW-UPS:
- Understand follow-up requests using the recent conversation history (e.g., "make it for 8 people" -> scale ingredient quantities; "make it less spicy" -> reduce chillies & pepper; "how long to cook in pressure cooker?" -> answer for the previous dish).

8. MULTILINGUAL SUPPORT (ENGLISH, KANNADA, KANGLISH):
- Respond in the language used by the customer:
  * English -> English
  * Kannada (ಕನ್ನಡ ಲಿಪಿ) -> Authentic, polite Kannada
  * Kanglish (Kannada in Latin script, e.g. "biryani hege madodu?") -> Friendly, natural Kanglish or Kannada-aware English.

9. MANDATORY JSON METADATA AT END OF RESPONSE:
<<<RECOMMENDED_PRODUCTS_JSON: ["prod-id-1", "prod-id-2"]>>>
(or empty array <<<RECOMMENDED_PRODUCTS_JSON: []>>> if no products to buy/recommend)
<<<FOLLOW_UPS_JSON: ["Suggested question 1", "Suggested question 2", "Suggested question 3"]>>>`;

  const ai = getGenAiClient();

  if (!ai) {
    return getOfflineFallbackResponse(message, activeProducts, language, history);
  }

  try {
    // Format conversation history for Gemini API
    const formattedContents = [];

    // Include recent session history (up to last 6 messages)
    const recentHistory = history.slice(-6);
    for (const h of recentHistory) {
      formattedContents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content.substring(0, 1500) }]
      });
    }

    // Add current user message
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // 10 second timeout for primary Gemini API request
    const createTimeout = (ms: number, desc: string) => {
      return new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`${desc} timed out after ${ms}ms`)), ms)
      );
    };

    let response: any = null;
    try {
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.2
        }
      });
      response = await Promise.race([generatePromise, createTimeout(10000, 'Primary model (gemini-3.7-flash)')]);
    } catch (primaryErr: any) {
      safeLogAiWarning('Primary model temporarily unavailable or overloaded, trying fast fallback model', primaryErr);

      // Single fallback attempt to lightweight model if primary is overloaded (503), rate-limited (429), or timed out
      const errStr = sanitizeErrorForLog(primaryErr).toLowerCase();
      const isTransientError =
        errStr.includes('503') ||
        errStr.includes('429') ||
        errStr.includes('500') ||
        errStr.includes('overloaded') ||
        errStr.includes('unavailable') ||
        errStr.includes('timed out') ||
        errStr.includes('resource_exhausted') ||
        primaryErr?.status === 503 ||
        primaryErr?.status === 429 ||
        primaryErr?.status === 500 ||
        primaryErr?.code === 503 ||
        primaryErr?.code === 429;

      if (isTransientError) {
        try {
          const liteGeneratePromise = ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.2
            }
          });
          response = await Promise.race([liteGeneratePromise, createTimeout(8000, 'Fallback model (gemini-3.1-flash-lite)')]);
        } catch (secondaryErr: any) {
          safeLogAiWarning('Secondary model also unavailable, seamlessly utilizing local recipe & catalog engine', secondaryErr);
          return getOfflineFallbackResponse(message, activeProducts, language, history);
        }
      } else {
        safeLogAiWarning('Non-transient error on primary model, seamlessly utilizing local recipe & catalog engine', primaryErr);
        return getOfflineFallbackResponse(message, activeProducts, language, history);
      }
    }

    const fullText = response?.text || '';
    if (!fullText || typeof fullText !== 'string' || !fullText.trim()) {
      safeLogAiWarning('Empty text received from model, using local recipe engine', { message: 'Empty response text' });
      return getOfflineFallbackResponse(message, activeProducts, language, history);
    }

    // Extract Recommended Products JSON block
    let recommendedIds: string[] = [];
    let cleanReply = fullText;

    const prodMatch = cleanReply.match(/<<<RECOMMENDED_PRODUCTS_JSON:\s*(\[.*?\])\s*>>>/s);
    if (prodMatch && prodMatch[1]) {
      try {
        recommendedIds = JSON.parse(prodMatch[1]);
        cleanReply = cleanReply.replace(prodMatch[0], '').trim();
      } catch (e) {
        console.warn('[Indima AI] Failed to parse recommended products json:', e);
      }
    }

    // Extract Suggested Follow-Ups JSON block
    let suggestedFollowUps: string[] = [];
    const followUpMatch = cleanReply.match(/<<<FOLLOW_UPS_JSON:\s*(\[.*?\])\s*>>>/s);
    if (followUpMatch && followUpMatch[1]) {
      try {
        suggestedFollowUps = JSON.parse(followUpMatch[1]);
        cleanReply = cleanReply.replace(followUpMatch[0], '').trim();
      } catch (e) {
        console.warn('[Indima AI] Failed to parse follow-ups json:', e);
      }
    }

    if (suggestedFollowUps.length === 0) {
      suggestedFollowUps = language === 'kn' ? [
        '೪ ಜನರಿಗೆ ಪ್ರಮಾಣ ಬದಲಾಯಿಸಿ',
        'ಕಡಿಮೆ ಖಾರದಲ್ಲಿ ಹೇಗೆ ಮಾಡುವುದು?',
        'ಪ್ರೆಶರ್ ಕುಕ್ಕರ್‌ನಲ್ಲಿ ಮಾಡುವ ವಿಧಾನ'
      ] : [
        'Adjust recipe for 8 people',
        'Make it less spicy',
        'Adapt for Pressure Cooker'
      ];
    }

    // Strict validation: Verify extracted IDs against dish affinity to ensure zero hallucinations
    const matchedAffinity = findDishAffinity(message, history);
    if (matchedAffinity && matchedAffinity.excludedProductIds.length > 0) {
      recommendedIds = recommendedIds.filter(id => !matchedAffinity.excludedProductIds.includes(id));
    }

    // Lookup actual product summaries for the verified IDs
    const recommendedProductSummaries: RecommendedProductSummary[] = [];
    for (const pid of recommendedIds) {
      const prod = activeProducts.find(p => p.id === pid);
      if (prod) {
        recommendedProductSummaries.push({
          id: prod.id,
          name_en: prod.name_en,
          name_kn: prod.name_kn,
          price: prod.price,
          mrp: prod.mrp,
          weight: prod.weight,
          image: prod.images && prod.images[0],
          category_id: prod.category_id,
          inStock: (prod.stock || 0) > 0,
          stock: prod.stock || 0
        });
      }
    }

    return {
      reply: cleanReply,
      recommendedProducts: recommendedProductSummaries,
      suggestedFollowUps
    };
  } catch (apiErr: any) {
    safeLogAiWarning('AI assistant request encountered error, seamlessly transitioning to verified local recipe & spice engine', apiErr);
    // Fallback gracefully to our dish-aware, catalog-verified recommendation engine
    return getOfflineFallbackResponse(message, activeProducts, language, history);
  }
}

// Helper to determine dish context from message or recent conversation history
function findDishAffinity(message: string, history: ChatMessage[] = []): DishAffinity | null {
  const combinedText = [
    message,
    ...history.slice(-3).map(h => h.content)
  ].join(' ').toLowerCase();

  for (const affinity of DISH_AFFINITIES) {
    for (const kw of affinity.keywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        return affinity;
      }
    }
  }

  return null;
}

// Fallback intelligent response generator following all strict catalog & intent rules
export function getOfflineFallbackResponse(
  message: string,
  products: Product[],
  language: 'en' | 'kn',
  history: ChatMessage[] = []
): AiAssistantResponse {
  const isKn = language === 'kn' || /[\u0C80-\u0CFF]/.test(message);
  const q = message.toLowerCase().trim();

  // Check if message is a casual conversation or how are you
  const isCasualHowAreYou = /\b(how\s*(?:are|r|re|is)\s*(?:you|u|ya|things|everything|life|it\s*going|your\s*day)|how're\s*you|how's\s*it\s*going|hows\s*it\s*going|how\s*do\s*you\s*do|how\s*are\s*you\s*doing|hegidira|hegidiri|hegiddira|channagiddira|neevu\s*hegidira)\b/i.test(q) ||
    /^(how\s*(?:are|r|re)\s*(?:you|u|ya)|hegidira|hegidiri|hegiddira|channagiddira)[\s?!.]*$/i.test(q) ||
    q.includes('ಹೇಗಿದ್ದೀರಾ') || q.includes('ಹೇಗಿದ್ದೀರಿ') || q.includes('ಚೆನ್ನಾಗಿದ್ದೀರಾ');
  if (isCasualHowAreYou) {
    return {
      reply: isKn
        ? `ನಾನು ತುಂಬಾ ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಕೇಳಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು! 😊 ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ ನಲ್ಲಿ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಸಾಲೆ ಮತ್ತು ಪಾಕವಿಧಾನ ಸಹಾಯಕನಾಗಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸದಾ ಸಿದ್ಧನಿದ್ದೇನೆ. ನೀವು ಹೇಗಿದ್ದೀರಿ, ಇಂದು ಯಾವ ರುಚಿಕರವಾದ ಅಡುಗೆ ಮಾಡಲು ಯೋಚಿಸುತ್ತಿದ್ದೀರಿ?`
        : `I'm doing great, thank you for asking! 😊 As your culinary and spice companion at Indima Spice Co., I'm ready to help you with authentic Karnataka recipes, cooking tips, or our pure stone-ground spices. How are you doing today, and what would you like to cook?`,
      recommendedProducts: [],
      suggestedFollowUps: isKn ? [
        'ಚಿಕನ್ ಬಿರಿಯಾನಿ ರೆಸಿಪಿ',
        'ಉಡುಪಿ ಸಾಂಬಾರ್ ರೆಸಿಪಿ',
        'ಇಂದಿಮಾ ಮಸಾಲೆಗಳನ್ನು ತೋರಿಸಿ'
      ] : [
        'Chicken Biryani Recipe',
        'Udupi Sambar Recipe',
        'Show Indima Spices'
      ]
    };
  }

  const matchedAffinity = findDishAffinity(message, history);

  // =========================================================================
  // GENERAL QUESTION HANDLING IN FALLBACK (NO UNSOLICITED PRODUCT CARDS)
  // =========================================================================
  if (!matchedAffinity) {
    // 1. Stone ground inquiry
    if (q.includes('stone') || q.includes('ground') || q.includes('kal') || q.includes('machine') || q.includes('difference') || q.includes('special')) {
      return {
        reply: isKn
          ? `ಇಂದಿಮಾ ಮಸಾಲೆಗಳನ್ನು ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ಪದ್ಧತಿಯಲ್ಲಿ ತಯಾರಿಸಲಾಗುತ್ತದೆ. ಆಧುನಿಕ ಯಂತ್ರಗಳಂತೆ ಅತಿಯಾದ ಶಾಖ ಉತ್ಪತ್ತಿಯಾಗದೆ, ಮಸಾಲೆಗಳಲ್ಲಿರುವ ನೈಸರ್ಗಿಕ ಸಾರಭೂತ ತೈಲಗಳು (essential oils), ಸುವಾಸನೆ ಮತ್ತು ಆಂಟಿಆಕ್ಸಿಡೆಂಟ್‌ಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಉಳಿಯುತ್ತವೆ. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಅಥವಾ ಕೃತಕ ಬಣ್ಣಗಳಿಲ್ಲದೆ ಶುದ್ಧ ರುಚಿ ನೀಡುತ್ತದೆ.`
          : `At Indima Spice Co., our spices are prepared using traditional slow stone-grinding methods. Unlike high-speed commercial pulverizers that generate extreme friction heat and destroy volatile aromatic oils, slow stone grinding preserves the essential oils, delicate fragrance, and natural antioxidants for authentic heritage flavor.`,
        recommendedProducts: [],
        suggestedFollowUps: isKn ? [
          'ಉಡುಪಿ ಸಾಂಬಾರ್ ಪುಡಿ',
          'ಮಲೆನಾಡು ಗರಂ ಮಸಾಲಾ',
          'ಇಂದಿಮಾ ಮಸಾಲೆಗಳ ಪಟ್ಟಿ'
        ] : [
          'What products do you offer?',
          'Tell me about Byadgi chillies',
          'How to make Udupi Sambar?'
        ]
      };
    }

    // 2. Byadgi Chilli inquiry
    if (q.includes('byadgi') || q.includes('chilli') || q.includes('chilli powder') || q.includes('menasina')) {
      return {
        reply: isKn
          ? `ಕರ್ನಾಟಕದ ಜಿಐ ಟ್ಯಾಗ್ (GI Tag) ಹೊಂದಿರುವ ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿಗಳು ತಮ್ಮ ಆಕರ್ಷಕ ಗಾಢ ಕೆಂಪು ಬಣ್ಣ ಮತ್ತು ಸೌಮ್ಯವಾದ ಖಾರಕ್ಕೆ ವಿಶ್ವಪ್ರಸಿದ್ಧ. ಇದು ಅಡುಗೆಗೆ ಸುಂದರ ಕೆಂಪು ಬಣ್ಣವನ್ನು ನೀಡುತ್ತದೆ ಮತ್ತು ಹೊಟ್ಟೆಗೆ ಹಾನಿಯಾಗದಂತೆ ಮೃದುವಾದ ಖಾರವನ್ನು ಒದಗಿಸುತ್ತದೆ.`
          : `Karnataka's GI-tagged Byadgi whole red chillies are prized for their deep crimson color (high oleoresin content) and mild, fruity warmth. They give dishes a rich, natural red color without excessive burning heat.`,
        recommendedProducts: [],
        suggestedFollowUps: isKn ? [
          'ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ ವಿವರ',
          'ಸಾಂಬಾರ್‌ಗೆ ಯಾವ ಮೆಣಸು ಸೂಕ್ತ?',
          'ಚಿಕನ್ ಬಿರಿಯಾನಿ ರೆಸಿಪಿ'
        ] : [
          'Tell me about Coorg Black Pepper',
          'Spices for Chicken Biryani',
          'Udupi Sambar Recipe'
        ]
      };
    }

    // 3. Shelf life / Storage inquiry
    if (q.includes('shelf') || q.includes('life') || q.includes('store') || q.includes('expiry') || q.includes('keep') || q.includes('kedu')) {
      return {
        reply: isKn
          ? `ನಮ್ಮ ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಮಸಾಲೆಗಳನ್ನು ತೇವಾಂಶ ಮತ್ತು ನೇರ ಸೂರ್ಯನ ಬೆಳಕಿನಿಂದ ದೂರವಿರುವ ಗಾಳಿಯಾಡದ (airtight) ಪಾತ್ರೆಗಳಲ್ಲಿ ಸಂಗ್ರಹಿಸಿದರೆ ೯ ರಿಂದ ೧೨ ತಿಂಗಳುಗಳವರೆಗೆ ತಮ್ಮ ನೈಸರ್ಗಿಕ ಸುವಾಸನೆ ಮತ್ತು ತಾಜಾತನವನ್ನು ಉಳಿಸಿಕೊಳ್ಳುತ್ತವೆ.`
          : `Our stone-ground spices have an optimal shelf life of 9 to 12 months when stored in an airtight glass or stainless-steel jar in a cool, dry place away from direct sunlight and moisture.`,
        recommendedProducts: [],
        suggestedFollowUps: isKn ? [
          'ಇಂದಿಮಾ ಮಸಾಲೆಗಳು',
          'ಅಡುಗೆ ಸಲಹೆಗಳು'
        ] : [
          'Show Indima Products',
          'Chicken Biryani Recipe',
          'Udupi Sambar Recipe'
        ]
      };
    }

    // 4. Sambar vs Rasam
    if ((q.includes('sambar') && q.includes('rasam')) || q.includes('difference between sambar')) {
      return {
        reply: isKn
          ? `ಸಾಂಬಾರ್ (ಹುಳಿ) ಬೇಯಿಸಿದ ತೊಗರಿಬೇಳೆ, ವೈವಿಧ್ಯಮಯ ತರಕಾರಿಗಳು ಮತ್ತು ಹುರಿದ ಧನಿಯಾ, ಬ್ಯಾಡಗಿ ಮೆಣಸು ಬೆರೆತ ಮಸಾಲೆಯೊಂದಿಗೆ ತಯಾರಾಗುವ ಗಟ್ಟಿ ಸಾರು. ರಸಂ (ಸಾರು) ಟೊಮೆಟೊ, ಜೀರಿಗೆ, ಕಾಳುಮೆಣಸು, ಬೆಳ್ಳುಳ್ಳಿ ಮತ್ತು ಹುಣಸೆಹಣ್ಣಿನಿಂದ ಕೂಡಿದ ಜೀರ್ಣಕಾರಿಯಾದ, ತಿಳಿಯಾದ ಸಾಂಪ್ರದಾಯಿಕ ಸಾರು.`
          : `Sambar (Huli) is a hearty stew made with cooked toor dal, mixed vegetables, and a rich spice blend of roasted coriander and Byadgi chillies. Rasam (Saaru) is a lighter, tangy digestive broth crafted with country tomatoes, black pepper, cumin seeds, garlic, and tamarind.`,
        recommendedProducts: [],
        suggestedFollowUps: isKn ? [
          'ಉಡುಪಿ ಸಾಂಬಾರ್ ರೆಸಿಪಿ',
          'ಮನೆಯ ರಸಂ ರೆಸಿಪಿ'
        ] : [
          'Udupi Sambar Recipe',
          'Maniyara Rasam Recipe',
          'Show Indima Spices'
        ]
      };
    }
  }

  // Check budget request (e.g. "I have ₹500", "within 500 budget")
  const budgetMatch = q.match(/(?:₹|rs\.?|inr|budget\s*of|have)\s*(\d+)/i) || q.match(/(\d+)\s*(?:₹|rs\.?|inr|budget|rupees)/i);
  const budgetLimit = budgetMatch ? parseInt(budgetMatch[1], 10) : null;

  let targetProductIds: string[] = [];

  if (matchedAffinity) {
    targetProductIds = [...matchedAffinity.recommendedProductIds];
  } else {
    // If no specific dish matched, look for exact product mentions
    const directMatches = products.filter(p =>
      q.includes(p.name_en.toLowerCase()) || (p.name_kn && q.includes(p.name_kn.toLowerCase()))
    );
    targetProductIds = directMatches.map(p => p.id);

    // If no direct product matches and no recipe intent, provide a clean relatable conversational answer
    if (directMatches.length === 0) {
      const isRecipeIntent = /(recipe|how\s*to|make|cook|prepare|madodu|maduvudu|kodi|steps|ingredients|dish|curry|sambar|rasam|biryani|bath|pudi|masala|spices)/i.test(q);
      if (!isRecipeIntent) {
        return {
          reply: isKn
            ? `ನಮಸ್ಕಾರ! ನಾನು ಇಂದಿಮಾ AI – ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಪಾಕವಿಧಾನ ಮತ್ತು ಮಸಾಲೆ ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ? ನೀವು ಯಾವುದೇ ಸಾಂಪ್ರದಾಯಿಕ ಕರ್ನಾಟಕ ರೆಸಿಪಿ, ಅಡುಗೆ ಸಲಹೆಗಳು ಅಥವಾ ನಮ್ಮ ಶುದ್ಧ ಕಲ್ಲಿನ ಮಸಾಲೆಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು.`
            : `Hello! I'm Indima AI, your personal culinary and spice assistant at Indima Spice Co. How can I help you today? Feel free to ask for authentic Karnataka recipes, cooking tips, or details about our 100% natural, FSSAI-certified stone-ground spices.`,
          recommendedProducts: [],
          suggestedFollowUps: isKn ? [
            'ಉಡುಪಿ ಸಾಂಬಾರ್ ರೆಸಿಪಿ',
            'ಚಿಕನ್ ಬಿರಿಯಾನಿ ಮಸಾಲೆಗಳು',
            'ಇಂದಿಮಾ ಉತ್ಪನ್ನಗಳ ಪಟ್ಟಿ'
          ] : [
            'Udupi Sambar Recipe',
            'Spices for Chicken Biryani',
            'Show Indima Products'
          ]
        };
      }
    }
  }

  // Filter products by availability and exclude any irrelevant products
  let matchedProds = products.filter(p => targetProductIds.includes(p.id));

  // If budget specified, ensure total price fits within budget
  if (budgetLimit && budgetLimit > 0) {
    const budgetFiltered: Product[] = [];
    let currentTotal = 0;
    for (const p of matchedProds) {
      if (currentTotal + p.price <= budgetLimit) {
        budgetFiltered.push(p);
        currentTotal += p.price;
      }
    }
    matchedProds = budgetFiltered;
  }

  const fallbackProds: RecommendedProductSummary[] = matchedProds.map(p => ({
    id: p.id,
    name_en: p.name_en,
    name_kn: p.name_kn,
    price: p.price,
    mrp: p.mrp,
    weight: p.weight,
    image: p.images && p.images[0],
    category_id: p.category_id,
    inStock: (p.stock || 0) > 0,
    stock: p.stock || 0
  }));

  // Detect servings (e.g., "for 8 people", "8 persons", "for 6")
  const servingsMatch = q.match(/(?:for\s*)?(\d+)\s*(?:people|persons|servings|members|janakke)/i);
  const servingsCount = servingsMatch ? parseInt(servingsMatch[1], 10) : 4;
  const multiplier = servingsCount / 4;

  // Detect spice preference
  const isMild = q.includes('less spicy') || q.includes('mild') || q.includes('kadime khara');
  const isExtraSpicy = q.includes('more spicy') || q.includes('extra spicy') || q.includes('hastu khara');

  // Build dish-specific tailored response
  const dishTitle_en = matchedAffinity ? matchedAffinity.dishName_en.toUpperCase() : 'AUTHENTIC KARNATAKA SPICE GUIDE';
  const dishTitle_kn = matchedAffinity ? matchedAffinity.dishName_kn : 'ಸಾಂಪ್ರದಾಯಿಕ ಕರ್ನಾಟಕ ಮಸಾಲೆ ಮಾರ್ಗದರ್ಶಿ';

  // Dish-specific ingredient details
  let keyIngredients_en = '';
  let keyIngredients_kn = '';
  const isBiryani = matchedAffinity?.keywords.some(k => k.includes('biryani') || k.includes('pulao'));
  const isSambar = matchedAffinity?.keywords.some(k => k.includes('sambar'));
  const isRasam = matchedAffinity?.keywords.some(k => k.includes('rasam') || k.includes('saaru'));
  const isMutton = matchedAffinity?.keywords.some(k => k.includes('mutton'));
  const isBBB = matchedAffinity?.keywords.some(k => k.includes('bisibelebath'));

  if (isBiryani) {
    keyIngredients_en = `- Chicken / Meat / Veggies: ${Math.round(500 * multiplier)}g
- Aged Basmati Rice: ${Math.round(2 * multiplier)} cups (soaked for 30 mins)
- Sliced Onions: ${Math.round(3 * multiplier)} large (fried golden)
- Thick Curd / Yogurt: ${Math.round(0.75 * multiplier)} cup
- Ginger-Garlic Paste: ${Math.round(2 * multiplier)} tbsp
- Fresh Mint & Coriander: 1 cup chopped
- Pure Ghee & Oil: ${Math.round(3 * multiplier)} tbsp
- Saffron Milk / Kewra Water: 2 tbsp (optional)`;

    keyIngredients_kn = `- ಚಿಕನ್ / ತರಕಾರಿಗಳು: ${Math.round(500 * multiplier)} ಗ್ರಾಂ
- ಬಾಸ್ಮತಿ ಅಕ್ಕಿ: ${Math.round(2 * multiplier)} ಕಪ್ (೩೦ ನಿಮಿಷ ನೆನೆಸಿದ್ದು)
- ಈರುಳ್ಳಿ: ${Math.round(3 * multiplier)} ದೊಡ್ಡದು (ಹೊಂಬಣ್ಣಕ್ಕೆ ಹುರಿದದ್ದು)
- ಗಟ್ಟಿ ಮೊಸರು: ${Math.round(0.75 * multiplier)} ಕಪ್
- ಶುಂಠಿ-ಬೆಳ್ಳುಳ್ಳಿ ಪೇಸ್ಟ್: ${Math.round(2 * multiplier)} ಚಮಚ
- ಪುದೀನಾ ಮತ್ತು ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು: ೧ ಕಪ್
- ಶುದ್ಧ ತುಪ್ಪ / ಎಣ್ಣೆ: ${Math.round(3 * multiplier)} ಚಮಚ`;
  } else if (isSambar) {
    keyIngredients_en = `- Toor Dal (Washed & Pressure Cooked): ${Math.round(1 * multiplier)} cup
- Mixed Sambar Vegetables (Drumstick, Shallots, Pumpkin, Carrot): ${Math.round(2 * multiplier)} cups
- Tamarind Extract: ${Math.round(3 * multiplier)} tbsp
- Chopped Tomatoes: ${Math.round(2 * multiplier)} medium
- Cold-Pressed Oil / Ghee: 2 tbsp
- Mustard Seeds & Curry Leaves: For tadka
- Salt & Jaggery Pinch: To taste`;

    keyIngredients_kn = `- ತೊಗರಿಬೇಳೆ (ಬೇಯಿಸಿದ್ದು): ${Math.round(1 * multiplier)} ಕಪ್
- ಸಾಂಬಾರ್ ತರಕಾರಿಗಳು (ನುಗ್ಗೆಕಾಯಿ, ಸಣ್ಣ ಈರುಳ್ಳಿ, ಕುಂಬಳಕಾಯಿ, ಕ್ಯಾರೆಟ್): ${Math.round(2 * multiplier)} ಕಪ್
- ಹುಣಸೆಹಣ್ಣಿನ ರಸ: ${Math.round(3 * multiplier)} ಚಮಚ
- ಟೊಮೆಟೊ: ${Math.round(2 * multiplier)}
- ಎಣ್ಣೆ / ತುಪ್ಪ: ೨ ಚಮಚ
- ಸಾಸಿವೆ ಮತ್ತು ಕರಿಬೇವು: ಒಗ್ಗರಣೆಗೆ`;
  } else if (isRasam) {
    keyIngredients_en = `- Ripe Country Tomatoes: ${Math.round(3 * multiplier)} medium (mashed)
- Tamarind Pulp: ${Math.round(1.5 * multiplier)} tbsp
- Toor Dal Stock / Water: ${Math.round(1 * multiplier)} cup (optional)
- Crushed Garlic Cloves: ${Math.round(6 * multiplier)} cloves
- Pure Ghee: 1.5 tbsp for tadka
- Fresh Coriander Leaves: 1/2 cup finely chopped
- Small Jaggery Piece: 1 tsp`;

    keyIngredients_kn = `- ಹಣ್ಣಾದ ನಾಟಿ ಟೊಮೆಟೊ: ${Math.round(3 * multiplier)} (ಕಿವುಚಿದ್ದು)
- ಹುಣಸೆಹಣ್ಣಿನ ರಸ: ${Math.round(1.5 * multiplier)} ಚಮಚ
- ಬೆಂದ ಬೇಳೆ ಕಟ್ಟು: ${Math.round(1 * multiplier)} ಕಪ್
- ಜಜ್ಜಿದ ಬೆಳ್ಳುಳ್ಳಿ: ${Math.round(6 * multiplier)} ಎಸಳು
- ತುಪ್ಪ: ೧.೫ ಚಮಚ
- ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು ಮತ್ತು ಬೆಲ್ಲ: ಸ್ವಲ್ಪ`;
  } else if (isMutton) {
    keyIngredients_en = `- Tender Mutton (Curry Cut): ${Math.round(600 * multiplier)}g
- Sliced Onions: ${Math.round(3 * multiplier)} medium
- Ginger-Garlic Paste: ${Math.round(2.5 * multiplier)} tbsp
- Fresh Grated Coconut Paste: ${Math.round(0.5 * multiplier)} cup
- Chopped Tomatoes: ${Math.round(2 * multiplier)} medium
- Cold-Pressed Oil / Ghee: ${Math.round(4 * multiplier)} tbsp
- Fresh Coriander: 1/2 cup`;

    keyIngredients_kn = `- ಎಳೆಯ ಮಟನ್: ${Math.round(600 * multiplier)} ಗ್ರಾಂ
- ಈರುಳ್ಳಿ: ${Math.round(3 * multiplier)}
- ಶುಂಠಿ-ಬೆಳ್ಳುಳ್ಳಿ ಪೇಸ್ಟ್: ${Math.round(2.5 * multiplier)} ಚಮಚ
- ತೆಂಗಿನಕಾಯಿ ರುಬ್ಬಿದ ಪೇಸ್ಟ್: ${Math.round(0.5 * multiplier)} ಕಪ್
- ಟೊಮೆಟೊ: ${Math.round(2 * multiplier)}
- ಅಡುಗೆ ಎಣ್ಣೆ / ತುಪ್ಪ: ೪ ಚಮಚ`;
  } else if (isBBB) {
    keyIngredients_en = `- Sona Masoori Rice: ${Math.round(1 * multiplier)} cup
- Toor Dal: ${Math.round(0.75 * multiplier)} cup
- Diced Mixed Vegetables (Beans, Carrot, Shallots, Peas): ${Math.round(1.5 * multiplier)} cups
- Thick Tamarind Pulp: ${Math.round(3 * multiplier)} tbsp
- Pure Desi Ghee: ${Math.round(3 * multiplier)} tbsp
- Roasted Cashews & Curry Leaves: For aromatic tempering`;

    keyIngredients_kn = `- ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ: ${Math.round(1 * multiplier)} ಕಪ್
- ತೊಗರಿಬೇಳೆ: ${Math.round(0.75 * multiplier)} ಕಪ್
- ತರಕಾರಿಗಳು (ಹುರುಳಿಕಾಯಿ, ಕ್ಯಾರೆಟ್, ಸಾಂಬಾರ್ ಈರುಳ್ಳಿ, ಬಟಾಣಿ): ${Math.round(1.5 * multiplier)} ಕಪ್
- ಹುಣಸೆಹಣ್ಣಿನ ರಸ: ${Math.round(3 * multiplier)} ಚಮಚ
- ಶುದ್ಧ ತುಪ್ಪ: ೩ ಚಮಚ
- ಗೋಡಂಬಿ ಮತ್ತು ಕರಿಬೇವಿನ ಒಗ್ಗರಣೆ`;
  } else {
    keyIngredients_en = `- Primary Cooking Base: ${Math.round(500 * multiplier)}g
- Onions: ${Math.round(2 * multiplier)} medium (sliced)
- Tomatoes: ${Math.round(2 * multiplier)} medium (chopped)
- Ginger-Garlic Paste: ${Math.round(1.5 * multiplier)} tbsp
- Pure Ghee / Cold-Pressed Cooking Oil: ${Math.round(3 * multiplier)} tbsp
- Fresh Coriander Leaves: 1/2 cup
- Salt: As per taste`;

    keyIngredients_kn = `- ಮುಖ್ಯ ಅಡುಗೆ ಪದಾರ್ಥ: ${Math.round(500 * multiplier)} ಗ್ರಾಂ
- ಈರುಳ್ಳಿ: ${Math.round(2 * multiplier)}
- ಟೊಮೆಟೊ: ${Math.round(2 * multiplier)}
- ಶುಂಠಿ-ಬೆಳ್ಳುಳ್ಳಿ ಪೇಸ್ಟ್: ೧.೫ ಚಮಚ
- ತುಪ್ಪ / ಎಣ್ಣೆ: ೩ ಚಮಚ
- ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು ಮತ್ತು ಉಪ್ಪು: ರುಚಿಗೆ ತಕ್ಕಷ್ಟು`;
  }

  let reply = '';

  if (isKn) {
    reply = `🍛 **${dishTitle_kn}**
**ಪ್ರಮಾಣ:** ${servingsCount} ಜನರಿಗೆ | **ಸಿದ್ಧತಾ ಸಮಯ:** ೨೦ ನಿಮಿಷ | **ಅಡುಗೆ ಸಮಯ:** ೩೫ ನಿಮಿಷ

---

### 🛒 ಶಿಫಾರಸು ಮಾಡಿದ ಇಂದಿಮಾ ಮಸಾಲೆಗಳು
${fallbackProds.length > 0
  ? fallbackProds.map(p => `- **Product**: ${p.name_kn || p.name_en}
  *Why recommended*: ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ನೈಸರ್ಗಿಕ ಸುವಾಸನೆ ಮತ್ತು ನೈಜ ರುಚಿ ನೀಡುತ್ತದೆ.
  *Required quantity*: ${p.id.includes('pepper') ? '೧/೨ ಚಮಚ' : p.id.includes('byadgi') ? '೪-೫ ಮೆಣಸಿನಕಾಯಿ' : `${(1.5 * multiplier).toFixed(1)} ಚಮಚ`}
  *Availability*: ${p.inStock ? `ಲಭ್ಯವಿದೆ (${p.stock} ಪ್ಯಾಕೆಟ್‌ಗಳು)` : 'ಖಾಲಿಯಾಗಿದೆ'}
  *Price*: ₹${p.price} (${p.weight})`).join('\n\n')
  : '*(ಪ್ರಸ್ತುತ ಇಂದಿಮಾ ಕ್ಯಾಟಲಾಗ್‌ನಲ್ಲಿ ಈ ನಿರ್ದಿಷ್ಟ ಮಸಾಲೆ ಲಭ್ಯವಿಲ್ಲ, ಮನೆಯಲ್ಲಿರುವ ಶುದ್ಧ ಮಸಾಲೆಗಳನ್ನು ಬಳಸಿ)*'}

*(ಸೂಚನೆ: ಅರಿಶಿನ ಪುಡಿ, ಶುಂಠಿ-ಬೆಳ್ಳುಳ್ಳಿ ಪೇಸ್ಟ್ ಮತ್ತು ಉಪ್ಪು ಮುಂತಾದ ಸಾಮಾನ್ಯ ಪದಾರ್ಥಗಳಿಗೆ ಪ್ರಸ್ತುತ ಇಂದಿಮಾ ಕ್ಯಾಟಲಾಗ್‌ನಲ್ಲಿ ಪ್ರತ್ಯೇಕ ಉತ್ಪನ್ನವಿಲ್ಲದಿರುವುದರಿಂದ ಮನೆಯ ಮಸಾಲೆಗಳನ್ನು ಬಳಸಬಹುದು)*

---

### 🥘 ಬೇಕಾಗುವ ಮುಖ್ಯ ಪದಾರ್ಥಗಳು
${keyIngredients_kn}

---

### 🌶️ ಮಸಾಲೆಗಳ ನಿಖರ ಪ್ರಮಾಣ
${fallbackProds.map(p => `- **${p.name_kn || p.name_en}**: ${p.id.includes('pepper') ? '೧/೨ ಚಮಚ' : p.id.includes('byadgi') ? (isMild ? '೨-೩ ಮೆಣಸಿನಕಾಯಿ' : '೪-೫ ಮೆಣಸಿನಕಾಯಿ') : `${(1.5 * multiplier).toFixed(1)} ಚಮಚ`}`).join('\n')}
- ಅರಿಶಿನ ಪುಡಿ: ೧/೨ ಚಮಚ (ಮನೆಯ ಮಸಾಲೆ)
- ಧನಿಯಾ ಪುಡಿ: ${(1 * multiplier).toFixed(1)} ಚಮಚ (ಮನೆಯ ಮಸಾಲೆ)

---

### 👨🍳 ಅಡುಗೆ ಮಾಡುವ ಸರಳ ಹಂತಗಳು
1. ಪಾತ್ರೆಯಲ್ಲಿ ತುಪ್ಪ ಅಥವಾ ಎಣ್ಣೆಯನ್ನು ಬಿಸಿ ಮಾಡಿ, ಸಾಸಿವೆ ಅಥವಾ ಕಾಳು ಮಸಾಲೆಗಳನ್ನು ಹುರಿಯಿರಿ.
2. ಹೆಚ್ಚಿದ ಈರುಳ್ಳಿ ಮತ್ತು ಶುಂಠಿ-ಬೆಳ್ಳುಳ್ಳಿ ಪೇಸ್ಟ್ ಸೇರಿಸಿ ಹೊಂಬಣ್ಣ ಬರುವವರೆಗೆ ಹುರಿಯಿರಿ.
3. ಟೊಮೆಟೊ ಮತ್ತು ಅಗತ್ಯ ಮಸಾಲೆಗಳನ್ನು ಸೇರಿಸಿ ಎಣ್ಣೆ ಬಿಡುವವರೆಗೆ ಮಂದ ಉರಿಯಲ್ಲಿ ಬೇಯಿಸಿ.
4. ಮುಖ್ಯ ಪದಾರ್ಥಗಳನ್ನು ಸೇರಿಸಿ, ನೀರು ಹೊಂದಿಸಿ ಮುಚ್ಚಳ ಮುಚ್ಚಿ ಹದವಾಗಿ ಬೇಯಿಸಿ.
5. ಕೊನೆಯಲ್ಲಿ ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪಿನಿಂದ ಅಲಂಕರಿಸಿ ಬಿಸಿಬಿಸಿಯಾಗಿ ಬಡಿಸಿ.

---

### 💡 ಪ್ರಮುಖ ಅಡುಗೆ ಸಲಹೆ
ಇಂದಿಮಾ ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಸಾಂಪ್ರದಾಯಿಕ ಮಸಾಲೆಗಳನ್ನು ಸಣ್ಣ ಉರಿಯಲ್ಲಿ ತುಪ್ಪ ಅಥವಾ ಎಣ್ಣೆಯಲ್ಲಿ ೩೦-೪೫ ಸೆಕೆಂಡುಗಳ ಕಾಲ ಹುರಿದರೆ ನೈಸರ್ಗಿಕ ಸುವಾಸನೆ ಸಂಪೂರ್ಣವಾಗಿ ಹೊರಹೊಮ್ಮುತ್ತದೆ.`;
  } else {
    reply = `🍛 **${dishTitle_en}**
**Servings:** ${servingsCount} persons | **Prep Time:** 20 mins | **Cooking Time:** 35 mins

---

### 🛒 Recommended Indima Spices
${fallbackProds.length > 0
  ? fallbackProds.map(p => `- **Product**: ${p.name_en}
  *Why recommended*: ${p.id.includes('garam-masala') ? 'Stone-ground royal Western Ghats whole spices (green cardamom, mace, star anise, nutmeg) that impart authentic deep aroma to rich curries and biryanis.' : p.id.includes('sambar') ? 'Authentic Udupi temple style roasted dal and fenugreek blend that creates thick, aromatic Karnataka sambar.' : p.id.includes('rasam') ? 'Digestive roasted Salem turmeric, Malabar black pepper, and cumin blend for comforting herbal rasam.' : p.id.includes('pepper') ? 'Tellicherry grade high-altitude bold peppercorns for authentic aromatic warmth.' : p.id.includes('byadgi') ? 'GI-tagged authentic Byadgi chillies providing rich crimson color and mild fragrance without pungent heat.' : p.id.includes('bisibelebath') ? 'Royal Mysore blend with Marathi Moggu, stone flower, and dry coconut.' : 'Stone-ground traditional Karnataka formulation.'}
  *Required quantity*: ${p.id.includes('pepper') ? `${(0.5 * multiplier).toFixed(1)} tsp crushed (or ${Math.round(8 * multiplier)} whole peppercorns)` : p.id.includes('byadgi') ? `${Math.round((isMild ? 3 : 5) * multiplier)} whole chillies` : `${(1.5 * multiplier).toFixed(1)} to ${(2 * multiplier).toFixed(1)} tbsp`}
  *Availability*: ${p.inStock ? `In Stock (${p.stock} units available)` : 'Out of Stock'}
  *Price*: ₹${p.price} (MRP: ₹${p.mrp}, Weight: ${p.weight})`).join('\n\n')
  : '*(I could not find a suitable dedicated Indima blend for this specific ingredient in the current catalog. Please use your standard kitchen pantry spice.)*'}

*(Note: For standard pantry staples like turmeric powder, coriander powder, and ginger-garlic paste, I could not find a dedicated single-ingredient Indima pack in the current catalog, but you can use your regular kitchen pantry spices!)*

---

### 🥘 Key Ingredients
${keyIngredients_en}

---

### 🌶️ Spice Quantities & Measurements
${fallbackProds.map(p => `- **${p.name_en}**: ${p.id.includes('pepper') ? `${(0.5 * multiplier).toFixed(1)} tsp` : p.id.includes('byadgi') ? `${Math.round((isMild ? 3 : 5) * multiplier)} chillies` : `${(1.5 * multiplier).toFixed(1)} tbsp`}`).join('\n')}
- Turmeric Powder: ${(0.5 * multiplier).toFixed(1)} tsp (kitchen pantry)
- Coriander Powder: ${(1 * multiplier).toFixed(1)} tbsp (kitchen pantry)
${isMild ? '- *Note*: Spice and chilli measurements have been softened for a gentle, mild flavor.' : isExtraSpicy ? '- *Note*: Extra crushed pepper and Byadgi chillies added for authentic spicy punch.' : ''}

---

### 👨🍳 Step-by-Step Cooking Instructions
1. Heat ghee/oil in a heavy-bottomed pot or handi over medium heat. Sauté whole spices and sliced onions until translucent and golden brown.
2. Add ginger-garlic paste and sauté for 1 minute until raw aroma dissipates.
3. Add chopped tomatoes and the verified Indima spices. Cook on gentle low flame until the aromatic oils release.
4. Add the primary base ingredients, stir well to coat in the spice gravy, add warm water as required, and simmer covered until tender.
5. Garnish with fresh coriander leaves, let rest for 5 minutes, and serve hot.

---

### 💡 Master Cooking Tip
Always sauté Indima freshly stone-ground spices on a gentle, low flame in pure ghee or cold-pressed oil for 30–45 seconds. The natural volatile essential oils bloom without burning.`;
  }

  const suggestedFollowUps = isKn ? [
    '೪ ಜನರಿಗೆ ಪ್ರಮಾಣ ಬದಲಾಯಿಸಿ',
    'ಕಡಿಮೆ ಖಾರದಲ್ಲಿ ಹೇಗೆ ಮಾಡುವುದು?',
    'ಪ್ರೆಶರ್ ಕುಕ್ಕರ್‌ನಲ್ಲಿ ಮಾಡುವ ವಿಧಾನ'
  ] : [
    'Adjust recipe for 8 people',
    'Make it less spicy',
    'Adapt for Pressure Cooker'
  ];

  return {
    reply,
    recommendedProducts: fallbackProds,
    suggestedFollowUps
  };
}
