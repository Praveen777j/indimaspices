/**
 * Slug generation and URL resolution utilities for Indima Spice Co.
 * Generates deterministic, clean, human-readable SEO slugs.
 */

/**
 * Converts a text string into an SEO-friendly URL slug.
 * Example: "Stone-Ground Malnad Garam Masala" -> "stone-ground-malnad-garam-masala"
 */
export function createSlug(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Returns the canonical slug for a product based on its English name.
 */
export function getProductSlug(product: { name_en: string; id?: string }): string {
  return createSlug(product.name_en) || (product.id ? createSlug(product.id) : 'product');
}

/**
 * Returns the canonical slug for a category based on its English name.
 */
export function getCategorySlug(category: { name_en: string; id?: string }): string {
  return createSlug(category.name_en) || (category.id ? createSlug(category.id) : 'category');
}

/**
 * Returns the canonical slug for a recipe based on its English title.
 */
export function getRecipeSlug(recipe: { title_en?: string; title_kn?: string; id?: string }): string {
  return createSlug(recipe.title_en || '') || (recipe.id ? createSlug(recipe.id) : 'recipe');
}

/**
 * Finds a product by its SEO slug, ID, or SKU.
 */
export function findProductBySlugOrId<T extends { id: string; name_en: string; sku?: string }>(
  slugOrId: string,
  products: T[]
): T | undefined {
  if (!slugOrId || !Array.isArray(products)) return undefined;
  const clean = slugOrId.toLowerCase().trim();

  // 1. Check exact slug match on name_en
  const bySlug = products.find(p => createSlug(p.name_en) === clean);
  if (bySlug) return bySlug;

  // 2. Check exact ID match
  const byId = products.find(p => p.id.toLowerCase() === clean);
  if (byId) return byId;

  // 3. Check SKU match
  const bySku = products.find(p => p.sku && p.sku.toLowerCase() === clean);
  if (bySku) return bySku;

  return undefined;
}

/**
 * Finds a category by its SEO slug or ID.
 */
export function findCategoryBySlugOrId<T extends { id: string; name_en: string }>(
  slugOrId: string,
  categories: T[]
): T | undefined {
  if (!slugOrId || !Array.isArray(categories)) return undefined;
  const clean = slugOrId.toLowerCase().trim();

  const bySlug = categories.find(c => createSlug(c.name_en) === clean);
  if (bySlug) return bySlug;

  const byId = categories.find(c => c.id.toLowerCase() === clean);
  if (byId) return byId;

  return undefined;
}

/**
 * Finds a recipe by its SEO slug or ID.
 */
export function findRecipeBySlugOrId<T extends { id: string; title_en?: string; title_kn?: string }>(
  slugOrId: string,
  recipes: T[]
): T | undefined {
  if (!slugOrId || !Array.isArray(recipes)) return undefined;
  const clean = slugOrId.toLowerCase().trim();

  const bySlug = recipes.find(r => r.title_en && createSlug(r.title_en) === clean);
  if (bySlug) return bySlug;

  const byId = recipes.find(r => r.id.toLowerCase() === clean);
  if (byId) return byId;

  return undefined;
}
