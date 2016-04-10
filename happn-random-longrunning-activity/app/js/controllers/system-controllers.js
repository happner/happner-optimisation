'use strict';

ideControllers.controller('DashboardController', ['$scope', '$uibModal', '$log', '$sce', 'dataService', '$rootScope', 'settings', function($scope, $uibModal, $log, $sce, dataService, $rootScope, settings) {

	$rootScope.data = {"message":{"display":"none"}, "events":[]};

	$scope.chart_labels = ["January", "February", "March", "April", "May", "June", "July"];
	$scope.chart_series = ['Series A', 'Series B'];
	$scope.chart_data = [
	    [65, 59, 80, 81, 56, 55, 40],
	    [28, 48, 40, 19, 86, 27, 90]
	];

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

		$rootScope.data[notifyType].type = 'alert-' + type;
		$rootScope.data[notifyType].message = message;
		$rootScope.data[notifyType].display = 'inline-block';

		$rootScope.$apply();

		if (hide) setTimeout(function(){
			$rootScope.data[notifyType].display = 'none';
			$rootScope.$apply();
		}, hide);
	}

	console.log('about to init:::');

	var incomingCount = 0;

	dataService.init(settings.ip, settings.port, settings.username, settings.password, function(e){

		if (e) throw e;

		console.log('STATS client connected:::');

		dataService.instance.client.on('/STATS/*', function(data, meta){

			incomingCount++;
			$rootScope.notify('incoming data event #' + incomingCount, 'success');

			var item = {
				data:data,
				meta:meta
			}

			$rootScope.data.incomingEvent = item;
			$rootScope.data.events.unshift(item);

			if ($rootScope.data.events.length > 40)
				$rootScope.data.outgoingEvent = $rootScope.data.events.pop();

			console.log('events length::',$rootScope.data.events.length);
			console.log('latest event::',data, meta);

			$rootScope.$apply();

		}, function(e){
			if (e) {
				$rootScope.notify('attached to data events failed', 'danger');
				console.log(e);
			}
		})
		//dataService.instance.client.get('/SYSTEM/CONFIG', function(e, config){


	});


}]);

ideControllers.controller('WidgetController', ['$scope', '$rootScope', '$uibModal', '$log', 'dataService', '$templateCache',
	function($scope, $rootScope, $uibModal, $log, dataService, $templateCache) {



}]);

