"use strict";

(function (app) {
  "use strict";

  app.gameData = {};
  app.boardElement = document.getElementById("minesweeper-board");
  app.startGameForm = document.getElementById("start-game-form");
  var backend = "http://localhost:5000";

  app.startup = function () {
    wireStartGameForm();
  };

  function wireStartGameForm() {
    // console.log("wiring form");
    var startGameForm = document.getElementById("start-game-form");
    startGameForm.onsubmit = submitStartGameForm;
  }

  function submitStartGameForm(e) {
    var numRowsInput, numColsInput, gameIdInput, numRows, numCols, gameId;
    return regeneratorRuntime.async(function submitStartGameForm$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            e.preventDefault();
            numRowsInput = app.startGameForm.querySelector("#num_rows");
            numColsInput = app.startGameForm.querySelector("#num_cols");
            gameIdInput = app.startGameForm.querySelector("#id"); // input checks

            if (!((numRowsInput.value.trim() != "" || numColsInput.value.trim() != "") && gameIdInput.value.trim() != "")) {
              _context.next = 9;
              break;
            }

            alert("Enter # rows and # columns OR game ID only, not both!");
            return _context.abrupt("return");

          case 9:
            if (!(numRowsInput.value.trim() != "" ^ numColsInput.value.trim() != "")) {
              _context.next = 14;
              break;
            }

            alert("Both # rows and # columns must have valid values!");
            return _context.abrupt("return");

          case 14:
            if (!(parseInt(numRowsInput.value.trim()) < 10 || parseInt(numRowsInput.value.trim()) > 50 || parseInt(numColsInput.value.trim()) < 10 || parseInt(numColsInput.value.trim()) > 50)) {
              _context.next = 17;
              break;
            }

            alert("The board must be at least 10x10 and at most 50x50!");
            return _context.abrupt("return");

          case 17:
            if (!(numRowsInput.value.trim() != "" && numColsInput.value.trim() != "")) {
              _context.next = 24;
              break;
            }

            numRows = parseInt(numRowsInput.value.trim());
            numCols = parseInt(numColsInput.value.trim());
            _context.next = 22;
            return regeneratorRuntime.awrap(startGame(numRows, numCols));

          case 22:
            _context.next = 29;
            break;

          case 24:
            gameId = gameIdInput.value.trim();
            _context.next = 27;
            return regeneratorRuntime.awrap(getBoard(gameId));

          case 27:
            if (_context.sent) {
              _context.next = 29;
              break;
            }

            return _context.abrupt("return");

          case 29:
            renderBoard(); // console.log(app.gameData);
            // clear and hide form

            numRowsInput.value = "";
            numColsInput.value = "";
            gameIdInput.value = "";
            app.startGameForm.classList.add("hidden");

          case 34:
          case "end":
            return _context.stop();
        }
      }
    });
  }

  function startGame(numRows, numCols) {
    var data;
    return regeneratorRuntime.async(function startGame$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            data = {
              num_rows: numRows,
              num_cols: numCols
            };
            _context2.prev = 1;
            _context2.next = 4;
            return regeneratorRuntime.awrap(fetch("".concat(backend, "/start"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(data)
            }).then(function (response) {
              return response.json();
            }).then(function (responseData) {
              app.gameData = responseData;
            })["catch"](function (error) {
              return console.error(error);
            }));

          case 4:
            _context2.next = 10;
            break;

          case 6:
            _context2.prev = 6;
            _context2.t0 = _context2["catch"](1);
            alert(_context2.t0);
            console.error("Unexpected error: ", _context2.t0);

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, null, null, [[1, 6]]);
  }

  function getBoard(gameId) {
    var response, responseData, errorMessage;
    return regeneratorRuntime.async(function getBoard$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return regeneratorRuntime.awrap(fetch("".concat(backend, "/board?id=").concat(gameId), {
              method: "GET",
              headers: {
                "Content-Type": "application/json"
              }
            }));

          case 3:
            response = _context3.sent;
            _context3.next = 6;
            return regeneratorRuntime.awrap(response.json());

          case 6:
            responseData = _context3.sent;

            if (response.ok) {
              _context3.next = 12;
              break;
            }

            errorMessage = "Error: ".concat(response.status, " - ").concat(responseData["error"]);
            alert(errorMessage);
            console.error(errorMessage);
            return _context3.abrupt("return", false);

          case 12:
            app.gameData = responseData;
            return _context3.abrupt("return", true);

          case 16:
            _context3.prev = 16;
            _context3.t0 = _context3["catch"](0);
            alert(_context3.t0);
            console.error("Unexpected error: ", _context3.t0);
            return _context3.abrupt("return", false);

          case 21:
          case "end":
            return _context3.stop();
        }
      }
    }, null, null, [[0, 16]]);
  }

  function renderBoard() {
    // console.log("Rendering board");
    var numRows = app.gameData.num_rows;
    var numCols = app.gameData.num_cols;
    var board = app.gameData.board;
    var dug = app.gameData.dug;
    app.boardElement.style.gridTemplateColumns = "repeat(".concat(numCols, ", 30px)");
    app.boardElement.innerHTML = ""; // Clear existing cells

    for (var row = 0; row < numRows; row++) {
      for (var col = 0; col < numCols; col++) {
        var cell = document.createElement("div");
        var index = row * numCols + col;
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

  function handleClick(e) {
    var data;
    return regeneratorRuntime.async(function handleClick$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            // console.log(app.gameData);
            data = {
              id: app.gameData._id,
              row: parseInt(e.target.dataset.row),
              col: parseInt(e.target.dataset.col)
            }; // console.log(data);

            _context4.prev = 1;
            _context4.next = 4;
            return regeneratorRuntime.awrap(fetch("".concat(backend, "/dig"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(data)
            }).then(function (response) {
              return response.json();
            }).then(function (responseData) {
              app.gameData = responseData;
              renderBoard(); // don't know why but this makes it so that renderBoard() actually works

              setTimeout(function () {
                return checkGameOver();
              }, 200);
            })["catch"](function (error) {
              console.error("Error:", error);
            }));

          case 4:
            _context4.next = 10;
            break;

          case 6:
            _context4.prev = 6;
            _context4.t0 = _context4["catch"](1);
            alert(_context4.t0);
            console.error("Unexpected error: ", _context4.t0);

          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, null, null, [[1, 6]]);
  }

  function handleRightClick(e) {
    var data;
    return regeneratorRuntime.async(function handleRightClick$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            e.preventDefault();
            data = {
              id: app.gameData._id,
              row: parseInt(e.target.dataset.row),
              col: parseInt(e.target.dataset.col)
            };
            _context5.prev = 2;
            _context5.next = 5;
            return regeneratorRuntime.awrap(fetch("".concat(backend, "/flag"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(data)
            }).then(function (response) {
              return response.json();
            }).then(function (responseData) {
              app.gameData = responseData;
              renderBoard();
            })["catch"](function (error) {
              console.error("Error:", error);
            }));

          case 5:
            _context5.next = 11;
            break;

          case 7:
            _context5.prev = 7;
            _context5.t0 = _context5["catch"](2);
            alert(_context5.t0);
            console.error("Unexpected error: ", _context5.t0);

          case 11:
          case "end":
            return _context5.stop();
        }
      }
    }, null, null, [[2, 7]]);
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

  function deleteBoard() {
    var response, responseData, errorMessage;
    return regeneratorRuntime.async(function deleteBoard$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _context6.next = 3;
            return regeneratorRuntime.awrap(fetch("".concat(backend, "/board?id=").concat(app.gameData._id), {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json"
              }
            }));

          case 3:
            response = _context6.sent;
            _context6.next = 6;
            return regeneratorRuntime.awrap(response.json());

          case 6:
            responseData = _context6.sent;

            if (response.ok) {
              _context6.next = 12;
              break;
            }

            errorMessage = "Error: ".concat(response.status, " - ").concat(responseData["error"]);
            alert(errorMessage);
            console.error(errorMessage);
            return _context6.abrupt("return", false);

          case 12:
            app.gameData = {};
            return _context6.abrupt("return", true);

          case 16:
            _context6.prev = 16;
            _context6.t0 = _context6["catch"](0);
            alert(_context6.t0);
            console.error("Unexpected error: ", _context6.t0);
            return _context6.abrupt("return", false);

          case 21:
          case "end":
            return _context6.stop();
        }
      }
    }, null, null, [[0, 16]]);
  }

  function resetUI() {
    app.startGameForm.classList.remove("hidden");
    app.boardElement.innerHTML = "";
    app.boardElement.style.gridTemplateColumns = "";
  }
})(window.app = window.app || {});