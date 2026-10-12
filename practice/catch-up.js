// Everything from Week 3 Monday's practice steps. Copy over app.js if you fell behind.

const helloButton = document.querySelector("#hello");
const message = document.querySelector("#message");
const list = document.querySelector("#list");
const form = document.querySelector("#add-form");
const input = document.querySelector("#item");

let count = 0;
helloButton.addEventListener("click", function () {
  count = count + 1;
  message.textContent = "You clicked " + count + " times";
});

function addItem(text) {
  const li = document.createElement("li");
  li.textContent = text;
  list.append(li);
}

function saveItem(text, whenSaved) {
  setTimeout(function () {
    whenSaved(text);
  }, 1500);
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (input.value === "") return;

  message.textContent = "Saving...";
  saveItem(input.value, function (savedText) {
    addItem(savedText);
    message.textContent = "Saved!";
  });
  input.value = "";
});
