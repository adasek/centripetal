/*
 * @copyright Adam Benda, 2016
 */


/**
 * @class
 * @classdesc Gamestate: score, speed, pylons, Player, lot of fun...
 */

/**
 * 
 */
var Gamestate = function () {
    /**
     * @type {Matter.Engine}
     */
    this.engine = null;


    /**
     * All Pylons on the map
     * @type {Pylon[]}
     */
    this.pylons = [];

    /**
     * All playing balls
     * @type {Ball}
     */
    this.balls = [];


    //Register input 
    document.getElementById('overlay').addEventListener("touch", this.playerInput.bind(this));
    document.getElementById('overlay').addEventListener("click", this.playerInput.bind(this));

    /**
     * Indicates that game was ended
     */
    this.gameOver = false;

    //Evelina animation
    this.evelina = null;

    /**
     * Score for outlived enemies
     * @type {number}
     */
    this._scoreNoTime = 0;

    /**
     * Start of game time
     * @type {Date}
     */
    this.startTime = new Date();

    this.overlay = new Overlay();

    this.tickNum = 0;
    this.simTime = 0;
    this.gravityChangeTicks = null;

    this.restart();

    this.overlay.showBeginScreen(this);

    this.resize();

    this.randomSeed = 1;

    this.bonuses = [];
    this.newBonus();
};

Gamestate.prototype.resize = function () {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    //always fill screen with respecting aspectRatio
    var aspectRatio = 1; //w/h
    var sideH = Math.min(w * aspectRatio, h);
    var sideW = Math.min(w, h / aspectRatio);
    var side = Math.min(sideH, sideW);

    if (this.engine) {
        if (side > this.engine.render.options.width) {
            side = this.engine.render.options.width;
        }
    }

    /*If no space on the right, do not draw Evelina */
    if (this.evelina !== undefined && this.evelina !== null) {
        if ((this.side * 1.3) < w) {
            this.evelina.show();
        } else {
            this.evelina.hide();
        }
    }

    this.side = side;
    if (this.engine !== undefined && this.engine !== null) {
        this.engine.render.canvas.style.height = side + "px";
        this.engine.render.canvas.style.width = side + "px";
    }
};

Gamestate.prototype.beforeUpdate = function (event) {
    var engine = this.engine;
    var world = this.engine.world;
    var gravity = world.gravity;

    for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].ai();
    }

    var myBodies = Matter.Composite.allBodies(world);
    if (!this.lastTimestamp) {
        this.lastTimestamp = 0;
    }
    for (var i = 0; i < myBodies.length; i++) {
        var body = myBodies[i];
        if (typeof body.applyRopeGravity === "function" && body.onRopeGravity > 0) {
            //Apply my custom function for any objects currently on rope
            body.applyRopeGravity(event.timestamp - this.lastTimestamp,
                    gravity.x * gravity.scale,
                    gravity.y * gravity.scale);
        }
    }
    this.tickNum++;
    thisTime = event.timestamp - this.lastTimestamp;
    if (thisTime < 500) {
        //limit
        this.simTime += event.timestamp - this.lastTimetamp;
    } else {
        this.simTime += 500;
    }

    this.bonusTick--;
    if (this.gravityChangeTicks) {
        this.gravityChangeTicks--;
    }
    if (this.gravityChangeTicks && this.gravityChangeTicks < 0) {
        this.setNormalGravity();
    }
    if (this.bonusTick < 0) {
        this.newBonus();
    }
    if (this.bonuses && Array.isArray(this.bonuses)) {
        for (var i = 0; i < this.bonuses.length; i++) {
            if (this.bonuses[i].ttl-- < 0) {
                //bonus expired
                Matter.World.remove(this.engine.world, this.bonuses[i].body);
            }
        }
    }

    this.lastTimestamp = event.timestamp;


};


Gamestate.prototype.afterUpdate = function () {
    for (var i = 0; i < this.balls.length; i++) {
        if (!this.balls[i].checkBoundaries(this.engine.world)) {
            return;
        }
    }

    this.tickNum++;
    if (this.tickNum % 2 === 0) {
        this.evelina.update();
    }

    this.showScore();
    this.runner.deltaMax = 1000;//fixed bug in Matter (after restart former time was used and biiiig tick was rendered)
};

Gamestate.prototype.playerInput = function () {
    this.player.controlled = true;
    this.player.toggleHook();
};

Gamestate.prototype.collisionActive = function (event) {
    // change object colours to show those in an active collision (e.g. resting contact)
    for (var i = 0; i < event.pairs.length; i++) {

        var pair = event.pairs[i];


        if (pair.bodyA.parentBall !== undefined && pair.bodyB.parentBall !== undefined) {
            //collision between two balls
            var depth = pair.collision.depth ? pair.collision.depth : 0.00000001;

            //cannot use Hook for some time
            pair.bodyA.parentBall.bump(depth);
            pair.bodyB.parentBall.bump(depth);

            //todo: if one of them player, bump Evelina
        }

    }
};

Gamestate.prototype.collisionStart = function (event) {
    // change object colours to show those in an active collision (e.g. resting contact)
    for (var i = 0; i < event.pairs.length; i++) {

        var pair = event.pairs[i];

        //Bonus collision
        var bonusBody = null;
        var ballBody = null;
        if (pair.bodyA.parentBall !== undefined && pair.bodyB.pObject && pair.bodyB.pObject.type === "Bonus") {
            bonusBody = pair.bodyB;
            ballBody = pair.bodyA;
        }
        if (pair.bodyB.parentBall !== undefined && pair.bodyA.pObject && pair.bodyA.pObject.type === "Bonus") {
            bonusBody = pair.bodyA;
            ballBody = pair.bodyB;
        }
        if (ballBody !== null && bonusBody !== null) {
            //remove bonus
            //todo: splice it from bonuses array
            Matter.Pair.setActive(pair, false);
            Matter.World.remove(this.engine.world, bonusBody);
            bonusBody.pObject.ttl = 0; //remove bonus next frame

            bonusBody.pObject.eaten(ballBody.pObject, this);

        }
    }
};

/**
 * Returns current score
 * @returns {Number}
 */
Gamestate.prototype.getScore = function () {
    //    return this._scoreNoTime + ((new Date() - this.startTime) / 100);
    return this._scoreNoTime + ((this.tickNum) / 6);
};

Gamestate.prototype.showScore = function () {
    var html = "";
    html += "Skóre: <span id=\"score\">";
    html += (Math.round(this.getScore()));
    html += "</span>, &#9829;<span id=\"lives\">";
    html += (this.player.lives >= 0) ? this.player.lives : 0;
    html += "</span>";
    document.getElementById("statusBar").innerHTML = html;
};

Gamestate.prototype.gameOverSignal = function () {
    Matter.Runner.stop(this.runner);
    Matter.Events.off(this.engine);
    this.engine.render.canvas.parentElement.removeChild(this.engine.render.canvas);
    Matter.Engine.clear(this.engine);

    this.evelina.happiness += 0.6;
    this.evelina.update();

    this.gameOver = true;
    this.overlay.showEndScreen(this);

    if (ga) {
        ga('set', {page: '/end/' + Math.round(this.getScore()), title: "Game ended"});
        ga('send', 'pageview');
    }
};

/**
 * Ball was killed
 * @param {string} id - id of the Ball
 * @returns {undefined}
 */
Gamestate.prototype.ballKilledSignal = function (id) {
    if (id !== 0) {
        this.evelina.happiness += 0.5;
        this._scoreNoTime += 1000;
    } else {
        //todo:makeSad and makeHappy functions of Evelina
        //player was killed
        this.setNormalGravity();
        this.evelina.happiness -= 0.5;
    }
};

Gamestate.prototype.restart = function (evt) {
    //destroy everything that is mine
    if (this.engine !== null) {
        //this.engine.render.canvas.parentElement.removeChild(this.engine.render.canvas);
        Matter.Engine.clear(this.engine);
    }
    this.overlay.hide();

    this.resize();

    // create a Matter.js engine
    this.engine = Matter.Engine.create({
        render: {
            element: document.getElementById('gameArea'),
            controller: Matter.Render,
            options: {
                width: 512, /* this.side*/
                height: 512
            }
        },
        timing: {
            timeScale: 0.5
        }
    });

    //renew
    this.pylons = [];
    this.balls = [];


    document.body.onkeyup = function (e) {
        if (e.keyCode === 32) {
            this.playerInput();
        }
    }.bind(this);

    //Creating game area
    this.pylons.push(new Pylon(this.engine, 0.25, 0.33, 0));
    this.pylons.push(new Pylon(this.engine, 0.5, 0.33, 0));
    this.pylons.push(new Pylon(this.engine, 0.75, 0.33, 0));
    this.pylons.push(new Pylon(this.engine, 0.25, 0.66, 0));
    this.pylons.push(new Pylon(this.engine, 0.5, 0.66, 0));
    this.pylons.push(new Pylon(this.engine, 0.75, 0.66, 0));


    /**
     * Main character of the game
     * (player is also in this.balls array)
     * @type{Ball}
     */
    this.player = new Ball(this.engine, 0.1, 0, 0.05, {"normal": "gfx/player.png", "bump": "gfx/player_bump.png"}, 0);
    this.player.gamestate = this;
    this.player.type = "Player";
    this.balls.push(this.player);

    //Creating enemies
    var enemy1 = new Ball(this.engine, 0.8, 0, 0.05, "", 1);
    var enemy2 = new Ball(this.engine, 0.4, 0, 0.05, "", 1);
    enemy1.gamestate = this;
    enemy2.gamestate = this;
    this.balls.push(enemy1);
    this.balls.push(enemy2);


    // add all of the bodies to the world
    for (var i = 0; i < this.pylons.length; i++) {
        Matter.World.add(this.engine.world, this.pylons[i].body);
        if (i === this.pylons.length - 1) {
            Matter.World.add(this.engine.world, this.pylons[i].gIndicator);
            Matter.World.add(this.engine.world, this.pylons[i].gIndicatorRope);
        }
    }
    this.engine.world.gravity.scale = 0.0005;

    this.gameOver = false;

    var renderOptions = this.engine.render.options;
    renderOptions.wireframes = false;
    renderOptions.showAngleIndicator = false;


    Matter.Events.on(this.engine, "beforeUpdate", this.beforeUpdate.bind(this));
    Matter.Events.on(this.engine, "collisionStart", this.collisionStart.bind(this));
    Matter.Events.on(this.engine, "collisionActive", this.collisionActive.bind(this));
    Matter.Events.on(this.engine, "afterUpdate", this.afterUpdate.bind(this));



    this._scoreNoTime = 0;
    this.startTime = new Date();
    this.player.lives = 3;

    this.setNormalGravity();

    this.showScore();
    this.evelina = new Evelina(document.getElementById('evelina'));
    this.resize();
    //Update evelina when we have resources
    setTimeout(this.evelina.update.bind(this.evelina), 1);
    setTimeout(this.evelina.update.bind(this.evelina), 1000);
    setTimeout(this.evelina.update.bind(this.evelina), 5000);

    this.runner = Matter.Runner.create({isFixed: false, deltaMin: 1, deltaMax: 16});
    Matter.Runner.tick(this.runner, this.engine, 0);

};


Gamestate.prototype.start = function () {
    this.overlay.hide();
    this.startTime = new Date();
    Matter.Runner.run(this.runner, this.engine);

    if (ga) {
        ga('set', {page: '/start', title: "Game started"});
        ga('send', 'pageview');
    }
};


Gamestate.prototype.restartAndStart = function (evt) {

    if (evt && typeof evt.stopPropagation === "function") {
        evt.stopPropagation();
    }
    this.restart();
    this.start();
};


Gamestate.prototype.random = function () {
    var x = Math.sin(this.randomSeed++) * 10000;
    return x - Math.floor(x);
};

Gamestate.prototype.newBonus = function () {
    var bonus = new Bonus(this.engine, this.random(), this.random(), this.random());
    Matter.World.add(this.engine.world, bonus.body);
    //set bonus hide 
    bonus.ttl = 200 + 250 * this.random();

    this.bonusTick = 500 * this.random();
    this.bonuses.push(bonus);
};

Gamestate.prototype.changeGravity = function () {
    var x = Math.random();
    var y = 1 - x;

    this.engine.world.gravity.x = x*1.2;
    this.engine.world.gravity.y = y*1.2;

    this.gravityChangeTicks = 1000;
    //changeGravity
};

Gamestate.prototype.setNormalGravity = function () {
    this.engine.world.gravity.x = 0;
    this.engine.world.gravity.y = 1;

    this.gravityChangeTicks = null;
    //changeGravity
};
