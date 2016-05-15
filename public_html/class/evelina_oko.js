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

    /**
     * Blink timer starts as zero,
     * Gets increased during update function,
     * is base for normal probability function determining when to blink
     */
    this.blinkTimer = 0;
    this.blinkAnim = 0;
    this.blinkRand = Math.random();

};

Evelina_oko.prototype.loadImage = function (name) {
    this.images[name] = new Image();
    this.images[name].src = "gfx/evelina/" + name + ".png";
};

/**
 * Updates animation and redraw
 */
Evelina_oko.prototype.update = function (timeDiff, coeff) {
    //Determine if its time to blink
    var mean = 1000; //1s?
    var sigma = 300; //stddev
    var zValue = this.normalcdf(mean, sigma, this.blinkTimer);
    if (zValue > this.blinkRand) {
        console.log("blink");
        this.blinkAnim = 1; //set animation to start
        this.blinkTimer = 0; //reset blinkTimer
        this.blinkRand = Math.random();
    } else {
        this.blinkTimer += timeDiff;
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

/**
 * Probablity that in x miliseconds blink was performed (CDF of normal distribution)
 * @param {number} mean
 * @param {number} sigma
 * @param {number} x
 * @returns {undefined}
 */
Evelina_oko.prototype.normalcdf = function (mean, sigma, x)
{
    var z = (x - mean) / Math.sqrt(2 * sigma * sigma);
    var t = 1 / (1 + 0.3275911 * Math.abs(z));
    var a1 = 0.254829592;
    var a2 = -0.284496736;
    var a3 = 1.421413741;
    var a4 = -1.453152027;
    var a5 = 1.061405429;
    var erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
    var sign = 1;
    if (z < 0)
    {
        sign = -1;
    }
    return (1 / 2) * (1 + sign * erf);
};
