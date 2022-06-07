/**
 * Created by deployment on 15/12/16.
 */

//require node modules
const CO = require('co');
const AWS = require('aws-sdk');

//require files
const Constants = require('../common/constants');
const utils = require("../utils");
const Config = require("../../config/index");

module.exports = {

    uploadFile: CO.wrap(function *(bucket, key, body, contentType, isSignedURL,requestID='0') {
        utils.LHTLog('uploadFile:awsService','start',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{bucket:bucket,key: key,body: body,contentType: contentType,isSignedURL: isSignedURL}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.VERBOSE,Constants.CURRENT_TIMESTAMP);

        AWS.config.update({
            accessKeyId: Config.AWS_ACCESS_KEY_ID,
            secretAccessKey: Config.AWS_SECRET_ACCESS_KEY
        });

        let params = {
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType
        };

        if (!isSignedURL) {
            params.ACL = 'public-read';
        }

        let s3 = new AWS.S3();

        return new Promise(function (resolve, reject) {
            s3.upload(params, CO.wrap(function *(err, res) {
                if (err) {
                    utils.LHTLog('uploadFile:awsService','end:error',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{err:err}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.VERBOSE,Constants.CURRENT_TIMESTAMP);
                    reject(false);
                } else {
                    let responseObj = {
                        sourceFileName: res.Key,
                        isSignedURL: isSignedURL,
                        signedUrl: "",
                        unSignedUrl: ""
                    };

                    if (isSignedURL) {
                        responseObj.unSignedUrl = res.Location;
                        responseObj.signedUrl = yield module.exports.getSignedURL(bucket, key, Constants.AWS.EXPIRY_HOUR);
                    } else
                        responseObj.unSignedUrl = res.Location;
                    utils.LHTLog('uploadFile:awsService','end',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{responseObj:responseObj}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.VERBOSE,Constants.CURRENT_TIMESTAMP);
                    resolve(responseObj);
                }
            }));
        });
    }),

    /**
     *@desc gets the signed url that expires in given time period
     * @param sourceFileName with folder name and timestamp
     * @param expiry time in seconds default is 1 week
     */
    getSignedURL: CO.wrap(function *(bucket, key, expiryTime,requestID='0') {
        utils.LHTLog('getSignedURL','start',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{bucket:bucket,key: key,expiryTime:expiryTime}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.VERBOSE,Constants.CURRENT_TIMESTAMP);
        return new Promise(function (resolve, reject) {
            if (!key) {
                utils.LHTLog('getSignedURL','end',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{key: key}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.VERBOSE,Constants.CURRENT_TIMESTAMP);
                return Promise.resolve(false);
            }
            expiryTime = expiryTime || Constants.AWS.EXPIRY_HOUR;
            AWS.config.update({
                accessKeyId: Config.AWS_ACCESS_KEY_ID,
                secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
                region: "us-east-1",
                signatureVersion: 'v4'
            });
            let s3 = {};
            if(Config.USE_AWS4_SIGNATURE && Config.USE_AWS4_SIGNATURE=="true")
                s3 = new AWS.S3({signatureVersion: 'v4'});
            else
                s3 = new AWS.S3();
            
            let paramsForGetURL = {Bucket: bucket, Key: key, Expires: expiryTime};
            console.log("paramsForGetURL ",paramsForGetURL)
            let signedURL = s3.getSignedUrl('getObject', paramsForGetURL, function (err, data) {
                utils.LHTLog('getSignedURL','end',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{data: data,err:err}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.VERBOSE,Constants.CURRENT_TIMESTAMP);
                console.log(data)
                if(err)
                    console.log(err)
                return resolve(data);
            });
        });
    }),

    downloadFile: CO.wrap(function (bucket, key,requestID='0') {
        utils.LHTLog('downloadFile','start',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{bucket:bucket,key: key}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.VERBOSE,Constants.CURRENT_TIMESTAMP);

        return new Promise(function (resolve, reject) {
            AWS.config.update({
                accessKeyId: Config.AWS_ACCESS_KEY_ID,
                secretAccessKey: Config.AWS_SECRET_ACCESS_KEY
            });

            let s3 = new AWS.S3();

            s3.getObject({
                    Bucket: bucket,
                    Key: key
                },
                function (err, res) {
                    if (err) {
                        utils.LHTLog('downloadFile','end',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{err:err}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.ERROR,Constants.CURRENT_TIMESTAMP);
                        return reject(err);
                    }
                    else {
                        utils.LHTLog('downloadFile','end',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{res:res}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.VERBOSE,Constants.CURRENT_TIMESTAMP);
                        return resolve(res);
                    }
                })
        });
    })
};