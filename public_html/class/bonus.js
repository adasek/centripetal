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
 * @param {number} randomNumber - number from 0..1
 * @returns {Ball}
 */
var Bonus = function (engine, x, y, randomNumber) {
    this.type = "Bonus";
    this.engine = engine;
    this.body = Matter.Bodies.rectangle(engine.render.options.width * x, engine.render.options.height * y, 30, 30);
    this.body.pObject = this;
    Matter.Body.setStatic(this.body, true);
    this.body.collisionFilter.mask = 1;

    this.body.render.fillStyle = "#aaaaaa";
    this.body.render.strokeStyle = "#aaaaaa";


    //Bonus texture
    var randIndex = Math.floor(randomNumber * this.textures.length);
    this.body.render.sprite.texture = "gfx/bonus/" + this.textures[randIndex % this.textures.length] + ".png";

    if (randIndex === 0) {
        //special: gravity changer
        this.eaten = function (ball, gamestate) {
            gamestate.changeGravity();
        }.bind(this);
    } else {
        //ordinary bonus = eat and get score
        this.eaten = function (ball, gamestate) {
            if (ball.type === "Player") {
                gamestate._scoreNoTime += 1000;
            }
        }.bind(this);
    }

};

Bonus.prototype.textures = ["circular", "book", "music", "pen", "phone", "pizza", "tea"];