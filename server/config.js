var fs = require('fs');
//Https SSL 配置
var privateKey = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');
exports.credentials = {
	key : privateKey, 
	cert : certificate
	};

//数据库配置
exports.SQLInfo = {
	host     : 'ip',
	user     : 'username',
	password : 'password',
	database : 'dataBase'
};