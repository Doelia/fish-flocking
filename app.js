Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

function cos(angle) {
    return Math.cos(Math.radians(angle));
}
function sin(angle) {
    return Math.sin(Math.radians(angle));
}

function subscracteAngles(h1, h2) {
    if (h1 < 0 || h1 >= 360) {
        h1 = (h1 % 360 + 360) % 360;
    }
    if (h2 < 0 || h2 >= 360) {
        h2 = (h2 % 360 + 360) % 360;
    }
    var diff = h1 - h2;
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
var img = document.getElementById("poisson");

var turtles = [];
gridWidth = canvas.width;
gridHeight = canvas.height;
var ID = 1;
obtacleX = null;
obtacleY = null;

var MS_PER_FRAMES = 60 / 1000; // ms
var POPULATION = 60;
var VISION = 80; // distance
var DIST_PER_TICK = 1;
var DIST_ON_MOUSE = 2;
var MAX_ALIGN_TURN = 0.6; // degres
var MIN_SEPARATION = 65; // distance
var MOUSE_SIZE = 80;
var POISSON_SIZE = 80;

var Turtle = function(x, y, orientation) {

    this.id = ID++;
    this.x = x;
    this.y = y;
    this.angle = orientation;
    this.props = {};

    this.foward = function(dist) {
        this.x += cos(this.angle) * dist;
        this.y += sin(this.angle) * dist;

        while (this.x < 0) {
            this.x += gridWidth;
        }
        while (this.y < 0) {
            this.y += gridHeight;
        }

        this.x %= gridWidth;
        this.y %= gridHeight;
    };

    this.turnTowards = function(angle, max) {
        var sub = subscracteAngles(this.angle, angle);
        this.turnAtMost(sub, max);
    };

    this.turnAtMost = function(turn, max) {
        if (Math.abs(turn) > max) {
            this.angle -= turn > 0 ? max : -max;
        } else {
            this.angle -= turn;
        }

        this.angle %= 360;
        while (this.angle < 0) {
            this.angle += 360;
        }

    }
};

function setup() {
    for (var i = 0; i < POPULATION; i++) {
        turtles.push(new Turtle(
            Math.random() * (gridWidth),
            Math.random() * (gridHeight),
            Math.random() * 360));
    }
}

function go() {
    turtles.forEach(function(t) {
        t.props = {};
        flock(t);
        obstacle(t);
        t.foward(DIST_PER_TICK);
    });
    draw();

    setTimeout(function() {
        go();
    }, MS_PER_FRAMES );
}

function flock(me) {
    var flockmates = findFlockmates(me);
    if (flockmates.length) {
        var nerest = findNerestDistance(flockmates, me);
        if (nerest) {
            if (nerest >= MIN_SEPARATION) {
                align(me, flockmates);
            } else {
                me.turnTowards(Math.random()*360, 1);
            }
        }
    } else {
        me.turnTowards(Math.random()*360, 1);
    }
}

function findFlockmates(turtle) {
    return turtles.filter(function(v) {
        return v.id !== turtle.id && distanceBetween(v, turtle) < VISION
    });
}

function findNerestDistance(flockmate, turtle) {
    return flockmate.reduce(function (p,c) {
        return Math.min(distanceBetween(c, turtle));
    }, gridWidth * gridHeight);
}

function distanceBetween(t1, t2) {
    return Math.sqrt((t1.x - t2.x) * (t1.x - t2.x) + (t1.y - t2.y) * (t1.y - t2.y));
}

function align(me, flockmates) {
    var sumX = flockmates.reduce((p,n) => p + sin(n.angle), 0);
    var sumY = flockmates.reduce((p,n) => p + cos(n.angle), 0);
    var angle = Math.degrees(Math.atan2(sumX, sumY));
    me.turnTowards(angle, MAX_ALIGN_TURN);
}

function obstacle(me) {
    if (!obtacleX || !obtacleY) {
        return false;
    }
    var angleObstacle = Math.degrees(Math.atan2(obtacleY - me.y, obtacleX - me.x));
    var diff = subscracteAngles(angleObstacle, me.angle);
    if (distanceBetween({x: obtacleX, y: obtacleY}, me) <= MOUSE_SIZE) {
        me.turnTowards(diff, 10);
        me.foward(DIST_ON_MOUSE);
    }
}

function rotateAndPaintImage(context, image, angleInRad, positionX, positionY, width, heigth ) {
    context.translate(positionX, positionY);
    context.rotate( angleInRad);
    context.drawImage( image, -width/2, -heigth/2, width, heigth);
    context.rotate(-angleInRad);
    context.translate(-positionX, -positionY);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < turtles.length; i++) {
        var t = turtles[i];
        rotateAndPaintImage(ctx, img, Math.radians(t.angle), t.x, t.y, POISSON_SIZE, POISSON_SIZE * 0.6);
    }
}

onmousemove = function(event) {
    obtacleX = event.clientX;
    obtacleY = event.clientY;
};

setup();
go();
