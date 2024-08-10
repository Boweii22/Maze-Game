const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const tileSize = 50;
let maze;
let player;
let keyImg;
let homeImg;

canvas.width = 500;
canvas.height = 500;

function makeMaze() {
    const difficulty = document.getElementById("difficulty").value;
    let rows, cols;

    switch (difficulty) {
        case "easy":
            rows = cols = 5;
            break;
        case "medium":
            rows = cols = 10;
            break;
        case "hard":
            rows = cols = 20;
            break;
        default:
            rows = cols = 10;
    }

    maze = new Maze(rows, cols);
    maze.generateMaze();
    player = new Player(maze.startCell);

    keyImg = new Image();
    homeImg = new Image();

    keyImg.src = "key.png";
    homeImg.src = "home.png";

    keyImg.onload = () => drawMaze();
    homeImg.onload = () => drawMaze();

    canvas.width = cols * tileSize;
    canvas.height = rows * tileSize;
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    maze.cells.forEach(row => {
        row.forEach(cell => {
            cell.draw();
        });
    });
    player.draw();
}

class Maze {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.cells = [];
        this.startCell = null;
        this.endCell = null;

        for (let i = 0; i < rows; i++) {
            this.cells[i] = [];
            for (let j = 0; j < cols; j++) {
                this.cells[i][j] = new Cell(i, j);
            }
        }
    }

    generateMaze() {
        const stack = [];
        const startCell = this.cells[0][0];
        startCell.visited = true;
        stack.push(startCell);

        while (stack.length > 0) {
            const current = stack.pop();
            const next = current.checkNeighbors(this.cells);

            if (next) {
                stack.push(current);
                current.removeWalls(next);
                next.visited = true;
                stack.push(next);
            }
        }

        this.startCell = this.cells[0][0];
        this.endCell = this.cells[this.rows - 1][this.cols - 1];
    }
}

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.visited = false;
        this.walls = { top: true, right: true, bottom: true, left: true };
    }

    checkNeighbors(cells) {
        const neighbors = [];

        const top = cells[this.row - 1] && cells[this.row - 1][this.col];
        const right = cells[this.row] && cells[this.row][this.col + 1];
        const bottom = cells[this.row + 1] && cells[this.row + 1][this.col];
        const left = cells[this.row] && cells[this.row][this.col - 1];

        if (top && !top.visited) neighbors.push(top);
        if (right && !right.visited) neighbors.push(right);
        if (bottom && !bottom.visited) neighbors.push(bottom);
        if (left && !left.visited) neighbors.push(left);

        if (neighbors.length > 0) {
            const r = Math.floor(Math.random() * neighbors.length);
            return neighbors[r];
        }

        return undefined;
    }

    removeWalls(next) {
        const x = this.col - next.col;
        const y = this.row - next.row;

        if (x === 1) {
            this.walls.left = false;
            next.walls.right = false;
        } else if (x === -1) {
            this.walls.right = false;
            next.walls.left = false;
        }

        if (y === 1) {
            this.walls.top = false;
            next.walls.bottom = false;
        } else if (y === -1) {
            this.walls.bottom = false;
            next.walls.top = false;
        }
    }

    draw() {
        const x = this.col * tileSize;
        const y = this.row * tileSize;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        if (this.walls.top) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + tileSize, y);
            ctx.stroke();
        }
        if (this.walls.right) {
            ctx.beginPath();
            ctx.moveTo(x + tileSize, y);
            ctx.lineTo(x + tileSize, y + tileSize);
            ctx.stroke();
        }
        if (this.walls.bottom) {
            ctx.beginPath();
            ctx.moveTo(x, y + tileSize);
            ctx.lineTo(x + tileSize, y + tileSize);
            ctx.stroke();
        }
        if (this.walls.left) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + tileSize);
            ctx.stroke();
        }

        if (this === maze.startCell) {
            ctx.drawImage(keyImg, x + 10, y + 10, 30, 30);
        }

        if (this === maze.endCell) {
            ctx.drawImage(homeImg, x + 10, y + 10, 30, 30);
        }
    }
}

class Player {
    constructor(cell) {
        this.cell = cell;
        window.addEventListener("keydown", this.move.bind(this));
    }

    draw() {
        const x = this.cell.col * tileSize + 10;
        const y = this.cell.row * tileSize + 10;

        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(x + 15, y + 15, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    move(e) {
        let nextCell;
        switch (e.key) {
            case "ArrowUp":
                if (!this.cell.walls.top) nextCell = maze.cells[this.cell.row - 1][this.cell.col];
                break;
            case "ArrowRight":
                if (!this.cell.walls.right) nextCell = maze.cells[this.cell.row][this.cell.col + 1];
                break;
            case "ArrowDown":
                if (!this.cell.walls.bottom) nextCell = maze.cells[this.cell.row + 1][this.cell.col];
                break;
            case "ArrowLeft":
                if (!this.cell.walls.left) nextCell = maze.cells[this.cell.row][this.cell.col - 1];
                break;
        }

        if (nextCell) {
            this.cell = nextCell;
            drawMaze();

            if (this.cell === maze.endCell) {
                setTimeout(() => {
                    alert("Congratulations! You've reached the house!");
                    makeMaze();
                }, 100);
            }
        }
    }
}

// Theme toggle function
function toggleTheme() {
    const body = document.body;
    const themeSwitch = document.getElementById("themeSwitch");

    if (themeSwitch.checked) {
        body.classList.remove("light-theme");
        body.classList.add("dark-theme");
    } else {
        body.classList.remove("dark-theme");
        body.classList.add("light-theme");
    }
}
