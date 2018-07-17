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

class Utilities{
	
	/*
		This function return sanitized $_GET variable from the URL string,
		or false when the variable does not exist.
		- $name = variable name in the URL.
	*/
	public static function getAndSanitize($name)
	{
		if(!($var = filter_input(INPUT_GET, $name, FILTER_SANITIZE_STRING)))
			$var = false;
		
		return $var;
	}
	
	/*
		This function return sanitized $_POST variable,
		or false when the variable does not exist.
		- $name = variable name in the URL.
	*/
	public static function getPostAndSanitize($name)
	{
		if(!($var = filter_input(INPUT_POST, $name, FILTER_SANITIZE_STRING)))
			$var = false;
		
		return $var;
	}
	
	/*
		This function takes a string value and returns it to a form suitable
		for sql queries.
		- $string = string that has to be formatted
	*/
	public static function stringFormat($string)
	{
		return '\''.$string.'\'';
	}
	
	/*
		This builds sql queries for inserting multiple records.
		- $table = table to insert records into
		- $columns = array containing the names of the columns to be populated
		- $values = array containing arrays with input values for each column
	*/
	public static function multiInsertBuilder($table, $columns, $values)
	{
		$query = "";
		$col = implode(",",$columns);
		for($i = 0; $i < sizeof($values); $i++)
		{
			$val = implode(",",$values[$i]);
			$query .= "INSERT INTO " . $table . "(". $col .") VALUES (". $val .");";
		}
		
		return $query;
	}
}

?>