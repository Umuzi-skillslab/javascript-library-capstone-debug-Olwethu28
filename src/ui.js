// ==========================================
// UI MODULE - DOM Manipulation & Event Handling
// Demonstrates: event delegation, DOMContentLoaded,
// DocumentFragment, null checks, preventDefault,
// template literals for HTML, change/click/input/submit events
// ==========================================

import { Book, Library, LibraryStats } from './library.js';
import { formatBookInfo, calculateFineAmount } from './utils.js';
import { saveToLocalStorage, loadFromLocalStorage } from './storage.js';

// Create global library instance
const library = new Library('Community Public Library');

// ==========================================
// RENDERING FUNCTIONS
// ==========================================

function renderBookCatalogue(booksToRender = null) {
  const catalogueContainer = document.getElementById('book-catalogue');
  if (!catalogueContainer) return;

  const books = booksToRender || library.books;
  catalogueContainer.innerHTML = '';

  if (books.length === 0) {
    catalogueContainer.innerHTML = '<p class="no-results">No books found.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const book of books) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.isbn = book.isbn;

    card.innerHTML = `
      <h3 class="book-title">${book.title}</h3>
      <p class="book-author">by ${book.author}</p>
      <p class="book-year">Published: ${book.year}</p>
      <p class="book-category">Category: ${book.category}</p>
      <p class="book-availability ${book.isAvailable() ? 'available' : 'unavailable'}">
        ${book.availableCopies}/${book.totalCopies} copies available
      </p>
      <button class="btn borrow-btn" data-isbn="${book.isbn}"
        ${!book.isAvailable() ? 'disabled' : ''}>
        ${book.isAvailable() ? 'Borrow' : 'Unavailable'}
      </button>
    `;
    fragment.appendChild(card);
  }

  catalogueContainer.appendChild(fragment);
}

function renderStats() {
  const statsContainer = document.getElementById('stats-container');
  if (!statsContainer) return;

  const { totalBooks, totalMembers, totalBorrowed, totalAvailable } = library.getStats();

  statsContainer.innerHTML = `
    <div class="stat-card">
      <h3>${totalBooks}</h3><p>Total Books</p>
    </div>
    <div class="stat-card">
      <h3>${totalMembers}</h3><p>Members</p>
    </div>
    <div class="stat-card">
      <h3>${totalBorrowed}</h3><p>Borrowed</p>
    </div>
    <div class="stat-card">
      <h3>${totalAvailable}</h3><p>Available</p>
    </div>
  `;
}

function renderMembers() {
  const membersContainer = document.getElementById('members-list');
  if (!membersContainer) return;

  membersContainer.innerHTML = '';

  if (library.members.length === 0) {
    membersContainer.innerHTML = '<p>No registered members.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const member of library.members) {
    const card = document.createElement('div');
    card.className = 'member-card';
    card.dataset.memberId = member.id;
    const memberType = member.membershipType === 'Premium' ? '⭐ Premium' : 'Standard';

    card.innerHTML = `
      <h3>${member.name} <span class="member-type">${memberType}</span></h3>
      <p>ID: ${member.id} | Email: ${member.email || 'N/A'}</p>
      <p>Books borrowed: ${member.borrowedBooks.length}</p>
      <p>Can borrow: ${member.canBorrow() ? 'Yes' : 'No (limit reached)'}</p>
    `;
    fragment.appendChild(card);
  }

  membersContainer.appendChild(fragment);
}

function showMessage(text, type = 'info') {
  const messageContainer = document.getElementById('message-container');
  if (!messageContainer) return;

  messageContainer.textContent = text;
  messageContainer.className = `message ${type}`;
  messageContainer.style.display = 'block';

  setTimeout(() => {
    messageContainer.style.display = 'none';
  }, 3000);
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleSearch(event) {
  const query = event.target.value.trim();
  if (!query) {
    renderBookCatalogue();
    return;
  }
  const results = library.searchBooks(query);
  renderBookCatalogue(results);
}

function handleFilterChange(event) {
  const category = event.target.value;
  if (!category || category === 'all') {
    renderBookCatalogue();
    return;
  }
  const filtered = library.getBooksByCategory(category);
  renderBookCatalogue(filtered);
}

function handleMemberSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById('member-name');
  const emailInput = document.getElementById('member-email');
  const premiumCheckbox = document.getElementById('member-premium');

  if (!nameInput) return;

  const name = nameInput.value.trim();
  const email = emailInput?.value?.trim() || '';
  const isPremium = premiumCheckbox?.checked || false;

  if (!name) {
    showMessage('Please enter a member name.', 'error');
    return;
  }

  try {
    const member = library.addMember(name, email, isPremium);
    showMessage(`Member "${member.name}" registered with ID: ${member.id}`, 'success');

    const idDisplay = document.getElementById('member-id-display');
    if (idDisplay) {
      idDisplay.textContent = `Your Member ID: ${member.id}`;
      idDisplay.style.display = 'block';
    }

    nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (premiumCheckbox) premiumCheckbox.checked = false;

    renderMembers();
    renderStats();
    library.saveState();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function handleBorrowSubmit(event) {
  event.preventDefault();

  const memberIdInput = document.getElementById('borrow-member-id');
  const isbnInput = document.getElementById('borrow-isbn');

  if (!memberIdInput || !isbnInput) return;

  const memberId = parseInt(memberIdInput.value.trim(), 10);
  const isbn = isbnInput.value.trim();

  if (isNaN(memberId) || !isbn) {
    showMessage('Please enter both Member ID and ISBN.', 'error');
    return;
  }

  const result = library.borrowBook(memberId, isbn);
  showMessage(result.message, result.success ? 'success' : 'error');

  if (result.success) {
    memberIdInput.value = '';
    isbnInput.value = '';
    renderBookCatalogue();
    renderStats();
    library.saveState();
  }
}

function handleReturnSubmit(event) {
  event.preventDefault();

  const memberIdInput = document.getElementById('return-member-id');
  const isbnInput = document.getElementById('return-isbn');

  if (!memberIdInput || !isbnInput) return;

  const memberId = parseInt(memberIdInput.value.trim(), 10);
  const isbn = isbnInput.value.trim();

  if (isNaN(memberId) || !isbn) {
    showMessage('Please enter both Member ID and ISBN.', 'error');
    return;
  }

  const result = library.returnBook(memberId, isbn);
  showMessage(result.message, result.success ? 'success' : 'error');

  if (result.success) {
    memberIdInput.value = '';
    isbnInput.value = '';
    renderBookCatalogue();
    renderStats();
    library.saveState();
  }
}

function handleAddBookSubmit(event) {
  event.preventDefault();

  const isbn = document.getElementById('add-isbn')?.value?.trim();
  const title = document.getElementById('add-title')?.value?.trim();
  const author = document.getElementById('add-author')?.value?.trim();
  const year = parseInt(document.getElementById('add-year')?.value?.trim(), 10);
  const copies = parseInt(document.getElementById('add-copies')?.value?.trim(), 10) || 1;
  const category = document.getElementById('add-category')?.value?.trim() || 'General';

  if (!isbn || !title || !author) {
    showMessage('Please fill in ISBN, Title, and Author.', 'error');
    return;
  }

  try {
    const book = new Book(isbn, title, author, year, copies, category);
    library.addBook(book);
    showMessage(`"${title}" added to the library!`, 'success');
    document.getElementById('add-book-form')?.reset();
    renderBookCatalogue();
    renderStats();
    updateFilterDropdown();
    library.saveState();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// ==========================================
// EVENT DELEGATION & HELPERS
// ==========================================

function handleCatalogueClick(event) {
  const borrowBtn = event.target.closest('.borrow-btn');
  if (!borrowBtn) return;

  const isbn = borrowBtn.dataset.isbn;
  if (!isbn) return;

  const borrowIsbnInput = document.getElementById('borrow-isbn');
  if (borrowIsbnInput) {
    borrowIsbnInput.value = isbn;
    switchTab('borrow');
    showMessage(`ISBN ${isbn} filled in. Enter your Member ID to borrow.`, 'info');
  }
}

function handleMemberClick(event) {
  const memberCard = event.target.closest('.member-card');
  if (!memberCard) return;

  const memberId = memberCard.dataset.memberId;
  if (!memberId) return;

  const borrowMemberInput = document.getElementById('borrow-member-id');
  if (borrowMemberInput) {
    borrowMemberInput.value = memberId;
    showMessage(`Member ID ${memberId} selected.`, 'info');
  }
}

function updateFilterDropdown() {
  const filterDropdown = document.getElementById('filter-category');
  if (!filterDropdown) return;

  const categories = library.getCategories();
  filterDropdown.innerHTML = '<option value="all">All Categories</option>';

  for (const category of categories) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    filterDropdown.appendChild(option);
  }
}

// ==========================================
// TAB NAVIGATION
// ==========================================

function switchTab(tabName) {
  const allTabs = document.querySelectorAll('.tab-content');
  allTabs.forEach(tab => { tab.style.display = 'none'; });

  const allButtons = document.querySelectorAll('.tab-btn');
  allButtons.forEach(btn => { btn.classList.remove('active'); });

  const selectedTab = document.getElementById(`tab-${tabName}`);
  if (selectedTab) selectedTab.style.display = 'block';

  const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (selectedBtn) selectedBtn.classList.add('active');

  if (tabName === 'catalogue') renderBookCatalogue();
  if (tabName === 'members') renderMembers();
  if (tabName === 'stats') renderStats();
}

// ==========================================
// SEED DATA
// ==========================================

function seedSampleData() {
  if (library.books.length > 0) return;

  try {
    const sampleBooks = [
      new Book('978-0-13-468599-1', 'The Pragmatic Programmer', 'David Thomas', 2019, 3, 'Technology'),
      new Book('978-0-06-112008-4', 'To Kill a Mockingbird', 'Harper Lee', 1960, 2, 'Fiction'),
      new Book('978-0-452-28423-4', '1984', 'George Orwell', 1949, 4, 'Fiction'),
      new Book('978-0-32-112521-7', 'Domain-Driven Design', 'Eric Evans', 2003, 2, 'Technology'),
      new Book('978-0-14-028329-7', 'The Great Gatsby', 'F. Scott Fitzgerald', 1925, 3, 'Fiction'),
      new Book('978-0-59-651798-7', 'JavaScript: The Good Parts', 'Douglas Crockford', 2008, 5, 'Technology'),
      new Book('978-0-74-327356-5', 'A Brief History of Time', 'Stephen Hawking', 1988, 2, 'Science'),
      new Book('978-0-06-093546-7', 'Study Guide Companion', 'Mary McDougal', 2005, 1, 'Education')
    ];
    library.addMultipleBooks(...sampleBooks);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
  }
}

function renderOverdueBooks() {
  const container = document.getElementById('overdue-container');
  if (!container) return;

  const overdueBooks = library.getOverdueBooks();
  const totalFines = library.calculateTotalLateFees();

  if (overdueBooks.length === 0) {
    container.innerHTML = '<p style="color:#2e7d32;font-weight:600;">✅ No overdue books!</p>';
    return;
  }

  let html = `<p style="color:#c62828;font-weight:600;margin-bottom:0.8rem;">
    ⚠️ ${overdueBooks.length} overdue book(s) — Total fines: R${totalFines.toFixed(2)}
  </p>`;

  for (const record of overdueBooks) {
    html += `
      <div class="book-card" style="border-left-color:#c62828;margin-bottom:0.8rem;">
        <h3>${record.bookTitle}</h3>
        <p>Borrowed by: ${record.memberName} (ID: ${record.memberId})</p>
        <p>Days overdue: <strong>${record.daysOverdue}</strong></p>
        <p style="color:#c62828;font-weight:600;">Fine: R${record.fine.toFixed(2)}</p>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ==========================================
// INITIALIZATION
// ==========================================

function initializeUI() {
  // Tab listeners BEFORE guard clause so they always bind
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      if (tabName) switchTab(tabName);
    });
  });

  const overdueBtn = document.getElementById('check-overdue-btn');
  if (overdueBtn) {
     overdueBtn.addEventListener('click', renderOverdueBooks);
 }

  const catalogueContainer = document.getElementById('book-catalogue');
  const searchInput = document.getElementById('search-input');
  const filterDropdown = document.getElementById('filter-category');

  if (!catalogueContainer || !searchInput || !filterDropdown) {
    console.warn('Some UI elements not found. Partial initialization.');
  }

  const loaded = library.loadState();
  if (!loaded) seedSampleData();

  if (searchInput) searchInput.addEventListener('input', handleSearch);
  if (filterDropdown) {
    filterDropdown.addEventListener('change', handleFilterChange);
    updateFilterDropdown();
  }
  if (catalogueContainer) catalogueContainer.addEventListener('click', handleCatalogueClick);

  const membersList = document.getElementById('members-list');
  if (membersList) membersList.addEventListener('click', handleMemberClick);

  const memberForm = document.getElementById('member-form');
  if (memberForm) memberForm.addEventListener('submit', handleMemberSubmit);

  const borrowForm = document.getElementById('borrow-form');
  if (borrowForm) borrowForm.addEventListener('submit', handleBorrowSubmit);

  const returnForm = document.getElementById('return-form');
  if (returnForm) returnForm.addEventListener('submit', handleReturnSubmit);

  const addBookForm = document.getElementById('add-book-form');
  if (addBookForm) addBookForm.addEventListener('submit', handleAddBookSubmit);

  renderBookCatalogue();
  renderStats();
  renderMembers();
}



// Fixed: DOMContentLoaded was missing
document.addEventListener('DOMContentLoaded', initializeUI);

// ES6 exports for browser
export {
  library, renderBookCatalogue, renderStats, renderMembers,
  handleSearch, handleFilterChange, handleMemberSubmit,
  handleBorrowSubmit, handleReturnSubmit, handleAddBookSubmit,
  switchTab, showMessage, renderOverdueBooks, initializeUI
};

// CommonJS export for Jest DOM tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    library, renderBookCatalogue, renderStats, renderMembers,
    handleSearch, handleFilterChange, handleMemberSubmit,
    handleBorrowSubmit, handleReturnSubmit, handleAddBookSubmit,
    switchTab, showMessage, renderOverdueBooks, initializeUI
  };
}