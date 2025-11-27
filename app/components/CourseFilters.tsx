import React from "react";
import { X } from "lucide-react";

interface CourseFiltersProps {
  categories: string[];
  tags: string[];
  selectedCategories: string[];
  selectedTags: string[];
  priceRange: { min: number; max: number };
  showFreeOnly: boolean;
  onCategoryChange: (category: string) => void;
  onTagChange: (tag: string) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onShowFreeOnlyChange: (showFree: boolean) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseFilters({
  categories,
  tags,
  selectedCategories,
  selectedTags,
  priceRange,
  showFreeOnly,
  onCategoryChange,
  onTagChange,
  onPriceRangeChange,
  onShowFreeOnlyChange,
  onClearFilters,
  isOpen,
  onClose,
}: CourseFiltersProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 lg:shadow-none lg:w-72 lg:block ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 h-full overflow-y-auto lg:sticky lg:top-24 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="flex justify-between items-center mb-8 lg:hidden">
            <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Categories */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                Categories
              </h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center group cursor-pointer"
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => onCategoryChange(category)}
                        className="peer h-5 w-5 text-primary border-2 border-gray-300 rounded focus:ring-primary/20 transition-all checked:border-primary checked:bg-primary"
                      />
                    </div>
                    <span className="ml-3 text-gray-600 group-hover:text-primary transition-colors font-medium">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Tags */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagChange(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedTags.includes(tag)
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Price */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Price</h3>
              <label className="flex items-center p-3 border border-gray-200 rounded-xl hover:border-primary/50 transition-colors cursor-pointer bg-gray-50/50">
                <input
                  type="checkbox"
                  checked={showFreeOnly}
                  onChange={(e) => onShowFreeOnlyChange(e.target.checked)}
                  className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary/20"
                />
                <span className="ml-3 font-medium text-gray-700">
                  Free Courses Only
                </span>
              </label>
            </div>

            {/* Clear Filters */}
            <button
              onClick={onClearFilters}
              className="w-full py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 hover:text-red-600 hover:border-red-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
