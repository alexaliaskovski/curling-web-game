/*

Open two browsers at http://localhost:3000/canvas.html

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

io.on('connection', function(socket){
	socket.on('rocksData', function(data){
		console.log('RECEIVED BOX DATA: ' + data)
		io.emit('rocksData', data) 					//broadcast to everyone including sender
	})
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//				CONSOLE.LOG START UP
///////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("Server Running at PORT: 3000	CTRL-C to quit")
console.log("To Test:")
console.log("Open several browsers at: http://localhost:3000/canvas.html")