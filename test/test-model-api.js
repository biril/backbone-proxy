/*global BackboneProxy, _, QUnit, test, ok, strictEqual, deepEqual, expect, Backbone */
(function () {
    'use strict';

    var proxied, proxy;

    QUnit.module('model API', {
        setup: function () {
            var Proxy;

            proxied = new Backbone.Model({ name: 'Anna' });
            Proxy = BackboneProxy.extend(proxied);
            proxy = new Proxy();
        }
    });

    ////////

    test('.set()ing attribute on proxied should apply change on both models', function () {
        proxied.set({ name: 'Betty' });

        strictEqual(proxied.get('name'), 'Betty', 'attribute is set on proxied');
        strictEqual(proxy.get('name'), 'Betty', 'attribute is set on proxy');
    });

    test('.set()ing attribute on proxy should apply change on both models', function () {
        proxy.set({ name: 'Betty' });

        strictEqual(proxied.get('name'), 'Betty', 'attribute is set on proxied');
        strictEqual(proxy.get('name'), 'Betty', 'attribute is set on proxy');
    });

    test('.set()ing attribute on proxied should cause both models to trigger appropriate change-event', function () {
        expect(14);

        proxied.on('change:name', function (model) {
            ok(true, 'change-event is triggered on proxied');

            strictEqual(model, proxied, 'model parameter of change-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of change-event triggered on proxied is proxied (no context was explicitly set)');

            strictEqual(proxied.hasChanged(), true, 'proxied hasChanged() during the course of change-event triggered on proxied');
            strictEqual(proxy.hasChanged(), true, 'proxy hasChanged() during the course of change-event triggered on proxied');

            strictEqual(proxied.hasChanged('name'), true, 'proxied hasChanged(\'name\') during the course of change-event triggered on proxied');
            strictEqual(proxy.hasChanged('name'), true, 'proxy hasChanged(\'name\') during the course of change-event triggered on proxied');
        });
        proxy.on('change:name', function (model) {
            ok(true, 'change-event is triggered on proxy');

            strictEqual(model, proxy, 'model parameter of change-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of change-event triggered on proxy is proxy (no context was explicitly set)');

            strictEqual(proxied.hasChanged(), true, 'proxied hasChanged() during the course of change-event triggered on proxy');
            strictEqual(proxy.hasChanged(), true, 'proxy hasChanged() during the course of change-event triggered on proxy');

            strictEqual(proxied.hasChanged('name'), true, 'proxied hasChanged(\'name\') during the course of change-event triggered on proxy');
            strictEqual(proxy.hasChanged('name'), true, 'proxy hasChanged(\'name\') during the course of change-event triggered on proxy');
        });

        proxied.set({ name: 'Betty' });
    });

    test('.set()ing attribute on proxy should cause both models to trigger appropriate change-event', function () {
        expect(14);

        proxy.on('change:name', function (model) {
            ok(true, 'change-event is triggered on proxy');

            strictEqual(model, proxy, 'model parameter of change-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of change-event triggered on proxy is proxy (if no context is explicitly set)');

            strictEqual(proxied.hasChanged(), true, 'proxied hasChanged() during the course of change-event triggered on proxy');
            strictEqual(proxy.hasChanged(), true, 'proxy hasChanged() during the course of change-event triggered on proxy');

            strictEqual(proxied.hasChanged('name'), true, 'proxied hasChanged(\'name\') during the course of change-event triggered on proxy');
            strictEqual(proxy.hasChanged('name'), true, 'proxy hasChanged(\'name\') during the course of change-event triggered on proxy');
        });
        proxied.on('change:name', function (model) {
            ok(true, 'change-event is triggered on proxied');

            strictEqual(model, proxied, 'model parameter of change-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of change-event triggered on proxied is proxied (if no context is explicitly set)');

            strictEqual(proxied.hasChanged(), true, 'proxied hasChanged() during the course of change-event triggered on proxied');
            strictEqual(proxy.hasChanged(), true, 'proxy hasChanged() during the course of change-event triggered on proxied');

            strictEqual(proxied.hasChanged('name'), true, 'proxied hasChanged(\'name\') during the course of change-event triggered on proxied');
            strictEqual(proxy.hasChanged('name'), true, 'proxy hasChanged(\'name\') during the course of change-event triggered on proxied');
        });

        proxy.set({ name: 'Betty' });
    });

    test('.bind()ing event-listeners for change-events on proxied / proxy should respect explicitly set contexts', function () {
        expect(8);

        var aContext = {},
            anAlternativeContext = {};

        proxied.on('change:name', function () {
            strictEqual(this, aContext, 'change-event triggered on proxied with correct context');
        }, aContext);
        proxied.on('change:name', function () {
            strictEqual(this, anAlternativeContext, 'change-event triggered on proxied with correct alternative context');
        }, anAlternativeContext);

        proxy.on('change:name', function () {
            strictEqual(this, aContext, 'change-event triggered on proxy with correct context');
        }, aContext);
        proxy.on('change:name', function () {
            strictEqual(this, anAlternativeContext, 'change-event triggered on proxy with correct alternative context');
        }, anAlternativeContext);

        proxied.set({ name: 'Betty' });
        proxy.set({ name: 'Chloe' });
    });

    ////////

    test('.has() behaviour should be identical on both models', function () {
        strictEqual(proxied.has('surname'), false, 'proxied has() no surname attribute');
        strictEqual(proxy.has('surname'), false, 'proxy has() no surname attribute');

        proxied.set({ a: 1 });
        strictEqual(proxy.has('a'), true, 'proxy has() attribute which was set on proxied');

        proxy.set({ b: 2 });
        strictEqual(proxied.has('a'), true, 'proxied has() attribute which was set on proxy');
    });

    ////////

    test('.unset()ing attribute on proxied should apply change on both models', function () {
        proxied.unset('name');

        strictEqual(proxied.get('name'), undefined, 'attribute is unset on proxied');
        strictEqual(proxy.get('name'), undefined, 'attribute is unset on proxy');
    });

    test('.unset()ing attribute on proxy should apply change on both models', function () {
        proxy.unset('name');

        strictEqual(proxied.get('name'), undefined, 'attribute is unset on proxied');
        strictEqual(proxy.get('name'), undefined, 'attribute is unset on proxy');
    });

    test('.unset()ing attribute on proxied should cause both models to trigger appropriate change-event', function () {
        expect(14);

        proxied.on('change:name', function (model) {
            ok(true, 'change-event is triggered on proxied');

            strictEqual(model, proxied, 'model parameter of change-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of change-event triggered on proxied is proxied (no context was explicitly set)');

            strictEqual(proxied.hasChanged(), true, 'proxied hasChanged() during the course of change-event triggered on proxied');
            strictEqual(proxy.hasChanged(), true, 'proxy hasChanged() during the course of change-event triggered on proxied');

            strictEqual(proxied.hasChanged('name'), true, 'proxied hasChanged(\'name\') during the course of change-event triggered on proxied');
            strictEqual(proxy.hasChanged('name'), true, 'proxy hasChanged(\'name\') during the course of change-event triggered on proxied');
        });
        proxy.on('change:name', function (model) {
            ok(true, 'change-event is triggered on proxy');

            strictEqual(model, proxy, 'model parameter of change-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of change-event triggered on proxy is proxy (no context was explicitly set)');

            strictEqual(proxied.hasChanged(), true, 'proxied hasChanged() during the course of change-event triggered on proxy');
            strictEqual(proxy.hasChanged(), true, 'proxy hasChanged() during the course of change-event triggered on proxy');

            strictEqual(proxied.hasChanged('name'), true, 'proxied hasChanged(\'name\') during the course of change-event triggered on proxy');
            strictEqual(proxy.hasChanged('name'), true, 'proxy hasChanged(\'name\') during the course of change-event triggered on proxy');
        });

        proxied.unset('name');
    });

    test('.unset()ing attribute on proxy should cause both models to trigger appropriate change-event', function () {
        expect(14);

        proxied.on('change:name', function (model) {
            ok(true, 'change-event is triggered on proxied');

            strictEqual(model, proxied, 'model parameter of change-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of change-event triggered on proxied is proxied (no context was explicitly set)');

            strictEqual(proxied.hasChanged(), true, 'proxied hasChanged() during the course of change-event triggered on proxied');
            strictEqual(proxy.hasChanged(), true, 'proxy hasChanged() during the course of change-event triggered on proxied');

            strictEqual(proxied.hasChanged('name'), true, 'proxied hasChanged(\'name\') during the course of change-event triggered on proxied');
            strictEqual(proxy.hasChanged('name'), true, 'proxy hasChanged(\'name\') during the course of change-event triggered on proxied');
        });
        proxy.on('change:name', function (model) {
            ok(true, 'change-event is triggered on proxy');

            strictEqual(model, proxy, 'model parameter of change-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of change-event triggered on proxy is proxy (no context was explicitly set)');

            strictEqual(proxied.hasChanged(), true, 'proxied hasChanged() during the course of change-event triggered on proxy');
            strictEqual(proxy.hasChanged(), true, 'proxy hasChanged() during the course of change-event triggered on proxy');

            strictEqual(proxied.hasChanged('name'), true, 'proxied hasChanged(\'name\') during the course of change-event triggered on proxy');
            strictEqual(proxy.hasChanged('name'), true, 'proxy hasChanged(\'name\') during the course of change-event triggered on proxy');
        });

        proxy.unset('name');
    });

    ////////

    test('.clear()ing proxied should apply change on both models', function () {
        proxied.clear();

        strictEqual(proxied.get('name'), undefined, 'attribute is unset on proxied');
        strictEqual(proxy.get('name'), undefined, 'attribute is unset on proxy');
    });

    test('.clear()ing proxy should apply change on both models', function () {
        proxy.unset('name');

        strictEqual(proxied.get('name'), undefined, 'attribute is unset on proxied');
        strictEqual(proxy.get('name'), undefined, 'attribute is unset on proxy');
    });

    test('.clear()ing proxied should cause both models to trigger appropriate change-event', function () {
        expect(14);

        proxied.on('change:name', function (model) {
            ok(true, 'change-event is triggered on proxied');

            strictEqual(model, proxied, 'model parameter of change-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of change-event triggered on proxied is proxied (no context was explicitly set)');

            strictEqual(proxied.hasChanged(), true, 'proxied hasChanged() during the course of change-event triggered on proxied');
            strictEqual(proxy.hasChanged(), true, 'proxy hasChanged() during the course of change-event triggered on proxied');

            strictEqual(proxied.hasChanged('name'), true, 'proxied hasChanged(\'name\') during the course of change-event triggered on proxied');
            strictEqual(proxy.hasChanged('name'), true, 'proxy hasChanged(\'name\') during the course of change-event triggered on proxied');
        });
        proxy.on('change:name', function (model) {
            ok(true, 'change-event is triggered on proxy');

            strictEqual(model, proxy, 'model parameter of change-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of change-event triggered on proxy is proxy (no context was explicitly set)');

            strictEqual(proxied.hasChanged(), true, 'proxied hasChanged() during the course of change-event triggered on proxy');
            strictEqual(proxy.hasChanged(), true, 'proxy hasChanged() during the course of change-event triggered on proxy');

            strictEqual(proxied.hasChanged('name'), true, 'proxied hasChanged(\'name\') during the course of change-event triggered on proxy');
            strictEqual(proxy.hasChanged('name'), true, 'proxy hasChanged(\'name\') during the course of change-event triggered on proxy');
        });

        proxied.clear();
    });

    test('.clear()ing proxy should cause both models to trigger appropriate change-event', function () {
        expect(14);

        proxied.on('change:name', function (model) {
            ok(true, 'change-event is triggered on proxied');

            strictEqual(model, proxied, 'model parameter of change-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of change-event triggered on proxied is proxied (no context was explicitly set)');

            strictEqual(proxied.hasChanged(), true, 'proxied hasChanged() during the course of change-event triggered on proxied');
            strictEqual(proxy.hasChanged(), true, 'proxy hasChanged() during the course of change-event triggered on proxied');

            strictEqual(proxied.hasChanged('name'), true, 'proxied hasChanged(\'name\') during the course of change-event triggered on proxied');
            strictEqual(proxy.hasChanged('name'), true, 'proxy hasChanged(\'name\') during the course of change-event triggered on proxied');
        });
        proxy.on('change:name', function (model) {
            ok(true, 'change-event is triggered on proxy');

            strictEqual(model, proxy, 'model parameter of change-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of change-event triggered on proxy is proxy (no context was explicitly set)');

            strictEqual(proxied.hasChanged(), true, 'proxied hasChanged() during the course of change-event triggered on proxy');
            strictEqual(proxy.hasChanged(), true, 'proxy hasChanged() during the course of change-event triggered on proxy');

            strictEqual(proxied.hasChanged('name'), true, 'proxied hasChanged(\'name\') during the course of change-event triggered on proxy');
            strictEqual(proxy.hasChanged('name'), true, 'proxy hasChanged(\'name\') during the course of change-event triggered on proxy');
        });

        proxy.unset('name');
    });

    ////////

    test('.fetch()ing proxied should update both models with received data', function () {
        expect(2);

        proxied.sync = function (method, model, options) {
            options.success({
                name: 'Betty'
            });
        };

        proxied.fetch({
            success: function () {
                strictEqual(proxied.get('name'), 'Betty', 'received attribute is set on proxied');
                strictEqual(proxy.get('name'), 'Betty', 'received attribute is set on proxy');
            }
        });
    });

    test('.fetch()ing proxy should update both models with received data', function () {
        expect(2);

        proxied.sync = function (method, model, options) {
            options.success({
                name: 'Betty'
            });
        };

        proxy.fetch({
            success: function () {
                strictEqual(proxied.get('name'), 'Betty', 'received attribute is set on proxied');
                strictEqual(proxy.get('name'), 'Betty', 'received attribute is set on proxy');
            }
        });
    });

    test('.fetch()ing proxied should invoke success functions & events with appropriate model parameter / context', function () {
        expect(9);

        proxied.sync = function (method, model, options) {
            model.trigger('request', model, undefined, options); // The 'request' event is a concern of the sync method
            options.success(model.toJSON());
        };

        proxied.on('request', function (model) {
            strictEqual(model, proxied, 'model parameter of request-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of request-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('request', function (model) {
            strictEqual(model, proxy, 'model parameter of request-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of request-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxied.on('sync', function (model) {
            strictEqual(model, proxied, 'model parameter of sync-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of sync-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('sync', function (model) {
            strictEqual(model, proxy, 'model parameter of sync-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of sync-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxied.fetch({
            success: function (model) {
                strictEqual(model, proxied, 'model parameter of success() is proxied');
            }
        });
    });

    test('.fetch()ing proxy should invoke success functions & events with appropriate model parameter / context', function () {
        expect(9);

        proxied.sync = function (method, model, options) {
            model.trigger('request', model, undefined, options); // The 'request' event is a concern of the sync method
            options.success(model.toJSON());
        };

        proxied.on('request', function (model) {
            strictEqual(model, proxied, 'model parameter of request-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of request-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('request', function (model) {
            strictEqual(model, proxy, 'model parameter of request-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of request-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxied.on('sync', function (model) {
            strictEqual(model, proxied, 'model parameter of sync-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of sync-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('sync', function (model) {
            strictEqual(model, proxy, 'model parameter of sync-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of sync-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxy.fetch({
            success: function (model) {
                strictEqual(model, proxy, 'model parameter of success() is proxy');
            }
        });
    });

    test('.fetch()ing proxied should invoke error functions & events with appropriate model parameter / context', function () {
        expect(5);

        proxied.sync = function (method, model, options) {
            options.error();
        };

        proxied.on('error', function (model) {
            strictEqual(model, proxied, 'model parameter of error-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of error-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('error', function (model) {
            strictEqual(model, proxy, 'model parameter of error-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of error-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxied.fetch({
            error: function (model) {
                strictEqual(model, proxied, 'model parameter of error() is proxied');
            }
        });
    });

    test('.fetch()ing proxy should invoke error functions & events with appropriate model parameter / context', function () {
        expect(5);

        proxied.sync = function (method, model, options) {
            options.error();
        };

        proxied.on('error', function (model) {
            strictEqual(model, proxied, 'model parameter of error-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of error-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('error', function (model) {
            strictEqual(model, proxy, 'model parameter of error-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of error-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxy.fetch({
            error: function (model) {
                strictEqual(model, proxy, 'model parameter of error() is proxy');
            }
        });
    });

    ////////

    test('.save()ing proxied should update both models with received data', function () {
        expect(2);

        proxied.sync = function (method, model, options) {
            options.success(_(model.toJSON()).extend({ id: 1 }));
        };

        proxied.save({
            name: 'Betty'
        }, {
            success: function () {
                deepEqual(proxied.attributes, { name: 'Betty', id: 1 }, 'received attributes are set on proxied');
                deepEqual(proxy.attributes, { name: 'Betty', id: 1 }, 'received attributes are set on proxied');
            }
        });
    });

    test('.save()ing proxy should update both models with received data', function () {
        expect(2);

        proxied.sync = function (method, model, options) {
            options.success(_(model.toJSON()).extend({ id: 1 }));
        };

        proxy.save({
            name: 'Betty'
        }, {
            success: function () {
                deepEqual(proxied.attributes, { name: 'Betty', id: 1 }, 'received attributes are set on proxied');
                deepEqual(proxy.attributes, { name: 'Betty', id: 1 }, 'received attributes are set on proxied');
            }
        });
    });

    test('.save()ing proxied should invoke success functions & events with appropriate model parameter / context', function () {
        expect(9);

        proxied.sync = function (method, model, options) {
            model.trigger('request', model, undefined, options); // The 'request' event is a concern of the sync method
            options.success(_(model.toJSON()).extend({ id: 1 }));
        };

        proxied.on('request', function (model) {
            strictEqual(model, proxied, 'model parameter of request-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of request-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('request', function (model) {
            strictEqual(model, proxy, 'model parameter of request-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of request-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxied.on('sync', function (model) {
            strictEqual(model, proxied, 'model parameter of sync-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of sync-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('sync', function (model) {
            strictEqual(model, proxy, 'model parameter of sync-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of sync-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxied.save({
            name: 'Betty'
        }, {
            success: function (model) {
                strictEqual(model, proxied, 'model parameter of success() is proxied');
            }
        });
    });

    test('.save()ing proxy should invoke success functions & events with appropriate model parameter / context', function () {
        expect(9);

        proxied.sync = function (method, model, options) {
            model.trigger('request', model, undefined, options); // The 'request' event is a concern of the sync method
            options.success(_(model.toJSON()).extend({ id: 1 }));
        };

        proxied.on('request', function (model) {
            strictEqual(model, proxied, 'model parameter of request-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of request-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('request', function (model) {
            strictEqual(model, proxy, 'model parameter of request-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of request-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxied.on('sync', function (model) {
            strictEqual(model, proxied, 'model parameter of sync-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of sync-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('sync', function (model) {
            strictEqual(model, proxy, 'model parameter of sync-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of sync-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxy.save({
            name: 'Betty'
        }, {
            success: function (model) {
                strictEqual(model, proxy, 'model parameter of success is() proxy');
            }
        });
    });

    test('.save()ing proxied should invoke error functions & events with appropriate model parameter / context', function () {
        expect(5);

        proxied.sync = function (method, model, options) {
            options.error();
        };

        proxied.on('error', function (model) {
            strictEqual(model, proxied, 'model parameter of error-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of error-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('error', function (model) {
            strictEqual(model, proxy, 'model parameter of error-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of error-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxied.save({
            name: 'Betty'
        }, {
            error: function (model) {
                strictEqual(model, proxied, 'model parameter of error() is proxied');
            }
        });
    });

    test('.fetch()ing proxy should invoke error functions & events with appropriate model parameter / context', function () {
        expect(5);

        proxied.sync = function (method, model, options) {
            options.error();
        };

        proxied.on('error', function (model) {
            strictEqual(model, proxied, 'model parameter of error-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of error-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('error', function (model) {
            strictEqual(model, proxy, 'model parameter of error-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of error-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxy.save({
            name: 'Betty'
        }, {
            error: function (model) {
                strictEqual(model, proxy, 'model parameter of error() is proxy');
            }
        });
    });

    ////////

    test('.destroy()ing proxied should invoke success functions & events with appropriate model parameter / context', function () {
        expect(9);

        proxied.sync = function (method, model, options) {
            model.trigger('request', model, undefined, options); // The 'request' event is a concern of the sync method
            options.success();
        };

        proxied.on('request', function (model) {
            strictEqual(model, proxied, 'model parameter of request-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of request-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('request', function (model) {
            strictEqual(model, proxy, 'model parameter of request-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of request-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxied.on('destroy', function (model) {
            strictEqual(model, proxied, 'model parameter of destroy-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of destroy-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('destroy', function (model) {
            strictEqual(model, proxy, 'model parameter of destroy-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of destroy-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxied.set({ id: 1 });
        proxied.destroy({
            success: function (model) {
                strictEqual(model, proxied, 'model parameter of success() is proxied');
            }
        });
    });

    test('.destroy()ing proxy should invoke success functions & events with appropriate model parameter / context', function () {
        expect(9);

        proxied.sync = function (method, model, options) {
            model.trigger('request', model, undefined, options); // The 'request' event is a concern of the sync method
            options.success(_(model.toJSON()).extend({ id: 1 }));
        };

        proxied.on('request', function (model) {
            strictEqual(model, proxied, 'model parameter of request-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of request-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('request', function (model) {
            strictEqual(model, proxy, 'model parameter of request-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of request-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxied.on('destroy', function (model) {
            strictEqual(model, proxied, 'model parameter of destroy-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of destroy-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('destroy', function (model) {
            strictEqual(model, proxy, 'model parameter of destroy-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of destroy-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxy.set({ id: 1 });
        proxy.destroy({
            success: function (model) {
                strictEqual(model, proxy, 'model parameter of success is() proxy');
            }
        });
    });

    test('.destroy()ing proxied should invoke error functions & events with appropriate model parameter / context', function () {
        expect(5);

        proxied.sync = function (method, model, options) {
            options.error();
        };

        proxied.on('error', function (model) {
            strictEqual(model, proxied, 'model parameter of error-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of error-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('error', function (model) {
            strictEqual(model, proxy, 'model parameter of error-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of error-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxied.set({ id: 1 });
        proxied.destroy({
            error: function (model) {
                strictEqual(model, proxied, 'model parameter of error() is proxied');
            }
        });
    });

    test('.destroy()ing proxy should invoke error functions & events with appropriate model parameter / context', function () {
        expect(5);

        proxied.sync = function (method, model, options) {
            options.error();
        };

        proxied.on('error', function (model) {
            strictEqual(model, proxied, 'model parameter of error-event triggered on proxied is proxied');
            strictEqual(this, proxied, 'context of error-event triggered on proxied is proxied (no context was explicitly set)');
        });
        proxy.on('error', function (model) {
            strictEqual(model, proxy, 'model parameter of error-event triggered on proxy is proxy');
            strictEqual(this, proxy, 'context of error-event triggered on proxy is proxy (no context was explicitly set)');
        });

        proxy.set({ id: 1 });
        proxy.destroy({
            error: function (model) {
                strictEqual(model, proxy, 'model parameter of error() is proxy');
            }
        });
    });

}());
