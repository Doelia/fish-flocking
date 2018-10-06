Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

function subscracteAngles(h1, h2) {
    if (h1 < 0 || h1 >= 360) {
        h1 = (h1 % 360 + 360) % 360;
    }
    if (h2 < 0 || h2 >= 360) {
        h2 = (h2 % 360 + 360) % 360;
    }
   let diff = h1 - h2;
    if (diff > -180 && diff <= 180) {
        return diff;
    } else if (diff > 0) {
        return diff - 360;
    } else {
        return diff + 360;
    }
}

var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");

let turtles = [];
gridWidth = canvas.width;
gridHeight = canvas.height;
let ID = 1;
obtacleX = null;
obtacleY = null;

const MS_PER_FRAMES = 60 / 1000; // ms
const DEBUG = false;
const population = 30;

// const DEBUG = true;
// const MS_PER_FRAMES = 200; // ms
// const population = 3;

const VISION = 100; // distance
const DIST_PER_TICK = 1;

const MAX_ALIGN_TURN = 0.6; // degres
const MIN_SEPARATION = 50; // distance
const MOUSE_SIZE = 80;
const POISSON_SIZE = 80;

class Turtle {

    constructor(x, y, orientation) {
        this.id = ID++;
        this.x = x;
        this.y = y;
        this.angle = orientation;
        this.props = {};
    }

    foward() {
        const dist = DIST_PER_TICK;
        this.x += Math.cos(Math.radians(this.angle)) * dist;
        this.y += Math.sin(Math.radians(this.angle)) * dist;

        while (this.x < 0) {
            this.x += gridWidth;
        }
        while (this.y < 0) {
            this.y += gridHeight;
        }

        this.x %= gridWidth;
        this.y %= gridHeight;
    }

    turnTowards(angle, max) {
        const sub = subscracteAngles(this.angle, angle);
        this.props.sub = sub;
        this.turnAtMost(sub, max);
    }

    turnAtMost(turn, max) {
        if (Math.abs(turn) > max) {
            if (turn > 0) {
                this.angle -= max;
            } else {
                this.angle += max;
            }
        } else {
            this.angle -= turn;
        }

        this.angle %= 360;
        while (this.angle < 0) {
            this.angle += 360;
        }

    }
}

function createTurtles() {
    // turtles.push(new Turtle(100, 100, 200));
    // turtles.push(new Turtle(100, 100, 220));
    for (let i = 0; i < population; i++) {
        turtles.push(new Turtle(
            Math.random() * (gridWidth),
            Math.random() * (gridHeight),
            Math.random() * 360));
    }
}

function go() {
    turtles.forEach(t => {
        t.props = {};
        flock(t);
        // t.turnTowards(90, 1);
        obstacle(t);
        t.foward(1);
    });
    draw();

    setTimeout(function() {
        go();
    }, MS_PER_FRAMES );
}

function flock(me) {
    const flockmates = findFlockmates(me);
    if (flockmates.length) {
        let nerest = findNerest(flockmates, me);
        if (nerest) {
            if (distanceBetween(me, nerest) >= MIN_SEPARATION) {
                align(me, flockmates);
            }
        }
    }
}

function findFlockmates(turtle) {
    let out = [];
    for (let i = 0; i < turtles.length; i++) {
        var t = turtles[i];
        const distance = distanceBetween(t, turtle);
        if (t.id !== turtle.id && distance < VISION) {
            out.push(t);
        }
    }
    return out;
}

function findNerest(flockmate, turtle) {
    let min = 10000000000;
    let nerest = null;
    for (let i = 0; i < flockmate.length; i++) {
        var t = flockmate[i];
        const distance = distanceBetween(t, turtle);
        if (distance < min) {
            min = distance;
            nerest = t;
        }
    }
    return nerest;
}


function distanceBetween(t1, t2) {
    const out = Math.hypot(t2.x-t1.x, t2.y-t1.y);
    return out;
}

function align(me, flockmates) {
    let angle = 0;
    let sumX = flockmates.reduce((p,n) => p + Math.sin(Math.radians(n.angle)), 0);
    let sumY = flockmates.reduce((p,n) => p + Math.cos(Math.radians(n.angle)), 0);
    if (sumX === 0 && sumY === 0) {
        angle = me.angle;
        me.props.angAl = 'me';
    } else {
        angle = Math.atan2(sumX, sumY);
        angle = Math.degrees(angle);
        me.props.angAl = angle;
    }

    me.turnTowards(angle, MAX_ALIGN_TURN);
}

function obstacle(me) {
    if (!obtacleX || !obtacleY) {
        return false;
    }
    let angleObstacle = Math.atan2(obtacleY - me.y, obtacleX - me.x);
    angleObstacle = Math.degrees(angleObstacle);
    const diff = subscracteAngles(angleObstacle, me.angle);
    const distance = distanceBetween({x: obtacleX, y: obtacleY}, me);
    if (distance <= MOUSE_SIZE) {
        me.turnTowards(diff, 10);
        me.foward(5);
    }
}

function setup() {
    createTurtles();
}

function draw() {

    function rotateAndPaintImage ( context, image, angleInRad , positionX, positionY, width, heigth ) {
        context.translate( positionX, positionY );
        context.rotate( angleInRad );
        context.drawImage( image, -width/2, -heigth/2, width, heigth);
        context.rotate( -angleInRad );
        context.translate( -positionX, -positionY );
    }

    var img = document.getElementById("scream");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    turtles.forEach(t => {
        rotateAndPaintImage(ctx, img, Math.radians(t.angle), t.x, t.y, POISSON_SIZE, POISSON_SIZE * 0.6);
        // ctx.drawImage(img, t.x, t.y, 20, 15);
        // ctx.rect(t.x, t.y, 20, 20);

        if (DEBUG) {
            var y = 0;
            function draw(text) {
                ctx.fillText(text, t.x, t.y + y);
                y -= 10;
            }
            ctx.arc(t.x, t.y, VISION, Math.radians(t.angle), 2*Math.PI + Math.radians(t.angle));
            draw('id: ' + t.id);
            draw('angle: ' + Math.floor(t.angle));
            for (var key in t.props) {
                draw(key + ': ' + Math.floor(t.props[key]));
            }
        }
    });
    ctx.stroke();
}

onmousemove = function(event) {
    obtacleX = event.clientX;
    obtacleY = event.clientY;
}


setup();
go();
