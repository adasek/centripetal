/*
 * @copyright Adam Benda, 2016
 */


/**
 * @class
 * @classdesc Evelina eye
 */

/**
 * 
 * @param {HTMLCanvasElement} canvas
 * @returns {Ball}
 */
var Evelina_oko = function (canvas, centerX, centerY) {

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.centerX = centerX;
    this.centerY = centerY;

    this.images = [];
    this.loadImage("oko");
    for (var i = 1; i < 9; i++) {
        this.loadImage("oko_blink" + i);
    }


    this.frameNr = 0;


    this.blinkAnim = 0;

};

Evelina_oko.prototype.loadImage = function (name) {
    this.images[name] = new Image();
    this.images[name].src = "gfx/evelina/" + name + ".png";
};

/**
 * Updates animation and redraw
 */
Evelina_oko.prototype.update = function (timeDiff, coeff) {
    if (this.frameNr % 70 === 0) {
        this.blinkAnim = 1;
    }

    this.frameNr++;


    if (this.blinkAnim > 0) {
        this.drawPart('oko_blink' + this.blinkAnim, this.centerX, this.centerY, coeff);
        this.blinkAnim = (this.blinkAnim + 1) % 9;
    } else {
        this.drawPart('oko', this.centerX, this.centerY, coeff);
    }

};


Evelina_oko.prototype.drawPart = function (name, centerX, centerY, coeff) {
    centerX = this.canvas.width * centerX;
    centerY = this.canvas.height * centerY;


    if (this.images[name].complete) {
        var cWi = this.images[name].width;
        var cHe = this.images[name].height;
        cWi *= coeff;
        cHe *= coeff;
        this.ctx.drawImage(this.images[name], 0, 0, this.images[name].width, this.images[name].height, Math.round(centerX - cWi / 2), Math.round(centerY - cHe / 2), cWi, cHe);
    }
};