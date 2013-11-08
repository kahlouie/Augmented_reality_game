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

    function drawOnOverlay (canvas, options) {
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;
        var context = canvas.context("2d");

        var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
          ctx.beginPath();
          ctx.arc(150,150,50,0,Math.PI*2,true); // Outer circle
          ctx.moveTo(185,150);
          ctx.fillStyle = "rgba(255,255,0,0.5)";
          ctx.fill();
          ctx.arc(150,150,35,0,Math.PI,false);   // Mouth (clockwise)
          ctx.moveTo(140,140);
          ctx.arc(135,140,5,0,Math.PI*2,true);  // Left eye
          // ctx.fillStyle = "black";
          // ctx.fillArc();
          ctx.moveTo(170,140);
          ctx.arc(165,140,5,0,Math.PI*2,true);  // Right eye
          ctx.stroke();


          // speech bubble
          ctx.beginPath();
          ctx.moveTo(75,25);
          ctx.quadraticCurveTo(25,25,25,62.5);
          ctx.quadraticCurveTo(25,100,50,100);
          ctx.quadraticCurveTo(50,120,80,125);
          ctx.quadraticCurveTo(60,120,65,100);
          ctx.quadraticCurveTo(125,100,125,62.5);
          ctx.quadraticCurveTo(125,25,75,25);
          ctx.stroke();


            }
        }
    }

    function draw() {
        drawOnCanvas(canvas, options);
        drawOnOverlay(canvasOverlay, options);
        return
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

    		return draw();
    	}
    };

})();