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

    };

};