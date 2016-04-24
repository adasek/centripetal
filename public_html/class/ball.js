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

    this.body.render.sprite.texture = "gfx/ball_" + r + ".png";

    this.body.applyRopeGravity = function (gx, gy) {
        //this is Ball.body
        //we got our velocity boost already
        console.log("g="+gx+","+gy);
        console.log("v="+this.velocity.x+","+this.velocity.y);
        
        if (this.onRopeGravity === 1) {
            var gravityVector = Matter.Vector.create(gx, gy);
            var velocityVector = Matter.Vector.create(this.velocity.x, this.velocity.y);
            if (Matter.Vector.dot(gravityVector, velocityVector) > 0 ) {
                //gravitational vector is supporting our current velocity
                this.force.y += gx;
                this.force.x += gy;
            } else {
                //gravity shall not boost us any more
                this.onRopeGravity = 2;
            }
        }
    };

};