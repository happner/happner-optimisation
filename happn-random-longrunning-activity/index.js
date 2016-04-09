var spawn = require('child_process').spawn
  , sep = require('path').sep
  , remote
  , happn = require('happn')
  , service = happn.service
  , happn_client = happn.client
  ;

var clientInstance;

var clientConfig = {
	config:{
	  secure:true,
	  username:'_ADMIN',
	  password:'happn'
	}
}

var ACTIVITY_LOG_INTERVAL = 5000;

// spawn remote mesh in another process
remote = spawn('node', [__dirname + '/happn_instance']);

var random;

remote.stdout.on('data', function(data) {

  console.log(data.toString());

  if (data.toString().match(/READY/)){
  	happn_client.create(clientConfig, function(e, instance){
  		if (e){
  			console.log('error connecting to remote happn instance: ', e);
  			return endProcess();
  		}
  		clientInstance = instance;
  		var RandomActivityGenerator = require("happn-random-activity-generator");
  		random = new RandomActivityGenerator(clientInstance);

  		random.generateActivityStart("test", function(e){

  			if (e){
	  			console.log('error starting random activity: ', e);
	  			return endProcess();
	  		}

	  		setInterval(function(){
	  			var aggregatedLog = random.__operationLogAggregated["test"];
	  			console.log('RANDOM ACTIVITIES - AGGREGATED:::', aggregatedLog);
	  		}, ACTIVITY_LOG_INTERVAL);

	  		console.log('READY - TEST FRAMEWORK UP:::');
  		}, "daemon")

  	})
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

		var killRemote = function(){
			if (remote){
				console.log('killing remote process:::');
				remote.kill();
				console.log('remote process killed:::');
			}
			process.exit(0);
		}

		if (random)
			random.generateActivityEnd("test", function(aggregatedLog){
				console.log('ended random activity:::', aggregatedLog);
				killRemote();
			});
		else
			killRemote();


	 }catch(e){
	 	//do nothing
	 	process.exit(0);
	 }


};

process.on('SIGINT', function() {
	endProcess();
});

process.on('SIGTERM', function() {
	endProcess();
});