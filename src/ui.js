import { borrowBook, findBookByISBN } from "./library";
import { books, members } from "./library";

// Library UI - DOM Manipulation with Complex Errors
let catalogueContainer;
let searchInput;
let filterDropdown;

function initializeUI() {
    catalogueContainer = document.querySelector("#catalogue-list");
    searchInput = document.getElementById("search");
    filterDropdown = document.querySelector("#filter-category");


    if (!catalogueContainer || !searchInput || !filterDropdown){
        console.error("Required UI elements not found");
        return;
    }
    
    setupEventListeners();
}

function setupEventListeners() {
    searchInput.addEventListener("input", handleSearch);
    filterDropdown.addEventListener("change", handleFilterChange);
    let borrowForm = document.getElementById("borrow-form");
    if(borrowForm){
        borrowForm.addEventListener("submit", handleBorrowSubmit);
    }
    
    
    // Missing: event delegation for dynamic elements
}

// Complex DOM rendering with errors
function renderBookCatalogue(bookList) {
    catalogueContainer.innerHTML = "";

    for (let i = 0; i < bookList.length; i++) {
        let bookCard = document.createElement("div");

        bookCard.className = "book-card";
        bookCard.dataset.isbn = bookList[i].isbn;

        bookCard.innerHTML = `
            <h3>${bookList[i].title}</h3>
            <p>Author: ${bookList[i].author}</p>
            <p>Available: ${bookList[i].availableCopies}</p>
        `;

        bookCard.addEventListener("click", handleBookClick);

        catalogueContainer.appendChild(bookCard);
    }
}


// Function with event handling errors
function handleBorrowSubmit(event) {
    event.preventDefault();
    
    let memberIdInput = document.getElementById("member-id");
    let isbnInput = document.getElementById("isbn");
    let memberId = memberIdInput.value;
    let isbn = isbnInput.value;

    if(!memberId.trim() || !isbn.trim()){
        alert("Please enter member ID and ISBN");
        return;
    }

    try{
        let success =borrowBook(memberId, isbn);

        if(success){
            alert("Book borrowed successfully");
        }else{
            alert("Borrowing failed");
        }
    }catch(error){
        console.error(error);
        alert("An error occurred");
    }

    event.target.reset();
    
    
}

// Function missing event delegation
function handleBookClick(event) {
    let bookElement = event.target.closest(".book-card");

    if(!bookElement){
        return;
    }

    let bookId = bookElement.dataset.isbn;
    displayBookDetails(bookId);
}

// Search function with errors
function handleSearch(event) {
    let searchTerm = event.target.value.toLowerCase();
    // Inefficient filtering
    let results = [];
    for (let i = 0; i < books.length; i++) {
        if (
            books[i].title
            .toLowerCase()
            .includes(searchTerm)
        ) {
            results.push(books[i]);
        }
    }
    
    renderBookCatalogue(results);
}

// Function with filter errors
function handleFilterChange() {
    let selectedCategory = filterDropdown.value;

    if (selectedCategory === "all") {
    renderBookCatalogue(books);
    return;
}

    // Should use array filter method
    
    let filtered = [];
    for (let i = 0; i < books.length; i++) {
        if (books[i].category === selectedCategory) {
            filtered.push(books[i]);
        }
    }
    
    renderBookCatalogue(filtered);
}

// Function missing JSON operations
function exportLibraryData() {
    // Should convert to JSON
    // Missing: error handling
    
    let data = {
        books: books,
        members: members
    };
    
    // Missing: JSON.stringify
    return JSON.stringify(data);
}

// Function missing JSON parsing
function importLibraryData(jsonString) {
    try {
        let data = JSON.parse(jsonString);

        if (data.books && data.members) {
            books = data.books;
            members = data.members;
        }
    } catch (error) {
        console.error("Import failed:", error);
    }
}

// LocalStorage functions with errors
function saveToLocalStorage() {
    try {
        localStorage.setItem(
            "libraryBooks",
            JSON.stringify(books)
        );

        localStorage.setItem(
            "libraryMembers",
            JSON.stringify(members)
        );
    } catch (error) {
        console.error("Save failed:", error);
    }
}

function loadFromLocalStorage() {
    try {
    let booksData = localStorage.getItem("libraryBooks");
    let membersData = localStorage.getItem("libraryMembers");

    books = booksData ? JSON.parse(booksData) : [];
    members = membersData ? JSON.parse(membersData) : [];
    } catch (error) {
    console.error("Load failed:", error);
    }
}

// Display function with template issues
function displayBookDetails(isbn) {
    let book = findBookByISBN(isbn);
    let detailsContainer = document.getElementById("book-details");
    if (!book || !detailsContainer) {
    return;
   }
    
    let html = `
    <div class="book-details">
    <h2>${book.title}</h2>
    <p><strong>Author:</strong> ${book.author}</p>
    <p><strong>ISBN:</strong> ${book.isbn}</p>
    <p><strong>Year:</strong> ${book.year}</p>
    </div>`;
    
    detailsContainer.innerHTML = html;
}

// Statistics display with errors
function updateStatisticsDisplay() {
    // Wrong selector methods
    let totalBooksEl = document.querySelector(".total-books");
    let totalMembersEl = document.querySelector(".total-members");

    if (!totalBooksEl || !totalMembersEl) {
    return;
}
    
    totalBooksEl.textContent = books.length;
    totalMembersEl.textContent = members.length;
    
    // Missing: update other statistics
}

// Dynamic form generation with errors
function createMemberForm() {
    let formContainer = document.getElementById("member-form");
    
    // Inefficient DOM manipulation
    let form = document.createElement("form");
    
    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "name";
    nameInput.placeholder = "Name";
    nameInput.required = true;
    
    
    let emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.id = "email";
    emailInput.placeholder = "Email";
    emailInput.required = true;
    
    // Missing: other form fields
    
    form.appendChild(nameInput);
    form.appendChild(emailInput);
    
    formContainer.appendChild(form);
}

document.addEventListener("DOMContentLoaded", initializeUI); 
