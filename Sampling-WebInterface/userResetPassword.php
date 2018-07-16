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
	$a_email = Utilities::getAndSanitize('appEmail');
	$a_emailStr = Utilities::stringFormat($a_email);
	$result = $db->query("SELECT Tmp FROM Users WHERE Email = {$a_emailStr} LIMIT 1");
	
	if ($result->num_rows > 0) {
		
		$row = $result->fetch_array(MYSQLI_ASSOC);
			
		//reset password
		$resetPass = Autorize::random_str(10);
		$resetPassHash = Utilities::stringFormat(password_hash($resetPass, PASSWORD_DEFAULT));
		
		//send email
		$subject = "Password reset";
		$message = "We recieved the request to change your password on " . Conf::APP_NAME . ".\nYour password has been changed to {$resetPass}\n\nLogin to change your password.";
		$headers[] = "MIME-Version: 1.0";
		$headers[] = "Content-type: text/plain; charset=utf-8";
		$headers[] = "From: " . Conf::APP_NAME . " <" . Conf::FROM_EMAIL . ">";
		mail($a_email, $subject, $message, implode("\r\n", $headers));
		
		//save into database
		$result = $db->query("UPDATE Users SET Tmp = 1, Password = {$resetPassHash} WHERE Email = {$a_emailStr}");
		
		echo "true";
		
	} else echo "false::email";
	
	//close database
	$db->close();
}

?>