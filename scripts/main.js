/*jslint browser, devel, this, for */
/*global window, SVG */
(function () {
    'use strict';

    // Declare FindTheRightPoint namespace
    var FTRP = {};

    // Ring Class
    FTRP.Ring = function (container, sectors, outerRadius, innerRadius, rotation) {
        // Create a svg group inside the container, don't draw directly in the container
        this.svgSector = container.group();
        this.svgInnerCircle = container.group();
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
        // Draw sectors
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
            self.svgSector.path(d).fill(sector.color);

            // Update for next iteration
            startRadian = endRadian;
        });

        // Apply rotation on sectors
        //this.svgSector.rotate(this.rotation);

        // Draw inner circle
        if (this.innerRadius > 0) {
            this.svgInnerCircle.circle(this.innerRadius * 2).fill('#191919').center(0, 0);
        }
    };

    // Game Class
    FTRP.Game = function () {
        this.svgMain = null;
        this.svgRing = null;
        this.center = null;
        this.ring = null;
    };

    FTRP.Game.prototype.init = function (id) {
        var rbox;
        this.svgMain = new SVG(id).size('100%', '100%');
        this.svgRing = this.svgMain.group();

        // Assign center value
        rbox = this.svgMain.rbox();
        this.center = {x: Math.round(rbox.width / 2), y: Math.round(rbox.height / 2)};
        this.svgRing.center(this.center.x, this.center.y);

        //debug
        this.ring = new FTRP.Ring(this.svgRing, [{value: 30, color: '#ff0000'}, {value: 50, color: '#00ff00'}, {value: 100, color: '#0000ff'}], 100, 80, 30);
        this.svgRing.rotate(450);
    };

    // Create game instance and start
    window.game = new FTRP.Game();
    window.addEventListener('load', function () {
        window.game.init('game');
    });
}());
