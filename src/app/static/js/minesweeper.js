(function (app) {
  "use strict";

  app.gameData = {};
  app.boardElement = document.getElementById("minesweeper-board");
  app.startGameForm = document.getElementById("start-game-form");
  const backend = "http://localhost:5000";

  app.startup = function () {
    wireStartGameForm();
  };

  function wireStartGameForm() {
    // console.log("wiring form");
    const startGameForm = document.getElementById("start-game-form");
    startGameForm.onsubmit = submitStartGameForm;
  }

  async function submitStartGameForm(e) {
    e.preventDefault();

    const numRowsInput = app.startGameForm.querySelector("#num_rows");
    const numColsInput = app.startGameForm.querySelector("#num_cols");
    const gameIdInput = app.startGameForm.querySelector("#id");

    // input checks
    if (
      (numRowsInput.value.trim() != "" || numColsInput.value.trim() != "") &&
      gameIdInput.value.trim() != ""
    ) {
      alert("Enter # rows and # columns OR game ID only, not both!");
      return;
    } else if (
      (numRowsInput.value.trim() != "") ^
      (numColsInput.value.trim() != "")
    ) {
      alert("Both # rows and # columns must have valid values!");
      return;
    } else if (
      parseInt(numRowsInput.value.trim()) < 10 ||
      parseInt(numRowsInput.value.trim()) > 50 ||
      parseInt(numColsInput.value.trim()) < 10 ||
      parseInt(numColsInput.value.trim()) > 50
    ) {
      alert("The board must be at least 10x10 and at most 50x50!");
      return;
    }

    // start new game with # rows and # cols
    if (numRowsInput.value.trim() != "" && numColsInput.value.trim() != "") {
      let numRows = parseInt(numRowsInput.value.trim());
      let numCols = parseInt(numColsInput.value.trim());
      await startGame(numRows, numCols);
    }
    // continue game with game ID
    else {
      let gameId = gameIdInput.value.trim();
      if (!(await getBoard(gameId))) {
        return;
      }
    }

    renderBoard();
    // console.log(app.gameData);

    // clear and hide form
    numRowsInput.value = "";
    numColsInput.value = "";
    gameIdInput.value = "";
    app.startGameForm.classList.add("hidden");
  }

  async function startGame(numRows, numCols) {
    let data = {
      num_rows: numRows,
      num_cols: numCols,
    };

    try {
      await fetch(`${backend}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((responseData) => {
          app.gameData = responseData;
        })
        .catch((error) => console.error(error));
    } catch (error) {
      alert(error);
      console.error("Unexpected error: ", error);
    }
  }

  async function getBoard(gameId) {
    try {
      const response = await fetch(`${backend}/board?id=${gameId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // console.log("Checking response");
      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = `Error: ${response.status} - ${responseData["error"]}`;
        alert(errorMessage);
        console.error(errorMessage);
        return false;
      }

      app.gameData = responseData;
      return true;
    } catch (error) {
      alert(error);
      console.error("Unexpected error: ", error);
      return false;
    }
  }

  function renderBoard() {
    // console.log("Rendering board");

    let numRows = app.gameData.num_rows;
    let numCols = app.gameData.num_cols;
    let board = app.gameData.board;
    let dug = app.gameData.dug;

    app.boardElement.style.gridTemplateColumns = `repeat(${numCols}, 30px)`;
    app.boardElement.innerHTML = ""; // Clear existing cells

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const cell = document.createElement("div");
        let index = row * numCols + col;

        cell.classList.add("cell");
        if (dug.includes(index)) {
          if (board[index] == -1) {
            cell.classList.add("bomb-cell");
            cell.textContent = "*";
          } else {
            cell.classList.add("dugged-cell");
            if (board[index] != 0) {
              cell.textContent = board[index];
              cell.classList.add("clickable");
              cell.addEventListener("click", handleClick);
            }
          }
        } else {
          if (app.gameData.flags.includes(index)) {
            cell.textContent = "X";
          }
          cell.classList.add("undugged-cell", "clickable");
          cell.addEventListener("click", handleClick);
          cell.addEventListener("contextmenu", handleRightClick);
        }

        cell.dataset.row = row;
        cell.dataset.col = col;

        app.boardElement.appendChild(cell);
      }
    }
    console.log("Finished rendering");
  }

  async function handleClick(e) {
    // console.log(app.gameData);
    const data = {
      id: app.gameData._id,
      row: parseInt(e.target.dataset.row),
      col: parseInt(e.target.dataset.col),
    };
    // console.log(data);

    try {
      await fetch(`${backend}/dig`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((responseData) => {
          app.gameData = responseData;
          renderBoard();
          // don't know why but this makes it so that renderBoard() actually works
          setTimeout(() => checkGameOver(), 200);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      alert(error);
      console.error("Unexpected error: ", error);
    }
  }

  async function handleRightClick(e) {
    e.preventDefault();

    const data = {
      id: app.gameData._id,
      row: parseInt(e.target.dataset.row),
      col: parseInt(e.target.dataset.col),
    };

    try {
      await fetch(`${backend}/flag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((responseData) => {
          app.gameData = responseData;
          renderBoard();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      alert(error);
      console.error("Unexpected error: ", error);
    }
  }

  function checkGameOver() {
    console.log("Checking if game is over");
    if (app.gameData.result == -1) {
      alert("Game over!");
      deleteBoard();
      resetUI();
    } else if (app.gameData.result == 1) {
      alert("Congratulations! You won!");
      deleteBoard();
      resetUI();
    }
  }

  async function deleteBoard() {
    try {
      const response = await fetch(`${backend}/board?id=${app.gameData._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // console.log("Checking response");
      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = `Error: ${response.status} - ${responseData["error"]}`;
        alert(errorMessage);
        console.error(errorMessage);
        return false;
      }

      app.gameData = {};
      return true;
    } catch (error) {
      alert(error);
      console.error("Unexpected error: ", error);
      return false;
    }
  }

  function resetUI() {
    app.startGameForm.classList.remove("hidden");
    app.boardElement.innerHTML = "";
    app.boardElement.style.gridTemplateColumns = "";
  }
})((window.app = window.app || {}));
