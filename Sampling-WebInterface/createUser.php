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
	$a_pass = Utilities::stringFormat(Utilities::getAndSanitize('appPass'));
	$a_token = Utilities::stringFormat(Utilities::getAndSanitize('token'));
	
	$result = $db->query("INSERT INTO Users(Username,Password,Token) VALUES (".$a_user.",".$a_pass.",".$a_token.")");
	
	if($result === TRUE)
	{
		$UID = $db->lastID();
		echo "true::".$UID;
	} else echo "false::Username already taken";
	
	//close database
	$db->close();
}

?>