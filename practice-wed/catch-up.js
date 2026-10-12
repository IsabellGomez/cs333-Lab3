// Everything from Week 3 Wednesday's practice steps. Copy over app.js if you fell behind.

const list = document.querySelector("#list");
const message = document.querySelector("#message");
const form = document.querySelector("#search-form");
const input = document.querySelector("#query");

function addItem(text) {
  const li = document.createElement("li");
  li.textContent = text;
  list.append(li);
}

async function getBooks(query) {
  message.textContent = "Searching...";
  const url = "https://openlibrary.org/search.json?limit=10&q=" + encodeURIComponent(query);
  console.log("fetching", url);

  try {
    const response = await fetch(url);
    const data = await response.json();

    list.textContent = "";
    data.docs.forEach(function (book) {
      let author = "Unknown author";
      if (book.author_name) {
        author = book.author_name[0];
      }
      addItem(book.title + " — " + author);
    });

    if (data.docs.length === 0) {
      message.textContent = "No books found";
    } else {
      message.textContent = "Found " + data.docs.length + " books";
    }
  } catch (error) {
    console.log("something went wrong:", error);
    message.textContent = "Couldn't reach the library. Check your connection.";
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  getBooks(input.value);
});
