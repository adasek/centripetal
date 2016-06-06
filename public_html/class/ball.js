/*
 * @copyright Adam Benda, 2016
 */

/**
 * @class
 * @classdesc Ball
 */

/**
 * 
 * @param {Matter.Engine} engine -
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate 
 * @param {number} r - radius
 * @param {string[]} textures - png image containing texture
 * @param {string} id - identifier of this ball. Player has id=0
 * @returns {Ball}
 */
var Ball = function (engine, x, y, r, textures, id) {
    this.id = id;
    this.engine = engine;
    this.world = engine.world;
    this.initX = x * this.engine.render.options.width;
    this.initY = y * this.engine.render.options.height;
    this.initR = r * this.engine.render.options.width;

    this.texture = null;
    this.textureBump = null;

    if (textures !== undefined && textures !== null && textures.normal && textures.bump) {
        //load texture
        this.textureImage = new Image();
        this.textureImageBump = new Image();

        function textureLoaded(tImage, type) {
            //this is ball
            var canvas = document.createElement('canvas');
            canvas.width = this.getWidth();
            canvas.height = this.getHeight();
            var ctx = canvas.getContext('2d');
            ctx.drawImage(tImage, 0, 0, tImage.width, tImage.height, 0, 0, this.getWidth(), this.getHeight());
            var imageDataURL = canvas.toDataURL();
            if (type === "normal") {
                this.texture = imageDataURL;
            } else if (type === "bump") {
                this.textureBump = imageDataURL;
            } else {
                throw "Unknown texture type";
            }
        }
        this.textureImage.onload = textureLoaded.bind(this, this.textureImage, "normal");
        this.textureImageBump.onload = textureLoaded.bind(this, this.textureImageBump, "bump");

        this.textureImage.src = textures.normal;
        this.textureImageBump.src = textures.bump;
    }

    this.createBody(
            this.initX,
            this.initY,
            this.initR
            );
    Matter.Composite.add(this.world, this.body);

    this.distracted = 0;
    this.controlled = false;

    this.timeHooked = new Date();
    this.timeUnhooked = new Date();




};

Ball.prototype.getWidth = function () {
    return this.initR * 2;
};

Ball.prototype.getHeight = function () {
    return this.initR * 2;
};

Ball.prototype.toggleHook = function () {
    var world = this.world;

    if (!this.hooked) {
        if (this.collisionState > 0) {
            return;
        }

        //find a nearest
        //todo: to a separate function
        var target = null;
        var shortestDistance = 99999999;
        for (var i = 0; i < world.bodies.length; i++) {
            var body = world.bodies[i];
            if (body.pObject && body.pObject.type === "Pylon") {

                //Check if current speed vector is compatible with
                //vector of rotation hooked to this body
                var centripetalVect = Matter.Vector.create(
                        body.position.x - this.body.position.x,
                        body.position.y - this.body.position.y
                        );
                var angle = Matter.Vector.dot(centripetalVect, this.body.velocity) /
                        (Matter.Vector.magnitude(centripetalVect) * Matter.Vector.magnitude(this.body.velocity));


                if ((Math.abs(angle) > 100 / Matter.Vector.magnitude(centripetalVect))) {
                    //not compatible vector
                    continue;
                }


                var thisDistance = Matter.Vector.magnitudeSquared(
                        Matter.Vector.sub(body.position, this.body.position)
                        );
                if (shortestDistance > thisDistance) {
                    shortestDistance = thisDistance;
                    target = body;
                }
            }
        }

        if (target === null) {
            //no target available
            return false;
        }

        this.rope = Matter.Constraint.create({bodyA: this.body, bodyB: target, stiffness: 4});
        this.body.onRopeGravity = 1;
        Matter.World.add(world, this.rope);
        //this.rope.render.strokeStyle = "#ff0000";
        this.hooked = true;
        this.timeHooked = new Date();
        return true;
    } else {
        Matter.World.remove(world, this.rope);

        this.body.onRopeGravity = 0;
        this.timeUnhooked = new Date();
        this.hooked = false;
    }

};

Ball.prototype.checkBoundaries = function () {
    if (this.hooked) {
        //if we are hooked up its ok
        return true;
    }

    if (
            this.engine.render.bounds.max.y < this.body.position.y - this.initR ||
            this.engine.render.bounds.min.x > this.body.position.x + this.initR ||
            this.engine.render.bounds.max.x < this.body.position.x - this.initR
            ) {
        return this.killed();

    }
    return true;
};

Ball.prototype.killed = function () {
    if (this.lives !== undefined) {
        this.lives--;
        if (this.lives <= 0) {
            this.gamestate.gameOverSignal();
            return false;
        }
    }

    //unhook
    if (this.hooked) {
        this.toggleHook(this.world);
    }

    Matter.Composite.remove(this.world, this.body);
    if (this.lives === undefined || this.lives >= 0) {
        this.createBody(this.initX, this.initY, this.initR);
        Matter.Composite.add(this.world, this.body);
    }
    this.gamestate.ballKilledSignal(this.id);
    return true;
};

Ball.prototype.createBody = function (x, y, r) {
    this.body = Matter.Bodies.circle(x, y, r);
    this.body.force.x = 0;
    this.body.force.y = 0.1;
    this.body.frictionAir = 0;
    this.body.friction = 0;
    Matter.Body.setAngularVelocity(this.body, 0.01);
    Matter.Body.setMass(this.body, 5);

    this.body.parentBall = this;
    //enemy color
    if (this.id > 0) {
        this.body.render.fillStyle = "#ff9999";
        this.body.render.strokeStyle = "#ff9999";
    } else {
        //player texture
        this.body.render.sprite.texture = this.texture;
    }

    //Reset collision state
    this.collisionState = 0; //if > 0 player cannot hook
    this.lastTick = new Date();

    /**
     * Disable effect of ordinary gravity and apply my special rope gravity
     * @param {number} timeDiff - in ms
     * @param {number} gx - gravity x part (world.gravity.x * gravity.scale)
     * @param {number} gy - gravity y part
     * @returns {undefined}
     */
    this.body.applyRopeGravity = function (timeDiff, gx, gy) {


        //this is Ball.body
        if (this.onRopeGravity > 0) {
            //negating effect of _bodiesApplyGravity
            this.force.x -= gx * this.mass;
            this.force.y -= gy * this.mass;
            var addForce = timeDiff / (10 * Math.pow(this.parentBall.rope.length, 1.6));
            //smaller bound -> faster

            //add force in the direction of our move
            var nVel = Matter.Vector.normalise(this.velocity);
            this.force.x += nVel.x * addForce;
            this.force.y += nVel.y * addForce;
        }

    };
};


/**
 * Violently destroy the hook = by collision with another object
 * This Ball has to be unhookable some time depending on current speed
 * @param {number} depth - epicness of bump
 * @returns {undefined}
 */
Ball.prototype.bump = function (depth) {
    if (this.hooked) {
        this.toggleHook();
    }
    this.collisionState += 500 * depth; //in miliseconds

    if (this.id > 0) {
        this.body.render.fillStyle = "#ff3333";
    } else {
        //player texture
        this.body.render.sprite.texture = this.textureBump;
    }
};

Ball.prototype.isBumped = function () {
    var ret = false;
    this.thisTick = new Date();
    if (this.collisionState > 0) {
        this.collisionState -= this.thisTick - this.lastTick;
        if (this.collisionState <= 0) {
            this.collisionState = 0;
        } else {
            ret = true;
        }
    }
    this.lastTick = this.thisTick;
    return ret;
};

/**
 * Control this ball if not controlled by a player
 * @returns {undefined}
 */
Ball.prototype.ai = function () {
    if (this.isBumped()) {
        if (this.id > 0) {
            this.body.render.fillStyle = "#ff3333";
        } else {
            //player texture 
            if (this.textureBump !== null) {
                this.body.render.sprite.texture = this.textureBump;
            } else {
                this.body.render.fillStyle = "#33ff33";
            }
        }
    } else {
        if (this.id > 0) {
            this.body.render.fillStyle = "#ff9999";
        } else {
            //player texture
            if (this.texture !== null) {
                this.body.render.sprite.texture = this.texture;
            } else {
                this.body.render.fillStyle = "#99ff99";
            }
        }
    }

    if (this.controlled) {
        return;
    }

    //Basic "AI"
    if (this.hooked) {
        var q = new Date() - this.timeHooked;
        if (q > 1000) { //todo: vector not outside
            //unhook
            if (this.body.velocity.y < 0 && Math.abs(this.body.velocity.y) > Math.abs(this.body.velocity.x)) {
                this.toggleHook();
            }
        }
    } else {
        //try to hook 
        var q = new Date() - this.timeUnhooked;
        if (q > 500) {
            this.toggleHook();
        }
    }
};