"use strict";

module.exports = function () {
  var roles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permission to perform this action'
      });
    }
    next();
  };
};