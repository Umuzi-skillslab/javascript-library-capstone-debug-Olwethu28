// Library Management System - Fixed and Complete

// ============================================================
// GLOBAL STATE - Fixed: proper declarations with let/const
// ============================================================
let books = [];                        // FIX: was missing declaration (implicit global)
let members = [];                      // FIX: was var, changed to let
const LATE_FEE_PER_DAY = 0.50;
const MAX_BOOKS_PER_MEMBER = 5;        // FIX: was missing const
const MAX_BOOKS_PREMIUM = 10;          // NEW: premium member limit

// NEW: Map for fast ISBN lookups
const isbnIndex = new Map();

// ============================================================
// Book Class - Fixed and completed
// ============================================================
class Book {
    constructor(isbn, title, author, year, copies = 1, category = 'fiction') {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.year = year;
        this.totalCopies = copies;           // FIX: was missing
        this.availableCopies = copies;       // FIX: was missing
        this.category = category;            // NEW: needed for search/filter
        this.checkedOut = [];
    }

    // NEW: method to check availability
    isAvailable() {
        return this.availableCopies > 0;
    }

    // NEW: method using template literals
    getInfo() {
        return `"${this.title}" by ${this.author} (${this.year}) - ISBN: ${this.isbn} | Available: ${this.availableCopies}/${this.totalCopies}`;
    }

    checkOut(memberId) {
        // FIX: added validation for available copies
        if (!this.isAvailable()) {
            return false;
        }
        this.checkedOut.push({
            memberId,
            checkoutDate: new Date()
        });
        this.availableCopies--;              // FIX: decrement available
        return true;
    }

    returnBook(memberId) {
        // NEW: return logic
        const idx = this.checkedOut.findIndex(record => record.memberId === memberId);
        if (idx === -1) return false;
        this.checkedOut.splice(idx, 1);
        this.availableCopies++;
        return true;
    }
}

// ============================================================
// DigitalBook Class - Fixed inheritance
// ============================================================
class DigitalBook extends Book {
    constructor(isbn, title, author, year, fileSize, format, category = 'fiction') {
        super(isbn, title, author, year, Infinity, category); // FIX: added super() call
        this.fileSize = fileSize;
        this.format = format;
        this.downloads = 0;
    }

    // Override: digital books track downloads, not physical checkout
    checkOut(memberId) {
        this.downloads++;
        this.checkedOut.push({
            memberId,
            checkoutDate: new Date()
        });
        return true;
    }

    getInfo() {
        return `${super.getInfo()} | Format: ${this.format} (${this.fileSize}MB) | Downloads: ${this.downloads}`;
    }
}

// ============================================================
// Member Class - Fixed
// ============================================================
class Member {
    constructor(id, name, email, membershipType = 'standard') {
        this.id = id;
        this.name = name;
        this.email = email;
        this.membershipType = membershipType;
        this.borrowedBooks = [];
        this.joinDate = new Date();          // FIX: was missing
    }

    // NEW: membership duration calculator
    getMembershipDuration() {
        const now = new Date();
        const diffMs = now - this.joinDate;
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return { days, months: Math.floor(days / 30), years: Math.floor(days / 365) };
    }

    // NEW: method using destructuring
    getProfile() {
        const { id, name, email, membershipType } = this;
        return { id, name, email, membershipType, bookCount: this.borrowedBooks.length };
    }

    canBorrow() {
        // FIX: was using = (assignment) instead of >= (comparison)
        if (this.borrowedBooks.length >= MAX_BOOKS_PER_MEMBER) {
            return false;
        }
        return true;
    }
}

// ============================================================
// PremiumMember - Fixed and completed
// ============================================================
class PremiumMember extends Member {
    constructor(id, name, email) {
        super(id, name, email, 'premium');
        this.discountRate = 0.1;             // NEW: 10% discount on fees
        this.priorityReservation = true;     // NEW: premium benefit
    }

    // NEW: override canBorrow for higher limit
    canBorrow() {
        return this.borrowedBooks.length < MAX_BOOKS_PREMIUM;
    }
}

// ============================================================
// Library functions - Fixed
// ============================================================

// Fixed: optimised with for-of, proper date logic
function findOverdueBooks(daysOverdue = 14) {
    const overdue = [];
    const now = new Date();

    for (const book of books) {                          // FIX: use for-of
        for (const record of book.checkedOut) {          // FIX: use for-of
            const diffMs = now - record.checkoutDate;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays > daysOverdue) {
                overdue.push({
                    ...record,                           // NEW: spread
                    bookIsbn: book.isbn,
                    bookTitle: book.title,
                    daysLate: diffDays - daysOverdue
                });
            }
        }
    }

    return overdue;
}

// Fixed: added index increment
function processReturnQueue(queue) {
    let index = 0;                                      // FIX: let instead of var

    while (index < queue.length) {
        const item = queue[index];
        console.log(`Processing return: ${item}`);       // FIX: template literal
        index++;                                         // FIX: was missing → infinite loop
    }
}

// Fixed: base case, null checks, correct operator
function searchBooksByCategory(bookList, category, index = 0) {
    // FIX: base case was missing
    if (!bookList || index >= bookList.length) {
        return [];
    }

    const rest = searchBooksByCategory(bookList, category, index + 1);

    // FIX: was using = (assignment) instead of === (comparison)
    if (bookList[index].category === category) {
        return [bookList[index], ...rest];              // NEW: spread instead of concat
    }

    return rest;
}

// Fixed: uses filter and strict equality
function getBooksByAuthor(authorName) {
    // FIX: replaced for loop with filter; == changed to ===
    return books.filter(book => book.author === authorName);
}

// Fixed: uses reduce
function calculateTotalLateFees(memberRecord) {
    if (!memberRecord || !memberRecord.overdueBooks) return 0;

    // FIX: replaced for loop with reduce
    return memberRecord.overdueBooks.reduce(
        (total, record) => total + record.daysLate * LATE_FEE_PER_DAY,
        0
    );
}

// Fixed: uses spread operator
function combineBookCollections(...collections) {       // FIX: rest parameter
    return collections.flat();                           // FIX: replaced manual loops
}

// Fixed: uses rest parameters
function addMultipleBooks(...newBooks) {                 // FIX: rest parameter
    for (const book of newBooks) {
        books.push(book);
        isbnIndex.set(book.isbn, book);                 // NEW: index
    }
}

// Fixed: uses destructuring
function updateMemberInfo(member, updates) {
    const { name, email, membershipType } = updates;    // FIX: destructuring
    if (name !== undefined) member.name = name;
    if (email !== undefined) member.email = email;
    if (membershipType !== undefined) member.membershipType = membershipType;
    return member;
}

// Fixed: full error handling, validation
function borrowBook(memberId, isbn) {
    try {                                                // FIX: try-catch
        if (memberId == null || isbn == null) {          // FIX: null/undefined check
            throw new Error('Member ID and ISBN are required');
        }
        if (typeof memberId !== 'number' && typeof memberId !== 'string') {
            throw new TypeError('Member ID must be a number or string');
        }

        const member = findMemberById(memberId);
        const book = findBookByISBN(isbn);

        if (!member) throw new Error(`Member ${memberId} not found`);
        if (!book) throw new Error(`Book with ISBN ${isbn} not found`);

        if (!member.canBorrow()) {
            throw new Error('Member has reached borrowing limit');
        }

        if (!book.isAvailable()) {
            throw new Error('No copies available');
        }

        book.checkOut(memberId);
        member.borrowedBooks.push(isbn);
        return true;
    } catch (error) {
        console.error(`Borrow failed: ${error.message}`);
        return false;
    }
}

// Fixed: uses find, correct operator
function findMemberById(id) {
    return members.find(member => member.id === id) || null;
}

// Fixed: uses find + Map lookup
function findBookByISBN(isbn) {
    return isbnIndex.get(isbn) || books.find(book => book.isbn === isbn) || null;
}

// ============================================================
// LibraryStats - Fixed and completed
// ============================================================
const LibraryStats = {
    totalBooks: 0,
    totalMembers: 0,
    totalBorrowings: 0,

    updateStats() {
        this.totalBooks = books.length;
        this.totalMembers = members.length;
        this.totalBorrowings = books.reduce(
            (sum, book) => sum + book.checkedOut.length, 0
        );
    },

    getAverageCheckoutsPerBook() {
        if (books.length === 0) return 0;
        const total = books.reduce((sum, b) => sum + b.checkedOut.length, 0);
        return Math.round((total / books.length) * 100) / 100;
    },

    getAvailableBookCount() {
        let count = 0;
        for (const book of books) {
            if (book.isAvailable()) count++;
        }
        return count;
    },

    getMostPopularBook() {
        if (books.length === 0) return null;
        return books.reduce((popular, book) =>
            book.checkedOut.length > popular.checkedOut.length ? book : popular,
            books[0]
        );
    },

    getSummary() {
        this.updateStats();
        const { totalBooks, totalMembers, totalBorrowings } = this;
        return { totalBooks, totalMembers, totalBorrowings };
    }
};

// ============================================================
// String / formatting functions - Fixed
// ============================================================
function formatBookInfo(book) {
    if (!book) return '';
    const title = book.title.trim();
    const author = book.author.trim();
    return `Title: ${title.toUpperCase()}\nAuthor: ${author}\nYear: ${book.year}`;
}

function calculateFineAmount(daysLate) {
    if (daysLate == null) return 0;
    if (typeof daysLate !== 'number' || Number.isNaN(daysLate)) return 0;
    if (daysLate <= 0) return 0;
    const fine = daysLate * LATE_FEE_PER_DAY;
    return parseFloat(fine.toFixed(2));
}

// ============================================================
// Module exports
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Book, DigitalBook, Member, PremiumMember,
        findOverdueBooks, processReturnQueue, searchBooksByCategory,
        getBooksByAuthor, calculateTotalLateFees, combineBookCollections,
        addMultipleBooks, updateMemberInfo, borrowBook,
        findMemberById, findBookByISBN, LibraryStats,
        formatBookInfo, calculateFineAmount,
        get books() { return books; },
        set books(val) { books = val; },
        get members() { return members; },
        set members(val) { members = val; },
        isbnIndex, LATE_FEE_PER_DAY, MAX_BOOKS_PER_MEMBER, MAX_BOOKS_PREMIUM
    };
}
