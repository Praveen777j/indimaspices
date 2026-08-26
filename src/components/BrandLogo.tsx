import React, { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'light' | 'dark' | 'transparent';
  customUrl?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  variant = 'light',
  customUrl
}) => {
  const [imgError, setImgError] = useState(false);

  // Height mappings for different contexts
  const sizeClasses = {
    sm: 'h-10 sm:h-12 w-auto max-w-[120px] sm:max-w-[140px]',
    md: 'h-12 sm:h-14 w-auto max-w-[140px] sm:max-w-[165px]',
    lg: 'h-16 sm:h-20 w-auto max-w-[180px] sm:max-w-[220px]',
    xl: 'h-24 sm:h-32 w-auto max-w-[260px] sm:max-w-[320px]'
  };

  const containerBg = variant === 'dark' 
    ? 'bg-[#2A1E17] border-[#4A382A]' 
    : 'bg-white border-[#E8DFD3] shadow-xs';

  const logoSrc = customUrl && !imgError ? customUrl : '/indima-logo.svg';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {!imgError ? (
        <img
          src={logoSrc}
          alt="Indima Spice Co. - Pure as mother's love"
          className={`${sizeClasses[size]} object-contain rounded-xl p-1 ${containerBg} border transition-transform duration-200 hover:scale-105`}
          onError={() => setImgError(true)}
        />
      ) : (
        /* Crisp High-Definition Vector Fallback of the exact Ki Spices + Indima Tricolor Logo */
        <div className={`p-1.5 rounded-xl border ${containerBg} inline-flex items-center justify-center`}>
          <svg
            viewBox="0 0 500 580"
            className={`${sizeClasses[size]} w-auto`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="goldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="35%" stopColor="#D97706" />
                <stop offset="70%" stopColor="#92400E" />
                <stop offset="100%" stopColor="#FEF08A" />
              </linearGradient>
              <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
              <linearGradient id="saffronWave" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF9933" />
                <stop offset="50%" stopColor="#FF6600" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>
              <linearGradient id="emeraldWave" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#138808" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#064E3B" />
              </linearGradient>
              <linearGradient id="royalBlue3D" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="50%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>

            {/* Top Diamond 'ki Spices' Logo */}
            <g transform="translate(250, 100)">
              <rect
                x="-70"
                y="-70"
                width="140"
                height="140"
                rx="16"
                transform="rotate(45)"
                fill="#FFFFFF"
                stroke="url(#goldBorderGrad)"
                strokeWidth="6"
              />
              <text
                x="-10"
                y="12"
                fontFamily="'Arial Black', 'Trebuchet MS', sans-serif"
                fontSize="56"
                fontWeight="900"
                fill="#111827"
                textAnchor="middle"
              >
                k
              </text>
              <g transform="translate(18, -12)">
                <circle cx="0" cy="-10" r="7.5" fill="#111827" />
                <rect x="-4.5" y="0" width="9" height="28" rx="4.5" fill="#111827" />
              </g>
              <text
                x="0"
                y="40"
                fontFamily="'Georgia', serif"
                fontSize="22"
                fontWeight="bold"
                fill="#1F2937"
                textAnchor="middle"
              >
                Spices
              </text>
              <path d="M -32 48 Q 0 56 32 48 Q 5 52 -32 48" fill="url(#goldTextGrad)" />
            </g>

            {/* Saffron Upper Ribbon Band */}
            <g transform="translate(40, 220)">
              <path d="M 0 35 Q 210 -15 420 20 L 420 52 Q 210 12 0 57 Z" fill="url(#saffronWave)" />
              <path d="M 0 45 Q 210 5 420 30 L 420 42 Q 210 15 0 52 Z" fill="#FEF08A" opacity="0.6" />
            </g>

            {/* Main 'indimā' Hindi-English Fusion Typography */}
            <g transform="translate(250, 335)" textAnchor="middle">
              <rect
                x="-175"
                y="-42"
                width="350"
                height="11"
                rx="5"
                fill="url(#royalBlue3D)"
                stroke="url(#goldBorderGrad)"
                strokeWidth="1.5"
              />
              <path
                d="M -152 -42 L -137 -66 L -122 -42 Z"
                fill="url(#royalBlue3D)"
                stroke="url(#goldBorderGrad)"
                strokeWidth="1.5"
              />
              <path
                d="M 12 -42 L 27 -66 L 42 -42 Z"
                fill="url(#royalBlue3D)"
                stroke="url(#goldBorderGrad)"
                strokeWidth="1.5"
              />
              <circle cx="132" cy="-62" r="6.5" fill="url(#royalBlue3D)" stroke="url(#goldBorderGrad)" strokeWidth="1.5" />
              <path
                d="M 112 -52 Q 132 -36 152 -52 Q 132 -44 112 -52"
                fill="url(#royalBlue3D)"
                stroke="url(#goldBorderGrad)"
                strokeWidth="1.5"
              />
              <text
                x="0"
                y="26"
                fontFamily="'Arial Rounded MT Bold', 'Trebuchet MS', sans-serif"
                fontSize="84"
                fontWeight="900"
                fill="url(#royalBlue3D)"
                stroke="url(#goldBorderGrad)"
                strokeWidth="2.5"
                letterSpacing="2"
              >
                indimā
              </text>
            </g>

            {/* Subtitle Tagline: Pure as mother's love */}
            <g transform="translate(250, 396)" textAnchor="middle">
              <line x1="-190" y1="0" x2="-130" y2="0" stroke="url(#goldTextGrad)" strokeWidth="2.5" />
              <text
                x="0"
                y="5"
                fontFamily="'Brush Script MT', 'Lucida Calligraphy', cursive, Georgia, serif"
                fontSize="30"
                fontStyle="italic"
                fontWeight="bold"
                fill="#1E3A8A"
              >
                Pure as mother's love
              </text>
              <line x1="130" y1="0" x2="190" y2="0" stroke="url(#goldTextGrad)" strokeWidth="2.5" />
            </g>

            {/* Emerald Green Lower Ribbon Band */}
            <g transform="translate(40, 425)">
              <path d="M 0 20 Q 210 65 420 25 L 420 57 Q 210 97 0 47 Z" fill="url(#emeraldWave)" />
              <path d="M 0 30 Q 210 75 420 35 L 420 44 Q 210 82 0 40 Z" fill="#A7F3D0" opacity="0.6" />
            </g>
          </svg>
        </div>
      )}

      {showTagline && (
        <div className="ml-3 hidden sm:block">
          <p className="font-serif text-lg font-bold tracking-tight text-[#1F1610]">
            Indima Spice Co.
          </p>
          <p className="text-[11px] text-[#7A6455] font-serif italic">
            Pure as mother's love • Bengaluru
          </p>
        </div>
      )}
    </div>
  );
};
