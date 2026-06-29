// Library UI - DOM Manipulation - Fixed and Complete

// FIX: Wrap everything in DOMContentLoaded (was calling initializeUI() immediately)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeUI);
}

let catalogueContainer;
let searchInput;
let filterDropdown;

function initializeUI() {
    catalogueContainer = document.querySelector('#catalogue-list');
    searchInput = document.getElementById('search');
    filterDropdown = document.querySelector('#filter-category'); // FIX: was missing '#'

    if (!catalogueContainer || !searchInput || !filterDropdown) {
        console.error('Required DOM elements not found');
        return;
    }

    setupEventListeners();
    loadFromLocalStorage();
    loadCatalogue();
}

function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);           // FIX: was missing
    filterDropdown.addEventListener('change', handleFilterChange); // FIX: was 'click'

    const borrowForm = document.getElementById('borrow-form');
    if (borrowForm) {
        borrowForm.addEventListener('submit', handleBorrowSubmit);
    }

    document.getElementById('catalogue-tab')?.addEventListener('click', () => showSection('catalogue'));
    document.getElementById('members-tab')?.addEventListener('click', () => showSection('members'));
    document.getElementById('statistics-tab')?.addEventListener('click', () => showSection('statistics'));

    if (catalogueContainer) {
        catalogueContainer.addEventListener('click', handleBookClick); // FIX: event delegation
    }
}

function showSection(section) {
    const sections = {
        catalogue: ['catalogue-section', 'borrow-section'],
        members: ['member-section'],
        statistics: ['statistics-section']
    };
    document.querySelectorAll('main > section').forEach(s => s.style.display = 'none');
    const toShow = sections[section] || [];
    toShow.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'block';
    });
    if (section === 'statistics') updateStatisticsDisplay();
    if (section === 'members') createMemberForm();
}

function renderBookCatalogue(bookList) {
    if (!catalogueContainer) return;
    catalogueContainer.innerHTML = '';                    // FIX: clear container first
    const fragment = document.createDocumentFragment();   // FIX: use fragment

    for (const book of bookList) {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.dataset.isbn = book.isbn;               // FIX: data attribute
        bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Available: ${book.availableCopies ?? 'N/A'}/${book.totalCopies ?? 'N/A'}</p>
        `;
        fragment.appendChild(bookCard);
    }
    catalogueContainer.appendChild(fragment);
}

function loadCatalogue() {
    renderBookCatalogue(typeof books !== 'undefined' ? books : []);
}

function handleBorrowSubmit(event) {
    event.preventDefault();                              // FIX: was missing
    const memberIdInput = document.getElementById('member-id');
    const isbnInput = document.getElementById('isbn');
    const memberId = parseInt(memberIdInput?.value?.trim(), 10);
    const isbn = isbnInput?.value?.trim();

    if (!memberId || !isbn) {
        alert('Please enter both Member ID and ISBN');
        return;
    }
    try {
        const success = borrowBook(memberId, isbn);
        if (success) {
            alert('Book borrowed successfully!');
            memberIdInput.value = '';
            isbnInput.value = '';
            renderBookCatalogue(books);
            saveToLocalStorage();
        } else {
            alert('Could not borrow book. Check member ID and ISBN.');
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

function handleBookClick(event) {
    const bookCard = event.target.closest('.book-card'); // FIX: use closest()
    if (!bookCard) return;
    const isbn = bookCard.dataset.isbn;
    if (isbn) displayBookDetails(isbn);
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase(); // FIX: case-insensitive
    const results = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.isbn.toLowerCase().includes(searchTerm)
    );
    renderBookCatalogue(results);
}

function handleFilterChange() {
    const selectedCategory = filterDropdown.value;
    if (selectedCategory === 'all') {                    // FIX: handle "all"
        renderBookCatalogue(books);
        return;
    }
    // FIX: was = (assignment) instead of === (comparison)
    const filtered = books.filter(book => book.category === selectedCategory);
    renderBookCatalogue(filtered);
}

function exportLibraryData() {
    try {
        const data = { books, members };
        return JSON.stringify(data, null, 2);            // FIX: was missing JSON.stringify
    } catch (error) {
        console.error(`Export failed: ${error.message}`);
        return null;
    }
}

function importLibraryData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        if (!data || !Array.isArray(data.books) || !Array.isArray(data.members)) {
            throw new Error('Invalid library data format');
        }
        books = data.books;
        members = data.members;
        return true;
    } catch (error) {
        console.error(`Import failed: ${error.message}`);
        return false;
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('libraryBooks', JSON.stringify(books));     // FIX: JSON.stringify
        localStorage.setItem('libraryMembers', JSON.stringify(members));
    } catch (error) {
        console.error(`Save to localStorage failed: ${error.message}`);
    }
}

function loadFromLocalStorage() {
    try {
        const booksData = localStorage.getItem('libraryBooks');
        const membersData = localStorage.getItem('libraryMembers');
        if (booksData) books = JSON.parse(booksData);   // FIX: null check + JSON.parse
        if (membersData) members = JSON.parse(membersData);
    } catch (error) {
        console.error(`Load from localStorage failed: ${error.message}`);
        books = [];
        members = [];
    }
}

function displayBookDetails(isbn) {
    const book = findBookByISBN(isbn);
    if (!book) return;                                   // FIX: null check
    const detailsContainer = document.getElementById('book-details');
    if (!detailsContainer) return;
    detailsContainer.innerHTML = `
        <div class="book-details">
            <h2>${book.title}</h2>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>ISBN:</strong> ${book.isbn}</p>
            <p><strong>Year:</strong> ${book.year}</p>
            <p><strong>Available:</strong> ${book.availableCopies}/${book.totalCopies}</p>
        </div>
    `;
}

function updateStatisticsDisplay() {
    const totalBooksEl = document.querySelector('.total-books');
    const totalMembersEl = document.querySelector('.total-members');
    const booksBorrowedEl = document.querySelector('.books-borrowed');
    if (totalBooksEl) totalBooksEl.textContent = books.length;   // FIX: textContent
    if (totalMembersEl) totalMembersEl.textContent = members.length;
    if (booksBorrowedEl) {
        const borrowed = books.reduce((sum, b) => sum + b.checkedOut.length, 0);
        booksBorrowedEl.textContent = borrowed;
    }
}

function createMemberForm() {
    const formContainer = document.getElementById('member-form');
    if (!formContainer) return;
    formContainer.innerHTML = '';
    const form = document.createElement('form');
    form.id = 'add-member-form';
    form.innerHTML = `
        <label for="member-name">Name:</label>
        <input type="text" id="member-name" placeholder="Full Name" required>
        <label for="member-email">Email:</label>
        <input type="email" id="member-email" placeholder="email@example.com" required>
        <label for="member-type">Membership:</label>
        <select id="member-type">
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
        </select>
        <button type="submit">Add Member</button>
    `;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('member-name')?.value.trim();
        const email = document.getElementById('member-email')?.value.trim();
        const type = document.getElementById('member-type')?.value;
        if (!name || !email) { alert('Please fill in all fields'); return; }
        const id = members.length + 1;
        const newMember = type === 'premium'
            ? new PremiumMember(id, name, email)
            : new Member(id, name, email, type);
        members.push(newMember);
        alert(`Member registered! Your member ID is: ${id}\nUse this ID to borrow books`);


        saveToLocalStorage();
        renderMemberList();
        form.reset();
    });
    formContainer.appendChild(form);
    renderMemberList();
}

function renderMemberList() {
    const listContainer = document.getElementById('member-list');
    if (!listContainer) return;
    listContainer.innerHTML = members.map(m => `
        <div class="member-card">
            <h4>${m.name}</h4>
            <p> ID: ${m.id} | ${m.email} | ${m.membershipType} | Books: ${m.borrowedBooks.length}</p>
        </div>
    `).join('');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeUI, setupEventListeners, renderBookCatalogue,
        handleBorrowSubmit, handleBookClick, handleSearch,
        handleFilterChange, exportLibraryData, importLibraryData,
        saveToLocalStorage, loadFromLocalStorage, displayBookDetails,
        updateStatisticsDisplay, createMemberForm, showSection, renderMemberList
    };
}
