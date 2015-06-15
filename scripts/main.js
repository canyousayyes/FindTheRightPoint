/*jslint browser, devel, this, for */
/*global window, SVG */
(function () {
    'use strict';

    // Declare FindTheRightPoint namespace
    var FTRP = {};

    // Point Class
    FTRP.Point = function (x, y) {
        this.x = x || 0;
        this.y = y || 0;
    };

    // Ring Class
    FTRP.Ring = function (container, sectors, outerRadius, innerRadius, rotation) {
        // Create a svg group inside the container, don't draw directly in the container
        this.svg = container.group();
        // sectors is an array of objects with angle and color
        this.sectors = sectors || [];
        this.outerRadius = outerRadius || 0;
        this.innerRadius = innerRadius || 0;
        this.rotation = rotation || 0;
        // Draw the ring
        this.draw();
    };

    FTRP.Ring.prototype.getNormalizedRadian = function (value, sum) {
        return Math.PI * 2 * value / sum;
    };

    FTRP.Ring.prototype.draw = function () {
        var self = this, sum = 0, startRadian = 0, endRadian = 0;
        this.sectors.forEach(function (sector) {
            sum += sector.value;
        });
        this.sectors.forEach(function (sector) {
            var x1, y1, x2, y2, d;
            endRadian = startRadian + self.getNormalizedRadian(sector.value, sum);

            // Calculate start point
            x1 = Math.round(self.outerRadius * Math.cos(startRadian));
            y1 = Math.round(self.outerRadius * Math.sin(startRadian));

            // Calculate end point
            x2 = Math.round(self.outerRadius * Math.cos(endRadian));
            y2 = Math.round(self.outerRadius * Math.sin(endRadian));

            // Construct path string
            d = 'M0,0 L' + x1 + ',' + y1 + ' A' + self.outerRadius + ',' + self.outerRadius + ' 0 ' + 
                ((endRadian - startRadian > Math.PI) ? 1 : 0) + ',1 ' + x2 + ',' + y2 + ' z';

            console.log(startRadian, endRadian, x1, x2, y1, y2, d);

            // Draw sector
            self.svg.path(d).fill(sector.color);

            // Update for next iteration
            startRadian = endRadian;
        });
    };

    // Game Class
    FTRP.Game = function () {
        this.svgMain = null;
        this.svgRing = null;
    };

    FTRP.Game.prototype.init = function (id) {
        this.svgMain = new SVG(id).size('100%', '100%');
        this.svgRing = this.svgMain.group();

        //debug
        window.a = new FTRP.Ring(this.svgRing, [{value: 30, color: '#ff0000'}, {value: 50, color: '#00ff00'}], 100, 30, 0);
    };

    // Create game instance and start
    window.game = new FTRP.Game();
    window.addEventListener('load', function () {
        window.game.init('game');
    });
}());
