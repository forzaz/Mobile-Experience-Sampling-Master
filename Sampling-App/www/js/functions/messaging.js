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

function RetrieveMessages(callback = null)
{
	$$.ajax({
		url:WEB_BASE+"messagesGetOld.php"+AUTORIZATION+"&UID="+storage.getItem("Uid"),
		success: function(result){
			if(result !== ""){
				//data retrieved, see what it contains..
				var messages = result.split(";<br/>");
				messages.pop();
				messages.forEach(function(message){
					var c = message.split("--");
					var n = storage.getItem("messages");
					storage.setItem("message"+n, c[0]);
					storage.setItem("messageRead"+n, c[1]);
					storage.setItem("messages", Number(n)+1);
					if(c[1] === "1") storage.setItem("readMessages", Number(n)+1);
				});
			}
			
			if(typeof callback === "function") callback();
		},
		error: function(xhr,status,error){
			//server does not respond.
			//Console.log("Please make sure you have an internet connection to register an account.","No internet connection");
		}
	});
}

function CheckMessages(callback = null)
{
	if(navigator.connection.type !== Connection.NONE)
	{
		$$.ajax({
			url:WEB_BASE+"messagesGetNew.php"+AUTORIZATION+"&UID="+storage.getItem("Uid"),
			success: function(result){
				if(result !== ""){
					//data retrieved, see what it contains..
					var messages = result.split(";<br/>");
					messages.pop();
					messages.forEach(function(message){
						var n = storage.getItem("messages");
						storage.setItem("message"+n, message);
						storage.setItem("messageRead"+n, 0);
						storage.setItem("messages", Number(n)+1);
					});

					UpdateMenuPage();

					if(typeof callback === "function") callback();
				}
			},
			error: function(xhr,status,error){
				//server does not respond.
				//Console.log("Please make sure you have an internet connection to register an account.","No internet connection");
			}
		});
	}
}

function UpdateMenuPage()
{
	if(storage.getItem("messages") !== storage.getItem("readMessages"))
	{
		var n = storage.getItem("messages");
		var m = storage.getItem("readMessages");
		var d = Number(n)-Number(m);
		$$('#readMessages').html(d);
		$$('#readMessages').css('visibility','visible');
	}
}

function UpdateMessagePage()
{
	//check if messages are stored
	if(storage.getItem("messages") !== "0")
	{
		//iterate over stored messages to put them in HTML
		var HTML = "";
		var n = storage.getItem("messages");
		for(i = 0; i < Number(n); i++)
		{
			var message = storage.getItem("message"+i).split("::");
			var messageString = "<div class='messageBlock ";
			if(storage.getItem("messageRead"+i) === "0"){
				setMessageToRead(message[0]);
				storage.setItem("messageRead"+i,"1");
				messageString += "new";
			}
			messageString += "'><p class='time'>"+message[1]+"</p><p class='content'>"+message[2]+"</p></div>";
			HTML = messageString+HTML;
		}
		
		//display messages
		$$('#NoMessages').hide();
		$$(".page[data-page='messages'] .content-block").html(HTML);
	}
	
	//set messages as read
	storage.setItem("readMessages", storage.getItem("messages"));
}

function setMessageToRead(Mid)
{
	$$.ajax({
		url:WEB_BASE+"messagesSetRead.php"+AUTORIZATION+"&UID="+storage.getItem("Uid")+"&MID="+Mid
	});
}