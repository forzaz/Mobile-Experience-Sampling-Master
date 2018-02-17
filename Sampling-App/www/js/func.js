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

function scheduleNotifications(){
	//https://www.npmjs.com/package/cordova-plugin-local-notification
	cordova.plugins.notification.local.schedule([
		{ id: 1, 
			title: 'Fill out the morning survey!',
			trigger: { every: { hour: 9 } }
		},
    	{ id: 2, 
			title: 'Fill out the evening survey!',
			trigger: { every: { hour: 22 } }
		}
	]);
}

function renderQuestion(Qid){
	var render = true;
	var date = new Date();
	switch(Qid)
	{
		case "31":
			//Example: only show question with id=3 in the weekend
			var day = date.getDay();
			if(day === 0 || day === 6) render = false;
			else render = true;
		break;
	}
	return render;
}

function autorizeUser()
{
	window.FirebasePlugin.getToken(function(token) {
		user = $$("input#username").val();
		pass = $$("input#password").val();
		$$.ajax({
			url:WEB_BASE+"getUser.php"+AUTORIZATION+"&appUser="+user+"&appPass="+pass+"&token="+token,
			success: function(result){
				var data = result.split("::");
				if(data[0]==="true")
				{
					storage.setItem("Uid",data[1]);
					storage.setItem("login","true");
					view.router.loadPage('menu.html');
				}
				else
				{
					myApp.alert("Please try again.","Wrong username and/or password");
				}
			},
			error(xhr,status,error){
				myApp.alert("Please make sure you have an internet connection to register an account.","No internet connection");
			}
		});
	});
}

function registerUser()
{
	user = $$("input#r_username").val();
	pass = $$("input#r_password").val();
	r_pass = $$("input#rr_password").val();
	
	if(user && pass && r_pass && pass === r_pass)
	{
		window.FirebasePlugin.getToken(function(token) {
			
			user = $$("input#r_username").val();
			pass = $$("input#r_password").val();
			
			$$.ajax({
				url:WEB_BASE+"createUser.php"+AUTORIZATION+"&appUser="+user+"&appPass="+pass+"&token="+token,
				success: function(result){
					var data = result.split("::");
					if(data[0]==="true")
					{
						storage.setItem("Uid",data[1]);
						storage.setItem("login","true");
						view.router.loadPage('menu.html');
						myApp.alert("Registration correct");
					}
					else
					{
						myApp.alert("Username already exists, please choose another one.","Cannot create user");
					}
				},
				error(xhr,status,error){
					myApp.alert("Please make sure you have an internet connection to register an account.","No internet connection");
				}
			});

		}, function(error) {
			myApp.alert("Please make sure you have an internet connection to register an account.","No internet connection");
		});
	}
}

function init()
{
	window.FirebasePlugin.subscribe("Announcement");
	
	window.FirebasePlugin.onNotificationOpen(function(notification) {	
		var n = storage.getItem("messages");
		var date;
		var body;
		if(notification.tap){
			date = new Date(notification["google.sent_time"]);
			body = notification.content;
		}
		else{
			date = new Date();
			body = notification.body;
		} 
		
		var dateString = date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
		alert(dateString+"::"+body);
		storage.setItem("message"+n, dateString+"::"+body);
		storage.setItem("messages", Number(n)+1);
		
	}, function(error) {
		console.error(error);
	});
	
	microphoneManager.init();
	scheduleNotifications();
	cordova.plugins.notification.local.on('click', onActivateNotification, this);
}

function onActivateNotification(notification) {
	//myApp.alert('clicked: ' + notification.id);
}