"use strict";

var express = require("express");
var _require = require("../controllers/news.controller"),
  healthCheck = _require.healthCheck,
  searchNews = _require.searchNews,
  filterNews = _require.filterNews,
  createNews = _require.createNews,
  getAllNews = _require.getAllNews,
  getSingleNews = _require.getSingleNews,
  updateNews = _require.updateNews,
  deleteNews = _require.deleteNews,
  likeNews = _require.likeNews,
  commentOnNews = _require.commentOnNews,
  approveNews = _require.approveNews;
var _require2 = require("../config/cloudinary"),
  upload = _require2.upload;
var authenticate = require("../middlewares/authenticate");
var authorize = require("../middlewares/authorize");
var router = express.Router();

/** ------------------------------
 * 📌 PUBLIC ROUTES
 * ------------------------------- */
router.get("/search", searchNews);
router.get("/health", healthCheck);
router.get("/filter", filterNews);
router.get("/", getAllNews);
router.get("/:id", getSingleNews);

/** ------------------------------
 * 📌 AUTHOR-ONLY ROUTES
 * ------------------------------- */
router.post("/", authenticate, authorize(["author"]), upload.single("image"), createNews);
router.put("/:id", authenticate, authorize(["author"]), updateNews);
router["delete"]("/:id", authenticate, authorize(["author"]), deleteNews);

/** ------------------------------
 * 📌 ADMIN-ONLY ROUTE FOR APPROVING NEWS
 * ------------------------------- */
// ✅ Approve or Reject News (Admin/Super Admin Only)
router.put("/:id/approve", authenticate, authorize(["super_admin", "admin"]), approveNews);

/** ------------------------------
 * 📌 USER INTERACTION ROUTES
 * ------------------------------- */
router.put("/:id/like", authenticate, likeNews);
router.put("/:id/comment", authenticate, commentOnNews);
module.exports = router;