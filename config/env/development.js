/**
 * Expose
 */

module.exports = {
    db: process.env.DB || 'mongodb://xdcvotingdappdbprod:longmonster31@xdc-votingdapp-db-prod.ckjj5obhzs40.us-east-2.docdb.amazonaws.com:27017/?ssl=true&ssl_ca_certs=rds-combined-ca-bundle.pem&retryWrites=false',
    AMQP_HOST_URL: process.env.AMQP_HOST_URL || '',
    AMQP_HOST_REQUIRED: process.env.AMQP_HOST_REQUIRED || false,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || ' AKIASMMTV6PRCONJVAV7',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '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',
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'xdc-votingdapp-prod',
    S3_THUMBNAIL_BUCKET_NAME: process.env.S3_THUMBNAIL_BUCKET_NAME || '',
    IMAGE_THUMBNAIL_STRING:  process.env.IMAGE_THUMBNAIL_STRING || "50,150,250,500,700,1080",
    S3_THUMBNAIL_BUCKET_PATH_NAME: process.env.S3_THUMBNAIL_BUCKET_PATH_NAME || "images",
    IS_CONSOLE_LOG: process.env.IS_CONSOLE_LOG || 'false',
    USE_AWS4_SIGNATURE: process.env.USE_AWS4_SIGNATURE || false
};