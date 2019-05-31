var express = require("express");
var router = express.Router();
var db = require("../models");

// Bcrypt==========================
var bcrypt = require("bcrypt");

var hash = "$2b$10$69SrwAoAUNC5F.gtLEvrNON6VQ5EX89vNqLEqU655Oy9PeT/HRM/a";



//=======================================================================================

var redirectLogin = function (req, res, next) {
  console.log("REDIRECT SESSION: ", req.session);
  if (!req.session.userId) {
    res.redirect("/signUp");
  } else {
    next();
  }
};

router.get("/", function (req, res) {
  console.log("\n\nROUTER.GET SESSION: ", req.session);
  console.log("ROUTER.GET SESSION ID: ", req.session.id);
  console.log("ROUTER.GET userId: ", req.session.userId);

  // This will load title and description for each page separately=================================
  res.locals.metaTags = {
    title: "Fur Butlr",
    description: "A place where pet owners can find all their needs in one place!",
    keywords: "pet grooming, pet sitting, pet walking, veterinarian services, kennel services, pet trainers, pet friendly parks",
    bg: "index"
  };
  res.render("index", {
    layout: "main"
  });
});

router.get("/signUp", function (req, res) {
  // This will load title and description for each page separately=================================
  res.locals.metaTags = {
    title: "Sign Up for Fur Butlr",
    description: "A place where pet owners can find all their needs in one place!",
    keywords: "pet grooming, pet sitting, pet walking, veterinarian services, kennel services, pet trainers, pet friendly parks",
    bg: "sign-up"
  };
  res.render("signUp", {
    layout: "main"
  });
});

router.get("/userProfile", function (req, res) {
  console.log(req.query);
  console.log(req.query.id);
  var users = db.User.findAll({
    where: {
      id: req.query.id
    }
  });

  var pets = db.Pet.findAll({
    where: {
      // eslint-disable-next-line camelcase
      owner_id: req.query.id
    }
  });

  var reviews = db.Review.findAll({
    where: {
      // eslint-disable-next-line camelcase
      owner_id: req.query.id
    }
  });

  Promise
    .all([users, pets, reviews])
    .then(function (responses) {
      console.log("**********COMPLETE RESULTS****************");
      console.log(responses[0]); // user profile
      console.log(responses[1]); // all reports
      console.log(responses[2]); // report details
      res.render("userProfile", {
        users: responses[0],
        pets: responses[1],
        reviews: responses[2],
      });

    })
    .catch(function (err) {
      console.log("**********ERROR RESULT****************");
      console.log(err);
    });


});

router.get("/testChange", function (req, res) {
  console.log(req.query);
  console.log(req.query.id);
  var users = db.User.findAll({
    where: {
      id: req.query.id
    }
  });

  var pets = db.Pet.findAll({
    where: {
      // eslint-disable-next-line camelcase
      owner_id: req.query.id
    }
  });

  var reviews = db.Review.findAll({
    where: {
      // eslint-disable-next-line camelcase
      author_id: req.query.id
    }
  });

  Promise
    .all([users, pets, reviews])
    .then(function (responses) {
      console.log("**********COMPLETE RESULTS****************");
      console.log(responses[0]); // user profile
      console.log(responses[1]); // all reports
      console.log(responses[2]); // report details
      res.render("testChange", {
        users: responses[0],
        pets: responses[1],
        reviews: responses[2],
      });

    })
    .catch(function (err) {
      console.log("**********ERROR RESULT****************");
      console.log(err);
    });

});

router.get("/profileResults", function (req, res) {
  console.log(req.query);
  console.log(req.query.role);
  res.locals.metaTags = {
    title: "Matches for you!",
    description: "A place where pet owners can find all their needs in one place!",
    keywords: "pet grooming, pet sitting, pet walking, veterinarian services, kennel services, pet trainers, pet friendly parks",
    bg: "results"
  };
  db.User.findAll({
    where: {
      role: req.query.role
    }
  })
    .then(function (users) {
      res.render("results", { users: users });
    })
    .catch(function (err) {
      console.log(err);
    });
});



router.get("/results", function (req, res) {
  // This will load title and description for each page separately=================================
  res.locals.metaTags = {
    title: "Matches for you!",
    description: "A place where pet owners can find all their needs in one place!",
    keywords: "pet grooming, pet sitting, pet walking, veterinarian services, kennel services, pet trainers, pet friendly parks",
    bg: "results"
  };
  res.render("results", {
    layout: "main"

  });
});

router.get("/dashboard", redirectLogin, function (req, res) {
  // This will load title and description for each page separately=================================
  res.locals.metaTags = {
    title: "Your profile",
    description: "A place where pet owners can find all their needs in one place!",
    keywords: "pet grooming, pet sitting, pet walking, veterinarian services, kennel services, pet trainers, pet friendly parks",
    bg: "dashboard"
  };
  res.render("dashboard", {
    layout: "main"
  });
  console.log("DASHBOARD SESSION: ", req.session);
  console.log("DASHBOARD userId: ", req.session.userId);
  // Here is where to push info to front-end=================================================
  // or may have to make a post route for dashboard=========================================
});

// Render 404 page for any unmatched routes
router.get("*", function (req, res) {
  res.render("404");
});





//========================================================================================

// login route
router.post("/api/login", function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  console.log(password);
  console.log(email);

  console.log("\nlogin details: " + email + ", " + password + "\n");

  if (!email || !password) {
    console.log("No email/Pass");
    res.end();
  } else {
    db.User.findOne({
      where: {
        email: email
      }
      // Somewhere in here is where we need to perform encryption =========================
    }).then(function (dbUser) {
      console.log(dbUser);
      hash = dbUser.dataValues.password;
      console.log(hash);
      bcrypt
        .compare((password, hash, err, pwMatches) => {
          console.log("I'm the password manager", pwMatches);
          if (pwMatches) {
            console.log("dbUserPassword :", dbUser.dataValues.password);
            console.log("PASSWORD MATCHES");
            req.session.userId = dbUser.dataValues.id;
            console.log("SESSION Id: ", req.session.userId);
            res.send({ // Need to send message with userId to plug into handlebars and change login button/ hide sign-up button
              "code": 200,
              "success": "Login Successful"
            });
          } else {
            console.log("PASSWORD DOES NOT MATCH");
            res.end();
          }
        });

    });

  }
});

// Logout route
router.post("/api/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      return res.redirect("/dashboard");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
  console.log("LOGGED OUT");
});

module.exports = router;


