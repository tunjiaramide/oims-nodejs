const express = require("express");
const expressLayout = require("express-ejs-layouts");
const indexRoute = require("./routes/index");
const userRoute = require("./routes/user");

// define port
const PORT = process.env.PORT || 5000;

// initialize the app
const app = express();

//set view engine
app.use(expressLayout);
app.set("view engine", "ejs");

//routes

app.use("/", indexRoute);
app.use("/user", userRoute);

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
