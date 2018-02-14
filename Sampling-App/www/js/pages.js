// Initialize app
var myApp = new Framework7();
var storage = window.localStorage;
var $$ = Dom7;
var view = myApp.addView('.view-main', {dynamicNavbar: true});
var FS;

//Create modules

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
	//App started
    view.hideNavbar(false);
	
	//storage.setItem("login", false);
	$$('#login').on('click', autorizeUser);
	
	if(storage.getItem("login") === "true")
	{
		view.router.loadPage('menu.html');
	}
	
	init();
});

// Handle page events
myApp.onPageInit('menu', function (page) {
	view.showNavbar(false);
});

myApp.onPageInit('survey', function (page) {
	var date = new Date();
	
	survey.startdate = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
	survey.retrieveQuestions();
});