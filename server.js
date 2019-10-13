const express = require("express");
const expressLayout = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const indexRoute = require("./routes/index");
const userRoute = require("./routes/user");

// define port
const PORT = process.env.PORT || 5000;

// initialize the app
const app = express();

//mongo connection
const db = require("./config/keys").mongoURI;
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected..."))
  .catch(err => console.log(err));

//set view engine
app.use(expressLayout);
app.set("view engine", "ejs");

//bodyParser
app.use(express.urlencoded({ extended: false }));

// Session
app.use(
  session({
    secret: "petsmart oims",
    resave: false,
    saveUninitialized: false
  })
);

//connect flash
app.use(flash());

// global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.cart = req.session.cart;
  next();
});

//routes
app.use("/", indexRoute);
app.use("/user", userRoute);

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
