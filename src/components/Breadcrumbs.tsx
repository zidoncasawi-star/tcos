import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path: string;
}

interface Props {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
}

export const Breadcrumbs: React.FC<Props> = ({ items, onNavigate }) => {
  return (
    <nav aria-label="Fil d'Ariane" className="py-2.5 text-xs text-slate-500 flex items-center flex-wrap gap-1">
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Accueil</span>
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.path}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800 line-clamp-1 max-w-[240px]">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(item.path)}
                className="hover:text-slate-900 transition-colors line-clamp-1 max-w-[180px]"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
