var db = require("../models");

module.exports = function (app) {
  // Load index page
  app.get("/", function (req, res) {
    // This will load title and description for each page separately=================================
    res.locals.metaTags = {
      title: "Fur Butlr",
      description: "A place where pet owners can find all thier needs in one place!",
      keywords: "pet grooming, pet sitting, pet walking, veterinarian services, kennel services, pet trainers, pet friendly parks"
    };
    res.render("index", {
      layout: "main"
    });
  });

  app.get("/signUp", function (req, res) {
    // This will load title and description for each page separately=================================
    res.locals.metaTags = {
      title: "Sign Up for Fur Butlr",
      description: "A place where pet owners can find all thier needs in one place!",
      keywords: "pet grooming, pet sitting, pet walking, veterinarian services, kennel services, pet trainers, pet friendly parks"
    };
    res.render("signUp", {
      layout: "main"
    });
  });

  // Load example page and pass in an example by id
  app.get("/example/:id", function (req, res) {
    db.Example.findOne({ where: { id: req.params.id } }).then(function (
      dbExample
    ) {
      res.render("example", {
        example: dbExample
      });
    });
  });

  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.render("404");
  });
};
