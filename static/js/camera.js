var camera = (function() {
	var canvas, canvasOverlay, context;
	var markers;
	var camera, scene, renderer;
	var object;
	var counter;
	var detector = new AR.Detector();
	var posit;
	var imageData;

	function RecognizedMarker(id, object) {
		this.id = id;
		this.object = object;
		this.counter = 0;
		this.bT = [];
		this.bR = [];
		this.center = [0, 0];
		this.originalColor = object.children[0].material;
	}

	function initVideoStream(options) {
		var video = document.createElement("video");
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

				initCanvas(video, options);
			}, options.onError);
		} else {
			options.onNotSupported();
		}
		return 
	}

	function initCanvas(video, options) {
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

	    posit = new POS.Posit(58, canvas.width);

		if (options.mirror) {
			context.translate(canvas.width, 0);
			context.scale(-1, 1);
		}

		video.play();
		ctx = document.getElementById("canvasoverlay").getContext("3d");
		initOverlay();
		detectAndAnimate(video);
	}

	function detectAndAnimate(video) {
		requestAnimationFrame(function (){
			detectAndAnimate(video);	
		});
		detection(video);
		animateOverlay();
	}

	function detection(video){
		context.drawImage(video, 0, 0, video.width, video.height);
		imageData = getVideoInfo();
		if (video) {
			markers = detector.detect(imageData);
		}
		return 
	}

	function posEst(marker) {

		var corners = marker.corners;

		for (var i = 0; i < corners.length; ++i) {
			var corner = corners[i];

			corner.x = corner.x - (canvas.width / 2);
			corner.y = (canvas.height / 2) - corner.y;
		}
		return posit;
	}

	function getVideoInfo() {
		return context.getImageData(0,0,canvas.width,canvas.height);
	}

	// ThreeJS animate and draw a cube
	function initOverlay() {

		camera = new THREE.PerspectiveCamera( 40, 900 / 600, 1, 1000 );

		scene = new THREE.Scene();

		var manager = new THREE.LoadingManager();

		var loader = new THREE.OBJLoader( manager );
		loader.load( '/static/images/floatingNose.obj', function ( object ) {

			var skinMaterial = new THREE.MeshLambertMaterial( {color: 0xF5BAA4} );
			var noseMesh = new THREE.Mesh(object, skinMaterial);
			var nose = new THREE.Object3D();
			nose.add(noseMesh);
			m431 = new RecognizedMarker(431, nose);

		} );


		cube = new THREE.CubeGeometry( 100, 100, 100);
		// var redMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000} );
		// var redCube = new THREE.Object3D();
		// var redMesh = new THREE.Mesh( cube, redMaterial );
		// redCube.add(redMesh);
		// m431 = new RecognizedMarker(431, redCube);

		var greenMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00});
		var greenMesh = new THREE.Mesh( cube, greenMaterial);
		var greenCube = new THREE.Object3D();
		greenCube.add(greenMesh);
		m783 = new RecognizedMarker(783, greenCube);

		var dlight = new THREE.DirectionalLight( 0xFFFFFF, 1 );
		dlight.position.set( 0, 1, 0 );
		scene.add( dlight );

		var hlight = new THREE.HemisphereLight(0xFFFFFF, 0x404040);
		scene.add(hlight);

		renderObj = {canvas: document.getElementById("canvasoverlay")}

		renderer = new THREE.WebGLRenderer(renderObj);
	}

	function animateOverlay() {
		var bT, bR;
		var md ={"431": m431, "783": m783};
		for (var k in md) {
			md[k].counter++;
			if (md[k].counter > 6) {
				scene.remove(md[k].object);
			}
		}
		for (var i = 0; i < markers.length; ++i) {
			var pos = posEst(markers[i]);
			var rm = md[markers[i].id];
			rm.bT = pos.pose(markers[i].corners).bestTranslation;
			rm.bR = pos.pose(markers[i].corners).bestRotation;
			rm.counter = 0;
			scene.add(rm.object);
			rm.object.position.x = rm.bT[0];
			rm.object.position.y = rm.bT[1]+25;
			rm.object.position.z = -rm.bT[2];
			rm.object.rotation.x = -Math.asin(-rm.bR[1][2]);
			rm.object.rotation.y = -Math.atan2(rm.bR[0][2], rm.bR[2][2]);
			rm.object.rotation.z = Math.atan2(rm.bR[1][0], rm.bR[1][1]);
			rm.object.scale.x = 0.7;
			rm.object.scale.y = 0.7;
			rm.object.scale.z = 0.7;
			rm.object.children[0].material = rm.originalColor;
			if (i === 1) {
				var m0 = md[markers[0].id];
				var xDiff = Math.abs(rm.object.position.x - m0.object.position.x);
				var yDiff = Math.abs(rm.object.position.y - m0.object.position.y);
				var zDiff = Math.abs(rm.object.position.z - m0.object.position.z);
				if (m0.id !== rm.id && zDiff < 50 && xDiff < 100 && yDiff < 100){//Math.sqrt((xDiff*xDiff) + (yDiff*yDiff)) < 200){
					var blueMaterial = new THREE.MeshLambertMaterial( { color: 0x0000ff});
					rm.object.children[0].material = blueMaterial;
					m0.object.children[0].material = blueMaterial;
				}




				// var m0xsum = 0;
				// var m1xsum = 0;
				// var m0ysum = 0;
				// var m1ysum = 0;
				// for (var c = 0; c < 4; c++) {
				// 	m0xsum += markers[0].corners[c].x;
				// 	m0ysum += markers[0].corners[c].y;
				// 	m1xsum += markers[1].corners[c].x;
				// 	m1ysum += markers[1].corners[c].y;
				// }
				// rm.center = [m1xsum/4, m1ysum/4];
				// md[markers[0].id].center =  [m0xsum/4, m0ysum/4];
				// var xDiff = rm.center[0] - md[markers[0].id].center[0];
				// var yDiff = rm.center[1] - md[markers[0].id].center[1];
				// if (Math.sqrt((xDiff*xDiff) + (yDiff*yDiff)) < 200) {
				// 	var blueMaterial = new THREE.MeshLambertMaterial( { color: 0x0000ff});
				// 	rm.object.children[0].material = blueMaterial;
				// 	md[markers[0].id].object.children[0].material = blueMaterial;
				// } else {
				// 	rm.object.children[0].material = rm.originalColor;
				// 	md[markers[0].id].object.children[0].material = md[markers[0].id].originalColor;
				// }
			}
		}
		renderer.clear();
		renderer.render( scene, camera );


	}

		// else {
		// 	counter++;
		// 	if (counter > 6) {
		// 		renderer.clear();
		// 	}
		// }
	return {
		init: function(captureOptions) {
			var doNothing = function(){};

			var options = captureOptions || {};

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

			initVideoStream(options);
		},
	};
})();

