import { jest } from "@jest/globals";

import {
    saveToLocalStorage,
    loadFromLocalStorage
} from "../src/storage.js";

describe("Storage Utilities", () => {

    beforeEach(() => {

        let store = {};

        global.localStorage = {
            getItem: jest.fn(key => store[key] || null),

            setItem: jest.fn((key, value) => {
                store[key] = value;
            }),

            removeItem: jest.fn(key => {
                delete store[key];
            }),

            clear: jest.fn(() => {
                store = {};
            })
        };
    });

    test("saveToLocalStorage stores an object", () => {

        const data = {
            name: "Library",
            books: 10
        };

        const result =
            saveToLocalStorage("library", data);

        expect(result).toBe(true);

        expect(localStorage.setItem)
            .toHaveBeenCalled();

        expect(
            JSON.parse(localStorage.getItem("library"))
        ).toEqual(data);
    });

    test("loadFromLocalStorage retrieves object", () => {

        const data = {
            title: "JavaScript",
            copies: 5
        };

        localStorage.setItem(
            "book",
            JSON.stringify(data)
        );

        const result =
            loadFromLocalStorage("book");

        expect(result).toEqual(data);
    });

    test("returns null when key does not exist", () => {

        const result =
            loadFromLocalStorage("missing");

        expect(result).toBeNull();
    });

    test("saves arrays correctly", () => {

        const books = [
            { title: "JS" },
            { title: "CSS" }
        ];

        saveToLocalStorage("books", books);

        expect(
            loadFromLocalStorage("books")
        ).toEqual(books);
    });

    test("returns false if saving fails", () => {

        localStorage.setItem.mockImplementation(() => {
            throw new Error("Storage full");
        });

        const result =
            saveToLocalStorage("key", {});

        expect(result).toBe(false);
    });

    test("returns null if JSON parsing fails", () => {

        localStorage.getItem.mockReturnValue("invalid json");

        const result =
            loadFromLocalStorage("bad");

        expect(result).toBeNull();
    });

    test("can overwrite existing data", () => {

        saveToLocalStorage("library", {
            books: 5
        });

        saveToLocalStorage("library", {
            books: 10
        });

        expect(
            loadFromLocalStorage("library")
        ).toEqual({
            books: 10
        });
    });

    test("stores primitive values", () => {

        saveToLocalStorage("number", 100);

        expect(
            loadFromLocalStorage("number")
        ).toBe(100);
    });

    test("stores strings", () => {

        saveToLocalStorage("message", "Hello");

        expect(
            loadFromLocalStorage("message")
        ).toBe("Hello");
    });

    test("stores booleans", () => {

        saveToLocalStorage("premium", true);

        expect(
            loadFromLocalStorage("premium")
        ).toBe(true);
    });

});