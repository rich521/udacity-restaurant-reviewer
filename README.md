####Instructions:

1. Git clone project, open terminal, cd to /project folder
2. Terminal run: npm install
3. Terminal run: gulp serve:dist
		- Runs app (google chrome will initialize) 
		- Should start the server for live editing
		- Edit in src files only
		- Edit main.scss, not main.css file
4. For developer mode instead, terminal run: gulp serve 

###Note

- Project is not compatible with Safari at the moment (Fecth & Promise api limitations)
- Use google chrome or mozilla to run app 
- To change to Mozilla Firefox as default for gulp
	1. Open gulpfile.js in project folder
	2. Look for (Line: 23) --> browser: "google chrome"
	3. Change it to --> browser: "firefox" 