
const cells = [...document.querySelectorAll(".cell")];
const statusText = document.getElementById("status");
const scoreXText = document.getElementById("scoreX");
const scoreOText = document.getElementById("scoreO");
const boxX = document.getElementById("boxX");
const boxO = document.getElementById("boxO");
const modeSelect = document.getElementById("mode");

const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

let board = Array(9).fill("");
let player = "X";
let active = true;
let scores = { X: 0, O: 0 };
let history = [];
let aiTimer = null;

function showStatus(message) {
    statusText.innerHTML = message;
}

function updateTurn() {
    boxX.classList.toggle("active", player === "X" && active);
    boxO.classList.toggle("active", player === "O" && active);

    if (active) {
        const color = player === "X" ? "blue" : "pink";
        showStatus(
            `<span style="color:var(--${color})">Player ${player}</span>'s turn`
        );
    }
}

function getWinner(b = board) {
    for (const line of wins) {
        const [a, c, d] = line;

        if (b[a] && b[a] === b[c] && b[a] === b[d]) {
            return { player: b[a], line };
        }
    }

    return null;
}

function place(index, mark) {
    history.push({ index, mark });
    board[index] = mark;

    cells[index].textContent = mark;
    cells[index].classList.add(mark.toLowerCase());
    cells[index].disabled = true;
}

function makeMove(index) {
    if (!active || board[index]) return;
    if (modeSelect.value === "ai" && player === "O") return;

    place(index, player);

    if (finishCheck()) return;

    player = player === "X" ? "O" : "X";
    updateTurn();

    if (modeSelect.value === "ai" && player === "O") {
        cells.forEach(c => c.disabled = true);
        aiTimer = setTimeout(computerMove, 450);
    }
}

function finishCheck() {
    const result = getWinner();

    if (result) {
        active = false;

        result.line.forEach(i => {
            cells[i].classList.add("win");
        });

        scores[result.player]++;
        scoreXText.textContent = scores.X;
        scoreOText.textContent = scores.O;

        const color = result.player === "X" ? "blue" : "pink";

        showStatus(
            `🏆 <span style="color:var(--${color})">Player ${result.player} wins!</span>`
        );

        celebrate();
        cells.forEach(c => c.disabled = true);
        boxX.classList.remove("active");
        boxO.classList.remove("active");

        return true;
    }

    if (board.every(Boolean)) {
        active = false;
        showStatus("🤝 It's a draw! Great game!");
        cells.forEach(c => c.disabled = true);
        return true;
    }

    return false;
}

function computerMove() {
    if (!active || modeSelect.value !== "ai") return;

    const best = findBestMove();

    if (best !== -1) {
        place(best, "O");
    }

    if (finishCheck()) return;

    player = "X";
    cells.forEach(c => c.disabled = false);
    updateTurn();
}

function findBestMove() {
    // Win if possible
    for (let i = 0; i < 9; i++) {
        if (!board[i]) {
            board[i] = "O";
            const win = getWinner();
            board[i] = "";

            if (win) return i;
        }
    }

    // Block the player's winning move
    for (let i = 0; i < 9; i++) {
        if (!board[i]) {
            board[i] = "X";
            const win = getWinner();
            board[i] = "";

            if (win) return i;
        }
    }

    // Take center
    if (!board[4]) return 4;

    // Take a corner
    const corners = [0, 2, 6, 8].filter(i => !board[i]);

    if (corners.length) {
        return corners[
            Math.floor(Math.random() * corners.length)
        ];
    }

    const empty = board
        .map((value, i) => value ? -1 : i)
        .filter(i => i !== -1);

    return empty.length
        ? empty[Math.floor(Math.random() * empty.length)]
        : -1;
}

function restartGame() {
    clearTimeout(aiTimer);

    board = Array(9).fill("");
    player = "X";
    active = true;
    history = [];

    cells.forEach(cell => {
        cell.textContent = "";
        cell.disabled = false;
        cell.classList.remove("x", "o", "win");
    });

    updateTurn();
}

function undoMove() {
    clearTimeout(aiTimer);

    if (!history.length) return;

    let count =
        modeSelect.value === "ai" && history.length >= 2 ? 2 : 1;

    while (count-- > 0 && history.length) {
        const last = history.pop();

        board[last.index] = "";
        cells[last.index].textContent = "";
        cells[last.index].classList.remove("x", "o", "win");
    }

    active = true;
    player = "X";

    cells.forEach(c => c.disabled = false);
    updateTurn();
}

function celebrate() {
    const effects = document.getElementById("effects");
    const symbols = ["✦", "★", "♥", "●", "✧"];

    for (let i = 0; i < 65; i++) {
        const p = document.createElement("span");

        p.className = "particle";
        p.textContent =
            symbols[Math.floor(Math.random() * symbols.length)];

        p.style.left = Math.random() * 100 + "vw";

        p.style.color = [
            "#27c5ff",
            "#ff4fc8",
            "#ffe66d",
            "#6bffb8"
        ][i % 4];

        p.style.fontSize = (12 + Math.random() * 16) + "px";
        p.style.animationDuration = (1.8 + Math.random() * 2.5) + "s";
        p.style.animationDelay = Math.random() * 0.8 + "s";

        effects.appendChild(p);

        setTimeout(() => p.remove(), 5000);
    }
}

cells.forEach(cell => {
    cell.addEventListener("click", () => {
        makeMove(Number(cell.dataset.i));
    });
});

document.getElementById("restart").addEventListener("click", restartGame);

document.getElementById("undo").addEventListener("click", undoMove);

document.getElementById("reset").addEventListener("click", () => {
    scores = { X: 0, O: 0 };

    scoreXText.textContent = "0";
    scoreOText.textContent = "0";

    restartGame();
});

document.getElementById("theme").addEventListener("click", () => {
    document.body.classList.toggle("light");

    document.getElementById("theme").textContent =
        document.body.classList.contains("light") ? "☀" : "☾";
});

modeSelect.addEventListener("change", () => {
    document.getElementById("playerOLabel").textContent =
        modeSelect.value === "ai" ? "COMPUTER" : "PLAYER TWO";

    restartGame();
});

updateTurn();
