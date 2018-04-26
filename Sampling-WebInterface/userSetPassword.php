<?php
/**
 * Experience Sampling Web-interface 1.0.1
 * This backend allows researchers to conduct surveys remotely using the mobile phone on Android and iOS.
 * 
 * This app is developed by BOSONIC.design in assignment of the department 
 * of Human-Technology Interaction @ Eindhoven, University of Technology.
 * 
 * info@bosonic.design || http://www.bosonic.design/
 * hti@tue.nl || https://www.tue.nl/en/university/departments/industrial-engineering-innovation-sciences/research/research-groups/human-technology-interaction/
 * 
 * Released on: March, 2018
 */

//Check if incoming request is valid
require 'php/Config.php';
require 'php/Autorize.php';
require_once 'php/Utilities.php';

if(Autorize::check())
{
	//connect to database
	$db = new Database();
	
	//get filled in credentials
	$Uid  = Utilities::stringFormat(Utilities::getAndSanitize('UID'));
	$pass = Utilities::getAndSanitize('appPass');
	$pass = Utilities::stringFormat(password_hash($pass, PASSWORD_DEFAULT));
	
	$result = $db->query("UPDATE Users SET Tmp = 0, Password = {$pass} WHERE Uid = {$Uid} LIMIT 1");
	
	if($result === TRUE)
	{
		echo "true";
	} else echo "false";
	
	//close database
	$db->close();
}

?>