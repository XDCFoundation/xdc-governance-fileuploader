/**
 * Created by jayeshc on 8/25/16.
 */
const Constants = require('../common/constants');
var querystring = require('querystring');
var https = require('https');
const RabbitMQController = require('../../sub_module/lht_amqp_client_library');
const CONFIG = require('../../config');
const CO = require('co');

module.exports = {
    respond,
    respondWithArray,
    randomPassword,
    // sendEmail,
    LHTWebLogs,
    LHTLog,
    insertDataToElasticSearch: CO.wrap(function *(exchangeName, elasticQueue, exchangeType, queueType, elasticData) {
        if (CONFIG.AMQP_HOST_REQUIRED == true || CONFIG.AMQP_HOST_REQUIRED == 'true')
            return yield RabbitMQController.insertInQueue(exchangeName, elasticQueue, {}, {}, {}, {}, {}, exchangeType, queueType, elasticData);
    }),

    generateRandomAlphaNumericString: function (length) {
        let randomAlphaNumericString = "";
        let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (let index = 0; index < length; index++)
            randomAlphaNumericString += charset.charAt(Math.floor(Math.random() * charset.length));

        return randomAlphaNumericString;
    }
};

function respond(res, data, message, success) {
    res.format({
        json: () => {
            var messageObj = {
                "param": "",
                "msg": message
            };
            var messages = [messageObj];
            var responseObj = {
                responseData: data,
                message: messages,
                success: success
            };
            res.json(responseObj);
        }
    });
}

function respondWithArray(res, data, message, success) {
    res.format({
        json: () => {
            var messageObj = {
                "param": "",
                "msg": message
            };
            var messages = [messageObj];
            var responseObj = {
                responseData: data,
                message: messages,
                success: success
            };
            res.json(responseObj);
        }
    });
}

function randomPassword(chars, length) {
    var result = '';
    for (var i = length; i > 0; --i)
        result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
//
// function  sendEmail(to, subject, body_text, body_html, from, fromName) {
//     // Make sure to add your username and api_key below.
//     var post_data = querystring.stringify({
//         'username': Constants.ELASTIC_EMAIL_USERNAME,
//         'api_key': Constants.ELASTIC_EMAIL_API_KEY,
//         'from': from,
//         'from_name': fromName,
//         'to': to,
//         'subject': subject,
//         'body_html': body_html,
//         'body_text': body_text
//     });
//
//     // Object of options.
//     var post_options = {
//         host: 'api.elasticemail.com',
//         path: '/mailer/send',
//         port: '443',
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'Content-Length': post_data.length
//         }
//     };
//
//     var result = true;
//
//     // Create the request object.
//     var post_req = https.request(post_options, function (res) {
//         res.setEncoding('utf8');
//         res.on('data', function (chunk) {
//             utils.LHTWebLogs(chunk);
//             result = true;
//         });
//         res.on('error', function (err) {
//             utils.LHTWebLogs(err);
//             result = false;
//         });
//     });
//
//     // Post to Elastic Email
//     post_req.write(post_data);
//     post_req.end();
//
//
//     return result;
// }

function LHTWebLogs(msg, type) {
    type = type || 'info';
    console.log({message: msg, type: type});
}
/*
* @param message
* @param payload:should be in object form
* @param developerAlias
* @param requestID
* @param type
* @param timestamp
* @constructor
*/
function LHTLog(functionName, message, payload, developerAlias,requestID='',type='info',timestamp=(new Date()).getTime()) {
    // lhtLog.LHTWeblogs(message, payload, functionName, Constants.SERVICE_NAME, developerAlias, requestID, type, timestamp);
    if(CONFIG.IS_CONSOLE_LOG==="true") {
        console.log("payload")
        console.log(payload)
        console.log('\nserviceName:' + Constants.SERVICE_NAME + '\nfunctionName:' + functionName + '\nmessage:' + message + '\npayload:' + payload + '\ndeveloperAlias:' + developerAlias + '\nrequestID:' + requestID + '\ntype:' + type + '\ntimestamp:' + timestamp);
    }//writeStream.write('functionName:'+functionName+'message:'+ message+'payload:'+ payload+'developerAlias:'+ developerAlias+'requestID:'+requestID+'type:'+type+'timestamp:'+timestamp)
}