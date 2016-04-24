/*
 * @copyright Adam Benda, 2016
 */

/**
 * @class
 * @classdesc Abstract class for Game object that would be present in scene
 */

/**
 * 
 * @param {number} relW - width relative to parent (0..1) ... value -1 => const from aspectRatio
 * @param {number} relH - height relative to parent (0..1) ... value -1 => const from aspectRatio
 * @param {number} relX - x of center in parent relative coordinates (0..1)
 * @param {number} relY - y of center in parent relative coordinates (0..1)
 * @returns {DisplayObject}
 */
var DisplayObject = function (relW, relH, relX, relY) {
    this.relW = relW;
    this.relH = relH;
    this.relX = relX;
    this.relY = relY;

    /**
     * Indicates wheter this object texture is loaded
     * @type Boolean
     * */
    this.textureLoaded = false;

    /**
     * @type Image
     */
    this.texture = new Image();
    this.texture.onload = function () {
        this.textureLoaded = true;
    }.bind(this);

    /*
     //object specific
     this.texture.src = "gfx/void.png"
     
     */


};

/**
 * 
 * @param {CanvasRenderingContext2D} ctx - canvas
 * @returns {undefined}
 */
DisplayObject.prototype.render = function (canvas) {
    //copy texture to canvas
    if (!this.textureLoaded) {
        return;
    }

    var ctx = canvas.getContext("2d");

    //get width and height of parent
    var pwidth = canvas.width;
    var pheight = canvas.height;
    var paspectRatio = pwidth / pheight;

    var aspectRatio = this.texture.width / this.texture.height;

    this.width = this.relW * pwidth;
    this.height = this.relH * pheight;
    this.x = this.relX * pwidth;
    this.y = this.relY * pheight;

    if (this.relW === -1 && this.relH === -1) {
        throw "relW and relH is empty";
    } else if (this.relW === -1) {
        this.width = this.height * aspectRatio;
    } else if (this.relH === -1) {
        this.height = this.width / aspectRatio;
    }
    ctx.drawImage(this.texture, 0, 0, this.texture.width, this.texture.height, this.x, this.y, this.width, this.height);

};