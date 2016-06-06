/*
 * @copyright Adam Benda, 2016
 */


/**
 * @class
 * @classdesc Bonus with some images
 */

/**
 * 
 * @param {Matter.Engine} engine
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate 
 * @returns {Ball}
 */
var Bonus = function (engine, x, y) {
    this.type = "Bonus";
    this.engine = engine;
    this.body = Matter.Bodies.rectangle(engine.render.options.width * x, engine.render.options.height * y, 30, 30);
    this.body.pObject = this;
    Matter.Body.setStatic(this.body, true);
    this.body.collisionFilter.mask = 1;

    this.body.render.fillStyle = "#aaaaaa";
    this.body.render.strokeStyle = "#aaaaaa";
    
    this.body.render.sprite.texture = "gfx/bonus/book.png";

};