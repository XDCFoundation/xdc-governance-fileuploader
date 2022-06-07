/**
 * Created by developer on 23-06-2017.
 */
//require node modules
const co = require('co');
const CronMasterJob = require('cron-master').CronMasterJob;
const uuid = require('uuid');
//require files
const UploadBLManager = require('../../managers/upload_bl_manager');
const Config = require('../../../config/index');
let requestID=uuid.v1();
var Utils = require('../../../app/utils/index');
var constants = require('../../../app/common/constants');
module.exports = new CronMasterJob({
    meta: {
        name: 'Create Thumbnail Job',
        requestID:requestID
    },

    cronParams: {
        cronTime: '*/5 * * * * *',
        onTick: co.wrap(function *(job, done) {
            Utils.LHTLog('createThumbnail file onTick','start',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{job:job.meta.name}},"Ayush",requestID,constants.LOG_LEVEL_TYPE.INFO,constants.CURRENT_TIMESTAMP);

            if(Config.IMAGE_THUMBNAIL_STRING.length > 0) {
                let createThumbnailResponse = yield UploadBLManager.createThumbnail(requestID).catch(function (err) {
                    Utils.LHTLog('createThumbnail file onTick','end:failed',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{err:err}},"Ayush",requestID,constants.LOG_LEVEL_TYPE.ERROR,constants.CURRENT_TIMESTAMP);
                    done(null, 'failed');
                });
            }
            Utils.LHTLog('createThumbnail file onTick','end',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{job:job.meta.name}},"Ayush",requestID,constants.LOG_LEVEL_TYPE.INFO,constants.CURRENT_TIMESTAMP);
            done(null, 'ok');
        })
    }

});