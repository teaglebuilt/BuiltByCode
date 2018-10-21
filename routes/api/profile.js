const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load models
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// Load Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

// @route   GET api/profile/test
// @desc   Test profile route
// @access Public
router.get("/test", (request, response) =>
  response.json({ msg: "Profile works" })
);

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   GET api/profile/all
// @desc    GET all profiles
// @access  Public
router.get("/all", (request, response) => {
  const errors = {};

  Profile.find()
    .populate("user", ["user", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There are no profiles.";
        return response.status(404).json(errors);
      }
      response.json(profile);
    })
    .catch(err =>
      response.status(404).json({ profile: "There are no profiles." })
    );
});

// @route   GET api/profile/handle/:handle
// @desc    GET profile by handle
// @access  Public
router.get("/handle/:handle", (request, response) => {
  Profile.findOne({ handle: request.params.handle })
    .populate("user", ["user", "avatar"])
    .then(profile => {
      const errors = {};

      if (!profile) {
        errors.noprofile = "There is no profile for this user.";
        response.status(400).json(errors);
      }
      response.json(profile);
    })
    .catch(err => response.status(404).json(err));
});

// @route   GET api/profile/user/:user_id
// @desc    GET profile by user_id
// @access  Public
router.get("/user/:user_id", (request, response) => {
  const errors = {};

  Profile.findOne(request.params.user_id)
    .populate("user", ["user", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user.";
        response.status(400).json(errors);
      }
      response.json(profile);
    })
    .catch(err =>
      response
        .status(404)
        .json({ profile: "There is no profile for this user." })
    );
});

// @route   Post api/profile
// @desc   Create or Edit user profile
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validateProfileInput(request.body);
    // Check validation
    if (!isValid) {
      // Return any errors with 400 status
      return response.status(400).json(errors);
    }
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

// @route  DELETE api/profile
// @descr  Delete user and profile
// @access Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    Profile.findOneAndRemove({ user: request.user.id }).then(() => {
      User.findOneAndRemove({ _id: request.user.id }).then(() => {
        response.json({ success: true });
      });
    });
  }
);

// @route  POST api/profile/experience
// @descr  Add experience to profile
// @access Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validateExperienceInput(request.body);

    //Check validation
    if (!isValid) {
      response.status(400).json(errors);
    }
    // Find loggedin user
    Profile.findOne({ user: request.user.id }).then(profile => {
      // Populate with form data
      console.log("Hello");
      const newExp = {
        title: request.body.title,
        company: request.body.company,
        location: request.body.location,
        from: request.body.from,
        to: request.body.to,
        current: request.body.current,
        description: request.body.description
      };
      // Add experience to the beginning of array
      profile.experience.unshift(newExp);
      profile.save().then(profile => response.json(profile));
    });
  }
);

// @route  DELETE api/profile/experience/:exp_id
// @descr  Delete experience from profile
// @access Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    Profile.findOne({ user: request.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(request.params.exp_id);
        // Splice out of array
        profile.experience.splice(removeIndex, 1);
        // save
        profile.save().then(profile => response.json(profile));
      })
      .catch(err => response.status(404).json(err));
  }
);

// @route  POST api/profile/education
// @descr  Add education to profile
// @access Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const { errors, isValid } = validateEducationInput(request.body);

    if (!isValid) {
      return response.status(400).json(errors);
    }

    Profile.findOne({ user: request.user.id }).then(profile => {
      const newEdu = {
        school: request.body.school,
        degree: request.body.degree,
        fieldOfStudy: request.body.fieldOfStudy,
        from: request.body.from,
        to: request.body.to,
        current: request.body.current,
        description: request.body.description
      };
      profile.education.unshift(newEdu);
      profile.save().then(profile => response.json(profile));
    });
  }
);

// @route  DELETE api/profile/education/:edu_id
// @descr  Delete education from profile
// @access Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    // Get the edu index
    Profile.findOne({ user: request.user.id })
      .then(profile => {
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(request.params.edu_id);
        // Slice it out
        profile.education.splice(removeIndex, 1);
        profile.save().then(profile => response.json(profile));
      })
      .catch(err => response.status(404).json(err));
  }
);

module.exports = router;
