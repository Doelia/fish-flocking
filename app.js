function FishFlocking() {

    var MS_PER_FRAMES = 60 / 1000;
    var POPULATION = 800;
    var VISION = 20; // distance
    var DIST_PER_TICK = 1;
    var MAX_ALIGN_TURN = 1.2; // degres
    var MAX_SEPARATE_TURN = 0.3; // degres
    var MIN_SEPARATION = 8; // distance
    var MOUSE_SIZE = 40;
    var DIST_ON_MOUSE = 2;
    var POISSON_SIZE = 20;

    var ctx;
    var img;

    var turtles = [];
    var gridWidth;
    var gridHeight;
    var obstacleX = null;
    var obstacleY = null;

    var Turtle = function(x, y, orientation) {

        this.x = x;
        this.y = y;
        this.angle = orientation;

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
            var sub = subscracteAngles(angle, this.angle);
            this.turnAtMost(sub, max);
        };

        this.turnAway = function(angle, max) {
            var sub = subscracteAngles(this.angle, angle);
            this.turnAtMost(sub, max);
        };

        this.turnAtMost = function(turn, max) {
            if (Math.abs(turn) > max) {
                this.angle += turn > 0 ? max : -max;
            } else {
                this.angle += turn;
            }

            this.angle %= 360;
            while (this.angle < 0) {
                this.angle += 360;
            }
        }
    };

    function setup(canvas, img_input) {

        img = img_input;

        ctx = canvas.getContext("2d");
        gridWidth = canvas.width;
        gridHeight = canvas.height;

        for (var i = 0; i < POPULATION; i++) {
            turtles.push(new Turtle(
                Math.random() * (gridWidth),
                Math.random() * (gridHeight),
                Math.random() * 360));
        }

        onmousemove = function(event) {
            obstacleX = event.clientX;
            obstacleY = event.clientY;
        };

        window.addEventListener('resize', function() {
            gridWidth = canvas.width;
            gridHeight = canvas.height;
        }, false);

    }

    function go() {

        turtles.forEach(function(t) {
            flock(t);
            obstacle(t);
            t.foward(DIST_PER_TICK);
        });
        draw();

        setTimeout(function() {
            go();
        }, MS_PER_FRAMES);
    }

    function flock(me) {
        var flockmates = findFlockmates(me);
        if (flockmates.length) {
            var nerest = findNerest(flockmates, me);
            var distance = distanceBetween(nerest, me);
            if (distance >= MIN_SEPARATION) {
                align(me, flockmates);
            } else {
                separate(me, nerest);
            }
        } else {
            me.turnTowards(Math.random()*360, 1);
        }
    }

    function findFlockmates(me) {
        return turtles.filter(function(t) {
            var distance = distanceBetween(t, me);
            return distance && distance <= VISION;
        });
    }

    function findNerest(flockmate, turtle) {
        var nerest = null;
        var minDist = 0;
        for (var i = 0; i < flockmate.length; i++) {
            var t = flockmate[i];
            var dist = distanceBetween(t, turtle);
            if (!nerest || dist < minDist) {
                nerest = t;
                minDist = dist;
            }
        }
        return nerest;
    }

    function align(me, flockmates) {
        var sumX = flockmates.reduce(function(p,n) {
            return p + sin(n.angle);
        }, 0);

        var sumY = flockmates.reduce(function(p,n) {
            return p + cos(n.angle);
        }, 0);

        var angle = Math.degrees(Math.atan2(sumX, sumY));
        me.turnTowards(angle, MAX_ALIGN_TURN);
    }

    function separate(me, nerestTurtle) {
        me.turnAway(nerestTurtle.angle, MAX_SEPARATE_TURN);
    }

    function obstacle(me) {
        if (!obstacleX || !obstacleY) {
            return false;
        }
        var angleObstacle = Math.degrees(Math.atan2(obstacleY - me.y, obstacleX - me.x));
        var diff = subscracteAngles(me.angle, angleObstacle);
        if (distanceBetween({x: obstacleX, y: obstacleY}, me) <= MOUSE_SIZE) {
            me.turnTowards(180 - diff, 10);
            me.foward(DIST_ON_MOUSE);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, gridWidth, gridHeight);
        for (var i = 0; i < turtles.length; i++) {
            var t = turtles[i];
            rotateAndPaintImage(ctx, img, Math.radians(t.angle), t.x, t.y, POISSON_SIZE, POISSON_SIZE * 0.6);
        }
    }

    this.setup = setup;
    this.go = go;
}

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

function rotateAndPaintImage(context, image, angleInRad, positionX, positionY, width, heigth ) {
    context.translate(positionX, positionY);
    context.rotate( angleInRad);
    context.drawImage( image, -width/2, -heigth/2, width, heigth);
    context.rotate(-angleInRad);
    context.translate(-positionX, -positionY);
}

function distanceBetween(t1, t2) {
    return Math.sqrt((t1.x - t2.x) * (t1.x - t2.x) + (t1.y - t2.y) * (t1.y - t2.y));
}
