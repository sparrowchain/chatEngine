var WebSocketServer = require('websocket').server;
var http = require('http');
var WebSocketServerPort=1337;
var clients=[];
var adminIndex;

var server = http.createServer(function(req,res){
		req.setEncoding("uft8");
});
server.listen(WebSocketServerPort,()=>{
	console.log("Web Socket Server is listening to the port :"+WebSocketServerPort);
});

wsServer = new WebSocketServer({httpServer:server});

wsServer.on('request',(req)=>{
 	console.log(req.key);
	var connection = req.accept(null,req.origin);
	var index = clients.push(connection) - 1;
    clients[index].sendUTF(JSON.stringify({sessionID:req.key}));

    if(!adminIndex){
    	var json={
			type:'system',
			body:'admin_is_offline'
			}
		clients[index].send(JSON.stringify(json));
	
    }

	connection.on('message',(message)=>{

	console.log(message);
 	var data=message.utf8Data;
 	var json = JSON.parse(data);
 	console.log("debug");
 	console.log(json);

 	var newJson={
 		type:"message",
 		sessionID:json.sessionID,
 		nickname:json.nickname,
 		body:json.msg
 	}


	//check if the message is from admin
	if (json.key=='admin'){
		console.log("Admin login with index as :"+index);
		adminIndex=index;
	}else{
	 if(adminIndex){
		//message is from client
		console.log(newJson);
 		//clients[adminIndex].send(JSON.stringify({key:req.key,body:message}));
		clients[adminIndex].send(JSON.stringify(newJson));

		}else{
		//admin is offline
		var json={
			type:'system',
			body:'admin_is_offline'
			}
		clients[index].send(JSON.stringify(json));
	
		}
	}



  	
	});
	connection.on('close',(connection)=>{});
});