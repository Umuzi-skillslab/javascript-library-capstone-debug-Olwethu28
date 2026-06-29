// Jest Tests - Library Management System - Complete
const {
    Book, DigitalBook, Member, PremiumMember,
    findOverdueBooks, processReturnQueue, searchBooksByCategory,
    getBooksByAuthor, calculateTotalLateFees, combineBookCollections,
    addMultipleBooks, updateMemberInfo, borrowBook, findMemberById,
    findBookByISBN, LibraryStats, formatBookInfo, calculateFineAmount,
    isbnIndex, LATE_FEE_PER_DAY, MAX_BOOKS_PER_MEMBER, MAX_BOOKS_PREMIUM
} = require('../src/library');

const lib = require('../src/library');

beforeEach(() => {
    lib.books = [];
    lib.members = [];
    isbnIndex.clear();
});

// 1. Book Class
describe('Book Class', () => {
    test('should create a book with all properties', () => {
        const book = new Book('978-0-123', 'Test Book', 'Author Name', 2020, 5, 'fiction');
        expect(book.isbn).toBe('978-0-123');
        expect(book.title).toBe('Test Book');
        expect(book.totalCopies).toBe(5);
        expect(book.availableCopies).toBe(5);
        expect(book.checkedOut).toEqual([]);
    });
    test('isAvailable returns true when copies exist', () => {
        expect(new Book('978-0-123', 'T', 'A', 2020, 2).isAvailable()).toBe(true);
    });
    test('isAvailable returns false when no copies left', () => {
        const book = new Book('978-0-123', 'T', 'A', 2020, 1);
        book.checkOut('m1');
        expect(book.isAvailable()).toBe(false);
    });
    test('checkOut decrements availableCopies', () => {
        const book = new Book('978-0-123', 'T', 'A', 2020, 2);
        expect(book.checkOut('m1')).toBe(true);
        expect(book.availableCopies).toBe(1);
    });
    test('checkOut returns false when no copies', () => {
        expect(new Book('978-0-123', 'T', 'A', 2020, 0).checkOut('m1')).toBe(false);
    });
    test('returnBook restores availability', () => {
        const book = new Book('978-0-123', 'T', 'A', 2020, 1);
        book.checkOut('m1');
        book.returnBook('m1');
        expect(book.availableCopies).toBe(1);
    });
    test('getInfo returns formatted string', () => {
        const info = new Book('978-0-123', 'Test', 'Author', 2020, 3).getInfo();
        expect(info).toContain('Test');
        expect(info).toContain('3/3');
    });
});

// 2. DigitalBook Class
describe('DigitalBook Class', () => {
    test('inherits from Book', () => {
        const ebook = new DigitalBook('978-D-001', 'Digital', 'Auth', 2023, 15, 'PDF');
        expect(ebook).toBeInstanceOf(Book);
    });
    test('super() sets base properties', () => {
        const ebook = new DigitalBook('978-D-001', 'Digital', 'Auth', 2023, 15, 'PDF');
        expect(ebook.isbn).toBe('978-D-001');
        expect(ebook.fileSize).toBe(15);
    });
    test('checkOut increments downloads', () => {
        const ebook = new DigitalBook('978-D-001', 'D', 'A', 2023, 10, 'EPUB');
        ebook.checkOut('m1'); ebook.checkOut('m2');
        expect(ebook.downloads).toBe(2);
    });
    test('getInfo includes format', () => {
        expect(new DigitalBook('978-D-001', 'D', 'A', 2023, 10, 'EPUB').getInfo()).toContain('EPUB');
    });
});

// 3. Member Class
describe('Member Class', () => {
    test('creates member with joinDate', () => {
        const m = new Member(1, 'John', 'john@e.com', 'standard');
        expect(m.joinDate).toBeInstanceOf(Date);
        expect(m.borrowedBooks).toEqual([]);
    });
    test('canBorrow true when under limit', () => {
        expect(new Member(1, 'J', 'j@e.com', 'standard').canBorrow()).toBe(true);
    });
    test('canBorrow false at limit', () => {
        const m = new Member(1, 'J', 'j@e.com', 'standard');
        m.borrowedBooks = ['a','b','c','d','e'];
        expect(m.canBorrow()).toBe(false);
    });
    test('getProfile returns destructured object', () => {
        const p = new Member(1, 'John', 'j@e.com', 'standard').getProfile();
        expect(p).toEqual({ id:1, name:'John', email:'j@e.com', membershipType:'standard', bookCount:0 });
    });
    test('getMembershipDuration returns duration', () => {
        const d = new Member(1, 'J', 'j@e.com', 'standard').getMembershipDuration();
        expect(typeof d.days).toBe('number');
    });
});

// 4. PremiumMember Class
describe('PremiumMember Class', () => {
    test('inherits from Member', () => {
        const pm = new PremiumMember(1, 'Jane', 'jane@e.com');
        expect(pm).toBeInstanceOf(Member);
        expect(pm.membershipType).toBe('premium');
    });
    test('has premium benefits', () => {
        const pm = new PremiumMember(1, 'Jane', 'jane@e.com');
        expect(pm.discountRate).toBe(0.1);
    });
    test('canBorrow allows more books', () => {
        const pm = new PremiumMember(1, 'J', 'j@e.com');
        pm.borrowedBooks = Array(MAX_BOOKS_PER_MEMBER).fill('x');
        expect(pm.canBorrow()).toBe(true);
    });
    test('canBorrow false at premium limit', () => {
        const pm = new PremiumMember(1, 'J', 'j@e.com');
        pm.borrowedBooks = Array(MAX_BOOKS_PREMIUM).fill('x');
        expect(pm.canBorrow()).toBe(false);
    });
});

// 5. Library Functions
describe('Library Functions', () => {
    let book1, book2, member1;
    beforeEach(() => {
        book1 = new Book('978-0-001', 'Book One', 'Author A', 2020, 3, 'fiction');
        book2 = new Book('978-0-002', 'Book Two', 'Author B', 2021, 2, 'non-fiction');
        member1 = new Member(1, 'Test User', 'test@e.com', 'standard');
        lib.books = [book1, book2];
        lib.members = [member1];
        isbnIndex.set(book1.isbn, book1);
        isbnIndex.set(book2.isbn, book2);
    });
    test('findBookByISBN returns correct book', () => expect(findBookByISBN('978-0-001')).toBe(book1));
    test('findBookByISBN returns null for unknown', () => expect(findBookByISBN('999')).toBeNull());
    test('findMemberById returns correct member', () => expect(findMemberById(1)).toBe(member1));
    test('findMemberById returns null for unknown', () => expect(findMemberById(999)).toBeNull());
    test('getBooksByAuthor returns matches', () => expect(getBooksByAuthor('Author A')).toHaveLength(1));
    test('getBooksByAuthor empty for unknown', () => expect(getBooksByAuthor('X')).toEqual([]));
    test('borrowBook succeeds', () => {
        expect(borrowBook(1, '978-0-001')).toBe(true);
        expect(book1.availableCopies).toBe(2);
    });
    test('borrowBook fails for bad member', () => expect(borrowBook(999, '978-0-001')).toBe(false));
    test('borrowBook fails with null', () => expect(borrowBook(null, '978-0-001')).toBe(false));
});

// 6. Array Operations
describe('Array Operations', () => {
    test('combineBookCollections merges', () => {
        expect(combineBookCollections([1,2],[3,4],[5])).toEqual([1,2,3,4,5]);
    });
    test('combineBookCollections variable args', () => {
        expect(combineBookCollections([1],[2],[3],[4])).toEqual([1,2,3,4]);
    });
    test('addMultipleBooks via rest params', () => {
        addMultipleBooks(new Book('001','A','X',2020,1), new Book('002','B','Y',2021,1));
        expect(lib.books).toHaveLength(2);
    });
    test('calculateTotalLateFees uses reduce', () => {
        const r = { overdueBooks: [{daysLate:5},{daysLate:10}] };
        expect(calculateTotalLateFees(r)).toBe(15 * LATE_FEE_PER_DAY);
    });
    test('calculateTotalLateFees handles null', () => expect(calculateTotalLateFees(null)).toBe(0));
});

// 7. Recursive Functions
describe('Recursive Functions', () => {
    test('searchBooksByCategory returns matches', () => {
        const list = [{title:'A',category:'fiction'},{title:'B',category:'nf'},{title:'C',category:'fiction'}];
        expect(searchBooksByCategory(list, 'fiction')).toHaveLength(2);
    });
    test('returns empty for no matches', () => {
        expect(searchBooksByCategory([{title:'A',category:'fiction'}], 'ref')).toEqual([]);
    });
    test('handles null bookList', () => expect(searchBooksByCategory(null, 'fiction')).toEqual([]));
    test('handles empty list', () => expect(searchBooksByCategory([], 'fiction')).toEqual([]));
});

// 8. Error Handling
describe('Error Handling', () => {
    test('borrowBook handles bad member', () => {
        lib.books = [new Book('001','T','A',2020,1)]; isbnIndex.set('001',lib.books[0]);
        expect(borrowBook(999,'001')).toBe(false);
    });
    test('borrowBook handles bad book', () => {
        lib.members = [new Member(1,'J','j@e.com','standard')];
        expect(borrowBook(1,'FAKE')).toBe(false);
    });
    test('calculateFineAmount handles NaN', () => expect(calculateFineAmount(NaN)).toBe(0));
    test('calculateFineAmount handles undefined', () => expect(calculateFineAmount(undefined)).toBe(0));
    test('calculateFineAmount handles null', () => expect(calculateFineAmount(null)).toBe(0));
});

// 9. String Operations
describe('String Operations', () => {
    test('formatBookInfo uses template literals', () => {
        const info = formatBookInfo({title:'  Test  ', author:'  Auth  ', year:2020});
        expect(info).toContain('Title: TEST');
    });
    test('formatBookInfo handles null', () => expect(formatBookInfo(null)).toBe(''));
});

// 10. Math Operations
describe('Math Operations', () => {
    test('calculateFineAmount correct value', () => expect(calculateFineAmount(5)).toBe(2.50));
    test('returns 0 for negative', () => expect(calculateFineAmount(-3)).toBe(0));
    test('toFixed precision', () => expect(calculateFineAmount(7)).toBe(3.50));
    test('avg checkouts handles empty', () => {
        lib.books = [];
        expect(LibraryStats.getAverageCheckoutsPerBook()).toBe(0);
    });
});

// 11. Destructuring & Modern JS
describe('Destructuring & Modern JS', () => {
    test('updateMemberInfo uses destructuring', () => {
        const m = new Member(1,'Old','old@e.com','standard');
        const u = updateMemberInfo(m, {name:'New', email:'new@e.com'});
        expect(u.name).toBe('New');
        expect(u.membershipType).toBe('standard');
    });
    test('getSummary returns object', () => {
        const s = LibraryStats.getSummary();
        expect(s).toHaveProperty('totalBooks');
    });
});

// 12. Scope & Constants
describe('Scope & Constants', () => {
    test('LATE_FEE_PER_DAY', () => expect(LATE_FEE_PER_DAY).toBe(0.50));
    test('MAX_BOOKS_PER_MEMBER', () => expect(MAX_BOOKS_PER_MEMBER).toBe(5));
    test('MAX_BOOKS_PREMIUM > standard', () => expect(MAX_BOOKS_PREMIUM).toBeGreaterThan(MAX_BOOKS_PER_MEMBER));
});

// 13. processReturnQueue
describe('processReturnQueue', () => {
    test('processes all items (no infinite loop)', () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();
        processReturnQueue(['a','b','c']);
        expect(spy).toHaveBeenCalledTimes(3);
        spy.mockRestore();
    });
    test('handles empty queue', () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();
        processReturnQueue([]);
        expect(spy).not.toHaveBeenCalled();
        spy.mockRestore();
    });
});

// 14. JSON Operations
describe('JSON Operations', () => {
    test('round-trip preserves data', () => {
        const parsed = JSON.parse(JSON.stringify({books:[{isbn:'001'}]}));
        expect(parsed.books[0].isbn).toBe('001');
    });
    test('JSON.parse throws on invalid', () => expect(() => JSON.parse('bad')).toThrow());
});

// 15. LibraryStats
describe('LibraryStats', () => {
    test('updateStats reflects state', () => {
        lib.books = [new Book('001','A','X',2020,1)];
        lib.members = [new Member(1,'J','j@e.com','standard')];
        LibraryStats.updateStats();
        expect(LibraryStats.totalBooks).toBe(1);
    });
    test('getMostPopularBook works', () => {
        const b1 = new Book('001','A','X',2020,5);
        const b2 = new Book('002','B','Y',2021,5);
        b1.checkOut('m1'); b2.checkOut('m1'); b2.checkOut('m2');
        lib.books = [b1, b2];
        expect(LibraryStats.getMostPopularBook()).toBe(b2);
    });
    test('getMostPopularBook null when empty', () => {
        lib.books = [];
        expect(LibraryStats.getMostPopularBook()).toBeNull();
    });
});
