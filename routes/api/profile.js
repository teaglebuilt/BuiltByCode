const express = require("express");
const router = express.Router();

// @route   GET api/profile/test
// @desc   Test profile route
// @access Public
router.get("/test", (request, response) =>
  response.json({ msg: "Profile works" })
);

module.exports = router;
