/*

	Alexandra Liaskovski-Balaba
	101071309
	alexandraliaskovskib@cmail.carleton.ca
	
	Howard Zhang
	101069043
	howardzhang@cmail.carleton.ca
	
	COMP2406 - Assignment #3
	canvas.js
	8th November 2018, 10pm
	
	Testing: The page can be found at http://localhost:3000/assignment3.html in the browser
	
*/

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				GLOBALS
///////////////////////////////////////////////////////////////////////////////////////////////////////////

let closeUpCanvas = document.getElementById("closeUpCanvas") 	//close up canvas
let longViewCanvas = document.getElementById("longViewCanvas") 	//full canvas

let canvasX, canvasY 											//location where mouse is pressed

let rocks = []													//rocks array, stores all rocks in the game
const numberRocks = 6											//number of rocks in the game (total)
let rockBeingMoved = null										//rock being dragged by mouse
const rockRadius = 10											//radius of rocks
let mouseDown = false
const friction = 1.2

let playingState = null

let socket = io('http://' + window.document.location.host)		// connecting to the server

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				INITIALIZE ROCKS
///////////////////////////////////////////////////////////////////////////////////////////////////////////

//ask for current rock array in the server
function askForRocks(){
	let dataObj = {rocksTest: []}
	let whatAreRocks = JSON.stringify(dataObj)
	socket.emit('askForRocks', whatAreRocks)
	socket.on('askForRocks', function(data) {
		let receivedRocks = JSON.parse(data)
		rockTest = receivedRocks.rockTest
		rockTest.length
		if (rockTest.length == 0) {initializeRocks()}
		else {
			rocks = rockTest
			document.getElementById("playerOneButton").disabled = receivedRocks.playerOneStatus
			document.getElementById("playerTwoButton").disabled = receivedRocks.playerTwoStatus
		}
	})
}

//initialize rocks if first player joining
function initializeRocks() {
	for (let i = 0; i < numberRocks; i++) {
		if (i < numberRocks/2) 	{ 
			let rock = { "colour": "grey", 		"x": i * 35 + 35,	"y": longViewCanvas.height - 50, 	"deltaX": 0,	"deltaY": 0, 	"owner": 1, 	"set": false, "moving": false} 
			rocks.push(rock)
		}
		else { 
			let rock = { "colour": "grey", 		"x": i * 35 + 35, 	"y": longViewCanvas.height - 50, 	"deltaX": 0,	"deltaY": 0, 	"owner": 2, 	"set": false,  "moving": false} 
			rocks.push(rock)
		}
	}
	let rockEmitArray = {rockArray: rocks}
	let rockString = JSON.stringify(rockEmitArray)
	socket.emit('newRockArray', rockString)
	socket.on('retrieveRocks', function(data) {
		let receivedRocks = JSON.parse(data)
		rocks = receivedRocks.rockArray
	})
}

//changes rock colour when player connects/disconnects
function changeRockColour(colour) {
	for (let i = 0; i < numberRocks; i++) {
		if (playingState == rocks[i].owner) {
			rocks[i].colour = colour
			let dataObj = {num: i, col: colour}
			let jsonString = JSON.stringify(dataObj)
			socket.emit('rocksColour', dataObj)
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				PROCESS DATA
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function handleMouseDown(e) {
	let rect = longViewCanvas.getBoundingClientRect()
	let canvasX = e.pageX - rect.left								//mouse location of x
	let canvasY = e.pageY - rect.top								//mouse location of y
	mouseDown = true
	
	rockBeingMoved = getRockAtLocation(canvasX, canvasY)			//sets rock being moved
	
	//if the player is touching their own rock, let them move it
	if (rockBeingMoved != null) {
		if(checkPlayer(rockBeingMoved)){
			longViewCanvas.addEventListener("mousemove", handleMouseMove)
			longViewCanvas.addEventListener("mouseup", handleMouseUp)
		}
		else {
			e.stopPropagation()
			e.preventDefault()
		}
	}
	e.stopPropagation()
	e.preventDefault()
}

function handleMouseMove(e) {
	let rect = longViewCanvas.getBoundingClientRect()
	let canvasX = e.pageX - rect.left
	let canvasY = e.pageY - rect.top

	if (rockBeingMoved != null) {
		rockBeingMoved.deltaX = rockBeingMoved.x - canvasX				//sets delta x
		rockBeingMoved.deltaY = rockBeingMoved.y - canvasY				//sets delta y
		if (rockBeingMoved.deltaX != 0 && rockBeingMoved.deltaY != 0) rockBeingMoved.moving = true
		drawLine(canvasX, canvasY)
	}
	
	e.stopPropagation()
}

function handleMouseUp(e) {
	mouseDown = false
	
	e.stopPropagation()
	
	longViewCanvas.removeEventListener("mousemove", handleMouseMove)
	longViewCanvas.removeEventListener("mouseup", handleMouseUp)

	update()
	render()
}

function handlePlayerOne() {
	playingState = 1
	
	let tempPlayer = {name: playingState}
	let jsonString = JSON.stringify(tempPlayer)
	socket.emit('newPlayer', jsonString)
	
	document.getElementById("infoBox").innerHTML = "You are player one. Your rocks are pink."
	document.getElementById("disconnectButton").disabled = false

	changeRockColour("pink")
	
	render()
}

function handlePlayerTwo() {
	playingState = 2
	
	let tempPlayer = {name: playingState}
	let jsonString = JSON.stringify(tempPlayer)
	socket.emit('newPlayer', jsonString)
	
	document.getElementById("infoBox").innerHTML = "You are player two. Your rocks are purple."
	document.getElementById("disconnectButton").disabled = false
	
	changeRockColour("purple")
	
	render()
}

function handleDisconnect() {
	changeRockColour("grey")
	let saveState = playingState
	playingState = null
	
	let tempPlayer = {name: saveState}
	let jsonString = JSON.stringify(tempPlayer)
	socket.emit('removePlayer', jsonString)
	
	document.getElementById("infoBox").innerHTML = "You are watching."
	
	document.getElementById("disconnectButton").disabled = true
	
	render()
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				UPDATE DATA
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function update() {
	updateReceived()
	
	//loop through rocks to move them
	for (let i = 0; i < rocks.length; i++) {
		handleRockCollision(rocks[i], i+1)
		if (Math.abs(rocks[i].deltaX) <= 0.12 && Math.abs(rocks[i].deltaY) <= 0.12) {rocks[i].moving = false}
		
		if (rocks[i].moving) {moveRock(rocks[i])}
		handleWallCollision(rocks[i])
	
		//send new rock data to server to update all clients
		let dataObj = {
			num: i, 
			x: rocks[i].x, 
			y: rocks[i].y, 
			dx: rocks[i].deltaX, 
			dy: rocks[i].deltaY
		}
		let jsonString = JSON.stringify(dataObj)
		socket.emit('rocksData', dataObj)
	}
	render()
}


//receives the rock data from server
function updateReceived(){
	socket.on('rocksData', function(data){
		//for(let i = 0; i<rocks.length; i++){
			//if (i == data.num) {
				rocks[data.num].x = data.x
				rocks[data.num].y = data.y
				rocks[data.num].dx = data.dx
				rocks[data.num].dy = data.dy
			//}
		//}
	})
	
	//update rock colour
	socket.on('rocksColour', function(data){
		for(let i = 0; i < rocks.length; i++){
			if (i == data.num) {rocks[i].colour = data.col}
		}
	})
	
	//update state of other players in the game
	socket.on('playersState', function(data){
		let playersTaken = JSON.parse(data)
		document.getElementById("playerOneButton").disabled = playersTaken.playerOne
		document.getElementById("playerTwoButton").disabled = playersTaken.playerTwo
		if (playingState == 1) {document.getElementById("playerTwoButton").disabled = true}
		else if (playingState == 2) {document.getElementById("playerOneButton").disabled = true}
	})
}

//moves a rock
function moveRock(rock) {
	rock.x += rock.deltaX
	rock.y += rock.deltaY
	
	rock.deltaX /= friction
	rock.deltaY /= friction
}

//collision with wall
function handleWallCollision(rock) {
	if ((rock.x + rockRadius >= longViewCanvas.width - 2) || (rock.x - rockRadius <= 2)) { 
		rock.deltaX *= -1
		if (rock.x - rockRadius <= 0) rock.x = rockRadius
		else rock.x = longViewCanvas.width - rockRadius
	}
	else if ((rock.y + rockRadius >= longViewCanvas.height - 2) || (rock.y - rockRadius <= 2))  { 
		rock.deltaY *= -1 
		if (rock.y - rockRadius <= 0) rock.y = rockRadius
		else rock.y = longViewCanvas.height - rockRadius
	}
}

//collision between rocks
function handleRockCollision(rock, numRocksChecked) {
	for(let i = numRocksChecked; i < rocks.length; i++){
		let xDifference = Math.abs(rocks[i].x - rock.x)							//the difference between the rocks in the x-coordinate
		let yDifference = Math.abs(rocks[i].y - rock.y)							//the difference between the rocks in the y-coordinate
		let differenceVector = Math.hypot(xDifference, yDifference)				//the total difference between the rocks
		let differenceAngle = Math.asin(yDifference, 2*rockRadius)				//the angle between the horizontal and line between rocks
		if(differenceVector <= 2*rockRadius) {									//there is a collision	
			rock.x -= (rocks[i].x - rock.x)/2
			rock.y -= (rocks[i].y - rock.y)/2
			
			rocks[i].x += (rocks[i].x - rock.x)/2
			rocks[i].y += (rocks[i].y - rock.y)/2
			
			xDifference = Math.abs(rocks[i].x - rock.x)	
			yDifference = Math.abs(rocks[i].y - rock.y)
			differenceVector = Math.hypot(xDifference, yDifference)	
			differenceAngle = Math.atan(yDifference, xDifference)
			
			reboundRock(rock, rocks[i], differenceAngle, differenceVector)			//rebounds rock
			reboundRock(rocks[i], rock, differenceAngle, differenceVector)			//rebounds rocks[i]
		}
	}
}

//rebounds one of the rocks off the other
function reboundRock(rock, otherRock, differenceAngle, differenceVector) {
	let incomingVector = Math.hypot(rock.deltaX, rock.deltaY)						//initial scalar of current rock vector
	let reflectionAngle = Math.PI/2 - differenceVector - Math.asin(Math.abs(rock.deltaX)/incomingVector)
	let reboundingAngle = differenceAngle - reflectionAngle
	let otherIncomingVector = Math.hypot(otherRock.deltaX, otherRock.deltaY)
	let otherReflectionAngle = Math.PI/2 - differenceVector - Math.asin(Math.abs(otherRock.deltaX)/otherIncomingVector)
	let otherReboundingAngle = differenceAngle - otherReflectionAngle
	let outgoingVector
	
	if (incomingVector <= 1) {outgoingVector = otherIncomingVector * Math.cos(reboundingAngle)}
	else if (otherIncomingVector <= 1) {outgoingVector = incomingVector * Math.sin(reboundingAngle)}
	else {outgoingVector = incomingVector * Math.sin(reboundingAngle) + incomingVector * Math.cos(otherReboundingAngle)}
	
	rock.deltaX = Math.cos(reboundingAngle) * outgoingVector 
	rock.deltaY = Math.sin(reboundingAngle) * outgoingVector
}

//get rocks at location of mouse
function getRockAtLocation(canvasX, canvasY) {
	let context = longViewCanvas.getContext("2d")
	for (let i = 0; i < rocks.length; i++) {
		let distanceX = Math.abs(rocks[i].x - canvasX)
		let distanceY = Math.abs(rocks[i].y - canvasY)
		let distanceFromRock = Math.hypot(distanceX, distanceY)
		if (distanceFromRock < rockRadius) { return(rocks[i]) }
	}
	return(null)
}

function checkPlayer(moved){										
	//call this when clicking on a rock, checks if the player is able to click it or not
	if (moved.owner == playingState) {return true}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				RENDER DATA
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function drawCloseCanvas(context) {

	closeUp = closeUpCanvas.getContext("2d");
	closeUp.fillStyle = "white"
	closeUp.fillRect(0, 0, longViewCanvas.width, longViewCanvas.height)

	closeUp.drawImage(context.canvas,  0,0, 250, 250, 0, 0, 600, 600);
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
	drawCloseCanvas(longViewCanvas.getContext("2d"))
	drawLongCanvas(longViewCanvas.getContext("2d"))
	
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				GAME LOOP
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function gameLoop() {
	if (!mouseDown) {
		update()
		render()
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				DOCUMENT EVENT LISTENER
///////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function() {
	askForRocks()
	longViewCanvas.addEventListener("mousedown", handleMouseDown)
	render()
	setInterval(gameLoop, 50)
})
