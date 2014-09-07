/*jshint browser:true, devel:true */
/*global define:false */

define(['backbone', 'backbone-proxy'], function (Backbone, BackboneProxy) {

  'use strict';

  return {
    run: function () {
      var User, user, UserProxy, userProxy;

      User = Backbone.Model.extend({
        defaults: {
          name: 'Anna',
          age: 23
        }
      });
      user = new User();
      UserProxy = BackboneProxy.extend(user);
      userProxy = new UserProxy();

      user.on('change', function () {
        alert('ok');
      });

      userProxy.set({ name: 'Betty' });
    }
  };
});
