const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
const router = express.Router();

const Post = require("../../models/Post");

const validatePostInput = require("../../validation/post");

// @route   GET api/posts/test
// @ desc   Test posts route
// @ access Public
router.get("/test", (request, response) =>
  response.json({ msg: "Posts works" })
);

// @route   POST api/posts/create
// @ desc   Create post
// @ access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validatePostInput(response.body);

    if (!isValid) {
      return response.status(400).json(errors);
    }
    const newPost = new Post({
      user: request.user.id,
      text: request.body.text,
      name: request.body.name,
      avatar: request.body.avatar
    });
    newPost.save().then(post => response.json(post));
  }
);

module.exports = router;
