/**
 * Created by jayeshc on 12/29/16.
 */

const CONFIG = require('./');
let mongoose = require('mongoose');
const fs = require("fs");
module.exports = {connection: connect};

function connect() {
    console.log("DB trying to connect from " + CONFIG.db + " on " + new Date());
    const options = {
        server: {
            socketOptions: {
                keepAlive: 1,
                poolSize: 10,
                ssl: true,
                sslValidate: false,
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
                retryWrites: false,
                sslCA: [fs.readFileSync('./rds-combined-ca-bundle.pem')],
            }
        }
    };
    return mongoose.connect(CONFIG.db, options).connection;
}
