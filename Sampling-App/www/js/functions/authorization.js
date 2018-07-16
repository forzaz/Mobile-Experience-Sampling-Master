/*
	This function will execute when the user tries to log into the app.
*/
function autorizeUser()
{
	if(navigator.connection.type !== Connection.NONE)
	{
		//first get a token for the device
		window.FirebasePlugin.getToken(function(token) {
			//get user input
			user = $$("input#username").val();
			pass = $$("input#password").val();

			//send it to the server to validate it
			$$.ajax({
				url:WEB_BASE+"userGet.php"+AUTORIZATION+"&appUser="+user+"&appPass="+pass+"&token="+token,
				success: function(result){
					//data retrieved, see what it contains..
					var data = result.split("::");
					if(data[0]==="true")
					{
						//correct login information, proceed using the app.
						storage.setItem("Uid",data[1]);
						storage.setItem("messages", "0");
						storage.setItem("readMessages", "0");
						survey.init(function(){
							//survey.retrieveQuestions(function(){
							RetrieveMessages(function(){
								if(data[2] === "1")
								{
									//this is a temporary password, let the user change it.
									view.router.loadPage('resetpassword.html');
								} else {
									storage.setItem("login","true");
									view.router.loadPage('menu.html');
								}
							});
							//});
						});
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
	} else {
		myApp.alert("Please make sure you have an internet connection to register an account.","No internet connection");
	}
}

/*
	This function will execute when the user register himself through the app.
*/
function registerUser()
{
	if(navigator.connection.type !== Connection.NONE)
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
					url:WEB_BASE+"userCreate.php"+AUTORIZATION+"&appUser="+user+"&appEmail="+email+"&appPass="+pass+"&token="+token,
					success: function(result){
						//data retrieved, see what it contains..
						var data = result.split("::");
						if(data[0]==="true")
						{
							//alert("yes!");
							survey.init(function(){
								//alert("2");
								survey.retrieveQuestions(function(){
									//alert("3");
									//RetrieveMessages(function(){
									//console.log("messages downloaded");
									//user could be registered, proceed with the app.
									storage.setItem("Uid",data[1]);
									storage.setItem("login","true");
									storage.setItem("messages", "0");
									storage.setItem("readMessages", "0");
									view.router.loadPage('setup.html');
									myApp.alert("Thank you for registering.","You are registered!");
									//});
								});
							});
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
	} else {
		myApp.alert("Please make sure you have an internet connection to register an account.","No internet connection");
	}
}

/*
	Recover Password
*/
function resetPassword()
{
	if(navigator.connection.type !== Connection.NONE)
	{
		//get user input
		pass = $$("form#resetPassword input#password").val();
		r_pass = $$("form#resetPassword input#r_password").val();

		//check if passwords are the same
		if(pass === r_pass)
		{
			$$.ajax({
				url:WEB_BASE+"userSetPassword.php"+AUTORIZATION+"&UID="+storage.getItem("Uid")+"&appPass="+pass,
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
					myApp.alert("Please try it again later, sorry for the inconvenience.","Server not responding");
				}
			});
		} else {
			myApp.alert("Please make sure both fields contain the same password.","Passwords do not match");
		}
	} else {
		myApp.alert("Please make sure you have an internet connection to register an account.","No internet connection");
	}
}

/*
	Recover Password
*/
function recoverPassword()
{
	if(navigator.connection.type !== Connection.NONE)
	{
		//get user input
		r_email = $$("input#recovery_email").val();

		//check if something is filled in, and is correct
		if(r_email)
		{
			$$.ajax({
				url:WEB_BASE+"userResetPassword.php"+AUTORIZATION+"&appEmail="+r_email,
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
					myApp.alert("Please try it again later, sorry for the inconvenience.","Server not responding");
				}
			});
		} else {
			myApp.alert("Please fill in a valid email adress to reset your password.","No user found");
		}
	} else {
		myApp.alert("Please make sure you have an internet connection to reset your password.","No internet connection");
	}
}

/*
	This function will execute when the user wants to logout.
*/
function logout(){
	//clear cache information
	storage.removeItem("login");
	//cordova.plugins.notification.local.clearAll(unScheduleNotifications);
	
	//return to index page.
	view.hideNavbar(true);
	view.router.back({
	  url: 'index.html', // - in case you use Ajax pages
	  force: true
	});
	
	//Tell the user that logging out was succesfull
	myApp.alert('Thank you for using the app.','You are logged out.');
}