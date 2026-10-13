import React from 'react';

interface Props {
  variant?: 'featured' | 'compact';
  count?: number;
}

export const ProgramCardSkeleton: React.FC<Props> = ({ variant = 'compact', count = 1 }) => {
  const skeletons = Array.from({ length: count });

  if (variant === 'featured') {
    return (
      <div className="grid grid-cols-1 gap-6 w-full">
        {skeletons.map((_, idx) => (
          <div
            key={idx}
            className="w-full bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col md:flex-row shadow-xs animate-pulse h-[220px] md:h-auto"
          >
            {/* Left side: Simulated Image */}
            <div className="relative md:w-5/12 h-48 md:h-full min-h-[220px] bg-slate-200 shrink-0">
              <div className="absolute top-3 left-3 flex gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-300" />
                <div className="w-14 h-5 rounded bg-slate-300" />
              </div>
              <div className="absolute bottom-3 left-3 w-16 h-6 rounded bg-slate-300" />
            </div>

            {/* Right side: Simulated Content */}
            <div className="p-4 md:p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex gap-2">
                  <div className="w-16 h-5 rounded-full bg-slate-200" />
                  <div className="w-24 h-5 rounded bg-slate-200" />
                </div>
                {/* Title */}
                <div className="w-3/4 h-6 rounded bg-slate-300" />
                {/* Subtitle */}
                <div className="w-1/2 h-4 rounded bg-slate-200" />
                {/* Synopsis lines */}
                <div className="space-y-2">
                  <div className="w-full h-3 rounded bg-slate-200" />
                  <div className="w-11/12 h-3 rounded bg-slate-200" />
                  <div className="w-4/5 h-3 rounded bg-slate-200" />
                </div>
              </div>

              {/* Bottom bar */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div className="w-28 h-4 rounded bg-slate-200" />
                <div className="w-20 h-4 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Standard Compact Cards Grid Skeleton
  return (
    <>
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col animate-pulse"
        >
          {/* Simulated Image */}
          <div className="relative aspect-16/9 bg-slate-200">
            <div className="absolute top-2.5 left-2.5 flex gap-1.5">
              <div className="w-6 h-6 rounded bg-slate-300" />
              <div className="w-10 h-4 rounded bg-slate-300" />
            </div>
            <div className="absolute bottom-2.5 left-2.5 w-12 h-5 rounded bg-slate-300" />
          </div>

          {/* Simulated Content */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              {/* Category */}
              <div className="w-1/3 h-4 rounded bg-slate-200" />
              {/* Title */}
              <div className="w-11/12 h-5 rounded bg-slate-300" />
              {/* Subtitle / Description */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-3 rounded bg-slate-100" />
                <div className="w-5/6 h-3 rounded bg-slate-100" />
              </div>
            </div>

            {/* Simulated progress or channel logo preview */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <div className="w-16 h-3 rounded bg-slate-200" />
              <div className="w-10 h-3 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
