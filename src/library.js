let books = [];  
let members = [];
const isbnMap = new Map();
const LATE_FEE_PER_DAY = 0.50;
const MAX_BOOKS_PER_MEMBER = 5; 

//Fixed
class Book {
    constructor(isbn, title, author, year, copies) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.year = year;
        this.availableCopies = copies;
        this.totalCopies = copies;
        this.checkedOut = [];
    }

    isAvailable(){
        return this.availableCopies > 0;
    }

    getInfo(){
        return `${this.title} by ${this.author} (${this.year})`;
    }
    
    
    checkOut(memberId) {
        if (
            memberId === null ||
            memberId === undefined
        ) {
            return false;
        }
        if (!this.isAvailable()) {
            return false;
        }
        this.checkedOut.push({
            memberId,
            checkoutDate: new Date(),
            daysLate: 0
        });
        this.availableCopies--;
        return true;
    }
}
class DigitalBook extends Book {
    constructor(isbn, title, author, year, fileSize, format, copies = 1) {
        super(isbn, title, author, year, copies);
        this.fileSize = fileSize;
        this.format = format;
        this.downloads = 0;
    }
    
    download(memberId) {
        this.downloads++;
        return `${this.title} downloaded by ${memberId}`;
    }
}

class Member {
    constructor(id, name, email, membershipType) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.membershipType = membershipType;
        this.borrowedBooks = [];
        this.joinDate = new Date();
    }

    getMembershipDuration(){
        const now = new Date();
        const difference = now - this.joinDate;
        return Math.floor(difference/ (1000*60*60*24))
    }
    
    canBorrow() {
    return this.borrowedBooks.length < MAX_BOOKS_PER_MEMBER;
    }

    getMemberInfo() {
        const { name, email, membershipType } = this;

        return `${name} (${membershipType}) - ${email}`;
    }
}

class PremiumMember extends Member {
    constructor(id, name, email) {
        super(id, name, email, "premium");
        this.premiumSince = new Date();
        this.maxBooks = 10;
    }

    canBorrow(){
        return this.borrowedBooks.length < this.maxBooks;
    }
}

function findOverdueBooks(daysOverdue = 0) {
    if (!Array.isArray(books)) return [];

    return books.flatMap(book =>
        (book.checkedOut || []).filter(record =>
            record?.daysLate >= daysOverdue
        )
    );
}

function processReturnQueue(queue = []) {
    if (!Array.isArray(queue)) {
        return;
    }

    let index = 0;

    while (index < queue.length) {
        const item = queue[index];

        console.log(`Processing return: ${item}`);

        index++;
    }
}
function searchBooksByCategory(bookList, category, index = 0) {
    if (!Array.isArray(bookList)) {
        return [];
    }

    if (typeof category !== "string") {
        return [];
    }

    if (index >= bookList.length) {
        return [];
    }

    const current = bookList[index];

    const rest = searchBooksByCategory(
        bookList,
        category,
        index + 1
    );

    if (current?.category === category) {
        return [current, ...rest];
    }

    return rest;
}

function getBooksByAuthor(authorName) {
    if(typeof authorName !== "string"){
        return [];
    }
    
    return books.filter(
        ({ author }) => author ===authorName
    );
}

function calculateTotalLateFees(memberRecord) {
    if(!memberRecord?.overdueBooks){
        return 0;
    }

    return memberRecord.overdueBooks.reduce(
        (total, {daysLate}) =>
            total + (daysLate * LATE_FEE_PER_DAY), 0
    );
    
}

function combineBookCollections(
    fiction = [],
    nonFiction = [],
    reference = []
    ) {
        return [
            ...fiction,
            ...nonFiction,
            ...reference
        ];
}

function addMultipleBooks(...newBooks) {
    books.push(...newBooks);

    newBooks.forEach(book => {
        isbnMap.set(book.isbn, book);
    });

    return books;
}

function updateMemberInfo(member, updates) {
    if(!member || !updates){
        return member;
    }

    const{
        name = member.name,
        email = member.email,
        membershipType = member.membershipType
    } = updates;

    return{
        ...member,
        name, 
        email,
        membershipType
    };
}

function borrowBook(memberId, isbn) {
    try {
        if (typeof memberId !== "string" && typeof memberId !== "number") {
            return false;
        }

        if (typeof isbn !== "string") {
            return false;
        }

        const member = findMemberById(memberId);
        const book = findBookByISBN(isbn);

        if (!member || !book) {
            return false;
        }

        if (!member.canBorrow()) {
            return false;
        }

        if (!book.checkOut(memberId)) {
            return false;
        }

        member.borrowedBooks.push(isbn);

        return true;

    } catch (error) {
        console.error("Borrow error:", error);
        return false;
    }
}

function findMemberById(id) {
    if (id === null || id === undefined) {
        return null;
    }

    return members.find(
        member => member.id === id
    ) || null;
}
function findBookByISBN(isbn) {
    if (typeof isbn !== "string") {
        return null;
    }

    return (
        isbnMap.get(isbn) ||
        books.find(book => book.isbn === isbn) ||
        null
    );
}

const LibraryStats = {
    totalBooks: 0,
    totalMembers: 0,
    totalBorrowings: 0,

    getAverageBooksPerMember(){
        return Math.round(
            books.length / Math.max(members.length, 1)
        );
    },

    countBorrowedBooks(){
        let total = 0;

        for(const book of books){
            total += book.checkedOut.length;
        }

        return total;
    },

    getSummary(){
        const{
            totalBooks,
            totalMembers,
            totalBorrowings
        } = this;

        return{
            totalBooks,
            totalMembers,
            totalBorrowings
        };
    },

    updateStats() {
        this.totalBooks = books.length;
        this.totalMembers = members.length;
        this.totalBorrowings = this.countBorrowedBooks();

        return this;
    },
    
    getMostPopularBook: function () {
        if(!books.length){
            return null;
        }

        return books.reduce(
            (popular, current) => current.checkedOut.length >
            popular.checkedOut.length
                 ? current
                 : popular
        )
    
}};

function formatBookInfo(book) {
    if(!book){
        return "";
    }

    return `
Title: ${book.title.trim()}
Author: ${book.author.toUpperCase()}
Year: ${book.year}
`.trim();
    
}


function calculateFineAmount(daysLate) {
    if (typeof daysLate !== "number" || isNaN(daysLate)) {
        return 0;
    }

    if (daysLate <= 0) {
        return 0;
    }

    const fine = daysLate * LATE_FEE_PER_DAY;

    return Number(fine.toFixed(2));
}

function createBookFilter(predicate) {
    return books.filter(predicate);
}

function applyToBooks(callback) {
    return books.map(callback);
}

function hasAvailableBooks() {
    return books.some(book => book.isAvailable());
}

function allBooksHaveISBN() {
    return books.every(book => book.isbn);
}

export {
    Book,
    DigitalBook,
    Member,
    PremiumMember,

    findOverdueBooks,
    processReturnQueue,
    searchBooksByCategory,
    getBooksByAuthor,
    calculateTotalLateFees,
    combineBookCollections,
    addMultipleBooks,
    updateMemberInfo,
    borrowBook,
    findMemberById,
    findBookByISBN,

    LibraryStats,

    formatBookInfo,
    calculateFineAmount,
    createBookFilter,
    applyToBooks,

    hasAvailableBooks,
    allBooksHaveISBN
};