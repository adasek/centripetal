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
var Ball = function (x, y, r) {
    this.body = Matter.Bodies.circle(x, y, r);
    this.body.frictionAir = 0;
    this.body.friction = 0;
    this.body.force.x = 0;
    this.body.force.y = 0.1;

    this.body.render.sprite.texture = "gfx/ball_" + r + ".png";
    //passing this for texture changing
    this.body.r = r;

    /**
     * Disable effect of ordinary gravity and apply my special rope gravity
     * @param {number} gx - gravity x part (world.gravity.x * gravity.scale)
     * @param {number} gy - gravity y part
     * @returns {undefined}
     */
    this.body.applyRopeGravity = function (gx, gy) {
        //this is Ball.body

        if (this.onRopeGravity > 0) {
            //negating effect of _bodiesApplyGravity
            this.force.x -= gx * this.mass;
            this.force.y -= gy * this.mass;
        }
        this.velocity.x = this.aVel.x;
        this.velocity.y = this.aVel.y;
    };

};

Ball.prototype.toggleHook = function (world) {


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
        this.body.aVel = Matter.Vector.create(this.body.velocity.x, this.body.velocity.y);
        this.hooked = true;
    } else {
        Matter.World.remove(world, this.rope);
        this.body.onRopeGravity = 0;
        this.hooked = false;
    }

};