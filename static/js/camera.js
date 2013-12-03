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

		var dlight = new THREE.DirectionalLight( 0xFFFFFF, 1 );
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
				rm.object.scale.x = 0.7;
				rm.object.scale.y = 0.7;
				rm.object.scale.z = 0.7;
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
						if (frameCount === 10){
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
							console.log("frameCount is 10");
						} else if (frameCount > 10 && frameCount < 20){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20);
							} else {
								nosePosition.x += (cubePosition.x/20);
							}
							nosePosition.y += 100/12;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20);
							} else {
								nosePosition.z += (cubePosition.z/20);
							}
						} else if (frameCount > 19 && frameCount < 30){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*2);
							} else {
								nosePosition.x += (cubePosition.x/20*2);
							}
							nosePosition.y += 100/6;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*2);
							} else {
								nosePosition.z += (cubePosition.z/20*2);
							}
						} else if (frameCount > 29 && frameCount < 40){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*3);
							} else {
								nosePosition.x += (cubePosition.x/20*3);
							}
							nosePosition.y += 100/4;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*3);
							} else {
								nosePosition.z += (cubePosition.z/20*3);
							}
						} else if (frameCount > 39 && frameCount < 50){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*4);
							} else {
								nosePosition.x += (cubePosition.x/20*4);
							}
							nosePosition.y += 100/3;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*4);
							} else {
								nosePosition.z += (cubePosition.z/20*4);
							}
						} else if (frameCount > 49 && frameCount < 60){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*5);
							} else {
								nosePosition.x += (cubePosition.x/20*5);
							}
							nosePosition.y += 100/12*5;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*5);
							} else {
								nosePosition.z += (cubePosition.z/20*5);
							}
						} else if (frameCount > 59 && frameCount < 70){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*6);
							} else {
								nosePosition.x += (cubePosition.x/20*6);
							}
							nosePosition.y += 100/2;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*6);
							} else {
								nosePosition.z += (cubePosition.z/20*6);
							}
						} else if (frameCount > 69 && frameCount < 80){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*7);
							} else {
								nosePosition.x += (cubePosition.x/20*7);
							}
							nosePosition.y += 100/12*7;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*7);
							} else {
								nosePosition.z += (cubePosition.z/20*7);
							}
						} else if (frameCount > 79 && frameCount < 90){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*8);
							} else {
								nosePosition.x += (cubePosition.x/20*8);
							}
							nosePosition.y += 100/12*8;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*8);
							} else {
								nosePosition.z += (cubePosition.z/20*8);
							}
						} else if (frameCount > 89 && frameCount < 100){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*9);
							} else {
								nosePosition.x += (cubePosition.x/20*9);
							}
							nosePosition.y += 100/12*9;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*9);
							} else {
								nosePosition.z += (cubePosition.z/20*9);
							}
						} else if (frameCount > 99 && frameCount < 110){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*10);
							} else {
								nosePosition.x += (cubePosition.x/20*10);
							}
							nosePosition.y += 100/12*10;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*10);
							} else {
								nosePosition.z += (cubePosition.z/20*10);
							}
						} else if (frameCount > 109 && frameCount < 120){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*11);
							} else {
								nosePosition.x += (cubePosition.x/20*11);
							}
							nosePosition.y += 100/12*11;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*11);
							} else {
								nosePosition.z += (cubePosition.z/20*11);
							}
						} else if (frameCount > 119 && frameCount < 130){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*12);
							} else {
								nosePosition.x += (cubePosition.x/20*12);
							}
							nosePosition.y += 100/12*11/8*7;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*12);
							} else {
								nosePosition.z += (cubePosition.z/20*12);
							}
							cubeScale -= 0.7/8;
						} else if (frameCount > 129 && frameCount < 140){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*13);
							} else {
								nosePosition.x += (cubePosition.x/20*13);
							}
							nosePosition.y += 100/12*11/8*6;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*13);
							} else {
								nosePosition.z += (cubePosition.z/20*13);
							}
							cubeScale -= 0.7/8*2;
						} else if (frameCount > 139 && frameCount < 150){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*14);
							} else {
								nosePosition.x += (cubePosition.x/20*14);
							}
							nosePosition.y += 100/12*11/8*5;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*14);
							} else {
								nosePosition.z += (cubePosition.z/20*14);
							}
							cubeScale -= 0.7/8*3;
						} else if (frameCount > 149 && frameCount < 160){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*15);
							} else {
								nosePosition.x += (cubePosition.x/20*15);
							}
							nosePosition.y += 100/12*11/8*4;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*15);
							} else {
								nosePosition.z += (cubePosition.z/20*15);
							}
							cubeScale -= 0.7/8*4;
						} else if (frameCount > 159 && frameCount < 170){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*16);
							} else {
								nosePosition.x += (cubePosition.x/20*16);
							}
							nosePosition.y += 100/12*11/8*3;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*16);
							} else {
								nosePosition.z += (cubePosition.z/20*16);
							}
							cubeScale -= 0.7/8*5;
						} else if (frameCount > 169 && frameCount < 180){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*17);
							} else {
								nosePosition.x += (cubePosition.x/20*17);
							}
							nosePosition.y += 100/12*11/8*2;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*17);
							} else {
								nosePosition.z += (cubePosition.z/20*17);
							}
							cubeScale -= 0.7/8*6;
						} else if (frameCount > 179 && frameCount < 190){
							if (cubePosition.x > nosePosition.x){
								nosePosition.x -= (cubePosition.x/20*18);
							} else {
								nosePosition.x += (cubePosition.x/20*18);
							}
							nosePosition.y += 100/12*11/8;
							if (cubePosition.z > nosePosition.z){
								nosePosition.z -= (cubePosition.z/20*18);
							} else {
								nosePosition.z += (cubePosition.z/20*18);
							}
							cubeScale -= 0.7/8*7;
						} else {
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
						// ********* DOUBLE CHECK IF SCENE.ADD should happen in a certain order*************
				} else {
					closeCount = 0;
					frameCount = 0;
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

