# cs333-lab3
Events, callbacks, `async`/`await` and `fetch`: build a Book Finder 📚

Search a real library catalogue ([Open Library](https://openlibrary.org/developers/api): free, no key, no sign-up), show the results, and keep a reading list.

Do each step below, and **answer the questions right here in this `README.md` file** as you go (type your answers under each question).

- **Part 1:** after Monday's class: forms, event delegation, a fake slow search with a callback
- **Part 2:** after Wednesday's class: swap the fake for a real `fetch` with `async`/`await`
- **Part 3:** a reading list that survives a page reload
- **Deploy** to `lampforall` as `lab3/`

**How this lab works (three links to hand in):**
- **Your code:** make your own copy of this lab (click **Use this template**, or clone it), do your work, and **push it to your own GitHub repo**.
- **Your landing page:** your home page on `lampforall`, now linking to Lab 3 too.
- **Your live Book Finder:** SFTP it to your web folder so it runs at `.../students/yourname/lab3/`.

>  **Same two rules as Lab 2:** relative paths only (`style.css`, never `/style.css`), and filenames are case-sensitive on the server.

**Habits I'm looking for, all the way through:**
- **Build one step at a time.** After every step, run it in the browser with DevTools → **Console** open. Don't paste in a whole solution and debug it all at once.
- **`console.log` what came in** (the form value, the data you got back) before you use it. **Leave these in your code.**
- **Commit after each part** with a message that says what works now (`Part 1: fake search shows results`).
- **User data goes on the page with `textContent`**, never `innerHTML`.
- **Comment the *why***, not the *what*: `// disabled so a double-click can't send two searches`, not `// disable button`.

## Part 1: a fake search (after Monday)

`index.html` and `style.css` are done. `app.js` gives you `FAKE_BOOKS` and `fakeSearch(query, onResults)`, a pretend library that answers after one second. Read it first.

1. Select the form, `#status` and `#results` with `querySelector`. `console.log` each: none should be `null`.
   The `<script>` tag has `type="module"`. Why does that mean your code can find these elements, even though the tag is in the `<head>`?
2. Listen for **`submit`** on the form (not `click` on the button). Call `event.preventDefault()`, read the query with `new FormData(form)`, `.trim()` it, and log it.
   What happens if you leave out `preventDefault()`?
3. Call `fakeSearch(query, callback)`. In your callback, log the array you get back.
   Put a `console.log("after fakeSearch")` on the line right after the call. Which prints first, and why?
4. **Loading state:** before calling `fakeSearch`, set the status to `Searching for "…"` and disable the button. In the callback, clear the status and re-enable the button.
5. Write `renderResults(books)`: empty `#results`, then add one `<li>` per book showing the title, the first author and the year. Use `document.createElement` and `textContent`. Call it from your callback.
6. **Empty state:** when nothing matches, the status says `No books found for "…"`.
7. Give each result a **Save** button with `data-key` set to the book's `key`. Add **one** listener on `#results` (event delegation) that logs the clicked book's key. Don't add a listener per button.
   Why does one listener on the `<ul>` work for buttons that didn't exist when the page loaded?

**Check:** search `butler` → "Searching…" for a second → two results. Search `zzz` → the empty message. Click Save → the key is logged.

## Part 2: the real thing (after Wednesday)

Open this in a browser tab and look at the JSON. The books are in `docs`:
`https://openlibrary.org/search.json?q=octavia+butler&limit=10&fields=key,title,author_name,first_publish_year,cover_i`

8. Write `async function searchBooks(query)` that returns the `docs` array. Build the URL with `URLSearchParams`, so spaces and symbols in the query are encoded for you:
   ```js
   const params = new URLSearchParams({
     q: query,
     limit: 10,
     fields: "key,title,author_name,first_publish_year,cover_i",
   });
   const url = `https://openlibrary.org/search.json?${params}`;
   ```
9. `await fetch(url)`, then **check `response.ok`** before reading the body; if it isn't ok, `throw new Error(...)` with the status code. Then `await response.json()`, log `data.numFound`, and return `data.docs`.
   `fetch` didn't throw an error for a 404. Why not, and why does that mean you have to check `response.ok` yourself?
10. Make your submit handler `async`. Replace the `fakeSearch(...)` call with `const books = await searchBooks(query);` then `renderResults(books)`.
    Your callback from Part 1 is gone. Where did the code that was inside it go?
11. **Error state:** wrap the search in `try` / `catch` / `finally`.
    - `catch`: a message a person can act on ("Couldn't reach the library. Check your connection and try again.") and `console.error` the real error.
    - `finally`: re-enable the button.
12. Real data is messy: some books have no `author_name`, some have no year. Show "Unknown author" and leave the year out rather than printing `undefined`. (Search `annual report` to see both.)
13. Covers: when a book has `cover_i`, show `https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg` in an `<img>` with `alt` set to `Cover of …`.

**Check:**
- A search with a space and an apostrophe (`ender's game`) works.
- DevTools → **Network** → throttling → **Offline**, then search: you see your error message, the button comes back, nothing is stuck on "Searching…". Set it back to **No throttling**.
  What did the Console show for the real error?
- Search for just `the`. Open Library answers with status **422**, and your page probably says "Couldn't reach the library". Is that true? Make the message match what actually went wrong: a network failure and a server that refused the request need different words.

## Part 3: a reading list

14. Keep the list in one array of `{ key, title, author }` objects.
15. When Save is clicked (your delegated listener from step 7), add that book unless it's already there, then call `renderReadingList()`.
16. Each reading-list item gets a **Remove** button, handled by **one** listener on `#reading-list`.
17. After every change, save it: `localStorage.setItem("readingList", JSON.stringify(readingList))`. When the page loads, read it back with `JSON.parse`. Reload: your list is still there.
    Why do you need `JSON.stringify` here? What does `localStorage` store?

## Optional stretch (pick any)

- **Stale results:** search `dune`, then quickly `emma`. If `dune` answers last, the wrong results show. Fix it with an `AbortController` that cancels the previous request.
- **Sort** the results by year without making a new request.
- **Link** each title to `https://openlibrary.org${book.key}` in a new tab (`target="_blank" rel="noopener"`).
- **Debounce:** search as you type, but only after 400 ms without a keystroke.

## Deploy it

18. Add Lab 3 to your landing page: a link `href="lab3/"` and a line saying what it is. Check that the **← Home** link at the top of Book Finder goes back.
19. SFTP `index.html`, `style.css` and `app.js` into a `lab3/` folder in your web folder, plus your updated landing page.
20. Open `https://lampforall.cis251296.projects.jetstream-cloud.org/students/yourname/lab3/` and test everything there: search, Save, Remove, reload.
    Your reading list is empty on the live site even though it was full locally. Why? (Hint: where does `localStorage` keep things?)
21. One bug you hit in this lab: what was it, and what did the Console or Network tab show you?
22. Push this repo (code **and** this README with your answers) to **your own GitHub repo**.
23. Submit in Moodle three links: (1) your GitHub repo, (2) your landing page, and (3) your live Book Finder.

## Stuck?

| You see | Likely cause |
| --- | --- |
| `Cannot read properties of null (reading 'addEventListener')` | A typo in a selector (`#result` vs `#results`) |
| The page reloads and the Console clears when you search | No `event.preventDefault()`, or you listened for `click` on the button instead of `submit` on the form |
| `Promise {<pending>}` or `[object Promise]` | Missing `await` |
| `await is only valid in async functions…` | The function with the `await` in it isn't marked `async` |
| `undefined` in a result | That book has no author or year: step 12 |
| `Unexpected token '<'` … `is not valid JSON` | The URL is wrong and you got an HTML error page back. Log `url` and open it in a tab |
| Stuck on "Searching…" | The error path never re-enables the button: move that into `finally` |
| `document is not defined` | You ran `app.js` with VS Code's ▶ button, which uses Node. Use Live Server |
| Works locally, broken on `lampforall` | DevTools → Network, look for red 404s: a leading `/` or a filename's case |
