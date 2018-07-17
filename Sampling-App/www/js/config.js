/**
 * SampleU 1.0.2
 * This mobile application and backend interface allows researchers to conduct experience sampling or ecological momentary intervention studies on Android and iOS.
 * 
 * This project is led by Chao Zhang, Daniël Lakens, and Karin Smolders from  
 * Human-Technology Interaction group at Eindhoven University of Technology
 * chao.zhang87@gmail.com || https://www.tue.nl/en/university/departments/industrial-engineering-innovation-sciences/research/research-groups/human-technology-interaction/
 * 
 * The development of the app, including the design and coding of the front and back-end, was greatly helped by BOSONIC.design
 * info@bosonic.design || http://www.bosonic.design/
 * 
 * Released on: July, 2018
 */

//KEEP THIS INFORMATION PRIVATE--------------------------------------------

//Provide login details for the webinterface that is connected to the server.
//This allows the app to retrieve information.
const USER_NAME 	= 'app_user_name'; 			//server interface username
const PASSWORD 		= 'app_user_password'; 		//server interface password
const WEB_BASE 		= 'https://yoursever.com'; 	//link to where the server interface is located
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