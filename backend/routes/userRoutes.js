const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// protect is used here to ensure only logged-in users can search
router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser);

module.exports = router;