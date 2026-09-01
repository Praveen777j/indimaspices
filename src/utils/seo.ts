import { Product, Category, BusinessSettings } from '../types';

export interface SeoMetaOptions {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  locale?: string;
  product?: Product | null;
  category?: Category | null;
  settings?: BusinessSettings | null;
}

const DEFAULT_TITLE = "Indima Spice Co. | Pure as mother's love | Authentic Stone-Ground Spices";
const DEFAULT_DESCRIPTION =
  "Handcrafted, stone-ground authentic traditional Karnataka & Indian spices, aromatic masalas, and immunity blends. 100% natural with zero chemicals, preservatives, or artificial colors. Fast pan-India delivery.";
const DEFAULT_IMAGE = "https://indimaspice.com/indima-brand-logo.jpg";
const DEFAULT_URL = "https://indimaspice.com/";
const DEFAULT_KEYWORDS =
  "Indima Spice Co, stone ground spices, Karnataka spices, authentic sambar powder, rasam powder, organic masalas, pure turmeric, Byadagi chilli powder, traditional Indian spices Bengaluru";

/**
 * Helper to get or create a meta tag element in document.head
 */
function setMetaTag(attributeName: 'name' | 'property', attributeValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to get or create a link tag (e.g. canonical)
 */
function setLinkTag(rel: string, href: string) {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Injects or updates dynamic JSON-LD Structured Data for Google Rich Snippets
 */
function setJsonLd(id: string, schemaObj: object) {
  if (typeof document === 'undefined') return;
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schemaObj, null, 2);
}

/**
 * Dynamically updates document title, description, OpenGraph, Twitter Cards, and Schema.org
 */
export function updateDynamicSeo(options: SeoMetaOptions) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const currentOrigin = window.location.origin || 'https://indimaspice.com';
  const isKn = options.locale === 'kn';

  let finalTitle = options.title || DEFAULT_TITLE;
  let finalDescription = options.description || DEFAULT_DESCRIPTION;
  let finalImage = options.image || DEFAULT_IMAGE;
  let finalUrl = options.url || window.location.href;
  let finalType = options.type || 'website';
  let finalKeywords = options.keywords || DEFAULT_KEYWORDS;

  // If a product is actively selected, construct specialized e-commerce metadata
  if (options.product) {
    const p = options.product;
    const name = isKn && p.name_kn ? p.name_kn : p.name_en;
    const desc = (isKn && p.description_kn ? p.description_kn : p.description_en) || DEFAULT_DESCRIPTION;
    const shortDesc = desc.length > 155 ? desc.substring(0, 152) + '...' : desc;

    finalTitle = `${name} (₹${p.price} / ${p.weight}) | Indima Spice Co.`;
    finalDescription = `Buy ${name} online. ${shortDesc} Stone-ground, 100% pure Karnataka spices with no preservatives. Fast shipping.`;
    finalImage = p.images?.[0] || DEFAULT_IMAGE;
    if (finalImage.startsWith('/')) {
      finalImage = `${currentOrigin}${finalImage}`;
    }
    finalType = 'product';
    finalUrl = `${currentOrigin}/?product=${encodeURIComponent(p.id)}`;
    finalKeywords = `${name}, buy ${p.name_en}, stone ground ${p.name_en}, Indima Spices, Karnataka spices, authentic masalas`;

    // Inject Product JSON-LD Schema
    setJsonLd('dynamic-product-jsonld', {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": finalUrl,
      "name": p.name_en,
      "alternateName": p.name_kn,
      "description": p.description_en,
      "image": p.images?.map(img => img.startsWith('/') ? `${currentOrigin}${img}` : img) || [finalImage],
      "sku": p.sku || p.id,
      "brand": {
        "@type": "Brand",
        "name": "Indima Spice Co."
      },
      "offers": {
        "@type": "Offer",
        "url": finalUrl,
        "priceCurrency": "INR",
        "price": p.price,
        "priceValidUntil": "2027-12-31",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Indima Spice Co."
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": p.rating || 4.9,
        "reviewCount": Math.max(p.review_count || 1, 15),
        "bestRating": "5",
        "worstRating": "1"
      }
    });
  } else if (options.category) {
    const c = options.category;
    const catName = isKn && c.name_kn ? c.name_kn : c.name_en;
    const catDesc = (isKn && c.description_kn ? c.description_kn : c.description_en) || DEFAULT_DESCRIPTION;

    finalTitle = `${catName} Range | Authentic Stone-Ground Spices | Indima Spice Co.`;
    finalDescription = `Explore pure ${catName} collection from Indima Spice Co. ${catDesc} Stone-ground with zero chemicals.`;
    finalImage = c.image || DEFAULT_IMAGE;
    if (finalImage.startsWith('/')) {
      finalImage = `${currentOrigin}${finalImage}`;
    }
    finalUrl = `${currentOrigin}/?category=${encodeURIComponent(c.id)}`;
    finalKeywords = `${catName}, Karnataka spices, ${c.name_en}, stone ground masalas, authentic spices Bengaluru`;

    // Remove product specific jsonld if any
    const prodSchema = document.getElementById('dynamic-product-jsonld');
    if (prodSchema) prodSchema.remove();

    // Inject CollectionPage JSON-LD Schema
    setJsonLd('dynamic-category-jsonld', {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": catName,
      "url": finalUrl,
      "description": finalDescription,
      "publisher": {
        "@type": "Organization",
        "name": "Indima Spice Co."
      }
    });
  } else {
    // Clean up dynamic product/category JSON-LD on reset to default
    const prodSchema = document.getElementById('dynamic-product-jsonld');
    if (prodSchema) prodSchema.remove();
    const catSchema = document.getElementById('dynamic-category-jsonld');
    if (catSchema) catSchema.remove();
  }

  // 1. Update Document Title
  document.title = finalTitle;

  // 2. Standard Meta Tags
  setMetaTag('name', 'description', finalDescription);
  setMetaTag('name', 'keywords', finalKeywords);
  setMetaTag('name', 'author', 'Indima Spice Co.');
  setLinkTag('canonical', finalUrl);

  // 3. OpenGraph Tags (Facebook, WhatsApp, LinkedIn, Discord, Telegram)
  setMetaTag('property', 'og:title', finalTitle);
  setMetaTag('property', 'og:description', finalDescription);
  setMetaTag('property', 'og:image', finalImage);
  setMetaTag('property', 'og:url', finalUrl);
  setMetaTag('property', 'og:type', finalType === 'product' ? 'product' : 'website');
  setMetaTag('property', 'og:site_name', 'Indima Spice Co.');

  // 4. Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', finalTitle);
  setMetaTag('name', 'twitter:description', finalDescription);
  setMetaTag('name', 'twitter:image', finalImage);
}
