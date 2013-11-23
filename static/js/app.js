(function() {
	var capturing = false;

	camera.init({
		width: 640,
		height: 480,
		fps: 30,
		mirror: true,

		onFrame: function(canvas) {
			placeholder.fromCanvas(canvas, {
				callback: function(placeholder) {
					placeholderContainer.innerHTML = renderingString;
				}
			});
		},

		onSuccess: function() {
			document.getElementById("info").style.display = "none";
			capturing = true;
			document.getElementById("pause").style.display = "block";
			document.getElementById("pause").onclick = function() {
				if (capturing) {
					camera.pause();
				} else {
					camera.start();
				}
				capturing = !capturing;
			};
		},

		onError: function(error) {
			// TODO: Log error
			console.log(error);
		},

		onNotSupported: function() {
			console.log("unsupported")
			document.getElementById("info").style.display = "none";
			placeholderContainer.style.display = "none";
			document.getElementById("notSupported").style.display = "block";
		}
	});
})();