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
        this.drawSector();
        this.drawInnerCircle();
        this.move();
        this.rotate();
    };

    FTRP.Ring.prototype.move = function (center) {
        if (center !== undefined) {
            this.center = center;
        }
        this.updateTransform();
    };

    FTRP.Ring.prototype.rotate = function (rotation) {
        if (rotation !== undefined) {
            this.rotation = rotation % 360;
        }
        this.updateTransform();
    };

    FTRP.Ring.prototype.getSectorValue = function (index) {
        return this.sectors[index].value;
    };

    FTRP.Ring.prototype.setSectorValue = function (index, value) {
        this.sectors[index].value = value;
        this.drawSector();
    };

    FTRP.Ring.prototype.updateTransform = function () {
        var transformString = "translate(" + this.center.x + "," + this.center.y + ") rotate(" + this.rotation + ",0,0)";
        this.svgRing.attr({transform: transformString});
    };

    FTRP.Ring.prototype.getNormalizedRadian = function (value, sum) {
        return Math.PI * 2 * value / sum;
    };

    FTRP.Ring.prototype.drawInnerCircle = function () {
        this.svgInnerCircle.clear();
        if (this.innerRadius > 0) {
            this.svgInnerCircle.circle(this.innerRadius * 2).fill('#191919').center(0, 0);
        }
    };

    FTRP.Ring.prototype.drawSector = function () {
        var self = this, sum = 0, startRadian = 0, endRadian = 0;
        this.svgSector.clear();
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

            // Draw sector
            self.svgSector.path(d).fill(sector.color);

            // Update for next iteration
            startRadian = endRadian;
        });
    };

    // Game Class
    FTRP.Game = function () {
        // Declare the variables
        this.svgMain = null;
        this.ring = null;
        this.pie = null;
        this.width = null;
        this.height = null;
        this.center = null;
        this.answer = null;
        this.cursor = null;
        this.normalizeFactor = null;
    };

    FTRP.Game.prototype.init = function (id) {
        // Called at the start, create everything we need for the game.
        this.svgMain = new SVG(id).size('100%', '100%');
        this.updateGeometry();
        this.setUpdateCallback();
        this.createLevel();
    };
    
    FTRP.Game.prototype.updateGeometry = function () {
        var rbox = this.svgMain.rbox();
        this.width = rbox.width;
        this.height = rbox.height;
        this.center = {x: Math.round(this.width / 2), y: Math.round(this.height / 2)};
        this.normalizeFactor = 1000;
    };

    FTRP.Game.prototype.setUpdateCallback = function () {
        var self = this;
        window.addEventListener('mousemove', function (e) {
            // Normalize cursor position
            // Upper Left: (0,0) Bottom right: (normalizeFactor, normalizeFactor)
            self.cursor = {
                x: Math.round(e.clientX * self.normalizeFactor / self.width),
                y: Math.round(e.clientY * self.normalizeFactor / self.height)
            };
            self.update();
        });
    };

    FTRP.Game.prototype.createLevel = function () {
        //debug
        this.ring = new FTRP.Ring(this.svgMain, this.center, [{value: 30, color: '#ff0000'}, {value: 50, color: '#00ff00'}, {value: 100, color: '#0000ff'}], 300, 280, 30);
        this.pie = new FTRP.Ring(this.svgMain, this.center, [{value: 30, color: '#ff0000'}, {value: 50, color: '#00ff00'}, {value: 100, color: '#0000ff'}], 260, 0, 180);
        this.answer = {x: 100, y: 100};
    };

    FTRP.Game.prototype.update = function () {
        var self = this, position = self.getPiePosition();
        window.requestAnimationFrame(function () {
            self.pie.rotate(position.rotation);
            //self.pie.setSectorValue(0, self.pie.getSectorValue(0) + 1);
        });
    };
    
    FTRP.Game.prototype.getPiePosition = function () {
        // Calculate the rotation and the sector values based on the difference between cursor point and answer point
        // If the difference is 0, then the rotation and the sector values of the ring and the pie will be same
        var diff, rotation;
        diff = Math.abs(this.answer.x - this.cursor.x) + Math.abs(this.answer.y - this.cursor.y);
        rotation = this.ring.rotation + 0.5 * diff;
        console.log(this.cursor, diff, rotation);
        return {rotation: rotation};
    };

    // Create game instance and start
    window.game = new FTRP.Game();
    window.addEventListener('load', function () {
        window.game.init('game');
    });
}());
