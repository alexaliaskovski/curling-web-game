/*

Open two browsers at http://localhost:3000/canvas.html
testsetsetsetset
*/

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				GLOBALS
///////////////////////////////////////////////////////////////////////////////////////////////////////////

let closeUpCanvas = document.getElementById("closeUpCanvas") 	//close up canvas
let longViewCanvas = document.getElementById("longViewCanvas") 	//full canvas
const fontPointSize = 18 										//point size for word text
const editorFont = "Arial" 										//font for your editor

let canvasX, canvasY 											//location where mouse is pressed

let rocks = []													//rocks array, stores all rocks in the game
const numberRocks = 6											//number of rocks in the game (total)
let rockBeingMoved = null										//rock being dragged by mouse
const rockRadius = 10											//radius of rocks
let rocksAreMoving = false										//whether or not there are rocks moving on the board

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				INITIALIZE ROCKS
///////////////////////////////////////////////////////////////////////////////////////////////////////////


//deltaX/Y to velocity
for (i = 0; i < numberRocks; i++) {
	if (i < numberRocks/2) 	{ 
		let rock = { "colour": "red", 		"x": i * 35 + 35,	"y": longViewCanvas.height - 50, 	"deltaX": 0,	"deltaY": 0, 	"owner": "player 1"} 
		rocks.push(rock)
	}
	else { 
		let rock = { "colour": "yellow", 	"x": i * 35 + 35, 	"y": longViewCanvas.height - 50, 	"deltaX": 0,	"deltaY": 0, 	"owner": "player 2"} 
		rocks.push(rock)
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				PROCESS DATA
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function handleMouseDown(e) {
	let rect = longViewCanvas.getBoundingClientRect()
	let canvasX = e.pageX - rect.left								//mouse location of x
	let canvasY = e.pageY - rect.top								//mouse location of y
	
	rockBeingMoved = getRockAtLocation(canvasX, canvasY)			//sets rock being moved
	if (rockBeingMoved != null) {
		longViewCanvas.addEventListener("mousemove", handleMouseMove)
		longViewCanvas.addEventListener("mouseup", handleMouseUp)
	}

	e.stopPropagation()
	e.preventDefault()
}

function handleMouseMove(e) {
	let rect = longViewCanvas.getBoundingClientRect()
	let canvasX = e.pageX - rect.left
	let canvasY = e.pageY - rect.top

	rockBeingMoved.deltaX = rockBeingMoved.x - canvasX				//sets delta x
	rockBeingMoved.deltaY = rockBeingMoved.y - canvasY				//sets delta y
	
	drawLine(canvasX, canvasY)
	
	e.stopPropagation()
}

function handleMouseUp(e) {
	console.log("mouse up")
	e.stopPropagation()
	
	longViewCanvas.removeEventListener("mousemove", handleMouseMove)
	longViewCanvas.removeEventListener("mouseup", handleMouseUp)
	rocksAreMoving = true
	
	render()
	
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				UPDATE DATA
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function update() {
	let numMovingRocks = 0
	for (let i = 0; i < rocks.length; i++) {
		if (rocks[i].deltaX != 0 && rocks[i].deltaY != 0) {
			console.log("move rock")
			numMovingRocks += 1
			moveRock(rocks[i])
			handleWallCollision(rocks[i])
			handleRockCollision(rocks[i])
		}
	}
	
	if (numMovingRocks == 0) { rocksAreMoving = false }
	render()
}

function moveRock(rock) {
	rock.x += rock.deltaX
	rock.y += rock.deltaY
	console.log("rock x: " + rock.x)
	console.log("rock y: " + rock.y)
	
	//multiply rock.x/y by some constant value to change deceleration but keep things proportionate
	rock.deltaX -= rock.x
	rock.deltaY -= rock.y
}

function handleWallCollision(rock) {
	if ((rock.x + rock.radius > longViewCanvas.width) || (rock.x - rock.radius < 0))	{ rock.deltaX *= -1 }
	if ((rock.y + rock.radius > longViewCanvas.height) || (rock.y - rock.radius < 0)) 	{ rock.deltaY *= -1 }
}

function handleRockCollision(rock) {
	
}

function getRockAtLocation(aCanvasX, aCanvasY) {
	let context = longViewCanvas.getContext("2d")
	for (let i = 0; i < rocks.length; i++) {
		let distanceX = Math.abs(rocks[i].x - aCanvasX)
		let distanceY = Math.abs(rocks[i].y - aCanvasY)
		let distanceFromRock = Math.hypot(distanceX, distanceY)
		console.log("Distance: " + distanceFromRock)
		if (distanceFromRock < rockRadius) { return(rocks[i]) }
	}
	return(null)
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				RENDER DATA
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function drawCloseCanvas(context) {
	context.fillStyle = "white"
	context.fillRect(0, 0, longViewCanvas.width, longViewCanvas.height)
	
	let targetData = [
		{"colour": "blue", "x": closeUpCanvas.width/2, "y": closeUpCanvas.height/2, "radius": 300},
		{"colour": "white", "x": closeUpCanvas.width/2, "y": closeUpCanvas.height/2, "radius": 225},
		{"colour": "red", "x": closeUpCanvas.width/2, "y": closeUpCanvas.height/2, "radius": 150},
		{"colour": "white", "x": closeUpCanvas.width/2, "y": closeUpCanvas.height/2, "radius": 75}
	]
	
	drawTarget(context, targetData)
	
	let theseRocks = []
}

function drawLongCanvas(context) {
	context.fillStyle = "white"
	context.fillRect(0, 0, longViewCanvas.width, longViewCanvas.height)
	
	let targetData = [
		{"colour": "blue", "x": longViewCanvas.width/2, "y": 100, "radius": 60},
		{"colour": "white", "x": longViewCanvas.width/2, "y": 100, "radius": 45},
		{"colour": "red", "x": longViewCanvas.width/2, "y": 100, "radius": 30},
		{"colour": "white", "x": longViewCanvas.width/2, "y": 100, "radius": 15}
	]
	
	drawTarget(context, targetData)
	drawRocks(context, rocks)
}

function drawRocks(context, rocks) {
	for (let i = 0; i < rocks.length; i++) {
		let data = rocks[i]
		context.beginPath()
		context.arc(data.x, data.y, rockRadius, 0, 2*Math.PI)
		context.fillStyle = data.colour
		context.fill()
	}
}

function drawTarget(context, targetData) {
	for (let i = 0; i < targetData.length; i++) {
		context.beginPath()
		context.arc(targetData[i].x, targetData[i].y, targetData[i].radius, 0, 2*Math.PI)
		context.fillStyle = targetData[i].colour
		context.fill()
	}
}

function drawLine(canvasX, canvasY) {
	context = longViewCanvas.getContext("2d")
	
	drawLongCanvas(context)
	
	context.beginPath()
	context.moveTo(rockBeingMoved.x, rockBeingMoved.y)
	context.lineTo(canvasX, canvasY)
	context.stroke()
}
	
function render() {
	drawCloseCanvas(closeUpCanvas.getContext("2d"))
	drawLongCanvas(longViewCanvas.getContext("2d"))
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				SOCKET.IO
///////////////////////////////////////////////////////////////////////////////////////////////////////////

//connect to server and retain the socket
let socket = io('http://' + window.document.location.host)

socket.on('rocksData', function(data) {
	console.log("data: " + data)
	console.log("typeof: " + typeof data)
	let rocksData = JSON.parse(data)
	rocks = rocksData
	render()
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				DOCUMENT EVENT LISTENER
///////////////////////////////////////////////////////////////////////////////////////////////////////////


document.addEventListener("DOMContentLoaded", function() {
	longViewCanvas.addEventListener("mousedown", handleMouseDown)
	render()
	//setInterval(render, 100)
})
