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
      .limit(300)
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
    res.render("product-detail", { product });
  });
});

//add cart to session
router.get("/cart/:id", (req, res) => {
  cartId = req.params.id;
  Product.find({ _id: cartId })
    .then(product => {
      if (typeof req.session.cart == "undefined") {
        req.session.cart = [];
        req.session.cart.push({
          title: product[0].productTitle,
          qty: 1,
          price: product[0].priceWholesale,
          id: product[0]._id
        });
      } else {
        var cart = req.session.cart;
        var newItem = true;

        for (let i = 0; i < cart.length; i++) {
          if (cart[i].id == cartId) {
            cart[i].qty++;
            newItem = false;
            break;
          }
        }
        if (newItem) {
          cart.push({
            title: product[0].productTitle,
            qty: 1,
            price: product[0].priceWholesale,
            id: product[0]._id
          });
        }
      }
      req.flash("success_msg", "Product Added to cart");
      res.redirect("/products");
    })
    .catch(err => console.log(err));
});

router.get("/checkout", (req, res) => {
  res.render("checkout", {
    cart: req.session.cart
  });
});

// Administration Section

// Admin Dasboard
router.get("/dashboard", (req, res) => {
  Product.countDocuments({}).then(c => {
    res.render("dashboard", {
      totalProducts: c
    });
  });
});

module.exports = router;
