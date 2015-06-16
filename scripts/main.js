/*jslint browser, devel, this, for */
/*global window, SVG */
(function () {
    'use strict';

    // Declare FindTheRightPoint namespace
    var FTRP = {};

    // Ring Class
    FTRP.Ring = function (container, center, sectors, colors, outerRadius, innerRadius, rotation) {
        // Create a svg group inside the container, don't draw directly inside
        this.svgRing = container.group();
        this.svgSector = this.svgRing.group();
        this.svgInnerCircle = this.svgRing.group();
        this.center = center || {x: 0, y: 0};
        this.sectors = sectors || [];
        this.colors = colors || [];
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
            sum += sector;
        });
        // Draw sectors
        this.sectors.forEach(function (sector, index) {
            var x1, y1, x2, y2, d;
            endRadian = startRadian + self.getNormalizedRadian(sector, sum);

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
            self.svgSector.path(d).fill(self.colors[index]);

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
        this.level = null;
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
        this.level = 5;
        this.createLevel();
    };

    FTRP.Game.prototype.updateGeometry = function () {
        var rbox = this.svgMain.rbox();
        this.width = rbox.width;
        this.height = rbox.height;
        this.center = {x: Math.round(this.width / 2), y: Math.round(this.height / 2)};
        this.normalizeFactor = 500;
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

    FTRP.Game.prototype.createSectors = function () {
        var sectors = [], i;
        for (i = 0; i < this.level; i += 1) {
            // Generate values from 20 - 100 with interval = 5
            sectors[i] = (Math.floor(Math.random() * 17) + 4) * 5;
        }
        return sectors;
    };

    FTRP.Game.prototype.createColors = function () {
        var colors = [], i, color_tones, color_start, color_step, color_i;
        color_tones = [
            {r: 0, g: 0, b: 0},
            {r: 64, g: 0, b: 0},
            {r: 0, g: 64, b: 0},
            {r: 0, g: 0, b: 64},
            {r: 64, g: 64, b: 0},
            {r: 64, g: 0, b: 64},
            {r: 0, g: 64, b: 64}
        ];
        // Generate start color and add random color tone
        i = Math.floor(Math.random() * color_tones.length);
        color_start = {
            r: Math.floor(Math.random() * 32) + color_tones[i].r,
            g: Math.floor(Math.random() * 32) + color_tones[i].g,
            b: Math.floor(Math.random() * 32) + color_tones[i].b
        };
        // Generate color step for each sector
        color_step = {
            r: Math.floor((Math.random() * 128 + 128) / this.level),
            g: Math.floor((Math.random() * 128 + 128) / this.level),
            b: Math.floor((Math.random() * 128 + 128) / this.level)
        };
        // Generate the array of color strings
        for (i = 0; i < this.level; i += 1) {
            color_i = {
                r: Math.min(color_start.r + color_step.r * i, 255),
                g: Math.min(color_start.g + color_step.g * i, 255),
                b: Math.min(color_start.b + color_step.b * i, 255)
            };
            colors[i] = "rgb(" + color_i.r + "," + color_i.g + "," + color_i.b + ")";
        }
        return colors;
    };

    FTRP.Game.prototype.createLevel = function () {
        //debug
        var sectors = this.createSectors(), colors = this.createColors();
        console.log(sectors, colors);
        this.ring = new FTRP.Ring(this.svgMain, this.center, sectors, colors, 300, 280, 30);
        this.pie = new FTRP.Ring(this.svgMain, this.center, sectors, colors, 260, 0, 180);
        this.answer = {
            x: Math.floor(Math.random() * this.normalizeFactor),
            y: Math.floor(Math.random() * this.normalizeFactor)
        };
    };

    FTRP.Game.prototype.update = function () {
        var self = this, diff;
        // Calculate the Manhattan distance
        diff = Math.abs(this.answer.x - this.cursor.x) + Math.abs(this.answer.y - this.cursor.y);
        // Set rotation and sectors based on the difference between pie and ring
        this.pie.rotation = this.ring.rotation + 0.5 * diff;
        this.pie.sectors = this.pie.sectors.map(function (sector, index) {
            return self.ring.sectors[index] + 0.2 * diff * Math.abs(Math.sin(index * diff / self.normalizeFactor));
        });
        // Update the pie parameters
        console.log(this.cursor, diff, this.pie.rotation, this.pie.sectors);
        window.requestAnimationFrame(function () {
            self.pie.rotate();
            self.pie.drawSector();
        });
    };

    // Create game instance and start
    window.game = new FTRP.Game();
    window.addEventListener('load', function () {
        window.game.init('game');
    });
}());
