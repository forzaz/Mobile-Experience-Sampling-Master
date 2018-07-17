<?php
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

//KEEP THIS INFORMATION PRIVATE--------------------------------------------
//SET TIMEZONE FOR ACCURATELY SAVING RESPONSES
date_default_timezone_set("Europe/Amsterdam");

class Conf{
	//Provide login details for the app that will be used.
	const USER_NAME = 'app_user_name';
	const PASSWORD  = 'app_user_password';
	
	//Provide login details to the database
	const DB_NAME		 = 'ExperienceSampler'; //change to your database name
	const DB_USER	 	 = 'user_name';
	const DB_PASSWORD	 = 'user_password';
	const DB_HOST		 = 'localhost'; //ofter just 'localhost'
	
	const FROM_EMAIL	 = 'your@host.email'; 	 //used as sender of email messages
	const APP_NAME		 = 'SampleU'; //used for email messages
}

?>