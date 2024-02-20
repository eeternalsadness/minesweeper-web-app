"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var boardElement = document.getElementById("minesweeper-board"); // Adjust rows and cols as needed

  var rows = 8;
  var cols = 8;
  boardElement.style.gridTemplateColumns = "repeat(".concat(cols, ", 30px)");

  function renderBoard(board) {
    boardElement.innerHTML = ""; // Clear existing cells

    for (var row = 0; row < board.length; row++) {
      for (var col = 0; col < board[row].length; col++) {
        var cell = document.createElement("div");
        cell.classList.add("cell", "undugged-cell");
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.textContent = board[row][col]; // Display the cell value

        boardElement.appendChild(cell);
      }
    }
  } // Initial render with mock board state


  renderBoard([[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]);

  function handleClick(event) {
    var row = event.target.dataset.row;
    var col = event.target.dataset.col; // Call the backend API for game logic

    fetch("http://localhost:3000/reveal-cell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        row: row,
        col: col
      })
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      // Update the board state and re-render
      renderBoard(data.board);
    })["catch"](function (error) {
      console.error("Error:", error);
    });
  } // Add event listener to cells


  boardElement.addEventListener("click", handleClick);
});