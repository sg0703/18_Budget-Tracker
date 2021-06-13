const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

// bring in mongoose URL/password
require ('dotenv').config();

const PORT = process.env.PORT || 3500;

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/budget', {
  useNewUrlParser: true,
  useFindAndModify: false
})
.then(() => {
  console.log('Connected to MongodDB Atlas!');
  // routes
  app.use(require("./routes/api.js"));

  app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
  });
});

