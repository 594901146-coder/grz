(function () {
    'use strict';

    var canvas = document.getElementById('simulator'),
        worker = null,
        renderer = null,
        resizeFrame = null,
        width = Math.max(1, Math.round(window.innerWidth)),
        height = Math.max(1, Math.round(window.innerHeight)),
        paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.documentElement.dataset.oceanPaused = String(paused);

    var postStatus = function (supported) {
        document.documentElement.dataset.oceanSupported = String(supported);
        window.parent.postMessage({
            source: 'david-li-ocean',
            type: 'status',
            supported: supported
        }, window.location.origin);
    };

    var setPaused = function (nextPaused) {
        nextPaused = Boolean(nextPaused);
        if (nextPaused === paused) {
            return;
        }

        paused = nextPaused;
        document.documentElement.dataset.oceanPaused = String(paused);
        if (worker) {
            worker.postMessage({ type: 'set-paused', paused: paused });
        } else if (renderer) {
            renderer.setPaused(paused);
        }
    };

    var setParallax = function (x, y) {
        x = typeof x === 'number' && Number.isFinite(x) ? Math.max(-1, Math.min(1, x)) : 0;
        y = typeof y === 'number' && Number.isFinite(y) ? Math.max(-1, Math.min(1, y)) : 0;
        if (worker) {
            worker.postMessage({ type: 'set-parallax', x: x, y: y });
        } else if (renderer) {
            renderer.setParallax(x, y);
        }
    };

    var applySize = function () {
        resizeFrame = null;
        var nextWidth = Math.max(1, Math.round(window.innerWidth)),
            nextHeight = Math.max(1, Math.round(window.innerHeight));
        if (nextWidth === width && nextHeight === height) {
            return;
        }

        width = nextWidth;
        height = nextHeight;
        if (worker) {
            worker.postMessage({ type: 'resize', width: width, height: height });
        } else if (renderer) {
            renderer.resize(width, height);
        }
    };

    window.addEventListener('resize', function () {
        if (resizeFrame === null) {
            resizeFrame = window.requestAnimationFrame(applySize);
        }
    });

    window.addEventListener('message', function (event) {
        if (event.origin !== window.location.origin
                || event.source !== window.parent
                || !event.data
                || event.data.source !== 'zd-ocean-host') {
            return;
        }
        if (event.data.type === 'set-paused') {
            setPaused(event.data.paused);
        } else if (event.data.type === 'set-parallax') {
            setParallax(event.data.x, event.data.y);
        }
    });

    canvas.addEventListener('webglcontextlost', function () {
        postStatus(false);
    });

    RESOLUTION = width <= 899 ? 256 : 512;
    document.documentElement.dataset.oceanResolution = String(RESOLUTION);

    // Some mobile browsers expose OffscreenCanvas but cannot create the
    // required WebGL context inside a worker. Keep rendering on the main
    // thread so those browsers do not get stuck with a transferred canvas.
    var workerSupported = false;

    if (workerSupported) {
        document.documentElement.dataset.oceanRenderer = 'worker';
        worker = new Worker('ocean-worker.js');
        worker.addEventListener('message', function (event) {
            if (event.data && event.data.type === 'status') {
                postStatus(Boolean(event.data.supported));
            }
        });
        worker.addEventListener('error', function () {
            postStatus(false);
        });

        var offscreen = canvas.transferControlToOffscreen();
        worker.postMessage({
            type: 'init',
            canvas: offscreen,
            width: width,
            height: height,
            paused: paused
        }, [offscreen]);
    } else {
        document.documentElement.dataset.oceanRenderer = 'main-thread';
        try {
            renderer = new OceanRenderer(canvas, width, height, {
                request: window.requestAnimationFrame.bind(window),
                cancel: window.cancelAnimationFrame.bind(window)
            }, postStatus);
            renderer.renderOnce();
            renderer.setPaused(paused);
        } catch (renderError) {
            postStatus(false);
        }
    }
}());
