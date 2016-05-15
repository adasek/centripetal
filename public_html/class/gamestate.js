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

    // create a Matter.js engine
    this.engine = Matter.Engine.create({
        render: {
            element: document.getElementById('gameArea'),
            controller: Matter.Render,
            options: {
                width: 512,
                height: 512
            }
        },
        timing: {
            timeScale: 0.5
        }
    });

    /**
     * All Pylons on the map
     * @type {Pylon[]}
     */
    this.pylons = [];

    //Creating game area
    this.pylons.push(new Pylon(this.engine, 0.25, 0.33, 0));
    this.pylons.push(new Pylon(this.engine, 0.5, 0.33, 0));
    this.pylons.push(new Pylon(this.engine, 0.75, 0.33, 0));
    this.pylons.push(new Pylon(this.engine, 0.25, 0.66, 0));
    this.pylons.push(new Pylon(this.engine, 0.5, 0.66, 0));
    this.pylons.push(new Pylon(this.engine, 0.75, 0.66, 0));

    /**
     * All playing balls
     * @type {Ball}
     */
    this.balls = [];

    /**
     * Main character of the game
     * (player is also in this.balls array)
     * @type{Ball}
     */
    this.player = new Ball(this.engine, 0.1, 0, 0.05, "gfx/evelina.png");
    this.balls.push(this.player);

    //Creating enemies
    this.balls.push(new Ball(this.engine, 0.8, 0, 0.05));


    // add all of the bodies to the world
    for (var i = 0; i < this.pylons.length; i++) {
        Matter.World.add(this.engine.world, this.pylons[i].body);
    }

    this.engine.world.gravity.scale = 0.0005;


    var renderOptions = this.engine.render.options;
    renderOptions.wireframes = false;
    renderOptions.showAngleIndicator = false;


    Matter.Events.on(this.engine, "beforeUpdate", this.beforeUpdate.bind(this));
    Matter.Events.on(this.engine, "collisionActive", this.collisionActive.bind(this));
    Matter.Events.on(this.engine, "afterUpdate", this.afterUpdate.bind(this));


    var runner = Matter.Runner.create({isFixed: false, deltaMin: 1, deltaMax: 1000});
    //runner.isFixed=true;
    Matter.Runner.run(runner, this.engine);

    //Register input 
    document.getElementById('overlay').addEventListener("touch", this.playerInput.bind(this));
    document.getElementById('overlay').addEventListener("click", this.playerInput.bind(this));
    document.body.onkeyup = function (e) {
        if (e.keyCode === 32) {
            this.playerInput();
        }
    }.bind(this);


    //Evelina animation
    this.evelina = new Evelina(document.getElementById('evelina'));


};

Gamestate.prototype.resize = function () {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    //always fill screen with respecting aspectRatio
    var aspectRatio = 1; //w/h
    var sideH = Math.min(w * aspectRatio, h);
    var sideW = Math.min(w, h / aspectRatio);
    var side = Math.min(sideH, sideW);

    if (side > this.engine.render.options.width) {
        side = this.engine.render.options.width;
    }
    this.engine.render.canvas.style.height = side + "px";
    this.engine.render.canvas.style.width = side + "px";
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
    this.lastTimestamp = event.timestamp;
};


Gamestate.prototype.afterUpdate = function () {
    for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].checkBoundaries();
    }
    this.evelina.update();
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
            pair.bodyA.parentBall.destroyHook();
            pair.bodyB.parentBall.destroyHook();
            //todo: cannot use Hook for some time

            //todo: if one of them player, bump Evelina
        }
    }
};