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
	//scheduleNotifications();
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
function renderQuestion(qID, qFrequency){
	var render = true;
	var date = new Date();//get date instance to know current timestamp.
	var now = date.getTime();
	//to count midnight hours as late evening of the previous day
	var currentHour = date.getHours();
	if (currentHour <= 4) {
		now -= (currentHour+1) * 60 * 60 * 1000
		date = new Date(now);
	}
	switch(qFrequency)
	{
		case "Weekend":
			//Example: only show question with id=31 in the weekend
			var day = date.getDay();//get the day; 0 = sunday, 6 = saturday
			if(day === 0 || day === 6) render = false;
			else render = true;
		break;

		case "Daily":
			//Example: sleep diary to be shown only once a day
			var key = "q"+ qID + "_" + date.getFullYear() + "_" + (date.getMonth()+1) + "_" + date.getDate();
			if (storage.getItem(key)) render = false;
			else render = true;
		break;
	}
	return render;
}

/*
	Schedules local notifications with specific parameters.
	Check https://github.com/katzer/cordova-plugin-local-notifications for more information.
*/
function scheduleNotifications(wakeupWeekday, sleepWeekday, wakeupWeekend, sleepWeekend){

	var date1, date2, date3, date4, date5;
	var interval1, interval2, interval3, interval4, interval5;
	var a, b, c, d, e;

	//Declare variables for present time
	var dateObject = new Date();
	var now = dateObject.getTime();
	var dayOfWeek = dateObject.getDay(), currentHour = dateObject.getHours(), currentMinute = dateObject.getMinutes(); 
	
	//Extract data for wakeup and sleep time (to be changed to extract from data)
	var wakeupHourWeekday = parseInt(wakeupWeekday.split(":")[0]);
	var wakeupMinuteWeekday = parseInt(wakeupWeekday.split(":")[1]);
	var sleepHourWeekday = parseInt(sleepWeekday.split(":")[0]);
	if (sleepHourWeekday <= 12) {
		sleepHourWeekday += 24;
	}
	var sleepMinuteWeekday = parseInt(sleepWeekday.split(":")[1]);
	var wakeupHourWeekend = parseInt(wakeupWeekend.split(":")[0]);
	var wakeupMinuteWeekend = parseInt(wakeupWeekend.split(":")[1]);
	var sleepHourWeekend = parseInt(sleepWeekend.split(":")[0]);
	if (sleepHourWeekend <= 12) {
		sleepHourWeekend += 24;
	}
	var sleepMinuteWeekend = parseInt(sleepWeekend.split(":")[1]);

	var startHour, startMinute, endHour, endMinute; //start time and end time of notifications
	var nightlyLag, awakeInterval, step; // interval between now and the first notification date; interval between start time and end time

	var data = "";

	for (i = 0; i < 14; i++) {
		var notifDay = dayOfWeek + 1 + i
		if (notifDay > 7) {
			notifDay -= 7;
		}
		if (notifDay == 5) {
			startHour = wakeupHourWeekday;
			startMinute = wakeupMinuteWeekday;
			endHour = sleepHourWeekend;
			endMinute = sleepMinuteWeekend;
		}
		else if (notifDay == 6) {
			startHour = wakeupHourWeekend;
			startMinute = wakeupMinuteWeekend;
			endHour = sleepHourWeekend;
			endMinute = sleepMinuteWeekend;
		}
		else if (notifDay == 7) {
			startHour = wakeupHourWeekend;
			startMinute = wakeupMinuteWeekend;
			endHour = sleepHourWeekday;
			endMinute = sleepMinuteWeekday;
		}
		else {
			startHour = wakeupHourWeekday;
			startMinute = wakeupMinuteWeekday;
			endHour = sleepHourWeekday;
			endMinute = sleepMinuteWeekday;
		}

		nightlyLag = (((((24 - parseInt(currentHour) + parseInt(startHour))*60) - parseInt(currentMinute) + parseInt(startMinute))*60)*1000);
		awakeInterval = (((((parseInt(endHour) - parseInt(startHour))*60) + parseInt(endMinute) - parseInt(startMinute))*60)*1000) - 2 * 60*60*1000;
		step = parseInt(awakeInterval / 4);


		//Then time for notifications is calculated as a random time within the range of + or - 60 minutes of the anchors. It is represented as the interval between the current time and the time of that notification
		interval1 = (parseInt(nightlyLag) + 60*60*1000 + parseInt(Math.round((Math.random()*2 - 1)*60*60*1000)) + ((parseInt(86400)*parseInt(i))*1000));
        interval2 = (parseInt(nightlyLag) + 60*60*1000 + parseInt(Math.round((Math.random()*2 - 1)*60*60*1000)) + ((parseInt(86400)*parseInt(i))*1000)) + step;
        interval3 = (parseInt(nightlyLag) + 60*60*1000 + parseInt(Math.round((Math.random()*2 - 1)*60*60*1000)) + ((parseInt(86400)*parseInt(i))*1000)) + step*2;
        interval4 = (parseInt(nightlyLag) + 60*60*1000 + parseInt(Math.round((Math.random()*2 - 1)*60*60*1000)) + ((parseInt(86400)*parseInt(i))*1000)) + step*3;
        interval5 = (parseInt(nightlyLag) + 60*60*1000 + parseInt(Math.round((Math.random()*2 - 1)*60*60*1000)) + ((parseInt(86400)*parseInt(i))*1000)) + step*4;

        //This part of the code calculates a unique ID for each notification
        a = 101+(parseInt(i)*100);
        b = 102+(parseInt(i)*100);
        c = 103+(parseInt(i)*100);
        d = 104+(parseInt(i)*100);
        e = 105+(parseInt(i)*100);

        //This part of the code calculates the time when the notification should be sent by adding the time interval to the current date and time        
        date1 = new Date(now + interval1);
        date2 = new Date(now + interval2);
        date3 = new Date(now + interval3);
        date4 = new Date(now + interval4);
        date5 = new Date(now + interval5);

        d1 = date1.getFullYear()+"-"+(date1.getMonth()+1)+"-"+date1.getDate()+" "+date1.getHours()+":"+date1.getMinutes()+":"+date1.getSeconds();
        d2 = date2.getFullYear()+"-"+(date2.getMonth()+1)+"-"+date2.getDate()+" "+date2.getHours()+":"+date2.getMinutes()+":"+date2.getSeconds();
        d3 = date3.getFullYear()+"-"+(date3.getMonth()+1)+"-"+date3.getDate()+" "+date3.getHours()+":"+date3.getMinutes()+":"+date3.getSeconds();
        d4 = date4.getFullYear()+"-"+(date4.getMonth()+1)+"-"+date4.getDate()+" "+date4.getHours()+":"+date4.getMinutes()+":"+date4.getSeconds();
        d5 = date5.getFullYear()+"-"+(date5.getMonth()+1)+"-"+date5.getDate()+" "+date5.getHours()+":"+date5.getMinutes()+":"+date5.getSeconds();

        //This part of the code schedules the notifications
        cordova.plugins.notification.local.schedule({icon: 'ic_launcher', id: a, trigger: {at: date1}, text: 'Time for your next Survey!', title: "Hello, I'm back"});
        cordova.plugins.notification.local.schedule({icon: 'ic_launcher', id: b, trigger: {at: date2}, text: 'Time for your next Survey!', title: "Hello, I'm back"});
        cordova.plugins.notification.local.schedule({icon: 'ic_launcher', id: c, trigger: {at: date3}, text: 'Time for your next Survey!', title: "Hello, I'm back"});
        cordova.plugins.notification.local.schedule({icon: 'ic_launcher', id: d, trigger: {at: date4}, text: 'Time for your next Survey!', title: "Hello, I'm back"});
        cordova.plugins.notification.local.schedule({icon: 'ic_launcher', id: e, trigger: {at: date5}, text: 'Time for your next Survey!', title: "Hello, I'm back"});

        data += "&n"+a+"="+d1+"&n"+b+"="+d2+"&n"+c+"="+d3+"&n"+d+"="+d4+"&n"+e+"="+d5;
	}
	return(data);
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