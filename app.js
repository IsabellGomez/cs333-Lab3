
"use strict";

// PART 1: Fake library data
const FAKE_BOOKS = [
  {
    key: "/works/OL893414W",
    title: "Dune",
    author_name: ["Frank Herbert"],
    first_publish_year: 1965
  },
  {
    key: "/works/OL35623W",
    title: "Parable of the Sower",
    author_name: ["Octavia E. Butler"],
    first_publish_year: 1993
  },
  {
    key: "/works/OL35616W",
    title: "Kindred",
    author_name: ["Octavia E. Butler"],
    first_publish_year: 1979
  },
  {
    key: "/works/OL66554W",
    title: "Pride and Prejudice",
    author_name: ["Jane Austen"],
    first_publish_year: 1813
  },
  {
    key: "/works/OL27513W",
    title: "The Fellowship of the Ring",
    author_name: ["J.R.R. Tolkien"],
    first_publish_year: 1954
  },
  {
    key: "/works/OL1168083W",
    title: "Nineteen Eighty-Four",
    author_name: ["George Orwell"],
    first_publish_year: 1949
  }
];

// Fake search using a callback.
// The real Open Library search is used by the page below.
function fakeSearch(query, whenDone) {
  setTimeout(function () {
    const q = query.toLowerCase();

    const matches = FAKE_BOOKS.filter(function (book) {
      return (
        book.title.toLowerCase().includes(q) ||
        (book.author_name || []).some(function (name) {
          return name.toLowerCase().includes(q);
        })
      );
    });

    whenDone(matches);
  }, 1000);
}

// Find the HTML elements
const form = document.querySelector("#search-form");
const input = document.querySelector("#query");
const statusMessage = document.querySelector("#status");
const results = document.querySelector("#results");
const readingListElement = document.querySelector("#reading-list");

// PART 3: Load the saved reading list from localStorage
const STORAGE_KEY = "cs333-book-finder-reading-list";

let readingList = [];

try {
  const savedBooks = localStorage.getItem(STORAGE_KEY);

  if (savedBooks) {
    const parsedBooks = JSON.parse(savedBooks);

    if (Array.isArray(parsedBooks)) {
      readingList = parsedBooks;
    }
  }
} catch (error) {
  console.log("Could not load the saved reading list:", error);
}

// Save the reading list in the browser
function saveReadingList() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readingList));
  } catch (error) {
    console.log("Could not save the reading list:", error);
    statusMessage.textContent =
      "Your list could not be saved in this browser.";
  }
}

// PART 2: Search the real Open Library catalogue
async function searchBooks(query) {
  const url =
    "https://openlibrary.org/search.json?limit=10&q=" +
    encodeURIComponent(query);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("The library search request failed.");
  }

  const data = await response.json();

  return data.docs || [];
}

// Display search results and create Save buttons
function renderResults(books) {
  results.textContent = "";

  books.forEach(function (book) {
    const li = document.createElement("li");

    // Handle books without an author
    let author = "Unknown author";

    if (book.author_name && book.author_name.length > 0) {
      author = book.author_name[0];
    }

    // Handle books without a publication year
    let year = "";

    if (book.first_publish_year) {
      year = " (" + book.first_publish_year + ")";
    }

    li.textContent = book.title + " — " + author + year;

    // Create a Save button for this book
    const save = document.createElement("button");
    save.type = "button";
    save.textContent = "Save";

    save.addEventListener("click", function () {
      readingList.push(book);
      saveReadingList();
      renderReadingList();
    });

    li.append(save);
    results.append(li);
  });
}

// PART 3: Display the reading list and create Remove buttons
function renderReadingList() {
  readingListElement.textContent = "";

  readingList.forEach(function (book, index) {
    const li = document.createElement("li");

    li.textContent = book.title;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";

    remove.addEventListener("click", function () {
      readingList.splice(index, 1);
      saveReadingList();
      renderReadingList();
    });

    li.append(remove);
    readingListElement.append(li);
  });
}

// Listen for the search form submission
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const query = input.value.trim();

  if (!query) {
    statusMessage.textContent = "Please enter a book title or author.";
    return;
  }

  statusMessage.textContent = "Searching...";
  results.textContent = "";

  try {
    const books = await searchBooks(query);

    renderResults(books);

    if (books.length === 0) {
      statusMessage.textContent = "No books found.";
    } else {
      statusMessage.textContent =
        "Found " + books.length + " books.";
    }
  } catch (error) {
    console.log("Something went wrong:", error);

    statusMessage.textContent =
      "Couldn't reach the library. Check your connection.";
  }
});

// Show previously saved books when the page loads
renderReadingList();
