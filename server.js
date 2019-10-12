const express = require("express");

// define port
const PORT = process.env.PORT || 5000;

// initialize the app
const app = express();

//routes
app.get("/", (req, res) => {
  res.send("Welcome to OIMS");
});

app.listen(PORT, () => {
  console.log(`PORT running on PORT ${PORT}`);
});
