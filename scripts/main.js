/*jslint browser, devel, this, for */
/*global window, SVG */
(function () {
    'use strict';

    // Declare FindTheRightPoint namespace
    var FTRP = {};

    // Ring Class
    FTRP.Ring = function (container, center, sectors, outerRadius, innerRadius, rotation) {
        // Create a svg group inside the container, don't draw directly inside
        this.svgRing = container.group();
        this.svgSector = this.svgRing.group();
        this.svgInnerCircle = this.svgRing.group();
        // sectors is an array of objects with angle and color
        this.center = center || {x: 0, y: 0};
        this.sectors = sectors || [];
        this.outerRadius = outerRadius || 0;
        this.innerRadius = innerRadius || 0;
        this.rotation = rotation || 0;
        // Draw the ring
        this.draw();
        this.move();
        this.rotate();
    };

    FTRP.Ring.prototype.move = function (center) {
        if (typeof center !== "undefined") {
            this.center = center;
        }
        this.updateTransform();
    };

    FTRP.Ring.prototype.rotate = function (rotation) {
        if (typeof rotation !== "undefined") {
            this.rotation = rotation;
        }
        this.updateTransform();
    };

    FTRP.Ring.prototype.updateTransform = function () {
        var transformString = "translate(" + this.center.x + "," + this.center.y + ") rotate(" + this.rotation + ",0,0)";
        this.svgRing.attr({transform: transformString});
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

        // Draw inner circle
        if (this.innerRadius > 0) {
            this.svgInnerCircle.circle(this.innerRadius * 2).fill('#191919').center(0, 0);
        }
    };

    // Game Class
    FTRP.Game = function () {
        this.svgMain = null;
        this.ring = null;
        this.pie = null;
        this.center = null;
    };

    FTRP.Game.prototype.init = function (id) {
        var rbox;
        this.svgMain = new SVG(id).size('100%', '100%');

        // Assign center value
        rbox = this.svgMain.rbox();
        this.center = {x: Math.round(rbox.width / 2), y: Math.round(rbox.height / 2)};

        //debug
        this.ring = new FTRP.Ring(this.svgMain, this.center, [{value: 30, color: '#ff0000'}, {value: 50, color: '#00ff00'}, {value: 100, color: '#0000ff'}], 300, 280, 30);
        this.pie = new FTRP.Ring(this.svgMain, this.center, [{value: 30, color: '#ff0000'}, {value: 50, color: '#00ff00'}, {value: 100, color: '#0000ff'}], 260, 0, 180);
        
        var self = this;
        setInterval(function () {
            self.ring.rotate(self.ring.rotation + 1);
            self.pie.rotate(self.pie.rotation - 1);
        }, 20); 
    };

    FTRP.Game.prototype.move = function (x, y) {
        this.ring.rotate(this.ring.rotation - 1);
        this.pie.rotate(this.pie.rotation + 1);
    };

    // Create game instance and start
    window.game = new FTRP.Game();
    window.addEventListener('load', function () {
        window.game.init('game');
    });
    window.addEventListener('mousemove', function (e) {
        //console.log(e);
        window.game.move(e.screenX, e.screenY);
    });
}());
