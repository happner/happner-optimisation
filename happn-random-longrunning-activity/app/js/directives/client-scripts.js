
'use strict';

angular.module('ngLoadScript', [])

.directive('script', function() {
  return {
    restrict: 'E',
    scope: false,
    link: function(scope, elem, attr) {

      console.log('linking script...');

      if (attr.type === 'text/javascript-init') {
        var code = elem.text();
        var f = new Function(code);
        f();
      }

      if (attr.type === 'text/javascript-external'){
        $.getScript( attr.src, function( data, textStatus, jqxhr ) {

        });
      }
    }
  };
});
