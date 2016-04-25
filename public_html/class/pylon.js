/*
 * @copyright Adam Benda, 2016
 */


/**
 * @class
 * @classdesc Static box that can be connected with Ball via rope
 */

/**
 * 
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate 
 * @param {number} r - radius
 * @returns {Ball}
 */
var Pylon = function (x, y) {
    this.body = Matter.Bodies.rectangle(x, y, 10, 10);
    Matter.Body.setStatic(this.body, true);
    this.body.collisionFilter.mask = 2;

};