import { Course } from "@/app/types/app";

export interface BundleWithCourses extends Course {
  bundleCourses: Course[];
}

export interface BundleFilterOptions {
  category?: string;
  selectedTags?: string[];
  searchQuery?: string;
}

/**
 * Extracts all unique tags from a bundle (combining the root course and all child courses).
 */
export function getBundleTags(bundle: BundleWithCourses): string[] {
  const tagSet = new Set<string>();
  if (Array.isArray(bundle.tags)) {
    bundle.tags.forEach((t) => {
      if (typeof t === "string" && t.trim()) tagSet.add(t.trim());
    });
  }
  if (Array.isArray(bundle.bundleCourses)) {
    bundle.bundleCourses.forEach((c) => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach((t) => {
          if (typeof t === "string" && t.trim()) tagSet.add(t.trim());
        });
      }
    });
  }
  return Array.from(tagSet).sort();
}

/**
 * Extracts all unique categories represented within a bundle.
 */
export function getBundleCategories(bundle: BundleWithCourses): string[] {
  const catSet = new Set<string>();
  if (bundle.category && bundle.category.trim()) {
    catSet.add(bundle.category.trim());
  }
  if (Array.isArray(bundle.bundleCourses)) {
    bundle.bundleCourses.forEach((c) => {
      if (c.category && c.category.trim()) {
        catSet.add(c.category.trim());
      }
    });
  }
  return Array.from(catSet).sort();
}

/**
 * Collects all unique tags across an entire list of bundles.
 */
export function getAllBundleTags(bundles: BundleWithCourses[]): string[] {
  const tagSet = new Set<string>();
  bundles.forEach((bundle) => {
    getBundleTags(bundle).forEach((t) => tagSet.add(t));
  });
  return Array.from(tagSet).sort();
}

/**
 * Collects all unique categories across an entire list of bundles.
 */
export function getAllBundleCategories(bundles: BundleWithCourses[]): string[] {
  const catSet = new Set<string>();
  bundles.forEach((bundle) => {
    getBundleCategories(bundle).forEach((c) => catSet.add(c));
  });
  return Array.from(catSet).sort();
}

/**
 * Filters an array of bundles using category, tags, and search query.
 */
export function filterBundles(
  bundles: BundleWithCourses[],
  options: BundleFilterOptions,
): BundleWithCourses[] {
  const { category = "All", selectedTags = [], searchQuery = "" } = options;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return bundles.filter((bundle) => {
    const bundleCategories = getBundleCategories(bundle);
    const bundleTags = getBundleTags(bundle);

    // 1. Category check
    const matchesCategory =
      !category ||
      category === "All" ||
      bundleCategories.some(
        (cat) => cat.toLowerCase() === category.toLowerCase(),
      );

    if (!matchesCategory) {
      return false;
    }

    // 2. Tags check (every selected tag must exist in the bundle)
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((st) =>
        bundleTags.some((bt) => bt.toLowerCase() === st.toLowerCase()),
      );

    if (!matchesTags) {
      return false;
    }

    // 3. Search query check
    if (!normalizedQuery) {
      return true;
    }

    const matchesTitle = bundle.title
      ? bundle.title.toLowerCase().includes(normalizedQuery)
      : false;
    const matchesDescription = bundle.description
      ? bundle.description.toLowerCase().includes(normalizedQuery)
      : false;
    const matchesCategoryQuery = bundleCategories.some((cat) =>
      cat.toLowerCase().includes(normalizedQuery),
    );
    const matchesTagQuery = bundleTags.some((tag) =>
      tag.toLowerCase().includes(normalizedQuery),
    );
    const matchesCourseTitle = Array.isArray(bundle.bundleCourses)
      ? bundle.bundleCourses.some((c) =>
          c.title ? c.title.toLowerCase().includes(normalizedQuery) : false,
        )
      : false;

    return (
      matchesTitle ||
      matchesDescription ||
      matchesCategoryQuery ||
      matchesTagQuery ||
      matchesCourseTitle
    );
  });
}
