import {
    calculateFineAmount,
    formatBookInfo,
    searchBooksByCategory,
    daysBetween
} from "../src/utils.js";

describe("calculateFineAmount", () => {

    test("calculates fine correctly", () => {

        expect(
            calculateFineAmount(5, 0.5)
        ).toBe(2.5);

    });

    test("returns 0 for zero overdue days", () => {

        expect(
            calculateFineAmount(0, 0.5)
        ).toBe(0);

    });

    test("returns 0 for negative overdue days", () => {

        expect(
            calculateFineAmount(-3, 0.5)
        ).toBe(0);

    });

});

describe("formatBookInfo", () => {

    test("returns formatted string", () => {

        const info = formatBookInfo(
            "JavaScript",
            "John Doe",
            2024,
            2,
            5
        );

        expect(info).toContain("JavaScript");
        expect(info).toContain("John Doe");
        expect(info).toContain("2024");

    });

});

describe("searchBooksByCategory", () => {

    const books = [

        {
            title: "JavaScript",
            category: "Programming"
        },

        {
            title: "CSS",
            category: "Programming"
        },

        {
            title: "History",
            category: "Education"
        }

    ];

    test("finds matching category", () => {

        const results =
            searchBooksByCategory(
                books,
                "Programming"
            );

        expect(results.length).toBe(2);

    });

    test("returns empty array for unknown category", () => {

        expect(
            searchBooksByCategory(
                books,
                "Science"
            )
        ).toEqual([]);

    });

    test("search is case insensitive", () => {

        expect(
            searchBooksByCategory(
                books,
                "programming"
            ).length
        ).toBe(2);

    });

});

describe("daysBetween", () => {

    test("calculates days correctly", () => {

        const start = new Date("2025-01-01");
        const end = new Date("2025-01-06");

        expect(
            daysBetween(start, end)
        ).toBe(5);

    });

    test("same day returns zero", () => {

        const date = new Date("2025-01-01");

        expect(
            daysBetween(date, date)
        ).toBe(0);

    });

    test("returns absolute difference", () => {

        const start = new Date("2025-01-10");
        const end = new Date("2025-01-01");

        expect(
            daysBetween(start, end)
        ).toBe(9);

    });

});