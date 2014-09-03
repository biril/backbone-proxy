Backbone Proxy
==============

[![Build Status](https://travis-ci.org/biril/backbone-proxy.png)](https://travis-ci.org/biril/backbone-proxy)
[![NPM version](https://badge.fury.io/js/backbone-proxy.png)](http://badge.fury.io/js/backbone-proxy)
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
* install with npm, `npm install backbone-proxy` or
* just include [`backbone-proxy.js`](https://raw.github.com/biril/backbone-proxy/master/backbone-proxy.js)
    in your project.

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
    var BackboneProxy = require("backbone-proxy");
    ```

* Or list as a dependency when working _with an AMD loader_ (e.g. RequireJS):

    ```javascript
    // Your module
    define(["backbone-proxy"], function (BackboneProxy) {
      // ...
    });
    ```

    Note that the AMD definition of BackboneProxy depends on `backbone` and `underscore` so some
    loader setup will be required. For non-AMD compliant versions of Backbone (< 1.1.1) or
    Undescore (< 1.6.0), [James Burke's amdjs forks](https://github.com/amdjs) may be used instead,
    along with the necessary paths configuration

    ```javascript
    require.config({
        baseUrl: "myapp/",
        paths: {
            "underscore": "mylibs/underscore",
            "backbone": "mylibs/backbone"
        }
    });
    ```

    or you may prefer to just [shim them](http://requirejs.org/docs/api.html#config-shim).


At the time of this writing, BackboneProxy has only been tested against Backbone 1.2.1


Usage
-----



License
-------

Licensed and freely distributed under the MIT License (LICENSE.txt).

Copyright (c) 2014 Alex Lambiris
