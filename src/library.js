// Library Management System - Starter Code with Complex Errors

// Global state management (scoping issues)
let books = [];  
let members = []; 
const LATE_FEE_PER_DAY = 0.50;
const MAX_BOOKS_PER_MEMBER = 5; 

// Book class with multiple issues
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
        if(!this.isAvailable()){
            return false;
        }
        this.checkedOut.push(memberId);
        this.availableCopies --;
        return true;
    }
}

// Digital book class with inheritance problems
class DigitalBook extends Book {
    constructor(isbn, title, author, year, fileSize, format) {
        super(isbn, title, author, year, copies);
        // Missing: super() call with correct parameters
        this.fileSize = fileSize;
        this.format = format;
        this.downloads = 0;
    }
    
    download(memberId) {
        this.downloads++;
        return `${this.title} downloaded by ${memberId}`;
    }
}

// Member class with errors
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
    
    // Missing: method to calculate membership duration
    // Missing: method using destructuring
    
    canBorrow() {
        // Wrong comparison operator
        if (this.borrowedBooks.length < MAX_BOOKS_PER_MEMBER) {
            return false;
        }
        return true;
    }

    getMemberInfo() {
        const { name, email, membershipType } = this;

        return `${name} (${membershipType}) - ${email}`;
    }
}

// Premium member with inheritance issues
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

// Complex function with nested loops and errors
function findOverdueBooks(daysOverdue) {
    var overdue = [];
    
    // Inefficient nested loops - should be optimized
    for (var i = 0; i < books.length; i++) {
        for (var j = 0; j < books[i].checkedOut.length; j++) {
            // Missing: actual date checking logic
            // Wrong variable scoping
            var checkoutRecord = books[i].checkedOut[j];
            overdue.push(checkoutRecord);
        }
    }
    
    return overdue;
}

// Function with while loop error
function processReturnQueue(queue) {
    let index = 0;

    while (index < queue.length) {
        const item = queue[index];

        console.log("Processing return:", item);

        index++; // critical fix
    }
}

// Recursive function with multiple errors
function searchBooksByCategory(bookList, category, index = 0) {
    if (!bookList || index >= bookList.length) {
        return [];
    }

    const current = bookList[index];

    const rest = searchBooksByCategory(bookList, category, index + 1);

    if (current && current.category === category) {
        return [current, ...rest];
    }

    return rest;
}
// Function missing array methods
function getBooksByAuthor(authorName) {
    var result = [];
    
    // Should use filter method
    for (var i = 0; i < books.length; i++) {
        if (books[i].author == authorName) {  // Should use ===
            result.push(books[i]);
        }
    }
    
    return result;
}

// Function that should use reduce
function calculateTotalLateFees(memberRecord) {
    var total = 0;
    
    // Should use reduce on array
    for (var i = 0; i < memberRecord.overdueBooks.length; i++) {
        total = total + memberRecord.overdueBooks[i].daysLate * LATE_FEE_PER_DAY;
    }
    
    return total;
}

// Function missing spread operator
function combineBookCollections(fiction, nonFiction, reference) {
    // Should use spread operator
    var combined = [];
    
    for (var i = 0; i < fiction.length; i++) combined.push(fiction[i]);
    for (var i = 0; i < nonFiction.length; i++) combined.push(nonFiction[i]);
    for (var i = 0; i < reference.length; i++) combined.push(reference[i]);
    
    return combined;
}

// Function missing rest parameters
function addMultipleBooks(book1, book2, book3) {
    // Should use rest parameters to accept unlimited books
    books.push(book1);
    books.push(book2);
    books.push(book3);
}

// Function missing destructuring
function updateMemberInfo(member, updates) {
    // Should destructure updates object
    member.name = updates.name;
    member.email = updates.email;
    member.membershipType = updates.membershipType;
    
    return member;
}

// Function with no error handling
function borrowBook(memberId, isbn) {
    try{
        const member = findMemberById(memberId);
        const book = findBookByISBN(isbn);

        if(!member || !book){
            return false;
        }

        if(typeof member !== "number"){
            return false;
        }
        if(typeof book !== "string"){
            return false;
        }
        if(!member.canBorrow()){
            return false;
        }

        if(!book.checkOut(memberId)){
            return false;
        }

        member.borrowedBooks.push(isbn);

        return true;
    }catch(error){
        console.log("Borrow error: ", error);
        return false;
    }
    // Missing: try-catch block
    // Missing: validation for undefined/null
    // Missing: typeof checks
}
// Helper functions with errors
function findMemberById(id) {
    // Should use find method
    for (let i = 0; i < members.length; i++) {
        if (members[i].id === id) {
            return members[i];
        }
    }
    return null;
}

function findBookByISBN(isbn) {
    let i = 0;
    
    // Wrong loop choice
    while (i < books.length) {
        if (books[i].isbn === isbn) {
            return books[i];
        }
        i++;
    }
    
    return null;
}

// Statistics object with missing methods
var LibraryStats = {
    totalBooks: 0,
    totalMembers: 0,
    totalBorrowings: 0,
    
    // Missing: method using Math object for calculations
    // Missing: method using for-of loop
    // Missing: method returning object with destructuring
    
    updateStats: function() {
        this.totalBooks = books.length;
        this.totalMembers = members.length;
    },
    
    getMostPopularBook: function () {
    let maxCheckouts = 0;
    let popularBook = null;

    for (let i = 0; i < books.length; i++) {
        if (books[i].checkedOut.length > maxCheckouts) {
            maxCheckouts = books[i].checkedOut.length;
            popularBook = books[i];
        }
    }

    return popularBook;
}

// Function with string manipulation errors
function formatBookInfo(book) {
    // Should use template literals
    var info = "Title: " + book.title + "\n";
    info = info + "Author: " + book.author + "\n";
    info = info + "Year: " + book.year;
    
    // Missing: proper string methods (trim, toUpperCase, etc.)
    
    return info;
}

// Function with number/type issues
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

// Missing: module exports
// Missing: proper data structure for ISBN lookups (Map/Set)
