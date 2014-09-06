/*global Backbone, BackboneProxy, QUnit, test, strictEqual, ok, throws */
(function () {
  'use strict';

  var
    User = Backbone.Model.extend({ defaults: { name: 'Anna', age: 23 } }), user,
    DummyView = Backbone.View.extend({
      constructor: function DummyView () {
        // _Don't_ ensureElement. This will break the tests in environments where $ is not defined
        this._ensureElement = function () {};
        Backbone.View.apply(this, arguments);
      }
    });

  QUnit.module('examples: use cases', {
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
    userWithLog.set = function (key, val) {
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
      SomeView = DummyView.extend({
        modifyModel: function () {
          this.model.set({ name: 'Betty' });
        }
      }),
      SomeOtherView = DummyView.extend({
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

  ////////

  var proxied, proxy;

  QUnit.module('examples: usage', {
    setup: function () {
      proxied = new User();
      var Proxy = BackboneProxy.extend(proxied);
      proxy = new Proxy();
    }
  });

  test('attributes set on proxied will be set on proxy. And vice versa.', 2, function () {
    var
      nextExpectedLog,
      console = {
        log: function (msg) {
          nextExpectedLog || (nextExpectedLog = 'Betty');
          strictEqual(msg, nextExpectedLog, 'logged "' + msg + '"');
          nextExpectedLog = 'Charles';
        }
      };

    ////

    proxied.set({ name: 'Betty' });
    console.log(proxy.get('name')); // Will log 'Betty'

    proxy.set({ name: 'Charles' });
    console.log(proxied.get('name')); // Will log 'Charles'
  });

  test('built-in model events triggered in response to actions on proxied will be triggered on proxy. And vice versa', 2, function () {
    var
      nextExpectedLog,
      console = {
        log: function (msg) {
          nextExpectedLog || (nextExpectedLog = 'name set to Betty');
          strictEqual(msg, nextExpectedLog, 'logged "' + msg + '"');
          nextExpectedLog = 'model synced';
        }
      };

    proxied.sync = function (method, model, opts) {
      if (method === 'read') {
        opts.success(model.toJSON());
      }
    };

    ////

    proxy.on('change:name', function (model) {
      console.log('name set to ' + model.get('name'))
    });
    proxied.set({ name: 'Betty' }); // Will log 'name set to Betty'

    proxied.on('sync', function () {
      console.log('model synced');
    });
    proxy.fetch(); // Will log 'model' synced
  });

  test('user-defined events triggered on proxied will also be triggered on proxy. The opposite is _not_ true', 3, function () {
    var
      nextExpectedLog,
      console = {
        log: function (msg) {
          // Note that we're expecting 3 logs in this case, the last two having the
          //  same expected message. Order of events plays a significant role in this
          nextExpectedLog || (nextExpectedLog = 'a scare on proxied');
          strictEqual(msg, nextExpectedLog, 'logged "' + msg + '"');
          nextExpectedLog = 'a scare on proxy';
        }
      };

    ////

    proxied.on('boo', function () {
      console.log('a scare on proxied');
    });
    proxy.on('boo', function () {
      console.log('a scare on proxy');
    });

    proxied.trigger('boo'); // Will log 'a scare on proxied' & 'a scare on proxy'
    proxy.trigger('boo'); // Will only log 'a scare on proxy'
  });

  test('additions and removals of event listeners are scoped to each model (by callback)', 2, function () {
    var
      numOfLogs = 0,
      console = {
        log: function () {
          ++numOfLogs;
        }
      };

    ////

    var onModelChange = function () {
      console.log('model changed');
    };

    proxied.on('change', onModelChange);
    proxy.on('change', onModelChange);

    proxied.set({ name: 'Betty' }); // Will log 'model changed' twice

    strictEqual(numOfLogs, 2, 'logged twice on first proxied.set');

    // Will only remove the listener previously added on proxied
    proxied.off(null, onModelChange);

    proxied.set({ name: 'Charles' }); // Will log 'model changed' once

    strictEqual(numOfLogs, 3, 'logged once on second proxied.set');
  });

  test('additions and removals of event listeners are scoped to each model (by event)', 3, function () {
    var
      nextExpectedLog,
      console = {
        log: function (msg) {
          // Note that we're expecting 3 logs in this case, the last two having the
          //  same expected message. Order of events plays a significant role in this
          nextExpectedLog || (nextExpectedLog = 'caught on proxied');
          strictEqual(msg, nextExpectedLog, 'logged "' + msg + '"');
          nextExpectedLog = 'caught on proxy';
        }
      };

    ////

    proxied.on('change:name', function () {
      console.log('caught on proxied');
    });
    proxy.on('change:name', function () {
      console.log('caught on proxy');
    });

    proxied.set({ name: 'Betty' }); // Will log 'caught on proxied' & 'caught on proxy'

    // Will only remove the listener previously added on proxied
    proxied.off('change:name');

    proxied.set({ name: 'Charles' }); // Will only log 'caught on proxy'
  });

  test('removing all-event will interfere with BackboneProxy event-forwarding', 2, function () {
    var
      loggedChangeOfName, loggedChangeOfAge,
      console = {
        log: function (msg) {
          if (msg === 'changed name') {
            loggedChangeOfName = true;
          }
          if (msg === 'changed age') {
            loggedChangeOfAge = true;
          }
        }
      };

    ////

    proxy.on('change:name', function () {
      console.log('changed name');
    });
    proxy.on('change:age', function () {
      console.log('changed age');
    });

    // Will log 'changed name' & 'changed age'
    proxied.set({
      name: 'Betty',
      age: 29
    });

    ok(loggedChangeOfName, 'logged change of name');
    ok(loggedChangeOfAge, 'logged change of age');

    // Bad move
    proxied.off('all');

    // Will log nothing
    proxied.set({
      name: 'Charles',
      age: 31
    });
  });

  test('model/context are set to the model to which the listener was added', 3, function () {
    var
      numOflogsForProxied = 0,
      numOflogsForProxy = 0,
      console = {
        log: function (msg) {
          if (msg.indexOf('proxied') === 0) {
            ++numOflogsForProxied;
          }
          if (msg.indexOf('proxy') === 0) {
            ++numOflogsForProxy;
          }
        }
      };

    ////
    var onModelChanged = function (model) {
        model.dump(); // Or alternatively, this.dump();
      };

    proxied.dump = function () {
      console.log('proxied changed: ' + JSON.stringify(this.changedAttributes()));
    };
    proxy.dump = function () {
      console.log('proxy changed: ' + JSON.stringify(this.changedAttributes()));
    };

    proxied.on('change', onModelChanged);
    proxy.on('change', onModelChanged);

    proxied.set({ name: 'Betty' }); // Will log 'proxied changed: ..' & 'proxy changed: ..'

    strictEqual(numOflogsForProxied, 1, 'logged once for proxied after first set');
    strictEqual(numOflogsForProxy, 1, 'logged once for proxy after first set');

    proxy.off(null, onModelChanged);
    proxy.set({ name: 'Charles' }); // Will log 'proxied changed: ..'

    strictEqual(numOflogsForProxied, 2, 'logged twice for proxied after second set');

  });

  test('Backbone overridables need to be set on proxied', 2, function () {
    var
      nextExpectedLog,
      console = {
        log: function (msg) {
          nextExpectedLog || (nextExpectedLog = 'validation error: none');
          strictEqual(msg, nextExpectedLog, 'logged "' + msg + '"');
          nextExpectedLog = 'validation error: Charles is not a valid name';
        }
      };

    ////

    proxy.validate = function (attrs) {
      if (attrs.name === 'Betty') {
        return 'Betty is not a valid name';
      }
    };

    proxy.set({ name: 'Betty' }, { validate: true });

    // Will log 'validation error: none'
    console.log('validation error: ' + (proxy.validationError || 'none'));

    proxied.validate = function (attrs) {
      if (attrs.name === 'Charles') {
        return 'Charles is not a valid name';
      }
    };

    proxy.set({ name: 'Charles' }, { validate: true });

    // Will log 'validation error: Charles is not a valid name'
    console.log('validation error: ' + (proxy.validationError || 'none'));
  });

}());
