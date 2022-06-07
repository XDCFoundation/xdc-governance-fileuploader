/**
 * Created by Sanjeet on 15/02/17.
 */

const uuid = require('uuid');
const CronMasterJob = require('cron-master').CronMasterJob;
const UploadBLManager = require('../../managers/upload_bl_manager');
const co = require('co');
let requestID=uuid.v1();
var Utils = require('../../../app/utils/index');
var constants = require('../../../app/common/constants');
module.exports = new CronMasterJob({

    // Optional. Used to determine when to trigger the 'time-warning'. Fires after
    // the provided number of milliseconds (e.g 2 minutes in the case below) has
    // passed if the job has not called the done callback
    // timeThreshold: (2 * 60 * 1000),

    // Optional. Can be used to add useful meta data for a job
    meta: {
        name: 'Map Content Operation Job',
        requestID:requestID
    },

    // Just the usual params that you pass to the "cron" module!
    cronParams: {
        cronTime: '0 0 9 * * 0',
        onTick: co.wrap(function *(job, done) {
            Utils.LHTLog('updateURL file onTick','start',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{job:job.meta.name}},"Ayush",requestID,constants.LOG_LEVEL_TYPE.INFO,constants.CURRENT_TIMESTAMP);
            let updateUrl = yield UploadBLManager.updateFileSignedUrl(requestID).catch(function (response) {
                Utils.LHTLog('updateURL file onTick','end:failed',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{response:response}},"Ayush",requestID,constants.LOG_LEVEL_TYPE.ERROR,constants.CURRENT_TIMESTAMP);
                done(null,'failed');
            });
            Utils.LHTLog('updateURL file onTick','end',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{job:job.meta.name}},"Ayush",requestID,constants.LOG_LEVEL_TYPE.INFO,constants.CURRENT_TIMESTAMP);
            done(null, 'ok');
        })
    }

});