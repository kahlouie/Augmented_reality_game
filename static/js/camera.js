var camera = (function() {
	var options;
	var video, canvas, canvasOverlay, context;
	var renderTimer

	function initVideoStream() {
		video = document.createElement("video");
		video.setAttribute('width', options.width);
		video.setAttribute('height', options.height);

		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

		if (navigator.getUserMedia) {
			navigator.getUserMedia( {
				video: true
			}, function(stream) { console.log(stream);
				options.onSuccess();

				if (video.mozSrcOb !== undefined) {
					video.mozSrcObject = stream;
				} else {
					video.src = window.URL && window.URL.createObjectURL(stream) || stream;
				}

				initCanvas();
			}, options.onError);
		} else {
			options.onNotSupported();
		}
	}

	function initCanvas() {
		canvas = options.targetCanvas || document.createElement("canvas");
		canvas.id = "livevideo";
		vid.appendChild(canvas)
		canvas.setAttribute('width', options.width);
		canvas.setAttribute('height', options.height);
		context = canvas.getContext('2d');

	    canvasOverlay = document.createElement("canvas");
	    canvasOverlay.setAttribute('width', options.width);
	    canvasOverlay.setAttribute('height', options.height);
	    canvasOverlay.style.position = "absolute";
	    canvasOverlay.style.left = '10px';
	    canvasOverlay.style.zIndex = '100001';
	    // canvasOverlay.style.display = 'block';
	    overlayContext = canvasOverlay.getContext('2d');
	    overlayContext.clearRect(0,0,900,600);
	    overlayContext.id = "overlay";
	    vid.appendChild(canvasOverlay);

		if (options.mirror) {
			context.translate(canvas.width, 0);
			context.scale(-1, 1);
		}

		startCapture();
	}

	function startCapture() {
		video.play();

		renderTimer = setInterval(function() {
			try {
				// videoOnCanvas.fromCanvas(canvas, options, canvasOverlay);
				context.drawImage(video, 0, 0, video.width, video.height);
				findCorners();

				// getVideoInfo();
				// // drawOnCanvas();
				// context.beginPath();
		  //       context.arc(150,150,50,0,Math.PI*2,true); // Outer circle
		  //       context.moveTo(185,150);
		  //       context.fillStyle = "rgba(255,255,0,1)";
		  //       context.fill();
		  //       context.arc(150,150,35,0,Math.PI,false);   // Mouth (clockwise)
		  //       context.moveTo(140,140);
		  //       context.arc(135,140,5,0,Math.PI*2,true);  // Left eye
		  //       // context.fillStyle = "black";
		  //       // context.fillArc();
		  //       context.moveTo(170,140);
		  //       context.arc(165,140,5,0,Math.PI*2,true);  // Right eye
		  //       context.stroke();


		  //       // speech bubble
		  //       context.beginPath();
		  //       context.moveTo(75,25);
		  //       context.quadraticCurveTo(25,25,25,62.5);
		  //       context.quadraticCurveTo(25,100,50,100);
		  //       context.quadraticCurveTo(50,120,80,125);
		  //       context.quadraticCurveTo(60,120,65,100);
		  //       context.quadraticCurveTo(125,100,125,62.5);
		  //       context.quadraticCurveTo(125,25,75,25);
		  //       context.stroke();
				// // overlayContext.drawImage,
				// options.onFrame(canvas);
			} catch (e) {
				//TODO
			}
		}, Math.round(1000 / options.fps));
	}

	function findCorners() {
		var corners = [],
		    laplacian_threshold = 30,
		    min_eigen_value_threshold = 25;
 
		// choose threshold values
		jsfeat.yape06.laplacian_threshold = laplacian_threshold;
		jsfeat.yape06.min_eigen_value_threshold = min_eigen_value_threshold;
 
		// you should use preallocated point2d_t array
		for(var i = 0; i < img.cols*img.rows; ++i) {
		    corners[i] = new jsfeat.point2d_t(0,0,0,0);
		}
 
		// perform detection
		// returns the amount of detected corners
		var count = jsfeat.yape06.detect({img:matrix_t, corners:Array});
		console.log(count);
		console.log(corners);
	}

	function getVideoInfo() {
		var v = document.getElementById("livevideo");
		var ctx=v.getContext("2d");
		// console.log(ctx.getImageData(0,0,canvas.width,canvas.height);
	}

	function stopCapture() {
		pauseCapture();

		if (video.mozSrcObject !== undefined) {
			video.mozSrcObject = null;
		} else {
			video.src = "";
		}
	}

	function pauseCapture() {
		if (renderTimer) clearInterval(renderTimer);
		video.pause();
	}

	return {
		init: function(captureOptions) {
			var doNothing = function(){};

			options = captureOptions || {};

			options.fps = options.fps || 30;
			options.width = options.width || 640;
			options.height = options.height || 480;
			options.mirror = options.mirror || false;
			options.targetCanvas = options.targetCanvas || null;
//TODO: is the element actually a <canvas> ?
			
			options.onSuccess = options.onSuccess || doNothing;
			options.onError = options.onError || doNothing;
			options.onNotSupported = options.onNotSupported || doNothing;
			options.onFrame = options.onFrame || doNothing;

			initVideoStream();
		},

		start: startCapture,

		pause: pauseCapture,

		stop: stopCapture
	};
})();
