// Initialize app
var myApp = new Framework7();
var storage = window.localStorage;
var $$ = Dom7;
var view = myApp.addView('.view-main', {dynamicNavbar: true, swipeback: false});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
	//App started	
	if(storage.getItem("login") === "true")	view.router.loadPage({url: 'menu.html', animatePages: false});
	else
	{
		view.hideNavbar(false);
		$$(".initializer").css("display","none");
		$$('#login').on('click', autorizeUser);
		storage.setItem("messages", 0);
	}
});

// Handle page events
myApp.onPageInit('register forget_password', function (page) {
	view.showNavbar(true);
});
myApp.onPageBack('register forget_password', function (page) {
	view.hideNavbar(true);
});


myApp.onPageInit('menu', function (page) {
	view.showNavbar(false);
	init();
});

myApp.onPageInit('messages', function (page) {
	if(storage.getItem("messages") !== "0")
	{
		$$('#NoMessages').hide();
		
		var html = "";
		var n = storage.getItem("messages");
		for(i = 0; i < Number(n); i++)
		{
			var message = storage.getItem("message"+i).split("::");
			var messageString = "<div class='messageBlock'><p class='time'>"+message[0]+"</p><p class='content'>"+message[1]+"</p></div>";
			html = messageString+html;
		}
		
		$$(".page[data-page='messages'] .content-block").html(html);
	}
});


myApp.onPageAfterAnimation('survey', function (page) {
	
	if(navigator.connection.type !== Connection.NONE)
	{
		var date = new Date();
		survey.startdate = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
		survey.retrieveQuestions();
	} else {
		myApp.alert("Please, make sure you have an internet connection to take the survey.","No internet connection");
		view.router.back({'url': 'menu.html', 'force': true});
	}
});