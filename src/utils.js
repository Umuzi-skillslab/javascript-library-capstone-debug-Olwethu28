// ==========================================
// UTILS MODULE - Pure helper functions
// Demonstrates: pure functions, typeof checks, template literals
// ==========================================

// Pure function: Calculate fine amount based on days overdue
export function calculateFineAmount(daysOverdue, ratePerDay = 0.5) {
  if (typeof daysOverdue !== 'number' || daysOverdue < 0) return 0;
  if (typeof ratePerDay !== 'number' || ratePerDay < 0) return 0;
  return Math.round(daysOverdue * ratePerDay * 100) / 100;
}

// Pure function: Format book info into readable string
export function formatBookInfo(title, author, year, available, total) {
  if (typeof title !== 'string' || typeof author !== 'string') {
    return 'Invalid book information';
  }
  return `"${title}" by ${author} (${year}) - ${available}/${total} copies available`;
}

// Pure function: Recursive search by category with proper base case
export function searchBooksByCategory(books, category, index = 0) {
  if (!Array.isArray(books) || typeof category !== 'string') return [];
  if (index >= books.length) return []; // Base case - prevents stack overflow

  const results = searchBooksByCategory(books, category, index + 1);
  if (books[index]?.category?.toLowerCase() === category.toLowerCase()) {
    return [books[index], ...results];
  }
  return results;
}

// Pure function: Validate ISBN format
export function isValidISBN(isbn) {
  if (typeof isbn !== 'string') return false;
  const cleaned = isbn.replace(/[-\s]/g, '');
  return cleaned.length === 10 || cleaned.length === 13;
}

// Pure function: Calculate days between two dates
export function daysBetween(date1, date2) {
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) return 0;
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Recursive function: Calculate factorial with proper base case
export function factorial(n) {
  if (typeof n !== 'number' || n < 0) return 0;
  if (n <= 1) return 1; // Base case
  return n * factorial(n - 1);
}

// CommonJS export for Jest compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateFineAmount, formatBookInfo, searchBooksByCategory,
    isValidISBN, daysBetween, factorial
  };
}