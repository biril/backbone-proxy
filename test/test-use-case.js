/*global Backbone, BackboneProxy, QUnit, test, strictEqual, throws */
(function () {
  'use strict';

  var User = Backbone.Model.extend({ defaults: { name: 'Anna' } }), user;

  QUnit.module('use case', {
    setup: function () {
      user = new User();
    }
  });

  test('proxies that log attribute changes', 2, function () {
    var
      nextExpectedLog,
      console = {
        log: function (msg) {
          nextExpectedLog || (nextExpectedLog = 'setting name to Mairy on user');
          strictEqual(msg, nextExpectedLog, 'logged "' + msg + '"');
          nextExpectedLog = 'user name is Mairy';
        }
      };

    ////

    // Create a UserProxy class. Instances will proxy the given user model
    // Note that in this case, user is a model _instance_ - not a class
    var UserProxy = BackboneProxy.extend(user);

    // Instantiate a logging proxy - a proxy that logs all invocations of .set
    var userWithLog = new UserProxy();
    userWithLog.set = function (key, val, options) {
      console.log('setting ' + key + ' to ' + val + ' on user');

      // Delegate to UserProxy implementation
      UserProxy.prototype.set.apply(this, arguments);
    };

    // Will not log
    user.set('name', 'Norman');

    // Will log 'setting name to Mairy on user'
    userWithLog.set('name', 'Mairy');

    // Will log 'user name is Mairy'
    console.log('user name is ' + user.get('name'));
  });


  test('readonly proxies', 2, function () {

    var alert = function (msg) {
        strictEqual(msg, 'user name was set to Mairy', 'logged expected message');
      };

    ////

    // Create a UserProxy class
    var UserProxy = BackboneProxy.extend(user);

    // Instantiate a readonly proxy - a proxy that throws on any invocation of .set
    var userReadonly = new UserProxy();
    userReadonly.set = function () {
      throw 'cannot set attributes on readonly user model';
    };

    // Attributes cannot be set on userReadonly
    // However attribute changes can be listened for
    userReadonly.on('change:name', function () {
      alert('user name was set to ' + userReadonly.get('name'));
    });

    throws(function () {
      // Will throw
      userReadonly.set('name', 'Mairy');
    }, 'setting readonly proxy throws');

    // Will alert 'user name was set to Mairy'
    user.set('name', 'Mairy');
  });


  test('view-specific proxies', 2, function () {
    var
      nextExpectedLog,
      console = {
        log: function (msg) {
          nextExpectedLog || (nextExpectedLog = 'user modified by view1');
          strictEqual(msg, nextExpectedLog, 'logged "' + msg + '"');
          nextExpectedLog = 'user modified by view2';
        }
      },
      SomeView = Backbone.View.extend({
        modifyModel: function () {
          this.model.set({ name: 'Betty' });
        }
      }),
      SomeOtherView = Backbone.View.extend({
        modifyModel: function () {
          this.model.set({ name: 'Charles' });
        }
      });

    ////

    // Create a UserProxy class
    var UserProxy = BackboneProxy.extend(user);

    // Instantiate a proxy to pass to view1
    var userProxy1 = new UserProxy();
    userProxy1.set = function (key, val, opts) {

      // Handle both `"key", value` and `{key: value}` -style arguments
      var attrs;
      if (typeof key === 'object') { attrs = key; opts = val; }
      else { (attrs = {})[key] = val; }

      // Automatically update lastUpdatedBy to 'view1' on every invocation of set
      attrs.lastUpdatedBy = 'view1';

      // Delegate to UserProxy implementation
      UserProxy.prototype.set.call(this, attrs, opts);
    };

    // Instantiate a proxy to pass to view2. Similar to userProxy1 -
    //  will automatically set the lastUpdatedBy attr to 'view2'
    var userProxy2 = new UserProxy();
    userProxy2.set = function (key, val, opts) {
      var attrs;
      if (typeof key === 'object') { attrs = key; opts = val; }
      else { (attrs = {})[key] = val; }

      attrs.lastUpdatedBy = 'view2';

      UserProxy.prototype.set.call(this, attrs, opts);
    };

    var view1 = new SomeView({ model: userProxy1 });
    var view2 = new SomeOtherView({ model: userProxy2 });

    // Will log modifications of user object '..by view1' / '..by view2'
    user.on('change', function () {
      console.log('user modified by ' + user.get('lastUpdatedBy'));
    });

    view1.modifyModel();
    view2.modifyModel();
  });

}());