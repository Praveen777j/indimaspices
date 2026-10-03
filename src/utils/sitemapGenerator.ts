import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Category, Recipe } from '../types';
import { getProductSlug, getCategorySlug, getRecipeSlug } from './slug';

export const CANONICAL_ORIGIN = 'https://indima-spices-co.onrender.com';

/**
 * Disallowed private, transactional, and administrative routes that must NEVER be leaked in public sitemaps.
 */
export const DISALLOWED_SITEMAP_ROUTES = [
  /^\/admin(\/|$)/i,
  /^\/api(\/|$)/i,
  /^\/checkout(\/|$)/i,
  /^\/cart(\/|$)/i,
  /^\/account(\/|$)/i,
  /^\/order-tracking(\/|$)/i,
  /^\/tracking(\/|$)/i,
  /^\/track(\/|$)/i,
  /^\/wishlist(\/|$)/i,
  /^\/login(\/|$)/i,
  /^\/signin(\/|$)/i
];

/**
 * Validates that a route path is safe and public for search engine indexing.
 */
export function isAllowedPublicSitemapPath(path: string): boolean {
  if (!path) return false;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return !DISALLOWED_SITEMAP_ROUTES.some(regex => regex.test(clean));
}

/**
 * Escapes special XML characters to prevent malformed XML sitemaps.
 */
export function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formats a given date or timestamp into a valid W3C Datetime string (YYYY-MM-DD)
 * for search engine sitemaps.
 */
export function formatLastMod(dateInput?: string | number | Date | null): string {
  if (!dateInput) {
    return new Date().toISOString().split('T')[0];
  }
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Fetches all active products, categories, and recipes directly from Firestore collections.
 */
export async function fetchCatalogFromFirestore(): Promise<{
  products: Product[];
  categories: Category[];
  recipes: Recipe[];
}> {
  const products: Product[] = [];
  const categories: Category[] = [];
  const recipes: Recipe[] = [];

  try {
    // 1. Fetch Products
    const prodSnap = await getDocs(collection(db, 'products'));
    prodSnap.forEach(docSnap => {
      const data = docSnap.data() as Product;
      if (data && data.active !== false) {
        products.push({ ...data, id: docSnap.id || data.id });
      }
    });
  } catch (err: any) {
    console.warn('[Sitemap Generator] Notice fetching products from Firestore:', err?.message || err);
  }

  try {
    // 2. Fetch Categories
    const catSnap = await getDocs(collection(db, 'categories'));
    catSnap.forEach(docSnap => {
      const data = docSnap.data() as Category;
      if (data && data.enabled !== false) {
        categories.push({ ...data, id: docSnap.id || data.id });
      }
    });
  } catch (err: any) {
    console.warn('[Sitemap Generator] Notice fetching categories from Firestore:', err?.message || err);
  }

  try {
    // 3. Fetch Recipes
    const recSnap = await getDocs(collection(db, 'recipes'));
    recSnap.forEach(docSnap => {
      const data = docSnap.data() as Recipe;
      if (data && data.active !== false) {
        recipes.push({ ...data, id: docSnap.id || data.id });
      }
    });
  } catch (err: any) {
    console.warn('[Sitemap Generator] Notice fetching recipes from Firestore:', err?.message || err);
  }

  return { products, categories, recipes };
}

export interface BuildSitemapOptions {
  products: Product[];
  categories: Category[];
  recipes: Recipe[];
  baseUrl?: string;
}

/**
 * Builds a valid XML sitemap string formatted for Google Search Console and other search engines.
 * Includes lastmod dates, change frequencies, priority values, and image tags.
 */
export function buildSitemapXml({
  products,
  categories,
  recipes,
  baseUrl = CANONICAL_ORIGIN
}: BuildSitemapOptions): string {
  const origin = baseUrl.replace(/\/+$/, '');
  const today = formatLastMod(new Date());

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // 1. Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${escapeXml(origin)}/</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `    <image:image>\n`;
  xml += `      <image:loc>${escapeXml(origin)}/indima-brand-logo.jpg</image:loc>\n`;
  xml += `      <image:title>${escapeXml('Indima Spice Co. Authentic Homemade Spices')}</image:title>\n`;
  xml += `      <image:caption>${escapeXml(
    'Authentic homemade Indian spices and masalas crafted with traditional flavours, quality ingredients and the rich heritage of Karnataka.'
  )}</image:caption>\n`;
  xml += `    </image:image>\n`;
  xml += `  </url>\n`;

  // 2. Public Informational Pages
  const staticPages = [
    { path: '/recipes', priority: '0.8', changefreq: 'weekly', lastmod: today },
    { path: '/about', priority: '0.7', changefreq: 'monthly', lastmod: today },
    { path: '/contact', priority: '0.7', changefreq: 'monthly', lastmod: today }
  ];

  for (const page of staticPages) {
    if (!isAllowedPublicSitemapPath(page.path)) continue;
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(origin + page.path)}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // 3. Category Pages with unique crawlable /categories/{slug} URLs
  for (const cat of categories) {
    if (cat.enabled === false) continue;
    const slug = getCategorySlug(cat);
    const catPath = `/categories/${slug}`;
    if (!isAllowedPublicSitemapPath(catPath)) continue;

    const catLastMod = formatLastMod(cat.updated_at || cat.created_at);
    const catImg = cat.image || '/indima-brand-logo.jpg';
    const absoluteImg = catImg.startsWith('http') ? catImg : `${origin}${catImg.startsWith('/') ? '' : '/'}${catImg}`;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(`${origin}${catPath}`)}</loc>\n`;
    xml += `    <lastmod>${catLastMod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${escapeXml(absoluteImg)}</image:loc>\n`;
    xml += `      <image:title>${escapeXml(cat.name_en || 'Spice Range')}</image:title>\n`;
    if (cat.description_en) {
      xml += `      <image:caption>${escapeXml(cat.description_en)}</image:caption>\n`;
    }
    xml += `    </image:image>\n`;
    xml += `  </url>\n`;
  }

  // 4. Product Pages with unique crawlable /products/{slug} URLs
  for (const prod of products) {
    if (prod.active === false) continue;
    const slug = getProductSlug(prod);
    const prodPath = `/products/${slug}`;
    if (!isAllowedPublicSitemapPath(prodPath)) continue;

    const prodLastMod = formatLastMod(prod.updated_at || prod.created_at);
    const prodImg = (prod.images && prod.images.length > 0 ? prod.images[0] : (prod as any).image) || '/indima-brand-logo.jpg';
    const absoluteImg = prodImg.startsWith('http') ? prodImg : `${origin}${prodImg.startsWith('/') ? '' : '/'}${prodImg}`;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(`${origin}${prodPath}`)}</loc>\n`;
    xml += `    <lastmod>${prodLastMod}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${escapeXml(absoluteImg)}</image:loc>\n`;
    xml += `      <image:title>${escapeXml(prod.name_en || 'Pure Spice')}</image:title>\n`;
    if (prod.description_en) {
      xml += `      <image:caption>${escapeXml(prod.description_en)}</image:caption>\n`;
    }
    xml += `    </image:image>\n`;
    xml += `  </url>\n`;
  }

  // 5. Recipe Pages with unique crawlable /recipes/{slug} URLs
  for (const rec of recipes) {
    if (rec.active === false) continue;
    const slug = getRecipeSlug(rec);
    const recPath = `/recipes/${slug}`;
    if (!isAllowedPublicSitemapPath(recPath)) continue;

    const recLastMod = formatLastMod(rec.updated_at || rec.created_at);
    const recImg = rec.image || '/indima-brand-logo.jpg';
    const absoluteImg = recImg.startsWith('http') ? recImg : `${origin}${recImg.startsWith('/') ? '' : '/'}${recImg}`;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(`${origin}${recPath}`)}</loc>\n`;
    xml += `    <lastmod>${recLastMod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.85</priority>\n`;
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${escapeXml(absoluteImg)}</image:loc>\n`;
    xml += `      <image:title>${escapeXml(rec.title_en || 'Karnataka Recipe')}</image:title>\n`;
    if (rec.description_en) {
      xml += `      <image:caption>${escapeXml(rec.description_en)}</image:caption>\n`;
    }
    xml += `    </image:image>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

/**
 * Fetches all products, categories, and recipes from Firestore and generates
 * the complete XML sitemap.
 */
export async function generateSitemapXml(baseUrl = CANONICAL_ORIGIN): Promise<string> {
  const { products, categories, recipes } = await fetchCatalogFromFirestore();
  return buildSitemapXml({ products, categories, recipes, baseUrl });
}

export default generateSitemapXml;
