/**
 * @jest-environment jsdom
 */

import {
    library,
    renderBookCatalogue,
    renderStats,
    renderMembers,
    showMessage,
    switchTab
} from "../src/ui.js";

import { Book } from "../src/library.js";

describe("UI Module", () => {

    beforeEach(() => {

        document.body.innerHTML = `
            <div id="book-catalogue"></div>

            <div id="stats-container"></div>

            <div id="members-list"></div>

            <div id="message-container"></div>

            <select id="filter-category"></select>

            <div id="tab-catalogue" class="tab-content"></div>
            <div id="tab-members" class="tab-content"></div>
            <div id="tab-stats" class="tab-content"></div>

            <button class="tab-btn" data-tab="catalogue"></button>
            <button class="tab-btn" data-tab="members"></button>
            <button class="tab-btn" data-tab="stats"></button>
        `;

        library.books = [];
        library.members = [];
        library.borrowedBooks = [];
        library.isbnIndex.clear();
    });

    test("renderBookCatalogue displays books", () => {

        library.addBook(
            new Book(
                "123",
                "JavaScript",
                "John Doe",
                2024,
                3,
                "Programming"
            )
        );

        renderBookCatalogue();

        expect(
            document.querySelectorAll(".book-card").length
        ).toBe(1);

        expect(
            document.body.textContent
        ).toContain("JavaScript");
    });

    test("renderBookCatalogue shows empty message", () => {

        renderBookCatalogue();

        expect(
            document.getElementById("book-catalogue").textContent
        ).toContain("No books found");
    });

    test("renderStats displays totals", () => {

        library.addBook(
            new Book(
                "123",
                "JS",
                "John",
                2024,
                2
            )
        );

        library.addMember(
            "Alice",
            "alice@test.com"
        );

        renderStats();

        expect(
            document.getElementById("stats-container").textContent
        ).toContain("Total Books");

        expect(
            document.getElementById("stats-container").textContent
        ).toContain("Members");
    });

    test("renderMembers displays members", () => {

        library.addMember(
            "Alice",
            "alice@test.com"
        );

        renderMembers();

        expect(
            document.querySelectorAll(".member-card").length
        ).toBe(1);

        expect(
            document.body.textContent
        ).toContain("Alice");
    });

    test("renderMembers shows message when empty", () => {

        renderMembers();

        expect(
            document.getElementById("members-list").textContent
        ).toContain("No registered members");
    });

    test("showMessage displays text", () => {

        showMessage(
            "Book added!",
            "success"
        );

        const message =
            document.getElementById("message-container");

        expect(message.textContent)
            .toBe("Book added!");

        expect(message.className)
            .toContain("success");
    });

    test("switchTab shows catalogue tab", () => {

        switchTab("catalogue");

        expect(
            document.getElementById("tab-catalogue").style.display
        ).toBe("block");
    });

    test("switchTab activates button", () => {

        switchTab("members");

        const active =
            document.querySelector('[data-tab="members"]');

        expect(
            active.classList.contains("active")
        ).toBe(true);
    });

    test("renderBookCatalogue creates borrow button", () => {

        library.addBook(
            new Book(
                "555",
                "CSS",
                "Jane",
                2022,
                1
            )
        );

        renderBookCatalogue();

        expect(
            document.querySelector(".borrow-btn")
        ).not.toBeNull();
    });

    test("book card contains author", () => {

        library.addBook(
            new Book(
                "111",
                "HTML",
                "Alice",
                2020,
                2
            )
        );

        renderBookCatalogue();

        expect(
            document.body.textContent
        ).toContain("Alice");
    });

});