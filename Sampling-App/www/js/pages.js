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


//-------------------INITIALIZING APP------------//
//This code will be executed when launching the app.

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
	
	document.addEventListener("backbutton", onBackKeyDown, false);
	document.addEventListener("resume", onResume, false);
	document.addEventListener("online", survey.uploadResponses, false);
	
	// Check if user is logged in and send him to menu.html...
	if(storage.getItem("login") === "true")	view.router.loadPage({url: 'menu.html', animatePages: false});
	else
	{
		// Or allow the user to log in.
		view.hideNavbar(false);
		$$(".initializer").css("display","none");
		$$('#login').on('click', autorizeUser);
	}
});

//-------------------PAGE EVENTS------------//
//This code will execute on specific pages

//LOGIN PAGE-------------------------
myApp.onPageInit('login', function (page) {
	$$(".initializer").css("display","none");
	$$('#login').on('click', autorizeUser);
});

//REGISTERING-------------------------
myApp.onPageInit('register forget_password', function (page) {
	view.showNavbar(true);
});
myApp.onPageBack('register forget_password', function (page) {
	view.hideNavbar(true);
});

//MAIN MENU---------------------------
myApp.onPageInit('menu', function (page) {
	view.showNavbar(false);
	$$('#logout').on('click', logout);
	init();
	CheckMessages();
	UpdateMenuPage();
});
myApp.onPageBeforeAnimation('menu', function (page) {
	if(storage.getItem("messages") === storage.getItem("readMessages")) $$('#readMessages').css('visibility','hidden');
	CheckMessages();
});

//MESSAGES---------------------------
myApp.onPageInit('messages', function (page) {
	UpdateMessagePage();
});

//SURVEY-----------------------------
myApp.onPageAfterAnimation('survey', function (page) {
	//start survey
	var date = new Date();
	survey.startdate = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
	if (typeof storage.surveyPage == "undefined") {
		storage.setItem("surveyPage", 1);
	}
	survey.retrieveQuestions();
});

//SETUP-----------------------------
myApp.onPageAfterAnimation('setup', function (page) {
	//start setup
	setup.retrieveQuestions();
});

//ANDROID BACK KEY NAVIGATION-----------
function onBackKeyDown()
{
	//get current page name
	switch(view.activePage.name)
	{
		//go one page back
		case "messages":
		case "register":
		case "forget_password":
			view.router.back();
		break;
		case "menu":
		case "login":
			navigator.app.exitApp();
		break;
	}
}

//CORDOVA RESUME APPLICATION-----------
function onResume()
{
	if(view.activePage.name == "menu") CheckMessages();
}