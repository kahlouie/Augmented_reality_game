var rectangleCorners = [];
var originRectangle = [[300, 250], [600, 250], [600, 350], [300, 350]];
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
				$("#livevideo").on("click", function(ev) {
					cornerPoint = [];
					cornerPoint[0] = ev.offsetX;
					cornerPoint[1] = ev.offsetY;
					rectangleCorners[rectangleCorners.length] = cornerPoint;
				});
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

	    // canvasOverlay = document.createElement("canvas");
	    // canvasOverlay.setAttribute('width', options.width);
	    // canvasOverlay.setAttribute('height', options.height);
	    // canvasOverlay.style.position = "absolute";
	    // canvasOverlay.style.left = '10px';
	    // canvasOverlay.style.zIndex = '100001';
	    // // canvasOverlay.style.display = 'block';
	    // overlayContext = canvasOverlay.getContext('2d');
	    // overlayContext.clearRect(0,0,900,600);
	    // overlayContext.id = "overlay";
	    // vid.appendChild(canvasOverlay);

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

        jsfeat.yape06.laplacian_threshold = options.lap_thres|100;
        jsfeat.yape06.min_eigen_value_threshold = options.eigen_thres|60;
        // perform detection
		// returns the amount of detected corners
		count = jsfeat.yape06.detect(img_u8, corners);
		var data_u32 = new Uint32Array(imageData.data.buffer);
		renderCorners(corners, count, data_u32, 900);

		var v = document.getElementById("livevideo");
		var ctx=v.getContext("2d");
		ctx.putImageData(imageData, 0, 0);
	}

	function renderCorners(corners, count, img, step) {
		var pix = (0xff << 24) | (0x00 << 16) | (0xff << 8) | 0x00;
		for (var i = 0; i < count; i++) {
			var x = corners[i].x;
			var y = corners[i].y;
			var offset = (x + y * step);
			img[offset] = pix;
			img[offset - 1] = pix;
			img[offset + 1] = pix;
			img[offset - step] = pix;
			img[offset + step] = pix;
		}
	}

	// tracks specific pixels
	function homography() {
		var homo_kernel = new jsfeat.motion_model.homography2d();
		var homo_transform = new jsfeat.matrix_t(3,3, jsfeat.F32_t | jsfeat.C1_t);
		var from = [];
		var to = [];

		for (var i = 0; i < originRectangle.length; ++i) {
			from[i] = { "x":originRectangle[i][0], "y":originRectangle[i][1] };
			to[i] = {"x":rectangleCorners[i][0], "y":rectangleCorners[i][1]};
		}
		homo_kernel.run(from, to, homo_transform, originRectangle.length);

		var error = new jsfeat.matrix_t(originRectangle.length, 1, jsfeat.F32_t | jsfeat.C1_t);
		homo_kernel.error(from, to, homo_transform, error.data, originRectangle.length);

		// console.log(homo_transform);

		for (var i = 0; i < originRectangle.length; ++i) {
			var originPoint = new jsfeat.matrix_t(1,3, jsfeat.F32_t | jsfeat.C1_t);
			originPoint.data[0] = originRectangle[i][0];
			originPoint.data[1] = originRectangle[i][1];
			originPoint.data[2] = 1;
			console.log(originPoint);
			console.log(homo_transform);
			var newPointMatrix = new jsfeat.matrix_t(1,3, jsfeat.F32_t | jsfeat.C1_t);
			jsfeat.matmath.multiply(newPointMatrix, homo_transform, originPoint);
			console.log(originPoint);
			console.log("originPoint");
			console.log(homo_transform);
			console.log("homo_transform");
			console.log(newPointMatrix);
			console.log("newPointMatrix");
		}
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

