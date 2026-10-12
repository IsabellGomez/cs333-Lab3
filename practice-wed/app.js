// Week 3 Wednesday practice. Monday's addItem is here already; paste each step from the slides below it.
const list = document.querySelector("#list");
const message = document.querySelector("#message");

function addItem(text) {
  const li = document.createElement("li");
  li.textContent = text;
  list.append(li);
}
