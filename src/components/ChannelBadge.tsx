import React, { useState } from 'react';
import { Channel } from '../types';

interface Props {
  channel?: Channel;
  number?: number;
  name?: string;
  logo?: string;
  logoUrl?: string;
  badgeColor?: string;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export const ChannelBadge: React.FC<Props> = ({
  channel,
  number,
  name,
  logo,
  logoUrl,
  badgeColor,
  size = 'md',
  showNumber = true
}) => {
  const [imgError, setImgError] = useState(false);

  const chNumber = channel?.number ?? number ?? 1;
  const chName = channel?.name ?? name ?? `Canal ${chNumber}`;
  const chLogo = channel?.logo ?? logo ?? chName;
  const chColor = channel?.badgeColor ?? badgeColor ?? '#0f172a';
  const chLogoUrl = !imgError ? (channel?.logoUrl || logoUrl) : undefined;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-bold',
    md: 'text-xs sm:text-sm px-2.5 py-1 font-bold',
    lg: 'text-sm sm:text-base px-3 py-1.5 font-extrabold'
  };

  const imgSizeClasses = {
    sm: 'h-6 max-w-[65px]',
    md: 'h-7 max-w-[80px]',
    lg: 'h-9 max-w-[110px]'
  };

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0" title={`${chName} (Canal ${chNumber})`}>
      {showNumber && (
        <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0">
          {chNumber}
        </span>
      )}

      {chLogoUrl ? (
        <div className={`flex items-center justify-center bg-white px-1.5 py-0.5 rounded border border-slate-200/80 shadow-2xs ${imgSizeClasses[size]}`}>
          <img
            src={chLogoUrl}
            alt={chName}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <span
          className={`rounded text-white tracking-wider uppercase inline-block shadow-xs ${sizeClasses[size]}`}
          style={{ backgroundColor: chColor }}
        >
          {chLogo}
        </span>
      )}
    </div>
  );
};

