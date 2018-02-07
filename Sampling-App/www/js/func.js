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
	user = $$("input#username").val();
	pass = $$("input#password").val();
	$$.ajax({
		url:WEB_BASE+"getUser.php"+AUTORIZATION+"&appUser="+user+"&appPass="+pass,
		success: function(result){
			var data = result.split("::");
			if(data[0]==="true")
			{
				storage.setItem("Uid",data[1]);
				storage.setItem("login","true");
				view.router.loadPage('menu.html');
				myApp.alert("login correct");
			}
			else
			{
				myApp.alert("login failed");
			}
		},
		error(xhr,status,error){
			myApp.alert('error data');
			$$("#questions").html(status + " " + error);
		}
	});
}

function registerUser()
{
	user = $$("input#r_username").val();
	pass = $$("input#r_password").val();
	r_pass = $$("input#rr_password").val();
	
	if(user && pass && r_pass && pass === r_pass)
	{
		$$.ajax({
			url:WEB_BASE+"createUser.php"+AUTORIZATION+"&appUser="+user+"&appPass="+pass,
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
					myApp.alert("Username already exists, please choose another one.");
				}
			},
			error(xhr,status,error){
				myApp.alert('error data');
				$$("#questions").html(status + " " + error);
			}
		});
	}
}