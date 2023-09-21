// initialize everything

let canvas;

let musicPlaying = false;

let fpsInterval = 1000 / 30; // the denominator is frames-per-second
let now;
let context;
let then = Date.now();
let request_id;

let score = 0;

let bullets = [];
let asteroids = [];
let enemies = [];

let e = {
    image : new Image(),
}

let a = {
    image : new Image(),
}

let gameMusic;

let player = {
	x : 256,
	y : 256,
	size : 20,
	yChange : 2.5,
	xChange : 2.5,
    image: new Image(),
}


// player.image.src = 'shipPack/mainship.png';
//e.image.src = 'Planets/Enemy.png';
//a.image.src = 'Planets/Asteroid.png';


let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

document.addEventListener("DOMContentLoaded", init, false);

function init() {
    canvas = document.querySelector("canvas"); 
    canvas.style.backgroundImage = "url('Planets/Space_Background.png')"; // from W3 Schools
    context = canvas.getContext("2d");

    window.addEventListener("keydown", activate, false); 
    window.addEventListener("keyup", deactivate, false);


    load_assets([
        {"var": player.image, "src": "shipPack/mainship.png"},
    ], draw);
}

// start of draw function
function draw() {
    request_id = window.requestAnimationFrame(draw);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }

    then = now - (elapsed % fpsInterval);

    if (!musicPlaying) {
        gameMusic = new Audio("a-hero-of-the-80s.mp3");
        gameMusic.play();
        musicPlaying = true;
    }


    // create asteroids

    if (asteroids.length < 10) {
        let a = {
            x : randint(0, canvas.width),
            y : randint(0, canvas.height),
            size : randint(5, 15),
            xChange : 0,
            yChange : 0,
            image : new Image(),
        };
        asteroids.push(a);
    }

    // create enemies

    if (enemies.length < 5) {
        let e = {
            x: randint(0, canvas.width),
            y: randint(0, canvas.height),
            size: 10,
            xChange: 0.04,
            yChange: 0.04,
            image: new Image(),
        };
        enemies.push(e);
    }

    // creating player

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(player.image, player.x, player.y, player.size, player.size); 

    // drawing them

    for (let a of asteroids) {
        context.fillStyle = "white";
        context.fillRect(a.x, a.y, a.size, a.size);
        bounceA(a);
    }
    for (let e of enemies) {
        context.fillStyle = "red";
        context.fillRect(e.x, e.y, e.size, e.size);
        bounceE(e);
    }

    // lose condition

    for (let a of asteroids) {
        if (player_collidesA(a)) { 
            stop("You lose!"); 
            gameMusic.pause();
            return;
        }
    }

    for (let e of enemies) {
        if (player_collidesE(e)) {
            stop("You lose!");
            gameMusic.pause();
            return;
        }
    }

// bullet stuff

    for (let b of bullets) {
        context.fillStyle = "orange";
        context.fillRect(b.x, b.y, b.size, b.size);
    }

    for (let i = bullets.length - 1; i >= 0; i--) { 
        let b = bullets[i];
        if (b.x + b.size < 0 || b.x > canvas.width || b.y + b.size < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }
    
    // enemy + asteroid movement + collision

    for (let a of asteroids) {
        if (a.x + a.size < 0) {
            a.x = randint(0, canvas.width);
            a.y = randint(0, canvas.height);
            } else {
            a.x = a.x + a.xChange;
            a.y = a.y + a.yChange;
        }
    }
    for (let a of asteroids) {
        if (a.x > player.x ) {
            a.xChange = a.xChange + .005;
        }
    }
    for (let a of asteroids) {
        if (a.x < player.x ) {
            a.xChange = a.xChange - .005;
        }
    }
    for (let a of asteroids) {
        if (a.y > player.y ) {
            a.yChange = a.yChange + .005;
        }
    }
    for (let a of asteroids) {
        if (a.y < player.y ) {
            a.yChange = a.yChange - .005;
        }
    }

    for (let e of enemies) {
        if (e.x + e.size < 0) {
            e.x = randint(0, canvas.width);
            e.y = randint(0, canvas.height);
        } else {
            e.x = e.x + e.xChange;
            e.y = e.y + e.yChange;
        }
    }

    for (let e of enemies) {
        if (e.y < player.y) {
            e.yChange = e.yChange + .045;
        }
    }

    for (let e of enemies) {
        if (e.y > player.y) {
            e.yChange = e.yChange - .045;
        }
    }
    for (let e of enemies) {
        if (e.x < player.x) {
            e.xChange = e.xChange + .045;
        }
    }
    for (let e of enemies) {
        if (e.x > player.x) {
            e.xChange = e.xChange - .045;
        }
    }
    for (let a of asteroids) {
        if (a.yChange > 1 || a.yChange < -1) {
            a.yChange = a.yChange * 0.5;
        }
    }
    for (let a of asteroids) {
        if (a.xChange > 1 || a.xChange < -1) {
            a.xChange = a.xChange * 0.5;
        }
    }

    for (let e of enemies) {
        if (e.yChange > 1 || e.yChange < -1) {
            e.yChange = e.yChange * 0.5;
        }
    }
    for (let e of enemies) {
        if (e.xChange > 1 || e.xChange < -1) {
            e.xChange = e.xChange * 0.5;
        }
    }
    
    for (let a of asteroids) {
        if (a.yChange > 2) {
            a.yChange = a.yChange * 0.5;
        } else if (a.yChange < -2) {
            a.yChange = a.yChange * 0.5;
        }

    }

    // player movement + bullet movement

    if (moveRight) {
        player.x = player.x + player.xChange;
        
    }
    
    if (moveUp) {
        player.y = player.y - player.yChange;
        
    }
    
    if (moveDown) {
        player.y = player.y + player.yChange;
        
    }

    if (moveLeft) {
        player.x = player.x - player.xChange;
        
    }

    for (let b of bullets) {
        b.x = b.x + b.xChange;
        b.y = b.y + b.yChange;
    }
    

    for (let b of bullets) {
        context.fillRect(b.x, b.y, b.size, b.size);
    }
    for (let b of bullets) {
        for (let a of asteroids) {
            if (bullet_collidesA(b, a)) {
                a.x = randint(0, canvas.width);
                a.y = randint(0, canvas.height);
                score = score + 1;
                document.getElementById("score").innerHTML = score;
            }
        }
    }

    for (let b of bullets) {
        if (b.x + b.size < 0) {
            bullets.splice(bullets.indexOf(b), 1);
        }
    }

    for (let b of bullets) {
        if (b.x > canvas.width) {
            bullets.splice(bullets.indexOf(b), 1);
        }
    }

    for (let b of bullets) {
        if (b.y + b.size < 0) {
            bullets.splice(bullets.indexOf(b), 1);
        }
    }

    for (let b of bullets) {
        if (b.y > canvas.height) {
            bullets.splice(bullets.indexOf(b), 1);
        }
    }

    
}



function randint(min, max) {
    return Math. round (Math.random() * (max - min)) + min;
}

function activate(event) {
    let key = event.key;
    if (key === "ArrowLeft") {
        moveLeft = true;
    } else if (key === "ArrowRight") {
        moveRight = true;
    } else if (key === "ArrowUp") {
        moveUp = true;
    } else if (key === "ArrowDown") {
        moveDown = true;
    }
    else if (key === " ") {
        shoot();
    }
}



function deactivate(event) {
    let key = event.key;
    if (key === "ArrowLeft") {
        moveLeft = false;
    } else if (key === "ArrowRight") {
        moveRight = false;
    } else if (key === "ArrowUp") {
        moveUp = false;
    } else if (key === "ArrowDown") {
        moveDown = false;
    }
}

// collisions

function player_collidesA(a) {
    if (player.x + player.size < a.x ||
    a.x + a.size < player.x || 
    player.y > a.y + a.size ||
    a.y > player.y + player.size) {
    return false;
    } else {
        return true;
    }
}

function player_collidesE(e) {
    if (player.x + player.size < e.x ||
    e.x + e.size < player.x ||
    player.y > e.y + e.size ||
    e.y > player.y + player.size) {
    return false;
    } else {
        return true;
    }
}

// brrrrrrrr

function shoot() {
    let bullet = {
        x : player.x,
        y : player.y,
        size : 5,
        xChange : randint(-1, 1),
        yChange : -1
    };
    bullets.push(bullet);

    if (moveRight) {
        bullet.xChange = 1; 
        bullet.yChange = 0;
    } else if (moveLeft) {
        bullet.xChange = -1; 
        bullet.yChange = 0;
    } else if (moveUp) {
        bullet.yChange = -1; 
        bullet.xChange = 0;
    } else if (moveDown) {
        bullet.yChange = 1; 
        bullet.xChange = 0;
    }
    else if (moveRight && moveUp) {
        bullet.xChange = 1;
        bullet.yChange = -1;
    } else if (moveRight && moveDown) {
        bullet.xChange = 1;
        bullet.yChange = 1;
    } else if (moveLeft && moveUp) {
        bullet.xChange = -1;
        bullet.yChange = -1;
    }
    else if (moveLeft && moveDown) {
        bullet.xChange = -1;
        bullet.yChange = 1;
    }

    for (let b of bullets) {
        for (let a of asteroids) {
            if (bullet_collidesA(b, a)) {
                a.x = randint(0, canvas.width);
                a.y = randint(0, canvas.height);
                bullets.splice(bullets.indexOf(b), 1)
                score = score + 1;
                document.getElementById("score").innerHTML = score;
                bullets.splice(bullets.indexOf(b), 1);
            }
        }
    }

    for (let b of bullets) {
        for (let e of enemies) {
            if (bullet_collidesE(b, e)) {
                e.x = randint(0, canvas.width);
                e.y = randint(0, canvas.height);
                bullets.splice(bullets.indexOf(b), 1)
                score = score + 3;
                document.getElementById("score").innerHTML = score;
                bullets.splice(bullets.indexOf(b), 1);
            }
        }
    }

    

    for (let b of bullets) {
        if (b.x + b.size < 0) {
            b.x = player.x;
            b.y = player.y;
            } else {
            b.x = b.x + b.xChange;
            b.y = b.y + b.yChange;
        }
    }

    // killing enemies + asteroids and redrawing them

    for (let b of bullets) {
        for (let a of asteroids) {
            if (bullet_collidesA(a)) {
                a.x = randint(0, canvas.width);
                a.y = randint(0, canvas.height);
                b.x = player.x;
                b.y = player.y;
            }
        }
    }

    for (let b of bullets) {
        for (let e of enemies) {
            if (bullet_collidesE(e)) {
                e.x = randint(0, canvas.width);
                e.y = randint(0, canvas.height);
                b.x = player.x;
                b.y = player.y;
            }
        }
    }

}

function bounceA(a) {
    if (a.x + a.size > canvas.width) {
        a.xChange = a.xChange * -.5;
    } else if (a.x < 0) {
        a.xChange = a.xChange * -.5;
    } else if (a.y + a.size > canvas.height) {
        a.yChange = a.yChange * -.5;
    } else if (a.y < 0) {
        a.yChange = a.yChange * -.5;
    }
}

function bounceE(e) {
    if (e.x + e.size > canvas.width) {
        e.xChange = e.xChange * -.5;
    } else if (e.x < 0) {
        e.xChange = e.xChange * -.5;
    } else if (e.y + e.size > canvas.height) {
        e.yChange = e.yChange * -.5;
    } else if (e.y < 0) {
        e.yChange = e.yChange * -.5;
    }
}
    

function bullet_collidesA(bullet, asteroid) {
    if (bullet.x + bullet.size < asteroid.x ||
        asteroid.x + asteroid.size < bullet.x ||
        bullet.y + bullet.size < asteroid.y ||
        asteroid.y + asteroid.size < bullet.y) {
        return false;
    } else {
        return true;
    }
}

function bullet_collidesE(bullet, enemy) {
    if (bullet.x + bullet.size < enemy.x ||
        enemy.x + enemy.size < bullet.x ||
        bullet.y + bullet.size < enemy.y ||
        enemy.y + enemy.size < bullet.y) {
        return false;
    }
    else {
        return true;
    }
}



function load_assets(assets, callback) {
    let num_assets = assets.length;
    let loaded = function() {
        console.log("loaded");
        num_assets = num_assets - 1;
        if (num_assets == 0) {
            callback();
        }
    };
    for (let asset of assets) {
        let element = asset.var;
        if ( element instanceof HTMLImageElement) {
            console.log("img");
            element.addEventListener("load", loaded, false);
        }
        else if ( element instanceof HTMLAudioElement) {
            console.log("audio");
            element.addEventListener("canplaythrough", loaded, false);
        }
        element.src = asset.src;
    }
}

function stop(outcome) {
    window.removeEventListener("keydown", activate, false);
    window.removeEventListener("keyup", deactivate, false);
    window.cancelAnimationFrame(request_id);
    let outcome_element = document.querySelector("#outcome"); 
    outcome_element.innerHTML = outcome;
}