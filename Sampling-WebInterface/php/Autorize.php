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