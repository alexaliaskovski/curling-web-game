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
			2. Click on either the "Join as Player 1" or "Join as Player 2" buttons to join as a player. If the buttons are greyed out, there are already too many players and you cannot join right now.
			3. If there are already two players currently playing, you cannot interact with any of the rocks, but you are free to watch.
			4. If you are one of the players, you can interact with the rocks. Click and drag on one of the rocks (note that you cannot interact with rocks that are not yours) to move them. The further you drag, the stronger the force applied to the rock will be.
			5. When you're done playing, press the disconnect button to leave the game. If you close the browser before disconnecting, other players won't be able to play. When a player clicks the disconnect button, any other player can join as that player now. They will continue with the rocks where the last player left off. 

Issues:
- When leaving the app open and restarting the server, the program would crash with an error. Make sure to close all instances of the game before restarting the server.
- Collisions between rocks while there is only one instance of the game open work (moderately) fine. Collisions between difference players' rocks don't always work properly. Please test the collisions with only one tab open first. 
- As long as there are no collisions between rocks (when multiple tabs are open) the game works perfectly fine. 
