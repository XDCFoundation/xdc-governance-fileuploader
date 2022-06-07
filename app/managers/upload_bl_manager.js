/**
 * Created by jayeshc on 8/24/16.
 */

//require node modules
const CO = require('co');
const gm = require('gm').subClass({imageMagick: true});
const fs = require('fs');

//require files and models
const mongoose = require('mongoose');
const Media = mongoose.model('Media');
const AWSService = require('../service/awsService.js');
const Constants = require('../common/constants');
const Utils = require('../utils');
const Config = require('../../config/index');


exports.uploadFile = CO.wrap(function* (req, uploadObj, path, isSignedURL, requestID = '0', fields) {


    Utils.LHTLog('uploadFile:upload_bl_manager', 'start', { type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL, data: { uploadObj: uploadObj, path: path, isSignedURL: isSignedURL } }, "Ayush", requestID, Constants.LOG_LEVEL_TYPE.VERBOSE, Constants.CURRENT_TIMESTAMP);

    let uploadFileResponse = [];
    let uploadObjArray = [];

    /**
     * Upload Object is array only in case of multiple files. Otherwise it is array. So a check for array is done.
     */
    if (uploadObj.constructor != Array) {
        uploadObjArray.push(uploadObj);
    } else {
        uploadObjArray = uploadObj;
    }
    console.log("UploadobjArray", uploadObjArray)
    try {

        for (let fileIndex = 0; fileIndex < uploadObjArray.length; fileIndex++) {
            let key = "", fileName, fileType;

            //  const credentials = Utils.getConfigObjectForTenantId('lupin');
            fileName = uploadObjArray[fileIndex].name.replace(/ +/g, "_").replace(/[{()}]/g, '');
            fileType = uploadObjArray[fileIndex].type
            path = Config.S3_THUMBNAIL_BUCKET_PATH_NAME
            if (path.length > 0)
                key = path + '/';
            key = key + (new Date).getTime() + "_" + Utils.generateRandomAlphaNumericString(10) + "." + uploadObjArray[fileIndex].name.split('.').pop();
            let fileUploadResponse = yield AWSService.uploadFile(Config.S3_BUCKET_NAME, key, fs.readFileSync(uploadObjArray[fileIndex].path), uploadObjArray[fileIndex].type, requestID);
            uploadFileResponse.push(fileUploadResponse);
            uploadFileResponse[fileIndex].name = fileName;
            uploadFileResponse[fileIndex].path = path;
            uploadFileResponse[fileIndex].mimeType = fileType;
            uploadFileResponse[fileIndex].addedFor = fields.name ? fields.name : "";
            uploadFileResponse[fileIndex].addedBy = fields.addedBy ? fields.addedBy : '';
            uploadFileResponse[fileIndex].addedOn = Date.now();
        }

    } catch (err) {
        Utils.LHTLog('uploadFile:upload_bl_manager', 'end:error', { type: Constants.LOG_OPERATION_TYPE.FUNCTIONAL, data: { err: err } }, "Ayush", requestID, Constants.LOG_LEVEL_TYPE.ERROR, Constants.CURRENT_TIMESTAMP);
        return Promise.resolve(false);
    }
    Utils.LHTLog('uploadFile:upload_bl_manager', 'before save media', { type: Constants.LOG_OPERATION_TYPE.DB_OPERATION, data: { uploadFileResponse: uploadFileResponse } }, "Ayush", requestID, Constants.LOG_LEVEL_TYPE.SILLY, Constants.CURRENT_TIMESTAMP);

    let saveMediaResponse;

    if (Config.IS_DYNAMODB) {
        saveMediaResponse = yield DynamoModel.addData(uploadFileResponse);
        Utils.LHTLog('uploadFile:upload_bl_manager', 'end:after save media', { type: Constants.LOG_OPERATION_TYPE.DB_OPERATION, data: { saveMediaResponse: saveMediaResponse } }, "Ayush", requestID, Constants.LOG_LEVEL_TYPE.VERBOSE, Constants.CURRENT_TIMESTAMP);
    }
    else {
        saveMediaResponse = yield Media.insertMany(uploadFileResponse);
        Utils.LHTLog('uploadFile:upload_bl_manager', 'end:after save media', {
            type: Constants.LOG_OPERATION_TYPE.DB_OPERATION,
            data: { saveMediaResponse: saveMediaResponse }
        }, "Ayush", requestID, Constants.LOG_LEVEL_TYPE.VERBOSE, Constants.CURRENT_TIMESTAMP);
    }
    /*/!**
     * if uploaded multiple files then return array in response data else return single object;
     *!/
     if(uploadObjArray.length==1){

     return saveMediaResponse[0];
     }*/

    return saveMediaResponse;
});

exports.saveMediaObj = CO.wrap(function *(mediaObj) {
    return yield Media.insertBulkMedia(mediaObj);
});

exports.getSignedUrl = CO.wrap(function *(key, expiryTime = 86400){
     const signedUrl = yield AWSService.getSignedURL(Config.S3_BUCKET_NAME, key, expiryTime).catch(err => reject(err))
     return signedUrl;
})

exports.updateFileSignedUrl = CO.wrap(function *(requestID='0') {
    Utils.LHTLog('updateFileSignedUrl','start',{type:Constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:'N/A'},"Anurag",requestID,Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);
    let findQuery = {isDeleted: 0, isSignedURL: true, status: Constants.STATUS.PENDING};
    while (true) {
        Utils.LHTLog('updateFileSignedUrl','before get media',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{findQuery:findQuery,mediaFetchLimit: Constants.MEDIA_FETCH_LIMIT}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);
        let mediaArray = yield Media.getMedia(findQuery, Constants.MEDIA_FETCH_LIMIT);
        Utils.LHTLog('updateFileSignedUrl','after get media',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{mediaArray:mediaArray}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);

        if (mediaArray.length == 0) {
            break;
        }

        /**
         * setting status to processing
         */
        for (let i = 0; i < mediaArray.length; i++)
            mediaArray[i].status = Constants.STATUS.PROCESSING;

        /**
         * updating status to processing
         */
        Utils.LHTLog('updateFileSignedUrl','before save medias to update status',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{mediaArray:mediaArray}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);
        let updateStatusResponse = yield Media.saveArray(mediaArray);

        if (!updateStatusResponse) {
            Utils.LHTLog('updateFileSignedUrl','after save medias',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{updateStatusResponse:updateStatusResponse}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);
            return Promise.resolve(false);
        }
        Utils.LHTLog('updateFileSignedUrl','after save medias',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{updateStatusResponse:updateStatusResponse}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);

        /**
         * setting the regenerated url and status to completed
         */
        var queueObjList = [];
        for (let i = 0; i < mediaArray.length; i++) {
            let signedUrl = yield AWSService.getSignedURL(mediaArray[i].sourceFileName, Constants.AWS.EXPIRY_HOUR,requestID);
            if (signedUrl) {
                mediaArray[i].status = Constants.STATUS.COMPLETED;
                mediaArray[i].signedUrl = signedUrl;
                mediaArray[i].modifiedOn = (new Date()).getTime();
            }
            else
                mediaArray[i].status = Constants.STATUS.ABORT;

            var queueObj = {
                type: "contentUpdateService",
                request: JSON.stringify({
                    sourceCollectionName: "media", object: mediaArray[i].toJSON()
                })
            };

            queueObjList.push(queueObj);
        }
        Utils.LHTLog('updateFileSignedUrl','insert to update_content_service_exchange',{type:Constants.LOG_OPERATION_TYPE.RABBIT_MQ_OPERATION,data:{queueObjList:queueObjList}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);
        insertObjInContentUpdateServiceQueue(queueObjList);

        /**
         * updating the regenerated url and status to completed
         */
        Utils.LHTLog('updateFileSignedUrl','before save medias to updating the regenerated url and status to completed',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{mediaArray:mediaArray}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);
        let updateURLResponse = yield Media.saveArray(mediaArray);
        if (!updateURLResponse) {
            Utils.LHTLog('updateFileSignedUrl','after save medias',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{updateURLResponse:updateURLResponse}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);
            return Promise.resolve(false);
        }
        Utils.LHTLog('updateFileSignedUrl','after save medias:wait for 60s',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{updateURLResponse:updateURLResponse}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);

        wait(60000);
    }

    /**
     * updating the status to pending when all regenerated url of all media
     */
    Utils.LHTLog('updateFileSignedUrl','before save medias to updating the regenerated url and status to completed',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{findQuery:{
        isDeleted: 0,
        isSignedURL: true,
        status: Constants.STATUS.COMPLETED
    },updateData:{status: Constants.STATUS.PENDING}}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);
    let updateStatus = yield Media.updateMedia({
        isDeleted: 0,
        isSignedURL: true,
        status: Constants.STATUS.COMPLETED
    }, {status: Constants.STATUS.PENDING}).catch(function (err) {
        Utils.LHTLog('updateFileSignedUrl','end:error',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{err:err}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);
        return Promise.reject(err)
    });
    Utils.LHTLog('updateFileSignedUrl','end:after update media',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{updateStatus:updateStatus}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);

    return Promise.resolve(updateStatus);
});

exports.createThumbnail = CO.wrap(function *(requestID='0') {
    Utils.LHTLog('createThumbnail','start:before get media',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:'N/A'},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);

    let queryObj = {
        thumbnail: "pending",
        isActive: 1,
        isDeleted: 0
    };

    let getMediaList = yield Media.getMedia(queryObj, 10);
    if (getMediaList.length == 0) {
        Utils.LHTLog('createThumbnail','end:after get media',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{getMediaList:getMediaList}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);
        return Promise.resolve(false);
    }
    Utils.LHTLog('createThumbnail','after get media',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{queryObj:queryObj,getMediaList:getMediaList}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);


    for (let index = 0; index < getMediaList.length; index++) {
        let queryObj = {
            _id: getMediaList[index]._id
        };

        let updateQuery = {
            thumbnail: "processing"
        };
        Utils.LHTLog('createThumbnail','before update media',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{queryObj:queryObj,updateQuery: updateQuery}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);
        let updateMediaResponse = yield Media.updateMedia(queryObj, updateQuery);
        Utils.LHTLog('createThumbnail','after update media',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:updateMediaResponse},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);

        if (!updateMediaResponse) {
            continue;
        }

        let downloadFileResponse = yield AWSService.downloadFile(Config.S3_BUCKET_NAME, getMediaList[index].sourceFileName,requestID);
        if (!downloadFileResponse) {
            continue;
        }

        let fileType = getMediaList[index].sourceFileName.split(".")[1];
        let imageTypeList = ["jpg", "JPG", "jpeg", "JPEG", "png", "PNG", "gif", "GIF", "eps", "EPS", "psd", "PSD", "svg", "SVG", "bmp", "BMP", "bmp ico", "BMP ICO", "png ico", "PNG ICO"];

        if (imageTypeList.indexOf(fileType) < 0) {
            Utils.LHTLog('createThumbnail','end',{type:Constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{imageTypeList:imageTypeList,fileType:fileType}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);
            return Promise.resolve(false);
        }

        let imageObj = gm(downloadFileResponse.Body).quality(50);

        let imageSizeObj = yield this.getImageSizeObj(imageObj,requestID).catch(function (err) {
            Utils.LHTLog('createThumbnail','end:error',{type:Constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{err:err}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);
            return Promise.resolve(false);
        });

        if (!imageSizeObj) {
            Utils.LHTLog('createThumbnail','end',{type:Constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{imageSizeObj:imageSizeObj}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);
            return Promise.resolve(false);
        }

        let thumbnailList = Config.IMAGE_THUMBNAIL_STRING.split(",");
        if (thumbnailList.length == 0) {
            Utils.LHTLog('createThumbnail','end',{type:Constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{thumbnailList:thumbnailList}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);
            return Promise.resolve(false);
        }

        let path = "";
        if (getMediaList[index].path.length > 0) {
            path = getMediaList[index].path + '/';
            let pathList = getMediaList[index].sourceFileName.split('/');
            if (pathList.length)
                getMediaList[index].sourceFileName = pathList[pathList.length - 1];

        } else if (Config.S3_THUMBNAIL_BUCKET_PATH_NAME && Config.S3_THUMBNAIL_BUCKET_PATH_NAME.length > 0) {
            path = Config.S3_THUMBNAIL_BUCKET_PATH_NAME + '/';
        }

        let uploadFileResponseList = [];
        for (let thumbnailIndex = 0; thumbnailIndex < thumbnailList.length; thumbnailIndex++) {
            let transformImageResponse = yield this.transformImage(imageObj, imageSizeObj, fileType, Number(thumbnailList[thumbnailIndex]),requestID);
            if (!transformImageResponse)
                continue;

            let uploadFileResponse = yield AWSService.uploadFile(Config.S3_THUMBNAIL_BUCKET_NAME, path + thumbnailList[thumbnailIndex] + "_" + getMediaList[index].sourceFileName, transformImageResponse, fileType, getMediaList[index].isSignedURL,requestID);
            if (!uploadFileResponse)
                continue;

            uploadFileResponse.name = uploadFileResponse.sourceFileName;
            uploadFileResponse.thumbnail = "done";

            uploadFileResponseList.push(uploadFileResponse);
        }
        Utils.LHTLog('createThumbnail','before save medias',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{uploadFileResponseList:uploadFileResponseList}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);
        let saveMediaObjResponse = yield this.saveMediaObj(uploadFileResponseList).catch(function (err) {
            Utils.LHTLog('createThumbnail','end',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{err:err}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.ERROR,Constants.CURRENT_TIMESTAMP);
            return Promise.resolve(false);
        });
        Utils.LHTLog('createThumbnail','after save medias',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{saveMediaObjResponse:saveMediaObjResponse}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);


        if (!saveMediaObjResponse) {
            Utils.LHTLog('createThumbnail','end',{type:Constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{saveMediaObjResponse:saveMediaObjResponse}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.WARN,Constants.CURRENT_TIMESTAMP);
            return Promise.resolve(false);
        }

        queryObj = {
            _id: getMediaList[index]._id
        };

        updateQuery = {
            thumbnail: "done"
        };
        Utils.LHTLog('createThumbnail','before save medias',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{queryObj:queryObj,updateQuery: updateQuery}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);
        updateMediaResponse = yield Media.updateMedia(queryObj, updateQuery);
        Utils.LHTLog('createThumbnail','after save medias',{type:Constants.LOG_OPERATION_TYPE.DB_OPERATION,data:{updateMediaResponse:updateMediaResponse}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.SILLY,Constants.CURRENT_TIMESTAMP);

    }
    Utils.LHTLog('createThumbnail','end',{type:Constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{returnValue:true}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);
    return Promise.resolve(true);
});

exports.getImageSizeObj = CO.wrap(function *(imageObj,requestID='0') {
    Utils.LHTLog('getImageSizeObj','start',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{imageObj:imageObj}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.VERBOSE,Constants.CURRENT_TIMESTAMP);

    return new Promise(function (resolve, reject) {
        imageObj.size(function (err, res) {
            if (err) {
                Utils.LHTLog('getImageSizeObj','end:error',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{err:err}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.ERROR,Constants.CURRENT_TIMESTAMP);
                return reject(err);
            }
            else {
                Utils.LHTLog('getImageSizeObj','end',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{res:res}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.VERBOSE,Constants.CURRENT_TIMESTAMP);
                return resolve(res);
            }
        })
    });
});

exports.transformImage = CO.wrap(function (imageObj, imageSizeObj, fileType, thumbnail,requestID='0') {
    Utils.LHTLog('transformImage','start',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{imageObj:imageObj,imageSizeObj: imageSizeObj,fileType: fileType,thumbnail: thumbnail}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);

    let scalingFactor = Math.min(
        thumbnail / imageSizeObj.width,
        thumbnail / imageSizeObj.height
    );

    let width = scalingFactor * imageSizeObj.width;
    let height = scalingFactor * imageSizeObj.height;

    return new Promise(function (resolve, reject) {
        imageObj.resize(width, height)
            .toBuffer(fileType, function (err, res) {
                if (err) {
                    Utils.LHTLog('transformImage','end',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{err:err}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.WARN,Constants.CURRENT_TIMESTAMP);
                    return reject(err);
                }
                else {
                    Utils.LHTLog('transformImage','end',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{res:res}},"Ayush",requestID,Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);
                    return resolve(res);
                }

            });
    })
});

function insertObjInContentUpdateServiceQueue(queueObjList) {//exchangeName, elasticQueue, exchangeType, queueType, elasticData
    Utils.insertDataToElasticSearch(Constants.RABBITMQ.EXCHANGE_NAME.UPDATE_CONTENT_SERVICE_EXCHANGE, Constants.RABBITMQ.QUEUE_NAME.UPDATE_CONTENT_SERVICE_QUEUE, Constants.RABBITMQ.LIST_EXCHANGE.FANOUT, Constants.RABBITMQ.QUEUE_TYPE.PUBLISHER_SUBSCRIBER_QUEUE, queueObjList);
}

function wait(iMilliSeconds) {
    var counter = 0
        , start = new Date().getTime()
        , end = 0;
    while (counter < iMilliSeconds) {
        end = new Date().getTime();
        counter = end - start;
    }
}