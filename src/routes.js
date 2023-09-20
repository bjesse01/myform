const express = require("express");
const db = require("./database");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/home", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.redirect("/");
  }

  const insertQuery = "SELECT * FROM authentication WHERE id= ?";
  const values = [userId];

  db.query(insertQuery, values, (err, results) => {
    if (err) {
      console.error("Error querying database: ", err);
      return res.status(500).send("Internal Server Error");
    }

    if (results.length === 1) {
      const user = results[0];
      res.render("home", { user });
    } else {
      return res.status(404).send("User not found");
    }
  });
});

module.exports = router;
