<?php
/**
 * Experience Sampling Web-interface 1.0.0
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

//KEEP THIS INFORMATION PRIVATE--------------------------------------------
//SET TIMEZONE FOR ACCURATELY SAVING RESPONSES
date_default_timezone_set("Europe/Amsterdam");

class Conf{
	//Provide login details for the app that will be used.
	const USER_NAME = 'app_user_name';
	const PASSWORD  = 'app_user_password';
	
	//Provide login details to the database
	const DB_NAME		 = 'ExperienceSampler';
	const DB_USER	 	 = 'user_name';
	const DB_PASSWORD	 = 'user_password';
	const DB_HOST		 = 'host_name'; //ofter just 'localhost'
}

?>