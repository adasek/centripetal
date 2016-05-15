/*
 * @copyright Adam Benda, 2016
 */


/**
 * @class
 * @classdesc Evelina animation
 */

/**
 * 
 * @param {HTMLCanvasElement} canvas
 * @returns {Ball}
 */
var Evelina = function (canvas) {
    canvas.width = 200;
    canvas.height = 500;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.lastUpdate = new Date();

    this.images = [];

    this.loadImage("botaL");
    this.loadImage("botaR");
    this.loadImage("hlava");
    this.loadImage("telo");

    this.okoL = new Evelina_oko(canvas, 6 / 16, 1 / 8);
    this.okoR = new Evelina_oko(canvas, 10 / 16, 1 / 8);

    this.frameNr = 0;

    /**
     * Happiness of Evelina from -1(sad) to 1(extalted)
     * @type {number}
     */
    this.happiness = 0;

    this.okoLBlink = 0;

    /**
     * shrink coefficient
     * @type {number}
     */
    this.coeff = 0.5;

};

Evelina.prototype.loadImage = function (name) {
    this.images[name] = new Image();
    this.images[name].src = "gfx/evelina/" + name + ".png";
};

/**
 * Updates animation and redraw
 */
Evelina.prototype.update = function () {
    if (this.frameNr % 50 === 0) {
        this.okoLBlink = 1;
        this.happiness += Math.random() % 0.4 - 0.18;
        if (this.happiness > 1) {
            this.happiness = 1;
        }
        if (this.happiness < -1) {
            this.happiness = -1;
        }
    }

    this.frameNr++;
    var currentTime = new Date();
    var timeDiff = currentTime - this.lastUpdate;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawPart('telo', 1 / 2, 1 / 2);
    this.drawPart('hlava', 1 / 2, 1 / 8);
    this.drawPart('botaL', 1 / 4, 7 / 8);
    this.drawPart('botaR', 3 / 4, 7 / 8);

    this.okoL.update(timeDiff, this.coeff);
    this.okoR.update(timeDiff, this.coeff);


    this.drawMouth(1 / 2, 0.195);

    this.lastUpdate = currentTime;
};


Evelina.prototype.drawPart = function (name, centerX, centerY) {
    centerX = this.canvas.width * centerX;
    centerY = this.canvas.height * centerY;


    if (this.images[name].complete) {
        var cWi = this.images[name].width;
        var cHe = this.images[name].height;
        cWi *= this.coeff;
        cHe *= this.coeff;
        this.ctx.drawImage(this.images[name], 0, 0, this.images[name].width, this.images[name].height, Math.round(centerX - cWi / 2), Math.round(centerY - cHe / 2), cWi, cHe);
    }
};


/**
 * Draw a mouth as bezier curve.
 * Mouth is shaped according to Eveline happiness level
 * @param {type} centerX
 * @param {type} centerY
 * @returns {undefined}
 */
Evelina.prototype.drawMouth = function (centerX, centerY) {
    centerX = this.canvas.width * centerX;
    centerY = this.canvas.height * centerY;


    this.ctx.beginPath();
    this.ctx.moveTo(centerX - (0.1 - Math.abs(this.happiness / 20)) * this.canvas.width, centerY);
    this.ctx.bezierCurveTo(
            centerX, centerY + (this.happiness / 100) * this.canvas.height,
            centerX, centerY + (this.happiness / 100) * this.canvas.height,
            centerX + (0.1 - Math.abs(this.happiness / 20)) * this.canvas.width, centerY
            );
    this.ctx.strokeStyle = "red";
    this.ctx.strokeStyle = 3;
    this.ctx.stroke();
    return;
};