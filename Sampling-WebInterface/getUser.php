<?php

//Check if incoming request is valid
require 'php/conf.php';
require 'php/Autorize.php';
require_once 'php/Utilities.php';
if(Autorize::check())
{
	//connect to database
	$db = new Database();
	
	//get filled in credentials
	$a_user = Utilities::stringFormat(Utilities::getAndSanitize('appUser'));
	$a_pass = Utilities::getAndSanitize('appPass');

	$result = $db->query("SELECT Uid, Password FROM Users WHERE Username = {$a_user}");
	
	if ($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			if($a_pass == $row['Password'])
			{
				//correct username and password
				echo "true::".$row['Uid'];
			}
			else
			{
				//wrong password
				echo "false::Wrong password";
			}
		}
	} else echo "false::Wrong username";
	
	//close database
	$db->close();
}

?>