/**
 * Experience Sampling App 1.0.1
 * This app allows researchers to conduct surveys remotely using the mobile phone on Android and iOS.
 * 
 * This app is developed by BOSONIC.design in assignment of the department 
 * of Human-Technology Interaction @ Eindhoven, University of Technology.
 * 
 * info@bosonic.design || http://www.bosonic.design/
 * hti@tue.nl || https://www.tue.nl/en/university/departments/industrial-engineering-innovation-sciences/research/research-groups/human-technology-interaction/
 * 
 * Released on: April, 2018
 */

//KEEP THIS INFORMATION PRIVATE--------------------------------------------

//Provide login details for the webinterface that is connected to the server.
//This allows the app to retrieve information.
const USER_NAME 	= 'app_user_name'; 			//server interface username
const PASSWORD 		= 'app_user_password'; 		//server interface password
const WEB_BASE 		= 'http://yourweb.com'; 	//link to where the server interface is located
const AUTORIZATION 	= "?user="+USER_NAME+"&pass="+PASSWORD; 	//<-- no need to change

//CAMERA MODULE CONFIG
//Define the quality of the pictures that need to be saved on the server.
const PIC_QUALITY 	= 50;	// Some common settings are 20, 50, and 100
const PIC_WIDTH 	= 200;	// Width of the picture saved on the server
const PIC_HEIGHT 	= 200;	// Height of the picture saved on the server

//GEOLOCATION MODULE CONFIG
//Specify latitude and longitude of the maps initialization when the users GPS is turned off.
const STANDARD_LAT = 51.44164199999999; //Current cordinates are set on Eindhoven, the Netherlands.
const STANDARD_LNG = 5.469722499999989;


// Initialize app variables
var myApp = new Framework7();
var storage = window.localStorage;
var $$ = Dom7;
var view = myApp.addView('.view-main', {dynamicNavbar: true, swipeback: false});
var modules = [];