const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
const router = express.Router();

const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

const validatePostInput = require("../../validation/post");

// @route   GET api/posts/test
// @ desc   Test posts route
// @ access Public
router.get("/test", (request, response) =>
  response.json({ msg: "Posts works" })
);

// @route   GET api/posts
// @ desc   Get all posts
// @ access Public
router.get("/", (request, response) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => response.json(posts))
    .catch(err =>
      response.status(404).json({ nopostfound: "No posts found." })
    );
});

// @route   GET api/posts/:id
// @ desc   Get post by id
// @ access Public
router.get("/:id", (request, response) => {
  Post.findById(request.params.id)
    .then(post => response.json(post))
    .catch(err => response.status(404).json({ nopostfound: "No post found." }));
});

// @route   POST api/posts/create
// @ desc   Create post
// @ access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validatePostInput(request.body);

    if (!isValid) {
      return response.status(400).json(errors);
    }

    const newPost = new Post({
      text: request.body.text,
      name: request.body.name,
      avatar: request.body.avatar,
      user: request.user.id
    });
    newPost.save().then(post => response.json(post));
  }
);

// @route   DELETE api/posts/:id
// @ desc   Delete post
// @ access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    // Make sure user is owner of post
    Profile.findOne({ user: request.user.id }).then(profile =>
      Post.findById(request.params.id).then(post => {
        // Check for post owner
        if (post.user.toString() !== request.user.id) {
          return response
            .status(401)
            .json({ notauthorized: "User not authorized." });
        }
        // Delete
        Post.remove()
          .then(() => response.json({ success: true }))
          .catch(error =>
            response.status(404).json({ postnotfound: "No post found." })
          );
      })
    );
  }
);

// @route   POST api/posts/like/:id
// @ desc   Like post
// @ access Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    Post.findById(request.params.id)
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === request.user.id)
            .length > 0
        ) {
          return response
            .status(400)
            .json({ alreadyliked: "User has already liked this post." });
        }
        // Add user id to like array
        post.likes.unshift({ user: request.user.id });
        post.save().then(post => response.json(post));
      })
      .catch(error => response.status(404));
  }
);

// @route   POST api/posts/unlike/:id
// @desc    Unlike post
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "You have not yet liked this post" });
          }

          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validatePostInput(request.body);

    if (!isValid) {
      return response.status(400).json(errors);
    }

    Post.findById(request.params.id)
      .then(post => {
        const newComment = {
          text: request.body.text,
          name: request.body.name,
          avatar: request.body.avatar,
          user: request.user.id
        };
        // Add to comments array
        post.comments.unshift(newComment);
        post.save().then(post => response.json(post));
      })
      .catch(err =>
        response
          .status(404)
          .json({ commentnotfound: "Comment does not exist." })
      );
  }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete comment to post
// @access  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check to see if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: "Comment does not exist" });
        }

        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

module.exports = router;
