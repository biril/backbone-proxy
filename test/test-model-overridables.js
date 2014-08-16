/*global BackboneProxy, _, QUnit, test, ok, strictEqual, deepEqual, expect, Backbone */
(function () {
    'use strict';

    var proxied, proxy;

    QUnit.module('model overridables', {
        setup: function () {
            var Proxy;
            proxied = new Backbone.Model({ name: 'Anna' });
            Proxy = BackboneProxy.extend(proxied);
            proxy = new Proxy();
        },
    });

    //////// .sync() method

    test('setting a .sync() method on proxy should have no effect', 0, function () {
        proxy.sync = function () {
            ok(false, 'the sync method should not be invoked');
        };
    });

    test('a .sync() method set on proxied should be invoked when proxy is persisted', 4, function () {
        proxied.sync = function (method) {
            strictEqual(method, 'read', 'invoked for fetch');
        };
        proxy.fetch();

        proxied.sync = function (method) {
            strictEqual(method, 'create', 'invoked for save (when model.isNew())');
        };
        proxy.save();

        proxied.sync = function (method) {
            strictEqual(method, 'update', 'invoked for save (when !model.isNew())');
        };
        proxy.save({ id: 1 });

        proxied.sync = function (method) {
            strictEqual(method, 'delete', 'invoked for destroy (when !model.isNew())');
        };
        proxy.set({ id: 1 });
        proxy.destroy();
    });

    test('a .sync() method set on proxied should be invoked with proxied as the model parameter when proxy is persisted', 4, function () {
        proxied.sync = function (method, model) {
            strictEqual(model, proxied, 'ok for fetch');
        };
        proxy.fetch();

        proxied.sync = function (method, model) {
            strictEqual(model, proxied, 'ok for save (when model.isNew())');
        };
        proxy.save();

        proxied.sync = function (method, model) {
            strictEqual(model, proxied, 'ok for save (when !model.isNew())');
        };
        proxy.save({ id: 1 });

        proxied.sync = function (method, model) {
            strictEqual(model, proxied, 'ok for destroy (when !model.isNew())');
        };
        proxy.set({ id: 1 });
        proxy.destroy();
    });

    //////// .idAttribute property
    //////// .validate() method
    //////// .url() method
    //////// .urlRoot() method
    //////// .toJSON() method
    //////// .parse() method

}());
