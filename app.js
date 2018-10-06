Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");

let turtles = [];
gridWidth = canvas.width;
gridHeight = canvas.height;
console.log('grid', gridHeight, gridWidth);
const population = 20;

class Turtle {

    constructor(x, y, orientation) {
        this.x = x;
        this.y = y;
        this.angle = orientation;
    }

    foward() {
        // console.log('foward', dist, this);
        const dist = 1;
        this.x += Math.cos(Math.radians(this.angle)) * dist;
        this.y += Math.sin(Math.radians(this.angle)) * dist;

        this.x %= gridWidth;
        this.y %= gridHeight;
    }

    turnTowards(angle, max) {
        if (angle > this.angle) {
            this.angle += 10;
        } else {
            this.angle -= 10;
        }
        this.angle = this.angle % 360;

    }

    turnAway(angle, max) {
        this.angle += angle;
        this.angle = this.angle % 360;

    }
}

function createTurtles() {
    for (let i = 0; i < population; i++) {
        turtles.push(new Turtle(
            Math.random() * (gridWidth),
            Math.random() * (gridHeight),
            Math.random() * 360));
    }
}

function distanceBetween(t1, t2) {
    return Math.hypot(t2.x-t1.x, t2.y-t1.y);
}

function cohere(me, flockmates) {
    me.turnTowards(averageheadingtowardsflockmate(flockmates), 9);

}

function align(me, flockmates) {
    me.turnTowards(averageflockmateheading(flockmates), 5);
}

function separe(me, neigbour) {
    me.turnAway(neigbour.angle, 1.5);
}

function flock(me) {
    const flockmates = findFlockmates(me, 6);
    if (flockmates.length) {
        let nerest = findNerest(me);
        if (nerest) {
            if (distanceBetween(me, nerest) < 5) {
                separe(me, nerest);
            } else {
                align(me, flockmates);
                cohere(me, flockmates);
            }
        }
    }
}

function findFlockmates(turtle, vision) {
    let out = [];
    for (let i = 0; i < turtles.length; i++) {
        var t = turtles[i];
        const distance = distanceBetween(t, turtle);
        if (distance < vision) {
            out.push(t);
        }
    }
    return out;
}

function findNerest(turtle) {
    let min = 0;
    let minI = 0;
    for (let i = 0; i < turtles.length; i++) {
        var t = turtles[i];
        const distance = distanceBetween(t, turtle);
        if (distance < min) {
            min = distMax;
            minI = i;
        }
    }
    return turtles[minI] || null;
}

function averageflockmateheading(turtles) {
    return 90;
}

function averageheadingtowardsflockmate(turtles) {
    return 90;
}


function setup() {
    createTurtles();
}

function go() {
    turtles.forEach(t => {
        flock(t);
        t.foward(1);
    });
    draw();

    setTimeout(function() {
        go();
    }, 10);
}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    turtles.forEach(t => {
        ctx.rect(t.x, t.y, 5, 5);
    });
    ctx.stroke();
}


setup();
go();
