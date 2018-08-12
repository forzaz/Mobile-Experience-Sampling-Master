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

//this variable stores question ID and type.
var qData = [];

var setup = new function() {
		
	/*
		This function will retrieve the setup items and start rendering them accordingly to HTML.
	*/
	this.retrieveQuestions = function(){
		
		//Create loading screen
		$$(".messageOverlay span").html("Loading question, wait a moment...");
		$$(".messageOverlay").css("display","table");
		
		//retrieve setup questions from server
		$$.ajax({
			url:WEB_BASE+"setupGet.php"+AUTORIZATION,
			success: function(results){
				setup.renderQuestions(results);
			},
			error: function(xhr,status,error){
				//server could not be reached, then get questions offline
				myApp.alert("Please make sure that you have internet connection to set up the app.","No internet connection");
				$$("#questions").html(status + " " + error);
			},
			timeout: 3000 // sets timeout to 3 seconds
		});
	};
	
	/*
		
	*/
	this.renderQuestions = function(result){
		var HTML = '';
		var labels;
		
		$$(".messageOverlay span").html("Rendering questions...");
		
		//get parameters for the questions and loop over them.
		var questions = result.split("<br/>");

		questions.pop();
		questions.forEach(function(question) {
			var data = question.split("::");//get parameters; 0 = qID, 1 = question name, 2 = question string, 3 = question type, 4 = labels, 5 = required boolean
			qData.push({name:"q"+data[1], Type:data[3], Required:data[5]});
				
			//render question
			if (data[3] != "Instruction") {
				qHTML = "";
				if(qHTML === "")
				{
					modules.forEach(function(module){
						if (typeof module.renderQuestions === "function" && qHTML === "") {
							qHTML = module.renderQuestions(data[3],data[1],data[4]);
						}
					});
				}
				
				if(qHTML === ""){
					console.log("WARNING: Question type not found for Question "+data[0]); //change??
				} 
				else {
					//render question
					HTML += "<p class='question'>"+data[2];
					if(data[5] === "1") HTML += " (required)"; 
					HTML += "</p>";
					HTML += qHTML;
				}	
			}
			//render instruction
			else {
				HTML += "<p class='instruction'>"+data[2];
				HTML += "</p>";
			}
		});

		//add setup questions to the screen
		HTML = $$("#questions #header").html()+HTML+$$("#questions #footer").html();
		$$("#questions").html(HTML);
		$$("#setup_submit").on('click', setup.send);
		
		//activate modules
		modules.forEach(function(module){
			if (typeof module.initOnPage === "function") {
				module.initOnPage();
			}
		});
		
		//clear loading screen
		$$(".messageOverlay").css("display","none");
	};
	
	
	/*
		Goes through all the questions and prepares a qID-value string to be send to the server.
	*/
	this.serialize = function(rID){	
		var string = "";
		var returnFalse = false;
		
		//loop through all questions and retrieve their values
		//if a question does not have an answer, but is required, returnFalse will be true.
		qData.forEach(function(q) {

			//save responses for questions of frequency "daily" in localStorage, in order to show them only once a day
			//save wakeup and sleep data for calculating notification dates
			switch(q.name)
			{
				case "qWakeupWeekday":
					storage.setItem("wakeupWeekday", $$("#questions [name='"+q.name+"']").val());
				break;
				case "qSleepWeekday":
					storage.setItem("sleepWeekday", $$("#questions [name='"+q.name+"']").val());
				break;
				case "qWakeupWeekend":
					storage.setItem("wakeupWeekend", $$("#questions [name='"+q.name+"']").val());
				break;
				case "qSleepWeekend":
					storage.setItem("sleepWeekend", $$("#questions [name='"+q.name+"']").val());
				break;
			}
			
			//add the input value to the string
			if (q.Type != "Instruction") {
				var info = {};
				info.val = "";
				info.checked = false;
				info.error = false;
				
				modules.forEach(function(module){
					if (typeof module.validate === "function" && info.checked === false) {
						info = module.validate(q.Type,q.name,q.Required,rID);
						if(info.error) returnFalse = true;
					}
				});
			
				if(info.val === ""){ info.val = "Empty";}
				string += "&"+q.name+"="+encodeURIComponent(info.val);
			}
		});

		
		//return false if a error is found, otherwise return the string with values
		if(returnFalse) return(false);
		else return(string);
	};
	
	/*
		Uploads questionaire values to the server for saving the response.
	*/
	this.send = function(){

		//check if there is a connection
		if(navigator.connection.type !== Connection.NONE)
		{
			//stop media.
			microphoneManager.stopPlay();
			
			//create loading overlay
			$$(".messageOverlay span").html("Sending response...");
			$$(".messageOverlay").css("display","table");
			
			//serialize (get values and make it a string) of the questions.
			var Rid = ""; //no need to save data offlie in setup, so use an empty string for Rid 
			var serialize = setup.serialize(Rid);
			if(serialize || serialize == ""){
				//questionaire is complete, send to server

				//use the wakeup and sleep data to schedule notifications
				var notifs=scheduleNotifications(storage.wakeupWeekday, storage.sleepWeekday, storage.wakeupWeekend, storage.sleepWeekend);
				notifs = notifs.replace(/ /g, "%20");

				$$.ajax({
					url:WEB_BASE+"setupSave.php"+AUTORIZATION+setup.response()+serialize+notifs,
					success: function(result){
						var data = result.split("::");

						if(data[0] === "success")
						{
							//everything went well, send user back to the menu page
							$$(".messageOverlay").css("display","none");
							myApp.alert("SampleU has been set up!","Thank you!");
							view.router.loadPage('menu.html');
						}
						else
						{
							//there is something wrong with the input - unkown error
							$$(".messageOverlay").css("display","none");
							myApp.alert('Your setup is not saved, please try again','Unkown error');
						}

					},
					error(xhr,status,error){
						//server not responding
						$$(".messageOverlay").css("display","none");
						myApp.alert('Your setup is not saved, please try again','Server is not responding');
					},
					timeout: 3000 // sets timeout to 3 seconds
				});
			} else {
				//a required question is not answered
				$$(".messageOverlay").css("display","none");
				myApp.alert("Pleae make sure you answer all the required questions (indicated in red).","Not all questions are answered");
			}
		} else {
			//there is no internet
			$$(".messageOverlay").css("display","none");
			myApp.alert("Please make sure that you have internet connection to set up the app.","No internet connection");
		}
	};
	
	/*
		Prepares meta information of the response to be send to the server
		- @return string = string including User ID and start date
	*/
	this.response = function(){
		return "&UID="+storage.getItem("Uid");
	};
};