/*
 * @copyright Adam Benda, 2016
 */


/**
 * @class
 * @classdesc Static box that can be connected with Ball via rope
 */

/**
 * 
 * @param {Matter.Engine} engine
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate 
 * @returns {Ball}
 */
var Pylon = function (engine, x, y) {
    this.engine = engine;
    this.body = Matter.Bodies.rectangle(engine.render.options.width * x, engine.render.options.height * y, 10, 10);
    Matter.Body.setStatic(this.body, true);
    this.body.collisionFilter.mask = 2;

};