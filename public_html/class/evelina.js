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
    this.loadImage("ruka");
    this.loadImage("rukaR");

    this.okoL = new Evelina_oko(canvas, 0.11, 0.0045);
    this.okoR = new Evelina_oko(canvas, -0.11, 0.0045);

    this.frameNr = 0;

    /**
     * Happiness of Evelina from -1(sad) to 1(extalted)
     * @type {number}
     */
    this.happiness = 0;

    this.blinkTimer = 0;
    this.blinkRand = Math.random();

    /**
     * shrink coefficient
     * @type {number}
     */
    this.coeff = 0.5;

    /**
     * Render Evelina?
     * @type {Boolean}
     */
    this.render = true;

    this.type = "Evelina";

};

Evelina.prototype.loadImage = function (name) {
    this.images[name] = new Image();
    this.images[name].src = "gfx/evelina/" + name + ".png";
};

Evelina.prototype.show = function () {
    this.render = true;
};

Evelina.prototype.hide = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.render = false;
};

/**
 * Updates animation and redraw
 */
Evelina.prototype.update = function () {
    if (!this.render) {
        return;
    }

    if (this.frameNr % 50 === 0) {
        this.okoLBlink = 1;
        this.happiness += Math.random() % 0.4 - 0.18;
        if (this.happiness > 0.8) {
            this.happiness = 0.8;
        }
        if (this.happiness < -1) {
            this.happiness = -1;
        }
    }

    //compute timeDiff = number of ms since last frame
    this.frameNr++;
    var currentTime = new Date();
    var timeDiff = currentTime - this.lastUpdate;

    //Determine times to blink
    //Determine if its time to blink
    var mean = 1000; //1s?
    var sigma = 300; //stddev
    var zValue = this.normalcdf(mean, sigma, this.blinkTimer);
    if (zValue > this.blinkRand) {
        this.okoL.blink();
        this.okoR.blink();
        this.blinkTimer = 0; //reset blinkTimer
        this.blinkRand = Math.random();
    } else {
        this.blinkTimer += timeDiff;
    }

    this.ctx.strokeStyle = "blue";
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.height * 0.49, 0, 2 * Math.PI);
    this.ctx.stroke();

    var bodyPos = this.bodyPos(currentTime);
    this.drawPart('telo', bodyPos.x, bodyPos.y);

    this.drawPart('hlava', 1 / 2, 1 / 8 + 0.005 * Math.sin(currentTime / 500));

    this.drawPart('botaL', 1 / 4 + 0.02 * Math.sin(currentTime / 713), 7 / 8 + 0.02 * Math.sin(currentTime / 1200));
    this.drawPart('botaR', 3 / 4 + 0.009 * Math.sin(currentTime / 713), 7 / 8);

    //left hand (on the right)
    this.drawPart('ruka', 0.91 + 0.01 * Math.sin(currentTime / 1231), 0.1 + 0.01 * Math.sin(currentTime / 772), Math.PI + 0.01 * Math.sin(currentTime / 122));
    //right hand
    this.drawPart('rukaR', 0.08 + 0.01 * Math.sin(currentTime / 1347), 0.2 + 0.01 * Math.sin(currentTime / 1007), 0.01 * Math.sin(currentTime / 122));

    this.okoL.update(timeDiff, this.coeff, 1 / 2, 1 / 8 + 0.005 * Math.sin(currentTime / 500));
    this.okoR.update(timeDiff, this.coeff, 1 / 2, 1 / 8 + 0.005 * Math.sin(currentTime / 500));


    this.drawMouth(1 / 2, 0.195 + 0.005 * Math.sin(currentTime / 500));

    this.lastUpdate = currentTime;
};


Evelina.prototype.drawPart = function (name, centerX, centerY, rotation) {
    centerX = this.canvas.width * centerX;
    centerY = this.canvas.height * centerY;
    if (rotation === undefined) {
        rotation = 0;
    }


    if (this.images[name].complete) {
        var cWi = this.images[name].width;
        var cHe = this.images[name].height;
        cWi *= this.coeff;
        cHe *= this.coeff;


        if (rotation !== 0) {
            //rotate context first
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(rotation);
            this.ctx.translate(-centerX, -centerY);
        }

        if (!this.images[name].cache) {
            this.images[name].cache = document.createElement('canvas');
            this.images[name].cache.width = cWi;
            this.images[name].cache.height = cHe;
            var nCtx = this.images[name].cache.getContext('2d');
            nCtx.drawImage(this.images[name], 0, 0, this.images[name].width, this.images[name].height, 0, 0, cWi, cHe);
        }

        //this.ctx.drawImage(this.images[name].cache, 0, 0, cWi, cHe, (centerX - cWi / 2), (centerY - cHe / 2), cWi, cHe);
        this.ctx.drawImage(this.images[name].cache, (centerX - cWi / 2), (centerY - cHe / 2));


        if (rotation !== 0) {
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(-rotation);
            this.ctx.translate(-centerX, -centerY);
        }
    }
};

/**
 * Repetetive movement
 * @param {Date} currentTime
 * @returns {undefined}
 */
Evelina.prototype.bodyPos = function (currentTime) {
    var ret = {};
    ret.x = 1 / 2 + 0.01 * (Math.sin(currentTime / 1000));
    ret.y = 0.50 + 0.01 * (Math.cos(currentTime / 5000));
    return ret;
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


/**
 * Probablity that in x miliseconds blink was performed (CDF of normal distribution)
 * @param {number} mean
 * @param {number} sigma
 * @param {number} x
 * @returns {undefined}
 */
Evelina.prototype.normalcdf = function (mean, sigma, x)
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
