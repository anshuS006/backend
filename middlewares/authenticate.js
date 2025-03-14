"use strict";

var jwt = require('jsonwebtoken');
var ApiError = require('../utils/ApiError');
var authenticate = function authenticate(req, res, next) {
  var _req$headers$authoriz;
  var token = (_req$headers$authoriz = req.headers['authorization']) === null || _req$headers$authoriz === void 0 ? void 0 : _req$headers$authoriz.split(' ')[1]; // Extract Bearer token

  if (!token) {
    return next(new ApiError(403, "Token is required"));
  }
  try {
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request object
    next(); // Continue to the next middleware or route handler
  } catch (err) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};
module.exports = authenticate;