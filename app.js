// Group 4
// Members:
// Anurag Chitnis - 801254404
// Ankita Marathe - 801208531

// require modules
const express = require("express");
const morgan = require("morgan");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const mainRoutes = require("./routes/mainRoute");
const tradeRoutes = require("./routes/tradeRoute");
const userRoutes = require("./routes/userRoutes");

// create application
const app = express();

// configure application
let port = 3500;
let host = "localhost";
app.set("view engine", "ejs");

// Connect to database
mongoose
  .connect("mongodb://localhost:27017/trade_merch", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    //start the server
    app.listen(port, host, () => {
      console.log("Server is running on port", port);
    });
  })
  .catch((err) => console.log(err.message));

// mount middleware

app.use(
  session({
    secret: "hdjjgjhgjg67866vvhgh",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: "mongodb://localhost:27017/trade_merch",
    }),
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.firstName = req.session.firstName || null;
  res.locals.errorMessages = req.flash("error");
  res.locals.successMessages = req.flash("success");
  next();
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(methodOverride("_method"));

// Routes
app.use("/", mainRoutes);
app.use("/trades", tradeRoutes);
app.use("/users", userRoutes);

// Errors
app.use((req, res, next) => {
  let err = new Error("The server can not locate " + req.url);
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  if (!err.status) {
    err.status = 500;
    err.message = "Internal Server Error";
  }

  res.status(err.status);
  res.render("error", { error: err });
});
