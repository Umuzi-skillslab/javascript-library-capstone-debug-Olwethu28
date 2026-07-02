import { calculateFineAmount, formatBookInfo, searchBooksByCategory, daysBetween } from './utils.js';
import { saveToLocalStorage, loadFromLocalStorage } from './storage.js';

// Constants - properly declared with const (fixed: were undeclared)
const MAX_BOOKS_PER_MEMBER = 5;
const MAX_BOOKS_PREMIUM = 10;
const FINE_PER_DAY = 0.50;
const LOAN_PERIOD_DAYS = 14;

// ==========================================
// BOOK CLASS
// ==========================================
class Book {
  constructor(isbn, title, author, year, copies = 1, category = 'General') {
    // Parameter validation with typeof checks
    if (typeof isbn !== 'string' || !isbn) {
      throw new Error('ISBN must not be empty');
    }
    if (typeof title !== 'string' || !title) {
      throw new Error('Title must not be empty');
    }
    if (typeof author !== 'string' || !author) {
      throw new Error('Author must not be empty');
    }

    this.isbn = isbn;
    this.title = title;
    this.author = author;
    this.year = year;
    // Fixed: added missing totalCopies and availableCopies properties
    this.totalCopies = copies;
    this.availableCopies = copies;
    this.category = category;
  }

  // Added: Check if book is available
  isAvailable() {
    return this.availableCopies > 0;
  }

  // Added: Get formatted book info using template literals
  getInfo() {
    return formatBookInfo(this.title, this.author, this.year, this.availableCopies, this.totalCopies);
  }

  // Fixed: validates available copies before checkout
  checkOut() {
    if (this.availableCopies <= 0) {
      throw new Error(`No copies of "${this.title}" available`);
    }
    this.availableCopies--;
    return true;
  }

  // Added: Return a copy of the book
  returnBook() {
    if (this.availableCopies >= this.totalCopies) {
      throw new Error(`All copies of "${this.title}" already returned`);
    }
    this.availableCopies++;
    return true;
  }
}

// ==========================================
// DIGITAL BOOK CLASS (inherits from Book)
// ==========================================
class DigitalBook extends Book {
  constructor(isbn, title, author, year, copies, category, fileFormat, fileSize) {
    // Fixed: added missing super() call
    super(isbn, title, author, year, copies, category);
    this.fileFormat = fileFormat || 'PDF';
    this.fileSize = fileSize || 0;
    this.downloadCount = 0;
  }

  // Override: digital books always available
  isAvailable() {
    return true;
  }

  // Digital-specific download method
  download() {
    this.downloadCount++;
    return `Downloading "${this.title}" in ${this.fileFormat} format (${this.fileSize}MB)`;
  }

  // Override getInfo with digital-specific details
  getInfo() {
    return `${super.getInfo()} [Digital: ${this.fileFormat}, ${this.fileSize}MB]`;
  }
}

// ==========================================
// MEMBER CLASS
// ==========================================
class Member {
  constructor(id, name, email) {
    if (typeof id !== 'number' || id <= 0) {
      throw new Error('Member ID must be a positive number');
    }
    if (typeof name !== 'string' || !name) {
      throw new Error('Name must be a non-empty string');
    }

    this.id = id;
    this.name = name;
    this.email = email || '';
    this.borrowedBooks = [];
    // Fixed: added missing joinDate property
    this.joinDate = new Date();
    this.borrowHistory = [];
  }

  // Fixed: was using = (assignment) instead of === (comparison)
  canBorrow() {
    return this.borrowedBooks.length < MAX_BOOKS_PER_MEMBER;
  }

  // Added: Get membership duration using daysBetween
  getMembershipDuration() {
    return daysBetween(this.joinDate, new Date());
  }

  // Added: Get member profile using destructuring + template literals
  getProfile() {
    const { id, name, email, borrowedBooks } = this;
    return `Member #${id}: ${name} (${email}) - ${borrowedBooks.length} books borrowed`;
  }

  // Borrow a book with full validation
  borrowBook(book) {
    if (!book || !(book instanceof Book)) {
      throw new Error('Invalid book');
    }
    if (!this.canBorrow()) {
      throw new Error(`${this.name} has reached the borrowing limit`);
    }
    if (!book.isAvailable()) {
      throw new Error(`"${book.title}" is not available`);
    }

    book.checkOut();
    const record = {
      isbn: book.isbn,
      title: book.title,
      borrowDate: new Date().toISOString()
    };
    this.borrowedBooks.push(record);
    this.borrowHistory.push({ ...record, action: 'borrow' });
    return true;
  }

  // Return a book using findIndex
  returnBook(isbn) {
    if (typeof isbn !== 'string' || !isbn) {
      throw new Error('Invalid ISBN');
    }
    const bookIndex = this.borrowedBooks.findIndex(b => b.isbn === isbn);
    if (bookIndex === -1) {
      throw new Error('Book not found in borrowed list');
    }
    // Array destructuring on splice result
    const [returned] = this.borrowedBooks.splice(bookIndex, 1);
    this.borrowHistory.push({
      isbn: returned.isbn,
      title: returned.title,
      returnDate: new Date().toISOString(),
      action: 'return'
    });
    return returned;
  }
}

// ==========================================
// PREMIUM MEMBER CLASS (inherits from Member)
// ==========================================
class PremiumMember extends Member {
  constructor(id, name, email) {
    super(id, name, email);
    this.membershipType = 'Premium';
    this.discountRate = 0.1;
  }

  // Override: premium members can borrow more books
  canBorrow() {
    return this.borrowedBooks.length < MAX_BOOKS_PREMIUM;
  }

  // Premium-specific benefits info
  getBenefits() {
    return `Premium Benefits: Borrow up to ${MAX_BOOKS_PREMIUM} books, ${this.discountRate * 100}% discount on fees`;
  }
}

class Library {
  constructor(name = 'Community Library') {
    this.name = name;
    // Fixed: properly declared with let/const (was undeclared)
    this.books = [];
    this.members = [];
    this.borrowedBooks = [];
    this.nextMemberId = 1;
    // Map data structure for O(1) ISBN lookups
    this.isbnIndex = new Map();
  }

  // Add a book with validation
  addBook(book) {
    if (!book || !(book instanceof Book)) {
      throw new Error('Invalid book object');
    }
    if (this.isbnIndex.has(book.isbn)) {
      throw new Error(`Book with ISBN ${book.isbn} already exists`);
    }
    this.books.push(book);
    this.isbnIndex.set(book.isbn, book);
    return book;
  }

  // Add multiple books using rest parameters
  addMultipleBooks(...books) {
    const added = [];
    for (const book of books) {
      try {
        this.addBook(book);
        added.push(book);
      } catch (error) {
        console.warn(`Skipped: ${error.message}`);
      }
    }
    return added;
  }

  // Find book by ISBN using Map for O(1) lookup
  findBookByISBN(isbn) {
    if (typeof isbn !== 'string') return null;
    return this.isbnIndex.get(isbn) || null;
  }

  // Register a new member
  addMember(name, email, isPremium = false) {
    if (typeof name !== 'string' || !name) {
      throw new Error('Name must not be empty');
    }
    const id = this.nextMemberId++;
    const member = isPremium
      ? new PremiumMember(id, name, email)
      : new Member(id, name, email);
    this.members.push(member);
    return member;
  }

  // Find member by ID using find (fixed: was using = instead of ===)
  findMemberById(id) {
    if (typeof id !== 'number') return null;
    return this.members.find(member => member.id === id) || null;
  }

  // Borrow a book with try-catch error handling
  borrowBook(memberId, isbn) {
    try {
      const member = this.findMemberById(memberId);
      if (!member) throw new Error(`Member ${memberId} not found`);

      const book = this.findBookByISBN(isbn);
      if (!book) throw new Error(`Book with ISBN ${isbn} not found`);

      member.borrowBook(book);
      this.borrowedBooks.push({
        memberId,
        isbn,
        memberName: member.name,
        bookTitle: book.title,
        borrowDate: new Date().toISOString()
      });

      return { success: true, message: `"${book.title}" borrowed by ${member.name}` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Return a book
  returnBook(memberId, isbn) {
    try {
      const member = this.findMemberById(memberId);
      if (!member) throw new Error(`Member ${memberId} not found`);

      const book = this.findBookByISBN(isbn);
      if (!book) throw new Error(`Book with ISBN ${isbn} not found`);

      member.returnBook(isbn);
      book.returnBook();

      // Remove from library borrowed records
      const index = this.borrowedBooks.findIndex(
        record => record.memberId === memberId && record.isbn === isbn
      );
      if (index !== -1) {
        this.borrowedBooks.splice(index, 1);
      }

      return { success: true, message: `"${book.title}" returned by ${member.name}` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get books by author using filter (fixed: was using == and manual loop)
  getBooksByAuthor(author) {
    if (typeof author !== 'string') return [];
    return this.books.filter(book =>
      book.author.toLowerCase() === author.toLowerCase()
    );
  }

  // Get available books using filter
  getAvailableBooks() {
    return this.books.filter(book => book.isAvailable());
  }

  // Get books by category using filter
  getBooksByCategory(category) {
    if (typeof category !== 'string') return [];
    return this.books.filter(book =>
      book.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Calculate total late fees using reduce
  calculateTotalLateFees() {
    const now = new Date();
    return this.borrowedBooks.reduce((total, record) => {
      const borrowDate = new Date(record.borrowDate);
      const daysOut = daysBetween(borrowDate, now);
      const daysOverdue = Math.max(0, daysOut - LOAN_PERIOD_DAYS);
      return total + calculateFineAmount(daysOverdue, FINE_PER_DAY);
    }, 0);
  }

  // Get most popular book using reduce
  getMostPopularBook() {
    if (this.books.length === 0) return null;
    return this.books.reduce((mostPopular, book) => {
      const borrowed = book.totalCopies - book.availableCopies;
      const mostBorrowed = mostPopular.totalCopies - mostPopular.availableCopies;
      return borrowed > mostBorrowed ? book : mostPopular;
    });
  }

  // Search books across title, author, ISBN using filter
  searchBooks(query) {
    if (typeof query !== 'string' || !query.trim()) return [];
    const lowerQuery = query.toLowerCase().trim();
    return this.books.filter(book =>
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.isbn.toLowerCase().includes(lowerQuery)
    );
  }

  // Combine collections using spread operator
  combineBookCollections(...collections) {
    const combined = [...this.books];
    for (const collection of collections) {
      if (Array.isArray(collection)) {
        combined.push(...collection);
      }
    }
    return combined;
  }

  // Get library stats using destructuring
  getStats() {
    const totalBooks = this.books.length;
    const totalMembers = this.members.length;
    const totalBorrowed = this.borrowedBooks.length;
    const totalAvailable = this.books.reduce(
      (sum, book) => sum + book.availableCopies, 0
    );
    return { totalBooks, totalMembers, totalBorrowed, totalAvailable };
  }

  // Update member info using object destructuring in parameters
  updateMemberInfo(memberId, { name, email } = {}) {
    const member = this.findMemberById(memberId);
    if (!member) throw new Error(`Member ${memberId} not found`);
    if (typeof name === 'string' && name) member.name = name;
    if (typeof email === 'string' && email) member.email = email;
    return member;
  }

  // Check if ANY borrowed book is overdue (uses 'some')
  hasOverdueBooks() {
    const now = new Date();
    return this.borrowedBooks.some(record => {
      const dueDate = new Date(record.borrowDate);
      dueDate.setDate(dueDate.getDate() + LOAN_PERIOD_DAYS);
      return now > dueDate;
    });
  }

  // Check if ALL books in library are available (uses 'every')
  allBooksAvailable() {
    return this.books.every(book => book.availableCopies > 0);
  }

  // Get overdue books with fines using map and filter
  getOverdueBooks() {
    const now = new Date();
    return this.borrowedBooks
      .map(record => {
        const borrowDate = new Date(record.borrowDate);
        const daysOut = daysBetween(borrowDate, now);
        const daysOverdue = Math.max(0, daysOut - LOAN_PERIOD_DAYS);
        return { ...record, daysOverdue, fine: calculateFineAmount(daysOverdue, FINE_PER_DAY) };
      })
      .filter(record => record.daysOverdue > 0);
  }

  // Get all unique categories using map + Set spread
  getCategories() {
    return [...new Set(this.books.map(book => book.category))];
  }

  // Save library state to localStorage
  saveState() {
    const state = {
      name: this.name,
      books: this.books.map(({ isbn, title, author, year, totalCopies, availableCopies, category }) => ({
        isbn, title, author, year, totalCopies, availableCopies, category
      })),
      members: this.members.map(({ id, name, email, borrowedBooks, membershipType }) => ({
        id, name, email, borrowedBooks, isPremium: membershipType === 'Premium'
      })),
      borrowedBooks: [...this.borrowedBooks],
      nextMemberId: this.nextMemberId
    };
    return saveToLocalStorage('libraryState', state);
  }

  // Load library state from localStorage
  loadState() {
    const state = loadFromLocalStorage('libraryState');
    if (!state) return false;

    try {
      this.name = state.name || 'Community Library';
      this.books = [];
      this.isbnIndex.clear();
      this.members = [];
      this.borrowedBooks = state.borrowedBooks || [];
      this.nextMemberId = state.nextMemberId || 1;

      if (Array.isArray(state.books)) {
        for (const bookData of state.books) {
          const { isbn, title, author, year, totalCopies, availableCopies, category } = bookData;
          const book = new Book(isbn, title, author, year, totalCopies, category);
          book.availableCopies = availableCopies;
          this.books.push(book);
          this.isbnIndex.set(isbn, book);
        }
      }

      if (Array.isArray(state.members)) {
        for (const memberData of state.members) {
          const { id, name, email, borrowedBooks: borrowed, isPremium } = memberData;
          const member = isPremium
            ? new PremiumMember(id, name, email)
            : new Member(id, name, email);
          member.borrowedBooks = borrowed || [];
          this.members.push(member);
        }
      }
      return true;
    } catch (error) {
      console.error(`Error loading state: ${error.message}`);
      return false;
    }
  }
}

const LibraryStats = {
  // Calculate average using Math.round
  averageBooksPerMember(library) {
    if (!library || library.members.length === 0) return 0;
    const totalBorrowed = library.members.reduce(
      (sum, member) => sum + member.borrowedBooks.length, 0
    );
    return Math.round((totalBorrowed / library.members.length) * 100) / 100;
  },

  // Category distribution using for-of loop
  getCategoryDistribution(library) {
    if (!library) return {};
    const distribution = {};
    for (const book of library.books) {
      const cat = book.category || 'Uncategorized';
      distribution[cat] = (distribution[cat] || 0) + 1;
    }
    return distribution;
  },

  // Library summary using destructuring
  getSummary(library) {
    if (!library) return null;
    const { totalBooks, totalMembers, totalBorrowed, totalAvailable } = library.getStats();
    return {
      totalBooks,
      totalMembers,
      totalBorrowed,
      totalAvailable,
      utilizationRate: totalBooks > 0
        ? `${Math.round(((totalBooks - totalAvailable) / totalBooks) * 100)}%`
        : '0%'
    };
  },


  hasMaxedOutMembers(library) {
    if (!library) return false;
    return library.members.some(member => !member.canBorrow());
  }
};

// ES6 exports for browser
export {
  Book, DigitalBook, Member, PremiumMember, Library, LibraryStats,
  MAX_BOOKS_PER_MEMBER, MAX_BOOKS_PREMIUM, FINE_PER_DAY, LOAN_PERIOD_DAYS
};

// CommonJS export for Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Book, DigitalBook, Member, PremiumMember, Library, LibraryStats,
    MAX_BOOKS_PER_MEMBER, MAX_BOOKS_PREMIUM, FINE_PER_DAY, LOAN_PERIOD_DAYS 
  };
}