document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const restartButton = document.getElementById('restart');
    const currentPlayerDisplay = document.getElementById('current-player');
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    const closeModalButton = document.getElementById('close-modal');
    const modeSelect = document.getElementById('mode-select');
    const difficultySelect = document.getElementById('difficulty-select');
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameMode = 'pvp';
    let difficulty = 'easy';
    const winningPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    restartButton.addEventListener('click', restartGame);
    closeModalButton.addEventListener('click', closeModal);
    modeSelect.addEventListener('change', (event) => {
        gameMode = event.target.value;
        difficultySelect.style.display = gameMode === 'pvb' ? 'block' : 'none';
        restartGame();
    });
    difficultySelect.addEventListener('change', (event) => {
        difficulty = event.target.value;
        restartGame();
    });

    function handleCellClick(event) {
        const cell = event.target;
        const cellIndex = cell.getAttribute('data-index');

        if (gameState[cellIndex] !== '' || checkWinner(gameState, currentPlayer)) {
            return;
        }

        gameState[cellIndex] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());

        if (checkWinner(gameState, currentPlayer)) {
            showModal(`${currentPlayer} wins!`);
            highlightWinningCells();
        } else if (gameState.every(cell => cell !== '')) {
            showModal('Draw!');
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            currentPlayerDisplay.textContent = currentPlayer;

            if (gameMode === 'pvb' && currentPlayer === 'O') {
                botMove(); // No timeout for immediate response
            }
        }
    }

    function botMove() {
        setTimeout(() => {
            let move;
            if (difficulty === 'easy') {
                move = getRandomMove();
            } else if (difficulty === 'medium') {
                move = minimax(gameState, 'O', 4, -Infinity, Infinity).index; // Depth 4 for medium
            } else { // 'hard' level
                move = minimax(gameState, 'O', 8, -Infinity, Infinity).index; // Depth 8 for hard
            }

            gameState[move] = 'O';
            const cell = document.querySelector(`.cell[data-index='${move}']`);
            cell.textContent = 'O';
            cell.classList.add('o');

            if (checkWinner(gameState, 'O')) {
                showModal('O wins!');
                highlightWinningCells();
            } else if (gameState.every(cell => cell !== '')) {
                showModal('Draw!');
            } else {
                currentPlayer = 'X';
                currentPlayerDisplay.textContent = currentPlayer;
            }
        }, 500); // Add delay for better UX
    }

    function getRandomMove() {
        const availableMoves = gameState
            .map((cell, index) => (cell === '' ? index : null))
            .filter(index => index !== null);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    function checkWinner(gameState, player) {
        return winningPatterns.some(pattern => {
            return pattern.every(index => gameState[index] === player);
        });
    }

    function highlightWinningCells() {
        winningPatterns.forEach(pattern => {
            if (pattern.every(index => gameState[index] === currentPlayer)) {
                pattern.forEach(index => {
                    cells[index].style.backgroundColor = '#d4edda';
                });
            }
        });
    }

    function restartGame() {
        gameState = ['', '', '', '', '', '', '', '', ''];
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
            cell.style.backgroundColor = '';
        });
        currentPlayer = 'X';
        currentPlayerDisplay.textContent = currentPlayer;
        closeModal();
    }

    function showModal(message) {
        modalMessage.textContent = message;
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    function minimax(newGameState, player, depth, alpha, beta) {
        const availableMoves = newGameState
            .map((cell, index) => (cell === '' ? index : null))
            .filter(index => index !== null);

        if (checkWinner(newGameState, 'X')) {
            return { score: -10 };
        } else if (checkWinner(newGameState, 'O')) {
            return { score: 10 };
        } else if (availableMoves.length === 0 || depth === 0) {
            return { score: 0 };
        }

        const moves = [];

        availableMoves.forEach(move => {
            const newGameStateCopy = newGameState.slice();
            newGameStateCopy[move] = player;

            const result =
                player === 'O'
                    ? minimax(newGameStateCopy, 'X', depth - 1, alpha, beta)
                    : minimax(newGameStateCopy, 'O', depth - 1, alpha, beta);
            moves.push({
                index: move,
                score: result.score
            });

            if (player === 'O') {
                alpha = Math.max(alpha, result.score);
                if (beta <= alpha) return result; // Prune
            } else {
                beta = Math.min(beta, result.score);
                if (beta <= alpha) return result; // Prune
            }
        });

        let bestMove;
        if (player === 'O') {
            let bestScore = -Infinity;
            moves.forEach(move => {
                if (move.score > bestScore) {
                    bestScore = move.score;
                    bestMove = move;
                }
            });
        } else {
            let bestScore = Infinity;
            moves.forEach(move => {
                if (move.score < bestScore) {
                    bestScore = move.score;
                    bestMove = move;
                }
            });
        }
        return bestMove;
    }
});
