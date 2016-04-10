var happn = require('happn')
var service = happn.service;
var happn_client = happn.client;

var test_id = process.argv[2];
var PORT = process.argv[3];

var test_file = __dirname + '/data/test-' + test_id + '.db';

var happn = require('happn')
var happnInstance; //this will be your server instance

var DUMP_INTERVAL = 1000 * 60 * 20;//every 20 minutes
var STATS_INTERVAL = 1000 * 60 * 5;//every 5 minutes
var GC_INTERVAL = 1000 * 60 * 15;//every 15 minutes

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
	    return console.log("ERROR");

  	happnInstance = happn; //here it is, your server instance

  	setInterval(function(){
  		heapdump.writeSnapshot();

  		var latestSnapShot = getLatestHeapSnapshot();
  		console.log("DUMP:::" + JSON.stringify({timestamp:Date.now(), file:latestSnapShot}));

  	}, DUMP_INTERVAL);

  	setInterval(function(){
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

  	}, STATS_INTERVAL);

  	setInterval(function(){
  		global.gc();
  		console.log("GC:::" + JSON.stringify({timestamp:Date.now()}));
  	}, GC_INTERVAL);

 	console.log("READY");

});
