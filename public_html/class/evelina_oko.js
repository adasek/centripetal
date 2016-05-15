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
 */
var Evelina_oko = function (canvas, x, y) {

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.xR = x;
    this.yR = y;

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
    this.blinkAnim = 0;

};

Evelina_oko.prototype.loadImage = function (name) {
    this.images[name] = new Image();
    this.images[name].src = "gfx/evelina/" + name + ".png";
};

/**
 * Updates animation and redraw
 */
Evelina_oko.prototype.update = function (timeDiff, coeff, baseX, baseY) {

    this.frameNr++;


    if (this.blinkAnim > 0) {
        this.drawPart('oko_blink' + this.blinkAnim, baseX, baseY, coeff);
        this.blinkAnim = (this.blinkAnim + 1) % 9;
    } else {
        this.drawPart('oko', baseX, baseY, coeff);
    }

};

/**
 * Start blinking animation with this eye
 * @returns {undefined}
 */
Evelina_oko.prototype.blink = function () {
    this.blinkAnim = 1;
};

/**
 * Draw myself
 * @param {type} name
 * @param {type} centerX
 * @param {type} centerY
 * @param {type} coeff
 * @returns {undefined}
 */
Evelina_oko.prototype.drawPart = function (name, baseX, baseY, coeff) {
    var xpos = this.canvas.width * (baseX + this.xR);
    var ypos = this.canvas.height * (baseY + this.yR);


    if (this.images[name].complete) {
        var cWi = this.images[name].width;
        var cHe = this.images[name].height;
        cWi *= coeff;
        cHe *= coeff;
        this.ctx.drawImage(this.images[name], 0, 0, this.images[name].width, this.images[name].height, Math.round(xpos - cWi / 2), Math.round(ypos - cHe / 2), cWi, cHe);
    }
};

