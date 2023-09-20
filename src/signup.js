const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const db = require("./database");
const bcrypt = require("bcryptjs");

router.get("/", (req, res) => {
  res.render("signup");
});

router.post(
  "/",
  [
    check("username", "This username must be 4+ characters long")
      .exists()
      .isLength({ min: 4 }),
    check("email", "email is not valid").isEmail().normalizeEmail(),
    check("password", "Password must be 6+ characters long")
      .exists()
      .isLength({ min: 6 })
      .custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
          throw new Error("Passwords don't match");
        }
        return true;
      }),
    check("confirmPassword"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(422).jsonp(errors.array());
      const alert = errors.array();
      res.render("signup", { alert });
    } else {
      const { firstName, lastName, username, phone, email, password } =
        req.body;
      try {
        const emailChecking = "SELECT * FROM authentication WHERE email = ?";
        const emailValue = [email];
        db.query(emailChecking, emailValue, async (emailErr, emailResults) => {
          if (emailErr) {
            console.error("Error checking email in database: ", emailErr);
            return res.status(500).send("Internal Server Error");
          }
          if (emailResults.length > 0) {
            return res.render("register", { error: "Email already in use" });
          }

          function randomGenerator() {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let randomLetter = letters.charAt(
              Math.floor(Math.random() * letters.length)
            );
            let randomNumbers = "";
            for (let i = 0; i < 4; i++) {
              const randomNumber = Math.floor(Math.random() * 10);
              randomNumbers += randomNumber;
            }
            return randomLetter + randomNumbers;
          }

          const uniqueId = randomGenerator();
          const hashPassword = await bcrypt.hash(password, 8);
          const insertQuery =
            "INSERT INTO authentication (id, firstname, lastname, username, email, phone, password) VALUES (?, ?, ?, ?, ?, ?, ?)";
          const values = [
            uniqueId,
            firstName,
            lastName,
            username,
            email,
            phone,
            hashPassword,
          ];
          db.query(insertQuery, values, (err, results) => {
            if (err) {
              console.error("Error querying the database: ", err);
              return;
            } else {
              console.log("Data has been inserted successfully: ", results);
              console.log(
                `${uniqueId}: ${firstName} ${lastName}, ${username}, ${phone}, ${email}, ${password}`
              );
              res.redirect("/login");
            }
          });
        });
      } catch (error) {
        console.error("Error hashing password: ", error);
        res.status(500).send("Error hashing password");
      }
    }
  }
);

module.exports = router;
