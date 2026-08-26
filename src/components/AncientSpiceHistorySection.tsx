import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Sparkles,
  BookOpen,
  Compass,
  History,
  ShieldCheck,
  Award,
  Sun,
  Flame,
  Feather,
  HeartPulse,
  Leaf
} from 'lucide-react';

export const AncientSpiceHistorySection: React.FC = () => {
  const { language } = useLanguage();
  const isKn = language === 'kn';
  const [activeTab, setActiveTab] = useState<'timeline' | 'ayurveda' | 'doshas'>('timeline');
  const [selectedDosha, setSelectedDosha] = useState<'vata' | 'pitta' | 'kapha'>('vata');

  const historyTimeline = [
    {
      era_en: '3000 BCE • Vedic Era',
      era_kn: 'ಕ್ರಿ.ಪೂ. ೩೦೦೦ • ವೈದಿಕ ಯುಗ',
      title_en: 'Rigveda & Atharvaveda Botanical Hymns',
      title_kn: 'ಋಗ್ವೇದ ಮತ್ತು ಅಥರ್ವವೇದದ ಪವಿತ್ರ ಸಸ್ಯ ಸೂಕ್ತಗಳು',
      description_en:
        'The earliest Sanskrit scriptures praised Haridra (Turmeric) and Maricha (Black Pepper) as sacred divine medicines gifted by nature. Spices were offered in sacred Agnihotra fires to purify the atmosphere and consumed daily to ignite bodily Agni (metabolic fire).',
      description_kn:
        'ಪ್ರಾಚೀನ ಸಂಸ್ಕೃತ ಗ್ರಂಥಗಳಲ್ಲಿ ಅರಿಶಿನ (ಹರಿದ್ರಾ) ಮತ್ತು ಕಾಳುಮೆಣಸು (ಮರೀಚ) ಗಳನ್ನು ದೈವಿಕ ರೋಗನಿರೋಧಕ ಸಸ್ಯಗಳೆಂದು ಕೊಂಡಾಡಲಾಗಿದೆ. ವಾತಾವರಣ ಶುದ್ಧಿಗೆ ಹಾಗೂ ದೇಹದ ಜಠರಾಗ್ನಿಯನ್ನು ಪ್ರಚೋದಿಸಲು ಇವುಗಳನ್ನು ಬಳಸಲಾಗುತ್ತಿತ್ತು.',
      icon: Sun,
      color: 'amber'
    },
    {
      era_en: '300 BCE • Classical Maritime Trade',
      era_kn: 'ಕ್ರಿ.ಪೂ. ೩೦೦ • ಪುರಾತನ ಕಡಲ ವ್ಯಾಪಾರ',
      title_en: 'The Golden Spice Route & Muziris Port',
      title_kn: 'ಸುವರ್ಣ ಮಸಾಲೆ ಮಾರ್ಗ ಮತ್ತು ಮುಜಿರಿಸ್ ಬಂದರು',
      description_en:
        'Roman and Greek empires crossed the Arabian Sea solely to acquire Malabar Black Pepper, known as "Black Gold" (Yavanapriya). Pliny the Elder recorded Roman gold solidus coins pouring into Southern India in exchange for Malabar pepper, cardamom, and cinnamon.',
      description_kn:
        'ರೋಮನ್ ಮತ್ತು ಗ್ರೀಕ್ ಸಾಮ್ರಾಜ್ಯಗಳು ಮಲೆನಾಡಿನ ಕರಿಮೆಣಸನ್ನು "ಕಪ್ಪು ಚಿನ್ನ" (ಯವನಪ್ರಿಯ) ಎಂದು ಕರೆದು, ಚಿನ್ನದ ನಾಣ್ಯಗಳನ್ನು ಕೊಟ್ಟು ದಕ್ಷಿಣ ಭಾರತದ ಮುಜಿರಿಸ್ ಬಂದರಿನಿಂದ ಮಸಾಲೆಗಳನ್ನು ಕೊಂಡೊಯ್ಯುತ್ತಿದ್ದರು.',
      icon: Compass,
      color: 'amber'
    },
    {
      era_en: '1000 BCE • Classical Ayurvedic Treatises',
      era_kn: 'ಕ್ರಿ.ಪೂ. ೧೦೦೦ • ಚರಕ ಮತ್ತು ಸುಶ್ರುತ ಸಂಹಿತೆ',
      title_en: 'Charaka & Sushruta Samhita Wisdom',
      title_kn: 'ಚರಕ ಮತ್ತು ಸುಶ್ರುತ ಸಂಹಿತೆಯ ವೈದ್ಯಕೀಯ ಜ್ಞಾನ',
      description_en:
        'Ayurveda classified spices as Dipana (appetite kindle), Pachana (cellular toxin digestion), and Rasayana (longevity rejuvenators). Spices were not merely culinary seasonings, but precision botanical prescriptions to harmonize the Tridoshas.',
      description_kn:
        'ಆಯುರ್ವೇದವು ಮಸಾಲೆಗಳನ್ನು ದೀಪನ (ಹಸಿವು ಹೆಚ್ಚಿಸುವ), ಪಾಚನ (ಆಮ-ವಿಷ ನಿವಾರಕ) ಮತ್ತು ರಸಾಯನ (ದೀರ್ಘಾಯುಷ್ಯ ವರ್ಧಕ) ಎಂದು ವರ್ಗೀಕರಿಸಿದೆ. ಆಹಾರವೇ ಔಷಧವೆಂಬ ತತ್ವದಂತೆ ದೈನಂದಿನ ಅಡುಗೆಯಲ್ಲಿ ಇವುಗಳನ್ನು ಬಳಸಲಾಯಿತು.',
      icon: Feather,
      color: 'amber'
    },
    {
      era_en: 'Traditional Practice • Living Heritage',
      era_kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಪದ್ಧತಿ • ಇಂದಿನವರೆಗಿನ ಜೀವಂತ ಪರಂಪರೆ',
      title_en: 'Surya Tapam & Ammi Kal Cold Stone Grinding',
      title_kn: 'ಸೂರ್ಯ ತಾಪಂ ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ರುಬ್ಬುವಿಕೆ',
      description_en:
        'Spices are sun-cured on natural stone courtyards under gentle morning sunlight (Surya Tapam) to lock in pure phytonutrients, then hand-crushed or cold-milled on granite stones (Ammi Kal) so heat never evaporates delicate ethereal healing oils.',
      description_kn:
        'ಮಸಾಲೆಗಳನ್ನು ಮುಂಜಾನೆಯ ಸೂರ್ಯನ ಬಿಸಿಲಿನಲ್ಲಿ ನೈಸರ್ಗಿಕವಾಗಿ ಒಣಗಿಸಿ (ಸೂರ್ಯ ತಾಪಂ), ಸಾಂಪ್ರದಾಯಿಕ ಕಲ್ಲಿನ ಬೀಸುವ ಕಲ್ಲುಗಳಲ್ಲಿ ಕಡಿಮೆ ಉಷ್ಣತೆಯಲ್ಲಿ ಪುಡಿಮಾಡುವುದರಿಂದ ಅವುಗಳ ಸುವಾಸನೆ ಮತ್ತು ಔಷಧೀಯ ತೈಲಗಳು ಸಂರಕ್ಷಿಸಲ್ಪಡುತ್ತವೆ.',
      icon: Flame,
      color: 'amber'
    }
  ];

  const ancientSpicesHealing = [
    {
      sanskrit: 'Haridra (हरिद्रा)',
      kannada: 'ಅರಿಶಿನ',
      common: 'Lakadong High-Curcumin Turmeric',
      element: 'Prithvi & Agni',
      tridosha: 'Vata-Kapha Pacifying, Purifies Pitta',
      ancient_benefit_en:
        'Ancient texts declare it "Krimighna" (destroyer of pathogens) and "Varnya" (enhancer of cellular glow). Contains 8.5%+ natural Curcumin that shields immunity, purifies blood, and reverses inflammatory stress.',
      ancient_benefit_kn:
        'ಪ್ರಾಚೀನ ಆಯುರ್ವೇದದಲ್ಲಿ ಇದನ್ನು ಕ್ರಿಮಿಘ್ನ ಹಾಗೂ ರಕ್ತಶೋಧಕ ಎಂದು ಕರೆಯಲಾಗಿದೆ. ಉನ್ನತ ಕುರ್ಕುಮಿನ್ ಅಂಶವು ದೇಹದ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಬಲಪಡಿಸಿ, ರಕ್ತವನ್ನು ಶುದ್ಧೀಕರಿಸುತ್ತದೆ.'
    },
    {
      sanskrit: 'Maricha (मरीच)',
      kannada: 'ಕರಿಮೆಣಸು',
      common: 'Tellicherry Malabar Black Pepper',
      element: 'Agni & Vayu',
      tridosha: 'Kapha-Vata Pacifying, Deepana',
      ancient_benefit_en:
        'Revered as "Deepana-Pachana" supreme. Loaded with piperine which enhances biological absorption of all micronutrients by up to 2000%, clears respiratory mucus, and expels deep tissue toxins (Ama).',
      ancient_benefit_kn:
        'ಮಸಾಲೆಗಳ ರಾಜ. ಪೈಪರೀನ್ ಅಂಶವು ಇತರ ಪೋಷಕಾಂಶಗಳ ಹೀರಿಕೊಳ್ಳುವಿಕೆಯನ್ನು ೨೦ ಪಟ್ಟು ಹೆಚ್ಚಿಸುತ್ತದೆ. ಶ್ವಾಸಕೋಶದ ಕಫ ನಿವಾರಿಸಿ ಜೀರ್ಣಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.'
    },
    {
      sanskrit: 'Ela (एला)',
      kannada: 'ಏಲಕ್ಕಿ',
      common: 'Royal Alleppey Green Cardamom',
      element: 'Jala & Vayu',
      tridosha: 'Tridosha Balancing (Samatva)',
      ancient_benefit_en:
        'Celebrated as "Hridya" (heart tonic) and natural palate purifier. Cools digestive acidity while maintaining metabolic fire, calms nervous tension, and alleviates bloating and nausea.',
      ancient_benefit_kn:
        'ಮಸಾಲೆಗಳ ರಾಣಿ. ಹೃದಯಕ್ಕೆ ಹಿತಕರ, ಬಾಯಿಯ ದುರ್ವಾಸನೆ ನಿವಾರಕ ಮತ್ತು ಅಸಿಡಿಟಿಯನ್ನು ಕಡಿಮೆ ಮಾಡಿ ಮನಸ್ಸಿಗೆ ಶಾಂತಿ ನೀಡುತ್ತದೆ.'
    },
    {
      sanskrit: 'Lavanga (लवङ्ग)',
      kannada: 'ಲವಂಗ',
      common: 'Royal Malabar Whole Cloves',
      element: 'Agni & Akasha',
      tridosha: 'Kapha-Pitta Balancer, Kanthya',
      ancient_benefit_en:
        'Supreme source of Eugenol essential oil. Ancient texts prescribe it for throat clarity ("Kanthya"), dental vitality, acute digestive coldness, and antimicrobial cellular protection.',
      ancient_benefit_kn:
        'ಯುಜೆನಾಲ್ ತೈಲದ ಆಗರ. ಗಂಟಲಿನ ಕಿರಿಕಿರಿ, ಹಲ್ಲುನೋವು, ಶೀತ ನಿವಾರಣೆಗೆ ಹಾಗೂ ಜೀರ್ಣಾಂಗಗಳ ರಕ್ಷಣೆಗೆ ಶ್ರೇಷ್ಠ ಔಷಧ.'
    },
    {
      sanskrit: 'Twak (त्वक्)',
      kannada: 'ದಾಲ್ಚಿನ್ನಿ',
      common: 'Ceylon Sweet True Cinnamon',
      element: 'Agni & Vayu',
      tridosha: 'Vata-Kapha Pacifier, Medohara',
      ancient_benefit_en:
        'Ancient metabolic harmonizer. Promotes healthy circulation, balances glucose absorption, strengthens the heart channel, and sweetens the breath naturally without sugar.',
      ancient_benefit_kn:
        'ರಕ್ತ ಪರಿಚಲನೆ ಉತ್ತಮಗೊಳಿಸಿ, ಸಕ್ಕರೆ ಪ್ರಮಾಣವನ್ನು ಸಮತೋಲನದಲ್ಲಿಡಲು ಹಾಗೂ ಜೀರ್ಣಕ್ರಿಯೆಯನ್ನು ಚುರುಕುಗೊಳಿಸಲು ಅತ್ಯುತ್ತಮ.'
    },
    {
      sanskrit: 'Jiraka (जीरक)',
      kannada: 'ಜೀರಿಗೆ',
      common: 'Kashmiri Shahi Royal Cumin',
      element: 'Agni & Jala',
      tridosha: 'Pitta-Vata Pacifying, Grahi',
      ancient_benefit_en:
        'Derived from the root "Jiranat" (that which digests). Calms irritable digestion, relieves abdominal gas immediately, supports maternal wellness, and purifies breast milk.',
      ancient_benefit_kn:
        'ಜೀರ್ಣಶಕ್ತಿಯ ಮೂಲ. ಹೊಟ್ಟೆಯುಬ್ಬರ, ಗ್ಯಾಸ್ಟ್ರಿಕ್ ಸಮಸ್ಯೆಯನ್ನು ತಕ್ಷಣ ನಿವಾರಿಸಿ ದೇಹಕ್ಕೆ ತಂಪು ಮತ್ತು ಚೈತನ್ಯ ನೀಡುತ್ತದೆ.'
    }
  ];

  const doshaGuides = {
    vata: {
      name_en: 'Vata Dosha (Air & Ether)',
      name_kn: 'ವಾತ ದೋಷ (ವಾಯು & ಆಕಾಶ)',
      traits_en: 'Cold, dry, airy, irregular digestion, bloating, cold hands/feet.',
      traits_kn: 'ಶೀತ, ಒಣ ತ್ವಚೆ, ಅನಿಲ, ಅಸ್ಥಿರ ಜೀರ್ಣಕ್ರಿಯೆ, ಆತಂಕ.',
      recommended_spices_en:
        'Warming, grounding spices: Kashmiri Cumin (Jeera), Fresh Ginger (Sunthi), Malabar Cloves, Pure Hing (Asafoetida), Cinnamon.',
      recommended_spices_kn:
        'ಬೆಚ್ಚಗಿನ, ಶಾಂತಗೊಳಿಸುವ ಮಸಾಲೆಗಳು: ಜೀರಿಗೆ, ಶುಂಠಿ, ಲವಂಗ, ಇಂಗು, ದಾಲ್ಚಿನ್ನಿ.',
      ideal_blend: 'Maniyara Rasam Powder & Melukote Puliyogare'
    },
    pitta: {
      name_en: 'Pitta Dosha (Fire & Water)',
      name_kn: 'ಪಿತ್ತ ದೋಷ (ಅಗ್ನಿ & ಜಲ)',
      traits_en: 'Sharp, hot, acidic, prone to heartburn, body heat, intense appetite.',
      traits_kn: 'ಉಷ್ಣ, ಆಮ್ಲೀಯತೆ, ಎದೆಯುರಿ, ಅತಿಯಾದ ದೇಹದ ಬಿಸಿ.',
      recommended_spices_en:
        'Cooling, soothing aromatic spices: Green Cardamom (Elaichi), Coriander Seeds (Dhaniya), Fennel Seeds (Saunf), Ceylon Cinnamon, Mild Turmeric.',
      recommended_spices_kn:
        'ತಂಪಾದ, ಸುಗಂಧಯುಕ್ತ ಮಸಾಲೆಗಳು: ಹಸಿರು ಏಲಕ್ಕಿ, ಧನಿಯಾ, ಸೋಂಪು, ದಾಲ್ಚಿನ್ನಿ, ಶುದ್ಧ ಅರಿಶಿನ.',
      ideal_blend: 'Udupi Temple Sambar Masala & Golden Turmeric Latte'
    },
    kapha: {
      name_en: 'Kapha Dosha (Earth & Water)',
      name_kn: 'ಕಫ ದೋಷ (ಪೃಥ್ವಿ & ಜಲ)',
      traits_en: 'Heavy, sluggish, slow metabolism, morning congestion, lethargy.',
      traits_kn: 'ಭಾರವಾದ ಭಾವನೆ, ನಿಧಾನಗತಿಯ ಜೀರ್ಣಕ್ರಿಯೆ, ಕಫ, ಶೀತ.',
      recommended_spices_en:
        'Pungent, stimulating spices: Tellicherry Black Pepper (Maricha), Byadgi Red Chillies, Dry Ginger, Mustard Seeds (Sarshapa), Fenugreek.',
      recommended_spices_kn:
        'ಚುರುಕುಗೊಳಿಸುವ, ತೀಕ್ಷ್ಣ ಮಸಾಲೆಗಳು: ಕಾಳುಮೆಣಸು, ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ, ಸಾಸಿವೆ, ಮೆಂತ್ಯ.',
      ideal_blend: 'Mysuru Bisi Bele Bath Powder & Malnad Garam Masala'
    }
  };

  return (
    <section id="ancient-history-section" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle Sacred Motif Watermark */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2.5 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-[#FAF3E0] border border-[#DFC7A2] rounded-full text-xs font-bold text-[#7A1F1D]">
            <Sparkles className="w-3.5 h-3.5 text-[#993300]" />
            <span>
              {isKn ? '೫೦೦೦+ ವರ್ಷಗಳ ಪವಿತ್ರ ಆಯುರ್ವೇದೀಯ ಪರಂಪರೆ' : '5,000+ Years of Vedic Spice History & Ayurvedic Healing'}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#2C1810] tracking-tight">
            {isKn
              ? 'ಪ್ರಾಚೀನ ಭಾರತೀಯ ಮಸಾಲೆಗಳ ಇತಿಹಾಸ ಮತ್ತು ನೈಸರ್ಗಿಕ ಆರೋಗ್ಯ ಲಾಭಗಳು'
              : 'Ancient Spice Wisdom: Vedic History & Therapeutic Health Benefits'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4535] leading-relaxed max-w-2xl mx-auto">
            {isKn
              ? 'ಋಗ್ವೇದ ಕಾಲದಿಂದ ಇಂದಿನವರೆಗೆ — ಭಾರತೀಯ ಮಸಾಲೆಗಳು ಕೇವಲ ರುಚಿಗಷ್ಟೇ ಅಲ್ಲ, ಆರೋಗ್ಯ, ದೀರ್ಘಾಯುಷ್ಯ ಮತ್ತು ಚೈತನ್ಯದ ಪವಿತ್ರ ಔಷಧಗಳಾಗಿವೆ.'
              : 'From the sacred hymns of the Rigveda to classical Ayurvedic healing — explore how natural stone-ground spices sustain bodily harmony, vibrant Agni, and lifelong immunity.'}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8 relative z-10">
          <div className="inline-flex p-1 bg-[#FAF6EE] border border-[#E0D0BE] rounded-2xl gap-1 shadow-inner">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'timeline'
                  ? 'bg-[#7A1F1D] text-white shadow-xs'
                  : 'text-[#5C4535] hover:text-[#2C1810]'
              }`}
            >
              <History className="w-4 h-4" />
              <span>{isKn ? 'ಪ್ರಾಚೀನ ಇತಿಹಾಸ' : '5,000-Yr History'}</span>
            </button>
            <button
              onClick={() => setActiveTab('ayurveda')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'ayurveda'
                  ? 'bg-[#7A1F1D] text-white shadow-xs'
                  : 'text-[#5C4535] hover:text-[#2C1810]'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>{isKn ? 'ಔಷಧೀಯ ಗುಣಗಳು' : 'Ancient Health Benefits'}</span>
            </button>
            <button
              onClick={() => setActiveTab('doshas')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'doshas'
                  ? 'bg-[#7A1F1D] text-white shadow-xs'
                  : 'text-[#5C4535] hover:text-[#2C1810]'
              }`}
            >
              <Leaf className="w-4 h-4" />
              <span>{isKn ? 'ತ್ರಿದೋಷ ಮಾರ್ಗದರ್ಶಿ' : 'Tridosha Spice Guide'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Historical Timeline */}
        {activeTab === 'timeline' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
            {historyTimeline.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FAF6EE] border border-[#E0D0BE] hover:border-[#993300]/50 rounded-2xl p-6 transition-all duration-300 shadow-2xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#993300] bg-[#FAF3E0] px-3 py-1 rounded-full border border-[#DFC7A2]">
                        {isKn ? item.era_kn : item.era_en}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#DFC7A2] flex items-center justify-center text-[#7A1F1D] shadow-2xs">
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#2C1810]">
                      {isKn ? item.title_kn : item.title_en}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C4535] leading-relaxed">
                      {isKn ? item.description_kn : item.description_en}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-[#EADBCA] flex items-center text-[11px] font-bold text-[#7A1F1D]">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-[#993300]" />
                    <span>{isKn ? 'ಅಧಿಕೃತ ಪರಂಪರೆ' : 'Authentic Vedic Heritage'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Ancient Spice Health Benefits (Sanskrit & Charaka Samhita) */}
        {activeTab === 'ayurveda' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
            {ancientSpicesHealing.map((spice, idx) => (
              <div
                key={idx}
                className="bg-[#FAF6EE] border border-[#E0D0BE] hover:border-[#993300]/50 rounded-2xl p-5 transition-all duration-300 shadow-2xs hover:shadow-md flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#7A1F1D] font-mono">
                      {spice.sanskrit}
                    </span>
                    <span className="text-[10px] bg-white border border-[#DFC7A2] text-[#993300] font-bold px-2 py-0.5 rounded-md">
                      {isKn ? spice.kannada : spice.element}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#2C1810]">
                    {spice.common}
                  </h3>
                  <div className="text-[11px] font-semibold text-[#8B4513] bg-[#FAF3E0] px-2.5 py-1 rounded-lg border border-[#E6D5BE]">
                    ⚡ {spice.tridosha}
                  </div>
                  <p className="text-xs text-[#5C4535] leading-relaxed pt-1">
                    {isKn ? spice.ancient_benefit_kn : spice.ancient_benefit_en}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#EADBCA] flex items-center text-[11px] font-bold text-[#15803D]">
                  <Sparkles className="w-3 h-3 mr-1 text-[#15803D]" />
                  <span>{isKn ? '೧೦೦% ನೈಸರ್ಗಿಕ ಔಷಧೀಯ ಶಕ್ತಿ' : '100% Raw Botanical Potency'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Tridosha Custom Spice Matrix */}
        {activeTab === 'doshas' && (
          <div className="bg-[#FAF6EE] border border-[#E0D0BE] rounded-2xl p-6 sm:p-8 relative z-10">
            <div className="text-center max-w-xl mx-auto mb-6">
              <h3 className="font-serif text-xl font-bold text-[#2C1810]">
                {isKn ? 'ನಿಮ್ಮ ಪ್ರಕೃತಿಗೆ ಸೂಕ್ತವಾದ ಮಸಾಲೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Select Your Body Constitution (Prakriti)'}
              </h3>
              <p className="text-xs text-[#5C4535] mt-1">
                {isKn
                  ? 'ಆಯುರ್ವೇದದಲ್ಲಿ ಪ್ರತಿಯೊಬ್ಬ ವ್ಯಕ್ತಿಯ ದೇಹ ಪ್ರಕೃತಿಗೆ ತಕ್ಕಂತೆ ಮಸಾಲೆಗಳ ಸೇವನೆ ಸೂಚಿಸಲಾಗಿದೆ.'
                  : 'Ayurveda pairs specific spices to balance individual constitutions and strengthen digestion without irritation.'}
              </p>
            </div>

            {/* Dosha Selector Buttons */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
              {(['vata', 'pitta', 'kapha'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDosha(d)}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    selectedDosha === d
                      ? 'bg-[#7A1F1D] text-white border-[#7A1F1D] shadow-sm'
                      : 'bg-white text-[#5C4535] border-[#DFC7A2] hover:bg-[#FAF3E0]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Active Dosha Details Card */}
            <div className="max-w-2xl mx-auto bg-white border border-[#DFC7A2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EADBCA] pb-3">
                <h4 className="font-serif text-lg font-bold text-[#7A1F1D]">
                  {isKn ? doshaGuides[selectedDosha].name_kn : doshaGuides[selectedDosha].name_en}
                </h4>
                <span className="text-[11px] font-bold px-3 py-1 bg-[#FAF3E0] text-[#993300] rounded-full border border-[#DFC7A2]">
                  {isKn ? 'ಆಯುರ್ವೇದ ಚಿಕಿತ್ಸೆ' : 'Vedic Balance'}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1">
                  {isKn ? 'ಲಕ್ಷಣಗಳು:' : 'Constitutional Traits:'}
                </p>
                <p className="text-xs sm:text-sm text-[#5C4535]">
                  {isKn ? doshaGuides[selectedDosha].traits_kn : doshaGuides[selectedDosha].traits_en}
                </p>
              </div>

              <div className="bg-[#FAF3E0] p-4 rounded-xl border border-[#DFC7A2] space-y-1.5">
                <p className="text-xs font-bold text-[#7A1F1D] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#993300]" />
                  <span>{isKn ? 'ಶಿಫಾರಸು ಮಾಡಲಾದ ಪವಿತ್ರ ಮಸಾಲೆಗಳು:' : 'Recommended Ayurvedic Spices:'}</span>
                </p>
                <p className="text-xs sm:text-sm text-[#2C1810] font-medium leading-relaxed">
                  {isKn
                    ? doshaGuides[selectedDosha].recommended_spices_kn
                    : doshaGuides[selectedDosha].recommended_spices_en}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#5C4535] font-semibold">
                  {isKn ? 'ಸೂಕ್ತವಾದ ಇಂದಿಮಾ ಮಸಾಲೆಗಳು:' : 'Matching Indima Blends:'}
                </span>
                <span className="font-bold text-[#993300]">
                  {doshaGuides[selectedDosha].ideal_blend}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
