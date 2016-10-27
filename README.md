##Udacity Project Restaurant review app
###Instructions:

1. Git clone project
2. Open terminal, cd to '/project folder'
2. Terminal run: npm install
3. Terminal run: gulp serve:dist
		- Runs app (google chrome will initialize) 
4. For developer mode instead, terminal run: gulp serve 
		- Runs app (google chrome will initialize) 
		- Should start the server for live editing
		- Edit in src files only
		- Edit main.scss, not main.css file

####Note

- Google chrome is recommended for developers
- To change to Mozilla Firefox as default for gulp
	1. Open gulpfile.js in project folder
	2. Look for (Line: 42) --> browser: "google chrome"
	3. Change it to --> browser: "firefox" 