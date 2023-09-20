const express = require("express");
const db = require("./src/database");
const routes = require("./src/routes");
const signup = require("./src/signup");
const login = require("./src/login");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const session = require("express-session");
require("dotenv").config();

const app = express();

const secretKey = crypto.randomBytes(32).toString("hex");
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set(express.static("public"));

db.connect((err) => {
  if (err) {
    console.error("Error connecting to mysql database ", err);
  } else {
    console.log("Database connected");
  }
});

app.use("/", routes);
app.use("/signup", signup);
app.use("/login", login);
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session: ", err);
      return res.status(500).send("Internal Server Error");
    }
    res.redirect("/login");
  });
});

app.get("/data", (req, res) => {
  db.query("SELECT * FROM authentication", (err, results) => {
    if (err) {
      console.error("Error querying the database: ", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(results);
    }
  });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
