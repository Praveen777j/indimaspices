import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';
import { Product } from '../types';
import {
  Sparkles,
  X,
  Send,
  ShoppingBag,
  Plus,
  Check,
  RefreshCw,
  ChefHat,
  Flame,
  Clock,
  Users,
  ShieldCheck,
  Utensils,
  Lightbulb,
  CornerDownRight,
  Copy,
  Share2,
  HeartPulse,
  Package
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  recommendedProducts?: any[];
  suggestedFollowUps?: string[];
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  onOpenProductDetails?: (product: Product) => void;
}

type PromptCategory = 'recipes' | 'servings' | 'purity' | 'combos';

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  products = [],
  onOpenProductDetails
}) => {
  const { language } = useLanguage();
  const isKn = language === 'kn';
  const { addItem, items } = useCart();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<PromptCategory>('recipes');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Categorized Prompt Library
  const promptCategories: Record<PromptCategory, { label_en: string; label_kn: string; icon: any; prompts_en: string[]; prompts_kn: string[] }> = {
    recipes: {
      label_en: 'Heritage Recipes',
      label_kn: 'ಪಾರಂಪರಿಕ ರೆಸಿಪಿಗಳು',
      icon: Utensils,
      prompts_en: [
        '🍛 Chicken Biryani Recipe & Spices',
        '🥘 Authentic Karnataka Sambar Recipe',
        '🍲 Traditional Mysore Bisi Bele Bath',
        '🍚 Melukote Style Puliyogare',
        '🌶️ Heritage Maniyara Rasam'
      ],
      prompts_kn: [
        '🍗 ಚಿಕನ್ ಬಿರಿಯಾನಿ ಮಸಾಲೆ & ರೆಸಿಪಿ',
        '🥘 ಕರ್ನಾಟಕ ಸಾಂಪ್ರದಾಯಿಕ ಸಾಂಬಾರ್',
        '🍲 ಮೈಸೂರು ಬಿಸಿಬೇಳೆಬಾತ್ ರೆಸಿಪಿ',
        '🍚 ಮೇಲುಕೋಟೆ ಶೈಲಿಯ ಪುಳಿಯೋಗರೆ',
        '🌶️ ಪಾರಂಪರಿಕ ಮನೆಯ ರಸಂ'
      ]
    },
    servings: {
      label_en: 'Servings & Heat',
      label_kn: 'ಪ್ರಮಾಣ & ಖಾರ',
      icon: Users,
      prompts_en: [
        '👥 Adjust Sambar recipe for 8 people',
        '🔥 How to make Biryani less spicy?',
        '⏱️ Fast 20-min Pressure Cooker Chicken Curry',
        '🧂 Low-sodium & balanced spice guide'
      ],
      prompts_kn: [
        '👥 ೮ ಜನರಿಗೆ ಸಾಂಬಾರ್ ಅಳತೆ ಹೇಳಿ',
        '🔥 ಕಡಿಮೆ ಖಾರದ ಚಿಕನ್ ಬಿರಿಯಾನಿ',
        '⏱️ ೨೦ ನಿಮಿಷದಲ್ಲಿ ಪ್ರೆಶರ್ ಕುಕ್ಕರ್ ಸಾರು',
        '🧂 ಕಡಿಮೆ ಉಪ್ಪು ಮತ್ತು ಮಸಾಲೆ ಸಲಹೆ'
      ]
    },
    purity: {
      label_en: 'Purity & Heritage',
      label_kn: 'ಶುದ್ಧತೆ & ಇತಿಹಾಸ',
      icon: HeartPulse,
      prompts_en: [
        '🪨 Why stone-ground spices taste better?',
        '🛡️ FSSAI certification and purity details',
        '🌿 Best spices for daily immunity & digestion',
        '📦 Optimal storage tips for 12-month freshness'
      ],
      prompts_kn: [
        '🪨 ಕಲ್ಲಿನ ಬೀಸುವಿಕೆಯ ಮಹತ್ವವೇನು?',
        '🛡️ FSSAI ಪ್ರಮಾಣಪತ್ರ & ಶುದ್ಧತೆಯ ವಿವರ',
        '🌿 ರೋಗನಿರೋಧಕ ಶಕ್ತಿಗೆ ಉತ್ತಮ ಮಸಾಲೆಗಳು',
        '📦 ೧೨ ತಿಂಗಳ ತಾಜಾತನಕ್ಕೆ ಶೇಖರಣಾ ವಿಧಾನ'
      ]
    },
    combos: {
      label_en: 'Kits & Combos',
      label_kn: 'ಕಿಟ್ಸ್ & ಕಾಂಬೋಸ್',
      icon: Package,
      prompts_en: [
        '💰 Recommend a Spice Kit under ₹500',
        '🎁 Karnataka Grand Festive Box contents',
        '🛒 Essentials kit for beginners'
      ],
      prompts_kn: [
        '💰 ₹500 ಬಜೆಟ್‌ನಲ್ಲಿ ಮಸಾಲೆ ಕಿಟ್',
        '🎁 ಕರ್ನಾಟಕ ಹಬ್ಬದ ಗ್ರಾಂಡ್ ಬಾಕ್ಸ್ ವಿವರ',
        '🛒 ಆರಂಭಿಕರಿಗೆ ಅಗತ್ಯ ಮಸಾಲೆಗಳ ಪಟ್ಟಿ'
      ]
    }
  };

  // Initialize with stylish welcome message celebrating spice heritage, natural stone-ground process, and FSSAI certification
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: isKn
            ? `ನಮಸ್ಕಾರ! **ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ (Indima Spice Co.)** ಗೆ ಸುಸ್ವಾಗತ – ಶುದ್ಧತೆ ಮತ್ತು ಕರ್ನಾಟಕದ ಸಾಂಪ್ರದಾಯಿಕ ಪರಂಪರೆಯ ಸಂಗಮ! 🌿✨

ಕರ್ನಾಟಕದ ಮಸಾಲೆ ಸಂಸ್ಕೃತಿಗೆ ಶತಮಾನಗಳ ಭವ್ಯ ಇತಿಹಾಸವಿದೆ. ಪ್ರಾಚೀನ ಕಾಲದಿಂದಲೂ ಗಿಡಮೂಲಿಕೆ ಮತ್ತು ಮಸಾಲೆಗಳನ್ನು ಯಾವುದೇ ಕೃತಕ ತಂತ್ರಜ್ಞಾನವಿಲ್ಲದೆ, ನೈಸರ್ಗಿಕ ಕಲ್ಲಿನಲ್ಲಿ ನಿಧಾನವಾಗಿ ಬೀಸಿ ತಯಾರಿಸುವಾಗ ಅವುಗಳ ನೈಸರ್ಗಿಕ ಸಾರಭೂತ ತೈಲಗಳು (essential oils), ಆಹ್ಲಾದಕರ ಸುವಾಸನೆ ಮತ್ತು ಆಂಟಿಆಕ್ಸಿಡೆಂಟ್‌ಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಉಳಿಯುತ್ತಿದ್ದವು.

**ಇಂದಿಮಾ ಸ್ಪೈಸ್ ಕಂ** ಇದೇ ಪಾರಂಪರಿಕ ಶ್ರೇಷ್ಠತೆಯನ್ನು ಪುನರುಜ್ಜೀವನಗೊಳಿಸಿದೆ:
- 🌿 **೧೦೦% ನೈಸರ್ಗಿಕ & ಶುದ್ಧ**: ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣ, ಸಂರಕ್ಷಕ (preservatives) ಅಥವಾ ಫಿಲ್ಲರ್‌ಗಳಿಲ್ಲದ ನೈಜ ಮಸಾಲೆಗಳು.
- 🪨 **ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವಿಕೆ**: ನಿಧಾನಗತಿಯ ಕಲ್ಲಿನ ಬೀಸುವಿಕೆಯಿಂದ ಮಸಾಲೆಗಳಲ್ಲಿ ನೈಸರ್ಗಿಕ ಪೋಷಕಾಂಶಗಳು ಮತ್ತು ದಟ್ಟ ಪರಿಮಳ ಅಖಂಡವಾಗಿರುತ್ತವೆ.
- 🛡️ **FSSAI ನಿಂದ ಮಾನ್ಯತೆ ಮತ್ತು ಪ್ರಮಾಣೀಕೃತ**: ಆಹಾರ ಸುರಕ್ಷತೆಯ ಅತ್ಯುನ್ನತ ಗುಣಮಟ್ಟದೊಂದಿಗೆ ತಯಾರಿಸಲ್ಪಟ್ಟಿದೆ (FSSAI Lic. No: **21226194000378**).

ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಪಾಕವಿಧಾನ ಮತ್ತು ಮಸಾಲೆ ಸಹಾಯಕ. ನೀವು ಯಾವುದೇ ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆ ವಿಧಾನ, ನಿಖರ ಅಳತೆಗಳು ಅಥವಾ ಮಸಾಲೆಗಳ ಬಗ್ಗೆ ಮುಕ್ತವಾಗಿ ಕೇಳಬಹುದು!`
            : `Welcome to **Indima Spice Co.** – Where Heritage Meets Natural Purity! 🌿✨

For centuries, South India's spice traditions were built on patience, nature, and pure craftsmanship. Spices were harvested at peak potency and slowly stone-ground at cool temperatures, locking in their volatile essential oils, deep earthy aromas, and natural antioxidants without the destructive heat of modern high-speed machines.

At **Indima Spice Co.**, we bring that authentic heritage back to your kitchen:
- 🌿 **100% Pure & Natural**: Farm-sourced single-origin spices with zero artificial colors, zero chemical preservatives, and zero fillers.
- 🪨 **Authentic Slow Stone-Ground**: Traditional cool-friction grinding that preserves authentic aroma, rich oils, and regional culinary depth.
- 🛡️ **Recognized & Certified by FSSAI**: Crafted under strict food safety and hygiene benchmarks (FSSAI Lic. No: **21226194000378**).

I am your personal AI Culinary & Spice Companion. Ask me for authentic Karnataka recipes, cooking secrets, exact spice measurements, or our signature stone-ground blends!`,
          timestamp: Date.now(),
          suggestedFollowUps: isKn ? [
            '🍗 ಚಿಕನ್ ಬಿರಿಯಾನಿ ಮಸಾಲೆ & ರೆಸಿಪಿ',
            '🥘 ಕರ್ನಾಟಕ ಸಾಂಪ್ರದಾಯಿಕ ಸಾಂಬಾರ್',
            '🌶️ ೪ ಜನರಿಗೆ ಕಡಿಮೆ ಖಾರದ ರಸಂ'
          ] : [
            '🍛 Chicken Biryani Recipe & Spices',
            '🥘 Authentic Karnataka Sambar Recipe',
            '🌶️ Less Spicy Rasam for 4 People'
          ]
        }
      ]);
    }
  }, [language]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    // Append user message immediately
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send conversation history to dedicated AI endpoint
      const apiHistory = updatedHistory.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.askAiAssistant({
        message: text,
        history: apiHistory,
        language: isKn ? 'kn' : 'en'
      });

      if (res && res.reply) {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          timestamp: Date.now(),
          recommendedProducts: res.recommendedProducts || [],
          suggestedFollowUps: res.suggestedFollowUps || []
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error(res.error || 'No response from assistant');
      }
    } catch (err: any) {
      console.error('[Indima AI Error]:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: isKn
          ? `ಕ್ಷಮಿಸಿ, ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಇನ್ನೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ನಮ್ಮ ಅಧಿಕೃತ ಸಾಂಬಾರ್, ರಸಂ ಮತ್ತು ಬಿರಿಯಾನಿ ಮಸಾಲೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ.`
          : `I'm having a brief connection delay. Please feel free to ask again or browse our stone-ground Sambar, Rasam, and Biryani Masalas!`,
        timestamp: Date.now(),
        suggestedFollowUps: isKn ? [
          '🍗 ಚಿಕನ್ ಬಿರಿಯಾನಿ ಮಸಾಲೆ & ರೆಸಿಪಿ',
          '🥘 ಕರ್ನಾಟಕ ಸಾಂಪ್ರದಾಯಿಕ ಸಾಂಬಾರ್'
        ] : [
          '🍛 Chicken Biryani Recipe & Spices',
          '🥘 Authentic Karnataka Sambar Recipe'
        ]
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: any) => {
    const existing = products.find(p => p.id === product.id);
    if (existing) {
      addItem(existing, 1);
    } else {
      const safeProduct: Product = {
        id: product.id,
        sku: `IND-${product.id}`,
        name_en: product.name_en,
        name_kn: product.name_kn,
        description_en: '',
        description_kn: '',
        ingredients_en: '',
        ingredients_kn: '',
        category_id: product.category_id || 'spices',
        weight: product.weight || '100g',
        shelf_life: '12 Months',
        storage_en: 'Store in a cool, dry place',
        storage_kn: 'ತಂಪಾದ, ಒಣ ಸ್ಥಳದಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ',
        traditional_info_en: 'Stone-ground authentic recipe',
        traditional_info_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ಮಸಾಲೆ',
        mrp: product.mrp || product.price,
        price: product.price,
        discount_percentage: product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0,
        stock: product.stock !== undefined ? product.stock : 50,
        low_stock_threshold: 5,
        images: product.image ? [product.image] : ['/indima-logo.svg'],
        badges: ['homemade', 'natural'],
        active: true,
        rating: 4.9,
        review_count: 32,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      addItem(safeProduct, 1);
    }

    setAddedItemMap(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemMap(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const handleCopyRecipe = (msgId: string, content: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content).then(() => {
        setCopiedMsgId(msgId);
        setTimeout(() => setCopiedMsgId(null), 2500);
      });
    }
  };

  const handleShareWhatsApp = (content: string) => {
    const shareText = `🌿 Indima AI Recipe & Spice Advice:\n\n${content}\n\n✨ Crafted with 100% Pure Stone-Ground Indima Spices (FSSAI Lic. No: 21226194000378)`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const resetConversation = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: isKn
          ? `ನಮಸ್ಕಾರ! ಇಂದಿಮಾ AI ಹೊಸ ಸಂವಾದ ಪ್ರಾರಂಭವಾಗಿದೆ. ನೀವು ಯಾವ ಅಡುಗೆಯನ್ನು ತಯಾರಿಸಲು ಯೋಜಿಸುತ್ತಿದ್ದೀರಿ?`
          : `Hello! Indima AI session refreshed. What delicious dish are we preparing today?`,
        timestamp: Date.now(),
        suggestedFollowUps: isKn ? [
          '🍗 ಚಿಕನ್ ಬಿರಿಯಾನಿ ಮಸಾಲೆ & ರೆಸಿಪಿ',
          '🥘 ಕರ್ನಾಟಕ ಸಾಂಪ್ರದಾಯಿಕ ಸಾಂಬಾರ್',
          '💰 ₹500 ಬಜೆಟ್‌ನಲ್ಲಿ ಮಸಾಲೆ ಕಿಟ್'
        ] : [
          '🍛 Chicken Biryani Recipe & Spices',
          '🥘 Authentic Karnataka Sambar Recipe',
          '💰 ₹500 Spice Kit Recommendation'
        ]
      }
    ]);
  };

  // Formatter for culinary markdown
  const renderFormattedMessage = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-2 text-xs sm:text-sm text-[#2C1810] leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
            return <hr key={idx} className="border-t border-[#F0E6D8] my-2" />;
          }

          if (
            trimmed.startsWith('#') ||
            trimmed.startsWith('🍛') ||
            trimmed.startsWith('🛒') ||
            trimmed.startsWith('🥘') ||
            trimmed.startsWith('🌶️') ||
            trimmed.startsWith('👨🍳') ||
            trimmed.startsWith('🔥') ||
            trimmed.startsWith('💡') ||
            trimmed.startsWith('🔄')
          ) {
            const cleanTitle = trimmed.replace(/^#+\s*/, '');
            return (
              <div
                key={idx}
                className="font-serif font-bold text-sm sm:text-base text-[#8B3214] pt-2 pb-1 border-b border-[#F0E6D8] flex items-center gap-1.5"
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: formatBoldAndItalics(cleanTitle)
                  }}
                />
              </div>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const itemText = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start space-x-2 pl-1 py-0.5">
                <span className="text-[#8B3214] font-bold mt-1 text-[10px]">•</span>
                <span
                  className="flex-1"
                  dangerouslySetInnerHTML={{
                    __html: formatBoldAndItalics(itemText)
                  }}
                />
              </div>
            );
          }

          const numberedMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
          if (numberedMatch) {
            return (
              <div key={idx} className="flex items-start space-x-2 pl-1 py-1 bg-[#FAF7F2]/60 rounded-lg px-2">
                <span className="w-5 h-5 rounded-full bg-[#8B3214] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {numberedMatch[1]}
                </span>
                <span
                  className="flex-1"
                  dangerouslySetInnerHTML={{
                    __html: formatBoldAndItalics(numberedMatch[2])
                  }}
                />
              </div>
            );
          }

          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{
                __html: formatBoldAndItalics(trimmed)
              }}
            />
          );
        })}
      </div>
    );
  };

  const formatBoldAndItalics = (text: string) => {
    return text
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold text-[#1F1610]"><em class="italic text-[#7A6455]">$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#1F1610]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-[#7A6455]">$1</em>')
      .replace(/_(.*?)_/g, '<em class="italic text-[#7A6455]">$1</em>');
  };

  const currentCategoryObj = promptCategories[activeCategory];
  const currentCategoryPrompts = isKn ? currentCategoryObj.prompts_kn : currentCategoryObj.prompts_en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-[#FFFDF9] w-full h-full sm:h-[90vh] sm:max-h-[820px] sm:max-w-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E8DFD3]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#8B3214] text-[#FFF9F2] px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-200 shadow-inner shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide">
                  Indima AI
                </h2>
                <span className="px-2 py-0.5 bg-[#6E240D] text-amber-200 text-[10px] font-bold rounded-full border border-amber-400/20">
                  {isKn ? 'ಪಾಕವಿಧಾನ ತಜ್ಞ' : 'Recipe & Spice Master'}
                </span>
              </div>
              <p className="text-[11px] text-amber-100/80 hidden xs:block">
                {isKn
                  ? 'ಬೆಂಗಳೂರು ನೈಸರ್ಗಿಕ ಮಸಾಲೆಗಳು • ವೈಯಕ್ತಿಕ ಅಡುಗೆ ಮಾರ್ಗದರ್ಶಿ'
                  : 'Stone-Ground Spices • Real-Time Recipe & Servings Guide'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={resetConversation}
              title={isKn ? 'ಹೊಸ ಸಂವಾದ' : 'Reset Conversation'}
              className="p-2 rounded-full hover:bg-white/10 text-amber-100 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              aria-label="Close Indima AI"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FAF7F2]/40 scroll-smooth">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {/* Message Bubble */}
              <div
                className={`max-w-[92%] sm:max-w-[85%] p-3.5 sm:p-4.5 rounded-2xl shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-[#8B3214] text-white rounded-tr-xs font-medium'
                    : 'bg-[#FFFDF9] border border-[#E8DFD3] text-[#2C1810] rounded-tl-xs'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#8B3214] mb-1.5 uppercase tracking-wider pb-1 border-b border-[#F0E6D8]/60">
                    <div className="flex items-center space-x-1.5">
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Indima Spice Guide</span>
                    </div>

                    {msg.id !== 'welcome-msg' && (
                      <div className="flex items-center space-x-1 lowercase text-[10px] text-[#7A6455]">
                        <button
                          onClick={() => handleCopyRecipe(msg.id, msg.content)}
                          title="Copy recipe"
                          className="flex items-center gap-1 hover:text-[#8B3214] px-1.5 py-0.5 rounded-md hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        >
                          {copiedMsgId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">{isKn ? 'ಕಾಪಿ ಆಗಿದೆ' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{isKn ? 'ಕಾಪಿ' : 'Copy'}</span>
                            </>
                          )}
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => handleShareWhatsApp(msg.content)}
                          title="Share on WhatsApp"
                          className="flex items-center gap-1 hover:text-emerald-700 px-1.5 py-0.5 rounded-md hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>{isKn ? 'ಹಂಚಿಕೊಳ್ಳಿ' : 'Share'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {renderFormattedMessage(msg.content)}

                {/* Recommended Product Cards directly in message */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#F0E6D8] space-y-2.5">
                    <p className="text-[11px] font-bold text-[#8B3214] uppercase tracking-wider flex items-center space-x-1">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>
                        {isKn
                          ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಅಧಿಕೃತ ಇಂದಿಮಾ ಮಸಾಲೆಗಳು'
                          : 'Recommended Authentic Indima Spices'}
                      </span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.recommendedProducts.map(prod => {
                        const inCart = (items || []).some(ci => ci && ci.product && ci.product.id === prod.id);
                        const isRecentlyAdded = addedItemMap[prod.id];

                        return (
                          <div
                            key={prod.id}
                            className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#DFCFC0] flex items-center space-x-2.5 hover:border-[#8B3214] transition-all"
                          >
                            <div
                              className="flex items-center space-x-2.5 flex-1 min-w-0 cursor-pointer"
                              onClick={() => {
                                const matched = products.find(p => p.id === prod.id);
                                if (matched && onOpenProductDetails) {
                                  onOpenProductDetails(matched);
                                }
                              }}
                            >
                              <img
                                src={prod.image || '/indima-logo.svg'}
                                alt={prod.name_en}
                                className="w-12 h-12 rounded-lg object-cover border border-[#DFCFC0] shrink-0 bg-white"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-[#1F1610] truncate hover:text-[#8B3214] transition-colors">
                                  {isKn ? prod.name_kn : prod.name_en}
                                </h4>
                                <div className="flex items-center space-x-1.5 text-[11px] mt-0.5">
                                  <span className="font-bold text-[#8B3214]">
                                    ₹{prod.price}
                                  </span>
                                  {prod.mrp > prod.price && (
                                    <span className="text-[10px] text-[#9C8778] line-through">
                                      ₹{prod.mrp}
                                    </span>
                                  )}
                                  <span className="text-[#7A6455] text-[10px]">
                                    • {prod.weight}
                                  </span>
                                </div>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-block mt-0.5 ${
                                    prod.inStock
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {prod.inStock
                                    ? isKn ? 'ಲಭ್ಯವಿದೆ' : 'In Stock'
                                    : isKn ? 'ಖಾಲಿಯಾಗಿದೆ' : 'Out of Stock'}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddToCart(prod)}
                              disabled={!prod.inStock}
                              className={`p-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 flex items-center justify-center ${
                                isRecentlyAdded
                                  ? 'bg-emerald-600 text-white'
                                  : inCart
                                  ? 'bg-[#6E240D] text-white'
                                  : 'bg-[#8B3214] hover:bg-[#6E240D] text-white shadow-2xs'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title="Add to basket"
                            >
                              {isRecentlyAdded ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Follow-up suggestion chips */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && msg.role === 'assistant' && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%] sm:max-w-[85%]">
                  {msg.suggestedFollowUps.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSendMessage(sug)}
                      disabled={isLoading}
                      className="text-[11px] font-medium bg-[#FFFDF9] hover:bg-[#8B3214] hover:text-white text-[#5C483B] border border-[#DFCFC0] hover:border-[#8B3214] px-3 py-1 rounded-full transition-all duration-150 cursor-pointer shadow-2xs disabled:opacity-50 flex items-center space-x-1"
                    >
                      <CornerDownRight className="w-3 h-3 opacity-60" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Loading Thinking State */}
          {isLoading && (
            <div className="flex items-start space-x-2 animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-full bg-[#8B3214] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ChefHat className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-[#FFFDF9] border border-[#E8DFD3] p-3.5 rounded-2xl rounded-tl-xs shadow-xs text-xs text-[#7A6455] flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-[#8B3214] animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#8B3214] animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#8B3214] animate-bounce"></div>
                </div>
                <span className="font-serif italic">
                  {isKn
                    ? 'ಇಂದಿಮಾ ಪಾಕವಿಧಾನ & ಮಸಾಲೆಗಳನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ...'
                    : 'Crafting authentic recipe & stone-ground spice blend...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Category Tabs & Quick Suggestion Pills */}
        <div className="px-3 pt-2.5 pb-2 sm:px-4 bg-[#FFFDF9] border-t border-[#F0E6D8] shrink-0 space-y-2">
          {/* Category Switcher */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 scrollbar-none no-scrollbar">
            {(Object.keys(promptCategories) as PromptCategory[]).map(catKey => {
              const cat = promptCategories[catKey];
              const IconComp = cat.icon;
              const isActive = activeCategory === catKey;

              return (
                <button
                  key={catKey}
                  onClick={() => setActiveCategory(catKey)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center space-x-1 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#8B3214] text-white shadow-2xs'
                      : 'bg-[#FAF7F2] text-[#7A6455] hover:bg-[#F0E6D8] border border-[#DFCFC0]/60'
                  }`}
                >
                  <IconComp className="w-3 h-3" />
                  <span>{isKn ? cat.label_kn : cat.label_en}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Prompts under active category */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            <span className="text-[10px] font-bold text-[#8B3214] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
            </span>
            {currentCategoryPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                disabled={isLoading}
                className="text-[11px] font-medium bg-[#FAF7F2] hover:bg-[#8B3214] hover:text-white text-[#5C483B] border border-[#DFCFC0] hover:border-[#8B3214] px-2.5 py-1 rounded-full whitespace-nowrap transition-all duration-150 cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#FFFDF9] shrink-0 border-t border-[#F0E6D8]/40">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={
                  isKn
                    ? 'ಉದಾ: ಚಿಕನ್ ಬಿರಿಯಾನಿ, ಸಾಂಬಾರ್ ರೆಸಿಪಿ, ೬ ಜನರಿಗೆ ಪ್ರಮಾಣ...'
                    : 'Ask recipe, spice quantities, servings (e.g. Chicken Biryani for 6)...'
                }
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#DFCFC0] focus:border-[#8B3214] rounded-full text-[#1F1610] placeholder-[#9C8778] focus:outline-hidden transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 sm:px-4 sm:py-2.5 bg-[#8B3214] hover:bg-[#6E240D] disabled:bg-[#DFCFC0] text-white rounded-full font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed active:scale-95 shrink-0"
              aria-label="Send message"
            >
              <span className="hidden sm:inline">{isKn ? 'ಕೇಳಿ' : 'Ask'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-[#9C8778] px-2 pt-2">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{isKn ? '೧೦೦% ನೈಸರ್ಗಿಕ ಬೆಂಗಳೂರು ಮಸಾಲೆಗಳು' : '100% Stone-Ground Bengaluru Spices'}</span>
            </span>
            <span>{isKn ? 'ಕನ್ನಡ & English ಬೆಂಬಲವಿದೆ' : 'English & Kannada Supported'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
