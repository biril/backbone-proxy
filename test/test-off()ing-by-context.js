/*global Backbone, BackboneProxy, _, QUnit, test, ok */
(function () {
  'use strict';

  QUnit.module('.off()ing by context', {
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

        test(tM + '.off(null, null, context) should not remove change:attr-event-listener registered on ' + oM, 1, s(tM, oM, function () {
          var context = {};
          otherModel.on('change:name', function () {
            ok(true);
          }, context);
          targetModel.off(null, null, context);

          targetModel.set({ name: 'Betty' }); // or otherModel.set - should make no difference
        }));

        test(tM + '.off(null, null, context) should not remove change:attr-event-listener registered on ' + oM + ', for context = ' + oM, 1, s(tM, oM, function () {
          otherModel.on('change:name', function () {
            ok(true);
          }, otherModel);
          targetModel.off(null, null, otherModel);

          targetModel.set({ name: 'Betty' }); // or otherModel.set - should make no difference
        }));

        test(tM + '.off(null, null, context) should not remove change:attr-event-listener registered on ' + oM + ', for context = ' + tM, 1, s(tM, oM, function () {
          otherModel.on('change:name', function () {
            ok(true);
          }, targetModel);
          targetModel.off(null, null, targetModel);

          targetModel.set({ name: 'Betty' }); // or otherModel.set - should make no difference
        }));

      } // if target-model != other-model

    }); // for every other-model in ['proxied', 'proxy', 'proxy2', 'proxyProxy']

    test(tM + '.off(null, null, context) should remove change:attr-event-listener registered on ' + tM, 0, s(tM, null, function () {
      var context = {};
      targetModel.on('change:name', function () {
        ok(false, 'change:name listener on ' + tM + ' should not be invoked');
      }, context);
      targetModel.off(null, null, context);

      targetModel.set({ name: 'Betty' });
    }));

  }); // for every target-model in ['proxied', 'proxy', 'proxy2', 'proxyProxy']

}());
