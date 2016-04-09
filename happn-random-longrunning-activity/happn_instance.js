var happn = require('happn')
var service = happn.service;
var happn_client = happn.client;
var test_file = __dirname + '/data/test-' + Date.now() + '.db';

var happn = require('happn')
var happnInstance; //this will be your server instance

var DUMP_INTERVAL = 1000 * 60 * 10;//every 10 minutes
var STATS_INTERVAL = 1000 * 60 * 5;//every 10 minutes

var heapdump = require('heapdump');
var fs = require('fs');
var path = require('path');
var util = require('util');

var config = {
	secure:true,
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

happn.service.create(config,
function (e, happn) {
	if (e)
	    return console.log("ERROR");

  	happnInstance = happn; //here it is, your server instance

  	setInterval(function(){
  		heapdump.writeSnapshot();

  		var latestSnapShot = getLatestHeapSnapshot();
  		console.log("DUMP:::" + latestSnapShot);

  	}, DUMP_INTERVAL);

  	setInterval(function(){
  		var fileSize = getFileSize();
  		var memUsage = util.inspect(process.memoryUsage());

  		var message = {
  			mem:memUsage,
  			file:{
  				size:fileSize,
  				path:test_file
  			}
  		}

  		console.log("STATS:::" + JSON.stringify(message));

  	}, STATS_INTERVAL);

 	console.log("READY");

});
