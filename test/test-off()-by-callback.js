/*global Backbone, BackboneProxy, _, QUnit, test, ok */
(function () {
  'use strict';

  QUnit.module('.off() by callback', {
    setup: function () {},
  });

  var

    proxied, proxy, proxy2, proxyProxy, models, targetModel, otherModel,

    setup = function (tM, oM) {
      var Proxy, ProxyProxy;

      proxied    = new Backbone.Model({ name: 'Anna' });
      Proxy      = BackboneProxy.extend(proxied);

      proxy      = new Proxy();
      proxy2     = new Proxy();
      ProxyProxy = BackboneProxy.extend(proxy);

      proxyProxy = new ProxyProxy();

      models = {
        proxied: proxied,
        proxy: proxy,
        proxy2: proxy2,
        proxyProxy: proxyProxy
      };

      tM && (targetModel = models[tM]);
      oM && (otherModel  = models[oM]);
    },

    s = function (tM, oM, expect) {
      return function () {
        setup(tM, oM);
        expect();
      };
    };

  _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (tM) {

    _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (oM) {

      // Registering listener on some model - removing from another (different) model
      if (tM !== oM) {

        test(tM + '.off(null, callback) should not remove change:attr-event-listener registered on ' + oM, 1, s(tM, oM, function () {
          var callback = function () {
              ok(true);
            };
          otherModel.on('change:name', callback);
          targetModel.off(null, callback);

          targetModel.set({ name: 'Betty' }); // or otherModel.set - should make no difference
        }));

      }

    }); // for every other-model in ['proxied', 'proxy', 'proxy2', 'proxyProxy']

    test(tM + '.off(null, callback) should remove change:attr-event-listener registered on ' + tM, 0, s(tM, null, function () {
      var callback = function () {
          ok(false, 'change:name listener on ' + tM + ' should not be invoked');
        };
      targetModel.on('change:name', callback);
      targetModel.off(null, callback);

      targetModel.set({ name: 'Betty' });
    }));

  }); // for every target-model in ['proxied', 'proxy', 'proxy2', 'proxyProxy']

}());
