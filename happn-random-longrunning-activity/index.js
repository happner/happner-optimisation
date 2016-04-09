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

var ACTIVITY_LOG_INTERVAL = 30000;
var statsService;
var statsClient;

var testFile = __dirname + '/stats-' + Date.now();

var config = {
	secure:true,
	port:55006,
    services: {
      data: {
        path: './services/data_embedded/service.js',
        config:{
           filename:testFile
        }
      }
    }
}

var clientConfig = {
	config:{
		username:'_ADMIN',
		password:'happn',
		secure:true,
		port:55006
	}
}

var logStats = function(type, data, cb){
	statsClient.set('/STATS/' + type.toUpperCase() + '/' + Date.now(), data, cb);
}

service.create(config,
	function (e, instance) {

		if (e)
		    return console.log("ERROR:" + e.toString());

		statsService  = instance;

		happn_client.create(clientConfig, function(e, clientInstance){

		if (e){
  			console.log('error connecting to local happn instance: ', e);
  			return endProcess();
  		}

		statsClient = clientInstance;

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

						logStats('activity', aggregatedLog, function(e, result){
			  				if (e) return console.log('error setting stats: ' );
			  			});

			  		}, ACTIVITY_LOG_INTERVAL);

			  		console.log('READY - TEST FRAMEWORK UP:::');
		  		}, "daemon")

		  	})
		  }

		  if (data.toString().indexOf(/DUMP/) >= 0){
		  	var dumpFile = data.toString().split(':::')[1];
		  	logStats('dump', dumpFile, function(e, result){
			  	if (e) return console.log('error setting stats: ' + e );
			});
		  }

		  if (data.toString().indexOf(/STATS/) >= 0){
		  	var statsObj = JSON.parse(data.toString().split(':::')[1]);
		  	logStats('memory', statsObj, function(e, result){
			  	if (e) return console.log('error setting stats: ' + e );
			});
		  }

		});

	});

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