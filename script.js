class Game {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.scoreElement = document.getElementById('score');
        this.score = 0;
        this.isGameOver = false;
        this.pellets = [];
        this.ghosts = [];
        this.setupGame();
    }

    setupGame() {
        // Create Pac-Man
        this.pacman = {
            element: document.createElement('div'),
            x: 20,
            y: 20,
            speed: 2.5,
            direction: 'right'
        };

        this.pacman.element.className = 'pacman';
        this.gameArea.appendChild(this.pacman.element);
        this.updatePacmanPosition();

        // Create pellets in a grid pattern
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if ((i + j) % 2 === 0) { // Create a checker pattern
                    this.createPellet(40 + i * 35, 40 + j * 35);
                }
            }
        }

        // Create ghosts
        const ghostColors = ['red', 'pink', 'cyan', 'orange'];
        ghostColors.forEach((color, index) => {
            this.createGhost(color, 300 + (index * 30), 300);
        });

        // Start game loop
        this.gameLoop();
        
        // Add keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    createPellet(x, y) {
        const pellet = {
            element: document.createElement('div'),
            x: x,
            y: y
        };
        pellet.element.className = 'pellet';
        pellet.element.style.left = pellet.x + 'px';
        pellet.element.style.top = pellet.y + 'px';
        this.gameArea.appendChild(pellet.element);
        this.pellets.push(pellet);
    }

    createGhost(color, x, y) {
        const ghost = {
            element: document.createElement('div'),
            x: x,
            y: y,
            speed: 1.5,
            color: color,
            direction: 'random',
            lastDirectionChange: 0
        };
        ghost.element.className = 'ghost';
        ghost.element.style.backgroundColor = color;
        this.gameArea.appendChild(ghost.element);
        this.ghosts.push(ghost);
    }

    updatePacmanPosition() {
        this.pacman.element.style.left = this.pacman.x + 'px';
        this.pacman.element.style.top = this.pacman.y + 'px';
        
        // Update Pac-Man's rotation based on direction
        this.pacman.element.style.transform = `rotate(${
            this.pacman.direction === 'right' ? 0 :
            this.pacman.direction === 'down' ? 90 :
            this.pacman.direction === 'left' ? 180 :
            this.pacman.direction === 'up' ? 270 : 0
        }deg)`;
    }

    handleKeyPress(e) {
        if (this.isGameOver) return;

        switch(e.key) {
            case 'ArrowUp':
                this.pacman.direction = 'up';
                break;
            case 'ArrowDown':
                this.pacman.direction = 'down';
                break;
            case 'ArrowLeft':
                this.pacman.direction = 'left';
                break;
            case 'ArrowRight':
                this.pacman.direction = 'right';
                break;
        }
    }

    moveGhosts() {
        this.ghosts.forEach(ghost => {
            const now = Date.now();
            if (now - ghost.lastDirectionChange > 1000) { // Change direction every second
                ghost.direction = Math.random() < 0.7 ? this.getDirectionTowardsPacman(ghost) : this.getRandomDirection();
                ghost.lastDirectionChange = now;
            }

            // Move ghost based on its direction
            switch(ghost.direction) {
                case 'up':
                    ghost.y = Math.max(0, ghost.y - ghost.speed);
                    break;
                case 'down':
                    ghost.y = Math.min(380, ghost.y + ghost.speed);
                    break;
                case 'left':
                    ghost.x = Math.max(0, ghost.x - ghost.speed);
                    break;
                case 'right':
                    ghost.x = Math.min(380, ghost.x + ghost.speed);
                    break;
            }

            ghost.element.style.left = ghost.x + 'px';
            ghost.element.style.top = ghost.y + 'px';
        });
    }

    getDirectionTowardsPacman(ghost) {
        const dx = this.pacman.x - ghost.x;
        const dy = this.pacman.y - ghost.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'down' : 'up';
        }
    }

    getRandomDirection() {
        const directions = ['up', 'down', 'left', 'right'];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    checkCollisions() {
        // Check pellet collisions
        this.pellets.forEach((pellet, index) => {
            if (this.checkCollision(this.pacman, pellet)) {
                this.gameArea.removeChild(pellet.element);
                this.pellets.splice(index, 1);
                this.score += 10;
                this.updateScore();
                
                if (this.pellets.length === 0) {
                    this.gameOver(true);
                }
            }
        });

        // Check ghost collisions
        this.ghosts.forEach(ghost => {
            if (this.checkCollision(this.pacman, ghost)) {
                this.gameOver(false);
            }
        });
    }

    checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 20;
    }

    updateScore() {
        this.scoreElement.textContent = `Score: ${this.score}`;
    }

    gameOver(won) {
        this.isGameOver = true;
        const message = won ? 'Congratulations! You Won!' : 'Game Over!';
        setTimeout(() => {
            alert(`${message}\nFinal Score: ${this.score}\nPress OK to play again`);
            window.location.reload();
        }, 100);
    }

    gameLoop() {
        if (this.isGameOver) return;

        // Move Pac-Man
        switch(this.pacman.direction) {
            case 'up':
                this.pacman.y = Math.max(0, this.pacman.y - this.pacman.speed);
                break;
            case 'down':
                this.pacman.y = Math.min(380, this.pacman.y + this.pacman.speed);
                break;
            case 'left':
                this.pacman.x = Math.max(0, this.pacman.x - this.pacman.speed);
                break;
            case 'right':
                this.pacman.x = Math.min(380, this.pacman.x + this.pacman.speed);
                break;
        }

        this.updatePacmanPosition();
        this.moveGhosts();
        this.checkCollisions();

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
};
