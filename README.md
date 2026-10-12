# cs333-lab3
Forms, callbacks and fetch: build a Book Finder 📚

Search a real library catalogue ([Open Library](https://openlibrary.org/developers/api): free, no key, no sign-up), show the results, and keep a reading list.

Do each step below, and **answer the questions right here in this `README.md` file** as you go (type your answers under each question).

- **Part 1:** after Monday's class. A form, a fake slow search, and a list of results.
- **Part 2:** after Wednesday's class. Swap the fake search for a real one with `fetch`.
- **Part 3:** a reading list.
- **Deploy** to `lampforall` as `lab3/`.

Each part uses exactly what we did in class. The `practice/` and `practice-wed/` folders in this repo are the class practice pages, with a `catch-up.js` in each, if you want to look back.

**How this lab works (three links to hand in):**
- **Your code:** make your own copy of this lab (click **Use this template**, or clone it), do your work, and **push it to your own GitHub repo**.
- **Your landing page:** your home page on `lampforall`, now linking to Lab 3 too.
- **Your live Book Finder:** SFTP it to your web folder so it runs at `.../students/yourname/lab3/`.

> ⚠️ **Same two rules as Lab 2:** relative paths only (`style.css`, never `/style.css`), and filenames are case-sensitive on the server.

**Habits I'm looking for:**
- **One step at a time.** After every step, reload with DevTools → **Console** open and check it works before going on.
- **Leave your `console.log`s in.**
- **Commit after each part** with a message that says what works now (`Part 1: fake search shows results`).
- **Comment your code** to explain how it works, in your own words.

## Part 1: a fake search (after Monday)

`index.html` and `style.css` are done. Open `app.js`: it gives you `FAKE_BOOKS` (a few books) and `fakeSearch(query, whenDone)`, a pretend library that answers after one second, the same idea as Monday's `saveItem`. Your code goes at the bottom.

1. Find the elements you need. Paste this at the bottom of `app.js` and reload: none of the four should log `null`.
   ```js
   const form = document.querySelector("#search-form");
   const input = document.querySelector("#query");
   const statusMessage = document.querySelector("#status");
   const results = document.querySelector("#results");
   console.log(form, input, statusMessage, results);
   ```

2. Listen for the form, the same as Monday's practice page:
   ```js
   form.addEventListener("submit", function (event) {
     event.preventDefault();
     const query = input.value;
     console.log("searching for", query);
   });
   ```
   Type something and press Enter. What does the Console show?

3. Call the fake search. Add these lines **inside** your submit listener, after the `console.log`:
   ```js
     fakeSearch(query, function (books) {
       console.log("got", books);
     });
   ```
   Search `butler`. After a second, the Console shows what `fakeSearch` sent back. How many books, and what are their titles?

4. **Show that it's working.** Inside the listener, before `fakeSearch`, add:
   ```js
     statusMessage.textContent = "Searching...";
   ```
   Then make the callback set `statusMessage.textContent` back to `""` when the books arrive.

5. **Show the books.** Paste this function above your submit listener:
   ```js
   function renderResults(books) {
     results.textContent = "";
     books.forEach(function (book) {
       const li = document.createElement("li");
       li.textContent = book.title + " — " + book.author_name[0] + " (" + book.first_publish_year + ")";
       results.append(li);
     });
   }
   ```
   Then call `renderResults(books);` inside your `fakeSearch` callback. Search `butler` again: two books on the page.

6. **Nothing found.** Search `zzz`: the list is just empty. In the callback, add an `if` so that when `books.length === 0` the status says `No books found`.

7. **A Save button on each book.** In `renderResults`, add these lines just before `results.append(li);`:
   ```js
       const save = document.createElement("button");
       save.textContent = "Save";
       save.addEventListener("click", function () {
         console.log("save", book.title);
       });
       li.append(save);
   ```
   Click Save on each book. How does each button know *which* book it belongs to?

**Check:** `butler` → "Searching..." for a second → two books. `zzz` → "No books found". Save → that book's title in the Console.

Commit: `Part 1: fake search shows results`

## Part 2: the real thing (after Wednesday)

8. Paste this function above your submit listener. It's Wednesday's search, except it **gives back** the books with `return` instead of putting them on the page:
   ```js
   async function searchBooks(query) {
     const url = "https://openlibrary.org/search.json?limit=10&q=" + encodeURIComponent(query);
     console.log("fetching", url);
     const response = await fetch(url);
     const data = await response.json();
     return data.docs;
   }
   ```

9. Replace your whole submit listener with this one. Notice `async` before `function`, and `await` in front of `searchBooks`:
   ```js
   form.addEventListener("submit", async function (event) {
     event.preventDefault();
     const query = input.value;
     console.log("searching for", query);

     statusMessage.textContent = "Searching...";
     const books = await searchBooks(query);
     console.log("got", books);
     renderResults(books);

     if (books.length === 0) {
       statusMessage.textContent = "No books found";
     } else {
       statusMessage.textContent = "";
     }
   });
   ```
   Search `octavia butler`. Real books! Then search `ender's game`.
   `fakeSearch` needed a callback. Where did the code from inside that callback go?

10. **Missing authors.** Search `annual report`. Some books have no author, and your page breaks: look at the Console. Fix `renderResults` the way we did in Wednesday's step 6: start with `let author = "Unknown author";` and only use `book.author_name[0]` if `book.author_name` exists. Do the same for the year, leaving it out when `book.first_publish_year` doesn't exist.
    What was the error in the Console before you fixed it?

11. **When the internet fails.** DevTools → **Network** → **Offline**, then search: stuck on "Searching...". Wrap the middle of your listener in `try` / `catch`, the way we did in Wednesday's step 5:
    ```js
      try {
        const books = await searchBooks(query);
        // ...the rest of what was here...
      } catch (error) {
        console.log("something went wrong:", error);
        statusMessage.textContent = "Couldn't reach the library. Check your connection.";
      }
    ```
    Search while Offline: you get your message. Set it back to **No throttling**.

**Check:** a real search shows real books; `annual report` shows "Unknown author" instead of breaking; Offline shows your message.

Commit: `Part 2: real search with fetch`

## Part 3: a reading list

12. Paste this above your submit listener. `readingList` is an **array** that holds the books you've saved, and `renderReadingList` draws it on the page, with a Remove button on each:
    ```js
    const readingListElement = document.querySelector("#reading-list");
    const readingList = [];

    function renderReadingList() {
      readingListElement.textContent = "";
      readingList.forEach(function (book, index) {
        const li = document.createElement("li");
        li.textContent = book.title + " ";

        const remove = document.createElement("button");
        remove.textContent = "Remove";
        remove.addEventListener("click", function () {
          readingList.splice(index, 1);
          renderReadingList();
        });

        li.append(remove);
        readingListElement.append(li);
      });
    }
    ```
    `splice(index, 1)` removes 1 item at position `index`.

13. Make **Save** add the book. In your Save button's click listener (step 7), under the `console.log`, add two lines:
    ```js
          readingList.push(book);
          renderReadingList();
    ```
    `push` adds an item to the end of an array. Save a few books, then remove one.
    Reload the page. What happens to your reading list, and why?

**Check:** Save adds a book to "My reading list"; Remove takes it off.

Commit: `Part 3: reading list`

## Optional extras

- **No duplicates.** Clicking Save twice adds the book twice. Before the `push`, add:
  ```js
        if (readingList.includes(book)) return;
  ```
  Why does that still let you add a book twice if you search again first? (Hint: is it the *same* object?)
- **Keep the list after a reload.** The browser can store text for your page in `localStorage`. An array isn't text, but `JSON.stringify` turns it into JSON text, and `JSON.parse` turns it back:
  ```js
  // at the end of renderReadingList:
  localStorage.setItem("readingList", JSON.stringify(readingList));
  ```
  and change `const readingList = [];` to:
  ```js
  const readingList = JSON.parse(localStorage.getItem("readingList")) || [];
  ```
  then call `renderReadingList();` once at the very bottom of `app.js`. Save some books and reload.
- **Covers.** Books with a `cover_i` have a picture at `"https://covers.openlibrary.org/b/id/" + book.cover_i + "-S.jpg"`. Add an `<img>` to each result (`img.src = ...`, `img.alt = "Cover of " + book.title`).

## Optional: make it yours (style)

Your Book Finder works; now make it look like *yours*. Everything here goes at the bottom of `style.css`. Paste a piece, reload, then change it until you like it.

**One rule:** change how things *look*, not their names. Your JavaScript finds elements by `id` (`#results`, `#status`, ...), so don't rename or remove those in `index.html`.

1. **Pick your colours in one place.** These are CSS **variables**: you set a colour once at the top and use it everywhere with `var(...)`:
   ```css
   :root {
     --main: #2b6cb0;
     --background: #f7f7f2;
     --card: #ffffff;
     --text: #222222;
   }

   body {
     background: var(--background);
     color: var(--text);
   }

   h1, h2 {
     color: var(--main);
   }
   ```
   Change the colours to your own. [coolors.co](https://coolors.co) can suggest colours that go together.

2. **Buttons.**
   ```css
   button {
     background: var(--main);
     color: white;
     border: none;
     border-radius: 6px;
     padding: 0.4rem 0.8rem;
     cursor: pointer;
   }

   button:hover {
     opacity: 0.85;
   }
   ```
   `:hover` only applies while the mouse is over the button.

3. **Each book as a card.**
   ```css
   #results li,
   #reading-list li {
     background: var(--card);
     border: 1px solid #dddddd;
     border-radius: 8px;
     padding: 0.75rem;
     margin-bottom: 0.5rem;
   }
   ```

4. **A font.** Pick one on [fonts.google.com](https://fonts.google.com), click **Get font → Get embed code**, and copy its `<link>` lines into the `<head>` of `index.html`, *above* the line that loads `style.css`. Then use it in `style.css`, for example:
   ```css
   body {
     font-family: "Lora", serif;
   }
   ```

5. **Dark mode.** This only applies when someone's computer is set to dark mode, and it just swaps the colours from step 1:
   ```css
   @media (prefers-color-scheme: dark) {
     :root {
       --background: #1e1e1e;
       --card: #2a2a2a;
       --text: #eeeeee;
       --main: #7fb3ff;
     }
   }
   ```

6. **Match your landing page,** so your labs look like one website.

**Question:** what did you change, and why? Add a screenshot of your Book Finder before and after to this README.

## Deploy it

14. Add Lab 3 to your landing page: a link `href="lab3/"` and a line saying what it is. Check that the **← Home** link at the top of Book Finder goes back.
15. SFTP `index.html`, `style.css` and `app.js` into a `lab3/` folder in your web folder, plus your updated landing page.
16. Open `https://lampforall.cis251296.projects.jetstream-cloud.org/students/yourname/lab3/` and test everything there: search, Save, Remove.
17. One bug you hit in this lab: what was it, and what did the Console show you?
18. Push this repo (code **and** this README with your answers) to **your own GitHub repo**.
19. Submit in Moodle three links: (1) your GitHub repo, (2) your landing page, and (3) your live Book Finder.

## Stuck?

| You see | Likely cause |
| --- | --- |
| `Cannot read properties of null (reading 'addEventListener')` | A typo in a selector (`#result` vs `#results`) |
| The page reloads and the Console clears when you search | Missing `event.preventDefault()` |
| `Cannot read properties of undefined (reading '0')` | A book with no `author_name`: step 10 |
| `undefined` in a result | A book with no year: step 10 |
| `Promise {<pending>}` | Missing `await` in front of `searchBooks(...)` |
| `await is only valid in async functions…` | The listener needs `async` before `function` |
| Stuck on "Searching..." | An error happened: look in the Console, then step 11 |
| `document is not defined` | You ran `app.js` with VS Code's ▶ button, which uses Node. Use Live Server |
| Works locally, broken on `lampforall` | DevTools → Network, look for red 404s: a leading `/` or a filename's case |
