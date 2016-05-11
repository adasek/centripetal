/*
 * @copyright Adam Benda, 2016
 */

/**
 * @class
 * @classdesc Ball
 */

/**
 * 
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate 
 * @param {number} r - radius
 * @returns {Ball}
 */
var Ball = function (world, x, y, r) {
    this.world = world;
    this.initX = x;
    this.initY = y;
    this.initR = r;
    this.createBody(x, y, r);
    Matter.Composite.add(this.world, this.body);


};

Ball.prototype.toggleHook = function () {
    var world = this.world;

    if (!this.hooked) {
        //find a nearest
        //todo: to a separate function
        var target = null;
        var shortestDistance = 99999999;
        for (var i = 0; i < world.bodies.length; i++) {
            var body = world.bodies[i];
            if (body.isStatic) {
                var thisDistance = Matter.Vector.magnitudeSquared(
                        Matter.Vector.sub(body.position, this.body.position)
                        );
                if (shortestDistance > thisDistance) {
                    shortestDistance = thisDistance;
                    target = body;
                }
            }
        }

        if (target === "null") {
            //no target available
            return;
        }

        this.rope = Matter.Constraint.create({bodyA: this.body, bodyB: target});
        this.body.onRopeGravity = 1;
        Matter.World.add(world, this.rope);
        this.hooked = true;
    } else {
        Matter.World.remove(world, this.rope);
        this.body.onRopeGravity = 0;
        this.hooked = false;
    }

};

Ball.prototype.checkBoundaries = function (engine) {
    if (this.hooked) {
        //if we are hooked up its ok
        return true;
    }

    if (
            engine.render.bounds.max.y < this.body.position.y - this.body.r ||
            engine.render.bounds.min.x > this.body.position.x + this.body.r ||
            engine.render.bounds.max.x < this.body.position.x - this.body.r
            ) {
        this.killed();
    }
};

Ball.prototype.killed = function () {
    //unhook
    if (this.hooked) {
        this.toogleHook(this.world);
    }

    Matter.Composite.remove(this.world, this.body);
    this.createBody(this.initX, this.initY, this.initR);
    Matter.Composite.add(this.world, this.body);
};

Ball.prototype.createBody = function (x, y, r) {
    this.body = Matter.Bodies.circle(x, y, r);
    this.body.force.x = 0;
    this.body.force.y = 0.1;
    this.body.frictionAir = 0;
    this.body.friction = 0;
    Matter.Body.setMass(this.body, 5);
    this.body.render.sprite.texture = "gfx/ball_" + r + ".png";
    //passing this for texture changing
    this.body.r = r;
    this.body.parentBall = this;


    /**
     * Disable effect of ordinary gravity and apply my special rope gravity
     * @param {number} timestamp - in ms
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
            var addForce = timeDiff / (50 * this.parentBall.rope.length);
            //smaller bound -> faster

            //add force in the direction of our move
            var nVel = Matter.Vector.normalise(this.velocity);
            this.force.x += nVel.x * addForce;
            this.force.y += nVel.y * addForce;
        }

    };
};