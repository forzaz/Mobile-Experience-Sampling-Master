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


//-------------------INITIALIZING APP------------//
//This code will be executed when launching the app.

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
	
	document.addEventListener("backbutton", onBackKeyDown, false);
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
	
	if(storage.getItem("messages") !== storage.getItem("readMessages"))
	{
		var n = storage.getItem("messages");
		var m = storage.getItem("readMessages");
		var d = Number(n)-Number(m);
		$$('#readMessages').html(d);
		$$('#readMessages').css('visibility','visible');
	}
});
myApp.onPageBeforeAnimation('menu', function (page) {
	if(storage.getItem("messages") === storage.getItem("readMessages")) $$('#readMessages').css('visibility','hidden');
});

//MESSAGES---------------------------
myApp.onPageInit('messages', function (page) {
	
	//check if messages are stored
	if(storage.getItem("messages") !== "0")
	{
		//iterate over stored messages to put them in HTML
		var html = "";
		var n = storage.getItem("messages");
		for(i = 0; i < Number(n); i++)
		{
			var message = storage.getItem("message"+i).split("::");
			var messageString = "<div class='messageBlock'><p class='time'>"+message[0]+"</p><p class='content'>"+message[1]+"</p></div>";
			html = messageString+html;
		}
		
		//display messages
		$$('#NoMessages').hide();
		$$(".page[data-page='messages'] .content-block").html(html);
	}
	
	//set messages as read
	storage.setItem("readMessages", storage.getItem("messages"));
});

//SURVEY-----------------------------
myApp.onPageAfterAnimation('survey', function (page) {
	
	//only allow people to take a survey when an internet connection is present.
	//if(navigator.connection.type !== Connection.NONE)
	//{
		//start survey
		var date = new Date();
		survey.startdate = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
		survey.retrieveQuestions();
		
	//} else {
		//notify user that they should have an internet connection in order to take a survey.
		//myApp.alert("Please, make sure you have an internet connection to take the survey.","No internet connection");
		//view.router.back({'url': 'menu.html', 'force': true});	
	//}
	
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