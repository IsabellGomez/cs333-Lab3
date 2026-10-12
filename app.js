// Part 1: a pretend library. In Part 2 you replace fakeSearch with a real search using fetch.
const FAKE_BOOKS = [
  { key: "/works/OL893414W", title: "Dune", author_name: ["Frank Herbert"], first_publish_year: 1965 },
  { key: "/works/OL35623W", title: "Parable of the Sower", author_name: ["Octavia E. Butler"], first_publish_year: 1993 },
  { key: "/works/OL35616W", title: "Kindred", author_name: ["Octavia E. Butler"], first_publish_year: 1979 },
  { key: "/works/OL66554W", title: "Pride and Prejudice", author_name: ["Jane Austen"], first_publish_year: 1813 },
  { key: "/works/OL27513W", title: "The Fellowship of the Ring", author_name: ["J.R.R. Tolkien"], first_publish_year: 1954 },
  { key: "/works/OL1168083W", title: "Nineteen Eighty-Four", author_name: ["George Orwell"], first_publish_year: 1949 },
];

// Pretends to be a slow website: after one second it calls whenDone with the books that match.
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

// Your code starts here.
