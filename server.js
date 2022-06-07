'use strict';
/**
 * Module dependencies
 */
const fs = require('fs');
const join = require('path').join;
const express = require('express');
const mongoose = require('mongoose');
const CONFIG = require('./config');
const dbConnect = require('./config/dbConnect');
const connection = dbConnect.connection();
const models = join(__dirname, 'app/models');
const port = process.env.PORT || 3006;
const app = express();
const uuid = require('uuid');
let requestID=uuid.v1();
const utils = require('./app/utils/index');
const constants=require('./app/common/constants');
const cronManager = require('./app/cronManager/cronManager');
/**
 * Expose
 */

module.exports = {
    app,
    connection
};

// Bootstrap models
fs.readdirSync(models)
    .filter(file => ~file.indexOf('.js'))
    .forEach(file => require(join(models, file)));

// Bootstrap routes
require('./config/express')(app);
require('./routes')(app);

connection
    .on('error', function dbConnectErrorCallback(err) {
        utils.LHTLog('dbConnectErrorCallback','failed to connect',{type:constants.LOG_OPERATION_TYPE.DB_CONNECTION,data:err},"Ayush",requestID,constants.LOG_LEVEL_TYPE.ERROR,constants.CURRENT_TIMESTAMP);
    })
    .on('disconnected', dbConnect.connection)
    .once('open', listen);

function listen() {
    if (app.get('env') === 'test') return;
    app.listen(port);
    utils.LHTLog('listen','APP started',{type:constants.LOG_OPERATION_TYPE.DB_CONNECTION,data:{port:port,env:app.get('env'),db:CONFIG.db}},"Ayush",requestID,constants.LOG_LEVEL_TYPE.INFO,constants.CURRENT_TIMESTAMP);
    console.log('Express app started on port ' + port);
    if (CONFIG.AMQP_HOST_REQUIRED == true || CONFIG.AMQP_HOST_REQUIRED == 'true')
        require('./sub_module/lht_amqp_client_library').conn(CONFIG.AMQP_HOST_URL);
}