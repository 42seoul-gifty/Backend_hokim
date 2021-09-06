const { Router } = require("express");
const router = Router();
const category = require("../controller/controller.adminCategory");
const filter = require("../controller/controller.adminFilter");
const adminPage = require("../controller/controller.adminPage");

router.get("/app", adminPage.getAppPage);

router.get("/product/manage", adminPage.getProductPage);
router.post("/product/filter", filter.getAdminFilterdProduct);

router.get("/product/detail/:product_id", adminPage.getProductDetailPage);
router.get("/product/edit/:product_id", adminPage.getProductEditPage);
router.patch("/product/edit/:product_id", filter.patchProductEditPage);

router.patch("/cateories", category.patchAllCategory);

router.get("/product/register", (req, res) => {
  res.render("../views/admin/productRegister.ejs", {});
});

router.get("/shipping", adminPage.getReceiverPage);
router.post("/shipping/filter", filter.getAdminFilterdReceiver);
router.patch("/shipping", filter.updateShipping);

router.get("/user", adminPage.getUserPage);
router.post("/user/filter", filter.getAdminFilterdUser);
router.delete("/user/:user_id", filter.removeUser);

module.exports = router;
