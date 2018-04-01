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

require_once 'Utilities.php';
foreach (glob("lib/*.php") as $filename)
{	require_once $filename;	}

class Autorize
{
	public static function check()
	{
		if(Autorize::checkDevice()){
			$user = Utilities::getAndSanitize('user');
			$pass = Utilities::getAndSanitize('pass');

			if($user == Conf::USER_NAME && $pass == Conf::PASSWORD) return true;
		}
		return false;
	}
	
	private static function checkDevice()
	{
		$iPhone  = stripos($_SERVER['HTTP_USER_AGENT'],"iPhone");
		$iPad    = stripos($_SERVER['HTTP_USER_AGENT'],"iPad");
		$Android = stripos($_SERVER['HTTP_USER_AGENT'],"Android");
		
		if($iPhone || $iPad || $Android) return true;
		return false;
	}
	
	public static function random_str($length, $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
	{
		$str = '';
		$max = mb_strlen($keyspace, '8bit') - 1;
		if ($max < 1) {
			throw new Exception('$keyspace must be at least two characters long');
		}
		for ($i = 0; $i < $length; $i++) {
			$str .= $keyspace[random_int(0, $max)];
		}
		return $str;
	}
}

class Database{
	private $conn;
	
	public function Database()
	{
		if(!$this->conn) $this->connect();
	}
	
	public function connect()
	{
		$this->conn = new mysqli(Conf::DB_HOST, Conf::DB_USER, Conf::DB_PASSWORD, Conf::DB_NAME);
		if($this->conn->connect_error) { die("Connection failed: " . $this->conn->connect_error); }
	}
	
	public function query($sql)
	{
		return $this->conn->query($sql);
	}
	
	public function multiQuery($sql)
	{
		return $this->conn->multi_query($sql);
	}
	
	public function lastID()
	{
		return $this->conn->insert_id;
	}
	
	public function close()
	{
		$this->conn->close();
	}
}

?>