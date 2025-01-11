var config = require('./config');
var mysql = require('mysql2');
//引用加解密
var secOpt = require('./secure');

/**********************
*	查询信息
**********************/
exports.getUserInfo = function(table, id, callBack)
{
	if(table == 1)
		var getSQL = 'SELECT * from stuInfo WHERE stuID = ?';
	else
		var getSQL = 'SELECT * from tchInfo WHERE tchID = ?';
	var getParam = [id];
	var con = mysql.createConnection(config.SQLInfo);
	con.connect();
	
	con.query(getSQL, getParam, function(err, result){
		if(err)
		{
			console.log(err.message);
			callBack('error');
		}			
		if(result)
		{
			if(result.length > 0)
				callBack('no');
			else
				callBack('yes');
		}			
	});
	
	//记得关闭
	con.end();
}

/**********************
*	登录查询 学生
*	参数：id, pass
**********************/
exports.stulogin = function (id, pass, callBack) {
    // 定义 SQL 查询语句
    const getSQL = 'SELECT * FROM stuInfo WHERE stuID = ? AND stuPWD = ?';

    // 加密密码（如果需要加密，可以启用）
    // const getParam = [id, secOpt.aesCrypto(pass)]; // 如果需要加密，解开此行
    const getParam = [id, pass]; // 如果密码不加密，直接使用

    // 创建数据库连接
    const con = mysql.createConnection(config.SQLInfo);

    // 连接到数据库
    con.connect((err) => {
        if (err) {
            console.error('Database connection error:', err.message);
            callBack({ logStatu: 'error' });
            return;
        }

        // 执行查询
        con.query(getSQL, getParam, (err, result) => {
            // 查询出错时
            if (err) {
                console.error('Query error:', err.message);
                callBack({ logStatu: 'error' });
            } else if (result.length > 0) {
                // 查询成功且有结果
                const ret = {
                    logStatu: 'yes',
                    name: result[0].stuName,
                    id: result[0].stuID,
                    age: result[0].stuAge,
                    _class: result[0].stuClass,
                    sex: result[0].stuSex,
                    role: 'stu',
                    isSTU: true,
                };
                callBack(ret);
            } else {
                // 查询成功但没有匹配结果
                callBack({ logStatu: 'no' });
            }

            // 关闭连接
            con.end((err) => {
                if (err) console.error('Error closing connection:', err.message);
            });
        });
    });
};


/**********************
*	登录查询 教师
*	参数：id, pass
**********************/
exports.tchlogin = function (id, pass, callBack) {
    // 定义 SQL 查询语句
    const getSQL = 'SELECT * FROM tchInfo WHERE tchID = ? AND tchPWD = ?';

    // 如果密码需要加密解密逻辑，可以加回这段，否则直接使用明文密码。
    // const getParam = [id, secOpt.aesCrypto(pass)];
    const getParam = [id, pass];

    // 创建数据库连接
    const con = mysql.createConnection(config.SQLInfo);

    // 连接到数据库
    con.connect((err) => {
        if (err) {
            console.error('Database connection error:', err.message);
            callBack({ logStatu: 'error' });
            return;
        }

        // 执行查询
        con.query(getSQL, getParam, (err, result) => {
            if (err) {
                console.error('Query error:', err.message);
                callBack({ logStatu: 'error' });
            } else if (result.length > 0) {
                // 查询成功且有结果
                const ret = {
                    logStatu: 'yes',
                    name: result[0].tchName,
                    id: result[0].tchID,
                    age: result[0].tchAge,
                    zw: result[0].tchZW,
                    sex: result[0].tchSex,
                    role: 'tch',
                    isSTU: false,
                };
                callBack(ret);
            } else {
                // 查询成功但无匹配结果
                callBack({ logStatu: 'no' });
            }

            // 关闭连接
            con.end((err) => {
                if (err) console.error('Error closing connection:', err.message);
            });
        });
    });
};


/**********************
*	学生注册
**********************/
exports.addStu = function(_obj, callBack)
{
	var addSQL = 'INSERT INTO stuInfo(stuID, stuName, stuPWD, stuSex, stuClass, stuAge) VALUES(?, ?, ?, ?, ?, ?)';
	var addParam = [_obj.id, _obj.name, secOpt.aesCrypto(_obj.pass), _obj.sex, _obj._class, _obj.age];
	var con = mysql.createConnection(config.SQLInfo);
	con.connect();
	
	con.query(addSQL, addParam, function(err, result){
		if(err)
		{
			console.log(err.message);
			callBack('error');
		}			
		if(result)
		{
			callBack(result.affectedRows);
		}			
	});
	
	//记得关闭
	con.end();
}

/**********************
*	教师注册
**********************/
exports.addTch = function(_obj, callBack)
{
	var addSQL = 'INSERT INTO tchInfo(tchID, tchName, tchPWD, tchAge, tchSex, tchZW) VALUES(?, ?, ?, ?, ?, ?)';
	var addParam = [_obj.id, _obj.name, secOpt.aesCrypto(_obj.pass), _obj.age, _obj.sex, _obj.zw];
	var con = mysql.createConnection(config.SQLInfo);
	con.connect();
	
	con.query(addSQL, addParam, function(err, result){
		if(err)
		{
			console.log(err.message);
			callBack('error');
		}			
		if(result)
		{
			callBack(result.affectedRows);
		}			
	});
	
	//记得关闭
	con.end();
}

/**********************
*	查询学生评教情况
**********************/
exports.getPjInfo = function(id, callBack)
{
	//返回结果集
	var _arr = new Array();	
	
	var getSQL = 'select comment, score, tchName, pj.tchID, courName, pj.courID, checked from teach, pj where teach.tchID = pj.tchID and teach.courID = pj.courID and stuID = ?';
	var getParam = [id];
	var con = mysql.createConnection(config.SQLInfo);
	con.connect();
	
	con.query(getSQL, getParam, function(err, result){
		if(err)
		{
			console.log(err.message);
			callBack('error');
		}			
		if(result)
		{
			for(var i = 0; i < result.length; i++)
			{
				var temp = {
					tname : result[i].tchName,
					cname : result[i].courName,
					chk : result[i].checked,
					cid : result[i].courID,
					tid : result[i].tchID,
					score : result[i].score,
					comment : result[i].comment,
				}
				_arr.push(temp);
			}
			callBack(_arr);
		}			
	});
	
	//记得关闭
	con.end();
}

/****************************
*	查询学生评教情况：教师
*****************************/
exports.getTchPjInfo = function(id, callBack)
{
	//返回结果集
	var _arr = new Array();	
	
	var getSQL = 'select comment, score, checked, stuInfo.stuID, stuInfo.stuName, teach.courName from pj,teach,stuInfo where stuInfo.stuID = pj.stuID and pj.tchID = ? and pj.tchID = teach.tchID';
	var getParam = [id];
	var con = mysql.createConnection(config.SQLInfo);
	con.connect();
	
	con.query(getSQL, getParam, function(err, result){
		if(err)
		{
			console.log(err.message);
			callBack('error');
		}			
		if(result)
		{
			for(var i = 0; i < result.length; i++)
			{
				var temp = {
					chk: result[i].checked,
					sname: result[i].stuName,
					sid: result[i].stuID,
					cname: result[i].courName,
					cid: result[i].courID,
					score: result[i].score,
					comment: result[i].comment
				};
				_arr.push(temp);
			}
			callBack(_arr);
		}			
	});
	
	//记得关闭
	con.end();
}

/********************************
*		更新评教信息
*********************************/
exports.upPjInfo = function(datas, callBack)
{
	var upSQL = 'UPDATE pj SET score = ? , comment = ? , checked = ? WHERE stuID = ? and tchID = ? and courID = ?';
	var upParam = [datas.score, datas.comment, datas.chk, datas.sid, datas.tid, datas.cid];
	
	var con = mysql.createConnection(config.SQLInfo);
	con.connect();
	
	con.query(upSQL, upParam, function(err, result){
		if(err)
		{
			console.log(err.message);
			callBack('error');
		}			
		if(result)
		{
			callBack(result.affectedRows);
		}			
	});
	
	//记得关闭
	con.end();
}

/********************************
*		修改密码：学生
*********************************/
exports.upStuPas = function(id, pass, callBack)
{
	var upSQL = "UPDATE stuInfo SET stuPWD = ? WHERE stuID = ?";
	var upParam = [secOpt.aesCrypto(pass), id];
	var con = mysql.createConnection(config.SQLInfo);
	con.connect();
	
	con.query(upSQL, upParam, function(err, result){
		if(err)
		{
			console.log(err.message);
			callBack('error');
		}			
		if(result)
		{
			callBack(result.affectedRows);
		}			
	});
	
	//记得关闭
	con.end();
}


/********************************
*		修改密码：教师
*********************************/
exports.upTchPas = function(id, pass, callBack)
{
	var upSQL = "UPDATE tchInfo SET tchPWD = ? WHERE tchID = ?";
	var upParam = [secOpt.aesCrypto(pass), id];
	var con = mysql.createConnection(config.SQLInfo);
	con.connect();
	
	con.query(upSQL, upParam, function(err, result){
		if(err)
		{
			console.log(err.message);
			callBack('error');
		}			
		if(result)
		{
			callBack(result.affectedRows);
		}			
	});
	
	//记得关闭
	con.end();
}

/****************************
*	忘记密码
****************************/
exports.insertCode = function(id, code, time, callBack)
{
	var inSQL = "INSERT INTO rstCode values(?, ?, ?)";
	var inParam = [id, code, time];
	var con = mysql.createConnection(config.SQLInfo);
	con.connect();
	
	con.query(inSQL, inParam, function(err, result){
		if(err)
		{
			console.log(err.message);
			callBack('error');
		}			
		if(result)
		{			
			callBack(result.affectedRows);
		}			
	});
	
	//记得关闭
	con.end();
}

/****************************
*	忘记删除
****************************/
exports.delCode = function(id)
{
	var delSQL = "DELETE FROM rstCode WHERE id = ?";
	var delParam = [id];
	var con = mysql.createConnection(config.SQLInfo);
	con.connect();
	
	con.query(delSQL, delParam, function(err, result){
		if(err)
		{
			console.log("del error: " + err.message);
		}					
	});
	
	//记得关闭
	con.end();
}

/****************************
*	忘记获取
****************************/
exports.getCode = function(id, callBack)
{
	var getSQL = "SELECT code FROM rstCode WHERE id = ?";
	var getParam = [id];
	var con = mysql.createConnection(config.SQLInfo);
	con.connect();
	
	con.query(getSQL, getParam, function(err, result){
		if(err)
		{
			console.log(err.message);
			callBack('-2');
		}			
		if(result)
		{
			if(result.length > 0)
				callBack(result[0].code);
			else
				callBack('-1');
		}			
	});
	
	//记得关闭
	con.end();
}

exports.insertPJ = function(id)
{
	var intSQL = "INSERT INTO pj values(?, ?, ?, ?, ?, ?)";
	var intParam = [id, 1, 1, 0, 0, '0'];
	var con = mysql.createConnection(config.SQLInfo);
	con.connect();

	con.query(intSQL, intParam, function(err, result){
	if(err)
	{
		console.log(err.message);
	}
});
con.end();
}
