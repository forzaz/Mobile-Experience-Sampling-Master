/**
 * Main app functions
 * This file lists common function that one might want to change to customize the app.
 * 
 * This module is developed by BOSONIC.design in assignment of the department 
 * of Human-Technology Interaction @ Eindhoven, University of Technology.
 * 
 * info@bosonic.design || http://www.bosonic.design/
 * hti@tue.nl || https://www.tue.nl/en/university/departments/industrial-engineering-innovation-sciences/research/research-groups/human-technology-interaction/
 * 
 * Released on: April, 2018 in Experience Sampling App 1.0.1
 */

/*
	This function will be executed when the menu page opens.
*/
function init()
{
	//initialize app components
	survey.init();
	modules.forEach(function(module){
		if (typeof module.initModule === "function") {
			module.initModule();
		}
	});
	
	//Handle notifications
	scheduleNotifications();
	cordova.plugins.notification.local.on('click', onLocalNotification, this);
	
	window.FirebasePlugin.hasPermission(function(data){
		
		if(!data.isEnabled) window.FirebasePlugin.grantPermission();
		
		window.FirebasePlugin.subscribe("Announcement");
		window.FirebasePlugin.onNotificationOpen(onPushNotification, function(error) {
			console.error(error);
		});
	});
}

/*
	This function allows you to provide your own logic for rendering specific
	questions.
	- @var qID = question ID for question specified in database.
	- @return render = true or false depending if the question should be renderend; default = true.
*/
function renderQuestion(qID){
	var render = true;
	var date = new Date();//get date instance to know current timestamp.
	switch(qID)
	{
		case "31":
			//Example: only show question with id=31 in the weekend
			var day = date.getDay();//get the day; 0 = sunday, 6 = saturday
			if(day === 0 || day === 6) render = false;
			else render = true;
		break;
	}
	return render;
}

/*
	Schedules local notifications with specific parameters.
	Check https://github.com/katzer/cordova-plugin-local-notifications for more information.
*/
function scheduleNotifications(){

	cordova.plugins.notification.local.schedule([
		{ id: 1, // give unique ID..
			title: 'Fill out the morning survey!',// provide title..
			trigger: { every: { hour: 13, minute: 0 } }, // everyday at 11:00...
			smallIcon: 'res://calendar'
		},
		{ id: 2, 
			title: 'Fill out the evening survey!',
			trigger: { every: { hour: 22, minute: 0 } }, // and everyday at 22:00
			smallIcon: 'res://calendar'
		}
	]);
	
}

/*
	Fires when a local notification is clicked.
*/
function onLocalNotification(notification) {
	if(storage.getItem("login") === "true")
	{
		//check notification ID
		switch(notification.id)
		{
			case 1:
			case 2:
				//send to specific page accordingly
				if(navigator.connection.type !== Connection.NONE){	
					view.router.loadPage({url: 'survey.html', animatePages: false});
				}	else {
					myApp.alert("Please, make sure you have an internet connection to take the survey.","No internet connection");
				}
			break;
		}
	}
}

/*
	Fires when push notification is recieved/clicked.
*/
function onPushNotification(notification) {	
	CheckMessages(function(){
		if(notification.tap){
			//app was closed so, locate to the message page
			if(view.activePage.name === "messages") view.router.refreshPage()
			else view.router.loadPage({url: 'messages.html', animatePages: false});
		}
	});
}

/*
	Unschedule notifications callback when logging out.
*/
function unScheduleNotifications(){
	/*myApp.alert('notification are unscheduled');
	cordova.plugins.notification.local.getIds(function (ids) {
		myApp.alert('IDs: ' + ids.join(' ,'));
	});*/
}