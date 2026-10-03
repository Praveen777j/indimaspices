import { useEffect, useCallback } from 'react';
import { Product, Category, Recipe, BusinessSettings } from '../types';
import { getProductSlug, getCategorySlug, getRecipeSlug } from './slug';

export const CANONICAL_BASE = 'https://indima-spices-co.onrender.com';

export const DEFAULT_SEO = {
  title: 'Indima Spice Co. | Authentic Homemade Spices & Masalas',
  description:
    'Indima Spice Co. brings authentic homemade Indian spices and masalas crafted with traditional flavours, quality ingredients and the rich heritage of Karnataka.',
  keywords:
    'Indima Spice Co, authentic homemade spices, Karnataka spices, stone ground masalas, traditional Indian spices, pure turmeric, sambar powder, rasam powder, Byadagi chilli, Bengaluru spices',
  image: `${CANONICAL_BASE}/indima-brand-logo.jpg`,
  url: `${CANONICAL_BASE}/`
};

export interface UseDynamicSeoProps {
  product?: Product | null;
  category?: Category | null;
  recipe?: Recipe | null;
  settings?: BusinessSettings | null;
  locale?: string;
  pageType?: 'home' | 'product' | 'category' | 'recipe' | 'recipes' | 'about' | 'contact';
  customTitle?: string;
  customDescription?: string;
}

export interface DynamicMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords: string;
  author: string;
  robots: string;
  og: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: 'website' | 'product' | 'article';
    siteName: string;
    locale: string;
    localeAlternate: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
  schemas: { id: string; schema: Record<string, any> }[];
  schemasToRemove: string[];
}

/**
 * Pure generator function that transforms Firestore entities into unique SEO metadata objects.
 */
export function generateDynamicMetadata(options: UseDynamicSeoProps): DynamicMetadata {
  const isKn = options.locale === 'kn';

  // 1. PRODUCT METADATA GENERATOR
  if (options.product) {
    const p = options.product;
    const slug = getProductSlug(p);
    const name = isKn && p.name_kn ? p.name_kn : p.name_en;
    const rawDesc = (isKn && p.description_kn ? p.description_kn : p.description_en) || DEFAULT_SEO.description;
    const cleanDesc = rawDesc.replace(/\s+/g, ' ').trim();
    const shortDesc = cleanDesc.length > 150 ? cleanDesc.substring(0, 147) + '...' : cleanDesc;

    const title = options.customTitle || `${name} (₹${p.price} / ${p.weight}) | Indima Spice Co.`;
    const description =
      options.customDescription ||
      `Buy authentic ${name} online. ${shortDesc} Traditional homemade Karnataka spices, 100% pure with zero preservatives. Fast pan-India shipping.`;

    const prodImg = p.images?.[0] || DEFAULT_SEO.image;
    const image = prodImg.startsWith('http') ? prodImg : `${CANONICAL_BASE}${prodImg.startsWith('/') ? '' : '/'}${prodImg}`;
    const canonicalUrl = `${CANONICAL_BASE}/products/${slug}`;
    const keywords = `${name}, buy ${p.name_en}, homemade ${p.name_en}, Karnataka spices, authentic masalas, pure spices Bengaluru`;

    const productSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${canonicalUrl}#product`,
      name: p.name_en,
      alternateName: p.name_kn || undefined,
      description: p.description_en || cleanDesc,
      image: p.images && p.images.length > 0
        ? p.images.map(img => (img.startsWith('http') ? img : `${CANONICAL_BASE}${img.startsWith('/') ? '' : '/'}${img}`))
        : [image],
      sku: p.sku || p.id,
      brand: {
        '@type': 'Brand',
        name: 'Indima Spice Co.'
      },
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'INR',
        price: p.price,
        priceValidUntil: '2027-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: p.stock && p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Indima Spice Co.',
          url: CANONICAL_BASE
        }
      }
    };

    if (p.category_id) {
      productSchema.category = p.category_id;
    }
    if (p.weight) {
      productSchema.weight = p.weight;
    }
    if (typeof p.rating === 'number' && p.rating > 0 && typeof p.review_count === 'number' && p.review_count > 0) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: p.rating,
        reviewCount: p.review_count,
        bestRating: '5',
        worstRating: '1'
      };
    }

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${CANONICAL_BASE}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Spices & Masalas',
          item: `${CANONICAL_BASE}/#products`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: p.name_en,
          item: canonicalUrl
        }
      ]
    };

    return {
      title,
      description,
      canonicalUrl,
      keywords,
      author: 'Indima Spice Co.',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      og: {
        title,
        description,
        image,
        url: canonicalUrl,
        type: 'product',
        siteName: 'Indima Spice Co.',
        locale: isKn ? 'kn_IN' : 'en_IN',
        localeAlternate: isKn ? 'en_IN' : 'kn_IN'
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image
      },
      schemas: [
        { id: 'dynamic-product-jsonld', schema: productSchema },
        { id: 'dynamic-breadcrumb-jsonld', schema: breadcrumbSchema }
      ],
      schemasToRemove: ['dynamic-category-jsonld', 'dynamic-recipe-jsonld']
    };
  }

  // 2. CATEGORY METADATA GENERATOR
  if (options.category) {
    const c = options.category;
    const slug = getCategorySlug(c);
    const catName = isKn && c.name_kn ? c.name_kn : c.name_en;
    const rawCatDesc = (isKn && c.description_kn ? c.description_kn : c.description_en) || DEFAULT_SEO.description;
    const catDesc = rawCatDesc.replace(/\s+/g, ' ').trim();
    const shortDesc = catDesc.length > 150 ? catDesc.substring(0, 147) + '...' : catDesc;

    const title = options.customTitle || `${catName} Range | Authentic Homemade Spices | Indima Spice Co.`;
    const description =
      options.customDescription ||
      `Explore authentic homemade ${catName} collection from Indima Spice Co. ${shortDesc} Handcrafted in Karnataka with traditional flavours.`;

    const catImg = c.image || DEFAULT_SEO.image;
    const image = catImg.startsWith('http') ? catImg : `${CANONICAL_BASE}${catImg.startsWith('/') ? '' : '/'}${catImg}`;
    const canonicalUrl = `${CANONICAL_BASE}/categories/${slug}`;
    const keywords = `${catName}, Karnataka spices, ${c.name_en}, homemade masalas, authentic spices Bengaluru`;

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${CANONICAL_BASE}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: catName,
          item: canonicalUrl
        }
      ]
    };

    const categorySchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: catName,
      url: canonicalUrl,
      description,
      publisher: {
        '@type': 'Organization',
        name: 'Indima Spice Co.',
        url: CANONICAL_BASE
      }
    };

    return {
      title,
      description,
      canonicalUrl,
      keywords,
      author: 'Indima Spice Co.',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      og: {
        title,
        description,
        image,
        url: canonicalUrl,
        type: 'website',
        siteName: 'Indima Spice Co.',
        locale: isKn ? 'kn_IN' : 'en_IN',
        localeAlternate: isKn ? 'en_IN' : 'kn_IN'
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image
      },
      schemas: [
        { id: 'dynamic-category-jsonld', schema: categorySchema },
        { id: 'dynamic-breadcrumb-jsonld', schema: breadcrumbSchema }
      ],
      schemasToRemove: ['dynamic-product-jsonld', 'dynamic-recipe-jsonld']
    };
  }

  // 3. RECIPE METADATA GENERATOR
  if (options.recipe) {
    const r = options.recipe;
    const slug = getRecipeSlug(r);
    const titleName = isKn && r.title_kn ? r.title_kn : r.title_en;
    const rawDesc = (isKn && r.description_kn ? r.description_kn : r.description_en) || DEFAULT_SEO.description;
    const cleanDesc = rawDesc.replace(/\s+/g, ' ').trim();
    const shortDesc = cleanDesc.length > 150 ? cleanDesc.substring(0, 147) + '...' : cleanDesc;

    const title = options.customTitle || `${titleName} Recipe | Karnataka Heritage | Indima Spice Co.`;
    const description =
      options.customDescription ||
      `Cook authentic ${titleName} at home with pure Indima spices. ${shortDesc} Traditional recipe. Prep time: ${r.prep_time || '25 mins'}.`;

    const recImg = r.image || DEFAULT_SEO.image;
    const image = recImg.startsWith('http') ? recImg : `${CANONICAL_BASE}${recImg.startsWith('/') ? '' : '/'}${recImg}`;
    const canonicalUrl = `${CANONICAL_BASE}/recipes/${slug}`;
    const keywords = `${titleName}, ${r.title_en} recipe, Karnataka traditional recipe, authentic Indian cooking, Indima spices`;

    const rawIngredients = isKn
      ? r.ingredients_kn && r.ingredients_kn.length > 0 ? r.ingredients_kn : r.ingredients_en
      : r.ingredients_en && r.ingredients_en.length > 0 ? r.ingredients_en : r.ingredients_kn;
    const ingredients = Array.isArray(rawIngredients) ? rawIngredients : [];

    const rawInstructions = isKn
      ? r.instructions_kn && r.instructions_kn.length > 0 ? r.instructions_kn : r.instructions_en
      : r.instructions_en && r.instructions_en.length > 0 ? r.instructions_en : r.instructions_kn;
    const instructions = Array.isArray(rawInstructions) ? rawInstructions : [];

    const parseDurationIso = (timeStr?: string) => {
      if (!timeStr) return undefined;
      const match = timeStr.match(/(\d+)/);
      if (match) return `PT${match[1]}M`;
      return undefined;
    };

    const recipeSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      '@id': `${canonicalUrl}#recipe`,
      name: r.title_en,
      headline: titleName,
      description: r.description_en || cleanDesc,
      image: [image],
      author: {
        '@type': 'Organization',
        name: 'Indima Spice Co.',
        url: CANONICAL_BASE
      },
      publisher: {
        '@type': 'Organization',
        name: 'Indima Spice Co.',
        url: CANONICAL_BASE,
        logo: {
          '@type': 'ImageObject',
          url: `${CANONICAL_BASE}/indima-brand-logo.jpg`
        }
      },
      recipeCategory: 'Traditional Karnataka Cuisine',
      recipeCuisine: 'South Indian',
      prepTime: parseDurationIso(r.prep_time) || 'PT20M',
      cookTime: parseDurationIso(r.cook_time) || 'PT25M',
      recipeYield: r.servings || '4 servings',
      recipeIngredient: ingredients.length > 0 ? ingredients : ['100% Pure Indima Spices'],
      recipeInstructions: instructions.length > 0
        ? instructions.map((step, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            text: step
          }))
        : [{ '@type': 'HowToStep', position: 1, text: 'Follow traditional stone-ground preparation instructions.' }]
    };

    if (r.video_url || r.video) {
      recipeSchema.video = {
        '@type': 'VideoObject',
        name: `${r.title_en} Video Guide`,
        description: `How to cook ${r.title_en} using authentic Indima spices`,
        thumbnailUrl: image,
        contentUrl: r.video_url || r.video,
        uploadDate: r.created_at || '2026-01-01'
      };
    }

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${CANONICAL_BASE}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Recipes',
          item: `${CANONICAL_BASE}/#recipes-section`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: titleName,
          item: canonicalUrl
        }
      ]
    };

    return {
      title,
      description,
      canonicalUrl,
      keywords,
      author: 'Indima Spice Co.',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      og: {
        title,
        description,
        image,
        url: canonicalUrl,
        type: 'article',
        siteName: 'Indima Spice Co.',
        locale: isKn ? 'kn_IN' : 'en_IN',
        localeAlternate: isKn ? 'en_IN' : 'kn_IN'
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image
      },
      schemas: [
        { id: 'dynamic-recipe-jsonld', schema: recipeSchema },
        { id: 'dynamic-breadcrumb-jsonld', schema: breadcrumbSchema }
      ],
      schemasToRemove: ['dynamic-product-jsonld', 'dynamic-category-jsonld']
    };
  }

  // 4. STATIC & HOMEPAGE METADATA GENERATOR
  let title = options.customTitle || DEFAULT_SEO.title;
  let description = options.customDescription || DEFAULT_SEO.description;
  let canonicalUrl = `${CANONICAL_BASE}/`;
  const image = DEFAULT_SEO.image;

  if (options.pageType === 'recipes') {
    title = 'Authentic Traditional Karnataka Spice Recipes | Indima Spice Co.';
    description =
      'Explore authentic traditional Karnataka recipes with Indima Spice Co. Stone-ground spices for Mysore Bisi Bele Bath, Udupi Sambar, Maniyara Rasam, and more.';
    canonicalUrl = `${CANONICAL_BASE}/recipes`;
  } else if (options.pageType === 'about') {
    title = 'Our Heritage & Tradition | 100% Pure Stone-Ground Spices | Indima Spice Co.';
    description =
      'Learn about the heritage of Indima Spice Co. Bringing traditional Karnataka culinary culture to homes with 100% natural, stone-ground authentic spices.';
    canonicalUrl = `${CANONICAL_BASE}/about`;
  } else if (options.pageType === 'contact') {
    title = 'Contact Us | Customer Care & Support | Indima Spice Co.';
    description =
      'Get in touch with Indima Spice Co. in Basavanagudi, Bengaluru. Contact us for authentic spice inquiries, wholesale orders, and pan-India shipping support.';
    canonicalUrl = `${CANONICAL_BASE}/contact`;
  }

  const settings = options.settings;
  const phone = settings?.phone || '+919663852435';
  const email = settings?.email || 'care@indimaspice.com';
  const street = settings?.address_line1 || '#42, Traditional Kitchen Heritage Lane, Bull Temple Road, Basavanagudi';
  const city = settings?.city || 'Bengaluru';
  const state = settings?.state || 'Karnataka';
  const pincode = settings?.pincode || '560004';
  const sameAs = [settings?.instagram_url, settings?.facebook_url, settings?.youtube_url, settings?.twitter_url].filter(Boolean);

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${CANONICAL_BASE}/#organization`,
    name: 'Indima Spice Co.',
    url: CANONICAL_BASE,
    logo: `${CANONICAL_BASE}/indima-brand-logo.jpg`,
    slogan: "Pure as mother's love",
    description: DEFAULT_SEO.description,
    telephone: phone,
    email: email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: street,
      addressLocality: city,
      addressRegion: state,
      postalCode: pincode,
      addressCountry: 'IN'
    },
    sameAs: sameAs.length > 0 ? sameAs : undefined
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${CANONICAL_BASE}/#website`,
    url: CANONICAL_BASE,
    name: 'Indima Spice Co.',
    publisher: {
      '@id': `${CANONICAL_BASE}/#organization`
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${CANONICAL_BASE}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return {
    title,
    description,
    canonicalUrl,
    keywords: DEFAULT_SEO.keywords,
    author: 'Indima Spice Co.',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    og: {
      title,
      description,
      image,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Indima Spice Co.',
      locale: isKn ? 'kn_IN' : 'en_IN',
      localeAlternate: isKn ? 'en_IN' : 'kn_IN'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image
    },
    schemas: [
      { id: 'default-organization-jsonld', schema: orgSchema },
      { id: 'default-website-jsonld', schema: websiteSchema }
    ],
    schemasToRemove: [
      'dynamic-product-jsonld',
      'dynamic-category-jsonld',
      'dynamic-recipe-jsonld',
      'dynamic-breadcrumb-jsonld'
    ]
  };
}

/**
 * Directly populates document head with unique title, meta tags, OpenGraph, Twitter, and Schema.org tags.
 */
export function applyMetadataToDocument(metadata: DynamicMetadata) {
  if (typeof document === 'undefined') return;

  // 1. Document Title
  document.title = metadata.title;

  // 2. Meta Tags Helper
  const setMetaTag = (attributeName: 'name' | 'property', attributeValue: string, content: string) => {
    let element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement | null;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attributeName, attributeValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // 3. Link Canonical Helper
  const setLinkTag = (rel: string, href: string) => {
    let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }
    element.setAttribute('href', href);
  };

  // 4. Schema.org JSON-LD Helper
  const setJsonLd = (id: string, schemaObj: object) => {
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaObj, null, 2);
  };

  const removeJsonLd = (id: string) => {
    const script = document.getElementById(id);
    if (script) script.remove();
  };

  // Populate Primary Meta Tags
  setMetaTag('name', 'description', metadata.description);
  setMetaTag('name', 'keywords', metadata.keywords);
  setMetaTag('name', 'author', metadata.author);
  setMetaTag('name', 'robots', metadata.robots);
  setLinkTag('canonical', metadata.canonicalUrl);

  // Populate Open Graph Tags
  setMetaTag('property', 'og:title', metadata.og.title);
  setMetaTag('property', 'og:description', metadata.og.description);
  setMetaTag('property', 'og:image', metadata.og.image);
  setMetaTag('property', 'og:url', metadata.og.url);
  setMetaTag('property', 'og:type', metadata.og.type);
  setMetaTag('property', 'og:site_name', metadata.og.siteName);
  setMetaTag('property', 'og:locale', metadata.og.locale);
  setMetaTag('property', 'og:locale:alternate', metadata.og.localeAlternate);

  // Populate Twitter Card Tags
  setMetaTag('name', 'twitter:card', metadata.twitter.card);
  setMetaTag('name', 'twitter:title', metadata.twitter.title);
  setMetaTag('name', 'twitter:description', metadata.twitter.description);
  setMetaTag('name', 'twitter:image', metadata.twitter.image);

  // Cleanup obsolete Schema.org tags
  for (const id of metadata.schemasToRemove) {
    removeJsonLd(id);
  }

  // Populate active Schema.org JSON-LD tags
  for (const item of metadata.schemas) {
    setJsonLd(item.id, item.schema);
  }
}

/**
 * React hook that actively manages and synchronizes head metadata with the current route context.
 * Automatically triggers updates upon entity changes (product, category, recipe) and browser popstate/navigation events.
 */
export function useDynamicSeo({
  product,
  category,
  recipe,
  settings,
  locale,
  pageType,
  customTitle,
  customDescription
}: UseDynamicSeoProps) {
  const updateSeo = useCallback(() => {
    // Detect route context from URL if not explicitly provided
    let effectivePageType = pageType;
    if (!effectivePageType && typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname === '/recipes') effectivePageType = 'recipes';
      else if (pathname === '/about') effectivePageType = 'about';
      else if (pathname === '/contact') effectivePageType = 'contact';
      else if (pathname.startsWith('/recipes/')) effectivePageType = 'recipe';
      else if (pathname.startsWith('/products/')) effectivePageType = 'product';
      else if (pathname.startsWith('/categories/')) effectivePageType = 'category';
      else if (pathname === '/' || pathname === '') effectivePageType = 'home';
    }

    const metadata = generateDynamicMetadata({
      product,
      category,
      recipe,
      settings,
      locale,
      pageType: effectivePageType,
      customTitle,
      customDescription
    });

    applyMetadataToDocument(metadata);
  }, [product, category, recipe, settings, locale, pageType, customTitle, customDescription]);

  useEffect(() => {
    updateSeo();

    // Listen to browser forward/back buttons and client-side history navigation
    const handleRouteChange = () => {
      updateSeo();
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [updateSeo]);
}
