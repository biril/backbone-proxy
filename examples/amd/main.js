/*jshint strict:false */
/*globals requirejs:false */

requirejs.config({
  baseUrl: 'app/',
  paths: {
    'underscore':     '../bower_components/underscore/underscore',
    'jquery':         '../bower_components/jquery/dist/jquery',
    'backbone':       '../bower_components/backbone/backbone',
    'backbone-proxy': '../bower_components/backbone-proxy/backbone-proxy'
  }
});

requirejs(['app'], function (app) {
    app.run();
});
