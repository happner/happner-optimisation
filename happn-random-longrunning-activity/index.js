var spawn = require('child_process').spawn
  , sep = require('path').sep
  , remote
  , happn = require('happn')
  , service = happn.service
  , happn_client = happn.client
  ;

// spawn remote mesh in another process
remote = spawn('node', [__dirname + '/happn_instance']);

remote.stdout.on('data', function(data) {

  console.log(data.toString());

  if (data.toString().match(/READY/)){
   console.log('READY - TEST FRAMEWORK UP:::');
  }

  if (data.toString().indexOf(/DUMP/) >= 0){
  	var dumpFile = data.toString().split(':::')[1];
  	console.log('HAVE DUMP FILE:::', dumpFile);
  }

  if (data.toString().indexOf(/STATS/) >= 0){
  	var statsObj = JSON.parse(data.toString().split(':::')[1]);
  	console.log('HAVE STATS OBJ:::', statsObj);
  }

});

var endProcess = function(){
	try{
		if (remote){
			console.log('killing remote process:::');
			remote.kill();
			console.log('remote process killed:::');
		}
	 }catch(e){
	 	//do nothing
	 }
	 process.exit(0);

};

process.on('SIGINT', function() {
	endProcess();
});

process.on('SIGTERM', function() {
	endProcess();
});