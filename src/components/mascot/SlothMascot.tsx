import React from 'react';
import { MascotState } from '../../types';

interface SlothMascotProps {
  state?: MascotState;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  showCaption?: boolean;
  captionText?: string;
}

export const SlothMascot: React.FC<SlothMascotProps> = ({
  state = 'idle',
  size = 'md',
  className = '',
  showCaption = false,
  captionText,
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
    hero: 'w-64 h-64 sm:w-80 sm:h-80',
  };

  // State-specific SVG illustrations
  const renderGraphic = () => {
    switch (state) {
      case 'idle':
        return (
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full animate-sloth-sway filter drop-shadow-sm"
          >
            {/* Tree Branch */}
            <path
              d="M10 45 Q90 55 190 40"
              stroke="#5A4632"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Leaves on branch */}
            <path d="M45 42 Q30 25 48 20 Q56 32 45 42Z" fill="#39483B" />
            <path d="M150 40 Q165 24 175 32 Q168 45 150 40Z" fill="#A6AD99" />
            <path d="M162 38 Q178 40 180 50 Q168 52 162 38Z" fill="#39483B" />

            {/* Arms hanging */}
            <path
              d="M75 50 Q65 85 85 110"
              stroke="#9B846C"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              d="M125 50 Q135 85 115 110"
              stroke="#9B846C"
              strokeWidth="15"
              strokeLinecap="round"
            />
            {/* Claws gripping branch */}
            <path d="M70 44 Q73 34 78 42" stroke="#E9E0D2" strokeWidth="4" strokeLinecap="round" />
            <path d="M76 44 Q80 34 84 42" stroke="#E9E0D2" strokeWidth="4" strokeLinecap="round" />
            <path d="M118 44 Q122 34 126 42" stroke="#E9E0D2" strokeWidth="4" strokeLinecap="round" />
            <path d="M124 44 Q128 34 132 42" stroke="#E9E0D2" strokeWidth="4" strokeLinecap="round" />

            {/* Body */}
            <ellipse cx="100" cy="120" rx="36" ry="42" fill="#9B846C" />
            {/* Soft Belly patch */}
            <ellipse cx="100" cy="125" rx="24" ry="30" fill="#BAA692" />

            {/* Back Feet */}
            <ellipse cx="82" cy="158" rx="10" ry="8" fill="#9B846C" />
            <ellipse cx="118" cy="158" rx="10" ry="8" fill="#9B846C" />
            {/* Foot Claws */}
            <path d="M78 162 L78 168" stroke="#E9E0D2" strokeWidth="3" strokeLinecap="round" />
            <path d="M82 163 L82 169" stroke="#E9E0D2" strokeWidth="3" strokeLinecap="round" />
            <path d="M118 163 L118 169" stroke="#E9E0D2" strokeWidth="3" strokeLinecap="round" />
            <path d="M122 162 L122 168" stroke="#E9E0D2" strokeWidth="3" strokeLinecap="round" />

            {/* Head */}
            <circle cx="100" cy="92" r="28" fill="#9B846C" />
            {/* Face mask cream */}
            <path
              d="M80 94 C80 80 120 80 120 94 C120 108 80 108 80 94 Z"
              fill="#E9E0D2"
            />
            {/* Eye patches brown */}
            <ellipse cx="88" cy="92" rx="6" ry="9" fill="#745C47" transform="rotate(-15 88 92)" />
            <ellipse cx="112" cy="92" rx="6" ry="9" fill="#745C47" transform="rotate(15 112 92)" />
            {/* Calm Smiling Eyes */}
            <path d="M85 92 Q88 88 91 92" stroke="#22221F" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M109 92 Q112 88 115 92" stroke="#22221F" strokeWidth="2.2" strokeLinecap="round" />
            {/* Tiny Blinking Pupils */}
            <circle cx="88" cy="92" r="1.4" fill="#22221F" className="animate-sloth-blink" />
            <circle cx="112" cy="92" r="1.4" fill="#22221F" className="animate-sloth-blink" />

            {/* Cute Rounded Snout & Nose */}
            <ellipse cx="100" cy="99" rx="6" ry="4" fill="#39483B" />
            {/* Gentle smile */}
            <path d="M96 104 Q100 108 104 104" stroke="#22221F" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'thinking':
        return (
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-sm"
          >
            {/* Soft ambient thought circle */}
            <circle cx="148" cy="46" r="14" fill="#E3E8DD" stroke="#A6AD99" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="132" cy="62" r="6" fill="#E3E8DD" />
            <circle cx="122" cy="74" r="3" fill="#E3E8DD" />
            {/* Sparkle icon inside thought */}
            <path
              d="M148 38 L150 44 L156 46 L150 48 L148 54 L146 48 L140 46 L146 44 Z"
              fill="#39483B"
            />

            {/* Body */}
            <ellipse cx="100" cy="130" rx="36" ry="40" fill="#9B846C" />
            <ellipse cx="100" cy="134" rx="24" ry="28" fill="#BAA692" />

            {/* Left Arm resting on tummy */}
            <path
              d="M74 125 Q82 145 96 142"
              stroke="#9B846C"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Right Arm scratching chin thoughtfully */}
            <path
              d="M126 128 Q138 105 116 102"
              stroke="#9B846C"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path d="M112 100 Q116 96 120 102" stroke="#E9E0D2" strokeWidth="3" strokeLinecap="round" />

            {/* Feet */}
            <ellipse cx="80" cy="168" rx="12" ry="8" fill="#9B846C" />
            <ellipse cx="120" cy="168" rx="12" ry="8" fill="#9B846C" />

            {/* Head tilted slightly */}
            <g transform="rotate(-6 100 90)">
              <circle cx="100" cy="90" r="28" fill="#9B846C" />
              <path
                d="M80 92 C80 78 120 78 120 92 C120 106 80 106 80 92 Z"
                fill="#E9E0D2"
              />
              <ellipse cx="88" cy="90" rx="6" ry="9" fill="#745C47" transform="rotate(-15 88 90)" />
              <ellipse cx="112" cy="90" rx="6" ry="9" fill="#745C47" transform="rotate(15 112 90)" />
              {/* Curious looking-up eyes */}
              <circle cx="89" cy="88" r="2.8" fill="#22221F" />
              <circle cx="113" cy="88" r="2.8" fill="#22221F" />
              <circle cx="90" cy="87" r="1" fill="#FFFFFF" />
              <circle cx="114" cy="87" r="1" fill="#FFFFFF" />
              {/* Nose */}
              <ellipse cx="100" cy="97" rx="6" ry="4" fill="#39483B" />
              {/* Thoughtful mouth "o" */}
              <ellipse cx="100" cy="103" rx="2.5" ry="3.5" fill="#22221F" />
            </g>
          </svg>
        );

      case 'low-energy':
        return (
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full animate-hammock-rock filter drop-shadow-sm"
          >
            {/* Hammock Ropes */}
            <path d="M10 65 Q100 155 190 65" stroke="#9B846C" strokeWidth="5" strokeLinecap="round" />
            <path d="M10 65 L2 60" stroke="#77766E" strokeWidth="4" />
            <path d="M190 65 L198 60" stroke="#77766E" strokeWidth="4" />

            {/* Hammock cloth basket */}
            <path
              d="M20 75 Q100 165 180 75 Q100 135 20 75 Z"
              fill="#E3E8DD"
              stroke="#A6AD99"
              strokeWidth="2"
            />
            {/* Hammock subtle weave lines */}
            <path d="M45 92 Q100 148 155 92" stroke="#CCD5C3" strokeWidth="1.5" strokeDasharray="4 3" />

            {/* Sloth sleeping curled up in hammock */}
            {/* Body */}
            <ellipse cx="102" cy="108" rx="34" ry="24" fill="#9B846C" transform="rotate(-8 102 108)" />
            {/* Cozy leaf blanket */}
            <path
              d="M78 106 Q110 88 132 106 Q120 126 82 120 Z"
              fill="#39483B"
            />
            <path d="M90 100 Q105 110 120 108" stroke="#A6AD99" strokeWidth="1.5" strokeLinecap="round" />

            {/* Head resting on side */}
            <circle cx="74" cy="98" r="20" fill="#9B846C" />
            <ellipse cx="73" cy="98" rx="14" ry="11" fill="#E9E0D2" />
            <ellipse cx="68" cy="97" rx="4" ry="6" fill="#745C47" transform="rotate(-20 68 97)" />
            <ellipse cx="80" cy="99" rx="4" ry="6" fill="#745C47" transform="rotate(15 80 99)" />
            {/* Peaceful closed eyes (curved arcs) */}
            <path d="M65 98 Q68 101 71 98" stroke="#22221F" strokeWidth="2" strokeLinecap="round" />
            <path d="M77 100 Q80 103 83 100" stroke="#22221F" strokeWidth="2" strokeLinecap="round" />
            {/* Tiny nose and sweet sleeping mouth */}
            <ellipse cx="73" cy="104" rx="4" ry="2.5" fill="#39483B" />
            <path d="M71 107 Q73 109 76 107" stroke="#22221F" strokeWidth="1.5" strokeLinecap="round" />

            {/* Sloth tiny paws tucked */}
            <ellipse cx="60" cy="108" rx="6" ry="5" fill="#9B846C" />
            <ellipse cx="134" cy="116" rx="7" ry="5" fill="#9B846C" />

            {/* Cute Zzz */}
            <text x="50" y="75" fill="#77766E" fontSize="13" fontFamily="sans-serif" fontWeight="bold">z</text>
            <text x="42" y="62" fill="#A6AD99" fontSize="16" fontFamily="sans-serif" fontWeight="bold">Z</text>
            <text x="32" y="48" fill="#39483B" fontSize="20" fontFamily="sans-serif" fontWeight="bold">Z</text>
          </svg>
        );

      case 'task-completed':
        return (
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-sm"
          >
            {/* Floating celebratory leaves */}
            <g className="animate-leaf-float">
              <path d="M42 50 Q30 35 45 32 Q52 42 42 50Z" fill="#39483B" />
              <path d="M155 42 Q170 30 178 38 Q170 50 155 42Z" fill="#A6AD99" />
              <path d="M165 72 Q180 75 182 85 Q170 87 165 72Z" fill="#C47D61" />
              <path d="M30 85 Q18 90 22 100 Q32 98 30 85Z" fill="#39483B" />
            </g>

            {/* Body */}
            <ellipse cx="100" cy="126" rx="36" ry="40" fill="#9B846C" />
            <ellipse cx="100" cy="130" rx="24" ry="28" fill="#BAA692" />

            {/* Left Arm doing thumbs up */}
            <path
              d="M74 125 Q55 110 58 92"
              stroke="#9B846C"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Thumbs up hand */}
            <circle cx="58" cy="88" r="7" fill="#9B846C" />
            <path d="M58 88 L58 78" stroke="#9B846C" strokeWidth="6" strokeLinecap="round" />
            <path d="M58 77 L58 75" stroke="#E9E0D2" strokeWidth="3" strokeLinecap="round" />

            {/* Right Arm resting relaxed */}
            <path
              d="M126 125 Q142 140 134 150"
              stroke="#9B846C"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Feet */}
            <ellipse cx="80" cy="166" rx="12" ry="8" fill="#9B846C" />
            <ellipse cx="120" cy="166" rx="12" ry="8" fill="#9B846C" />

            {/* Head */}
            <circle cx="100" cy="88" r="28" fill="#9B846C" />
            <path
              d="M80 90 C80 76 120 76 120 90 C120 104 80 104 80 90 Z"
              fill="#E9E0D2"
            />
            <ellipse cx="88" cy="88" rx="6" ry="9" fill="#745C47" transform="rotate(-15 88 88)" />
            <ellipse cx="112" cy="88" rx="6" ry="9" fill="#745C47" transform="rotate(15 112 88)" />
            {/* Joyful Happy curved eyes */}
            <path d="M84 88 Q88 82 92 88" stroke="#22221F" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M108 88 Q112 82 116 88" stroke="#22221F" strokeWidth="2.5" strokeLinecap="round" />
            {/* Blushing cheeks */}
            <circle cx="82" cy="95" r="4" fill="#C47D61" opacity="0.6" />
            <circle cx="118" cy="95" r="4" fill="#C47D61" opacity="0.6" />
            {/* Nose */}
            <ellipse cx="100" cy="94" rx="6" ry="4" fill="#39483B" />
            {/* Big Happy Smile */}
            <path d="M94 100 Q100 108 106 100" stroke="#22221F" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      case 'encouragement':
        return (
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-sm"
          >
            {/* Wooden shelf or peek corner */}
            <path d="M30 150 L170 150" stroke="#BAA692" strokeWidth="6" strokeLinecap="round" />

            {/* Body peeking over */}
            <ellipse cx="100" cy="150" rx="34" ry="24" fill="#9B846C" />

            {/* Paws on the edge */}
            <ellipse cx="65" cy="148" rx="8" ry="6" fill="#9B846C" />
            <ellipse cx="135" cy="148" rx="8" ry="6" fill="#9B846C" />
            <path d="M62 147 L62 151" stroke="#E9E0D2" strokeWidth="2" strokeLinecap="round" />
            <path d="M66 147 L66 151" stroke="#E9E0D2" strokeWidth="2" strokeLinecap="round" />
            <path d="M133 147 L133 151" stroke="#E9E0D2" strokeWidth="2" strokeLinecap="round" />
            <path d="M137 147 L137 151" stroke="#E9E0D2" strokeWidth="2" strokeLinecap="round" />

            {/* Tiny green tea cup on shelf */}
            <rect x="145" y="136" width="14" height="14" rx="2" fill="#39483B" />
            <path d="M159 140 Q164 143 159 147" stroke="#39483B" strokeWidth="2" fill="none" />
            <path d="M150 132 Q152 126 150 122" stroke="#A6AD99" strokeWidth="1.5" strokeLinecap="round" />

            {/* Head */}
            <circle cx="100" cy="110" r="30" fill="#9B846C" />
            <path
              d="M78 112 C78 96 122 96 122 112 C122 128 78 128 78 112 Z"
              fill="#E9E0D2"
            />
            <ellipse cx="88" cy="110" rx="6" ry="9" fill="#745C47" transform="rotate(-15 88 110)" />
            <ellipse cx="112" cy="110" rx="6" ry="9" fill="#745C47" transform="rotate(15 112 110)" />
            {/* Friendly open eyes */}
            <circle cx="89" cy="109" r="2.8" fill="#22221F" />
            <circle cx="113" cy="109" r="2.8" fill="#22221F" />
            <circle cx="90" cy="108" r="0.9" fill="#FFFFFF" />
            <circle cx="114" cy="108" r="0.9" fill="#FFFFFF" />
            {/* Soft Blushing */}
            <circle cx="81" cy="118" r="3.5" fill="#C47D61" opacity="0.5" />
            <circle cx="119" cy="118" r="3.5" fill="#C47D61" opacity="0.5" />
            {/* Nose & Gentle Warm Smile */}
            <ellipse cx="100" cy="116" rx="6" ry="4" fill="#39483B" />
            <path d="M96 122 Q100 126 104 122" stroke="#22221F" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'empty-state':
        return (
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-sm"
          >
            {/* Body */}
            <ellipse cx="90" cy="130" rx="34" ry="38" fill="#9B846C" />
            <ellipse cx="90" cy="134" rx="22" ry="26" fill="#BAA692" />

            {/* Holding a cute little notepad */}
            <rect x="115" y="105" width="34" height="46" rx="4" fill="#FFFFFF" stroke="#A6AD99" strokeWidth="2" />
            <line x1="123" y1="118" x2="141" y2="118" stroke="#CCD5C3" strokeWidth="2" strokeLinecap="round" />
            <line x1="123" y1="126" x2="137" y2="126" stroke="#CCD5C3" strokeWidth="2" strokeLinecap="round" />
            <line x1="123" y1="134" x2="143" y2="134" stroke="#CCD5C3" strokeWidth="2" strokeLinecap="round" />
            {/* Little green checkmark on notepad */}
            <path d="M123 142 L126 145 L133 139" stroke="#39483B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Arm holding notepad */}
            <path d="M106 128 Q125 125 125 138" stroke="#9B846C" strokeWidth="12" strokeLinecap="round" />
            <ellipse cx="124" cy="138" rx="5" ry="4" fill="#9B846C" />

            {/* Left Arm pointing invitingly */}
            <path d="M68 128 Q50 135 44 146" stroke="#9B846C" strokeWidth="12" strokeLinecap="round" />

            {/* Feet */}
            <ellipse cx="74" cy="168" rx="11" ry="8" fill="#9B846C" />
            <ellipse cx="106" cy="168" rx="11" ry="8" fill="#9B846C" />

            {/* Head */}
            <circle cx="90" cy="90" r="27" fill="#9B846C" />
            <path
              d="M72 92 C72 78 108 78 108 92 C108 106 72 106 72 92 Z"
              fill="#E9E0D2"
            />
            <ellipse cx="79" cy="90" rx="5.5" ry="8" fill="#745C47" transform="rotate(-15 79 90)" />
            <ellipse cx="101" cy="90" rx="5.5" ry="8" fill="#745C47" transform="rotate(15 101 90)" />
            <circle cx="80" cy="90" r="2.5" fill="#22221F" />
            <circle cx="102" cy="90" r="2.5" fill="#22221F" />
            <ellipse cx="90" cy="96" rx="5" ry="3.5" fill="#39483B" />
            <path d="M86 101 Q90 105 94 101" stroke="#22221F" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'error-state':
        return (
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-sm"
          >
            {/* Mildly confused question mark leaf */}
            <text x="140" y="55" fill="#C47D61" fontSize="32" fontFamily="serif" fontWeight="bold">?</text>

            {/* Body */}
            <ellipse cx="100" cy="130" rx="36" ry="40" fill="#9B846C" />
            <ellipse cx="100" cy="134" rx="24" ry="28" fill="#BAA692" />

            {/* Shrugging hands */}
            <path d="M72 130 Q54 125 50 115" stroke="#9B846C" strokeWidth="13" strokeLinecap="round" />
            <path d="M128 130 Q146 125 150 115" stroke="#9B846C" strokeWidth="13" strokeLinecap="round" />
            <ellipse cx="49" cy="114" rx="5" ry="4" fill="#9B846C" />
            <ellipse cx="151" cy="114" rx="5" ry="4" fill="#9B846C" />

            {/* Feet */}
            <ellipse cx="80" cy="168" rx="12" ry="8" fill="#9B846C" />
            <ellipse cx="120" cy="168" rx="12" ry="8" fill="#9B846C" />

            {/* Head tilted with mild perplexity */}
            <g transform="rotate(8 100 90)">
              <circle cx="100" cy="90" r="28" fill="#9B846C" />
              <path
                d="M80 92 C80 78 120 78 120 92 C120 106 80 106 80 92 Z"
                fill="#E9E0D2"
              />
              <ellipse cx="88" cy="90" rx="6" ry="9" fill="#745C47" transform="rotate(-15 88 90)" />
              <ellipse cx="112" cy="90" rx="6" ry="9" fill="#745C47" transform="rotate(15 112 90)" />
              {/* One eye round, one eye slightly squinched */}
              <circle cx="88" cy="90" r="3.2" fill="#22221F" />
              <path d="M109 91 Q112 87 115 91" stroke="#22221F" strokeWidth="2.5" strokeLinecap="round" />
              {/* Nose */}
              <ellipse cx="100" cy="97" rx="6" ry="4" fill="#39483B" />
              {/* Wobbly wavy mouth */}
              <path d="M94 103 Q97 106 100 103 Q103 100 106 103" stroke="#22221F" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          </svg>
        );

      case 'garden':
        return (
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-sm"
          >
            {/* Small sprout by sloth */}
            <path d="M145 160 Q150 140 152 130" stroke="#5A4632" strokeWidth="4" strokeLinecap="round" />
            <path d="M152 130 Q164 122 170 128 Q162 138 152 130Z" fill="#39483B" />
            <path d="M150 135 Q138 128 136 136 Q144 142 150 135Z" fill="#A6AD99" />

            {/* Body */}
            <ellipse cx="90" cy="132" rx="34" ry="38" fill="#9B846C" />
            <ellipse cx="90" cy="136" rx="22" ry="26" fill="#BAA692" />

            {/* Arm holding gentle terracotta watering vessel */}
            <path d="M110 130 Q128 132 136 138" stroke="#9B846C" strokeWidth="12" strokeLinecap="round" />
            <path d="M136 132 L144 142 L132 144 Z" fill="#C47D61" />
            <path d="M144 135 L148 138" stroke="#C47D61" strokeWidth="2" strokeLinecap="round" />
            {/* Water drops */}
            <circle cx="150" cy="144" r="1.5" fill="#A6AD99" />
            <circle cx="151" cy="150" r="1.5" fill="#A6AD99" />

            {/* Left Arm relaxed */}
            <path d="M68 130 Q58 145 66 155" stroke="#9B846C" strokeWidth="12" strokeLinecap="round" />

            {/* Feet on grass mound */}
            <path d="M30 172 Q100 162 170 172" stroke="#A6AD99" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="76" cy="166" rx="10" ry="7" fill="#9B846C" />
            <ellipse cx="104" cy="166" rx="10" ry="7" fill="#9B846C" />

            {/* Head */}
            <circle cx="90" cy="92" r="26" fill="#9B846C" />
            <path
              d="M72 94 C72 80 108 80 108 94 C108 108 72 108 72 94 Z"
              fill="#E9E0D2"
            />
            <ellipse cx="80" cy="92" rx="5" ry="8" fill="#745C47" transform="rotate(-15 80 92)" />
            <ellipse cx="100" cy="92" rx="5" ry="8" fill="#745C47" transform="rotate(15 100 92)" />
            <circle cx="81" cy="92" r="2.4" fill="#22221F" />
            <circle cx="101" cy="92" r="2.4" fill="#22221F" />
            <ellipse cx="90" cy="98" rx="5" ry="3.5" fill="#39483B" />
            <path d="M86 103 Q90 107 94 103" stroke="#22221F" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <div className={`${sizeMap[size]} transition-transform duration-300`}>
        {renderGraphic()}
      </div>
      {showCaption && captionText && (
        <span className="mt-2 text-xs font-medium text-[#77766E] text-center max-w-[180px]">
          {captionText}
        </span>
      )}
    </div>
  );
};
