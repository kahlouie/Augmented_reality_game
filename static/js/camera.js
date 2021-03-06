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
			Nose = new RecognizedMarker(431, object);

		} );


		cube = new THREE.CubeGeometry( 100, 100, 100);
		// var redMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000} );
		// var redCube = new THREE.Object3D();
		// var redMesh = new THREE.Mesh( cube, redMaterial );
		// redCube.add(redMesh);
		// Nose = new RecognizedMarker(431, redCube);

		var greenMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00});
		var greenMesh = new THREE.Mesh( cube, greenMaterial);
		var greenCube = new THREE.Object3D();
		greenCube.add(greenMesh);
		Cube = new RecognizedMarker(783, greenCube);

		skinMaterial = new THREE.MeshLambertMaterial({color: 0xF5BAA4});

		var dlight = new THREE.DirectionalLight( 0xFFFFFF, 0.4 );
		dlight.position.set( 0, 1, 0 );
		scene.add( dlight );

		var hlight = new THREE.HemisphereLight(0xFFFFFF, 0x404040);
		scene.add(hlight);

		renderObj = {canvas: document.getElementById("canvasoverlay")}

		renderer = new THREE.WebGLRenderer(renderObj);

		closeCount = 0;
		frameCount = 0;
	}

	function animateOverlay() {
		var bT, bR;
		var md ={"783": Cube};
		if (Nose) {
			md["431"] = Nose;
			Nose.originalColor = skinMaterial;
			Nose.object.children[0].material = skinMaterial;
		}
		for (var k in md) {
			md[k].counter++;
			if (md[k].counter > 6) {
				scene.remove(md[k].object);
			}
		}
		for (var i = 0; i < markers.length; ++i) {
			var pos = posEst(markers[i]);
			var rm = md[markers[i].id];
			if (rm === Nose) {
				rm.object.scale.x = 50;
				rm.object.scale.y = 50;
				rm.object.scale.z = 50;
			} else {
				rm.object.scale.x = 0.5;
				rm.object.scale.y = 0.5;
				rm.object.scale.z = 0.5;
			}
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
			rm.object.children[0].material = rm.originalColor;
			if (i === 1) {
				var m0 = md[markers[0].id];
				var xDiff = Math.abs(rm.object.position.x - m0.object.position.x);
				var yDiff = Math.abs(rm.object.position.y - m0.object.position.y);
				var zDiff = Math.abs(rm.object.position.z - m0.object.position.z);
				if (m0.id !== rm.id && zDiff < 50 && xDiff < 100 && yDiff < 100){//Math.sqrt((xDiff*xDiff) + (yDiff*yDiff)) < 200){
					closeCount++;
					// var blueMaterial = new THREE.MeshLambertMaterial( { color: 0x0000ff});
					// rm.object.children[0].material = blueMaterial;
					if (closeCount > 10) {
						frameCount++;
						//adjust Nose positioning
						// if (frameCount === 10){
						if (m0 === Cube) {
							cubePosition = m0.object.position;
							cubeScale = m0.object.scale;
							nosePosition = rm.object.position;
							// m0.object.children[0].material = blueMaterial;
						} else if (rm === Cube) {
							cubePosition = rm.object.position;
							cubeScale = rm.object.scale;
							nosePosition = m0.object.position;
							// rm.object.children[0].material = blueMaterial;
						}
						if (frameCount < 120) {
							nosePosition.x += (cubePosition.x - nosePosition.x) / 120 * frameCount;
							nosePosition.z += (cubePosition.z - nosePosition.z) / 120 * frameCount;
							nosePosition.y += 50 / 120 * frameCount;
							if (frameCount > 39) {
								cubeScale.x -= 0.5 / 100 * (frameCount - 40);
								cubeScale.y -= 0.5 / 100 * (frameCount - 40);
								cubeScale.z -= 0.5 / 100 * (frameCount - 40);
							}
						} else if (frameCount > 119 && frameCount < 140) {
							nosePosition.x = cubePosition.x;
							nosePosition.z = cubePosition.z;
							nosePosition.y += (50 / 120 * 119) - (50 / 20 * (frameCount - 119));
							cubeScale.x -= 0.5 / 100 * (frameCount - 40);
							cubeScale.y -= 0.5 / 100 * (frameCount - 40);
							cubeScale.z -= 0.5 / 100 * (frameCount - 40);
						} else {
							nosePosition.x = cubePosition.x;
							nosePosition.z = cubePosition.z;
							nosePosition.y = cubePosition.y;
							if (m0 === Cube) {
								scene.remove(m0.object);
								nosePosition.x = m0.bT[0];
								nosePosition.y = m0.bT[1]+25;
								nosePosition.z = -m0.bT[2];
							} else if (rm === Cube) {
								scene.remove(rm.object);
								nosePosition.x = rm.bT[0];
								nosePosition.y = rm.bT[1]+25;
								nosePosition.z = -rm.bT[2];
							}
						}
					}
				} else {
					closeCount = 0;
					frameCount = 0;
				}
			}
		}
		renderer.clear();
		renderer.render( scene, camera );
	}

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

