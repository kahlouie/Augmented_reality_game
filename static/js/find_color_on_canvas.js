var videoOnCanvas = (function() {
	function drawOnCanvas (canvas, options) {
		var canvasWidth = canvas.width;
		var canvasHeight = canvas.height;
        var context = canvas.context("2d");

		var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
		for (var y = 0; y < canvasHeight; y++) {
			for (var x = 0; x < canvasWidth; x++) {
				var offset = (y * canvasWidth + x) * 4;

				getColorAtOffset(imageData, offset);
				ctx.fillRect(x, y, 1, 1);
			}
		}
    }
	
	function getColorAtOffset(data, offset) {
                return {
                        red: data[offset],
                        green: data[offset + 1],
                        blue: data[offset + 2],
                        alpha: data[offset + 3]
        		};
    }

    function bound(value, interval) {
    	return Math.max(interval[0], Math.min(interval[1], value));
    }

    return {
    	fromCanvas: function(canvas, options) {
    		options = options || {};
    		options.contrast = (typeof options.contrast === "undefined" ? 128 : options.contrast);
    		options.callback = options.callback || doNothing;

    		return drawOnCanvas(canvas, options);
    	}
    };

})();