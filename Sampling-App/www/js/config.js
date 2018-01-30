
const USER_NAME = 'Marc';
const PASSWORD = 'test123';
const WEB_BASE = 'http://surveyhti.nfshost.com/survey/';

const UID = 1;

function Autorization(){
	return "?user="+USER_NAME+"&pass="+PASSWORD;
}