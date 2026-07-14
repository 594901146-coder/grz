'use strict';

importScripts('shared.js', 'simulation.js', 'renderer.js');

var renderer = null;
var requestFrame = typeof self.requestAnimationFrame === 'function'
    ? self.requestAnimationFrame.bind(self)
    : function (callback) {
        return self.setTimeout(function () {
            callback(performance.now());
        }, 16);
    };
var cancelFrame = typeof self.cancelAnimationFrame === 'function'
    ? self.cancelAnimationFrame.bind(self)
    : self.clearTimeout.bind(self);

self.addEventListener('message', function (event) {
    var message = event.data || {};

    if (message.type === 'init') {
        try {
            renderer = new OceanRenderer(message.canvas, message.width, message.height, {
                request: requestFrame,
                cancel: cancelFrame
            });
            renderer.setPaused(Boolean(message.paused));

            message.canvas.addEventListener('webglcontextlost', function () {
                self.postMessage({ type: 'status', supported: false });
            });
            self.postMessage({ type: 'status', supported: true });
        } catch (error) {
            self.postMessage({
                type: 'status',
                supported: false,
                reason: error instanceof Error ? error.message : String(error)
            });
        }
        return;
    }

    if (!renderer) {
        return;
    }
    if (message.type === 'resize') {
        renderer.resize(message.width, message.height);
    } else if (message.type === 'set-paused') {
        renderer.setPaused(Boolean(message.paused));
    } else if (message.type === 'set-parallax') {
        renderer.setParallax(message.x, message.y);
    }
});
