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
var Pylon = function (engine, x, y, cnt) {
    this.type = "Pylon";
    this.engine = engine;
    this.body = Matter.Bodies.rectangle(engine.render.options.width * x, engine.render.options.height * y, 10, 10);
    Matter.Body.setStatic(this.body, true);
    this.body.pObject = this;
    this.body.collisionFilter.mask = 2;

    this.gIndicator = Matter.Bodies.circle(engine.render.options.width * x, engine.render.options.height * (y + 0.05), 3);
    this.gIndicator.collisionFilter.mask = 2;
    Matter.Body.setMass(this.gIndicator, 10000);
    this.gIndicator.frictionAir = 0.1;
    this.gIndicatorRope = Matter.Constraint.create({bodyA: this.body, bodyB: this.gIndicator, stiffness: 4});

    if ((Pylon.cnt++) % 2 === 0) {
        this.body.render.fillStyle = "#002d56";
        this.body.render.strokeStyle = "#002d56";
    } else {
        this.body.render.fillStyle = "#d59f0f";
        this.body.render.strokeStyle = "#d59f0f";
    }
};

Pylon.cnt = 0;