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
	$a_user = Utilities::stringFormat(Utilities::getAndSanitize('appUser'));
	$a_pass = Utilities::getAndSanitize('appPass');

	$result = $db->query("SELECT Uid, Password, Tmp FROM Users WHERE Username = {$a_user} LIMIT 1");
	
	if ($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			if(password_verify($a_pass, $row['Password']))
			{
				//correct username and password
				echo "true::".$row['Uid']."::".$row['Tmp'];
				
				//update token to the right device
				$a_token = Utilities::stringFormat(Utilities::getAndSanitize('token'));
				$db->query("UPDATE Users SET Token = {$a_token} WHERE Username = {$a_user}");
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