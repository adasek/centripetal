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
 * @param {number} relW - width relative to parent (0..1) ... value -1 => const from aspectRatio
 * @param {number} relH - height relative to parent (0..1) ... value -1 => const from aspectRatio
 * @param {number} relX - x of center in parent relative coordinates (0..1)
 * @param {number} relY - y of center in parent relative coordinates (0..1)
 * @returns {Ball}
 */
var Ball = function (relW, relH, relX, relY) {
    DisplayObject.call(this, relW, relH, relX, relY);

    //object specific
    this.texture.src = "gfx/ball.png";

};
Ball.prototype = Object.create(DisplayObject.prototype);
