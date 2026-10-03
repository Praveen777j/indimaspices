import {
  generateDynamicMetadata,
  applyMetadataToDocument,
  CANONICAL_BASE,
  DEFAULT_SEO,
  UseDynamicSeoProps,
  DynamicMetadata
} from './useDynamicSeo';

export {
  generateDynamicMetadata,
  applyMetadataToDocument,
  CANONICAL_BASE,
  DEFAULT_SEO
};

export type { UseDynamicSeoProps, DynamicMetadata };

export type SeoMetaOptions = UseDynamicSeoProps & {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
};

/**
 * Dynamically updates document title, description, OpenGraph, Twitter Cards, and Schema.org JSON-LD
 */
export function updateDynamicSeo(options: SeoMetaOptions) {
  const metadata = generateDynamicMetadata({
    product: options.product,
    category: options.category,
    recipe: options.recipe,
    settings: options.settings,
    locale: options.locale,
    pageType: options.pageType,
    customTitle: options.title,
    customDescription: options.description
  });
  applyMetadataToDocument(metadata);
}
