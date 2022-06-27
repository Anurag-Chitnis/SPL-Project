exports.index = (req, res) => {
  res.render("index");
};

exports.about = (req, res) => {
  res.render("./info/about");
};

exports.contact = (req, res) => {
  res.render("./info/contact");
};
