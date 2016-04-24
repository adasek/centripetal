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

};
