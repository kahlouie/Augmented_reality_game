Augmented_reality_game
======================

Javascript augmented reality game available on the web!

I'm making Augmented Munchkin! 


Tools I plan to use:
- JavaScript
- HTML
- CSS
- Heroku
- ThreeJS
- Wings
- JS-Aruco



Steps to get done:
- Get live video onto web [X]
- Make HTML5 Canvas work [X]
	- create a canvas [x]
	- draw something on canvas [x]
	- put video on canvas [x]
	- draw on top of video [x]
- Make JS-Aruco markers [x]
- Detect markers [x]
- draw 3d things on video [x]
- Draw 3d things onto marker [> ]
- Make 3D models
- Need to draw 3d model onto marker based on marker id
- Make multiple markers work simultaneously





Things I DID to optimize:
- Optimized frames per second speed
	- Stopped creating new things (the detector and the posit) in a repeated loop so it doesn't have to keep garbage collecting
	- Stopped doing things, like feature detection multiple times in the same loop
	- Passed these things from one function to another instead of making them global