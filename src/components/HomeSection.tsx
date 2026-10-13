import React from 'react';
import { ChevronRight } from 'lucide-react';

interface HomeSectionProps {
  title: string;
  viewMoreLabel?: string;
  viewMoreHref: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  title,
  viewMoreLabel = 'Voir plus',
  viewMoreHref,
  onNavigate,
  children
}) => {
  return (
    <section className="space-y-4 mb-10">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">{title}</h2>
        <button
          onClick={() => onNavigate(viewMoreHref)}
          className="group flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          {viewMoreLabel}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 min-w-max sm:min-w-0">
          {children}
        </div>
      </div>
    </section>
  );
};
