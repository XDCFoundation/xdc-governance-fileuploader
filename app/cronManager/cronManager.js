/**
 * Created by Sanjeet on 15/02/17.
 */
const cronMaster = require('cron-master');
const path = require('path');
const uuid = require('uuid');
const Utils = require('../utils');
const constants = require('../../app/common/constants');

function initialiseJob (job) {

    Utils.LHTLog('initialiseJob','start',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{Job:job.meta.name}},"Ayush",job.meta.requestID,constants.LOG_LEVEL_TYPE.INFO,constants.CURRENT_TIMESTAMP);
    job.on('tick-started', function () {
        Utils.LHTLog('initialiseJob','tick-started',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{JobName:job.meta.name}},"Ayush",job.meta.requestID,constants.LOG_LEVEL_TYPE.VERBOSE,constants.CURRENT_TIMESTAMP);
    });
    // Bind event name with your own string...
    job.on('tick-complete', function (err, result, time) {
        Utils.LHTLog('initialiseJob','End:tick-complete',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{JobName:job.meta.name,error:err,time: time,result:result}},"Ayush",job.meta.requestID,constants.LOG_LEVEL_TYPE.VERBOSE,constants.CURRENT_TIMESTAMP);
    });

    // ...or bind using events object provided name
    job.on(cronMaster.EVENTS.TIME_WARNING, function () {
        Utils.LHTLog('initialiseJob','time-warning:taking longer than expected',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{JobName:job.meta.name,timeThreshold:job.timeThreshold}},"Ayush",job.meta.requestID,constants.LOG_LEVEL_TYPE.WARN,constants.CURRENT_TIMESTAMP);
    });

    job.on(cronMaster.EVENTS.OVERLAPPING_CALL, function () {
        Utils.LHTLog('initialiseJob','overlapping-call:received a tick before the previous tick completed this tick has been ignored and will not run until the first tick has finished',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{JobName:job.meta.name,timeThreshold:job.timeThreshold}},"Ayush",job.meta.requestID,constants.LOG_LEVEL_TYPE.VERBOSE,constants.CURRENT_TIMESTAMP);
    });
    job.on('stopped', function (err, res, time) {
        Utils.LHTLog('initialiseJob','stopped:Restart initialiseJob',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{JobName:job.meta.name,error:err,time: time}},"Ayush",job.meta.requestID,constants.LOG_LEVEL_TYPE.ERROR,constants.CURRENT_TIMESTAMP);
        initialiseJob(job);
    });
}

// Loads up jobs in the jobs folder
cronMaster.loadJobs(path.join(__dirname, '../common/jobs'), function (err, jobs) {
    let requestID=uuid.v1();
    Utils.LHTLog('jobInitializer file','loadJobs starts',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:'N/A'},"Ayush",requestID,constants.LOG_LEVEL_TYPE.ERROR,constants.CURRENT_TIMESTAMP);

    if (err) {
        // Something went wrong when loading jobs
        Utils.LHTLog('jobInitializer file','loadJobs',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{error:err}},"Ayush",requestID,constants.LOG_LEVEL_TYPE.ERROR,constants.CURRENT_TIMESTAMP);
        throw err;
    } else if (jobs.length === 0) {
        // If no files were found
        Utils.LHTLog('jobInitializer file','loadJobs:No jobs found!',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:{jobs:jobs.length}},"Ayush",requestID,constants.LOG_LEVEL_TYPE.WARN,constants.CURRENT_TIMESTAMP);
        throw new Error('No jobs found!');
    } else {
        // Bind job events etc.
        jobs.forEach(initialiseJob);
        Utils.LHTLog('jobInitializer file','loadJobs:startJobs',{type:constants.LOG_OPERATION_TYPE.CRON_OPERATION,data:'N/A'},"Ayush",requestID,constants.LOG_LEVEL_TYPE.INFO,constants.CURRENT_TIMESTAMP);
        // Start the cron timers
        cronMaster.startJobs();
    }
});