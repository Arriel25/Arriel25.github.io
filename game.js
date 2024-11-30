// game.js

// 全局变量
let player1Character = null;
let player2Character = null;

// 角色位置
let player1Position = { x: 100, y: 400 };
let player2Position = { x: 900, y: 400 };

// 当前攻击状态
let player1Attacking = false;
let player2Attacking = false;

// 选择人物的处理函数
function selectCharacter(event) {
    const player = event.target.closest('.character-select');
    const characterCard = event.target.closest('.character-card');
    const playerNumber = player.dataset.player;
    const element = characterCard.dataset.element;
    
    // 更新选中的角色
    if (playerNumber == "1") {
        player1Character = element;
    } else {
        player2Character = element;
    }

    // 更新选中的角色卡片颜色
    const allCards = player.querySelectorAll('.character-card');
    allCards.forEach(card => {
        card.classList.remove('selected');
    });
    characterCard.classList.add('selected');

    // 启用/禁用开始按钮
    if (player1Character && player2Character) {
        document.querySelector('.start-button').disabled = false;
    }
}

// 开始游戏
function startGame() {
    if (!player1Character || !player2Character) {
        return;
    }

    // 隐藏角色选择界面，显示战斗场景
    document.getElementById('character-select').style.display = 'none';
    document.getElementById('battle-scene').style.display = 'block';

    // 设置角色图片
    document.querySelector('.player1 img').src = `resources/${player1Character}/stand.png`;
    document.querySelector('.player2 img').src = `resources/${player2Character}/stand.png`;

    // 初始化血条和得分
    const player1Health = document.querySelector('.player1-health .health-bar-fill');
    const player2Health = document.querySelector('.player2-health .health-bar-fill');
    player1Health.style.width = '100%';
    player2Health.style.width = '100%';

    // 启动键盘事件监听
    document.addEventListener('keydown', handleKeyPress);
}

// 处理键盘输入
function handleKeyPress(event) {
    const player1Health = document.querySelector('.player1-health .health-bar-fill');
    const player2Health = document.querySelector('.player2-health .health-bar-fill');

    // Player 1 控制（WASD 移动，F 攻击，G 技能）
    if (event.key === 'w') {
        player1Position.y -= 10;  // 向上移动
    } else if (event.key === 's') {
        player1Position.y += 10;  // 向下移动
    } else if (event.key === 'a') {
        player1Position.x -= 10;  // 向左移动
    } else if (event.key === 'd') {
        player1Position.x += 10;  // 向右移动
    } else if (event.key === 'f') {
        // Player 1 攻击
        player1Attacking = true;
        document.querySelector('.player1 img').src = `resources/${player1Character}/attack.png`;
        console.log('Player 1 attacks');
        if (Math.abs(player1Position.x - player2Position.x) < 50 && Math.abs(player1Position.y - player2Position.y) < 50) {
            // 如果 Player 1 和 Player 2 距离足够近，攻击 Player 2
            player2Health.style.width = (parseFloat(player2Health.style.width) - 10) + '%';
        }
    } else if (event.key === 'g') {
        console.log('Player 1 uses skill');
        document.querySelector('.player1 img').src = `resources/${player1Character}/magic.png`;
        console.log('Player 1 attacks');
        if (Math.abs(player1Position.x - player2Position.x) < 50 && Math.abs(player1Position.y - player2Position.y) < 50) {
            // 如果 Player 1 和 Player 2 距离足够近，攻击 Player 2
            player2Health.style.width = (parseFloat(player2Health.style.width) - 10) + '%';
        }
    }

    // Player 2 控制（箭头键移动，1 攻击，2 技能）
    if (event.key === 'ArrowUp') {
        player2Position.y -= 10;  // 向上移动
    } else if (event.key === 'ArrowDown') {
        player2Position.y += 10;  // 向下移动
    } else if (event.key === 'ArrowLeft') {
        player2Position.x -= 10;  // 向左移动
    } else if (event.key === 'ArrowRight') {
        player2Position.x += 10;  // 向右移动
    } else if (event.key === '1') {
        // Player 2 攻击
        player2Attacking = true;
        document.querySelector('.player2 img').src = `resources/${player2Character}/attack.png`;
        console.log('Player 2 attacks');
        if (Math.abs(player2Position.x - player1Position.x) < 50 && Math.abs(player2Position.y - player1Position.y) < 50) {
            // 如果 Player 2 和 Player 1 距离足够近，攻击 Player 1
            player1Health.style.width = (parseFloat(player1Health.style.width) - 10) + '%';
        }
    } else if (event.key === '2') {
        console.log('Player 2 uses skill');
        document.querySelector('.player2 img').src = `resources/${player2Character}/magic.png`;
        console.log('Player 2 attacks');
        if (Math.abs(player2Position.x - player1Position.x) < 50 && Math.abs(player2Position.y - player1Position.y) < 50) {
            // 如果 Player 2 和 Player 1 距离足够近，攻击 Player 1
            player1Health.style.width = (parseFloat(player1Health.style.width) - 10) + '%';
        }
    }

    // 更新玩家位置
    updatePlayerPosition();
}

// 更新玩家位置
function updatePlayerPosition() {
    const player1Element = document.querySelector('.player1');
    const player2Element = document.querySelector('.player2');

    // 更新 Player 1 的位置
    player1Element.style.left = player1Position.x + 'px';
    player1Element.style.top = player1Position.y + 'px';

    // 更新 Player 2 的位置
    player2Element.style.left = player2Position.x + 'px';
    player2Element.style.top = player2Position.y + 'px';

    // 恢复玩家攻击状态
    if (player1Attacking || player2Attacking) {
        setTimeout(() => {
            if (player1Attacking) {
                document.querySelector('.player1 img').src = `resources/${player1Character}/stand.png`;
                player1Attacking = false;
            }
            if (player2Attacking) {
                document.querySelector('.player2 img').src = `resources/${player2Character}/stand.png`;
                player2Attacking = false;
            }
        }, 500); // 恢复攻击动画为站立状态，假设攻击动画持续500ms
    }
}

// 绑定事件
document.addEventListener('DOMContentLoaded', function() {
    const characterCards = document.querySelectorAll('.character-card');
    characterCards.forEach(card => {
        card.addEventListener('click', selectCharacter);
    });

    const startButton = document.querySelector('.start-button');
    startButton.addEventListener('click', startGame);
});
