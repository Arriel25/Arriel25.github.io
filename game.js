// 全局游戏状态
const gameState = {
    player1: null,
    player2: null,
};

// 冷却时间配置
const cooldownsConfig = {
    player1: {
        jump: { duration: 1000, lastUsed: 0 },
        attack: { duration: 500, lastUsed: 0 },
    },
    player2: {
        jump: { duration: 1000, lastUsed: 0 },
        attack: { duration: 500, lastUsed: 0 },
    },
};

// 初始化角色选择界面
function initializeCharacterSelect(startGameCallback) {
    const characterCards = document.querySelectorAll('.character-card');
    const startButton = document.querySelector('.start-button');
    const selectedCharacters = {
        player1: null,
        player2: null,
    };

    // 选择角色
    function selectCharacter(player, card) {
        const playerSection = card.closest('.character-select');
        playerSection.querySelectorAll('.character-card').forEach(c => {
            c.classList.remove('selected');
        });

        card.classList.add('selected');
        selectedCharacters[player] = card.dataset.element;

        // 检查是否所有玩家都已选择角色
        startButton.disabled = !(selectedCharacters.player1 && selectedCharacters.player2);
    }

    // 开始游戏
    function startGame() {
        if (selectedCharacters.player1 && selectedCharacters.player2) {
            document.getElementById('character-select').style.display = 'none';
            document.getElementById('battle-scene').style.display = 'block';
            startGameCallback(selectedCharacters);
        }
    }

    // 添加角色卡片点击事件监听器
    characterCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const playerSection = e.target.closest('.character-select');
            const player = `player${playerSection.dataset.player}`;
            selectCharacter(player, card);
        });
    });

    // 添加开始按钮点击事件监听器
    startButton.addEventListener('click', startGame);
}

// 初始化战斗场景
function initializeBattleScene(characters) {
    // 初始化玩家状态
    gameState.player1 = {
        character: characters.player1,
        health: 100,
        score: 0,
        position: { x: 100, y: 0 },
        state: 'stand',
        facingRight: true,
    };

    gameState.player2 = {
        character: characters.player2,
        health: 100,
        score: 0,
        position: { x: 700, y: 0 },
        state: 'stand',
        facingRight: false,
    };

    // 设置玩家图片
    const player1Element = document.querySelector('.player1 img');
    const player2Element = document.querySelector('.player2 img');

    player1Element.src = `resources/${characters.player1}/stand.png`;
    player2Element.src = `resources/${characters.player2}/stand.png`;

    // 定义控制键
    const controls = {
        player1: {
            up: 'w',
            left: 'a',
            right: 'd',
            attack: 'f',
        },
        player2: {
            up: 'ArrowUp',
            left: 'ArrowLeft',
            right: 'ArrowRight',
            attack: '1',
        },
    };

    // 记录按下的键
    const pressedKeys = new Set();

    const jumpForce = 18;
    const gravity = 3.5;

    const isJumping = {
        player1: false,
        player2: false,
    };

    const jumpVelocity = {
        player1: 0,
        player2: 0,
    };

    // 动画状态
    const animationPriority = {
        player1: {
            currentAnimation: 'stand',
            priority: 0,
        },
        player2: {
            currentAnimation: 'stand',
            priority: 0,
        },
    };

    const PRIORITY_LEVELS = {
        stand: 0,
        run: 1,
        prepare: 2,
        attack: 2,
    };

    const runAnimationState = {
        player1: {
            currentFrame: 1,
            lastFrameTime: 0,
            frameDuration: 150,
        },
        player2: {
            currentFrame: 1,
            lastFrameTime: 0,
            frameDuration: 150,
        },
    };

    // 伤害配置
    const damageConfig = {
        normalAttack: {
            base: 8,
            variance: 4,
            range: 120,
        },
    };

    // 检查是否在冷却中
    function isOnCooldown(player, action) {
        const cooldown = cooldownsConfig[player][action];
        const now = Date.now();
        return now - cooldown.lastUsed < cooldown.duration;
    }

    // 开始冷却
    function startCooldown(player, action) {
        const cooldown = cooldownsConfig[player][action];
        cooldown.lastUsed = Date.now();
    }

    // 显示伤害数字
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

    // 计算并应用伤害
    function calculateAndApplyDamage(player) {
        const state = gameState[player];
        const targetPlayer = player === 'player1' ? 'player2' : 'player1';
        const targetState = gameState[targetPlayer];

        const distance = Math.abs(state.position.x - targetState.position.x);
        if (distance <= damageConfig.normalAttack.range) {
            const baseDamage = damageConfig.normalAttack.base;
            const variance = damageConfig.normalAttack.variance;
            const damage = baseDamage + (Math.random() * variance * 2 - variance);
            const finalDamage = Math.round(damage);

            targetState.health = Math.max(0, targetState.health - finalDamage);
            console.log('finalDamage', finalDamage);
            state.score += finalDamage;

            showDamageNumber(finalDamage, targetPlayer);
        }
    }

    // 设置玩家动画
    function setPlayerAnimation(player, animationType, duration = 0) {
        const state = gameState[player];
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

            if (animationType !== 'run' && duration > 0) {
                setTimeout(() => {
                    if (animState.currentAnimation === animationType) {
                        resetAnimation(player);
                    }
                }, duration);
            }
        }
    }

    // 处理奔跑动画
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

    // 重置动画到站立状态
    function resetAnimation(player) {
        const animState = animationPriority[player];
        animState.currentAnimation = 'stand';
        animState.priority = PRIORITY_LEVELS.stand;

        const state = gameState[player];
        const playerElement = document.querySelector(`.${player} img`);
        playerElement.src = `resources/${state.character}/stand.png`;
    }

    // 执行攻击
    function executeAttack(player) {
        if (isOnCooldown(player, 'attack')) return;

        setPlayerAnimation(player, 'attack', 500);
        calculateAndApplyDamage(player);
        startCooldown(player, 'attack');

        setTimeout(() => {
            resetAnimation(player);
        }, 500);
    }

    // 准备攻击
    function startPrepareAttack(player) {
        if (isOnCooldown(player, 'attack')) return;

        setPlayerAnimation(player, 'prepare', 500);
    }

    // 开始跳跃
    function startJump(player) {
        if (isJumping[player] || isOnCooldown(player, 'jump')) return;

        isJumping[player] = true;
        jumpVelocity[player] = jumpForce;
        startCooldown(player, 'jump');
    }

    // 处理跳跃
    function handleJumping(player, deltaTime) {
        const playerElement = document.querySelector(`.${player}`);
        const state = gameState[player];

        if (isJumping[player]) {
            jumpVelocity[player] -= gravity * 0.1;
            state.position.y += jumpVelocity[player];

            if (state.position.y <= 0) {
                state.position.y = 0;
                isJumping[player] = false;
                jumpVelocity[player] = 0;
            }

            playerElement.style.bottom = `${100 + state.position.y}px`;
        }
    }

    // 处理移动
    function handleMovement(deltaTime) {
        const speed = 0.5;
        const state1 = gameState.player1;
        const state2 = gameState.player2;

        // 玩家1移动
        if (pressedKeys.has(controls.player1.left)) {
            state1.position.x = Math.max(0, state1.position.x - speed * deltaTime);
            state1.facingRight = false;
            document.querySelector('.player1').style.transform = 'scaleX(-1)';
            if (animationPriority.player1.priority === PRIORITY_LEVELS.stand) {
                setPlayerAnimation('player1', 'run');
            }
        } else if (pressedKeys.has(controls.player1.right)) {
            state1.position.x = Math.min(1100, state1.position.x + speed * deltaTime);
            state1.facingRight = true;
            document.querySelector('.player1').style.transform = 'scaleX(1)';
            if (animationPriority.player1.priority === PRIORITY_LEVELS.stand) {
                setPlayerAnimation('player1', 'run');
            }
        } else if (animationPriority.player1.currentAnimation === 'run') {
            resetAnimation('player1');
        }

        // 玩家2移动
        if (pressedKeys.has(controls.player2.left.toLowerCase())) {
            state2.position.x = Math.max(0, state2.position.x - speed * deltaTime);
            state2.facingRight = false;
            document.querySelector('.player2').style.transform = 'scaleX(-1)';
            if (animationPriority.player2.priority === PRIORITY_LEVELS.stand) {
                setPlayerAnimation('player2', 'run');
            }
        } else if (pressedKeys.has(controls.player2.right.toLowerCase())) {
            state2.position.x = Math.min(1100, state2.position.x + speed * deltaTime);
            state2.facingRight = true;
            document.querySelector('.player2').style.transform = 'scaleX(1)';
            if (animationPriority.player2.priority === PRIORITY_LEVELS.stand) {
                setPlayerAnimation('player2', 'run');
            }
        } else if (animationPriority.player2.currentAnimation === 'run') {
            resetAnimation('player2');
        }

        // 更新玩家位置
        document.querySelector('.player1').style.left = `${state1.position.x}px`;
        document.querySelector('.player2').style.left = `${state2.position.x}px`;

        // 处理跳跃
        handleJumping('player1', deltaTime);
        handleJumping('player2', deltaTime);
    }

    // 更新奔跑动画
    function updateRunningAnimations() {
        ['player1', 'player2'].forEach(player => {
            if (animationPriority[player].currentAnimation === 'run') {
                setPlayerAnimation(player, 'run', 500);
            }
        });
    }

    // 更新UI
    function updateUI() {
        // 更新生命值条
        const health1Element = document.querySelector('.player1-health .health-bar-fill');
        const health2Element = document.querySelector('.player2-health .health-bar-fill');
        const score1Element = document.querySelector('.player1-score');
        const score2Element = document.querySelector('.player2-score');

        health1Element.style.width = `${gameState.player1.health}%`;
        health2Element.style.width = `${gameState.player2.health}%`;

        // 更新得分
        score1Element.textContent = gameState.player1.score;
        score2Element.textContent = gameState.player2.score;

        // 检查游戏结束条件
        if (gameState.player1.health <= 0 || gameState.player2.health <= 0) {
            endGame();
        }
    }

    // 结束游戏
    function endGame() {
        const winner = gameState.player1.health <= 0 ? 'Player 2' : 'Player 1';
        alert(`游戏结束！${winner} 获胜！`);
        window.location.href = 'index.html';
    }

    // 更新游戏状态
    function update(deltaTime) {
        handleMovement(deltaTime);
        updateRunningAnimations();
        updateUI();
    }

    // 游戏循环
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

    // 处理键盘按下事件
    function handleKeyDown(e) {
        const key = e.key.toLowerCase();
        pressedKeys.add(key);

        // 跳跃键
        if (key === controls.player1.up && !isJumping.player1 && !isOnCooldown('player1', 'jump')) {
            startJump('player1');
        }
        if (key === controls.player2.up.toLowerCase() && !isJumping.player2 && !isOnCooldown('player2', 'jump')) {
            startJump('player2');
        }

        // 攻击键
        if (key === controls.player1.attack && !isOnCooldown('player1', 'attack')) {
            startPrepareAttack('player1');
        }
        if (key === controls.player2.attack && !isOnCooldown('player2', 'attack')) {
            startPrepareAttack('player2');
        }
    }

    // 处理键盘松开事件
    function handleKeyUp(e) {
        const key = e.key.toLowerCase();
        pressedKeys.delete(key);

        // 攻击键松开
        if (key === controls.player1.attack) {
            executeAttack('player1');
        }
        else if (key === controls.player2.attack) {
            executeAttack('player2');
        }
    }

    // 初始化控制键
    function initializeControls() {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    }

    // 初始化控制键并启动游戏循环
    initializeControls();
    startGameLoop();
}

// 初始化整个游戏
function initializeGame() {
    initializeCharacterSelect((selectedCharacters) => {
        initializeBattleScene(selectedCharacters);
    });
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

