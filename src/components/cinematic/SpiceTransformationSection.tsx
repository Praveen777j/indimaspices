import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Sparkles,
  Flame,
  ShieldCheck,
  Heart,
  ArrowRight
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
  image: string;
  powderImage: string;
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
    endTime: 6,
    accentColor: '#993300',
    accentBg: 'rgba(153, 51, 0, 0.08)',
    badge: {
      en: 'Stone-Ground Master Blend',
      kn: 'ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಅಪ್ಪಟ ಮಿಶ್ರಣ',
      hi: 'पत्थर से पिसा शुद्ध मिश्रण',
      ta: 'பாரம்பரிய கைக்குத்தல் முறை'
    },
    tag: 'Handcrafted',
    image: '/spice_animation_poster.jpg',
    powderImage: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80'
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
    endTime: 12,
    accentColor: '#D48806',
    accentBg: 'rgba(212, 136, 6, 0.08)',
    badge: {
      en: 'High Natural Curcumin',
      kn: 'ಹೆಚ್ಚಿನ ನೈಸರ್ಗಿಕ ಕರ್ಕ್ಯುಮಿನ್',
      hi: 'उच्च प्राकृतिक करक्यूमिन',
      ta: 'இயற்கை குர்குமின் நிறைந்தது'
    },
    tag: 'Pure Immunity',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
    powderImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'
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
    endTime: 18,
    accentColor: '#7A4A28',
    accentBg: 'rgba(122, 74, 40, 0.08)',
    badge: {
      en: 'Golden Harvest Seeds',
      kn: 'ಸುವಾಸನಾಭರಿತ ಅಪ್ಪಟ ಕಾಳು',
      hi: 'स्वादिष्ट सुनहरे बीज',
      ta: 'பாரம்பரிய நறுமண விதை'
    },
    tag: 'Tadka Essential',
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80',
    powderImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80'
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
      hi: 'ಕಡಕ್ ಮಸಾಲಾ ಚಾಯ್, ಪುಲಾವ್ ಮತ್ತು ಸಿಹಿ ಖಾದ್ಯಗಳು',
      ta: 'மசாலா டீ, பிரியாணி மற்றும் இனிப்பு வகைகள்'
    },
    healthBenefit: {
      en: 'Supports healthy metabolism & natural cardiovascular wellness',
      kn: 'ರಕ್ತದಲ್ಲಿನ ಸಕ್ಕರೆ ನಿಯಂತ್ರಣ ಮತ್ತು ಹೃದಯದ ಆರೋಗ್ಯಕ್ಕೆ ಹಿತಕರ',
      hi: 'रक्त शर्करा को संतुलित रखने में सहायक',
      ta: 'ரத்த சர்க்கரை அளவை சமன் செய்யும் இயற்கை மூலிகை'
    },
    startTime: 18,
    endTime: 24,
    accentColor: '#8C3D18',
    accentBg: 'rgba(140, 61, 24, 0.08)',
    badge: {
      en: 'True Quills • Single-Origin',
      kn: 'ಅಪ್ಪಟ ಮರದ ಶುದ್ಧ ತೊಗಟೆ',
      hi: 'शुद्ध प्राकृतिक छाल',
      ta: 'தூய நறுமணப் பட்டை'
    },
    tag: 'Warm Aromatic',
    image: 'https://images.unsplash.com/photo-1509358742462-184cf434e38e?w=800&auto=format&fit=crop&q=80',
    powderImage: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=800&auto=format&fit=crop&q=80'
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
    tag: 'Royal Signature',
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800&auto=format&fit=crop&q=80',
    powderImage: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80'
  }
];

// Slow and graceful transition: exactly 6 seconds per spice (> 5 seconds as explicitly requested)
const TRANSITION_DURATION_MS = 6000;

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

  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);

  // Custom Video URL state (supports admin uploaded video or stored URL)
  const defaultVideo = '/videos/spice-animated-story.mp4';
  const [videoUrl, setVideoUrl] = useState<string>(() => {
    if (customVideoUrl) return customVideoUrl;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('indima_custom_spice_video');
      if (stored) return stored;
    }
    return defaultVideo;
  });

  // Sync when customVideoUrl from props/admin updates
  useEffect(() => {
    if (customVideoUrl) {
      setVideoUrl(customVideoUrl);
    }
  }, [customVideoUrl]);

  // Active chapter always resolves to a valid spice
  const activeChapter = useMemo(() => {
    return SPICE_CHAPTERS[activeChapterIndex] || SPICE_CHAPTERS[0];
  }, [activeChapterIndex]);

  // Ensure video loads and plays continuously whenever videoUrl is set or mounted
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;

    // Explicitly load the media source so uploaded videos never stay fixed or stuck
    try {
      video.load();
    } catch (_) {}

    const playVideo = () => {
      if (video.paused) {
        const p = video.play();
        if (p !== undefined) {
          p.catch(() => {});
        }
      }
    };

    playVideo();

    // Re-verify playback on user scroll or interaction
    const handleActivity = () => {
      playVideo();
    };

    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('click', handleActivity, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [videoUrl]);

  // Slow, relaxing transition: each spice stays for at least 6 seconds (> 5 seconds as requested)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveChapterIndex((prev) => (prev + 1) % SPICE_CHAPTERS.length);
    }, TRANSITION_DURATION_MS);

    return () => clearInterval(timer);
  }, [activeChapterIndex]);

  // Jump to specific spice when user taps pills or cards
  const jumpToChapter = (chapter: SpiceChapter, index: number) => {
    setActiveChapterIndex(index);
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
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

        {/* Quick Chapter Selector Pills (Synchronized with slow 6-second cadence) */}
        <div className="flex items-center justify-start sm:justify-center space-x-2 sm:space-x-3 mb-8 overflow-x-auto pb-2 scrollbar-none px-2">
          {SPICE_CHAPTERS.map((chap, idx) => {
            const isActive = activeChapterIndex === idx;
            return (
              <button
                key={chap.id}
                onClick={() => jumpToChapter(chap, idx)}
                className={`flex-shrink-0 flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-500 border ${
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
              </button>
            );
          })}
        </div>

        {/* Main Presentation Layout: Video Player + Rich Multilingual Story & Pictures Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* LEFT: 9:16 Cinematic Video Player Box (Autonomous continuous play, strictly no user pause/volume options) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#DFC7A2] bg-[#1A0E08] group">
              {/* HTML5 Video Element: With key={videoUrl} so uploaded videos immediately load and play smoothly */}
              <video
                key={videoUrl}
                ref={videoRef}
                src={videoUrl}
                poster="/spice_animation_poster.jpg"
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                onCanPlay={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = true;
                    videoRef.current.play().catch(() => {});
                  }
                }}
                onLoadedData={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = true;
                    videoRef.current.play().catch(() => {});
                  }
                }}
                className="w-full h-[520px] sm:h-[580px] object-cover select-none pointer-events-none"
              />

              {/* Top Overlay: Active spice badge */}
              <div className="absolute top-3 left-3 z-20 pointer-events-auto">
                {/* Active Spice indicator pill */}
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold shadow-sm border border-white/20 transition-all duration-700">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: activeChapter.accentColor }}
                  />
                  <span className="text-[11px] font-medium tracking-wide">
                    {activeChapter.name[selectedLang]}
                  </span>
                </div>
              </div>

              {/* Active Character Overlay Tag at bottom of video */}
              <div className="absolute bottom-12 left-3 right-3 z-20 pointer-events-none">
                <div className="bg-black/75 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white shadow-lg transition-all duration-700">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-amber-300 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      {activeChapter.tag}
                    </span>
                    <span className="text-[10px] text-amber-200/90 font-mono">
                      {activeChapterIndex + 1} / {SPICE_CHAPTERS.length}
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

              {/* Continuous Playback Multi-Spice Segment Progress Bar */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
                <div className="flex items-center space-x-1.5 w-full">
                  {SPICE_CHAPTERS.map((chap, idx) => {
                    const isPassed = activeChapterIndex > idx;
                    const isCurrent = activeChapterIndex === idx;
                    return (
                      <div
                        key={chap.id}
                        className="h-1.5 flex-1 rounded-full overflow-hidden bg-white/25 transition-all duration-500"
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-in-out"
                          style={{
                            width: isPassed ? '100%' : isCurrent ? '100%' : '0%',
                            backgroundColor: isCurrent ? chap.accentColor : '#E5A93C'
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Multilingual Editorial Spice Explanation Suite with Pictures Showcase */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            {/* Active Spice Hero Card (Smooth 700ms transition) */}
            <div
              className="bg-[#FFFDF9] border-2 rounded-3xl p-5 sm:p-7 shadow-lg transition-all duration-700 ease-in-out relative overflow-hidden"
              style={{
                borderColor: activeChapter.accentColor
              }}
            >
              {/* Background Accent Gradient Tint */}
              <div
                className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[80px] pointer-events-none opacity-30 transition-all duration-700"
                style={{ backgroundColor: activeChapter.accentColor }}
              />

              {/* Card Header: Badge + Kannada script watermark */}
              <div className="relative z-10 flex items-center justify-between mb-4">
                <span
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-colors duration-700"
                  style={{ backgroundColor: activeChapter.accentColor }}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{activeChapter.badge[selectedLang]}</span>
                </span>

                <span className="font-serif text-lg sm:text-2xl font-bold text-[#8C7667]/40 select-none transition-all duration-700">
                  {activeChapter.kannadaScript}
                </span>
              </div>

              {/* Active Spice Picture Showcase Gallery (Whole Spice & Stone Ground Powder) */}
              <div className="relative z-10 grid grid-cols-2 gap-3 mb-5">
                <div className="relative rounded-2xl overflow-hidden border border-[#E8DFD3] shadow-xs group bg-[#FAF5EB] h-28 sm:h-32">
                  <img
                    key={`whole-${activeChapter.id}`}
                    src={activeChapter.image}
                    alt={activeChapter.name[selectedLang]}
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/spice_animation_poster.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-sm">
                      {selectedLang === 'kn' ? 'ಅಪ್ಪಟ ಕಾಳು ಮಸಾಲೆ' : 'Whole Raw Spice'}
                    </span>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-[#E8DFD3] shadow-xs group bg-[#FAF5EB] h-28 sm:h-32">
                  <img
                    key={`powder-${activeChapter.id}`}
                    src={activeChapter.powderImage}
                    alt={activeChapter.name[selectedLang]}
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/spice_animation_poster.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-sm">
                      {selectedLang === 'kn' ? 'ಕಲ್ಲಿನಿಂದ ಬೀಸಿದ ಪುಡಿ' : 'Stone-Ground Powder'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Spice Title */}
              <div className="relative z-10 mb-3">
                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2C1810] tracking-tight transition-all duration-700">
                  {activeChapter.name[selectedLang]}
                </h3>
                <p className="text-xs sm:text-sm font-serif italic text-[#8B3214] mt-0.5 transition-all duration-700">
                  {activeChapter.characterTitle[selectedLang]}
                </p>
              </div>

              {/* Core Editorial Description */}
              <p className="relative z-10 text-sm sm:text-base text-[#4A3223] leading-relaxed font-normal mb-5 transition-all duration-700">
                {activeChapter.description[selectedLang]}
              </p>

              {/* Dual Culinary & Health Highlights Bento */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8DFD3]">
                {/* Culinary Tradition Pod */}
                <div className="p-3 rounded-2xl bg-[#FAF5EB] border border-[#E8DFD3] flex items-start space-x-3 transition-all duration-700">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-xs mt-0.5 transition-colors duration-700"
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
                <div className="p-3 rounded-2xl bg-[#FAF5EB] border border-[#E8DFD3] flex items-start space-x-3 transition-all duration-700">
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
              <div className="relative z-10 mt-5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E8DFD3]">
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
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold text-white transition-all duration-300 shadow-md hover:scale-103"
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

            {/* Switcher Bar with photo thumbnail of all 5 spice characters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {SPICE_CHAPTERS.map((chap, idx) => {
                const isSelected = activeChapterIndex === idx;
                return (
                  <button
                    key={chap.id}
                    onClick={() => jumpToChapter(chap, idx)}
                    className={`p-2 rounded-2xl text-left transition-all duration-500 border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#FFFDF9] border-2 shadow-sm scale-102'
                        : 'bg-[#FAF3E0]/70 border-[#E8DFD3] hover:bg-[#FAF3E0] hover:border-[#DFC7A2]'
                    }`}
                    style={{
                      borderColor: isSelected ? chap.accentColor : undefined
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      <img
                        src={chap.image}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover border border-[#DFC7A2]"
                      />
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: chap.accentColor }}
                      />
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
    </section>
  );
};
