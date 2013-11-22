var camera = (function() {
	var options;
	var video, canvas, canvasOverlay, context;
	var renderTimer;
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
	    canvasOverlay.style.zIndex = '10001';
	    overlayContext = canvasOverlay.getContext('3d');
	    vid.appendChild(canvasOverlay);

		if (options.mirror) {
			context.translate(canvas.width, 0);
			context.scale(-1, 1);
		}

		startCapture();
		ctx = document.getElementById("canvasoverlay").getContext("3d");
		initOverlay();
		detectAndAnimate();
	}

	function detectAndAnimate() {
		requestAnimationFrame(detectAndAnimate);
		detection();
		animateOverlay();
	}

	function detection(){
		var ctx = document.getElementById("livevideo").getContext("2d");
		ctx.drawImage(video, 0, 0, video.width, video.height);
		var imageData = getVideoInfo();
		detector = new AR.Detector();
		if (video) {
			var markers = detector.detect(imageData);
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
				context.drawImage(video, 0, 0, video.width, video.height);
		}, Math.round(1000 / options.fps));
	}

	function getVideoInfo() {
		var v = document.getElementById("livevideo");
		var ctx=v.getContext("2d");
		return ctx.getImageData(0,0,canvas.width,canvas.height);
	}

	function pauseCapture() {
		if (renderTimer) clearInterval(renderTimer);
		video.pause();
	}

	function stopCapture() {
	    pauseCapture();

	    if (video.mozSrcObject !== undefined) {
            video.mozSrcObject = null;
	    } else {
            video.src = "";
	    }
    }

	var camera, scene, renderer;
	var geometry, material, mesh;



	// ThreeJS animate and draw a cube
	function initOverlay() {

		camera = new THREE.PerspectiveCamera( 40, 900 / 600, 1, 1000 );

		scene = new THREE.Scene();

		geometry = new THREE.CubeGeometry( 100, 100, 100);
		material = new THREE.MeshLambertMaterial( { color: 0xff0000, wireframe: false } );
		object = new THREE.Object3D();
		var mesh = new THREE.Mesh( geometry, material );
		object.add(mesh);
		scene.add( object );
		// mesh = new THREE.Mesh( geometry, material );
		// scene.add( mesh );
		// mesh.position.set(0, 0, 1)

		var dlight = new THREE.DirectionalLight( 0xFFFFFF, 1 );
		dlight.position.set( 0, 1, 0 );
		scene.add( dlight );

		var hlight = new THREE.HemisphereLight(0xFFFFFF, 0x404040);
		scene.add(hlight);

		renderObj = {canvas: document.getElementById("canvasoverlay")}

		renderer = new THREE.WebGLRenderer(renderObj);
	}

	function animateOverlay() {
		var imageData = getVideoInfo();
		var markers = detector.detect(imageData);
		var bT, bR;
		for (var i = 0; i < markers.length; ++i) {
			var pos = posEst(markers[i]);
			bT = pos.pose(markers[i].corners).bestTranslation;
			bR = pos.pose(markers[i].corners).bestRotation;
		}
		// if (markers.length > 0) {
			object.position.x = bT[0];
			object.position.y = bT[1];
			object.position.z = -bT[2];
			object.rotation.x = -Math.asin(-bR[1][2]);
			object.rotation.y = -Math.atan2(bR[0][2], bR[2][2]);
			object.rotation.z = Math.atan2(bR[1][0], bR[1][1]);
			object.scale.x = 0.75;
			object.scale.y = 0.75;
			object.scale.z = 0.75;
		// }
		// mesh.rotation.x = 1;
		// mesh.rotation.y = 0;
		// mesh.rotation.z += 0.1;
		renderer.clear();
		renderer.render( scene, camera );

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

