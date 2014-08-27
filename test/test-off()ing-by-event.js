/*global Backbone, BackboneProxy, _, QUnit, test, ok */
(function () {
  'use strict';

  QUnit.module('.off()ing by event', {
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

      // [*] Registering listener on some model - removing from another (different) model
      if (tM !== oM) {

        test(tM + '.off(\'change:attr\') should not remove change:attr-event-listener registered on ' + oM, 1, s(tM, oM, function () {
          otherModel.on('change:name', function () {
            ok(true);
          });
          targetModel.off('change:name');

          targetModel.set({ name: 'Betty' }); // or otherModel.set - should make no difference
        }));

        test(tM + '.off(\'change\') should not remove change-event-listener registered on ' + oM, 1, s(tM, oM, function () {
          otherModel.on('change', function () {
            ok(true);
          });
          targetModel.off('change');

          targetModel.set({ name: 'Betty' });
        }));

        // [**] Specifically for the removal of 'all' or the removal of '', we need to take into
        //  account the special case where other-target have a proxy-proxied relationship. This is
        //  the case when `target === proxied` or when `source === proxyProxy && target === proxy`.
        //  In this case, off()ing the 'all' event, or just off()ing everything ('') on the target
        //  model will disable events on the other model
        if (tM === 'proxied' || (tM === 'proxy' && oM === 'proxyProxy')) {

          test(tM + '.off(\'all\') should \'disable\' any event-listener registered on ' + oM, 0, s(tM, oM, function () {
            var callback = function () {
                ok(false, 'no listener on ' + oM + ' should be invoked');
              };
            otherModel.on('change:name', callback);
            otherModel.on('change', callback);
            otherModel.on('all', callback);
            targetModel.off('all');

            targetModel.set({ name: 'Betty' });
          }));

          test(tM + '.off(\'\') should \'disable\' any event-listener registered on ' + oM, 0, s(tM, oM, function () {
            var callback = function () {
                ok(false, 'no listener on ' + oM + ' should be invoked');
              };
            otherModel.on('change:name', callback);
            otherModel.on('change', callback);
            otherModel.on('all', callback);
            targetModel.off('');

            targetModel.set({ name: 'Betty' });
          }));

        } else {

          test(tM + '.off(\'all\') should not disable all-event-listener registered on ' + oM, 2, s(tM, oM, function () {
            otherModel.on('all', function () {
              ok(true); // We expect 2 assertions to run - one for 'change', one for 'change:name'
            });
            targetModel.off('all');

            targetModel.set({ name: 'Betty' });
          }));

          test(tM + '.off(\'\') should not disable any event-listener registered on ' + oM, 4, s(tM, oM, function () {
            var callback = function () {
                ok(true, 'listener on ' + oM + ' should be invoked');
              };
            otherModel.on('change:name', callback);
            otherModel.on('change', callback);
            otherModel.on('all', callback);
            targetModel.off('');

            targetModel.set({ name: 'Betty' });
          }));

        } // if target-vs-other have a proxy-vs-proxied relation

      }  // if target-model != other-model

    }); // for every other-model in ['proxied', 'proxy', 'proxy2', 'proxyProxy']

    // [*] Registering listener on some model - removing the listener from _the same_ model
    test(tM + '.off(\'change:attr\') should remove change:attr-event-listener registered on ' + tM, 0, s(tM, null, function () {
      targetModel.on('change:name', function () {
        ok(false, 'change:name listener on ' + tM + ' should not be invoked');
      });
      targetModel.off('change:name');

      targetModel.set({ name: 'Betty' });
    }));

    test(tM + '.off(\'change\') should remove change-event-listener registered on ' + tM, 0, s(tM, null, function () {
      targetModel.on('change', function () {
        ok(false, 'change listener on ' + tM + ' should not be invoked');
      });
      targetModel.off('change');

      targetModel.set({ name: 'Betty' });
    }));

    test(tM + '.off(\'all\') should remove all-event-listener registered on ' + tM, 0, s(tM, null, function () {
      targetModel.on('all', function () {
        ok(false, 'all listener on ' + tM + ' should not be invoked');
      });
      targetModel.off('all');

      targetModel.set({ name: 'Betty' });
    }));

    test(tM + '.off(\'\') should disable any event-listener registered on ' + tM, 0, s(tM, null, function () {
      var callback = function () {
          ok(false, 'no listener on ' + tM + ' should be invoked');
        };
      targetModel.on('change:name', callback);
      targetModel.on('change', callback);
      targetModel.on('all', callback);
      targetModel.off('');

      targetModel.set({ name: 'Betty' });
    }));

  }); // iterate over sources

}());
