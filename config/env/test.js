/**
 * Expose
 */

module.exports = {
    db: process.env.DB || '',
    AMQP_HOST_URL: process.env.AMQP_HOST_URL || '',
    AMQP_HOST_REQUIRED: process.env.AMQP_HOST_REQUIRED || false,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || '',
    S3_THUMBNAIL_BUCKET_NAME: process.env.S3_THUMBNAIL_BUCKET_NAME || '',
    IMAGE_THUMBNAIL_STRING: process.env.IMAGE_THUMBNAIL_STRING || "",
    USE_AWS4_SIGNATURE: process.env.USE_AWS4_SIGNATURE || false
};