/*global BackboneProxy, _, QUnit, test, ok, strictEqual, deepEqual, expect, Backbone */
(function () {
  'use strict';

  // var proxied, proxy;

  QUnit.module('use case', {
    setup: function () {
      // proxied = new Backbone.Model({ name: 'Anna' });
      // proxy = backboneProxy.proxy(proxied);
    },
  });

  test('overriding the .set() method for logging', 5, function () {
    var logger, proxied, Proxy, proxy;
    logger = { log: function () {} };
    proxied = new Backbone.Model({
      name: 'Anna',
    });
    Proxy = BackboneProxy.extend(proxied);
    proxy = new Proxy();
    proxied.on('change:name', function () {
      ok(true, 'change:name listener invoked on proxied');
    });
    proxy.on('change:name', function () {
      ok(true, 'change:name listener invoked on proxy');
    });
    proxy.set = function (attrs) {
      var attrNames = _.keys(attrs);
      logger.log('setting attributes: ' + attrNames.join(', '));
      Proxy.prototype.set.call(proxy, attrs);
    };

    logger.log = function () {
      ok(false, 'should not be invoked');
    };
    proxied.set({ name: 'Betty' });

    logger.log = function (msg) {
      strictEqual(msg, 'setting attributes: name', 'logger invoked for name attr');
    };
    proxy.set({ name: 'Charles' });
  });

}());