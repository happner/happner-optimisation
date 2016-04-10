(function(window, angular, undefined) {'use strict';
////console.log('registering happn');

if (!HappnClient)
   throw 'Happn browser client library not referenced';

angular.module('happn', [])

.factory('happnClient', ['$window', function(wind) {
 return {
      connect:function(host, port, username, password, done){
        var _this = this;

        wind.HappnClient.create({
          config:{host:host, port:port, username:username, password:password},
          secure:true
        }, function(e, clientInstance){

          if (e) return done(e);

          _this.client = clientInstance;
          console.log('created client:::', clientInstance);
          done();

        });

      }
   }
}])

})(window, window.angular);