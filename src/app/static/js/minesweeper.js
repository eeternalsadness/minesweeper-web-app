document.addEventListener("DOMContentLoaded", function () {
  const boardElement = document.getElementById("minesweeper-board");

  // Adjust rows and cols as needed
  const rows = 8;
  const cols = 8;

  boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

  function renderBoard(board) {
    boardElement.innerHTML = ""; // Clear existing cells
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const cell = document.createElement("div");
        cell.classList.add("cell", "undugged-cell");
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.textContent = board[row][col]; // Display the cell value
        boardElement.appendChild(cell);
      }
    }
  }

  // Initial render with mock board state
  renderBoard([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  function handleClick(event) {
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;

    // Call the backend API for game logic
    fetch("http://localhost:3000/reveal-cell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ row, col }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the board state and re-render
        renderBoard(data.board);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Add event listener to cells
  boardElement.addEventListener("click", handleClick);
});
