"use strict";

var ApiError = require('../utils/ApiError');
var errorHandler = function errorHandler(err, req, res, next) {
  var statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    statusCode: statusCode,
    success: false,
    message: err.message || "Internal Server Error"
  });
};
module.exports = errorHandler;