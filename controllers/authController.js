// authController.js
let express = require("express");
let passport = require("passport");
let router = express.Router();

const userModel = require("../models/user");
let User = userModel.User;

module.exports.displayHomePage = (req, res, next) => {
  res.render("index", {
    title: "Home",
    displayName: req.user ? req.user.displayName : "",
  });
};

module.exports.displayLoginPage = (req, res, next) => {
  if (!req.user) {
    res.render("auth/login", {
      title: "Login",
      message: req.flash("loginMessage"),
      displayName: req.user ? req.user.displayName : "",
    });
  } else {
    return res.redirect("/");
  }
};

module.exports.processLoginPage = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    //server error
    if (err) {
      return next(err);
    }
    //login error
    if (!user) {
      req.flash("loginMessage", "AuthenticationError");
      return res.redirect("/login");
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/claims");
    });
  })(req, res, next);
};

module.exports.displayRegisterPage = (req, res, next) => {
  //is logged in?
  if (!req.user) {
    res.render("auth/register", {
      title: "Register",
      message: req.flash("registerMessage"),
      displayName: req.user ? req.user.displayName : "",
    });
  } else {
    return res.redirect("/");
  }
};

module.exports.processRegisterPage = (req, res, next) => {
  let newUser = new User({
    username: req.body.username,
    //password: req.body.password,
    email: req.body.email,
    displayName: req.body.displayName,
  });
  User.register(newUser, req.body.password, (err) => {
    if (err) {
      console.log("Error: Instering the new user");

      if (err.name == "UserExistsError") {
        req.flash(
          "registerMessage",
          "Registration Error: User already exists."
        );
      }
      return res.render("auth/register", {
        title: "Register",
        message: req.flash("registerMessage"),
        displayName: req.user ? req.user.displayName : "",
      });
    } else {
      //not successful
      return passport.authenticate("local")(req, res, () => {
        res.redirect("/claims");
      });
    }
  });
};

module.exports.performLogout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.redirect("/");
};

module.exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};
