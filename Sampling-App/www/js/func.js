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
 * Released on: March, 2018 in Experience Sampling App 1.0.0
 */

/*
	This function will be executed when the menu page opens.
*/
function init()
{
	microphoneManager.init();
	
	//Handle notifications
	scheduleNotifications();
	cordova.plugins.notification.local.on('click', onLocalNotification, this);
	window.FirebasePlugin.subscribe("Announcement");
	window.FirebasePlugin.onNotificationOpen(onPushNotification, function(error) {
		console.error(error);
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
	cordova.plugins.notification.local.getIds(function (ids) {
		myApp.alert('IDs: ' + ids.join(' ,'));
	});
	
	//check if notifications are scheduled..
	cordova.plugins.notification.local.isScheduled(1, function (scheduled) {
			myApp.alert('notification is ' + scheduled);
			if(!scheduled){
				myApp.alert('notification are scheduled');
				//.. if not schedule notifications
				cordova.plugins.notification.local.schedule([
					{ id: 1, // give unique ID..
						title: 'Fill out the morning survey!',// provide title..
						trigger: { every: { hour: 11 } } // everyday at 11:00...
					},
					{ id: 2, 
						title: 'Fill out the evening survey!',
						trigger: { every: { hour: 22 } } // and everyday at 22:00
					}
				]);	
			}
    });
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
		var n = storage.getItem("messages");
		var date; var body;
		
		//retrieve contents of push notification
		if(notification.tap){
			//get contents when notification is tapped
			date = new Date(notification["google.sent_time"]);
			body = notification.content;
		}
		else{
			//get contents when notification is recieved while the app is open
			date = new Date();
			body = notification.body;
		} 
	
		//store message in cache to retrieve it in message page.
		var dateString = date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
		storage.setItem("message"+n, dateString+"::"+body);
		storage.setItem("messages", Number(n)+1);
}

/*
	This function will execute when the user tries to log into the app.
*/
function autorizeUser()
{
	//first get a token for the device
	window.FirebasePlugin.getToken(function(token) {
		//get user input
		user = $$("input#username").val();
		pass = $$("input#password").val();
		
		//send it to the server to validate it
		$$.ajax({
			url:WEB_BASE+"getUser.php"+AUTORIZATION+"&appUser="+user+"&appPass="+pass+"&token="+token,
			success: function(result){
				//data retrieved, see what it contains..
				var data = result.split("::");
				if(data[0]==="true")
				{
					//correct login information, proceed using the app.
					storage.setItem("Uid",data[1]);
					storage.setItem("login","true");
					view.router.loadPage('menu.html');
				}
				else
				{
					//wrong information, notify user.
					myApp.alert("Please try again.","Wrong username and/or password");
				}
			},
			error(xhr,status,error){
				//server does not respond.
				myApp.alert("Please make sure you have an internet connection to register an account.","No internet connection");
			}
		});
	});
}

/*
	This function will execute when the user register himself through the app.
*/
function registerUser()
{
	//get user input
	user = $$("input#r_username").val();
	pass = $$("input#r_password").val();
	r_pass = $$("input#rr_password").val();
	
	//check if something is filled in, and is correct
	if(user && pass && r_pass && pass === r_pass)
	{
		//first get a token for the device
		window.FirebasePlugin.getToken(function(token) {
			
			//retrieve input again
			user = $$("input#r_username").val();
			pass = $$("input#r_password").val();
			
			//send it to the server to register
			$$.ajax({
				url:WEB_BASE+"createUser.php"+AUTORIZATION+"&appUser="+user+"&appPass="+pass+"&token="+token,
				success: function(result){
					//data retrieved, see what it contains..
					var data = result.split("::");
					if(data[0]==="true")
					{
						//user could be registered, proceed with the app.
						storage.setItem("Uid",data[1]);
						storage.setItem("login","true");
						view.router.loadPage('menu.html');
						myApp.alert("Thank you for registering.","You are registered!");
					}
					else
					{
						//username already exists, user has to choose another one.
						myApp.alert("Username already exists, please choose another one.","Cannot create user");
					}
				},
				error(xhr,status,error){
					//server does not respond.
					myApp.alert("Please make sure you have an internet connection to register an account.","No internet connection");
				}
			});

		}, function(error) {
			//server does not respond.
			myApp.alert("Please make sure you have an internet connection to register an account.","No internet connection");
		});
	}
}

/*
	This function will execute when the user wants to logout.
*/
function logout(){
	//clear cache information
	storage.clear();
	cordova.plugins.notification.local.clearAll(unScheduleNotifications);
	
	//return to index page.
	view.hideNavbar(true);
	view.router.back({
	  url: 'index.html', // - in case you use Ajax pages
	  force: true
	});
	
	//Tell the user that logging out was succesfull
	myApp.alert('Thank you for using the app.','You are logged out.');
}

/*
	Unschedule notifications callback when logging out.
*/
function unScheduleNotifications(){
	myApp.alert('notification are unscheduled');
	cordova.plugins.notification.local.getIds(function (ids) {
		myApp.alert('IDs: ' + ids.join(' ,'));
	});
}