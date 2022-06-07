/**
 * Created by jayeshc on 8/25/16.
 */

module.exports = {
    SERVICE_NAME: 'LHT_File_Uploader_Service',

    //General Constants
    RESPONSE_SUCCESS: true,
    RESPONSE_FAILURE: false,
    RESPONSE_CODES: {
        UNAUTHORIZED: 401,
        SERVER_ERROR: 500,
        NOT_FOUND: 404,
        OK: 200,
        NO_CONTENT_FOUND: 204,
        BAD_REQUEST: 400,
        FORBIDDEN: 403,
        GONE: 410,
        UNSUPPORTED_MEDIA_TYPE: 415,
        TOO_MANY_REQUEST: 429
    },

    //UPLOAD API MESSAGES

    UPLOADED_SUCCESSFULLY_MESSAGE: 'File uploaded successfully',
    SIGNED_URL_FETCH_SUCCESSFULLY_MESSAGE: 'Signed Url fetched successfully',
    SIGNED_URL_FETCH_FAILURE_MESSAGE: 'Unable to fetch Sign Url',
    GET_FILES_SUCCESS: "Get files sucessfully",
    GET_FILES_FAILURE: "Get files failed",
    UPLOAD_FAILURE_MESSAGE: 'File upload failed',
    MEDIA_FETCH_LIMIT: 10,
    STATUS: {
        PENDING: 'pending',
        PROCESSING: 'processing',
        COMPLETED: 'completed',
        ABORT: 'aborted'
    },
    AWS: {
        /*expiry time in seconds, 604800 for a week*/
        EXPIRY_HOUR: 604800
    },
    RABBITMQ: {
        EXCHANGE_NAME: {
            UPDATE_CONTENT_SERVICE_EXCHANGE: 'update_content_service_exchange'
        },
        QUEUE_NAME: {
            UPDATE_CONTENT_SERVICE_QUEUE: 'update_content_service_queue'
        },
        LIST_EXCHANGE: {
            FANOUT: 'fanout',
            DIRECT: 'direct',
            HEADER: 'header'
        },
        QUEUE_TYPE: {
            ONE_TO_ONE_QUEUE: 'one_to_one_queue',
            DISTRIBUTED_QUEUE: 'distributed_queue',
            PUBLISHER_SUBSCRIBER_QUEUE: 'publisher_subscriber_queue',
            ROUTING_QUEUE: 'routing_queue',
            TOPICS_QUEUE: 'topics_queue',
            REQUEST_REPLY_QUEUE: 'request_reply_queue'
        },
    },
    HEADER_KEY_REQUEST_ID_KEY: 'request-id',
    CURRENT_TIMESTAMP: (new Date()).getTime(),

    LOG_OPERATION_TYPE: {
        DB_OPERATION: 'DB_OPERATION',
        DB_CONNECTION: 'DB_CONNECTION',
        FUNCTIONAL: 'FUNCTIONAL',
        HTTP_REQUEST: 'HTTP_REQUEST',
        RABBIT_MQ_OPERATION: 'RABBIT_MQ_OPERATION',
        CRON_OPERATION: 'CRON_OPERATION'
    },

    LOG_LEVEL_TYPE: {
        INFO: 'info',
        ERROR: 'error',
        WARN: 'warn',
        VERBOSE: 'verbose',
        DEBUG: 'debug',
        SILLY: 'silly'
    },
    SERVICE_STATUS_HTML:
        '<body style="font-family: Helvetica !important; background-color: black">' +
        '<div style="display: flex; flex:1; height: 100% ; justify-content: center; align-items: center; min-height: 100vh !important; font-size: 24px !important; color: #605DFF !important;">' +
        '⚡ File Manager 🔋 MicroService is working fine</div></body>'

};