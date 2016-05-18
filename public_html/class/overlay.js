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
    html += "<p>S každými 2.000 odeslaných dotazníků čeká Evelínu nová výzva.</p>";
    html += "<ul>";
    html += "<li class=\"unfinished\">&nbsp;4.000  kolomaz</li>";
    html += "<li class=\"unfinished\">&nbsp;6.000  veletoč</li>";
    html += "<li class=\"unfinished\">&nbsp;8.000  rotační fokus</li>";
    html += "<li class=\"unfinished\">10.000  cyklický přenos</li>";
    html += "<li class=\"unfinished\">12.000  dostředivá pomsta</li>";
    html += "<li class=\"unfinished\">14.000  oběžná zvůle</li>";
    html += "<li class=\"unfinished\">16.000  centrální přetížení</li>";
    html += "<li class=\"unfinished\">18.000  smrtící tečna</li>";
    html += "<li class=\"unfinished\">20.000  kataklyzmatická orbitální jízda</li>";
    html += "</ul>";


    this.show(html);

    document.getElementById('againA').onclick = gamestate.restartAndStart.bind(gamestate);
};


Overlay.prototype.showBeginScreen = function (gamestate) {
    var html = "";
    html += "<h1>Rotarium</h1>";
    html += "<h2>Evelína v jednom kole</h2>";
    html += "<p>Ovládání: <em>kliknutí nebo mezerník</em></p>";
    html += "<a id=\"enterGameA\">Hrát!</a>";
    this.show(html);

    document.getElementById('enterGameA').onclick = gamestate.start.bind(gamestate);
};