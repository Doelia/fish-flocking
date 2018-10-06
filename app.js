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
let ID = 1;

const MS_PER_FRAMES = 100; // ms
const population = 20;
const PX_PER_PATH = 10;
const VISION = 6 * PX_PER_PATH; // distance
const MIN_SEPARATION = 1 * PX_PER_PATH; // distance
const MAX_ALIGN_TURN = 5; // degres
const MAX_COHERER_TURN = 9; // degres
const MAX_SEPARATE_TURN = 1.5; // degres

class Turtle {

    constructor(x, y, orientation) {
        this.id = ID++;
        this.x = x;
        this.y = y;
        this.angle = orientation;
        this.props = {};
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
        if (Math.abs(angle - this.angle) < 180) {
            if (angle > this.angle) {
                this.angle += 10;
            } else {
                this.angle -= 10;
            }
        } else {
            if (angle > this.angle) {
                this.angle -= 10;
            } else {
                this.angle += 10;
            }
        }

        this.angle = this.angle % 360;
    }

    turnAway(angle, max) {
        // this.props.turnAway = this.angle;
        // this.angle += angle;
        // this.angle = this.angle % 360;

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
    const out = Math.hypot(t2.x-t1.x, t2.y-t1.y);
    return out;
}

function angleBetween(p1, p2) {
    const result = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    return result;
}

function cohere(me, flockmates) {
    let angle = 0;
    let sumX = flockmates.reduce((p,n) => Math.sin(Math.radians(angleBetween(n, me) + 180) + n.x), 0);
    let sumY = flockmates.reduce((p,n) => Math.cos(Math.radians(angleBetween(n, me) + 180) + n.x), 0);
    if (sumX === 0 && sumY === 0) {
        angle = me.angle;
    } else {
        angle = Math.atan(sumX, sumY);
    }
    angle = Math.degrees(angle);

    me.props.turnTowardsCohere = angle;
    me.turnTowards(angle, MAX_COHERER_TURN);

}

function align(me, flockmates) {
    let angle = 0;
    let sumX = flockmates.reduce((p,n) => p + n.x, 0);
    let sumY = flockmates.reduce((p,n) => p + n.y, 0);
    if (sumX === 0 && sumY === 0) {
        angle = me.angle;
        me.props.alignAngle = 'me';
    } else {
        angle = Math.atan(sumX, sumY);
    }
    angle = Math.degrees(angle);
    me.props.alignAngle = angle;

    me.props.turnTowardsAlign = angle;
    me.turnTowards(angle, MAX_ALIGN_TURN);
}

function separe(me, neigbour) {
    me.turnAway(neigbour.angle, MAX_SEPARATE_TURN);
}

function flock(me) {
    const flockmates = findFlockmates(me, VISION);
    if (flockmates.length) {
        let nerest = findNerest(flockmates, me);
        if (nerest) {
            if (distanceBetween(me, nerest) < MIN_SEPARATION) {
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
        if (t.id !== turtle.id && distance < vision) {
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




function setup() {
    createTurtles();
}

function go() {
    turtles.forEach(t => {
        t.props = {};
        flock(t);
        t.foward(1);
    });
    draw();

    setTimeout(function() {
        go();
    }, MS_PER_FRAMES);
}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    turtles.forEach(t => {
        var y = 0;
        function draw(text) {
            ctx.fillText(text, t.x, t.y + y);
            y -= 10;
        }
        ctx.rect(t.x, t.y, 5, 5);
        ctx.arc(t.x, t.y, VISION, 0, 2*Math.PI);
        draw('id: ' + t.id);
        draw('angle: ' + t.angle);
        for (var key in t.props) {
            draw(key + ': ' + t.props[key]);
        }
    });
    ctx.stroke();
}


setup();
go();
