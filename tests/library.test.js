import {
    Book,
    DigitalBook,
    Member,
    PremiumMember,
    Library,
    LibraryStats,
    MAX_BOOKS_PER_MEMBER,
    MAX_BOOKS_PREMIUM
} from "../src/library.js";

describe("Book", () => {

    test("creates a valid book", () => {
        const book = new Book(
            "978123",
            "JavaScript",
            "John Doe",
            2024,
            5,
            "Technology"
        );

        expect(book.isbn).toBe("978123");
        expect(book.title).toBe("JavaScript");
        expect(book.author).toBe("John Doe");
        expect(book.totalCopies).toBe(5);
        expect(book.availableCopies).toBe(5);
        expect(book.category).toBe("Technology");
    });

    test("throws if ISBN is empty", () => {
        expect(() => {
            new Book("", "Book", "Author", 2024);
        }).toThrow();
    });

    test("book availability", () => {
        const book = new Book("1", "Book", "Author", 2024, 2);

        expect(book.isAvailable()).toBe(true);

        book.checkOut();
        book.checkOut();

        expect(book.isAvailable()).toBe(false);
    });

    test("checkout reduces copies", () => {
        const book = new Book("1", "Book", "Author", 2024, 3);

        book.checkOut();

        expect(book.availableCopies).toBe(2);
    });

    test("return restores copies", () => {
        const book = new Book("1", "Book", "Author", 2024, 1);

        book.checkOut();
        book.returnBook();

        expect(book.availableCopies).toBe(1);
    });

    test("getInfo returns string", () => {
        const book = new Book("1", "Book", "Author", 2024, 1);

        expect(typeof book.getInfo()).toBe("string");
    });

});

describe("DigitalBook", () => {

    test("inherits from Book", () => {
        const ebook = new DigitalBook(
            "D1",
            "Node",
            "John",
            2024,
            1,
            "Technology",
            "PDF",
            20
        );

        expect(ebook).toBeInstanceOf(Book);
    });

    test("always available", () => {
        const ebook = new DigitalBook(
            "D1",
            "Node",
            "John",
            2024,
            1,
            "Technology"
        );

        expect(ebook.isAvailable()).toBe(true);
    });

    test("download increments counter", () => {
        const ebook = new DigitalBook(
            "D1",
            "Node",
            "John",
            2024,
            1,
            "Technology"
        );

        ebook.download();
        ebook.download();

        expect(ebook.downloadCount).toBe(2);
    });

});

describe("Member", () => {

    test("creates member", () => {
        const member = new Member(
            1,
            "Alice",
            "alice@test.com"
        );

        expect(member.borrowedBooks).toEqual([]);
        expect(member.joinDate).toBeInstanceOf(Date);
    });

    test("can borrow under limit", () => {
        const member = new Member(1, "Alice", "a@test.com");

        expect(member.canBorrow()).toBe(true);
    });

    test("cannot borrow over limit", () => {
        const member = new Member(1, "Alice", "a@test.com");

        member.borrowedBooks =
            new Array(MAX_BOOKS_PER_MEMBER).fill({});

        expect(member.canBorrow()).toBe(false);
    });

    test("borrow and return book", () => {

        const member = new Member(1, "Alice", "a@test.com");

        const book = new Book(
            "1",
            "JavaScript",
            "John",
            2024,
            2
        );

        member.borrowBook(book);

        expect(member.borrowedBooks.length).toBe(1);
        expect(book.availableCopies).toBe(1);

        member.returnBook(book.isbn);
        book.returnBook();

        expect(member.borrowedBooks.length).toBe(0);
        expect(book.availableCopies).toBe(2);
    });

});

describe("PremiumMember", () => {

    test("inherits Member", () => {
        const member = new PremiumMember(
            1,
            "Jane",
            "jane@test.com"
        );

        expect(member).toBeInstanceOf(Member);
    });

    test("premium borrow limit", () => {

        const member = new PremiumMember(
            1,
            "Jane",
            "jane@test.com"
        );

        member.borrowedBooks =
            new Array(MAX_BOOKS_PER_MEMBER).fill({});

        expect(member.canBorrow()).toBe(true);
    });

    test("cannot exceed premium limit", () => {

        const member = new PremiumMember(
            1,
            "Jane",
            "jane@test.com"
        );

        member.borrowedBooks =
            new Array(MAX_BOOKS_PREMIUM).fill({});

        expect(member.canBorrow()).toBe(false);
    });

});

describe("Library", () => {

    let library;
    let member;
    let book;

    beforeEach(() => {

        library = new Library();

        book = new Book(
            "111",
            "JavaScript",
            "John",
            2024,
            1,
            "Programming"
        );

        library.addBook(book);

        member = library.addMember(
            "Alice",
            "alice@test.com"
        );

    });

    test("adds book", () => {
        expect(library.books.length).toBe(1);
    });

    test("findBookByISBN", () => {
        expect(library.findBookByISBN("111")).toBe(book);
    });

    test("findMemberById", () => {
        expect(library.findMemberById(member.id)).toBe(member);
    });

    test("borrowBook succeeds", () => {

        const result =
            library.borrowBook(member.id, book.isbn);

        expect(result.success).toBe(true);
        expect(book.availableCopies).toBe(0);
    });

    test("returnBook succeeds", () => {

        library.borrowBook(member.id, book.isbn);

        const result =
            library.returnBook(member.id, book.isbn);

        expect(result.success).toBe(true);
        expect(book.availableCopies).toBe(1);
    });

    test("searchBooks", () => {

        const results =
            library.searchBooks("Java");

        expect(results.length).toBe(1);
    });

    test("books by author", () => {

        const results =
            library.getBooksByAuthor("John");

        expect(results.length).toBe(1);
    });

    test("books by category", () => {

        const results =
            library.getBooksByCategory("Programming");

        expect(results.length).toBe(1);
    });

    test("categories", () => {

        expect(library.getCategories())
            .toContain("Programming");
    });

    test("combineBookCollections", () => {

        const otherBooks = [
            new Book(
                "222",
                "CSS",
                "Jane",
                2023,
                1,
                "Programming"
            )
        ];

        const combined =
            library.combineBookCollections(otherBooks);

        expect(combined.length).toBe(2);
    });

    test("stats", () => {

        const stats = library.getStats();

        expect(stats.totalBooks).toBe(1);
        expect(stats.totalMembers).toBe(1);
        expect(stats.totalBorrowed).toBe(0);
    });

    test("allBooksAvailable", () => {
        expect(library.allBooksAvailable()).toBe(true);
        library.borrowBook(member.id, book.isbn);
        expect(book.availableCopies).toBe(0);
        expect(library.allBooksAvailable()).toBe(false);

  });


});

describe("LibraryStats", () => {

    test("summary", () => {

        const library = new Library();

        library.addBook(
            new Book(
                "1",
                "JS",
                "John",
                2024,
                2,
                "Programming"
            )
        );

        library.addMember(
            "Alice",
            "alice@test.com"
        );

        const summary =
            LibraryStats.getSummary(library);

        expect(summary.totalBooks).toBe(1);
        expect(summary.totalMembers).toBe(1);
    });

    test("averageBooksPerMember", () => {

        const library = new Library();

        library.addMember(
            "Alice",
            "alice@test.com"
        );

        expect(
            LibraryStats.averageBooksPerMember(library)
        ).toBe(0);
    });

    test("category distribution", () => {

        const library = new Library();

        library.addBook(
            new Book(
                "1",
                "JS",
                "John",
                2024,
                1,
                "Programming"
            )
        );

        const distribution =
            LibraryStats.getCategoryDistribution(library);

        expect(distribution.Programming).toBe(1);
    });

    test("hasMaxedOutMembers", () => {

        const library = new Library();

        library.addMember(
            "Alice",
            "alice@test.com"
        );

        expect(
            LibraryStats.hasMaxedOutMembers(library)
        ).toBe(false);
    });

});