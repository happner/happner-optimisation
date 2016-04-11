var spawn = require('child_process').spawn
  , sep = require('path').sep
  , remote
  , happn = require('happn')
  , service = happn.service
  , happn_client = happn.client
  , serveStatic = require('serve-static')
  , fs = require('fs')
  ;

var clientInstance;

var PORT = 55000;

var RANDOM_ACTIVITY_INTERVAL = 1000;//every second

if (process.env.RANDOM_ACTIVITY_INTERVAL)
	RANDOM_ACTIVITY_INTERVAL = process.env.RANDOM_ACTIVITY_INTERVAL;

if (process.env.PORT)
	PORT = process.env.PORT;

var REMOTE_PORT = PORT + 1;

if (process.env.REMOTE_PORT)
	REMOTE_PORT = process.env.REMOTE_PORT;

var STATS_IP = "127.0.0.1";

if (process.env.STATS_IP)
	STATS_IP = process.env.STATS_IP;

var REMOTE_IP = "127.0.0.1";

if (process.env.REMOTE_IP)
	REMOTE_IP = process.env.REMOTE_IP;

var ADMIN_PASSWORD = 'happn';

if (process.env.ADMIN_PASSWORD)
	ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

var remoteClientConfig = {
	config:{
	  port:REMOTE_PORT,
	  secure:true,
	  username:'_ADMIN',
	  password:ADMIN_PASSWORD
	}
}

var ACTIVITY_LOG_INTERVAL = 1000 * 60 * 1;//every minute
var statsService;
var statsClient;

var generateName = require('sillyname');

var test_id = Date.now() + '_' + generateName().split(' ')[0];
var testFile = __dirname + '/stats-' + test_id + '.db';

var random;

var config = {
	name:test_id,
	secure:true,
	port:PORT,
    services: {
      data: {
        path: './services/data_embedded/service.js',
        config:{
           filename:testFile
        }
      }
    },
    middleware:{
        security:{
          exclusions:[
            '/index.htm',
            '/css/*',
            '/font/*',
            '/fonts/*',
            '/img/*',
            '/js/*',
            '/lib/*',
            '/templates/*',
            '/settings.json',
            '/favicon.ico'
          ]
        }
   	}
}

var clientConfig = {
	config:{
		username:'_ADMIN',
		password:ADMIN_PASSWORD,
		secure:true,
		port:PORT
	}
}

var STATS_USERNAME = 'STATS_USER';

if (process.env.STATS_USERNAME)
	STATS_USERNAME = process.env.STATS_USERNAME;

var STATS_PASSWORD = 'STATS1234';

if (process.env.STATS_PASSWORD)
	STATS_PASSWORD = process.env.STATS_PASSWORD;

var logStats = function(type, data, cb){
	statsClient.set('/STATS/' + type.toUpperCase() + '/' + Date.now(), data, cb);
}

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

var createStatsUser = function(service, cb){

	var statsGroup = {
      name:'STATS',
      permissions:{
      	 '/STATS/*':{actions:['get','on']}
      }
    }

    var statsUser = {
      username:STATS_USERNAME,
      password:STATS_PASSWORD,
    }

	service.services.security.upsertGroup(statsGroup, {overwrite:true}, function(e, result){

        if (e) return cb(e);
        addedStatsGroup = result;

        service.services.security.upsertUser(statsUser, {overwrite:true}, function(e, result){

          if (e) return cb(e);
          addedStatsUser = result;

          service.services.security.linkGroup(addedStatsGroup, addedStatsUser, cb);


      });
    });
}

service.create(config,
	function (e, instance) {

		if (e)
		    return console.log("ERROR:" + e.toString());

		statsService  = instance;

		createStatsUser(statsService, function(e){

			happn_client.create(clientConfig, function(e, clientInstance){

				if (e){
		  			console.log('error connecting to local happn instance: ', e);
		  			return endProcess();
		  		}

				statsClient = clientInstance;

				// spawn remote happn
				remote = spawn('node', ['--expose-gc', __dirname + '/happn_instance', test_id, REMOTE_PORT, ADMIN_PASSWORD]);

				console.log('spawned:::');

				process.on('SIGINT', function() {
						endProcess();
				});

				process.on('SIGTERM', function() {
						endProcess();
				});

				remote.stdout.on('data', function(data) {

				  if (data.toString().match(/READY/)){
				  	happn_client.create(remoteClientConfig, function(e, instance){

				  		if (e){
				  			console.log('error connecting to remote happn instance: ', e);
				  			return endProcess();
				  		}

				  		remoteClientInstance = instance;
				  		var RandomActivityGenerator = require("happn-random-activity-generator");
				  		random = new RandomActivityGenerator(remoteClientInstance, {interval:RANDOM_ACTIVITY_INTERVAL});

				  		random.generateActivityStart("test", function(e){

				  			if (e){
					  			console.log('error starting random activity: ', e);
					  			return endProcess();
					  		}

					  		setInterval(function(){
					  			var aggregatedLog = random.__operationLogAggregated["test"];

								logStats('activity', aggregatedLog, function(e, result){
					  				if (e) return console.log('error setting stats: ' );
					  			});

					  		}, ACTIVITY_LOG_INTERVAL);

					  		console.log('READY - TEST FRAMEWORK UP:::');
				  		}, "daemon")

				  	})

				  	fs.writeFileSync(__dirname + '/app/js/settings.json', JSON.stringify({"port":PORT, "ip":STATS_IP, "username":STATS_USERNAME, "password":STATS_PASSWORD}));

				  	statsService.connect.use(serveStatic(__dirname + '/app'));
		          	console.log('service up and listening on port ' + PORT);
				  }

				  if (data.toString().indexOf("DUMP") >= 0){
				  	var dumpFile = data.toString().split(':::')[1];
				  	logStats('usage/dump', dumpFile, function(e, result){
					  	if (e) return console.log('error setting stats: ' + e );
					});
				  }

				  if (data.toString().indexOf("STATS") >= 0){
				  	var statsObj = JSON.parse(data.toString().split(':::')[1]);

				  	console.log('mem-stats:::', statsObj);

				  	logStats('usage/memory-disk', statsObj, function(e, result){
					  	if (e) return console.log('error setting stats: ' + e );
					});
				  }

				  if (data.toString().indexOf("GC") >= 0){

				  	var statsObj = JSON.parse(data.toString().split(':::')[1]);
				  	logStats('usage/gc', statsObj, function(e, result){
					  	if (e) return console.log('error setting stats: ' + e );
					});
				  }

				  if (data.toString().indexOf("LOG") >= 0){

				  	var statsObj = JSON.parse(data.toString().split(':::')[1]);
				  	logStats('usage/log', statsObj, function(e, result){
					  	if (e) return console.log('error setting log: ' + e );
					});
				  }

				});

			});

		});
});
