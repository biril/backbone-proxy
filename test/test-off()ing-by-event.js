/*global BackboneProxy, _, QUnit, test, ok, Backbone */
(function () {
  'use strict';

  var

    proxied, proxy, proxy2, proxyProxy, models, source, target,

    setup = function (sourceKey, targetKey) {
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

      source = models[sourceKey];
      target = models[targetKey];
    },

    s = function (sourceKey, targetKey, expect) {
      return function () {
        setup(sourceKey, targetKey);
        expect();
      };
    };

  QUnit.module('.off()ing by event', {
    setup: function () {},
  });

  _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (sk) {

    _(['proxied', 'proxy', 'proxy2', 'proxyProxy']).each(function (tk) {

      // [*] Registering listener on some model - removing from another (different) model
      if (sk !== tk) {

        test(tk + '.off(\'change:attr\') should not remove change:attr-event-listener registered on ' + sk, 1, s(sk, tk, function () {
          source.on('change:name', function () {
            ok(true);
          });
          target.off('change:name');

          target.set({ name: 'Betty' }); // or source.set - makes no difference
        }));

        test(tk + '.off(\'change\') should not remove change-event-listener registered on ' + sk, 1, s(sk, tk, function () {
          source.on('change', function () {
            ok(true);
          });
          target.off('change');

          target.set({ name: 'Betty' });
        }));

        // [**] Specifically for the removal of 'all' or the removal of '', we need to take into
        //  account the special case where source-target have a proxy-proxied relationship. This is
        //  the case when `target === proxied` or when `source === proxyProxy && target === proxy`.
        //  In this case, off()ing the 'all' event, or just off()ing everything ('') on target will
        //  disable events on the source.
        if (tk === 'proxied' || (tk === 'proxy' && sk === 'proxyProxy')) {

          test(tk + '.off(\'all\') should \'disable\' all-event-listener registered on ' + sk, 0, s(sk, tk, function () {
            source.on('all', function () {
              ok(false, 'all-listener on ' + sk + ' should not be invoked');
            });
            target.off('all');

            target.set({ name: 'Betty' });
          }));

          test(tk + '.off(\'\') should \'disable\' any event-listener registered on ' + sk, 0, s(sk, tk, function () {
            var callback = function () {
                ok(false, 'no listener on ' + sk + ' should be invoked');
              };
            source.on('change:name', callback);
            source.on('change', callback);
            source.on('all', callback);
            target.off('all');

            target.set({ name: 'Betty' });
          }));

        } else {

          test(tk + '.off(\'all\') should not disable all-event-listener registered on ' + sk, 2, s(sk, tk, function () {
            source.on('all', function () {
              ok(true); // We expect 2 assertions to run - one for 'change', one for 'change:name'
            });
            target.off('all');

            target.set({ name: 'Betty' });
          }));

          test(tk + '.off(\'\') should not disable any event-listener registered on ' + sk, 4, s(sk, tk, function () {
            var callback = function () {
                ok(true, 'listener on ' + sk + ' should be invoked');
              };
            source.on('change:name', callback);
            source.on('change', callback);
            source.on('all', callback);
            target.off('');

            target.set({ name: 'Betty' });
          }));

        }

      }

    }); // iterate over targets

    // [*] Registering listener on some model - removing the listener from _the same_ model
    test(sk + '.off(\'change:attr\') should remove change:attr-event-listener registered on ' + sk, 0, s(sk, sk, function () {
      source.on('change:name', function () {
        ok(false, 'change:name listener on ' + sk + ' should not be invoked');
      });
      source.off('change:name');

      source.set({ name: 'Betty' });
    }));

    test(sk + '.off(\'change\') should remove change-event-listener registered on ' + sk, 0, s(sk, sk, function () {
      source.on('change', function () {
        ok(false, 'change listener on ' + sk + ' should not be invoked');
      });
      source.off('change');

      source.set({ name: 'Betty' });
    }));

    test(sk + '.off(\'all\') should remove all-event-listener registered on ' + sk, 0, s(sk, sk, function () {
      source.on('all', function () {
        ok(false, 'all listener on ' + sk + ' should not be invoked');
      });
      source.off('all');

      source.set({ name: 'Betty' });
    }));

    test(sk + '.off(\'\') should disable any event-listener registered on ' + sk, 0, s(sk, sk, function () {
      var callback = function () {
          ok(false, 'no listener on ' + sk + ' should be invoked');
        };
      source.on('change:name', callback);
      source.on('change', callback);
      source.on('all', callback);
      source.off('');

      source.set({ name: 'Betty' });
    }));

  }); // iterate over sources

}());
