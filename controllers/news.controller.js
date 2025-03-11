const News = require("../models/news.model");
const User = require("../models/user.model");
const sendEmail = require("../config/email");

// SEARCH NEWS BY TITLE OR CONTENT
exports.searchNews = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "Search query is required" });

  try {
    const news = await News.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    }).populate("author", "name");

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// FILTER NEWS BY CATEGORY & AUTHOR
exports.filterNews = async (req, res) => {
  const { category, author } = req.query;
  let filter = {};

  if (category) filter.category = category;
  if (author) filter.author = author;

  try {
    const news = await News.find(filter).populate("author", "name");
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE NEWS & NOTIFY USERS
exports.createNews = async (req, res) => {
  const { title, content, category } = req.body;
  const image = req.file ? req.file.path : null;

  try {
    const news = new News({ title, content, image, category, author: req.user.id });
    await news.save();

    // Notify Subscribers
    const subscribers = await User.find({ subscriptions: req.user.userId }).select("email");
    const emails = subscribers.map((user) => user.email);
    if (emails.length > 0) {
      sendEmail(
        emails,
        `New Article Published: ${title}`,
        `Check out the latest news by ${req.user.name}: ${title}\n\n${content}`
      );
    }

    res.status(201).json({ message: "News published successfully & subscribers notified!", news });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL NEWS WITH PAGINATION
exports.getAllNews = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  try {
    const news = await News.find()
      .populate("author", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await News.countDocuments();
    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalNews: total,
      news,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET SINGLE NEWS
exports.getSingleNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate("author", "name");
    if (!news) return res.status(404).json({ message: "News not found" });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE NEWS (Only Author)
exports.updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    if (news.author.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    Object.assign(news, req.body);
    await news.save();
    res.json({ message: "News updated successfully", news });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE NEWS (Only Author)
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    if (news.author.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    await news.deleteOne();
    res.json({ message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// LIKE NEWS
exports.likeNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    news.likes += 1;
    await news.save();

    res.json({ message: "News liked!", likes: news.likes });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// COMMENT ON NEWS
exports.commentOnNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment cannot be empty" });

    const comment = { text, user: req.user.id };
    news.comments.push(comment);
    await news.save();

    res.json({ message: "Comment added!", comments: news.comments });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ Approve or Reject News
exports.approveNews = async (req, res) => {
    try {
      const { status } = req.body; // Expecting "approved" or "rejected"
      const { id } = req.params;
  
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
  
      const news = await News.findById(id);
      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }
  
      news.status = status;
      await news.save();
  
      res.status(200).json({ message: `News successfully ${status}`, news });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
