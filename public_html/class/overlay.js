/*
 * @copyright Adam Benda, 2016
 */


/**
 * @class
 * @classdesc Overlay message: begin and end screen
 */

/**
 * 
 */
var Overlay = function () {
    /**
     * @type {HTMLDivElement}
     */
    this.screen = null;


};

Overlay.prototype.show = function (content) {
    document.getElementById('overlay').style.backgroundColor = 'rgba(0,0,0,0.3)';
    this.screen = document.createElement('div');
    this.screen.setAttribute('id', 'overlayText');
    this.screen.innerHTML = content;

    document.getElementById('overlay').appendChild(this.screen);
};

Overlay.prototype.hide = function () {
    document.getElementById('overlay').style.backgroundColor = 'transparent';
    if (this.screen !== null) {
        document.getElementById('overlay').removeChild(this.screen);
        this.screen = null;
    }
};

Overlay.prototype.showEndScreen = function (gamestate) {
    var html = "";
    html += "<p>Evelína pod tvým vedením získala <strong>" + (Math.round(gamestate.getScore())) + " bodů.</strong></p>";
    html += "<p><a href=\"javascript:shareScore()\" class=\"fb_share\"><span>Sdílet</span> <img src=\"FB-f-Logo__blue_29.png\" id=\"fb_logo\" alt=\"facebook\" ></a>";
    html += "</p>";

    html += "<a href=\"#\" id=\"againA\">Hrát znovu</a>";

    html += "<hr>";
    html += "<h2>Ohodnoť kurzy letního semestru a odemkni další level!</h2>";
    html += "<p><a href=\"https://cas.cuni.cz/cas/login?service=http%3A%2F%2Fhodnoceni.ff.cuni.cz%2F\" id=\"hodnotKurzy\">Hodnotit kurzy</a></p>"
    html += "<p>Evelínu čeká nová výzva dle <a href=\"http://www.ff.cuni.cz/studium/bakalarske-a-magisterske-studium/studentske-hodnoceni-vyuky/\">počtu vyplněných dotazníků</a>.</p>";
    html += "<ul>";
    html += "<li class=\"finished\">&nbsp;6.000 knihomolka</li>";
    html += "<li class=\"finished\">&nbsp;11.000 gravitační zlom</li>";
    html += "<li class=\"unfinished\">&nbsp;15.000 rotační fokus</li>";
    html += "<li class=\"unfinished\">18.000 fyzikální veletoč</li>";
    html += "<li class=\"unfinished\">19.000 záchytná zvůle</li>";
    html += "<li class=\"unfinished\">20.000 srdeční záležitost</li>";
    html += "<li class=\"unfinished\">21.000 centrální přetížení</li>";
    html += "</ul>";


    this.show(html);

    document.getElementById('againA').onclick = gamestate.restartAndStart.bind(gamestate);
};


Overlay.prototype.showBeginScreen = function (gamestate) {
    var html = "";
    html += "<h1>Rotarium</h1>";
    html += "<h2>Evelína v jednom kole</h2>";
    html += "<p>Ovládání: <em>kliknutí nebo mezerník</em></p>";
    html += "<p>Získávej body za přežití, vyřazení nepřátel a sbírání bonusů ";
    for (var i = 1; i < Bonus.prototype.textures.length; i++) {
        if (i > 1) {
            html += ",";
        }
        html += "<img src=\"gfx/bonus/" + Bonus.prototype.textures[i] + ".png\" class=\"bonusImage\">";
    }
    html += "</p>";
    html += "<p><img src=\"gfx/bonus/" + Bonus.prototype.textures[0] + ".png\" class=\"bonusImage\"> náhodně změní přitažlivost</p>"
    html += "<a id=\"enterGameA\">Hrát!</a>";
    this.show(html);

    document.getElementById('enterGameA').onclick = gamestate.start.bind(gamestate);
};
