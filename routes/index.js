'use strict';

/**
 * Module dependencies.
 */

const upload = require('../app/controllers/upload.js');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../config/swagger.json');
const Formidable = require('formidable');
var express = require('express');
const requestIDManager = require('../config/middlewares/request_id_manager');
const Constants = require('../app/common/constants');
const CORS = require('cors');

/**
 * Expose
 */

module.exports = function (app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use(CORS());
    app.get('/', function (req, res) {
        res.send("File Uploader service working fine");
    });
    /**
     * check for requestID and generate new if not came in request header
     * @param req
     * @param res
     * @param next
     */
    let checkForRequestID = function (req, res, next) {
        requestIDManager.checkRequestID(req, res, next);
    };

    app.use(checkForRequestID);//check requestID
    app.route('/upload-file')
        .post(function (req, res) {
            var form = new Formidable.IncomingForm();
            // form.parse(req, function (err, fields, files) {
            //     if (err == null) {
            //         upload.uploadFile(req, fields, files, res, req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY]);
            //     }
            // });
            let files = [], fields = {}
            form
                .on('field', function (field, value) {
                    console.log(field, value);
                    fields[field] = value;
                })
                .on('file', function (field, file) {
                    console.log(field, file);
                    if (file.size)
                        files.push(file);
                })

            form.parse(req, function (err) {
                if (err == null) {
                    upload.uploadFile(req, fields, files = { images: files }, res, req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY]);
                }
            });
        });

    app.route('/uploadFile')
        .options(function (req, res) {
            res.send("true");
        });


    app.get('/update-url', upload.updateURL);
    app.post('/get-signed-url', upload.getSignedURL);
    app.route('/get-signed-url')
        .options(function (req, res) {
            res.send("true");
        });

    app.get('/create-thumbnail', upload.createThumbnail);
    /**
     * Error handling
     */

    app.use(function (err, req, res, next) {
        // treat as 404
        if (err.message
            && (~err.message.indexOf('not found')
            || (~err.message.indexOf('Cast to ObjectId failed')))) {
            return next();
        }
        console.error(err.stack);
        // error page
        res.status(500).send('500', {error: err.stack});
    });

    // assume 404 since no middleware responded
    app.use(function (req, res, next) {
        res.status(404).render('404', {
            url: req.originalUrl,
            error: 'Not found'
        });
    });


};
