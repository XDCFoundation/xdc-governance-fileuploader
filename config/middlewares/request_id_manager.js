/**
 * Created by Sameerk on 17-10-2017.
 */
/**required files**/
const constants=require('../../app/common/constants');
/**require node modules**/
const uuid = require('uuid');

module.exports={checkRequestID};
/**
 * check for requestID in header
 * if no requestId add it
 * @param req
 * @param res
 * @param next
 */
function checkRequestID(req,res,next) {
    if(req.headers[constants.HEADER_KEY_REQUEST_ID_KEY])
        next();
    req.headers[constants.HEADER_KEY_REQUEST_ID_KEY]=uuid.v1();//unique ID
    next();
}