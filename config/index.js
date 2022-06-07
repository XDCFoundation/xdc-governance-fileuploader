/**
 * Module dependencies.
 */

var path = require('path');
var extend = require('util')._extend;

var development = require('./env/development');
var test = require('./env/test');
var production = require('./env/production');
var local = require('./env/local');

var defaults = {
    root: path.normalize(__dirname + '/..')
};

/**
 * Expose
 */

module.exports = {
  development: extend(development, defaults),
  test: extend(test, defaults),
  production: extend(production, defaults),
  local: extend(local, defaults)
}[process.env.NODE_ENV || 'development'];
