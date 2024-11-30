function Game() {
    const gameState = {
        player1: null,
        player2: null
    };

    const game = {
        gameState
    };

    game.battleScene = battleScene(game);

    characterSelect(game);

    return game;
}

function characterSelect(game) {
    const selectedCharacters = {
        player1: null,
        player2: null
    };

    const characterCards = document.querySelectorAll('.character-card');
    const startButton = document.querySelector('.start-button');

    function initializeEventListeners() {
        characterCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const playerSection = e.target.closest('.character-select');
                const player = `player${playerSection.dataset.player}`;
                selectCharacter(player, card);
            });
        });

        startButton.addEventListener('click', startGame);
    }

    function selectCharacter(player, card) {
        const playerSection = card.closest('.character-select');
        playerSection.querySelectorAll('.character-card').forEach(c => {
            c.classList.remove('selected');
        });

        card.classList.add('selected');
        selectedCharacters[player] = card.dataset.element;
        startButton.disabled = !(selectedCharacters.player1 && selectedCharacters.player2);
    }

    function startGame() {
        if (selectedCharacters.player1 && selectedCharacters.player2) {
            document.getElementById('character-select').style.display = 'none';
            document.getElementById('battle-scene').style.display = 'block';
            game.battleScene.initialize(selectedCharacters);
        }
    }

    initializeEventListeners();
}

function battleScene(game) {
    const player1Element = document.querySelector('.player1 img');
    const player2Element = document.querySelector('.player2 img');
    const health1Element = document.querySelector('.player1-health .health-bar-fill');
    const health2Element = document.querySelector('.player2-health .health-bar-fill');
    const score1Element = document.querySelector('.player1-score');
    const score2Element = document.querySelector('.player2-score');

    const controls = {
        player1: {
            left: 'a',
            right: 'd',
            attack: 'f',
        },
        player2: {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            attack: '1',
        }
    };

    const pressedKeys = new Set();

    const animationStates = {
        player1: {
            isRunning: false,
            lastRunFrame: Date.now(),
            runFrameCooldown: 150
        },
        player2: {
            isRunning: false,
            lastRunFrame: Date.now(),
            runFrameCooldown: 150
        }
    };

    const damageConfig = {
        normalAttack: {
            base: 8,       
            variance: 4,   
            range: 120  
        }
    };

    const attackStates = {
        player1: {
            isAttacking: false,
            attackTimer: null
        },
        player2: {
            isAttacking: false,
            attackTimer: null
        }
    };

    const animationPriority = {
        player1: {
            currentAnimation: 'stand',
            priority: 0
        },
        player2: {
            currentAnimation: 'stand',
            priority: 0
        }
    };

    const PRIORITY_LEVELS = {
        stand: 0,
        run: 1,
        attack: 2
    };

    const runAnimationState = {
        player1: {
            currentFrame: 1,
            lastFrameTime: 0,
            frameDuration: 150
        },
        player2: {
            currentFrame: 1,
            lastFrameTime: 0,
            frameDuration: 150
        }
    };

    const cooldowns = {
        player1: {
            attack: { duration: 500, lastUsed: 0 }
        },
        player2: {
            attack: { duration: 500, lastUsed: 0 }
        }
    };

    function initialize(characters) {
        game.gameState.player1 = {
            character: characters.player1,
            health: 100,
            score: 0,
            position: { x: 100 },
            state: 'stand',
            facingRight: true
        };

        game.gameState.player2 = {
            character: characters.player2,
            health: 100,
            score: 0,
            position: { x: 700 },
            state: 'stand',
            facingRight: false
        };

        player1Element.src = `resources/${characters.player1}/stand.png`;
        player2Element.src = `resources/${characters.player2}/stand.png`;

        initializeControls();
        startGameLoop();
    }

    function initializeControls() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            pressedKeys.add(key);

            if (key === controls.player1.attack && !attackStates.player1.isAttacking) {
                executeAttack('player1');
            } else if (key === controls.player2.attack && !attackStates.player2.isAttacking) {
                executeAttack('player2');
            }
        });
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            pressedKeys.delete(key);
        });
    }

    function isOnCooldown(player, action) {
        const cooldown = cooldowns[player][action];
        const now = Date.now();
        return now - cooldown.lastUsed < cooldown.duration;
    }

    function startCooldown(player, action) {
        const cooldown = cooldowns[player][action];
        cooldown.lastUsed = Date.now();
    }

    function executeAttack(player) {
        if (isOnCooldown(player, 'attack') || attackStates[player].isAttacking) {
            return;
        }
        attackStates[player].isAttacking = true;
        setPlayerAnimation(player, 'attack', 500);
        calculateAndApplyDamage(player);
        startCooldown(player, 'attack');

        setTimeout(() => {
            attackStates[player].isAttacking = false;
            resetAnimation(player);
        }, 500);
    }

    function calculateAndApplyDamage(player) {
        const state = game.gameState[player];
        const targetPlayer = player === 'player1' ? 'player2' : 'player1';
        const targetState = game.gameState[targetPlayer];
        const distance = Math.abs(state.position.x - targetState.position.x);

        if (distance <= damageConfig.normalAttack.range) {
            const baseDamage = damageConfig.normalAttack.base;
            const variance = damageConfig.normalAttack.variance;
            const damage = baseDamage + (Math.random() * variance * 2 - variance);
            const finalDamage = Math.round(damage);

            targetState.health = Math.max(0, targetState.health - finalDamage);
            state.score += finalDamage;

            showDamageNumber(finalDamage, targetPlayer);
        }
    }

    function setPlayerAnimation(player, animationType, duration = 0) {
        const state = game.gameState[player];
        const animState = animationPriority[player];
        const newPriority = PRIORITY_LEVELS[animationType];
        const playerElement = document.querySelector(`.${player} img`);
        if (newPriority >= animState.priority) {
            if (animationType === 'run') {
                handleRunAnimation(player, state);
            } else {
                playerElement.src = `resources/${state.character}/${animationType}.png`;
            }

            animState.currentAnimation = animationType;
            animState.priority = newPriority;

            if (duration > 0) {
                setTimeout(() => {
                    if (animState.currentAnimation === animationType) {
                        resetAnimation(player);
                    }
                }, duration);
            }
        }
    }

    function handleRunAnimation(player, state) {
        const now = Date.now();
        const runState = runAnimationState[player];
        const playerElement = document.querySelector(`.${player} img`);

        if (now - runState.lastFrameTime >= runState.frameDuration) {
            runState.currentFrame = runState.currentFrame === 1 ? 2 : 1;
            playerElement.src = `resources/${state.character}/run${runState.currentFrame}.png`;
            runState.lastFrameTime = now;
        } else if (animationPriority[player].currentAnimation !== 'run') {
            runState.currentFrame = 1;
            playerElement.src = `resources/${state.character}/run1.png`;
            runState.lastFrameTime = now;
        }
    }

    function resetAnimation(player) {
        const animState = animationPriority[player];
        animState.currentAnimation = 'stand';
        animState.priority = PRIORITY_LEVELS.stand;
        const state = game.gameState[player];
        const playerElement = document.querySelector(`.${player} img`);
        playerElement.src = `resources/${state.character}/stand.png`;
    }

    function handleMovement(deltaTime) {
        const speed = 0.5; 
        const state1 = game.gameState.player1;
        const state2 = game.gameState.player2;
        //1
        if (pressedKeys.has(controls.player1.left)) {
            state1.position.x = Math.max(0, state1.position.x - speed * deltaTime);
            state1.facingRight = false;
            document.querySelector('.player1').style.transform = 'scaleX(-1)';
            if (animationPriority.player1.priority === 0) {
                setPlayerAnimation('player1', 'run');
            }
        } else if (pressedKeys.has(controls.player1.right)) {
            state1.position.x = Math.min(1100, state1.position.x + speed * deltaTime);
            state1.facingRight = true;
            document.querySelector('.player1').style.transform = 'scaleX(1)';
            if (animationPriority.player1.priority === 0) {
                setPlayerAnimation('player1', 'run');
            }
        } else if (animationPriority.player1.currentAnimation === 'run') {
            resetAnimation('player1');
        }
        //2
        if (pressedKeys.has(controls.player2.left.toLowerCase())) {
            state2.position.x = Math.max(0, state2.position.x - speed * deltaTime);
            state2.facingRight = false;
            document.querySelector('.player2').style.transform = 'scaleX(-1)';
            if (animationPriority.player2.priority === 0) {
                setPlayerAnimation('player2', 'run');
            }
        } else if (pressedKeys.has(controls.player2.right.toLowerCase())) {
            state2.position.x = Math.min(1100, state2.position.x + speed * deltaTime);
            state2.facingRight = true;
            document.querySelector('.player2').style.transform = 'scaleX(1)';
            if (animationPriority.player2.priority === 0) {
                setPlayerAnimation('player2', 'run');
            }
        } else if (animationPriority.player2.currentAnimation === 'run') {
            resetAnimation('player2');
        }

        document.querySelector('.player1').style.left = `${state1.position.x}px`;
        document.querySelector('.player2').style.left = `${state2.position.x}px`;
    }

    function update(deltaTime) {
        handleMovement(deltaTime);
        updateRunningAnimations();
        updateUI();
    }
    
    function startGameLoop() {
        let lastTime = 0;
        function gameLoop(timestamp) {
            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;
            update(deltaTime);
            requestAnimationFrame(gameLoop);
        }
        requestAnimationFrame(gameLoop);
    }

    function updateRunningAnimations() {
        ['player1', 'player2'].forEach(player => {
            if (animationPriority[player].currentAnimation === 'run') {
                const state = game.gameState[player];
                handleRunAnimation(player, state);
            }
        });
    }

    function showDamageNumber(damage, targetPlayer) {
        const damageElement = document.createElement('div');
        damageElement.className = 'damage-number';
        damageElement.textContent = `-${damage}`;
        const targetElement = document.querySelector(`.${targetPlayer}`);
        const rect = targetElement.getBoundingClientRect();
        damageElement.style.position = 'absolute';
        damageElement.style.left = `${rect.left + rect.width / 2}px`;
        damageElement.style.top = `${rect.top}px`;
        damageElement.style.color = '#ff0000';
        damageElement.style.fontSize = '24px';
        damageElement.style.fontWeight = 'bold';
        damageElement.style.textShadow = '2px 2px 2px rgba(0,0,0,0.5)';
        damageElement.style.zIndex = '1000';
        damageElement.style.animation = 'damageFloat 1s ease-out';
        document.body.appendChild(damageElement);

        setTimeout(() => {
            damageElement.remove();
        }, 1000);
    }

    function updateUI() {
        health1Element.style.width = `${game.gameState.player1.health}%`;
        health2Element.style.width = `${game.gameState.player2.health}%`;

        score1Element.textContent = game.gameState.player1.score;
        score2Element.textContent = game.gameState.player2.score;

        if (game.gameState.player1.health <= 0 || game.gameState.player2.health <= 0) {
            endGame();
        }
    }

    function endGame() {
        const winner = game.gameState.player1.health <= 0 ? 'player2' : 'player1';
        alert(`Game Over！${winner} win！`);
        window.location.href = 'index.html';
    }
    return {
        initialize
    };
}

window.addEventListener('DOMContentLoaded', () => {
    const game = Game();
});