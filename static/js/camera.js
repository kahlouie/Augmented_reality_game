var rectangleCorners = [];
var originRectangle = [[323, 218], [539, 218], [539, 329], [323, 329]];
var camera = (function() {
	var options;
	var video, canvas, canvasOverlay, context;
	var renderTimer;
	// var corners, count;
	var positionMatrix;
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
				$("#canvasoverlay").on("click", function(ev) {
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

	    canvasOverlay = document.createElement("canvas");
	    canvasOverlay.id = "canvasoverlay";
	    canvasOverlay.setAttribute('width', options.width);
	    canvasOverlay.setAttribute('height', options.height);
	    canvasOverlay.style.position = "absolute";
	    canvasOverlay.style.left = '10px';
	    canvasOverlay.style.zIndex = '10';
	    // canvasOverlay.style.display = 'block';
	    // overlayContext = canvasOverlay.getContext('2d');
	    // overlayContext.clearRect(0,0,900,600);
	    // overlayContext.id = "overlay";
	    vid.appendChild(canvasOverlay);

		if (options.mirror) {
			context.translate(canvas.width, 0);
			context.scale(-1, 1);
		}

		video.play();
		// findCorners();
		// startCapture();
		detection();
		initOverlay();
		animateOverlay();
	}


	function drawCorners(markers) {
		var corners, corner, i, j;
		var ctx = document.getElementById("canvasoverlay").getContext("2d");
		ctx.lineWidth = 3;

		for (i = 0; i < markers.length; ++i){
			corners = markers[i].corners;
			ctx.strokeStyle = "rgba(255, 0, 0, 1)";
			ctx.beginPath();

			for (j = 0; j !== corners.length; ++ j) {
				corner = corners[j];
				ctx.moveTo(corner.x, corner.y);
				corner = corners[(j +1 ) % corners.length];
				ctx.lineTo(corner.x, corner.y);
			}

			ctx.stroke();
			ctx.closePath();

			ctx.strokeStyle = "rgba(0, 255, 0, 1)";
			ctx.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
		}
	}

	function drawID(markers) {
		var corners, corner, x, y, i, j;

		var ctx = document.getElementById("canvasoverlay").getContext("2d");
		ctx.strokeStyle = "rgba(0, 0, 255, 1)";
		ctx.lineWidth = 1;

		for (i = 0; i < markers.length; ++i) {
			corners = markers[i].corners;

			x = Infinity;
			y = Infinity;

			// console.log(posEst(markers[i]));

			for (j = 0; j < markers.length; ++j) {
				corner = corners[j];

				x = Math.min(x, corner.x);
				y = Math.min(y, corner.y);
			}
			ctx.strokeText(markers[i].id, x, y);
		}

	}

	function detection(){
		requestAnimationFrame(detection);
		var canvas = document.getElementById("canvasoverlay");
		canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
		var ctx = document.getElementById("livevideo").getContext("2d");
		ctx.drawImage(video, 0, 0, video.width, video.height);
		ctx = document.getElementById("canvasoverlay").getContext("2d");
		detector = new AR.Detector();
		var imageData = getVideoInfo();
		if (video) {
			var markers = detector.detect(imageData);
			// drawCorners(markers);
			// drawID(markers);
		}
	}

	function posEst(marker) {
		var canvas = document.getElementById("livevideo");
		var posit = new POS.Posit(58, canvas.width);

		var corners = marker.corners;

		for (var i = 0; i < corners.length; ++i) {
			var corner = corners[i];

			corner.x = corner.x - (canvas.width / 2);
			corner.y = (canvas.height / 2) - corner.y;
		}
		return posit;
	}

	function startCapture() {
		video.play();

		renderTimer = setInterval(function() {
			//try {
				// videoOnCanvas.fromCanvas(canvas, options, canvasOverlay);
				context.drawImage(video, 0, 0, video.width, video.height);
				// tick();

				// getVideoInfo();

			//} catch (e) {
				//TODO
			//	console.log(e);
			//}
		}, Math.round(1000 / options.fps));
	}

	/* JSFeat corner finder
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

	// Not using this currently. adapted from JSFeat
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

		// // console.log(homo_transform);

		// for (var i = 0; i < originRectangle.length; ++i) {
		// 	var originPoint = new jsfeat.matrix_t(1,3, jsfeat.F32_t | jsfeat.C1_t);
		// 	originPoint.data[0] = originRectangle[i][0];
		// 	originPoint.data[1] = originRectangle[i][1];
		// 	originPoint.data[2] = 1;
		// 	console.log(originPoint);
		// 	console.log(homo_transform);
		// 	var newPointMatrix = new jsfeat.matrix_t(1,3, jsfeat.F32_t | jsfeat.C1_t);
		// 	jsfeat.matmath.multiply(newPointMatrix, homo_transform, originPoint);
			// console.log(originPoint);
			// console.log("originPoint");
			// console.log(homo_transform);
			// console.log("homo_transform");
			// console.log(newPointMatrix);
			// console.log("newPointMatrix");
		// }
		return homo_transform;
	}

	function hpCalibration(){
		var row = 480;
		var col = 640;
		var fx = 864 * col / 900;
		var fy = 888 * row / 600;
		var K = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);
		K.data[0] = fx;
		K.data[4] = fy;
		K.data[8] = 1;
		K.data[2] = 0.5 * col;
		K.data[5] = 0.5 * row;
		console.log(K);
		return K
	}

	function multKT() {
		var C = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);
		jsfeat.matmath.multiply(C, hpCalibration(), homography());
		return C;
	}
	*/
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

		var camera, scene, renderer;
	var geometry, material, mesh;

	// ThreeJS animate and draw a cube
	function initOverlay() {

		camera = new THREE.PerspectiveCamera( 75, 900 / 600, 1, 10000 );
		camera.position.z = 1000;

		scene = new THREE.Scene();

		geometry = new THREE.CubeGeometry( 200, 200, 200);
		material = new THREE.MeshLambertMaterial( { color: 0xff0000, wireframe: false } );

		mesh = new THREE.Mesh( geometry, material );
		scene.add( mesh );
		// mesh.position.set(0, 0, 1)

		var light = new THREE.PointLight( 0xffffff, 10, 1000 );
		light.position.set( 250, 250, 1000 );
		scene.add( light );

		// renderObj = {canvas: document.getElementById("canvasoverlay")}

		renderer = new THREE.WebGLRenderer({canvas: document.getElementById("canvasoverlay")});

		// document.vid.appendChild( renderer.domElement );

	}

	function animateOverlay() {

		// note: three.js includes requestAnimationFrame shim
		requestAnimationFrame( animateOverlay );

		var imageData = getVideoInfo();
		markers = detector.detect(imageData);
		for (var i = 0; i < markers.length; ++i) {
			var pos = posEst(markers[i]);
			var bestTranslation = pos.pose(markers[i].corners).bestTranslation;
			// console.log(bestTranslation);
			var bestRotation = pos.pose(markers[i].corners).bestRotation;
			// console.log(bestRotation);
			var matrixTranslation = new jsfeat.matrix_t(1, 3, jsfeat.F32_t | jsfeat.C1_t);
			for (var j = 0; j < bestTranslation.length; j++) {
				matrixTranslation.data[j] = bestTranslation[j];
			}
			// console.log(matrixTranslation);
			var matrixRotation = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);
			for (var k = 0; k < bestRotation.length; k++) {
				matrixRotation.data[k * 3] = bestRotation[k][0];
				matrixRotation.data[k * 3 + 1] = bestRotation[k][1];
				matrixRotation.data[k * 3 + 2] = bestRotation[k][2];
			}
			// console.log(matrixRotation);
			positionMatrix = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t)
			jsfeat.matmath.multiply(positionMatrix, matrixRotation, matrixTranslation);

		}
		var pmd = positionMatrix.data;
		var cameraMatrix = new THREE.Matrix4(pmd[0], pmd[1], 0, pmd[2],
											pmd[3], pmd[4], 0, pmd[5],
											0, 0, 1, 0,
											pmd[6], pmd[7], 0, pmd[8]);
		// if (rectangleCorners.length >= 4) {
		// 	ht = multKT();
		// 	htd = ht.data
		// 	var cameraMatrix = new THREE.Matrix4(htd[0], htd[1], 0, htd[2],
		// 									htd[3], htd[4], 0, htd[5],
		// 									0, 0, 1, 0,
		// 									htd[6], htd[7], 0, htd[8]);
		// 	var invcamMat = new THREE.Matrix4();
		// 	invcamMat.getInverse(cameraMatrix);
		// 	// scene.add(mesh);
		// }
		var clone = camera.clone();
		if (cameraMatrix) {
			// console.log(invcamMat);
			clone.projectionMatrix.multiplyMatrices(camera.projectionMatrix, cameraMatrix);
		}
		
		// mesh.rotation.x = 1;
		// mesh.rotation.y = 0;
		// mesh.rotation.z += 0.1;
		renderer.render( scene, clone );

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

