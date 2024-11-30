
let player1Character = null;
let player2Character = null;


let player1Position = { x: 100, y: 100 };
let player2Position = { x: 400, y: 100 };


let player1Attacking = false;
let player2Attacking = false;


function selectCharacter(event) {
    const player = event.target.closest('.character-select');
    const characterCard = event.target.closest('.character-card');
    const playerNumber = player.dataset.player;
    const element = characterCard.dataset.element;
    
    
    if (playerNumber == "1") {
        player1Character = element;
    } else {
        player2Character = element;
    }

    
    const allCards = player.querySelectorAll('.character-card');
    allCards.forEach(card => {
        card.classList.remove('selected');
    });
    characterCard.classList.add('selected');

   
    if (player1Character && player2Character) {
        document.querySelector('.start-button').disabled = false;
    }
}


function startGame() {
    if (!player1Character || !player2Character) {
        return;
    }


    document.getElementById('character-select').style.display = 'none';
    document.getElementById('battle-scene').style.display = 'block';


    document.querySelector('.player1 img').src = `resources/${player1Character}/stand.png`;
    document.querySelector('.player2 img').src = `resources/${player2Character}/stand.png`;


    const player1Health = document.querySelector('.player1-health .health-bar-fill');
    const player2Health = document.querySelector('.player2-health .health-bar-fill');
    player1Health.style.width = '100%';
    player2Health.style.width = '100%';


    document.addEventListener('keydown', handleKeyPress);
}


function handleKeyPress(event) {
    const player1Health = document.querySelector('.player1-health .health-bar-fill');
    const player2Health = document.querySelector('.player2-health .health-bar-fill');

    
    if (event.key === 'w') {
        player1Position.y -= 10;  
    } else if (event.key === 's') {
        player1Position.y += 10;  
    } else if (event.key === 'a') {
        player1Position.x -= 10;  
    } else if (event.key === 'd') {
        player1Position.x += 10;  
    } else if (event.key === 'f') {
        // Player 1 攻击
        player1Attacking = true;
        document.querySelector('.player1 img').src = `resources/${player1Character}/attack.png`;
        console.log('Player 1 attacks');
        if (Math.abs(player1Position.x - player2Position.x) < 50 && Math.abs(player1Position.y - player2Position.y) < 50) {
            player2Health.style.width = (parseFloat(player2Health.style.width) - 10) + '%';
        }

    } else if (event.key === 'g') {
        console.log('Player 1 uses skill');
        document.querySelector('.player2 img').src = `resources/${player2Character}/magic.png`;
        console.log('Player 2 attacks');
        if (Math.abs(player2Position.x - player1Position.x) < 50 && Math.abs(player2Position.y - player1Position.y) < 50) {
            player1Health.style.width = (parseFloat(player1Health.style.width) - 10) + '%';
        }
    }

    
    if (event.key === 'ArrowUp') {
        player2Position.y -= 10; 
    } else if (event.key === 'ArrowDown') {
        player2Position.y += 10; 
    } else if (event.key === 'ArrowLeft') {
        player2Position.x -= 10; 
    } else if (event.key === 'ArrowRight') {
        player2Position.x += 10; 
    } else if (event.key === '1') {
        
        player2Attacking = true;
        document.querySelector('.player2 img').src = `resources/${player2Character}/attack.png`;
        console.log('Player 2 attacks');
        if (Math.abs(player2Position.x - player1Position.x) < 50 && Math.abs(player2Position.y - player1Position.y) < 50) {
            player1Health.style.width = (parseFloat(player1Health.style.width) - 10) + '%';
        }
    } else if (event.key === '2') {
        player2Attacking = true;
        document.querySelector('.player2 img').src = `resources/${player2Character}/magic.png`;
        console.log('Player 2 attacks');
        if (Math.abs(player2Position.x - player1Position.x) < 50 && Math.abs(player2Position.y - player1Position.y) < 50) {
            player1Health.style.width = (parseFloat(player1Health.style.width) - 10) + '%';
        }
        console.log('Player 2 uses skill');
    }


    updatePlayerPosition();
}

function updatePlayerPosition() {
    const player1Element = document.querySelector('.player1');
    const player2Element = document.querySelector('.player2');

    player1Element.style.left = player1Position.x + 'px';
    player1Element.style.top = player1Position.y + 'px';

    player2Element.style.left = player2Position.x + 'px';
    player2Element.style.top = player2Position.y + 'px';

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
        }, 500); 
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const characterCards = document.querySelectorAll('.character-card');
    characterCards.forEach(card => {
        card.addEventListener('click', selectCharacter);
    });

    const startButton = document.querySelector('.start-button');
    startButton.addEventListener('click', startGame);
});
