'use strict';

/* Services */

var ideServices = angular.module('ideServices', []);

ideServices.service('utils', ['$rootScope', function($rootScope) {

	this.toPropertyNameArray = function(obj){
		var returnArray = [];

		for (var prop in obj)
			returnArray.push(prop);
		return returnArray;
	 }

	this.toArray = function(obj){
		var returnArray = [];

	  	for (var prop in obj)
		  returnArray.push(obj[prop]);

		return returnArray;
	}

	this.sortByProperty = function(propertyName, arr, direction){
		if (!direction || ['ASC','DESC'].indexOf(direction) == -1)
			direction = 'ASC';

		arr.sort(function(a, b){
			if (a[propertyName] != null && b[propertyName]  != null){
				if (direction == 'ASC')
					return a - b;
				else
					return b - a;
			}
		});

		return arr;
	}


}]);