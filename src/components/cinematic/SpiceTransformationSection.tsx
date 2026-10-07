import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  VolumeX,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Link2,
  Check,
  Flame,
  ShieldCheck,
  Heart,
  ArrowRight,
  Maximize2
} from 'lucide-react';

interface SpiceTransformationSectionProps {
  customVideoUrl?: string;
}

type SupportedLang = 'en' | 'kn' | 'hi' | 'ta';

interface SpiceChapter {
  id: string;
  name: Record<SupportedLang, string>;
  kannadaScript: string;
  characterTitle: Record<SupportedLang, string>;
  description: Record<SupportedLang, string>;
  culinaryUse: Record<SupportedLang, string>;
  healthBenefit: Record<SupportedLang, string>;
  startTime: number;
  endTime: number;
  accentColor: string;
  accentBg: string;
  badge: Record<SupportedLang, string>;
  tag: string;
}

const SPICE_CHAPTERS: SpiceChapter[] = [
  {
    id: 'garam-masala',
    name: {
      en: 'Royal Garam Masala',
      kn: 'ಅಪ್ಪಟ ಗರಂ ಮಸಾಲ',
      hi: 'शाही गरम मसाला',
      ta: 'ராஜ கரம் மசாலா'
    },
    kannadaScript: 'ಗರಂ ಮಸಾಲ',
    characterTitle: {
      en: 'The Master Blend In Handi',
      kn: 'ಮಣ್ಣಿನ ಪಾತ್ರೆಯ ರಾಜ ಮಸಾಲೆ',
      hi: 'जादुई मिट्टी की हांडी का मसाला',
      ta: 'மண்பானை நறுமண மசாலா'
    },
    description: {
      en: 'Slow-roasted whole spices, stone-ground into a velvety powder that gently showers authentic warmth into simmering earthenware curries.',
      kn: 'ಕಲ್ಲಿನ ಒರಳಿನಲ್ಲಿ ಹದವಾಗಿ ಬೀಸಿ ತಯಾರಿಸಿದ ರಾಜಮನೆತನದ ಗರಂ ಮಸಾಲೆ. ಮಣ್ಣಿನ ಪಾತ್ರೆಯ ಸಾರಿಗೆ ದೈವಿಕ ಪರಿಮಳ ಮತ್ತು ಅಪ್ಪಟ ರುಚಿ ನೀಡುತ್ತದೆ.',
      hi: 'मिट्टी की हांडी में उबलती करी में जादुई खुशबू और तीखापन घोलता पारंपरिक पिसा हुआ शाही गरम मसाला।',
      ta: 'மண்பானை குழம்பிற்கு நறுமணமும் சுவையும் சேர்க்கும் பாரம்பரிய கைக்குத்தல் கரம் மசாலா பொடி.'
    },
    culinaryUse: {
      en: 'Perfect for rich curries, gravies, biryani & dal tadka',
      kn: 'ಸಾಂಬಾರು, ಪಲ್ಯ, ದಾಲ್ ತಡ್ಕಾ ಮತ್ತು ದಮ್ ಬಿರಿಯಾನಿಗೆ ಪರಿಪೂರ್ಣ',
      hi: 'शाही ग्रेवी, दाल तड़का और पुलाव के लिए सर्वोत्तम',
      ta: 'குருமா, சாம்பார் மற்றும் பிரியாணிக்கு உகந்தது'
    },
    healthBenefit: {
      en: 'Ignites digestive fire & boosts natural metabolic warmth',
      kn: 'ಜೀರ್ಣಕ್ರಿಯೆ ಹೆಚ್ಚಿಸಿ ದೇಹಕ್ಕೆ ಸಹಜ ಉಲ್ಲಾಸ ನೀಡುತ್ತದೆ',
      hi: 'पाचन तंत्र को मजबूत करता है और स्फूर्ति देता है',
      ta: 'செரிமானத்தை சீராக்கும் ஆரோக்கிய ஆற்றல்'
    },
    startTime: 0,
    endTime: 5.5,
    accentColor: '#993300',
    accentBg: 'rgba(153, 51, 0, 0.08)',
    badge: {
      en: 'Stone-Ground Master Blend',
      kn: 'ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಅಪ್ಪಟ ಮಿಶ್ರಣ',
      hi: 'पत्थर से पिसा शुद्ध मिश्रण',
      ta: 'பாரம்பரிய கைக்குத்தல் முறை'
    },
    tag: 'Handcrafted'
  },
  {
    id: 'turmeric',
    name: {
      en: 'Sun-Cured Golden Turmeric',
      kn: 'ಬಂಗಾರದ ಪರಿಶುದ್ಧ ಅರಿಶಿನ',
      hi: 'शुद्ध सुनहरी हल्दी',
      ta: 'தூய மஞ்சள் பொடி'
    },
    kannadaScript: 'ಅರಿಶಿನ',
    characterTitle: {
      en: 'The Radiant Golden Healer',
      kn: 'ಆರೋಗ್ಯದ ಬಂಗಾರದ ಕಣಗಳು',
      hi: 'सुनहरा स्वास्थ्य रक्षक',
      ta: 'மங்கல மஞ்சள் நாயகன்'
    },
    description: {
      en: 'Pure heirloom turmeric roots ground with zero polish or additives. Radiates sparkling high-curcumin golden dust over fresh garden vegetables.',
      kn: 'ನೈಸರ್ಗಿಕ ಕರ್ಕ್ಯುಮಿನ್ ಭರಿತ ಅಪ್ಪಟ ಅರಿಶಿನ. ತಾಜಾ ತರಕಾರಿಗಳಿಗೆ ನೈಸರ್ಗಿಕ ಹಳದಿ ಬಣ್ಣ ಮತ್ತು ದಿವ್ಯ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.',
      hi: 'प्राकृतिक करक्यूमिन से भरपूर बिना मिलावट वाली शुद्ध हल्दी, जो भोजन को दे आरोग्य और चमकीला रूप।',
      ta: 'இயற்கையான குர்குமின் நிறைந்த தூய மஞ்சள், காய்கறிகளுக்கும் உடலுக்கும் ஆரோக்கியம் தரும்.'
    },
    culinaryUse: {
      en: 'Essential for sabzis, sambar, rasam & golden turmeric milk',
      kn: 'ಸಾರು, ಸಾಂಬಾರು, ಅಡುಗೆ ಒಗ್ಗರಣೆ ಮತ್ತು ರೋಗನಿರೋಧಕ ಅರಿಶಿನ ಹಾಲಿಗೆ',
      hi: 'सब्जियों, दालों और गर्म हल्दी दूध के लिए उत्तम',
      ta: 'தினசரி சமையல், சாம்பார் மற்றும் மஞ்சள் பாலுக்கு ஏற்றது'
    },
    healthBenefit: {
      en: 'Potent natural anti-inflammatory & daily immunity shield',
      kn: 'ನೈಸರ್ಗಿಕ ರೋಗನಿರೋಧಕ ಮತ್ತು ನಂಜುನಿವಾರಕ ರಕ್ಷಣಾ ಕವಚ',
      hi: 'प्रतिरोधक क्षमता बढ़ाने वाला शक्तिशाली प्राकृतिक वरदान',
      ta: 'இயற்கை கிருமி நாசினி மற்றும் நோய் எதிர்ப்பு சக்தி'
    },
    startTime: 6,
    endTime: 11.5,
    accentColor: '#D48806',
    accentBg: 'rgba(212, 136, 6, 0.08)',
    badge: {
      en: 'High Natural Curcumin',
      kn: 'ಹೆಚ್ಚಿನ ನೈಸರ್ಗಿಕ ಕರ್ಕ್ಯುಮಿನ್',
      hi: 'उच्च प्राकृतिक करक्यूमिन',
      ta: 'இயற்கை குர்குமின் நிறைந்தது'
    },
    tag: 'Pure Immunity'
  },
  {
    id: 'cumin',
    name: {
      en: 'Crispy Cumin Seeds (Jeera)',
      kn: 'ಘಮಘಮಿಸುವ ಅಪ್ಪಟ ಜೀರಿಗೆ',
      hi: 'सुगंधित तड़का जीरा',
      ta: 'மணக்கும் சீரகம்'
    },
    kannadaScript: 'ಜೀರಿಗೆ',
    characterTitle: {
      en: 'The Sizzling Tadka Acrobat',
      kn: 'ಒಗ್ಗರಣೆಯ ಚಾಂಪಿಯನ್ ಕಾಳು',
      hi: 'तड़के का चुलबुला राजा',
      ta: 'தாளிப்பின் உற்சாக நாயகன்'
    },
    description: {
      en: 'Plump sun-dried cumin seeds that dive joyfully into hot sizzling ghee or oil, crackling to release intoxicating nutty aroma and earthy flavors.',
      kn: 'ಬಿಸಿ ಒಗ್ಗರಣೆ ತುಪ್ಪಕ್ಕೆ ಬಿದ್ದ ತಕ್ಷಣ ಚಿಟಪಟ ಸಿಡಿಯುವ ಸುವಾಸನೆಭರಿತ ಶುದ್ಧ ಜೀರಿಗೆ. ಅಡುಗೆಗೆ ಅಮೃತ ಸಮಾನ ರುಚಿ ಹಾಗೂ ಹಿತ ನೀಡುತ್ತದೆ.',
      hi: 'गरम तेल या घी में कूदकर चटकने वाला ताजा जीरा, जो हर तड़के को बना दे बेमिसाल और खुशबूदार।',
      ta: 'சூடான நெய்யில் பொரிந்து அருமையான வாசனை தரும் தூய சீரகம்.'
    },
    culinaryUse: {
      en: 'The backbone of rasam, jeera rice, dals & chaat',
      kn: 'ರಸಂ, ಜೀರಾ ರೈಸ್, ದಾಲ್ ಮತ್ತು ನಿತ್ಯದ ಶುದ್ಧ ಒಗ್ಗರಣೆಗೆ ಅತ್ಯುತ್ತಮ',
      hi: 'दाल तड़का, जीरा राइस और रायते की जान',
      ta: 'ரசம், ஜீரா சாதம் மற்றும் தாளிப்பிற்கு அத்தியாவசியம்'
    },
    healthBenefit: {
      en: 'Soothes acidity, cools stomach & activates gut digestion',
      kn: 'ಹೊಟ್ಟೆಯ ತಂಪು, ಜೀರ್ಣಶಕ್ತಿ ಮತ್ತು ಅಸಿಡಿಟಿ ನಿಯಂತ್ರಣಕ್ಕೆ ಸಹಕಾರಿ',
      hi: 'गैस व एसिडिटी से तुरंत राहत, पेट के लिए शीतल',
      ta: 'வயிற்று உபாதைகளை போக்கும் செரிமான அருமருந்து'
    },
    startTime: 12,
    endTime: 17.5,
    accentColor: '#7A4A28',
    accentBg: 'rgba(122, 74, 40, 0.08)',
    badge: {
      en: 'Golden Harvest Seeds',
      kn: 'ಸುವಾಸನಾಭರಿತ ಅಪ್ಪಟ ಕಾಳು',
      hi: 'स्वादिष्ट सुनहरे बीज',
      ta: 'பாரம்பரிய நறுமண விதை'
    },
    tag: 'Tadka Essential'
  },
  {
    id: 'cinnamon',
    name: {
      en: 'Sweet Ceylon Cinnamon',
      kn: 'ಪಾರಂಪರಿಕ ದಾಲ್ಚಿನ್ನಿ',
      hi: 'मीठी सीलोन दालचीनी',
      ta: 'இலவங்கப்பட்டை'
    },
    kannadaScript: 'ದಾಲ್ಚಿನ್ನಿ',
    characterTitle: {
      en: 'The Warm Comfort Companion',
      kn: 'ಮಧುರ ಸುವಾಸನೆಯ ಸಂಗಾತಿ',
      hi: 'मिठास और सुगंध का प्रतीक',
      ta: 'சுவையான பட்டை நாயகன்'
    },
    description: {
      en: 'Delicate hand-peeled fragrant bark sun-dried to perfection. Infuses morning spiced masala chai and royal dum biryani with sweet woody warmth.',
      kn: 'ನೈಸರ್ಗಿಕ ಮಧುರ ಪರಿಮಳದ ಅಪ್ಪಟ ದಾಲ್ಚಿನ್ನಿ ತೊಗಟೆ. ಮಸಾಲೆ ಚಹಾ, ಪುಲಾವ್ ಮತ್ತು ಹಬ್ಬದ ಪಾಯಸಕ್ಕೆ ಶ್ರೀಮಂತ ಸ್ವಾದ ನೀಡುತ್ತದೆ.',
      hi: 'धीमी मिठास और भीनी खुशबू से भरी दालचीनी, जो कड़क चाय और शाही बिरयानी में लाती है नवाबी अंदाज।',
      ta: 'மசாலா டீ மற்றும் பிரியாணிக்கு இனிமையான நறுமணம் சேர்க்கும் பட்டை.'
    },
    culinaryUse: {
      en: 'Steaming masala chai, aromatic biryani, pulao & kheer',
      kn: 'ಘಮಘಮಿಸುವ ಮಸಾಲೆ ಚಹಾ, ಬಿರಿಯಾನಿ ಮತ್ತು ಹಬ್ಬದ ಪಾಯಸ',
      hi: 'कड़क मसाला चाय, पुलाव और मीठे शाही पकवान',
      ta: 'மசாலா டீ, பிரியாணி மற்றும் இனிப்பு வகைகள்'
    },
    healthBenefit: {
      en: 'Supports healthy metabolism & natural cardiovascular wellness',
      kn: 'ರಕ್ತದಲ್ಲಿನ ಸಕ್ಕರೆ ನಿಯಂತ್ರಣ ಮತ್ತು ಹೃದಯದ ಆರೋಗ್ಯಕ್ಕೆ ಹಿತಕರ',
      hi: 'रक्त शर्करा को संतुलित रखने में सहायक',
      ta: 'ரத்த சர்க்கரை அளவை சமன் செய்யும் இயற்கை மூலிகை'
    },
    startTime: 18,
    endTime: 23.5,
    accentColor: '#8C3D18',
    accentBg: 'rgba(140, 61, 24, 0.08)',
    badge: {
      en: 'True Quills • Single-Origin',
      kn: 'ಅಪ್ಪಟ ಮರದ ಶುದ್ಧ ತೊಗಟೆ',
      hi: 'शुद्ध प्राकृतिक छाल',
      ta: 'தூய நறுமணப் பட்டை'
    },
    tag: 'Warm Aromatic'
  },
  {
    id: 'cardamom',
    name: {
      en: 'Green Cardamom & Royal Cloves',
      kn: 'ಹಸಿರು ಏಲಕ್ಕಿ ಮತ್ತು ಲವಂಗ',
      hi: 'हरी इलायची और शाही लौंग',
      ta: 'ஏலக்காய் & கிராம்பு'
    },
    kannadaScript: 'ಏಲಕ್ಕಿ & ಲವಂಗ',
    characterTitle: {
      en: 'The Royal Kitchen Guardians',
      kn: 'ರಾಜ ಸುವಾಸನೆಯ ಅಧಿಪತಿಗಳು',
      hi: 'शाही रसोई के रक्षक',
      ta: 'நறுமணப் பாதுகாவலர்கள்'
    },
    description: {
      en: 'Aromatic nobility standing proud amidst kitchen steam. Plump green cardamom pods and intensely fragrant whole cloves for unforgettable feasts.',
      kn: 'ಹಸಿರು ಘಮಘಮಿಸುವ ಏಲಕ್ಕಿ ಮತ್ತು ಪರಿಶುದ್ಧ ಲವಂಗ. ಹಬ್ಬದ ಸಿಹಿ ತಿಂಡಿಗಳಿಗೆ ಮತ್ತು ವಿಶೇಷ ಅಡುಗೆಗಳಿಗೆ ಸಾಟಿಯಿಲ್ಲದ ರಾಜ ವೈಭವದ ಸುವಾಸನೆ.',
      hi: 'हरी सुगंधित इलायची और गुणकारी लौंग, जो हर उत्सव और दावत में भरते हैं शाही ताजगी व स्वाद।',
      ta: 'பண்டிகை இனிப்புகள் மற்றும் சிறப்பு சமையலுக்கு ராஜ கம்பீர நறுமணம் தரும் ஏலக்காய் மற்றும் கிராம்பு.'
    },
    culinaryUse: {
      en: 'Festive payasam, mysore pak, rich curries & dum pulao',
      kn: 'ಪಾಯಸ, ಮೈಸೂರು ಪಾಕ್, ವಿಶೇಷ ಸಾಂಬಾರು ಮತ್ತು ದಮ್ ಪಲಾವ್',
      hi: 'खीर, हलवा, मिठाइयां और शाही ग्रेवी',
      ta: 'பாயாசம், இனிப்புகள் மற்றும் அசைவ சமையல்'
    },
    healthBenefit: {
      en: 'Instant natural breath freshener, throat soother & antioxidant',
      kn: 'ಬಾಯಿಯ ದುರ್ವಾಸನೆ ನಿವಾರಣೆ, ಗಂಟಲಿನ ಹಿತ ಮತ್ತು ರೋಗನಿರೋಧಕ',
      hi: 'मुख शुद्धि, गले की खराश में राहत और एंटीऑक्सीडेंट',
      ta: 'தொண்டை இதம் மற்றும் உடலுக்கு புத்துணர்ச்சி'
    },
    startTime: 24,
    endTime: 31,
    accentColor: '#3B6B38',
    accentBg: 'rgba(59, 107, 56, 0.08)',
    badge: {
      en: 'Queen of Fragrances',
      kn: 'ಸುಗಂಧಗಳ ಮಹಾರಾಣಿ',
      hi: 'सुगंध की महारानी',
      ta: 'நறுமணங்களின் ராணி'
    },
    tag: 'Royal Signature'
  }
];

export const SpiceTransformationSection: React.FC<SpiceTransformationSectionProps> = ({
  customVideoUrl
}) => {
  const { language } = useLanguage();

  // Local language selection for this showcase (defaults to site language)
  const [selectedLang, setSelectedLang] = useState<SupportedLang>(() => {
    return (language as SupportedLang) || 'en';
  });

  // Keep synced if site language changes
  useEffect(() => {
    if (language === 'kn' || language === 'en') {
      setSelectedLang(language as SupportedLang);
    }
  }, [language]);

  // Video state management
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  // Volume must be MUTED strictly by default as requested!
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(31);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);

  // Custom Video URL state (supports localStorage so pasted URL persists)
  const defaultVideo = '/videos/spice-animated-story.mp4';
  const [videoUrl, setVideoUrl] = useState<string>(() => {
    if (customVideoUrl) return customVideoUrl;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('indima_custom_spice_video');
      if (stored) return stored;
    }
    return defaultVideo;
  });

  const [isUrlModalOpen, setIsUrlModalOpen] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [urlSavedMessage, setUrlSavedMessage] = useState<boolean>(false);

  // Find active chapter based on video current time
  const activeChapter = useMemo(() => {
    const found = SPICE_CHAPTERS.find(
      (c) => currentTime >= c.startTime && currentTime <= c.endTime
    );
    return found || SPICE_CHAPTERS[activeChapterIndex] || SPICE_CHAPTERS[0];
  }, [currentTime, activeChapterIndex]);

  // Update chapter index when current time moves
  useEffect(() => {
    const idx = SPICE_CHAPTERS.findIndex(
      (c) => currentTime >= c.startTime && currentTime <= c.endTime
    );
    if (idx !== -1 && idx !== activeChapterIndex) {
      setActiveChapterIndex(idx);
    }
  }, [currentTime, activeChapterIndex]);

  // Video event handlers
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const jumpToChapter = (chapter: SpiceChapter, index: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = chapter.startTime;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
    setActiveChapterIndex(index);
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleSaveVideoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    const trimmed = inputUrl.trim();
    setVideoUrl(trimmed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('indima_custom_spice_video', trimmed);
    }
    setUrlSavedMessage(true);
    setTimeout(() => {
      setUrlSavedMessage(false);
      setIsUrlModalOpen(false);
    }, 1200);
  };

  const handleResetVideoUrl = () => {
    setVideoUrl(defaultVideo);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('indima_custom_spice_video');
    }
    setInputUrl('');
    setIsUrlModalOpen(false);
  };

  // Language display labels
  const langLabels: { code: SupportedLang; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
  ];

  return (
    <section
      ref={containerRef}
      id="spice-video-experience"
      className="relative w-full bg-[#FAF5EB] text-[#2C1810] py-14 sm:py-24 px-3.5 sm:px-6 lg:px-8 overflow-hidden select-none"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 30%, rgba(255, 253, 249, 0.99) 0%, rgba(250, 245, 235, 0.98) 85%)'
      }}
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#993300]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-20 max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#FFF2DE] border border-[#DFC7A2] rounded-full text-xs font-bold text-[#993300] mb-3 tracking-wide uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#993300]" />
            <span>
              {selectedLang === 'kn'
                ? 'ಸಜೀವ ಮಸಾಲೆಗಳ ಕಥೆ • ಅನಿಮೇಷನ್ ಅನುಭವ'
                : selectedLang === 'hi'
                ? 'जीवंत मसालों की कहानी • एनिमेटेड अनुभव'
                : selectedLang === 'ta'
                ? 'உயிருள்ள மசாலா கதை • அனிமேஷன்'
                : 'Living Spice World • Animated Film'}
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#2C1810] tracking-tight leading-tight">
            {selectedLang === 'kn' ? (
              <>
                ಪ್ರಕೃತಿಯ ಸುವಾಸನೆಗೆ{' '}
                <span className="text-[#993300]">ಜೀವ ತುಂಬಿದ</span> ಅಪ್ಪಟ ಮಸಾಲೆಗಳು
              </>
            ) : selectedLang === 'hi' ? (
              <>
                रसोई के हर मसाले में{' '}
                <span className="text-[#993300]">जीवंत स्वाद</span> और परंपरा
              </>
            ) : selectedLang === 'ta' ? (
              <>
                இயற்கையின் நறுமணத்தில்{' '}
                <span className="text-[#993300]">உயிரோட்டமான</span> பாரம்பரியம்
              </>
            ) : (
              <>
                Meet the Soul of Our Spices:{' '}
                <span className="text-[#993300]">Pure, Alive & Aromatic</span>
              </>
            )}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#6B4E3D] max-w-2xl mx-auto font-normal leading-relaxed">
            {selectedLang === 'kn'
              ? 'ಗರಂ ಮಸಾಲ, ಬಂಗಾರದ ಅರಿಶಿನ, ಒಗ್ಗರಣೆ ಜೀರಿಗೆ, ದಾಲ್ಚಿನ್ನಿ ಹಾಗೂ ಏಲಕ್ಕಿ — ನಮ್ಮ ಅಪ್ಪಟ ಮಸಾಲೆ ಪಾತ್ರಗಳು ನಿಮ್ಮ ಅಡುಗೆಮನೆಗೆ ತರುವ ಸ್ವಾದದ ಝಲಕ್ ನೋಡಿ.'
              : selectedLang === 'hi'
              ? 'गरम मसाला, सुनहरी हल्दी, चटकता जीरा, सुगंधित दालचीनी और शाही इलायची — देखिए कैसे ये मसाले लाते हैं जादुई स्वाद।'
              : selectedLang === 'ta'
              ? 'கரம் மசாலா, தூய மஞ்சள், சீரகம், பட்டை மற்றும் ஏலக்காய் — பாரம்பரிய சமையலின் அசல் நறுமணத்தை அனுபவியுங்கள்.'
              : 'Watch each animated spice character come to life — from bubbling earthenware handis to sizzling tadka pans. Click any spice below to explore in detail.'}
          </p>

          {/* Multilingual Switcher Header Bar */}
          <div className="mt-6 inline-flex items-center bg-[#FFFDF9] border border-[#DFC7A2] rounded-full p-1 shadow-xs">
            <span className="text-[11px] font-bold text-[#8C7667] px-3 uppercase tracking-wider hidden xs:inline">
              Language:
            </span>
            {langLabels.map((l) => (
              <button
                key={l.code}
                onClick={() => setSelectedLang(l.code)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
                  selectedLang === l.code
                    ? 'bg-[#993300] text-white shadow-xs font-bold scale-102'
                    : 'text-[#6B4E3D] hover:bg-[#FAF3E0]'
                }`}
              >
                {l.native}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Chapter Selector Pills (Synchronized with video timestamps) */}
        <div className="flex items-center justify-start sm:justify-center space-x-2 sm:space-x-3 mb-8 overflow-x-auto pb-2 scrollbar-none px-2">
          {SPICE_CHAPTERS.map((chap, idx) => {
            const isActive = activeChapterIndex === idx;
            return (
              <button
                key={chap.id}
                onClick={() => jumpToChapter(chap, idx)}
                className={`flex-shrink-0 flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
                  isActive
                    ? 'bg-[#993300] text-white border-[#993300] shadow-md scale-105'
                    : 'bg-[#FFFDF9] text-[#5C4535] border-[#E8DFD3] hover:border-[#DFC7A2] hover:bg-[#FAF3E0]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: isActive ? '#FFFFFF' : chap.accentColor
                  }}
                />
                <span>{chap.name[selectedLang]}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-[#8C7667]'
                  }`}
                >
                  {Math.floor(chap.startTime)}s
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Presentation Layout: Video Player + Rich Multilingual Story Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* LEFT: 9:16 Cinematic Video Player Box (Occupies 5 columns on desktop, centered) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#DFC7A2] bg-[#1A0E08] group">
              {/* HTML5 Video Element: Muted by default strictly */}
              <video
                ref={videoRef}
                src={videoUrl}
                poster="/spice_animation_poster.jpg"
                muted={isMuted}
                autoPlay
                loop
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                className="w-full h-[520px] sm:h-[580px] object-cover cursor-pointer select-none"
              />

              {/* Top Video Overlay: Muted Status Pill + Paste Video URL button */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
                {/* Volume Status Badge */}
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/80 transition shadow-sm border border-white/20"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-red-300" />
                      <span className="text-[11px]">
                        {selectedLang === 'kn' ? 'ಧ್ವನಿ ಮ್ಯೂಟ್ ಆಗಿದೆ' : 'Muted (Click to hear)'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span className="text-[11px]">
                        {selectedLang === 'kn' ? 'ಧ್ವನಿ ಚಾಲನೆಯಲ್ಲಿದೆ' : 'Audio ON'}
                      </span>
                    </>
                  )}
                </button>

                {/* Paste / Replace Video Link Button */}
                <button
                  onClick={() => setIsUrlModalOpen(true)}
                  aria-label="Paste custom video link"
                  title="Paste or change video URL"
                  className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition border border-white/20"
                >
                  <Link2 className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>

              {/* Play / Pause Large Center Indicator (on pause) */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer z-10"
                >
                  <div className="w-16 h-16 rounded-full bg-[#993300]/90 text-white flex items-center justify-center shadow-2xl transform scale-110 transition">
                    <Play className="w-8 h-8 ml-1" />
                  </div>
                </div>
              )}

              {/* Active Character Overlay Tag at bottom of video */}
              <div className="absolute bottom-16 left-3 right-3 z-20 pointer-events-none">
                <div className="bg-black/65 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white shadow-lg">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-amber-300 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      {activeChapter.tag}
                    </span>
                    <span className="text-[10px] text-stone-300 font-mono">
                      {Math.floor(currentTime)}s / {Math.floor(duration)}s
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-white truncate">
                    {activeChapter.name[selectedLang]}
                  </h4>
                  <p className="text-[11px] text-stone-200 line-clamp-1 italic font-light">
                    {activeChapter.characterTitle[selectedLang]}
                  </p>
                </div>
              </div>

              {/* Bottom Video Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 flex flex-col space-y-2">
                {/* Timeline Progress Scrubber */}
                <div className="relative w-full flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={duration || 31}
                    step="0.1"
                    value={currentTime}
                    onChange={handleScrubberChange}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#E5A93C]"
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={togglePlay}
                      className="p-1.5 hover:text-amber-300 transition"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={restartVideo}
                      className="p-1.5 hover:text-amber-300 transition"
                      aria-label="Restart"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-1.5 hover:text-amber-300 transition"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-red-300" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-emerald-300" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleFullscreen}
                    className="p-1.5 hover:text-amber-300 transition"
                    aria-label="Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick helper note under player */}
            <p className="text-[11px] text-[#8C7667] mt-3 text-center">
              {selectedLang === 'kn'
                ? 'ವೀಡಿಯೊ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮ್ಯೂಟ್ ಆಗಿ ಚಾಲನೆಗೊಳ್ಳುತ್ತದೆ. ಧ್ವನಿ ಕೇಳಲು "Muted" ಬಟನ್ ಒತ್ತಿರಿ.'
                : 'Video plays muted automatically. Tap the speaker icon anytime to unmute.'}
            </p>
          </div>

          {/* RIGHT: Multilingual Editorial Spice Explanation Suite (Occupies 7 columns on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            {/* Active Spice Hero Card */}
            <div
              className="bg-[#FFFDF9] border-2 rounded-3xl p-5 sm:p-8 shadow-lg transition-all duration-300 relative overflow-hidden"
              style={{
                borderColor: activeChapter.accentColor
              }}
            >
              {/* Background Accent Gradient Tint */}
              <div
                className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[80px] pointer-events-none opacity-40"
                style={{ backgroundColor: activeChapter.accentColor }}
              />

              {/* Card Header: Badge + Kannada script watermark */}
              <div className="relative z-10 flex items-center justify-between mb-4">
                <span
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-xs"
                  style={{ backgroundColor: activeChapter.accentColor }}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{activeChapter.badge[selectedLang]}</span>
                </span>

                <span className="font-serif text-lg sm:text-2xl font-bold text-[#8C7667]/30 select-none">
                  {activeChapter.kannadaScript}
                </span>
              </div>

              {/* Spice Title */}
              <div className="relative z-10 mb-3">
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2C1810] tracking-tight">
                  {activeChapter.name[selectedLang]}
                </h3>
                <p className="text-xs sm:text-sm font-serif italic text-[#8B3214] mt-0.5">
                  {activeChapter.characterTitle[selectedLang]}
                </p>
              </div>

              {/* Core Editorial Description */}
              <p className="relative z-10 text-sm sm:text-base text-[#4A3223] leading-relaxed font-normal mb-6">
                {activeChapter.description[selectedLang]}
              </p>

              {/* Dual Culinary & Health Highlights Bento */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#E8DFD3]">
                {/* Culinary Tradition Pod */}
                <div className="p-3.5 rounded-2xl bg-[#FAF5EB] border border-[#E8DFD3] flex items-start space-x-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-xs mt-0.5"
                    style={{ backgroundColor: activeChapter.accentColor }}
                  >
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-[#8C7667] uppercase tracking-wider">
                      {selectedLang === 'kn'
                        ? 'ಅಡುಗೆಯ ಬಳಕೆ'
                        : selectedLang === 'hi'
                        ? 'रसोई में उपयोग'
                        : selectedLang === 'ta'
                        ? 'சமையல் பயன்பாடு'
                        : 'Culinary Craft'}
                    </h5>
                    <p className="text-xs sm:text-sm text-[#2C1810] font-medium mt-0.5 leading-snug">
                      {activeChapter.culinaryUse[selectedLang]}
                    </p>
                  </div>
                </div>

                {/* Health & Ayurveda Pod */}
                <div className="p-3.5 rounded-2xl bg-[#FAF5EB] border border-[#E8DFD3] flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center flex-shrink-0 text-white shadow-xs mt-0.5">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-[#8C7667] uppercase tracking-wider">
                      {selectedLang === 'kn'
                        ? 'ಆರೋಗ್ಯ ಪ್ರಯೋಜನ'
                        : selectedLang === 'hi'
                        ? 'स्वास्थ्य लाभ'
                        : selectedLang === 'ta'
                        ? 'ஆரோக்கிய நன்மை'
                        : 'Health & Wellness'}
                    </h5>
                    <p className="text-xs sm:text-sm text-[#2C1810] font-medium mt-0.5 leading-snug">
                      {activeChapter.healthBenefit[selectedLang]}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Action: Scroll to Store Catalogue */}
              <div className="relative z-10 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E8DFD3]">
                <div className="flex items-center space-x-2 text-xs text-[#6B4E3D]">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>
                    {selectedLang === 'kn'
                      ? '೧೦೦% ಕೃತಕ ಬಣ್ಣ ಹಾಗೂ ಪ್ರಿಸರ್ವೇಟಿವ್ ರಹಿತ'
                      : '100% Free from artificial colours & preservatives'}
                  </span>
                </div>

                <a
                  href="#products-section"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold text-white transition-all duration-200 shadow-md hover:scale-103"
                  style={{ backgroundColor: activeChapter.accentColor }}
                >
                  <span>
                    {selectedLang === 'kn'
                      ? 'ಈ ಮಸಾಲೆಯನ್ನು ಖರೀದಿಸಿ'
                      : selectedLang === 'hi'
                      ? 'यह मसाला खरीदें'
                      : selectedLang === 'ta'
                      ? 'இந்த மசாலாவை வாங்கவும்'
                      : 'Shop This Spice'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Carousel / Switcher Bar of all 5 spice characters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {SPICE_CHAPTERS.map((chap, idx) => {
                const isSelected = activeChapterIndex === idx;
                return (
                  <button
                    key={chap.id}
                    onClick={() => jumpToChapter(chap, idx)}
                    className={`p-2.5 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#FFFDF9] border-2 shadow-sm scale-102'
                        : 'bg-[#FAF3E0]/70 border-[#E8DFD3] hover:bg-[#FAF3E0] hover:border-[#DFC7A2]'
                    }`}
                    style={{
                      borderColor: isSelected ? chap.accentColor : undefined
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: chap.accentColor }}
                      />
                      <span className="text-[10px] font-mono text-[#8C7667]">
                        {Math.floor(chap.startTime)}s
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#2C1810] line-clamp-1">
                      {chap.name[selectedLang]}
                    </span>
                    <span className="text-[10px] text-[#8C7667] line-clamp-1 mt-0.5">
                      {chap.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Paste Video URL Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] border border-[#DFC7A2] rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-[#2C1810]">
            <h4 className="font-serif text-xl font-bold text-[#2C1810] mb-2 flex items-center space-x-2">
              <Link2 className="w-5 h-5 text-[#993300]" />
              <span>Paste Custom Video Link</span>
            </h4>
            <p className="text-xs text-[#6B4E3D] mb-4">
              Enter any direct MP4 link (Cloudinary, AWS S3, Render, or CDN). The video will
              replace the player immediately and stay muted by default.
            </p>

            <form onSubmit={handleSaveVideoUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3223] uppercase tracking-wider mb-1">
                  Video URL:
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/spices-video.mp4"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFC7A2] bg-[#FAF5EB] text-sm text-[#2C1810] focus:outline-hidden focus:ring-2 focus:ring-[#993300]"
                  required
                />
              </div>

              {urlSavedMessage && (
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Video URL updated successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetVideoUrl}
                  className="text-xs text-[#8C7667] hover:text-[#993300] underline font-medium"
                >
                  Reset to default video
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsUrlModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-[#DFC7A2] text-xs font-semibold text-[#6B4E3D] hover:bg-[#FAF3E0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#993300] text-xs font-bold text-white hover:bg-[#7A2800] shadow-sm"
                  >
                    Apply Video
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
