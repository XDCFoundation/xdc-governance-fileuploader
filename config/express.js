/**
 * Module dependencies.
 */

var express = require('express');
var compression = require('compression');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var config = require('./');
var pkg = require('../package.json');

var env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

module.exports = function (app) {

    //For print APIs Logs
    app.use(morgan(':method :url :response-time'));
    // Compression middleware (should be placed before express.static)
    app.use(compression(9));

    // Static files middleware
    app.use(express.static(config.root + '/public'));


    // expose package.json to views
    app.use(function (req, res, next) {
        res.locals.pkg = pkg;
        res.locals.env = env;
        next();
    });

    // bodyParser should be above methodOverride
    app.use(bodyParser({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb'}));
    app.use(bodyParser());


};
