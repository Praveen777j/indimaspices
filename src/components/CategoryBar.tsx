import React from 'react';
import { Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Sparkles, Leaf } from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories = [],
  selectedCategoryId,
  onSelectCategory
}) => {
  const { language, t } = useLanguage();
  const isKn = language === 'kn';

  return (
    <section id="categories-section" className="py-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#FFFDF9] border border-[#E8DFD3] rounded-3xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="font-serif text-sm sm:text-base font-bold text-[#1F1610] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#8B3214]"></span>
              <span>{isKn ? 'ಮಸಾಲೆಗಳ ವರ್ಗಗಳು' : 'Pure Spice Categories'}</span>
            </h2>
            <p className="text-[11px] text-[#7A6455]">
              {isKn ? '100% ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ನೈಸರ್ಗಿಕ ಮಸಾಲೆಗಳು' : 'Stone-ground without artificial chemicals or synthetic fillers'}
            </p>
          </div>
        </div>

        {/* Clean Scrollable Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {/* 'All Spices' Button */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              !selectedCategoryId || selectedCategoryId === 'all'
                ? 'bg-[#8B3214] text-white shadow-sm'
                : 'bg-[#FAF7F2] text-[#5C483B] hover:text-[#1F1610] hover:bg-[#F5EFEB] border border-[#E8DFD3]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isKn ? 'ಎಲ್ಲಾ ಶುದ್ಧ ಮಸಾಲೆಗಳು' : 'All Pure Spices'}</span>
          </button>

          {/* Dynamic Categories */}
          {(categories || []).filter(c => c?.enabled).map(cat => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#8B3214] text-white shadow-sm'
                    : 'bg-[#FAF7F2] text-[#5C483B] hover:text-[#1F1610] hover:bg-[#F5EFEB] border border-[#E8DFD3]'
                }`}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name_en}
                    className="w-4 h-4 rounded-full object-cover border border-[#DFCFC0]"
                  />
                ) : (
                  <Leaf className="w-3.5 h-3.5 text-[#2B5329]" />
                )}
                <span>{isKn ? cat.name_kn : cat.name_en}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
