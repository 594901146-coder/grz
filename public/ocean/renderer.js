var OceanRenderer = function (canvas, initialWidth, initialHeight, scheduler) {
    var camera = new Camera(),
        projectionMatrix = new Float32Array(16),
        width = Math.max(1, Math.round(initialWidth)),
        height = Math.max(1, Math.round(initialHeight)),
        simulator = new Simulator(canvas, width, height),
        paused = true,
        frameHandle = null,
        lastTime = null;

    makePerspectiveMatrix(projectionMatrix, FOV, width / height, NEAR, FAR);

    var scheduleFrame = function () {
        if (!paused && frameHandle === null) {
            frameHandle = scheduler.request(render);
        }
    };

    var render = function (currentTime) {
        frameHandle = null;
        if (paused) {
            return;
        }

        var deltaTime = lastTime === null ? 0.0 : (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        simulator.render(deltaTime, projectionMatrix, camera.getViewMatrix(), camera.getPosition());
        scheduleFrame();
    };

    this.resize = function (nextWidth, nextHeight) {
        nextWidth = Math.max(1, Math.round(nextWidth));
        nextHeight = Math.max(1, Math.round(nextHeight));
        if (nextWidth === width && nextHeight === height) {
            return false;
        }

        width = nextWidth;
        height = nextHeight;
        makePerspectiveMatrix(projectionMatrix, FOV, width / height, NEAR, FAR);
        simulator.resize(width, height);
        return true;
    };

    this.setPaused = function (nextPaused) {
        nextPaused = Boolean(nextPaused);
        if (nextPaused === paused) {
            return;
        }

        paused = nextPaused;
        lastTime = null;
        if (paused) {
            if (frameHandle !== null) {
                scheduler.cancel(frameHandle);
                frameHandle = null;
            }
        } else {
            scheduleFrame();
        }
    };
};
