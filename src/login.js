const express = require("express");
const router = express.Router();
const db = require("./database");
const bcrypt = require("bcryptjs");

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  const insertQuery = "SELECT * FROM authentication WHERE username = ?";
  const values = [username];
  db.query(insertQuery, values, (err, results) => {
    if (err) {
      console.error("Error querying the database: ", err);
      return;
    }

    if (results.length === 1) {
      const user = results[0];
      bcrypt.compare(password, user.password, (compareErr, passwordMatch) => {
        if (compareErr) {
          console.error("Error comparing passwords: ", compareErr);
          return res.status(500).send("Internal Sever Error");
        }
        if (passwordMatch) {
          req.session.userId = user.id;
          res.redirect("/home");
        } else {
          res.render("login", { error: "Invalid username or password" });
        }
      });
    } else {
      return res.status(404).send("User not found");
    }
  });
});

module.exports = router;
