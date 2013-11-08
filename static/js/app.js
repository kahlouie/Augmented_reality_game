(function() {
	var capturing = false;

	camera.init({
		width: 900,
		height: 600,
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
		},

		onNotSupported: function() {
			document.getElementById("info").style.display = "none";
			placeholderContainer.style.display = "none";
			document.getElementById("notSupported").style.display = "block";
		}
	});
})();