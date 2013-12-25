Augmented_reality_game
======================
This README is not finished. Please check back again for updates!
It is available on the web at Augmented-reality.herokuapp.com.
If you need the markers, you can print them out at Augmented-reality.herokuapp.com/marker.

Javascript augmented reality game available on the web!

I'm making an augmented web app.


###Tools I am using:
- JavaScript
- HTML
- CSS
- ThreeJS
- Wings
- JS-Aruco

 

###Steps I've done:
- Get live video onto web [X]
- Make HTML5 Canvas work [X]
	- create a canvas [x]
	- draw something on canvas [x]
	- put video on canvas [x]
	- draw on top of video [x]
		- ended up drawing on a canvas that appears in front of the video canvas [x]
- Make JS-Aruco markers [x]
- Detect markers [x]
- draw 3d things on video [x]
- Draw 3d things onto marker [x]
- Make 3D models [x]
- Need to draw 3d model onto marker based on marker id [x]
- Make multiple markers work simultaneously [x]
- Model a 3D Floating Nose [x]
- Get 3D Floating Nose onto the 3D model canvas [x]
- 





###Things I DID to optimize:
- Optimized frames per second speed
	- Stopped creating new things (the detector and the posit) in a repeated loop so it doesn't have to keep garbage collecting
	- Stopped doing things, like feature detection multiple times in the same loop
	- Passed these things from one function to another instead of making them global

###Future features:
- Get hosted on Heroku
- Add a main page to get to video AND one to print out markers for printing
- Make a third canvas to write text onto to show monster's level