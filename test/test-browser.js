/*global BackboneProxy, _, window, QUnit, test, ok, strictEqual, deepEqual, throws, start, stop, expect, Backbone */
(function () {
  'use strict';

  QUnit.module('browser', {
    setup: function () {},
    teardown: function () {}
  });

  test('backboneProxy should be available in global scope', 2, function () {
    ok(_.isObject(window.BackboneProxy), 'window.backboneProxy should be an object');
    ok(_.isFunction(BackboneProxy.extend), 'backboneProxy.extend should be a function');
  });

  test('backboneProxy should have a .noConflict() method', 1, function () {
    ok(_.isFunction(BackboneProxy.noConflict));
  });

}());