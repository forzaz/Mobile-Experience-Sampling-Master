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
	
	$result = $db->query("INSERT INTO Users(Username,Password) VALUES (".$a_user.",".$a_pass.")");
	
	if($result === TRUE)
	{
		$UID = $db->lastID();
		echo "true::".$UID;
	} else echo "false::Username already taken";
	
	//close database
	$db->close();
}

?>