"use strict";

var express = require("express");
var router = express.Router();
var userController = require("../controllers/user.controller");
var authenticate = require("../middlewares/authenticate"); // JWT Middleware
var authorize = require("../middlewares/authorize"); // Role-based access control

/** ------------------------------
 * 📌 USER AUTHENTICATION ROUTES
 * ------------------------------- */
// ✅ User Registration (Public)
router.post("/register", userController.registerUser);

// ✅ Admin Registration (Only Super Admins can create Admins/Authors)
router.post("/register-admin", authenticate, authorize(["super_admin", "admin"]), userController.registerAdmin);

// ✅ User Login
router.post("/login", userController.loginUser);

// ✅ Change Password (Authenticated Users)
router.post("/change-password", authenticate, userController.changePassword);

/** ------------------------------
 * 📌 ADMIN & USER MANAGEMENT ROUTES
 * ------------------------------- */
// ✅ Get List of Admins (Super Admin Only)
router.get("/admin-list", authenticate, authorize(["super_admin"]), userController.getAdminList);

// ✅ Get List of Users (Admins & Super Admins)
router.get("/user-list", authenticate, authorize(["super_admin", "admin"]), userController.getUserList);

// ✅ Toggle User Active Status (Admins & Super Admins)
router.post("/toggle-user-status", authenticate, authorize(["super_admin", "admin"]), userController.toggleUserActiveStatus);

/** ------------------------------
 * 📌 USER SUBSCRIPTION ROUTES
 * ------------------------------- */
// ✅ Subscribe to an Author
router.put("/:id/subscribe", authenticate, userController.subscribeToAuthor);

// ✅ Unsubscribe from an Author
router.put("/:id/unsubscribe", authenticate, userController.unsubscribeFromAuthor);
module.exports = router;