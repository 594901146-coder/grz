(function () {
    'use strict';

    var canvas = document.getElementById('simulator'),
        worker = null,
        renderer = null,
        resizeFrame = null,
        viewportWidth = 1,
        viewportHeight = 1,
        width = 1,
        height = 1,
        renderScale = 1,
        paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var QUALITY_VALUES = ['auto', 'high', 'low'],
        requestedQuality = new URLSearchParams(window.location.search).get('quality'),
        quality = QUALITY_VALUES.indexOf(requestedQuality) === -1 ? 'auto' : requestedQuality,
        HIGH_MAX_PIXELS = 5000000,
        AUTO_MAX_PIXELS = 3000000;

    document.documentElement.dataset.oceanPaused = String(paused);
    document.documentElement.dataset.oceanQuality = quality;

    var getRenderSize = function () {
        var nextViewportWidth = Math.max(1, Math.round(window.innerWidth)),
            nextViewportHeight = Math.max(1, Math.round(window.innerHeight)),
            deviceScale = typeof window.devicePixelRatio === 'number' && Number.isFinite(window.devicePixelRatio)
                ? Math.max(1, window.devicePixelRatio)
                : 1,
            mobileViewport = nextViewportWidth <= 899,
            maxScale = quality === 'high' ? 2 : quality === 'low' ? 1 : mobileViewport ? 2 : 1.5,
            maxPixels = quality === 'high' ? HIGH_MAX_PIXELS : quality === 'low' ? Infinity : AUTO_MAX_PIXELS,
            nextScale = Math.min(deviceScale, maxScale),
            requestedPixels = nextViewportWidth * nextViewportHeight * nextScale * nextScale;

        if (requestedPixels > maxPixels) {
            nextScale = Math.sqrt(maxPixels / (nextViewportWidth * nextViewportHeight));
        }
        nextScale = Math.max(1, Math.min(nextScale, maxScale));

        return {
            viewportWidth: nextViewportWidth,
            viewportHeight: nextViewportHeight,
            width: Math.max(1, Math.round(nextViewportWidth * nextScale)),
            height: Math.max(1, Math.round(nextViewportHeight * nextScale)),
            scale: nextScale
        };
    };

    var updateSizeState = function (nextSize) {
        viewportWidth = nextSize.viewportWidth;
        viewportHeight = nextSize.viewportHeight;
        width = nextSize.width;
        height = nextSize.height;
        renderScale = nextSize.scale;
        document.documentElement.dataset.oceanViewportWidth = String(viewportWidth);
        document.documentElement.dataset.oceanViewportHeight = String(viewportHeight);
        document.documentElement.dataset.oceanCanvasWidth = String(width);
        document.documentElement.dataset.oceanCanvasHeight = String(height);
        document.documentElement.dataset.oceanRenderScale = renderScale.toFixed(3);
    };

    updateSizeState(getRenderSize());

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
        var nextSize = getRenderSize(),
            bufferChanged = nextSize.width !== width || nextSize.height !== height;

        updateSizeState(nextSize);
        if (!bufferChanged) {
            return;
        }

        if (worker) {
            worker.postMessage({ type: 'resize', width: width, height: height });
        } else if (renderer) {
            renderer.resize(width, height);
        }
    };

    var scheduleResize = function () {
        if (resizeFrame === null) {
            resizeFrame = window.requestAnimationFrame(applySize);
        }
    };

    window.addEventListener('resize', scheduleResize);
    window.addEventListener('orientationchange', scheduleResize);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', scheduleResize);
    }

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

    RESOLUTION = quality === 'high' ? 512 : quality === 'low' ? 256 : viewportWidth <= 899 ? 256 : 512;
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
