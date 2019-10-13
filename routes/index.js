const express = require("express");
const router = express.Router();
const Cat = require("../models/Cat");
const Product = require("../models/Product");

// home route
router.get("/", (req, res) => {
  res.render("index");
});

// List all Products
router.get("/products", (req, res) => {
  Cat.find({}).then(cats => {
    Product.find({})
      .limit(40)
      .then(products => {
        res.render("products", {
          cats,
          products
        });
      });
  });
});

//List products by Category
router.get("/products/:cat", (req, res) => {
  let catName = req.params.cat;
  Cat.find({}).then(cats => {
    Product.find({ category: catName }).then(products => {
      res.render("products", {
        cats,
        products
      });
    });
  });
});

//get Product details
router.get("/product-detail/:id", (req, res, next) => {
  var productId = req.params.id;
  Product.findOne({ _id: productId }).then(product => {
    product;
  });
});

module.exports = router;
