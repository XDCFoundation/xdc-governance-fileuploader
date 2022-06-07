/**
 * Created by jayeshc on 8/24/16.
 */

//require node modules
const CO = require('co');

//require files and Models
const Utils = require('../utils');
const BLManager = require('../managers/upload_bl_manager');
const Constants = require('../common/constants');

/***
 *
 */
exports.uploadFile = CO.wrap(function* (req, fields, files, response, requestID = '0') {
    console.log("Start point")
    Utils.LHTLog('uploadFile', 'start', {
        type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
        data: { fields: fields, files: files }
    }, "Ayush", requestID, Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
    let path = (fields.path ? (fields.path) : "");
    let addedBy = (fields.addedBy ? (fields.path) : "");
    let uploadObj = files.images;
    try {
        let uploadFileResponse = yield BLManager.uploadFile(req, uploadObj, path, addedBy, requestID, fields);
        if (uploadFileResponse) {

            Utils.LHTLog('uploadFile', 'end', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: { uploadFileResponse: uploadFileResponse }
            }, "Ayush", requestID, Constants.LOG_LEVEL_TYPE.INFO, Constants.CURRENT_TIMESTAMP);
            Utils.respond(response, uploadFileResponse, Constants.UPLOADED_SUCCESSFULLY_MESSAGE, Constants.RESPONSE_SUCCESS, Constants.RESPONSE_CODES.OK);
        } else {
            Utils.LHTLog('uploadFile', 'end:failure', {
                type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
                data: { uploadFileResponse: uploadFileResponse }
            }, "Ayush", requestID, Constants.LOG_LEVEL_TYPE.WARN, Constants.CURRENT_TIMESTAMP);
            Utils.respond(response, {}, Constants.UPLOAD_FAILURE_MESSAGE, Constants.RESPONSE_FAILURE, Constants.RESPONSE_CODES.FORBIDDEN);
        }
    } catch (err) {
        Utils.LHTLog('uploadFile', 'end', {
            type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL,
            data: { err: err }
        }, "Ayush", requestID, Constants.LOG_LEVEL_TYPE.ERROR, Constants.CURRENT_TIMESTAMP);
        Utils.respond(response, err, Constants.UPLOAD_FAILURE_MESSAGE, Constants.RESPONSE_FAILURE, Constants.RESPONSE_CODES.FORBIDDEN);
    }
});

exports.updateURL = CO.wrap(function *(req, res) {
    let updateURLResponse = yield BLManager.updateFileSignedUrl(req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY]);
    if (updateURLResponse)
        Utils.respond(res, updateURLResponse, Constants.UPLOADED_SUCCESSFULLY_MESSAGE, Constants.RESPONSE_SUCCESS);
});

exports.getSignedURL = CO.wrap(function *(req, res) {
    let getURLResponse = yield BLManager.getSignedUrl(req.body.fileName).catch(err => {
        Utils.respond(res, err, Constants.SIGNED_URL_FETCH_FAILURE_MESSAGE, Constants.RESPONSE_FAILURE);
    });
    if (getURLResponse)
        Utils.respond(res, getURLResponse, Constants.SIGNED_URL_FETCH_SUCCESSFULLY_MESSAGE, Constants.RESPONSE_SUCCESS);
    else
        Utils.respond(res, {}, Constants.SIGNED_URL_FETCH_FAILURE_MESSAGE, Constants.RESPONSE_FAILURE);
});

exports.createThumbnail = CO.wrap(function *(req, res) {
    let createThumbnailResponse = yield BLManager.createThumbnail(req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY]);
});




