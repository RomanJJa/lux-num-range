var MouseCoordinates = [], ResponseSide = "none";

function recordTouch(event) {
	var MouseCoordinates = [], ms = Date.now() - pslides.slideStartTime, etype = event.type, current_slide = document.querySelector("p-slide[current]");
	if (["touchstart","touchend","touchcancel"].includes(etype)) {
		try {
			for (var i=0; i<event.targetTouches.length; i++) {
				MouseCoordinates.push({"t" : ms, 
									   "x" : Math.round(event.targetTouches[i].clientX), // event['pageX'] || 
									   "y" : Math.round(event.targetTouches[i].clientY), // event['pageY'] || 
									   "rx": Math.round(event.targetTouches[i].radiusX),
									   "ry": Math.round(event.targetTouches[i].radiusY),
									   "f" : Math.round(event.targetTouches[i].force * 1000),
									   "dg": Math.round(event.targetTouches[i].rotationAngle)
									   }); 
			}
		} catch {
			console.error("\""+etype+"\" recording failed.")
		}
	} else if (["mousedown","mouseup"].includes(etype)) {
		try {
			MouseCoordinates.push({"t": ms, "x": event.clientX, "y": event.clientY});
		} catch {
			console.error("\""+etype+"\" recording failed.")
		}
	}
	createRecord(current_slide, etype, MouseCoordinates);
}
	
function currentSlideHasName(name) {
	var res = false, slide = document.querySelector("p-slide[current]")
	if (slide.getAttribute("name") === name) res = true;
	return res;
}
	
// mouse up or finger up
pslides.eventListeners.onpointerup = (event) => {
	if (currentSlideHasName("touch_slide") && event.target.className.indexOf("screenbutton") > -1) {
		recordTouch(event);
		// handle response side:
		createRecord(pslides.currentSlide, "response_side", event.target.className); // .split(" ")[0]
		//changeSlide(1); // setTimeout(function() {changeSlide(1)}, 50);
	}
}

// touch was cancelled:
pslides.eventListeners.onpointercancel = (event) => {
	console.warn("Touch tracking cancelled.")
	if (currentSlideHasName("touch_slide")) {
		recordTouch(event);
		changeSlide(1);
	}
}
		
function isCorrectResponse(target=null, back=-1) {
	// target=stim[It].correct; back=-1
	var res = {correctness: null, feedback: "no feedback"};
	if (typeof getValue === "function" && pslides.currentSlide !== undefined) {
		var text_feedback = "none",
			outSlide = pslides.outObj.slides[pslides.outObj.slides.length-1+back];
			console.log("outSlide: ", outSlide)
			value_resp_side = outSlide.pointer.el0[outSlide.pointer.el0.length-1]// records["p-response,name=response_side"];
			value_resp_key  = outSlide.key.down.k[outSlide.key.down.k.length-1],
			is_correct_response = false;
		
		console.log("value_resp_side: ", value_resp_side)
		console.log("value_resp_key: ",  value_resp_key)
		
		// if buttons were used:
		if ([null,undefined,""].includes(value_resp_side)) {
			if ([undefined,null,""].includes(value_resp_key)) {
				console.log("value_resp_side is null or '' so that response correctness cannot be determined.");
			} else if ( left_blue && value_resp_key==="KeyS") {
				value_resp_side = "p-next[class=left_screenbutton blue thumbsdown]"
			} else if ( left_blue && value_resp_key==="KeyK") {
				value_resp_side = "p-next[class=right_screenbutton red thumbsdown]"
			} else if (!left_blue && value_resp_key==="KeyS") {
				value_resp_side = "p-next[class=left_screenbutton red thumbsdown]"
			} else if (!left_blue && value_resp_key==="KeyK") {
				value_resp_side = "p-next[class=right_screenbutton blue thumbsup]"
			} else {
				console.log("value_resp_side is ", value_resp_side, " so that response correctness cannot be determined.");
				value_resp_side = "";
			}
		}
		
		//console.warn("target: ",target);
		if (target == 1 && value_resp_side.indexOf(" blue") > -1 || 
			target == 0 && value_resp_side.indexOf(" red") > -1) {
			text_feedback = "&#x2705;&#x1F600;&#x2705;";
			is_correct_response = true;
		} else if (target == 0 && value_resp_side.indexOf(" red")  == -1 || 
			       target == 1 && value_resp_side.indexOf(" blue") == -1) {
			text_feedback = "&#x274C;&#x1F615;&#x274C;"
			is_correct_response = false;
		} else {
			text_feedback = "ERROR"
			is_correct_response = null;
		}
		res = {correctness: is_correct_response, feedback: text_feedback};
		//console.error("res",res)
		return res;
	} /*else {
		console.error("Correctness cannot be determined because typeof getValue !== \"function\" but instead ",typeof getValue);
	} */
	return res;
}
	
/*function swapNodes(node1, node2) {
	node2.parentNode.insertBefore(node2, node1);
}*/
	
var training_correct_items = 0, 
	agreed_participation = false, 
	training_feedback = null, // feedback
	left_blue = false, // SET VALUE WHEN CHANGING RESPONSE SIDES
	correct_items = 0,
	total_items = 0,
	n_block = 0,
	It = 0, 
	stim = null;
	

function randomizeButtons() {
	left_blue = Math.random() > 0.5;
	if (left_blue) {
		var d = document.querySelectorAll("p-template[name='button_container']");
		for (var i=0; i<d.length; i++) {
			d[i].children[0].className = d[i].children[0].className.replaceAll("left_screenbutton",  "right_screenbutton")
			d[i].children[1].className = d[i].children[1].className.replaceAll("right_screenbutton", "left_screenbutton")
		}
		console.warn("Swapped screen buttons.")
	}
}
	
