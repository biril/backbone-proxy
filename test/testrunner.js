/*jshint node:true */
'use strict';
var qunit = require('qunit'),
absPath = (function () {
  var joinPaths = require('path').join;
  return function (relPath) {
    return joinPaths(__dirname, relPath);
  };
}());

qunit.options.deps = [{
  path: absPath('../node_modules/underscore/underscore.js'),
  namespace: '_'
}, {
  path: absPath('../node_modules/backbone/backbone.js'),
  namespace: 'Backbone'
}];

qunit.options.log = {
  // log assertions overview
  assertions: false,

  // log expected and actual values for failed tests
  errors: true,

  // log tests overview
  tests: false,

  // log summary
  summary: true,

  // log global summary (all files)
  globalSummary: true,

  // log coverage
  coverage: true,

  // log global coverage (all files)
  globalCoverage: true,

  // log currently testing code file
  testing: true
};

qunit.run({
  code: {
    path: absPath('../backbone-proxy.js'),
    namespace: 'BackboneProxy'
  },
  tests: [
    absPath('test-model-overridables.js'),
    absPath('test-examples.js'),
    absPath('test-set().js'),
    absPath('test-on().js'),
    absPath('test-once().js'),
    absPath('test-off()-by-event.js'),
    absPath('test-off()-by-callback.js'),
    absPath('test-off()-by-context.js'),
    absPath('test-query-changed-attrs.js'),
    absPath('test-housekeeping.js')
  ]
}, function (error, stats) {
  if (error) {
    console.error(new Error(error));
    return process.exit(1);
  }
  process.exit(stats.failed > 0 ? 1 : 0);
});