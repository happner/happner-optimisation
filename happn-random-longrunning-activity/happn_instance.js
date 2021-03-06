var happn = require('happn')
var service = happn.service;
var happn_client = happn.client;

var test_id = process.argv[2];
var PORT = process.argv[3];

var test_file = __dirname + '/data/test-' + test_id + '.db';

var happn = require('happn')
var happnInstance; //this will be your server instance

var usageConfig = require('./test_config').usage;

var DUMP_INTERVAL = usageConfig.DUMP_INTERVAL;
var STATS_INTERVAL = usageConfig.STATS_INTERVAL;
var GC_INTERVAL = usageConfig.GC_INTERVAL;

var ADMIN_PASSWORD = 'happn';

if (process.env.ADMIN_PASSWORD)
  ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

var heapdump = require('heapdump');
var fs = require('fs');
var path = require('path');
var util = require('util');

var config = {
	secure:true,
	port:PORT,
    services: {
      data: {
        path: './services/data_embedded/service.js',
        config:{
           filename:test_file
        }
      },
      security:{
        config:{
          adminUser:{
            password:ADMIN_PASSWORD
          }
        }
      }
    }
}

var getFileSize = function(){
	var fs = require("fs"); //Load the filesystem module
	var stats = fs.statSync(test_file);
	return stats["size"];
};

var getLatestHeapSnapshot = function(){
	var fs = require("fs");
	var latestFile = null;

	fs.readdirSync(__dirname).forEach(function (name) {
		if (name.indexOf(".heapsnapshot") > -1){
			var filePath = path.join(__dirname, name);
	        var stats = fs.statSync(filePath);

        	if (!latestFile){
        		latestFile = stats;
        		latestFile.path = filePath;
        	}
        	else{
        		if (stats.ctime >= latestFile.ctime){
        			latestFile = stats;
        			latestFile.path = filePath;
        		}
        	}
		}
    });

    return latestFile.path;
}

var postLog = function(message){
	console.log('LOG:::', JSON.stringify({"timestamp":Date.now(), "message":message}));
}

postLog("starting test with id: " + test_id + ", remote port:" + PORT);

happn.service.create(config,
function (e, happn) {
	if (e)
	    return console.log("ERROR:::" + e.toString());

  	happnInstance = happn; //here it is, your server instance

  	setInterval(function(){
      try{
        heapdump.writeSnapshot();

        var latestSnapShot = getLatestHeapSnapshot();
        console.log("DUMP:::" + JSON.stringify({timestamp:Date.now(), file:latestSnapShot}));
      }catch(e){
        console.log("ERROR:::" + e.toString());
      }

  	}, DUMP_INTERVAL);

  	setInterval(function(){
      try{
    		var fileSize = getFileSize();
    		var memUsage = util.inspect(process.memoryUsage());

    		var message = {
    			timestamp:Date.now(),
    			mem:memUsage,
    			file:{
    				size:fileSize,
    				path:test_file
    			}
    		}

    		console.log("STATS:::" + JSON.stringify(message));
      }catch(e){
        console.log("ERROR:::" + e.toString());
      }
  	}, STATS_INTERVAL);

  	setInterval(function(){
      try{
    		global.gc();
    		console.log("GC:::" + JSON.stringify({timestamp:Date.now()}));
      }catch(e){
        console.log("ERROR:::" + e.toString());
      }
  	}, GC_INTERVAL);

 	console.log("READY");

});
