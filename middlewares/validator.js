const { body } = require("express-validator");
const { validationResult } = require("express-validator");

exports.validateId = (req, res, next) => {
  let item_id = req.params.id;
  if (item_id.match(/^[0-9a-fA-F]{24}$/)) {
    return next();
  } else {
    req.flash("error", "Invalid item id");
    return res.redirect("/trades");
  }
};

exports.validateSignUp = [
  body("firstName", "First name cannot be empty").notEmpty().trim().escape(),
  body("lastName", "Last name cannot be empty").notEmpty().trim().escape(),
  body("email", "Email must be a valid email address")
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  body(
    "password",
    "Password must be at least 8 characters and at most 64 characters"
  ).isLength({ min: 8, max: 64 }),
];

exports.validateLogIn = [
  body("email", "Email must be a valid email address")
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  body(
    "password",
    "Password must be at least 8 characters and at most 64 characters"
  ).isLength({ min: 8, max: 64 }),
];

exports.validateResult = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
      req.flash("error", error.msg);
    });
    return res.redirect("back");
  } else {
    return next();
  }
};

exports.validateItem = [
  body("category", "Category is required").notEmpty().trim().escape(),
  body("title", "Title is required").notEmpty().trim().escape(),
  body("details", "Details are required").notEmpty().trim().escape(),
  body("brand", "Brand is required").notEmpty().trim().escape(),
  body("color", "Color is required").notEmpty().trim().escape(),
];
