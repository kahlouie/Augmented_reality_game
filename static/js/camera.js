var camera = (function() {
	var options;
	var video, canvas, canvasOverlay, context;
	var renderTimer;
	var corners, count;
	var img_u8;

	function initVideoStream() {
		video = document.createElement("video");
		video.setAttribute('width', options.width);
		video.setAttribute('height', options.height);

		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

		if (navigator.getUserMedia) {
			navigator.getUserMedia( {
				video: true
			}, function(stream) {
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
		findCorners();
		startCapture();
	}

	function startCapture() {
		video.play();

		renderTimer = setInterval(function() {
			//try {
				// videoOnCanvas.fromCanvas(canvas, options, canvasOverlay);
				context.drawImage(video, 0, 0, video.width, video.height);
				tick();

				// getVideoInfo();

			//} catch (e) {
				//TODO
			//	console.log(e);
			//}
		}, Math.round(1000 / options.fps));
	}

	function findCorners() {
		//debugger;
		var canvasWidth = canvas.width;
		var canvasHeight = canvas.height;
		ctx = canvas.getContext("2d");

		ctx.fillStyle = "rgb(0,255,0)";
		ctx.strokeStyle = "rgb(0,255,0)";
		img_u8 = new jsfeat.matrix_t(900, 600, jsfeat.U8_t | jsfeat.C1_t);

		corners = [],
		    laplacian_threshold = 100,
		    min_eigen_value_threshold = 60;
 
		// choose threshold values
		jsfeat.yape06.laplacian_threshold = laplacian_threshold;
		jsfeat.yape06.min_eigen_value_threshold = min_eigen_value_threshold;
 

		// you should use preallocated point2d_t array
		for(var i = 0; i < canvasWidth*canvasHeight; ++i) {
		    corners[i] = new jsfeat.point2d_t(0,0,0,0);
		} 
	}

	function tick() {
		var imageData = getVideoInfo();
		jsfeat.imgproc.grayscale(imageData.data, img_u8.data);
        jsfeat.imgproc.box_blur_gray(img_u8, img_u8, 2, 0);

        jsfeat.yape06.laplacian_threshold = options.lap_thres|0;
        jsfeat.yape06.min_eigen_value_threshold = options.eigen_thres|0;
        // perform detection
		// returns the amount of detected corners
		count = jsfeat.yape06.detect(img_u8, corners);
		// console.log(count);
		console.log(corners);
	}

	function getVideoInfo() {
		var v = document.getElementById("livevideo");
		var ctx=v.getContext("2d");
		return ctx.getImageData(0,0,canvas.width,canvas.height);
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
