"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * A reusable pagination component with Tailwind CSS styling.
 * It displays "Previous" and "Next" buttons, along with a range of page numbers.
 * @param {number} currentPage The currently active page number.
 * @param {number} totalPages The total number of pages available.
 * @param {function} onPageChange A callback function to handle page changes.
 */
const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  // Do not render the component if there is only one page or fewer.
  if (totalPages <= 1) {
    return null;
  }

  // Determine the range of pages to display around the current page.
  // This helps keep the pagination controls from getting too long.
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust startPage if we're at the end of the page list
    if (endPage - startPage + 1 < maxPagesToShow && endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    // Add the main range of pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous Page"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </button>

      <ul className="flex items-center space-x-2">
        {pageNumbers.map((page, index) => (
          <li key={index}>
            {page === "..." ? (
              <span className="px-3 py-2 text-sm text-gray-700">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            )}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next Page"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </nav>
  );
};

export default Pagination;
