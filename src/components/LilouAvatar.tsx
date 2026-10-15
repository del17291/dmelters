import React, { useMemo } from 'react';
import { LiveSessionStatus } from '../services/geminiLiveClient.ts';

interface LilouAvatarProps {
  status: LiveSessionStatus;
  audioLevel: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  onClick?: () => void;
}

export const LilouAvatar: React.FC<LilouAvatarProps> = ({
  status,
  audioLevel,
  size = 'md',
  className = '',
  onClick,
}) => {
  // Dimensions based on size
  const dim = useMemo(() => {
    switch (size) {
      case 'sm':
        return { container: 'w-16 h-16', orb: 'w-10 h-10', blur: 'blur-md' };
      case 'md':
        return { container: 'w-28 h-28', orb: 'w-18 h-18', blur: 'blur-lg' };
      case 'lg':
        return { container: 'w-40 h-40', orb: 'w-24 h-24', blur: 'blur-xl' };
      case 'hero':
      default:
        return { container: 'w-56 h-56 sm:w-64 sm:h-64', orb: 'w-36 h-36 sm:w-40 sm:h-40', blur: 'blur-2xl' };
    }
  }, [size]);

  // Reactive scale calculations based on audio volume
  const pulseScale = 1 + Math.min(0.4, audioLevel * 0.7);
  const ringScale1 = 1 + Math.min(0.6, audioLevel * 1.1);
  const ringScale2 = 1 + Math.min(0.8, audioLevel * 1.5);

  const isSpeaking = status === 'speaking';
  const isListening = status === 'listening';
  const isConnecting = status === 'connecting' || status === 'requesting_permission';

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none ${dim.container} ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Outer ambient glow */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${dim.blur}`}
        style={{
          background: isSpeaking
            ? 'radial-gradient(circle, rgba(196, 158, 99, 0.45) 0%, rgba(27, 56, 43, 0.3) 60%, transparent 80%)'
            : isListening
            ? 'radial-gradient(circle, rgba(78, 122, 101, 0.4) 0%, rgba(27, 56, 43, 0.25) 60%, transparent 80%)'
            : isConnecting
            ? 'radial-gradient(circle, rgba(200, 169, 126, 0.5) 0%, rgba(27, 56, 43, 0.2) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(27, 56, 43, 0.15) 0%, rgba(78, 122, 101, 0.08) 60%, transparent 80%)',
          transform: `scale(${isSpeaking ? ringScale2 : 1})`,
        }}
      />

      {/* Outer Reactive Sonic Ripple 2 */}
      {(isSpeaking || isListening) && (
        <div
          className="absolute rounded-full border border-emerald-400/25 transition-transform duration-75 ease-out pointer-events-none"
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${ringScale2})`,
            opacity: Math.max(0.2, audioLevel * 0.9),
          }}
        />
      )}

      {/* Outer Reactive Sonic Ripple 1 */}
      {(isSpeaking || isListening) && (
        <div
          className="absolute rounded-full border border-amber-300/30 transition-transform duration-100 ease-out pointer-events-none"
          style={{
            width: '82%',
            height: '82%',
            transform: `scale(${ringScale1}) rotate(45deg)`,
            opacity: Math.max(0.3, audioLevel * 1.2),
          }}
        />
      )}

      {/* Delicate Golden Orbital Ring (Elegance & Motion) */}
      <div
        className={`absolute rounded-full border border-amber-400/35 pointer-events-none transition-all duration-500 ${
          isConnecting ? 'animate-spin' : ''
        }`}
        style={{
          width: '78%',
          height: '78%',
          borderRadius: '45% 55% 52% 48% / 48% 52% 48% 52%',
          transform: `rotate(${isSpeaking ? audioLevel * 180 : 0}deg)`,
          animationDuration: isConnecting ? '4s' : '14s',
        }}
      />

      {/* Secondary Orbital Ring tilted */}
      <div
        className="absolute rounded-full border border-emerald-500/30 pointer-events-none"
        style={{
          width: '68%',
          height: '68%',
          borderRadius: '52% 48% 50% 50% / 50% 52% 48% 50%',
          transform: `rotate(${isSpeaking ? -audioLevel * 120 : 35}deg)`,
          transition: 'transform 0.3s ease-out',
        }}
      />

      {/* Main Core Orb (Luxury Emerald & Golden Glassmorphic Sphere) */}
      <div
        className={`relative rounded-full flex items-center justify-center shadow-2xl transition-transform duration-150 ease-out overflow-hidden ${dim.orb}`}
        style={{
          transform: `scale(${pulseScale})`,
          background: isSpeaking
            ? 'linear-gradient(135deg, #163628 0%, #224D39 45%, #C8A97E 100%)'
            : isListening
            ? 'linear-gradient(135deg, #102B20 0%, #1B4533 50%, #4E7A65 100%)'
            : isConnecting
            ? 'linear-gradient(135deg, #2D4C3E 0%, #8C7355 50%, #C8A97E 100%)'
            : 'linear-gradient(135deg, #142E23 0%, #1B382B 60%, #2A4F3E 100%)',
          boxShadow: isSpeaking
            ? '0 12px 35px -5px rgba(200, 169, 126, 0.4), inset 0 0 25px rgba(255, 230, 180, 0.25)'
            : '0 12px 35px -5px rgba(27, 56, 43, 0.4), inset 0 0 20px rgba(100, 180, 140, 0.2)',
        }}
      >
        {/* Specular curved reflection overlay (3D glass lens effect) */}
        <div
          className="absolute top-1 left-2 right-2 h-1/2 rounded-t-full pointer-events-none opacity-40"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0) 100%)',
          }}
        />

        {/* Inner dynamic soundwave core iris */}
        <div className="relative flex items-center justify-center gap-1">
          {/* Wave bars */}
          <span
            className="w-1 rounded-full bg-amber-200/90 transition-all duration-75"
            style={{
              height: isSpeaking ? `${Math.max(6, audioLevel * 34)}px` : isListening ? '10px' : '6px',
            }}
          />
          <span
            className="w-1.5 rounded-full bg-amber-100 transition-all duration-75"
            style={{
              height: isSpeaking ? `${Math.max(10, audioLevel * 48)}px` : isListening ? '16px' : '10px',
            }}
          />
          <span
            className="w-1 rounded-full bg-emerald-200/90 transition-all duration-75"
            style={{
              height: isSpeaking ? `${Math.max(8, audioLevel * 38)}px` : isListening ? '12px' : '7px',
            }}
          />
          <span
            className="w-1 rounded-full bg-amber-300/80 transition-all duration-75"
            style={{
              height: isSpeaking ? `${Math.max(5, audioLevel * 26)}px` : isListening ? '8px' : '5px',
            }}
          />
        </div>

        {/* Breathing ambient ring inside core */}
        <div className="absolute inset-1 rounded-full border border-white/10 pointer-events-none" />
      </div>

      {/* Floating Status Badge Pill */}
      {size !== 'sm' && (
        <div className="absolute -bottom-3 px-3 py-1 rounded-full bg-[#1B382B] text-amber-100/95 border border-amber-300/25 shadow-lg text-xs font-medium tracking-wide flex items-center gap-1.5 backdrop-blur-sm z-10">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSpeaking
                ? 'bg-amber-300 animate-ping'
                : isListening
                ? 'bg-emerald-400 animate-pulse'
                : isConnecting
                ? 'bg-amber-400 animate-spin'
                : status === 'error'
                ? 'bg-rose-400'
                : 'bg-emerald-300'
            }`}
          />
          <span>
            {isSpeaking
              ? 'Lilou speaking...'
              : isListening
              ? 'Listening...'
              : isConnecting
              ? 'Connecting...'
              : status === 'error'
              ? 'Connection issue'
              : 'Lilou is ready'}
          </span>
        </div>
      )}
    </div>
  );
};
