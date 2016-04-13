'use strict';

ideControllers.controller('DashboardController', ['$scope', '$uibModal', '$log', '$sce', 'dataService', '$rootScope', 'settings', 'amMoment','$timeout', function($scope, $uibModal, $log, $sce, dataService, $rootScope, settings, amMoment, $timeout) {


	$rootScope.data = {"message":{"display":"none"}, "events":[]};

	$scope.from = new Date(Date.now() - (1000 * 60 * 60 * 24));//24 hours ago
	$scope.to = new Date(Date.now()); //now

	$scope.dataWindowSize = 10000;

	$scope.chart_labels = [];
	$scope.chart_series = ['get', 'set', 'on', 'remove', 'total get', 'total set', 'total on', 'total remove'];

	$scope.usage_chart_series = ['GC', 'FILE', 'MEM-HEAP-TOTAL', 'MEM-HEAP-USED', 'MEM-RSS', 'DUMP'];
	$scope.chart_data = [];

	$rootScope.chartClick = function (points, evt) {
	    console.log(points, evt);
	};

	$rootScope.openModal = function (templatePath, controller, handler, args) {

		    var modalInstance = $uibModal.open({
		      templateUrl: templatePath,
		      controller: controller,
		      resolve: {
		        data: function () {
		          return $scope.data;
		        },
		        args: function () {
		          return args;
		        }
		      }
		    });

      if (handler)
    	  modalInstance.result.then(handler.saved, handler.dismissed);
	};

	$rootScope.openNewModal = function (template, controller) {

		 var handler = {
				 saved:function(result){
				 	$rootScope.updateData(result);
				 },
				 dismissed:function(){
					 $log.info('Modal dismissed at: ' + new Date());
				 }
		 };

		 return $scope.openModal('../templates/' + template + '.html', controller, handler);
	};

	$rootScope.to_trusted = function(html_code) {
		  return $sce.trustAsHtml(html_code);
	};

	$rootScope.toArray = function(items){
		  var returnArray = [];
		  for (var item in items)
			  returnArray.push(item);

			console.log('returning array:::', returnArray);

		  return returnArray;
	};

	$rootScope.getArray = function(items){
		var returnArray = [];
		for (var itemName in items)
			  returnArray.push(itemName);
		return returnArray;
	};

	$rootScope.notify = function(message, type, hide, modular){

		if (!type) type = 'info';
		if (!hide) hide = 0;

		var notifyType = 'message';
		if (modular) notifyType = 'messagemodular'

		$timeout(function(){
			$rootScope.data[notifyType].type = 'alert-' + type;
			$rootScope.data[notifyType].message = message;
			$rootScope.data[notifyType].display = 'inline-block';

			if (hide) setTimeout(function(){
				$rootScope.data[notifyType].display = 'none';
				$rootScope.$apply();
			}, hide);
		});
	}

	$rootScope.clickedEvent = function(event){
		$rootScope.selectedEvent = JSON.stringify(event);
	}

	//clickedActivityEvent
	//clickedUsageEvent
	$rootScope.clickedUsageEvent = function(event){
		$rootScope.selectedUsageEvent = JSON.stringify(event);
	}

	$rootScope.clickedActivityEvent = function(event){
		$rootScope.selectedActivityEvent = JSON.stringify(event);
	}

	$rootScope.refreshCharts = function(){
		$rootScope.notify('chart refreshing', 'info');

		refreshChart(function(e){
			if (e) return $rootScope.notify('chart refresh failed', 'danger');
			$rootScope.$apply();
			$rootScope.notify('chart refreshed ok', 'info');
		});
	}

	var incomingCount = 0;

	var refreshChart = function(cb){

		var createChartData = function(dataSet){

			var chart = {};

			chart.chart_labels = [];
			//'get', 'set', 'on', 'remove', 'total get', 'total set', 'total on', 'total remove', 'GC', 'FILE', 'MEM-HEAP-TOTAL', 'MEM-HEAP-USED', 'MEM-RSS'
			chart.chart_data = [
				[],//'get'
				[],//'set'
				[],//'on'
				[],//'remove'
				[],//'total get'
				[],//'total set'
				[],//'total on'
				[] //'total remove'
			];

			var lastItem = null;

			dataSet.sort(function(a, b){
				return a.meta["created"] - b.meta["created"];
			});

			dataSet.map(function(item){

				chart.chart_labels.push(new Date(item.meta.created));
				//normal activity post
				if (item.data.get >= 0){

					var lastGet,lastSet,lastOn,lastRemove;

					if (!lastItem){
						lastGet = item.data.get;
						lastSet = item.data.set;
						lastOn = item.data.on;
						lastRemove = item.data.remove;
					}else{
						lastGet = item.data.get - lastItem.data.get;
						lastSet = item.data.set  - lastItem.data.set;
						lastOn = item.data.on  - lastItem.data.on;
						lastRemove = item.data.remove  - lastItem.data.remove;
					}

					lastItem = item;

					chart.chart_data[0].push(lastGet);
					chart.chart_data[1].push(lastSet);
					chart.chart_data[2].push(lastOn);
					chart.chart_data[3].push(lastRemove);

					chart.chart_data[4].push(item.data.get);
					chart.chart_data[5].push(item.data.set);
					chart.chart_data[6].push(item.data.on);
					chart.chart_data[7].push(item.data.remove);
				}

			});

			$scope.chart_labels = chart.chart_labels;
			$scope.chart_data = chart.chart_data;
			$scope.chart_dataset = dataSet;

			cb(null, chart);

		}

		var createUsageChartData = function(dataSet){

			var chart = {};

			chart.chart_labels = [];
			//'get', 'set', 'on', 'remove', 'total get', 'total set', 'total on', 'total remove', 'GC', 'FILE', 'MEM-HEAP-TOTAL', 'MEM-HEAP-USED', 'MEM-RSS'
			chart.chart_data = [
				[],//'GC'
				[],//'FILE'
				[],//'MEM-HEAP-TOTAL'
				[],//'MEM-HEAP-USED'
				[],//'MEM-RSS'
				[]//'DUMP'
			];

			var lastItem = null;

			dataSet.sort(function(a, b){
				return a.meta["created"] - b.meta["created"];
			});

			var lastGC = 0;
			var lastFileSize = 0;
			var lastHeapTotal = 0;
			var lastHeapUsed = 0;
			var lastRSS = 0;

			dataSet.map(function(item){

				chart.chart_labels.push(new Date(item.meta.created));

				//activity post
				if (item.meta.path.indexOf('/STATS/USAGE/GC') >= 0){
					console.log('GC item:::', item.meta.created);
					chart.chart_data[0].push(300000);
				}else
					chart.chart_data[0].push(0);

				//activity post /STATS/MEMORY/
				if (item.meta.path.indexOf('/STATS/USAGE/MEMORY-DISK') >= 0){
					chart.chart_data[1].push(item.data.file.size);//File in KB

					//{ rss: 78114816, heapTotal: 59702528, heapUsed: 29841952 }
					var memString = item.data.mem.replace('rss','"rss"').replace('heapTotal','"heapTotal"').replace('heapUsed','"heapUsed"');
					var mem = JSON.parse(memString);

					chart.chart_data[2].push(mem.heapTotal / 1000);//heap total in KB
					chart.chart_data[3].push(mem.heapUsed / 1000);//heap total in KB
					chart.chart_data[4].push(mem.rss / 1000);//heap total in KB

					lastFileSize = item.data.file.size;
					lastHeapTotal = mem.heapTotal / 1000;
					lastHeapUsed = mem.heapUsed / 1000;
					lastRSS = mem.rss / 1000;

				}else{
					chart.chart_data[1].push(lastFileSize);//heap total in KB
					chart.chart_data[2].push(lastHeapTotal);//heap total in KB
					chart.chart_data[3].push(lastHeapUsed);//heap total in KB
					chart.chart_data[4].push(lastRSS);//heap total in KB
				}

				if (item.meta.path.indexOf('/STATS/USAGE/DUMP') >= 0){
					chart.chart_data[5].push(300000);
				}else
					chart.chart_data[5].push(0);

			});

			$scope.usage_chart_labels = chart.chart_labels;
			$scope.usage_chart_data = chart.chart_data;

			$scope.usage_chart_dataset = dataSet;

			cb(null, chart);

		}

		var momentInstanceFrom = new moment($scope.from).valueOf();
		var momentInstanceTo = new moment($scope.to).valueOf();

		var searchParams = {
			criteria:{
				"_meta.created":{"$gte":momentInstanceFrom, "$lte":momentInstanceTo}
			},
			options:{
				sort:{"created":-1}
			}
		}

		dataService.instance.client.get('/STATS/ACTIVITY/*', searchParams, function(e, results){

			if (e){
				cb(new Error('fetching events for chart failed'));
				return console.log(e);
			}

			console.log('activity results:::', results);

			var statsData = [];

			results.map(function(result){
				statsData.push({data:result, meta:result._meta, created:new Date(result._meta.created)});
			});

			createChartData(statsData);
		});

		var usageSearchParams = {
			criteria:{
				"_meta.created":{"$gte":momentInstanceFrom, "$lte":momentInstanceTo}
			},
			options:{
				sort:{"created":-1}
			}
		}

		console.log('getting usage:::', usageSearchParams);

		dataService.instance.client.get('/STATS/USAGE/*', usageSearchParams, function(e, results){

			if (e){
				cb(new Error('fetching events for chart failed'));
				return console.log(e);
			}

			console.log('usage results:::', results);

			var statsUsageData = [];

			results.map(function(result){
				statsUsageData.push({data:result, meta:result._meta, created:new Date(result._meta.created)});
			});

			createUsageChartData(statsUsageData);
		});


	}

	dataService.init(settings.ip, settings.port, settings.username, settings.password, function(e){

		if (e) throw e;

		dataService.instance.client.on('/STATS/*', function(data, meta){

			incomingCount++;
			$rootScope.notify('incoming data event #' + incomingCount, 'success');

			var item = {
				data:data,
				meta:meta
			}

			$rootScope.data.incomingEvent = item;
			$rootScope.data.events.unshift(item);

			if ($rootScope.data.events.length >= $scope.dataWindowSize)
				$rootScope.data.outgoingEvent = $rootScope.data.events.pop();

			// console.log('events length::',$rootScope.data.events.length);
			// console.log('latest event::',data, meta);

			// if (item.meta.path.indexOf('/STATS/GC') == 0){
			// 	console.log('GC HAPPENED');
			// }

			// if (item.meta.path.indexOf('/STATS/ACTIVITY') == 0){
			// 	console.log('ACTIVITY HAPPENED');
			// }

			// if (item.meta.path.indexOf('/STATS/MEMORY') == 0){
			// 	console.log('MEMORY HAPPENED');
			// }

			// if (item.meta.path.indexOf('/STATS/DUMP') == 0){
			// 	console.log('DUMP HAPPENED');
			// }

			// if (item.meta.path.indexOf('/STATS/LOG') == 0){
			// 	console.log('LOG HAPPENED');
			// }

		}, function(e){
			if (e) {
				$rootScope.notify('attached to data events failed', 'danger');
				console.log(e);
			}
		});

		//dataService.instance.client.get('/SYSTEM/CONFIG', function(e, config){
		refreshChart(function(e){
			if (e) return $rootScope.notify('chart refresh failed', 'danger');
			$rootScope.$apply();
		});

	});


}]);

ideControllers.controller('WidgetController', ['$scope', '$rootScope', '$uibModal', '$log', 'dataService', '$templateCache',
	function($scope, $rootScope, $uibModal, $log, dataService, $templateCache) {



}]);

