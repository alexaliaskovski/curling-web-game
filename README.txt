/*

	Alexandra Liaskovski-Balaba
	101071309
	alexandraliaskovskib@cmail.carleton.ca
	
	Howard Zhang
	101069043
	howardzhang@cmail.carleton.ca
	
	COMP2406 - Assignment #3
	README
	8th November 2018, 10pm
	
	Testing: The page can be found at http://localhost:3000/assignment3.html in the browser
	
*/

Files:			server.js
				html/assignment3.html
				html/canvas.js
				node_modules/... (it is recommended to reinstall the node modules, will elaborate on this later)
				
Node Version:	v8.11.4
OS:				Windows 10
Required Code:	node.js and socket.io
				To install node:
					1. Go to nodejs.org to download node (for windows users, 8.12.0 LTS should be used)
					2. Execute the installing when downloaded from browser
					3. After installation, restart the computer
					4. To test to make sure node was installed, open the command prompt, and type "node -v" (this will display the version number if installed correctly)
					
				To install socket.io:
				1. Open your command prompt.
				2. Using the command prompt, navigate to the folder in which your source code is located (in this case, navigate to where server.js is located)
				3. Enter "npm install socketio --save", this will download the required code used to run the program.
				

Launch:			1. In the command prompt, navigate to the directory containing the server.js file (using cd command)
				2. In the command prompt, type "node server.js" - this will create the server
				3. In the chrome web browser, go to http://localhost:3000/assignment3.html

Execution:			
			1. When first launching the app, all rocks will be grey, meaning that they cannot be used by anyone at the moment.
			2. Enter your name in the textbox, and press the "Submit Request" button; this will assign you to three of the rocks.
			3. If there are already two players currently playing, you will be placed in the spectator queue, where you cannot interact with any of the rocks, but you are free to watch. Note that you'll still be asked for your name before you can play. Once one of the players leave the game, the first spectator to join the game will be assigned to one of the player slots.
			4. If you are one of the players, you can interact with the rocks. Click and drag on one of the rocks (note that you cannot interact with rocks that are not yours) to move them. The further you drag, the stronger the force applied to the rock will be.

Issues:
- When leaving the app open and restarting the server, the program would crash with an error.
