const express = require("express");
const {
  searchNews,
  filterNews,
  createNews,
  getAllNews,
  getSingleNews,
  updateNews,
  deleteNews,
  likeNews,
  commentOnNews,
  approveNews,  // ✅ New controller for admin approval
} = require("../controllers/news.controller");

const { upload } = require("../config/cloudinary");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const router = express.Router();

/** ------------------------------
 * 📌 PUBLIC ROUTES
 * ------------------------------- */
router.get("/search", searchNews);
router.get("/filter", filterNews);
router.get("/", getAllNews);
router.get("/:id", getSingleNews);

/** ------------------------------
 * 📌 AUTHOR-ONLY ROUTES
 * ------------------------------- */
router.post("/", authenticate, authorize(["author"]), upload.single("image"), createNews);
router.put("/:id", authenticate, authorize(["author"]), updateNews);
router.delete("/:id", authenticate, authorize(["author"]), deleteNews);

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
