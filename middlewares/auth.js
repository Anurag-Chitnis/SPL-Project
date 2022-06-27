const Item = require("../models/item");

exports.isGuest = (req, res, next) => {
  if (!req.session.user) {
    return next();
  } else {
    req.flash("error", "You are logged in already");

    return res.redirect("/users/profile");
  }
};

exports.isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  } else {
    req.flash("error", "You need to log in first");

    return res.redirect("/users/login");
  }
};

exports.isOwner = (req, res, next) => {
  let id = req.params.id;

  Item.findById(id)
    .then((item) => {
      if (item) {
        if (item.owner == req.session.user) {
          return next();
        } else {
          req.flash("error", "Unauthorized to access the resource");
          return res.redirect("/trades");
        }
      }
    })
    .catch((err) => next(err));
};
