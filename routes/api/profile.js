const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load models
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route   GET api/profile/test
// @desc   Test profile route
// @access Public
router.get("/test", (request, response) =>
  response.json({ msg: "Profile works" })
);

// @route   Post api/profile
// @desc   Create or Edit user profile
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    // Get fields
    const profileFields = {};
    profileFields.user = request.user.id; // logged in user
    // check to see if fields have come in, if so set it to variable
    if (request.body.handle) profileFields.handle = request.body.handle;
    if (request.body.company) profileFields.company = request.body.company;
    if (request.body.website) profileFields.website = request.body.website;
    if (request.body.location) profileFields.location = request.body.location;
    if (request.body.bio) profileFields.bio = request.body.bio;
    if (request.body.status) profileFields.status = request.body.status;
    if (request.body.githubusername)
      profileFields.githubusername = request.body.githubusername;
    // Skills - Split into array
    if (typeof request.body.skills !== "undefined") {
      profileFields.skills = request.body.skills.split(",");
    }
    // Social
    profileFields.social = {};
    if (request.body.youtube)
      profileFields.social.youtube = request.body.youtube;
    if (request.body.linkedin)
      profileFields.social.linkedin = request.body.linkedin;
    if (request.body.facebook)
      profileFields.social.facebook = request.body.facebook;
    if (request.body.instagram)
      profileFields.social.instagram = request.body.instagram;
    if (request.body.twitter)
      profileFields.social.twitter = request.body.twitter;

    Profile.findOne({ user: request.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: request.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => {
          response.json(profile);
        });
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            response.status(400).json(errors);
          }

          // Save profile
          new Profile(profileFields).save().then(profile => {
            response.json(profile);
          });
        });
      }
    });
  }
);

//myspace.com/161404039/mixes/classic-my-photos-539405/photo/266723844

https: module.exports = router;
