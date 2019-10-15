const express = require("express");
const router = express.Router();
const Cat = require("../models/Cat");
const Product = require("../models/Product");

// home route
router.get("/", (req, res) => {
  res.render("index");
});

// List all Products with Pagination

router.get("/products/:page", (req, res) => {
  var perPage = 20;
  var page = req.params.page || 1;

  Cat.find({}).then(cats => {
    Product.find({})
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec()
      .then(products => {
        Product.countDocuments({})
          .then(count => {
            res.render("products", {
              cats,
              products,
              current: page,
              pages: Math.ceil(count / perPage)
            });
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  });
});

//List products by Category
router.get("/cat/:id", (req, res) => {
  let catName = req.params.id;
  Cat.find({}).then(cats => {
    Product.find({ category: catName }).then(products => {
      res.render("products-cat", {
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

// Edit Product
router.get("/product-detail/edit/:id", (req, res) => {
  var productId = req.params.id;
  Cat.find({})
    .then(cats => {
      Product.findOne({ _id: productId })
        .then(p => {
          res.render("edit-product", {
            id: p._id,
            productTitle: p.productTitle,
            manDate: p.manDate,
            expDate: p.expDate,
            color: p.color,
            imgUrl: p.imgUrl,
            priceWholesale: p.priceWholesale,
            priceRetail: p.priceRetail,
            barCode: p.barCode,
            sku: p.sku,
            stockLevel: p.stockLevel,
            size: p.size,
            weight: p.weight,
            catName: p.category,
            productDesc: p.productDesc,
            categories: cats
          });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

// Get add-Product form
router.get("/add-product", (req, res) => {
  Cat.find({})
    .then(cats => {
      res.render("add-product", {
        cats
      });
    })
    .catch(err => console.log(err));
});

//handle Add-Product form
router.post("/add-product", (req, res) => {
  console.log(req.body);
  res.redirect("/products/1");
});

// Update Product Single Product
router.post("/product-detail/edit/:id", (req, res, next) => {
  var productTitle = req.body.productTitle && req.body.productTitle.trim();
  var manDate = req.body.manDate && req.body.manDate.trim();
  var expDate = req.body.expDate && req.body.expDate.trim();
  var color = req.body.color && req.body.color.trim();
  var imgUrl = req.body.imgUrl && req.body.imgUrl.trim();
  var priceWholesale =
    req.body.priceWholesale && req.body.priceWholesale.trim();
  var priceRetail = req.body.priceRetail && req.body.priceRetail.trim();
  var barCode = req.body.barCode && req.body.barCode.trim();
  var sku = req.body.sku && req.body.sku.trim();
  var stockLevel = req.body.stockLevel && req.body.stockLevel.trim();
  var size = req.body.size && req.body.size.trim();
  var weight = req.body.weight && req.body.weight.trim();
  var category = req.body.category && req.body.category.trim();
  var productDesc = req.body.productDesc && req.body.productDesc.trim();

  console.log(req.body);

  Product.updateOne(
    { _id: req.params.id },
    {
      productTitle: productTitle,
      manDate: manDate,
      expDate: expDate,
      color: color,
      imgUrl: imgUrl,
      priceWholesale: priceWholesale,
      priceRetail: priceRetail,
      barCode: barCode,
      sku: sku,
      stockLevel: stockLevel,
      size: size,
      weight: weight,
      category: category,
      productDesc: productDesc
    },

    err => {
      if (err) console.log(err);

      req.flash("success_msg", "Product updated");
      res.redirect("product-detail");
    }
  );
});

module.exports = router;
