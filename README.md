Backbone Proxy
==============

[![Build Status](https://travis-ci.org/biril/backbone-proxy.png)](https://travis-ci.org/biril/backbone-proxy)
[![NPM version](https://badge.fury.io/js/backbone-proxy_.png)](http://badge.fury.io/js/backbone-proxy_)
[![Bower version](https://badge.fury.io/bo/backbone-proxy.png)](http://badge.fury.io/bo/backbone-proxy)

Model proxies for Backbone. Notably useful in applications where sharing a single model instance
among many components (e.g. views) with different concerns is a common pattern. In such cases, the
need for multiple components to reference the same model-encapsulated state prohibits the
specialization of model-behaviour. Additionaly it leads to a design where 'all code is created
equal', i.e. all components have the exact same priviledge-level in respect to data-access.
BackboneProxy faciliates the creation of model-proxies that may be specialized in terms of
behaviour while referencing the same, shared state.

For example, you can create:


#### Proxies that log attribute changes

```javascript
// Create a UserProxy class. Instances will proxy the given user model
// Note that user is a model _instance_ - not a class
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
```


#### Readonly proxies

```javascript
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

// Will throw
userReadonly.set('name', 'Mairy');

// Will alert 'user name was set to Mairy'
user.set('name', 'Mairy');
```


#### Vew-specific proxies

```javascript
// Create a UserProxy class
var UserProxy = BackboneProxy.extend(user);

// Instantiate a proxy to pass to view1
var userProxy1 = new UserProxy();
userProxy1.set = function (key, val, opts) {

  // Handle both key/value and {key: value} - style arguments
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

```


Set up
------

* install with bower, `bower install backbone-proxy`,
* install with npm, `npm install backbone-proxy_` or
* just include the
    [latest stable `backbone-proxy.js`](https://github.com/biril/backbone-proxy/releases).

Backbone proxy may be used as an exported global, a CommonJS module or an AMD module depending on
the current environment:

* In projects targetting _browsers, without an AMD module loader_, include backbone-proxy.js
    after backbone.js:

    ```html
    ...
    <script type="text/javascript" src="backbone.js"></script>
    <script type="text/javascript" src="backbone-proxy.js"></script>
    ...
    ```

    This will export the `BackboneProxy` global.

* `require` when working _with CommonJS_ (e.g. Node). Assuming BackboneProxy is `npm install`ed:

    ```javascript
    var BackboneProxy = require('backbone-proxy');
    ```

* Or list as a dependency when working _with an AMD loader_ (e.g. RequireJS):

    ```javascript
    // Your module
    define(['backbone-proxy'], function (BackboneProxy) {
      // ...
    });
    ```

    Note that the AMD definition of BackboneProxy depends on `backbone` and `underscore` so some
    loader setup will be required. For non-AMD compliant versions of Backbone (< 1.1.1) or
    Undescore (< 1.6.0), [James Burke's amdjs forks](https://github.com/amdjs) may be used instead,
    along with the necessary paths configuration

    ```javascript
    require.config({
      baseUrl: 'myapp/',
      paths: {
        'underscore': 'mylibs/underscore',
        'backbone': 'mylibs/backbone'
      }
    });
    ```

    or you may prefer to just [shim them](http://requirejs.org/docs/api.html#config-shim).


At the time of this writing, BackboneProxy has only been tested against Backbone 1.2.1


Usage
-----

BackboneProxy exposes a single `extend` method as the means of creating a Proxy 'class' for any
given `model` (or model proxy):

```javascript
// Create Proxy class for given model
var Proxy = BackboneProxy.extend(model);

// Instantiate any number of proxies
var someProxy = new Proxy();
var someOtherProxy = new Proxy();

// Yes, you can proxy a proxy
var ProxyProxy = BackboneProxy.extend(someProxy);
var someProxyProxy = new ProxyProxy();
```

For any given `proxied`/`proxy` models that have a proxied-to-proxy relationship, the following
apply:

Any attribute `set` on `proxied` will be set on `proxy` and vice versa (the same applies for
`unset` and `clear`):

```javascript
proxied.set({ name: 'Betty' });
console.log(proxy.get('name')); // Will log 'Betty'

proxy.set({ name: 'Charles' });
console.log(proxied.get('name')); // Will log 'Charles'
```

Built-in model events (add, remove, reset, change, destroy, request, sync, error, invalid)
triggered in response to actions performed on `proxied` will also be triggered on `proxy`. And vice
versa:

```javascript
proxy.on('change:name', function (model) {
  console.log('name set to ' + model.get('name'))
});
proxied.set({ name: 'Betty' }); // Will log 'name set to Betty'

proxied.on('sync', function () {
  console.log('model synced');
});
proxy.fetch(); // Will log 'model synced'

```

User-defined events triggered on `proxied` will also be triggered on `proxy`. The opposite is _not_
true:

```javascript
proxied.on('boo', function () {
  console.log('a scare on proxied');
});
proxy.on('boo', function () {
  console.log('a scare on proxy');
});

proxied.trigger('boo'); // Will log 'a scare on proxied' & 'a scare on proxy'
proxy.trigger('boo'); // Will only log 'a scare on proxy'

```

Additions and removals of event listeners are, generally speaking, 'scoped' to each model. That is
to say, event listeners may be safely added on, and - primarily - removed from the proxied (/proxy)
without affecting event listeners on the proxy (/proxied). This holds when removing listeners by
callback or context. For example, when removing listeners by callback:

```javascript
var onModelChange = function (model) {
  console.log('model changed');
};

proxied.on('change', onModelChange);
proxy.on('change', onModelChange);

proxied.set({ name: 'Betty' }); // Will log 'model changed' twice

// Will only remove the listener previously added on proxied
proxied.off(null, onModelChange);

proxied.set({ name: 'Charles' }); // Will log 'model changed' once
```

Removing listeners by event name works similarly:

```javascript
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
```

**However**, removing listeners registered for the 'all' event presents a special case as it will
interfere with BackboneProxy's internal event-forwarding. Essentially, you should avoid
`.off('all')` for models which are proxied - it will disable event notifications on the proxy:

```javascript
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

// Bad move
proxied.off('all');

// Will log nothing
proxied.set({
  name: 'Charles',
  age: 31
});
```

The `model` argument passed to a listener will always be set to the model to which the listener was
added. The same is true for the context (as long as it's not explicitly set):

```javascript
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

proxy.off(null, onModelChanged);
proxy.set({ name: 'Charles' }); // Will log 'proxied changed: ..'
```

Backbone's 'overridables', i.e. properties and methods that affect model behaviour when set
(namely `collection`, `idAttribute`, `sync`, `parse`, `validate`, `url`, `urlRoot` and `toJSON`)
should be set on the proxied model. That is to say, the _root_ proxied `Backbone.Model`. Setting
them on a proxied model is not meant to (and will generally _not_) produce the intended result. As
an example:

```javascript
// Setting a validate method on a proxy ..
proxy.validate = function (attrs) {
  if (attrs.name === 'Betty') {
    return 'Betty is not a valid name';
  }
};

// .. will not work: This will log 'validation error: none'
proxy.set({ name: 'Betty' }, { validate: true });
console.log('validation error: ' + (proxy.validationError || 'none'));

// Setting a validate method on the proxied ..
proxied.validate = function (attrs) {
  if (attrs.name === 'Charles') {
    return 'Charles is not a valid name';
  }
};

// .. will produce the intended result:
//  This will log 'validation error: Charles is not a valid name'
proxy.set({ name: 'Charles' }, { validate: true });
console.log('validation error: ' + (proxy.validationError || 'none'));

```

Aside from the prior examples, the
[annotated version of the source](http://biril.github.io/backbone-proxy/) is available as a
reference.


Contributing ( / Testing )
--------------------------

Contributions are obviously appreciated. In lieu of a formal styleguide, take care to maintain the
existing coding style. Please make sure your changes test out green prior to pull requests. The
QUnit test suite may be run in a browser (test/index.html) or on the command line, by running
`make test` or `npm test`. The command line version runs on Node and depends on
[node-qunit](https://github.com/kof/node-qunit) (`npm install` to fetch it before testing). A
[coverage report](http://biril.github.io/backbone-proxy/lcov-report/backbone-proxy/backbone-proxy.js.html)
is also available.


License
-------

Licensed and freely distributed under the MIT License (LICENSE.txt).

Copyright (c) 2014 Alex Lambiris
