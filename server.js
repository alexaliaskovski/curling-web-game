/*

	Alexandra Liaskovski-Balaba
	101071309
	alexandraliaskovskib@cmail.carleton.ca
	
	Howard Zhang
	101069043
	howardzhang@cmail.carleton.ca
	
	COMP2406 - Assignment #3
	server.js
	8th November 2018, 10pm
	
	Testing: The page can be found at http://localhost:3000/assignment3.html in the browser
	
*/


///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				GLOBALS
///////////////////////////////////////////////////////////////////////////////////////////////////////////

const app = require('http').createServer(handler)
const io = require('socket.io')(app) 				//wrap server app in socket io capability
const fs = require('fs') 							//file system to server static files
const url = require('url'); 						//to parse url strings
const PORT = process.env.PORT || 3000 				//useful if you want to specify port through environment variable
const ROOT_DIR = 'html' 							//dir to serve static files from
let players = [null, null]							//current players in the game
let rocks = []										//rocks that are in play

let playerOneDisabled = false
let playerTwoDisabled = false

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				MIME TYPES
///////////////////////////////////////////////////////////////////////////////////////////////////////////

const MIME_TYPES = {
	css: 	"text/css",
	gif: 	"image/gif",
	htm: 	"text/html",
	html: 	"text/html",
	ico: 	"image/x-icon",
	jpeg: 	"image/jpeg",
	jpg:	"image/jpeg",
	js: 	"application/javascript",
	json: 	"application/json",
	png: 	"image/png",
	svg: 	"image/svg+xml",
	txt: 	"text/plain"
}

//receive updated rock info and resend to all 
io.on('connection', function(socket){
	socket.on('rocksData', function(data){
		//console.log(rocks)
		console.log('RECEIVED BOX DATA: ' + data)
		rocks[data.num].x = data.x
		rocks[data.num].y = data.y
		rocks[data.num].dx = data.dx
		rocks[data.num].dy = data.dy
		io.emit('rocksData', data)
	})
})

//user requests for current rock array when joining the game
io.on('connection', function(socket){
	socket.on('askForRocks', function(data){
		console.log('RECEIVED BOX DATA: ' + data)
		let dataObj = {
			rockTest: rocks,
			playerOneStatus: playerOneDisabled,
			playerTwoStatus: playerTwoDisabled
		}
		let resendArray = JSON.stringify(dataObj)
		io.emit('askForRocks', resendArray)
	})
})

//updates rock colours (for user connect/disconnect)
io.on('connection', function(socket){
	socket.on('rocksColour', function(data){
		console.log('RECEIVED BOX DATA: ' + data)
		for(let i = 0; i<rocks.length; i++){
			if (i == data.num) {rocks[i].colour = data.col}
		}
		io.emit('rocksColour', data) 				//broadcast to everyone including sender
	})
})

//populates rock array in the server
io.on('connection', function(socket){
	socket.on('newRockArray', function(data){
		let receivedData = JSON.parse(data)
		rocks = receivedData.rockArray
		
		let dataObj = {rockArray: rocks}
		let resendArray = JSON.stringify(dataObj)
		io.emit("retrieveRocks", resendArray)
	})
})

//handles adding a new player to the game
io.on('connection', function(socket){
	socket.on('newPlayer', function(data){
		let receivedData = JSON.parse(data)
		player = {name: receivedData.name}
		if(players[player.name - 1] == null){
			players[player.name - 1] = player
			if (player.name == 1) {playerOneDisabled = true}
			else if (player.name == 2) {playerTwoDisabled = true}
			
			let playerData = {playerOne: playerOneDisabled, playerTwo: playerTwoDisabled}
			console.log(playerData)
			let emitData = JSON.stringify(playerData)
			io.emit('playersState', emitData)
		}
	})
})

//handles removing a player from the game
io.on('connection', function(socket){
	socket.on('removePlayer', function(data){
		let receivedData = JSON.parse(data)
		player = {name: receivedData.name}
		if(players[player.name - 1] != null) {
			players[player.name - 1] = null
			console.log(player.name)
			if (player.name == 1) {playerOneDisabled = false}
			else if (player.name == 2) {playerTwoDisabled = false}
			
			let playerData = {playerOne: playerOneDisabled, playerTwo: playerTwoDisabled}
			let emitData = JSON.stringify(playerData)
			io.emit('playersState', emitData)
		}
	})
})

function get_mime(filename) {
	for (let ext in MIME_TYPES) {
		if (filename.indexOf(ext, filename.length - ext.length) !== -1) { return MIME_TYPES[ext] }
	}
	return MIME_TYPES["txt"]
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				SERVER
///////////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(PORT) 									//start server listening on PORT

function handler(request, response) {
	let urlObj = url.parse(request.url, true, false)
	console.log("\n============================")
	console.log("PATHNAME: " + urlObj.pathname)
	console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
	console.log("METHOD: " + request.method)

	let receivedData = ""

	//attached event handlers to collect the message data
	request.on("data", function(chunk) { receivedData += chunk })

	//event handler for the end of the message
	request.on("end", function() {
		console.log("REQUEST END: ")
		console.log("received data: ", receivedData)
		console.log("type: ", typeof receivedData)

		if (request.method == "GET") {
			//handle GET requests as static file requests
			fs.readFile(ROOT_DIR + urlObj.pathname, function(err, data) {
				if (err) {
					//report error to console
					console.log("ERROR: " + JSON.stringify(err))
					//respond with not found 404 to client
					response.writeHead(404)
					response.end(JSON.stringify(err))
					return
				}
				response.writeHead(200, {
					"Content-Type": get_mime(urlObj.pathname)
				})
				response.end(data)
			})
		}
	})
}




///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				CONSOLE.LOG START UP
///////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("Server Running at PORT: 3000	CTRL-C to quit")
console.log("To Test:")
console.log("Open several browsers at: http://localhost:3000/assignment3.html")
