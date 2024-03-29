const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const upload = require("../services/img-upload");
const Cat = require("../models/Cat");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Gallery = require("../models/Gallery");
const Brand = require("../models/Brand");
const { ensureAuthenticated, ensureAdmin } = require("../config/auth");

// home route
router.get("/", (req, res) => {
  res.render("index");
});

router.get("/thank-you", (req, res) => {
  res.render("thank-you");
});
// List all Products with Pagination

router.get("/products/:page", ensureAuthenticated, (req, res) => {
  var perPage = 50;
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
router.get("/cat/:id", ensureAuthenticated, (req, res) => {
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

//List products by Brand
router.get("/brand/:id", ensureAuthenticated, (req, res) => {
  let brandName = req.params.id;
  Brand.find({}).then(brands => {
    Product.find({ brand: brandName }).then(products => {
      res.render("products-brand", {
        brands,
        products
      });
    });
  });
});

//get Product details
router.get("/product-detail/:id", ensureAuthenticated, (req, res, next) => {
  let productId = req.params.id;
  Product.findOne({ _id: productId }).then(product => {
    res.render("product-detail", { product });
  });
});

//add cart to session
router.get("/cart/:id", ensureAuthenticated, (req, res) => {
  let cartId = req.params.id;
  Product.find({ _id: cartId })
    .then(product => {
      if (typeof req.session.cart == "undefined") {
        req.session.cart = [];
        req.session.cart.push({
          title: product[0].productTitle,
          qty: 1,
          price: product[0].priceWholesale,
          barCode: product[0].barCode,
          imgUrl: product[0].imgUrl,
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
            barCode: product[0].barCode,
            imgUrl: product[0].imgUrl,
            id: product[0]._id
          });
        }
      }
      req.flash("success_msg", "Product Added to cart");
      res.redirect("/products/1");
    })
    .catch(err => console.log(err));
});

router.get("/checkout", ensureAuthenticated, (req, res) => {
  if (req.session.cart && req.session.cart.length == 0) {
    delete req.session.cart;
    res.redirect("/checkout");
  } else {
    res.render("checkout", {
      cart: req.session.cart
    });
  }
});

router.get("/clearcart", ensureAuthenticated, (req, res) => {
  delete req.session.cart;
  req.flash("success_msg", "Cart cleared");
  res.redirect("/products/1");
});

router.get("/cart/update/:id", ensureAuthenticated, (req, res) => {
  let cartId = req.params.id;
  let cart = req.session.cart;
  let action = req.query.action;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === cartId) {
      switch (action) {
        case "add":
          cart[i].qty++;
          break;
        case "delete":
          cart[i].qty--;
          if (cart[i].qty < 1) cart.splice(i, 1);
          break;
        case "clear":
          cart.splice(i, 1);
          if (cart.length === 0) delete req.session.cart;
          break;
        default:
          console.log("Update problem");
          break;
      }
      break;
    }
  }
  req.flash("success_msg", "Cart updated");
  res.redirect("/checkout");
});

//get order
router.get("/order", ensureAuthenticated, (req, res) => {
  let cartItems = req.session.cart;
  res.render("order", {
    cartItems
  });
});

//handle order
router.post("/order", ensureAuthenticated, async (req, res) => {
  let productItems = req.session.cart;
  let { paymentChoice, totalAmount } = req.body;
  let userName = req.user.name;
  let deliveryAddress = "No 16, Abuja Lagos";
  let user = req.user;
  let invNumb = 0;
  try {
    let lastOrder = await Order.find({})
      .sort({ _id: -1 })
      .limit(1);
    invNumb = parseInt(lastOrder[0].invNumb) + 1;
  } catch {
    invNumb = 100;
  }
  console.log(invNumb);

  let newOrder = Order({
    user,
    userName,
    deliveryAddress,
    productItems,
    totalAmount,
    invNumb,
    paymentChoice
  });

  newOrder.save(err => {
    if (err) console.log(err);
    delete req.session.cart;
    res.redirect("/payment-invoice");
  });
});

router.get("/payment-invoice", ensureAuthenticated, (req, res) => {
  let UserId = req.user._id;
  Order.find({ user: UserId })
    .then(orders => {
      let lastOrder = orders[orders.length - 1];
      res.render("payment-invoice", {
        order: lastOrder,
        user: req.user
      });
    })
    .catch(err => console.log(err));
});

// Administration Section

router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  let UserId = await req.user._id;
  let allOrders = await Order.find({}).sort({ _id: -1 });
  let totalOrders = await Order.countDocuments({});
  let singleOrders = await Order.find({ user: UserId });

  Product.countDocuments({}).then(c => {
    res.render("dashboard", {
      totalProducts: c,
      name: req.user.name,
      allOrders,
      singleOrders,
      totalOrders
    });
  });
});

// Edit Product
router.get("/product-detail/edit/:id", ensureAdmin, async (req, res) => {
  var productId = req.params.id;
  var brands = await Brand.find({});
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
            brandName: p.brand,
            productDesc: p.productDesc,
            categories: cats,
            brands
          });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

// Update Product Single Product
router.post("/product-detail/edit/:id", ensureAdmin, (req, res, next) => {
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
  var categories = [];
  categories = req.body.category;
  var brand = req.body.brand;
  var productDesc = req.body.productDesc && req.body.productDesc.trim();

  console.log(categories);

  var productId = mongoose.Types.ObjectId(req.params.id);
  if (mongoose.Types.ObjectId.isValid(productId)) {
    Product.updateOne(
      { _id: productId },
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
        category: categories,
        brand: brand,
        productDesc: productDesc
      },
      err => {
        if (err) console.log(err);

        req.flash("success_msg", "Product updated");
        res.redirect("/products/1");
      }
    );
  } else {
    console.log("Product ID not valid");
    req.flash("error_msg", "Product not updated");
    res.redirect("/products/1");
  }
});

// Get add-Product form
router.get("/add-product", ensureAdmin, (req, res) => {
  Cat.find({})
    .then(cats => {
      res.render("add-product", {
        cats
      });
    })
    .catch(err => console.log(err));
});

//handle Add-Product form
router.post("/add-product", ensureAdmin, (req, res) => {
  console.log(req.body);
  req.flash("error_msg", "Product Not added yet");
  res.redirect("/products/1");
});

//get image upload form
router.get("/img-upload", ensureAdmin, (req, res) => {
  res.render("img-upload");
});

//handle image upload
const singleUpload = upload.single("imgUrl");
router.post("/img-upload", ensureAdmin, (req, res) => {
  singleUpload(req, res, err => {
    if (err) console.log(err);
    const imgUrl = req.file.location;
    let newGallery = Gallery({ imgUrl });
    newGallery.save(err => {
      if (err) console.log(err);
      req.flash("success_msg", "File successfully uploaded");
      res.render("img-upload", {
        imgUrl
      });
    });
  });
});

router.get("/gallery", ensureAdmin, (req, res) => {
  Gallery.find({})
    .then(imgs => {
      res.render("gallery", {
        imgs
      });
    })
    .catch(err => console.log(err));
});

module.exports = router;
