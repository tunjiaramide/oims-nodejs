const express = require("express");
const expressLayout = require("express-ejs-layouts");
const mongoose = require("mongoose");
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

//routes

app.use("/", indexRoute);
app.use("/user", userRoute);

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
