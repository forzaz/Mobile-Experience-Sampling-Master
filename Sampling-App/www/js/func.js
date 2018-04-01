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
		if (typeof module.initModule === "function" && qHTML === "") {
			qHTML = module.initModule();
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
			body = notification.content;
		}
	
		//store message in cache to retrieve it in message page.
		var dateString = date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
		storage.setItem("message"+n, dateString+"::"+body);
		storage.setItem("messages", Number(n)+1);
		
		if(notification.tap){
			//app was closed so, locate to the message page
			if(view.activePage.name === "messages") view.router.refreshPage()
			else view.router.loadPage({url: 'messages.html', animatePages: false});
		} else {
			//app is running, update menu page if that is open
			if(view.activePage.name === "menu")
			{
				var m = storage.getItem("readMessages");
				var d = (Number(n)+1)-Number(m);
				$$('#readMessages').html(d);
				$$('#readMessages').css('visibility','visible');
			}
		}
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
					storage.setItem("messages", "0");
					storage.setItem("readMessages", "0");
					if(data[2] === "1")
					{
						//this is a temporary password, let the user change it.
						view.router.loadPage('resetpassword.html');
					} else {
						storage.setItem("login","true");
						view.router.loadPage('menu.html');
					}
				}
				else
				{
					//wrong information, notify user.
					myApp.alert("Please try again.","Wrong username and/or password");
				}
			},
			error: function(xhr,status,error){
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
	email = $$("input#r_email").val();
	pass = $$("input#r_password").val();
	r_pass = $$("input#rr_password").val();
	
	//check if something is filled in, and is correct
	if(user && email && pass && r_pass && pass === r_pass)
	{
		//first get a token for the device
		window.FirebasePlugin.getToken(function(token) {
			
			//retrieve input again
			user 	= $$("input#r_username").val();
			email 	= $$("input#r_email").val();
			pass 	= $$("input#r_password").val();
			
			//send it to the server to register
			$$.ajax({
				url:WEB_BASE+"createUser.php"+AUTORIZATION+"&appUser="+user+"&appEmail="+email+"&appPass="+pass+"&token="+token,
				success: function(result){
					//data retrieved, see what it contains..
					var data = result.split("::");
					if(data[0]==="true")
					{
						//user could be registered, proceed with the app.
						storage.setItem("Uid",data[1]);
						storage.setItem("login","true");
						storage.setItem("messages", "0");
						storage.setItem("readMessages", "0");
						view.router.loadPage('menu.html');
						myApp.alert("Thank you for registering.","You are registered!");
					}
					else
					{
						//username or email already exists, user has to choose another one.
						myApp.alert("Username or email already exists, please choose another one.","Cannot create user");
					}
				},
				error: function(xhr,status,error){
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
	Recover Password
*/
function resetPassword()
{
	//get user input
	pass = $$("form#resetPassword input#password").val();
	r_pass = $$("form#resetPassword input#r_password").val();
	
	//check if passwords are the same
	if(pass === r_pass)
	{
		$$.ajax({
			url:WEB_BASE+"resetPassword.php"+AUTORIZATION+"&UID="+storage.getItem("Uid")+"&appPass="+pass,
			success: function(result){
				//data retrieved, see what it contains..
				var data = result.split("::");
				if(data[0]==="true")
				{
					//password has been reset
					myApp.alert("Thank you, your password has been changed.","Your password is changed");
					storage.setItem("login","true");
					view.router.loadPage('menu.html');
				}
				else
				{
					//for some reason the database was not updated.
					myApp.alert("Please, try again.","Something went wrong");
				}
			},
			error: function(xhr,status,error){
				//server does not respond.
				myApp.alert("Please make sure you have an internet connection .","No internet connection");
			}
		});
	} else {
		myApp.alert("Please make sure both fields contain the same password.","Passwords do not match");
	}
}

/*
	Recover Password
*/
function recoverPassword()
{
	//get user input
	r_email = $$("input#recovery_email").val();
	
	//check if something is filled in, and is correct
	if(r_email)
	{
		$$.ajax({
			url:WEB_BASE+"resetUser.php"+AUTORIZATION+"&appEmail="+r_email,
			success: function(result){
				//data retrieved, see what it contains..
				var data = result.split("::");
				if(data[0]==="true")
				{
					//password has been reset, notify user
					view.router.back();
					myApp.alert("A new password is send to your email adress.","We found your account!");
				}
				else
				{
					//email adres is not found.
					myApp.alert("Please fill in a valid email adress to reset your password.","No user found");
				}
			},
			error: function(xhr,status,error){
				//server does not respond.
				myApp.alert("Please make sure you have an internet connection to register an account.","No internet connection");
			}
		});
	} else {
		myApp.alert("Please fill in a valid email adress to reset your password.","No user found");
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
	/*myApp.alert('notification are unscheduled');
	cordova.plugins.notification.local.getIds(function (ids) {
		myApp.alert('IDs: ' + ids.join(' ,'));
	});*/
}