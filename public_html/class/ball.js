/*
 * @copyright Adam Benda, 2016
 */

/* global DisplayObject */

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

    this.body.render.sprite.texture = "gfx/ball_" + r + ".png";


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


        if (this.onRopeGravity === 1) {
            var gravityVector = Matter.Vector.create(gx, gy);
            /*
             * gravityVector supports our movement if
             * it is in half plain defined by line with norm=this.velocity
             * and point this.velocity
             * ax+by+c=0 with (0,0) present in the line
             * ax+by<>0 defines half-plains, a = -this.velocity.y, b=this.velocity.x
             * <=> signum a*gravity.x+b*gravity.y === signum a*this.velocity.x+b*this.velocity.y  
             */
            var a = -this.velocity.y;
            var b = this.velocity.x;
            if (Math.sign(a * gx + b * gy) === Math.sign(a * this.velocity.x + b * this.velocity.y)) {
                //gravitational vector is supporting our current velocity
                this.force.y += gx * this.mass;
                this.force.x += gy * this.mass;
            } else {
                console.log("g=" + gravityVector.x + " " + gravityVector.y);
                console.log("v=" + this.velocity.x + " " + this.velocity.y);
                console.log(Matter.Vector.angle(gravityVector, this.velocity));
                //gravity shall not boost us any more
                this.onRopeGravity = 2;
            }
        }
    };

};