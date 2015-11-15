var canvas, context, clockRadius, isAmbientMode;

window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
        'use strict';
        window.setTimeout(callback, 1000 / 60);
    };

function renderDeciDayNumbers() {
    'use strict';

    var dx = 0,
        dy = 0,
        i = 1,
        angle = null,
        base = 10,
        fontSize = 64,
        paddingRatio = 1 - 0.1 - fontSize / 640.0,
        verticalOffset = fontSize / 2.9;

    context.save();

    // Assigns the clock creation location in the middle of the canvas
    context.translate(canvas.width / 2, canvas.height / 2);

    // Assign the style of the number which will be applied to the clock plate
    context.beginPath();

    context.fillStyle = '#999999';

    // Create base dots in a circle
    context.font = fontSize.toString() + "px TizenSans";
    context.textAlign = "center";
    
    for (i = 0; i < base; i++) {
        angle = i * (Math.PI * 2) / base + Math.PI * 1.5;
        dx = clockRadius * Math.cos(angle);
        dy = clockRadius * Math.sin(angle);
        context.fillText(i.toString(), dx * paddingRatio, dy * paddingRatio + verticalOffset);
    }
    context.closePath();
    context.restore();
}

function renderCenterDot() {
    'use strict';
	context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.beginPath();

    context.fillStyle = '#ff9000';
    context.strokeStyle = '#fff';
    context.lineWidth = 4;

    context.arc(0, 0, 7, 0, 2 * Math.PI, false);
    context.fill();
    context.stroke();
    context.closePath();
    context.restore();
}

function renderNeedle(angle, radius, color, lineWidth) {
    'use strict';
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(angle);
    context.beginPath();
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.moveTo(6, 0);
    context.lineTo(radius, 0);
    context.closePath();
    context.stroke();
    context.closePath();
    context.restore();
}

function timeToAngle(time) {
	'use strict';
	return (time % 1) * Math.PI * 2 + Math.PI * 1.5;
}

function renderTimeNeedle(time, scale, color, lineWidth) {
    'use strict';

    var angle = timeToAngle(time),
        radius = clockRadius * scale;

    renderNeedle(angle, radius, color, lineWidth);
}

function getDate() {
    'use strict';

    var date;
    try {
        date = tizen.time.getCurrentDateTime();
    } catch (err) {
        console.error('Error: ', err.message);
        date = new Date();
    }

    return date;
}

function normalizedTime(date) {
	var secondsInDay = 24 * 3600,
	    currentSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
	return currentSeconds / secondsInDay;
}

function eraseView() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

function renderDeciDayNeedle(time) {
	renderTimeNeedle(time, 0.55, '#fff', 6);
}

function renderCentiDayNeedle(time) {
    renderTimeNeedle(time * 10, 0.65, '#fff', 4);
}

function renderMilliDayNeedle(time) {
    renderTimeNeedle(time * 100, 0.75, "#888", 3);
}

function watch() {
    'use strict';

    if (!isAmbientMode) {
    	var date = getDate(),
            time = normalizedTime(date);
    	
    	eraseView();
        renderDeciDayNumbers();
        renderDeciDayNeedle(time);
        renderCentiDayNeedle(time);
        renderMilliDayNeedle(time);
        renderCenterDot();
        
        setTimeout(function() {
            window.requestAnimationFrame(watch);
        }, 8640);
    }
}

function ambientWatch() {
    'use strict';
    var date = getDate(),
        time = normalizedTime(date);
    
    eraseView();
    renderDeciDayNeedle(time);
    renderCentiDayNeedle(time);
    renderCenterDot();
}

window.onload = function onLoad() {
    'use strict';

    canvas = document.querySelector('canvas');
    context = canvas.getContext('2d');
    clockRadius = document.body.clientWidth / 2;

    // Assigns the area that will use Canvas
    canvas.width = document.body.clientWidth;
    canvas.height = canvas.width;

    // add eventListener for tizenhwkey
    window.addEventListener('tizenhwkey', function(e) {
        if (e.keyName === 'back') {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (err) {
                console.error('Error: ', err.message);
            }
        }
    });

    // add eventListener for timetick
    window.addEventListener('timetick', function() {
        console.log("timetick is called");
        ambientWatch();
    });

    // add eventListener for ambientmodechanged
    window.addEventListener('ambientmodechanged', function(e) {
        console.log("ambientmodechanged : " + e.detail.ambientMode);
        if (e.detail.ambientMode === true) {
            // rendering ambient mode case
            isAmbientMode = true;
            ambientWatch();

        } else {
            // rendering normal case
            isAmbientMode = false;
            window.requestAnimationFrame(watch);
        }
    });

    // normal case
    isAmbientMode = false;
    window.requestAnimationFrame(watch);
};
