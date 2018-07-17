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
var survey = new function() {
	
	//Set timestamp for when the questionaire was started
	this.startdate = null;
	
	//SQL database for saving information
	this.db = null;

	//index of the last page of survey
	this.lastPage = null;
	
	//retrieved questionnaire data for the current survey
	this.results = null;

	//temporary data for the current session (abandoned if the app is killed)
	this.temp = null;

	/*
		This function needs to be executed everytime the users opens the app.
		It will initialize the database and upload offline responses if these exist.
		- @var callback = instead of checking the upload of questions, the offline database is initialized
	*/
	this.init = function(callback = null){
		//remove the counter for the current survey page before a new survey starts
		storage.removeItem("surveyPage");

		survey.db = window.sqlitePlugin.openDatabase({name: 'data.db', location: 'default'}, function (db) {
			db.executeSql('CREATE TABLE IF NOT EXISTS Questions (Qid, Qname, Question, Type, Labels, Required, Frequency, Page)');
			db.executeSql('CREATE TABLE IF NOT EXISTS Responses (Rid, SerializedString, StartDate, EndDate, Required)');
			db.executeSql('CREATE TABLE IF NOT EXISTS Uploads   (Rid, Name, Format, Uri)');
			
			if(typeof callback === "function") callback();
			else survey.uploadResponses();
		}, function(error){
			myApp.alert("Something went wrong, please re-install the app.","Internal error");
		});
	};
	
	/*
		This function will retrieve the questionaire items and start rendering them accordingly to HTML.
		- @var callback = instead of rendering the questions directly, the callback function will be called.
	*/
	this.retrieveQuestions = function(callback = null){

		//Clear the temporary data
		survey.temp = "";
		
		//Create loading screen
		$$(".messageOverlay span").html("Loading question, wait a moment...");
		$$(".messageOverlay").css("display","table");
		
		//Check for internet
		if(navigator.connection.type !== Connection.NONE)
		{
			//We are online, retrieve questions from server
			$$.ajax({
				url:WEB_BASE+"questionaireGet.php"+AUTORIZATION,
				success: function(results){
					
					//Empty offline saved questions
					survey.db.transaction(function (db) {
						db.executeSql("DELETE FROM Questions");
					});
					
					//Save the downloaded questions in the offline database
					var query = "INSERT INTO Questions (Qid, Qname, Question, Type, Labels, Required, Frequency, Page) VALUES (?,?,?,?,?,?,?,?)"; 
					var questions = results.split("<br/>");
					questions.pop();
					questions.forEach(function(question) {
						var data = question.split("::");//get parameters; 0 = qID, 1 = question name, 2 = question string, 3 = question type, 4 = labels, 5 = required boolean, 6 = frequency, 7 = page number.
						survey.db.transaction(function (db) {
							db.executeSql(query,data);
						});
					});

					survey.results = results;
					//get index of first and last page
					survey.getLastPage(survey.results);
					
					//callback
					if(typeof callback === "function") callback();
					else survey.renderQuestions(survey.results);
	
				},
				error: function(xhr,status,error){
					//server could not be reached, then get questions offline
					survey.retrieveQuestionsOffline();
				}
			});
		}
		else
		{
			//We are offline, retrieve questions from offline database
			survey.retrieveQuestionsOffline();
		}
	};
	
	/*
		This function will get the questionaire items from the offline database and renders them accordingly.
		If no questions exists in the database yet, the user will be send back to the menu page with an internet warning.
	*/
	this.retrieveQuestionsOffline = function(){

		//start fetching from the database
		survey.db.transaction(function (db) {
			db.executeSql("SELECT * FROM Questions",[],function(db,results){
				if(results.rows.length > 0){
					//question are found, prepare them for render
					var resultsString = "";
					for(var x = 0; x < results.rows.length; x++) {
						var row = results.rows.item(x);
						resultsString += row.Qid + "::" + row.Qname + "::" + row.Question + "::"+ row.Type + "::"+ row.Labels + "::"+ row.Required + "::" + row.Frequency + "::" + row.Page; 
						resultsString += "<br/>";
					}
					survey.results = resultsString;
					//get index of first and last page
					survey.getLastPage(survey.results);
					
					//render questions
					survey.renderQuestions(survey.results);

				} else {
					//database is empty, send user back
					$$(".messageOverlay").css("display","none");
					myApp.alert("Please, make sure you have an internet connection so the questionaire can be downloaded.","No internet access");
					view.router.loadPage('menu.html');
				}
				
			}, function(error){
				//Error accessing table
				$$(".messageOverlay").css("display","none");
				myApp.alert("Something went wrong, please re-open the app.","Internal error");
				view.router.loadPage('menu.html');
			}); 
		}, function (error) {
			//error accessing database
			$$(".messageOverlay").css("display","none");
			myApp.alert("Something went wrong, please re-install the app.","Internal error");
			view.router.loadPage('menu.html');
		});
	};

	/*
		This function loop through the retrieved questionnaire data and get the index of last page
		- @var result = string containing the question rendering information (to be seperated by '::').
	*/
	this.getLastPage = function(result) {
		survey.lastPage = 1;
		var questions = result.split("<br/>");
		questions.pop();
		questions.forEach(function(question) {
			var data = question.split("::");//get parameters; 0 = qID, 1 = question name, 2 = question string, 3 = question type, 4 = labels, 5 = required boolean, 6 = frequency, 7 = page number.

			//update the index of the last page
			if ((parseInt(data[7]) > survey.lastPage) && renderQuestion(data[0], data[6])) {
				survey.lastPage = parseInt(data[7]);
			}
		});
	};
	
	/*
		This function renders the questions to the screen.
		- @var result = string containing the question rendering information (to be seperated by '::').
	*/
	this.renderQuestions = function(result){

		var HTML = '';
		var labels;

		$$(".messageOverlay span").html("Rendering questions...");
		
		//get parameters for the questions and loop over them.
		var questions = result.split("<br/>");
		questions.pop();
		questions.forEach(function(question) {
			var data = question.split("::");//get parameters; 0 = qID, 1 = question name, 2 = question string, 3 = question type, 4 = labels, 5 = required boolean, 6 = frequency, 7 = page number.

			//check if question has to be rendered
			if(renderQuestion(data[0], data[6]) && (parseInt(data[7]) == parseInt(storage.surveyPage))) {
				
				//render input
				qHTML = "";
				if(qHTML === "")
				{
					modules.forEach(function(module){
						if (typeof module.renderQuestions === "function" && qHTML === "") {
							qHTML = module.renderQuestions(data[3],data[0],data[4]); 
						}
					});
				}
			
				if(qHTML === ""){
					console.log("WARNING: Question type not found for Question "+data[0]);
				} 
				else {
					//render question
					HTML += "<p class='question'>"+data[2];
					if(data[5] === "1") HTML += " (required)"; 
					HTML += "</p>";
					HTML += qHTML;
				}
				
			}
		});
				
		//check if there are questions to be shown on this page
		if (HTML != "") {

			//check if the current page is the last page (whether a submit button should be used)
			if (storage.surveyPage == survey.lastPage) {
				HTML += "<div id='footer'>";
				HTML += "	<div id='survey_submit' class='button'>Submit</div>";
				HTML += "</div>";
			}
			else {
				HTML += "<div id='footer'>";
				HTML += "	<div id='survey_next' class='button'>Next</div>";
				HTML += "</div>";
			}

			//add survey to the screen
			HTML = $$("#questions #header").html()+HTML;
			$$("#questions").html(HTML);
			$$("#survey_submit").on('click', survey.saveResponse);
			$$("#survey_next").on('click', survey.saveTemp);
			
			//activate modules
			modules.forEach(function(module){
				if (typeof module.initOnPage === "function") {
					module.initOnPage();
				}
			});
		} else {
			//if no questions to be shown on the current page, go to the next page
			survey.nextpage();
		}
		
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
		Saves temporary data in string (abandoned if the app is killed).
	*/
	this.saveTemp = function(){
		//stop modules
		microphoneManager.stopPlay();

		//save response in offline database
		survey.db.transaction(function (db) {
			
			//get latest response ID
			db.executeSql("SELECT Rid, SerializedString FROM Responses ORDER BY Rid DESC LIMIT 1",[],function(db,results){
				
				//set a response ID
				var Rid = 1;
				if(results.rows.length > 0) {
					Rid = parseInt(results.rows.item(0).Rid)+1;
				}
				Rid = Rid.toString();

				//serialize form information
				survey.serialize(Rid,function(results){
					if(results){
						survey.temp = survey.temp + results;
						//go to next page
						survey.nextpage();
					} else {
						//a required question is not answered
						$$(".messageOverlay").css("display","none");
						myApp.alert("Please make sure you answer all the required questions (indicated in red).","Not all questions are answered");
					}
				});
			});
		});
	};
	
	/*
		Saves response in offline database.
	*/
	this.saveResponse = function(){
		//create loading overlay
		$$(".messageOverlay span").html("Saving response...");
		$$(".messageOverlay").css("display","table");
		
		//stop modules
		microphoneManager.stopPlay();
		
		//save response in offline database
		survey.db.transaction(function (db) {
			
			//get latest response ID
			db.executeSql("SELECT Rid, SerializedString FROM Responses ORDER BY Rid DESC LIMIT 1",[],function(db,results){
				
				//set a response ID
				var Rid = 1;
				if(results.rows.length > 0) {
					Rid = parseInt(results.rows.item(0).Rid)+1;
				}
				Rid = Rid.toString();
				
				//serialize form information
				survey.serialize(Rid,function(results){
					if(results){
						//everything is good, save the current date
						var date = new Date();
						var enddate = "";
						//if it's the last page, get the current date as enddate
						if (storage.surveyPage == survey.lastPage) {
							var date = new Date();
							enddate = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds(); 
						}

						//save response in offline database
						//if it's the first page, then insert a new response record
						survey.db.transaction(function (db) {
							db.executeSql("INSERT INTO Responses (Rid, SerializedString, StartDate, EndDate) VALUES (?,?,?,?)",[Rid, survey.temp+results, survey.startdate, enddate], function(db,results){
								//response is saved, continue app
								$$(".messageOverlay").css("display","none");
								
							}, function(error){
								//there is something wrong with the input - unkown error
								
								//delete file information
								survey.db.transaction(function (db) {
									db.executeSql("DELETE FROM Uploads WHERE Rid = ?",[Rid]);
								});
								
								$$(".messageOverlay").css("display","none");
								myApp.alert('Your response cannot be saved, please try again','Unkown error');
							});
						});

						if(navigator.connection.type !== Connection.NONE) {
							//survey.uploadResponses();
							myApp.alert('Thanks! Your responses have been uploaded successfully.','Survey completed');
						} else {
							myApp.alert('Thanks! Your responses have been saved locally. They will be uploaded later when you have internet connection.','Survey completed');
						}
						view.router.loadPage('menu.html');

					} else {
						//a required question is not answered
						
						//delete file information
						survey.db.transaction(function (db) {
							db.executeSql("DELETE FROM Uploads WHERE Rid = ?",[Rid]);
						});
						
						$$(".messageOverlay").css("display","none");
						myApp.alert("Please make sure you answer all the required questions (indicated in red).","Not all questions are answered");
					}
				});
			});
		});
	};

	/*
		Go to the next page
	*/
	this.nextpage = function(){
		storage.setItem("surveyPage", parseInt(storage.surveyPage)+1);
		view.router.reloadPage('survey.html');
		survey.renderQuestions(survey.results);
	};
	
	/*
		Goes through all the questions and prepares a qID-value string to be send to the server.
		- @var rID = response ID for saving files offline
		- @var callBack = function with 1 parameter, this can either be false if an error occured or the ajax string containing all question values.
	*/
	this.serialize = function(rID,callBack){
		
		//get question data
		survey.db.transaction(function (db) {
			db.executeSql("SELECT Qid, Type, Required, Frequency, Page FROM Questions",[], function(db,questions){
				
				var string = "";
				var returnFalse = false;
				
				//loop through all questions and retrieve their values
				//if a question does not have an answer, but is required, returnFalse will be true.
				for(var x = 0; x < questions.rows.length; x++) {
					var q = questions.rows.item(x);
					if(renderQuestion(q.Qid, q.Frequency) && (parseInt(q.Page) == parseInt(storage.surveyPage))) {
						q.name = 'q'+q.Qid;

						//save responses for questions of frequency "daily" in localStorage, in order to show them only once a day
						switch(q.Frequency)
						{
							case "Daily":
								var dateObject = new Date();
								var now = dateObject.getTime();
								//to count midnight hours as late evening of the previous day
								var currentHour = dateObject.getHours(); 
								if (currentHour <= 4) {
									now -= (currentHour+1) * 60 * 60 * 1000
									dateObject = new Date(now);
								}
								var key = q.name + "_" + dateObject.getFullYear() + "_" + (dateObject.getMonth()+1) + "_" +  dateObject.getDate();
								storage.setItem(key, true);
							break;
						}
						
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
				}
			
				//return false if a error is found, otherwise return the string with values
				if(returnFalse) callBack(false);
				else callBack(string);
			});
		});
	};
	
	/*
		Saves file information in offline database
		- @var qID = question ID for question specified in database
		- @var format = either "img" or "audio" for image or audio upload respectively
		- @var rID = response ID as reference for files
		- @return string = file path as saved on the server
	*/
	this.saveFile = function(qID,format,rID){
		var filename, fileURI, path = "files/";
		
		//create parameters depending on file format
		switch(format)
		{
			case "img":
				path+="images/";
				filename = "image_" + survey.startdate.replace(/\s|:/g,"-") + "_" + Math.floor(Math.random()*10000) + ".jpg";
				fileURI = $$(".fileContainer[name='"+qID+"'] #preview").attr("src");
			break;
			case "audio":
				path+="recordings/";
				filename = "recording_" + survey.startdate.replace(/\s|:/g,"-") + "_" + Math.floor(Math.random()*10000) + AUD_EXTENSION;
				fileURI = $$(".fileContainer[name='"+qID+"']").attr("data-value");
			break;
		}
		
		//save file information in the offline database
		survey.db.transaction(function (db) {
			db.executeSql("INSERT INTO Uploads (Rid, Name, Format, Uri) VALUES (?,?,?,?)",[rID, filename, format, fileURI],function(db,results){
				//myApp.alert("File is saved in database");
			},function(error){
				//myApp.alert(error.message);
			});
		});
		
		//return file path
		return path+filename;
	};
	
	/*
		Uploads offline saved responses and files to the server if a internet connection is available.
	*/
	this.uploadResponses = function(){
		if(navigator.connection.type !== Connection.NONE && survey.db !== null){
			
			//internet is available, check for offline responses
			survey.db.transaction(function (db) {
				db.executeSql("SELECT * FROM Responses",[],function(db,results){
					
					if(results.rows.length > 0)
					{
						//responses found, lets send them to the server
						$$(".messageOverlay span").html("Sending response...");
						$$(".messageOverlay").css("display","table");
						
						var row;
						for(var x = 0; x < results.rows.length; x++) {
							row = results.rows.item(x);
							
							//start upload of response
							$$.ajax({
								url:WEB_BASE+"questionaireSave.php"+AUTORIZATION+survey.response(row.StartDate,row.EndDate)+row.SerializedString,
								success: function(result){
									var data = result.split("::");
									if(data[0] === "success")
									{
										//do nothing
									}
									else
									{
										//There is something wrong with the response could not be uploaded now - try again later
										$$(".messageOverlay").css("display","none");
									}

								},
								error: function(xhr,status,error){
									//server not responding
									$$(".messageOverlay").css("display","none");
								}
							});
						}
					}
				}); 
			});

			//awnsers are uploaded, next upload corresponding files.. if there are
			survey.db.transaction(function (db) {
				
				//Check for files
				db.executeSql("SELECT * FROM Uploads",[],function(db,results){
					if(results.rows.length > 0)
					{
						//alert("files");
						//files found, upload them
						var row;
						for(var x = 0; x < results.rows.length; x++) {
							row = results.rows.item(x);
							survey.uploadFile(row.Name,row.Uri,row.Format);
						}
						
						//Delete all file information.
						db.executeSql("DELETE FROM Uploads");
					}
				});
			});
			
			//Delete response from the database
			survey.db.transaction(function (db) {
				db.executeSql("DELETE FROM Responses");
			});
		}
	};
	
	/*
		Prepares meta information of the response to be send to the server
		- @var StartDate = start date of the questionaire
		- @var EndDate = end date of the questionaire
		- @return string = string including User ID, start date and end date
	*/
	this.response = function(StartDate, EndDate){
		return "&UID="+storage.getItem("Uid")+"&sd="+StartDate.replace(" ","%20")+"&ed="+EndDate.replace(" ","%20");
	};
	
	/*
		Uploads files (images, recordings) to the server, seperate from the questionaire awnsers.
		!-NOTE that errors in this function are not catched, and do not influence sending the rest of the information to the server.
		- @var fileName = filename saved as on the server
		- @var fileURI = path to the file on device
		- @var format = either "img" or "audio" for image or audio upload respectively
	*/
	this.uploadFile = function(filename,fileURI,format){
		var options = new FileUploadOptions();
		var path = "files/";
		
		switch(format)
		{
			case "img":
				//set parameters for sending image file
				path+="images/";
				options.fileKey = "file";
        		options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
        		options.mimeType = "image/jpeg";
        		options.chunkedMode = false;
			break;
			case "audio":
				//set parameters for sending audio file
				path+="recordings/";
				options.fileKey = "file";
        		options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
        		options.mimeType = "audio/"+AUD_EXTENSION.substr(1, 3).toUpperCase();
        		options.chunkedMode = false;
			break;
		}
		
		//set file name, to read on server side
		var params = {};
        params.filename = filename;
		options.params = params;
		
		//send the file
		var ft = new FileTransfer();
        ft.upload(
			fileURI, WEB_BASE+"questionaireSaveFiles.php"+AUTORIZATION+"&format="+format, 
			function(result){
        		//alert('result : ' + JSON.stringify(result));
        	}, function(error){
        		//alert('error : ' + JSON.stringify(error));
			}, options
		);
	};
};
