import { useEffect } from 'react';
import { Product, Category, BusinessSettings } from '../types';
import { updateDynamicSeo } from './seo';

interface UseDynamicSeoProps {
  product?: Product | null;
  category?: Category | null;
  settings?: BusinessSettings | null;
  locale?: string;
}

export function useDynamicSeo({ product, category, settings, locale }: UseDynamicSeoProps) {
  useEffect(() => {
    updateDynamicSeo({
      product,
      category,
      settings,
      locale
    });
  }, [product, category, settings, locale]);
}
