/*
 * @copyright Adam Benda, 2016
 */

/**
 * @class
 * @classdesc Responsible for rendering game state into viewport (canvas#game_area)
 * Also maintains Graphical hierarchy tree
 * @returns {Display}
 */
var Display = function () {

    /**
     * Array of everything on screen
     */
    this.displayObjects = [];

    /*
     * Fixed width/height
     */
    this.aspectRatio = 1;

    /* */
    this.canvas = document.getElementById("gameArea");


    this.resize();


};


Display.prototype.resize = function () {
    var borderSize = getComputedStyle(document.getElementById('gameArea'), null).getPropertyValue('border-left-width').replace("px", "");
    this.canvas.width = window.innerWidth - 2 * borderSize;
    this.canvas.height = window.innerHeight - 2 * borderSize;

    if (this.canvas.width > this.canvas.height / this.aspectRatio) {
        this.canvas.width = Math.round(this.canvas.height / this.aspectRatio);
    }

    if (this.canvas.height > this.canvas.width * this.aspectRatio) {
        this.canvas.height = Math.round(this.canvas.width * this.aspectRatio);
    }



};

Display.prototype.render = function () {
    for (var i = 0; i < this.displayObjects.length; i++) {
        this.displayObjects[i].render(this.canvas);
    }

};