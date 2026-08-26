import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ShieldAlert,
  ShieldCheck,
  Leaf,
  HeartPulse,
  Flame,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award
} from 'lucide-react';

export const HealthWisdomSection: React.FC = () => {
  const { language, t } = useLanguage();
  const isKn = language === 'kn';

  const [activeTab, setActiveTab] = useState<'hazards' | 'benefits' | 'comparison'>('hazards');

  const chemicalHazards = [
    {
      title_en: 'High-Heat Machine Grinding (>80°C)',
      title_kn: 'ಹೆಚ್ಚಿನ ಉಷ್ಣತೆಯಲ್ಲಿ ಕಾರ್ಖಾನೆ ಯಂತ್ರಗಳ ಪುಡಿ ಮಾಡುವಿಕೆ',
      hazard_en:
        'Industrial factory steel pulverizers heat up to 80°C–100°C, scorching volatile therapeutic oils (Curcumin, Piperine, Eugenol). What remains is dead, flavorless powder that requires synthetic additives.',
      hazard_kn:
        'ಕಾರ್ಖಾನೆಗಳಲ್ಲಿ ಹೈ-ಸ್ಪೀಡ್ ಯಂತ್ರಗಳು ವಿಪರೀತ ಬಿಸಿಯಾಗುವುದರಿಂದ ಮಸಾಲೆಗಳಲ್ಲಿನ ನೈಸರ್ಗಿಕ ತೈಲಗಳು ಮತ್ತು ಔಷಧೀಯ ಗುಣಗಳು ಸುಟ್ಟು ಹೋಗುತ್ತವೆ. ಇದರಿಂದ ಯಾವುದೇ ನೈಜ ಪರಿಮಳ ಉಳಿಯುವುದಿಲ್ಲ.',
      impact_en: 'Destroys medicinal enzymes & oxidizes essential aroma.'
    },
    {
      title_en: 'Toxic Dyes & Synthetic Colorants',
      title_kn: 'ವಿಷಕಾರಿ ಕೃತಕ ಬಣ್ಣಗಳು ಮತ್ತು ಡೈಗಳು',
      hazard_en:
        'Commercial brands often add dangerous synthetic coloring agents (such as Metanil Yellow, Sudan dyes, or lead chromate) to make adulterated powders look artificially vibrant.',
      hazard_kn:
        'ಅಗ್ಗದ ಕಲಬೆರಕೆ ಮಸಾಲೆಗಳಿಗೆ ಗಾಢ ಕೆಂಪು ಅಥವಾ ಹಳದಿ ಬಣ್ಣ ತರಲು ಮೆಟಾನಿಲ್ ಯೆಲ್ಲೋ ಮತ್ತು ಕೃತಕ ಡೈಗಳನ್ನು ಬಳಸಲಾಗುತ್ತದೆ, ಇದು ದೇಹಕ್ಕೆ ವಿಷಕಾರಿಯಾಗಿದೆ.',
      impact_en: 'Liver toxicity, cellular inflammation, and long-term health risk.'
    },
    {
      title_en: 'Starch, Husk & Sawdust Adulterants',
      title_kn: 'ಸ್ಟಾರ್ಚ್, ಹೊಟ್ಟು ಮತ್ತು ಮರದ ಪುಡಿ ಕಲಬೆರಕೆ',
      hazard_en:
        'To reduce production costs and maximize bulk weight, commercial powders are blended with spent spice waste, processed husk, and cheap starch fillers.',
      hazard_kn:
        'ತೂಕ ಹೆಚ್ಚಿಸಲು ಮಸಾಲೆಗಳ ಸತ್ವ ತೆಗೆದ ತ್ಯಾಜ್ಯ, ಭತ್ತದ ಹೊಟ್ಟು ಮತ್ತು ಕೃತಕ ಪಿಷ್ಟವನ್ನು ಬೆರೆಸಲಾಗುತ್ತದೆ. ಇದರಿಂದ ಗುಣಮಟ್ಟ ಮತ್ತು ನೈಜ ರುಚಿ ಹಾಳಾಗುತ್ತದೆ.',
      impact_en: 'Weak, diluted flavor forcing you to use 3-4 spoons per dish.'
    },
    {
      title_en: 'Severe Gastric Acidity & Gut Burning',
      title_kn: 'ಹೊಟ್ಟೆಯುರಿ, ಅಸಿಡಿಟಿ ಮತ್ತು ಜೀರ್ಣಾಂಗ ಸಮಸ್ಯೆಗಳು',
      hazard_en:
        'Artificial chemicals and adulterated fillers severely irritate the sensitive stomach lining, triggering chronic acidity, acid reflux (GERD), bloating, and gastric ulcers.',
      hazard_kn:
        'ಕೃತಕ ರಾಸಾಯನಿಕಗಳು ಮತ್ತು ಕಲಬೆರಕೆ ಅಂಶಗಳು ಹೊಟ್ಟೆಯ ಒಳಗಿನ ಪದರವನ್ನು ಕೆರಳಿಸಿ ದೀರ್ಘಕಾಲದ ಗ್ಯಾಸ್ಟ್ರಿಕ್, ಎದೆಯುರಿ ಮತ್ತು ಹೊಟ್ಟೆಯುಬ್ಬರಕ್ಕೆ ಕಾರಣವಾಗುತ್ತವೆ.',
      impact_en: 'Damages gut microbiome & causes chronic indigestion.'
    }
  ];

  const naturalBenefits = [
    {
      spice_en: 'Stone-Ground Turmeric (Curcumin 5%+)',
      spice_kn: 'ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ನೈಸರ್ಗಿಕ ಅರಿಶಿನ',
      benefit_en:
        'Cold-milled slowly to retain natural volatile curcumin. Acts as a potent cellular antioxidant, purifies blood, soothes inflammation, and strengthens daily immunity.',
      benefit_kn:
        'ಕಡಿಮೆ ಉಷ್ಣತೆಯಲ್ಲಿ ಪುಡಿಮಾಡುವುದರಿಂದ 5%+ ಕುರ್ಕುಮಿನ್ ಅಂಶ ಉಳಿಯುತ್ತದೆ. ಶಕ್ತಿಯುತ ರೋಗನಿರೋಧಕ, ರಕ್ತಶೋಧಕ ಹಾಗೂ ಆಂತರಿಕ ಉರಿಯೂತ ನಿವಾರಕವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ.'
    },
    {
      spice_en: 'Malabar Black Pepper (Piperine Rich)',
      spice_kn: 'ಮಲೆನಾಡಿನ ಕಪ್ಪು ಕರಿಮೆಣಸು',
      benefit_en:
        'Nature’s bioavailability catalyst. Loaded with natural piperine which enhances nutrient absorption by up to 2000%, clears respiratory phlegm, and stimulates digestive Agni.',
      benefit_kn:
        'ಪೈಪರೀನ್ ಅಂಶವು ಇತರ ಪೋಷಕಾಂಶಗಳ ಹೀರಿಕೊಳ್ಳುವಿಕೆಯನ್ನು ೨೦ ಪಟ್ಟು ಹೆಚ್ಚಿಸುತ್ತದೆ. ಕಫ, ಶೀತ ನಿವಾರಿಸಿ ಜೀರ್ಣಾಗ್ನಿಯನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ.'
    },
    {
      spice_en: 'Byadgi Chilli (Natural Color & Vitamin C)',
      spice_kn: 'ಅಪ್ಪಟ ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ',
      benefit_en:
        'Gives deep, vibrant crimson hue naturally without artificial dyes. Rich in Vitamin C and antioxidants without causing harsh gastric burning.',
      benefit_kn:
        'ಯಾವುದೇ ಕೃತಕ ಬಣ್ಣವಿಲ್ಲದೆ ಅಡುಗೆಗೆ ನೈಸರ್ಗಿಕ ಕೆಂಪು ಬಣ್ಣ ಮತ್ತು ವಿಟಮಿನ್ ಸಿ ನೀಡುತ್ತದೆ. ಹೊಟ್ಟೆಯಲ್ಲಿ ಉರಿಯಾಗದಂತೆ ಹಿತವಾದ ಖಾರ ನೀಡುತ್ತದೆ.'
    },
    {
      spice_en: 'Coorg Green Cardamom & Cloves',
      spice_kn: 'ಕೊಡಗಿನ ಏಲಕ್ಕಿ ಮತ್ತು ಲವಂಗ',
      benefit_en:
        'Rich in natural Cineole and Eugenol essential oils that soothe digestive spasm, prevent acid reflux, cleanse the palate, and promote deep restorative calm.',
      benefit_kn:
        'ನೈಸರ್ಗಿಕ ಸುಗಂಧ ತೈಲಗಳು ಹೊಟ್ಟೆಯುಬ್ಬರ ಮತ್ತು ಗ್ಯಾಸ್ಟ್ರಿಕ್ ತಡೆಯುತ್ತದೆ. ಹೃದಯಕ್ಕೆ ಹಿತಕರ ಹಾಗೂ ಬಾಯಿಯ ಆರೋಗ್ಯಕ್ಕೆ ಅತ್ಯುತ್ತಮ.'
    }
  ];

  const comparisonRows = [
    {
      feature_en: 'Grinding Method',
      feature_kn: 'ಪುಡಿ ಮಾಡುವ ವಿಧಾನ',
      commercial_en: 'High-speed industrial metal mills (>80°C)',
      commercial_kn: 'ಹೈ-ಸ್ಪೀಡ್ ಕಾರ್ಖಾನೆ ಯಂತ್ರಗಳು (ವಿಪರೀತ ಬಿಸಿ)',
      indima_en: 'Traditional Cold Granite Stone-Ground in Bengaluru',
      indima_kn: 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ತಣ್ಣನೆಯ ಕಲ್ಲಿನ ಸಾಂಪ್ರದಾಯಿಕ ಬೀಸುವಿಕೆ'
    },
    {
      feature_en: 'Essential Volatile Oils',
      feature_kn: 'ನೈಸರ್ಗಿಕ ಸುಗಂಧ ತೈಲಗಳು',
      commercial_en: 'Burnt & evaporated during high-heat milling',
      commercial_kn: 'ಬಿಸಿಗೆ ಆವಿಯಾಗಿ ಸುಟ್ಟು ಹೋಗುತ್ತವೆ',
      indima_en: '100% Intact & Locked Inside (Deep natural aroma)',
      indima_kn: '100% ಸಂರಕ್ಷಿತ (ಅಪ್ಪಟ ಮನೆಯ ಸುವಾಸನೆ)'
    },
    {
      feature_en: 'Synthetic Dyes & Colorants',
      feature_kn: 'ಕೃತಕ ಬಣ್ಣ ಮತ್ತು ರಾಸಾಯನಿಕಗಳು',
      commercial_en: 'Commonly contains Metanil Yellow or artificial dyes',
      commercial_kn: 'ಮೆಟಾನಿಲ್ ಯೆಲ್ಲೋ, ಕೃತಕ ಬಣ್ಣಗಳ ಅಪಾಯ',
      indima_en: 'Zero Added Colors (100% Pure Byadgi & Turmeric hue)',
      indima_kn: '0% ರಾಸಾಯನಿಕ, 100% ನೈಸರ್ಗಿಕ ಬ್ಯಾಡಗಿ ಬಣ್ಣ'
    },
    {
      feature_en: 'Fillers & Starches',
      feature_kn: 'ಕಲಬೆರಕೆ ಹಾಗೂ ಪಿಷ್ಟ',
      commercial_en: 'Blended with husk, spent residue & starches',
      commercial_kn: 'ಹೊಟ್ಟು, ಗೋಧಿ ಪಿಷ್ಟ ಮತ್ತು ತ್ಯಾಜ್ಯ ಮಿಶ್ರಣ',
      indima_en: '0% Fillers — 100% Hand-cleaned Whole Spices',
      indima_kn: 'ಯಾವುದೇ ಕಲಬೆರಕೆ ಇಲ್ಲ, ಕೇವಲ ಶುದ್ಧ ಕಾಳು ಮಸಾಲೆಗಳು'
    },
    {
      feature_en: 'Quantity Needed per Dish',
      feature_kn: 'ಅಡುಗೆಗೆ ಬೇಕಾಗುವ ಪ್ರಮಾಣ',
      commercial_en: 'Requires 2 to 3 full tablespoons for taste',
      commercial_kn: '೨ ರಿಂದ ೩ ದೊಡ್ಡ ಚಮಚ ಹಾಕಬೇಕಾಗುತ್ತದೆ',
      indima_en: 'Just 1 small spoon gives deep, rich flavor',
      indima_kn: 'ಕೇವಲ ೧ ಚಮಚ ಹಾಕಿದರೆ ಸಾಕು — 50% ಉಳಿತಾಯ'
    },
    {
      feature_en: 'Digestive Comfort',
      feature_kn: 'ಜೀರ್ಣಾಂಗ ಆರೋಗ್ಯ',
      commercial_en: 'Causes burning sensation, acidity & bloating',
      commercial_kn: 'ಹೊಟ್ಟೆಯುರಿ, ಎದೆಯುರಿ, ಅಸಿಡಿಟಿ ಉಂಟುಮಾಡುತ್ತದೆ',
      indima_en: 'Ayurvedic balance: Soothes gut, zero acid burn',
      indima_kn: 'ಹೊಟ್ಟೆಗೆ ಹಿತ, ಗ್ಯಾಸ್ಟ್ರಿಕ್ ಮುಕ್ತ, ಸುಲಭ ಜೀರ್ಣ'
    }
  ];

  return (
    <section id="health-truth-section" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#FFFDF9] border border-[#E8DFD3] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#EAF2EB] border border-[#CDE0D0] rounded-full text-xs font-bold text-[#2B5329] shadow-2xs">
            <Leaf className="w-4 h-4 text-[#2B5329]" />
            <span>{isKn ? 'ಆರೋಗ್ಯ ಜಾಗೃತಿ & ಶುದ್ಧತೆಯ ಭರವಸೆ' : 'Health Truth & Pure Spice Science'}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1610] tracking-tight leading-tight">
            {isKn
              ? 'ರಾಸಾಯನಿಕ ಮಸಾಲೆಗಳು ನಿಮ್ಮ ಆರೋಗ್ಯಕ್ಕೆ ಹೇಗೆ ಹಾನಿ ಮಾಡುತ್ತವೆ? ಮನೆಯ ಶುದ್ಧ ಮಸಾಲೆಗಳ ಮಹತ್ವವೇನು?'
              : 'The Hidden Danger of Chemical Spices & How Pure Homemade Spices Protect Your Family'}
          </h2>

          <p className="text-xs sm:text-sm text-[#5C483B] leading-relaxed font-normal">
            {isKn
              ? 'ಇಂದಿನ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿನ ಹೆಚ್ಚಿನ ಮಸಾಲೆ ಪುಡಿಗಳು ಅಧಿಕ ಉಷ್ಣತೆಯಲ್ಲಿ ತಯಾರಾಗಿ, ಕೃತಕ ಬಣ್ಣ ಮತ್ತು ಕಲಬೆರಕೆಯಿಂದ ತುಂಬಿವೆ. ಇಂದಿಮಾದಲ್ಲಿ ನಾವು ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ವಿಧಾನದ ಮೂಲಕ ಅಪ್ಪಟ ಆರೋಗ್ಯ ಮತ್ತು ರುಚಿಯನ್ನು ಮರಳಿ ತರುತ್ತಿದ್ದೇವೆ.'
              : 'Most modern commercial spices undergo harsh industrial heating and heavy adulteration that harms digestion. Discover why stone-ground, preservative-free Bengaluru homemade spices taste superior and heal from within.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-[#FAF7F2] border border-[#DFCFC0] rounded-full">
            <button
              onClick={() => setActiveTab('hazards')}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'hazards'
                  ? 'bg-[#8B3214] text-white shadow-sm'
                  : 'text-[#5C483B] hover:text-[#1F1610]'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isKn ? 'ರಾಸಾಯನಿಕ ಮಸಾಲೆಗಳ ಅಪಾಯಗಳು' : 'Chemical Spice Hazards'}</span>
            </button>

            <button
              onClick={() => setActiveTab('benefits')}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'benefits'
                  ? 'bg-[#2B5329] text-white shadow-sm'
                  : 'text-[#5C483B] hover:text-[#1F1610]'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>{isKn ? 'ನೈಸರ್ಗಿಕ ಆರೋಗ್ಯ ಪ್ರಯೋಜನಗಳು' : 'Pure Spice Health Benefits'}</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'comparison'
                  ? 'bg-[#1F1610] text-white shadow-sm'
                  : 'text-[#5C483B] hover:text-[#1F1610]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isKn ? 'ನೈಜ ಹೋಲಿಕೆ ಪಟ್ಟಿ' : 'Truth Comparison'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Chemical Hazards */}
        {activeTab === 'hazards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {chemicalHazards.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#FFF8F6] border border-[#F5C7BC] space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center space-x-2.5 text-[#8B3214]">
                  <div className="p-2 bg-[#FDE8E4] rounded-xl border border-[#F5C7BC]">
                    <AlertTriangle className="w-4 h-4 text-[#8B3214]" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#8B3214]">
                    {isKn ? item.title_kn : item.title_en}
                  </h3>
                </div>

                <p className="text-xs text-[#5C483B] leading-relaxed">
                  {isKn ? item.hazard_kn : item.hazard_en}
                </p>

                <div className="pt-2 border-t border-[#F5C7BC]/60 flex items-center space-x-1.5 text-[11px] font-bold text-[#8B3214]">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.impact_en}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Natural Benefits */}
        {activeTab === 'benefits' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {naturalBenefits.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#F4F9F5] border border-[#CDE0D0] space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center space-x-2.5 text-[#2B5329]">
                  <div className="p-2 bg-[#EAF2EB] rounded-xl border border-[#CDE0D0]">
                    <CheckCircle2 className="w-4 h-4 text-[#2B5329]" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#2B5329]">
                    {isKn ? item.spice_kn : item.spice_en}
                  </h3>
                </div>

                <p className="text-xs text-[#4A5D4E] leading-relaxed">
                  {isKn ? item.benefit_kn : item.benefit_en}
                </p>

                <div className="pt-2 border-t border-[#CDE0D0]/60 flex items-center space-x-1.5 text-[11px] font-bold text-[#2B5329]">
                  <Sparkles className="w-3.5 h-3.5 text-[#2B5329] shrink-0" />
                  <span>{isKn ? '100% ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಶುದ್ಧತೆ' : '100% Stone-Ground Potency'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Direct Side-by-Side Comparison */}
        {activeTab === 'comparison' && (
          <div className="overflow-x-auto rounded-2xl border border-[#E8DFD3]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3]">
                  <th className="p-4 font-bold text-[#1F1610] w-1/3">
                    {isKn ? 'ಗುಣಲಕ್ಷಣ' : 'Quality Parameter'}
                  </th>
                  <th className="p-4 font-bold text-[#8B3214] bg-[#FFF8F6] border-x border-[#F5C7BC]/50 w-1/3">
                    {isKn ? 'ಸಾಮಾನ್ಯ ಕಾರ್ಖಾನೆ ಮಸಾಲೆಗಳು' : 'Commercial Factory Brands'}
                  </th>
                  <th className="p-4 font-bold text-[#2B5329] bg-[#F4F9F5] w-1/3">
                    {isKn ? 'ಇಂದಿಮಾ ಮನೆಯ ಕಲ್ಲಿನ ಮಸಾಲೆಗಳು' : 'Indima Homemade Pure Spices'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD3]">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="p-4 font-bold text-[#1F1610]">
                      {isKn ? row.feature_kn : row.feature_en}
                    </td>
                    <td className="p-4 text-[#8B3214] bg-[#FFF8F6]/40 border-x border-[#F5C7BC]/40">
                      <div className="flex items-start space-x-1.5">
                        <XCircle className="w-3.5 h-3.5 text-[#8B3214] shrink-0 mt-0.5" />
                        <span>{isKn ? row.commercial_kn : row.commercial_en}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[#2B5329] bg-[#F4F9F5]/40 font-medium">
                      <div className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2B5329] shrink-0 mt-0.5" />
                        <span>{isKn ? row.indima_kn : row.indima_en}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Trust Stamp */}
        <div className="mt-8 pt-6 border-t border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C483B]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-[#1F1610]">
              {isKn
                ? 'ಪ್ರತಿ ಬ್ಯಾಚ್ ಅನ್ನು ಬಸವನಗುಡಿ ಹಾಗೂ ಬೆಂಗಳೂರಿನ ನಮ್ಮ ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆಮನೆಯಲ್ಲಿ ಶುದ್ಧವಾಗಿ ತಯಾರಿಸಲಾಗುತ್ತದೆ.'
                : 'Every batch is stone-ground weekly in our Bengaluru kitchen using 100% whole spices.'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#8B3214] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#DFCFC0]">
            FSSAI Food Grade • 0% Chemicals
          </span>
        </div>
      </div>
    </section>
  );
};
