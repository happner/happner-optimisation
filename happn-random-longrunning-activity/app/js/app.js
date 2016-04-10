'use strict';

/* App Module */

var ideControllers = angular.module('ideControllers', []);

var ideApp = angular.module('ideApp', [
  'ui.bootstrap',
  'ngAnimate',
  'ideControllers',
  'ideServices',
  'ngDragDrop',
  'happn',
  'ngLoadScript',
  'chart.js'
]);

ideApp.directive('dynamic', function ($compile) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, ele, attrs) {
      scope.$watch(attrs.dynamic, function(html) {
        ele.html(html);
        $compile(ele.contents())(scope);
      });
    }
  };
});

ideApp.directive ('compileHtml', function($compile) {
	return  {
	  restrict: 'A',
	  scope: { compileHtml : '=' },
	  replace: true,
	  link: function (scope, element, attrs) {
		  console.log(element);
		  console.log(element);

		  scope.$watch('compileHtml', function(html) {
			  element.html(html);
			  $compile(element.contents())(scope.$parent.$parent);
		  });
	  }
	}});

// var registerFirebaseService = function (serviceName) {
// 	ideApp.factory(serviceName, function (angularFire) {
//         var _url = null;
//         var _ref = null;

//         return {
//             init: function (url, force) {
//             	if (_url == null || force)
//             	{
//             		_url = url;
//                     _ref = new Firebase(_url);
//             	}
//             },
//             setToScope: function (scope, localScopeVarName) {
//                 angularFire(_ref, scope, localScopeVarName);
//             },
//             traverse:function(data, path, done){
//             	try
//             	{
//             		var currentNode = data;
//             		var found = false;

//             		if (path[0] == '/')
//             			path = path.substring(1, path.length);

//                 	path.split('/').map(function(current, index, arr){
//                 		currentNode = currentNode[current];
//                 		if (index + 1 == arr.length && currentNode){
//                 			found = true;
//                 			done(null, currentNode);
//                 		}
//                 	});

//                 	if (!found)
//                 		done(null, null);
//             	}catch(e){
//             		done(e);
//             	}

//             }
//         };
//     });
// };

var registerDataService = function (serviceName) {
  ideApp.factory(serviceName, function (happnClient) {
        var _happn = null;

        return {
            instance:happnClient,
            init: function (host, port, username, password, done) {
              happnClient.connect(host, port, username, password, done);
            },
            traverse:function(data, path, done){
              try
              {
                var currentNode = data;
                var found = false;

                if (path[0] = '/')
                  path = path.substring(1, path.length);

                  path.split('/').map(function(current, index, arr){
                    currentNode = currentNode[current];
                    if (index + 1 == arr.length && currentNode){
                      found = true;
                      done(null, currentNode);
                    }
                  });

                  if (!found)
                    done(null, null);
              }catch(e){
                done(e);
              }

            }
        };
    });
};

if (!$) throw new Error('JQUERY missing');

$.getJSON('js/settings.json', function(settings){
  console.log('have app settings:::', settings);
  ideApp.constant('settings', settings);
  registerDataService('dataService');
  angular.bootstrap(document, ['ideApp']);
});



