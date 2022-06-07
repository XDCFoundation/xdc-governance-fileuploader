'use strict';
const Constants=require('../../app/common/constants');
const Utility=require('../../app/utils/index');
/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
    Utility.LHTLog('requiresLogin','start',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:req.body},"Ayush",req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY],Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);

    if (req.isAuthenticated()){
        Utility.LHTLog('requiresLogin','end',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:req.body},"Ayush",req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY],Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);
        return next();
    }
  if (req.method == 'GET') req.session.returnTo = req.originalUrl;
    Utility.LHTLog('requiresLogin','end:redirect to login',{type:Constants.LOG_OPERATION_TYPE.FUNCTIONAL,data:{method:req.method,originalUrl:req.originalUrl,session:req.session}},"Ayush",req.headers[Constants.HEADER_KEY_REQUEST_ID_KEY],Constants.LOG_LEVEL_TYPE.INFO,Constants.CURRENT_TIMESTAMP);
    res.redirect('/login');
};

/*
 *  User authorization routing middleware
 */


