
 // Part 1: Fake library data
const FAKE_BOOKS = [
  { key: "/works/OL893414W", title: "Dune", author_name: ["Frank Herbert"], first_publish_year: 1965 },
  { key: "/works/OL35623W", title: "Parable of the Sower", author_name: ["Octavia E. Butler"], first_publish_year: 1993 },
  { key: "/works/OL35616W", title: "Kindred", author_name: ["Octavia E. Butler"], first_publish_year: 1979 },
  { key: "/works/OL66554W", title: "Pride and Prejudice", author_name: ["Jane Austen"], first_publish_year: 1813 },
  { key: "/works/OL27513W", title: "The Fellowship of the Ring", author_name: ["J.R.R. Tolkien"], first_publish_year: 1954 },
  { key: "/works/OL1168083W", title: "Nineteen Eighty-Four", author_name: ["George Orwell"], first_publish_year: 1949 },
];

// Fake search for Part 1
function fakeSearch(query, whenDone) {
  setTimeout(() => {
    const q = query.toLowerCase();
    const matches = FAKE_BOOKS.filter(
      (book) =>
        book.title.toLowerCase().includes(q) ||
        book.author_name.some((name) => name.toLowerCase().includes(q))
    );
    whenDone(matches);
  }, 1000);
}

// Find the HTML elements
const form = document.querySelector("#search-form");
const input = document.querySelector("#query");
const statusMessage = document.querySelector("#status");
const results = document.querySelector("#results");

console.log(form, input, statusMessage, results);

// Search the real Open Library catalogue
async function searchBooks(query) {
  const url =
    "https://openlibrary.org/search.json?limit=10&q=" +
    encodeURIComponent(query);

  console.log("fetching", url);

  const response = await fetch(url);
  const data = await response.json();

  return data.docs;
}

// Display the books and add a Save button to each one

function renderResults(books) {
  results.textContent = "";

  books.forEach(function (book) {
    const li = document.createElement("li");

    let author = "Unknown author";
    if (book.author_name) {
      author = book.author_name[0];
    }

    let year = "";
    if (book.first_publish_year) {
      year = " (" + book.first_publish_year + ")";
    }

    li.textContent = book.title + " — " + author + year;

    const save = document.createElement("button");
    save.textContent = "Save";

    save.addEventListener("click", function () {
      console.log("save", book.title);
    });

    li.append(save);
    results.append(li);
  });
}


// Listen for the form submission and search the real catalogue

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const query = input.value;
  console.log("searching for", query);

  statusMessage.textContent = "Searching...";

  try {
    const books = await searchBooks(query);
    console.log("got", books);

    renderResults(books);

    if (books.length === 0) {
      statusMessage.textContent = "No books found";
    } else {
      statusMessage.textContent = "";
    }
  } catch (error) {
    console.log("something went wrong:", error);
    statusMessage.textContent =
      "Couldn't reach the library. Check your connection.";
  }
});
