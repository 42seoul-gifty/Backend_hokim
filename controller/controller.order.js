const { getKoreaTime } = require("../lib/lib.getKoreaTime");
const { convertImageUrl } = require("../lib/lib.Product");
const {
  Orders,
  Receiver,
  Product,
  Price,
  User,
  ProductImage,
} = require("../models");
const { dataNotExist } = require("../lib/lib.checkError");
const { logger } = require("../config/winston");
const { convertReceiverResponse } = require("../lib/lib.receiver");

const getOrders = async (req, res) => {
  try {
    await dataNotExist("User", User, { id: req.params.user_id });
    var orders = await Orders.findAll({
      include: [
        {
          model: Receiver,
          attributes: [
            "id",
            "name",
            "phone",
            "postcode",
            "address",
            "detail_address",
          ],
          include: [
            {
              model: Product,
              attributes: [
                "id",
                "name",
                "description",
                "detail",
                "thumbnail",
                ["retail_price", "price"],
              ],
              include: [{ model: ProductImage, attributes: ["image_url"] }],
              attributes: [
                "id",
                "name",
                "description",
                "detail",
                "thumbnail",
                ["retail_price", "price"],
              ],
            },
          ],
        },
      ],
      where: { user_id: req.params.user_id },
      attributes: [
        "giver_name",
        "giver_phone",
        ["createdAt", "order_date"],
        "paid_amount",
        "status",
      ],
    });

    if (!orders) throw new Error(`Order not Exist`);

    orders = orders.map((order) => {
      order = order.toJSON();
      order["receiver"] = order.Receivers[0]
        ? convertReceiverResponse(order.Receivers[0])
        : null;
      delete order.Receivers;
      return order;
    });

    res.status(200).json({
      success: true,
      order: orders,
    });
  } catch (e) {
    logger.error(e);
    res.status(400).json({ success: false, error: e.message });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    var order = await Orders.findOne({
      include: [
        {
          model: Receiver,
          attributes: [
            "id",
            "name",
            "phone",
            "postcode",
            "address",
            "detail_address",
          ],
          include: [
            {
              model: Product,
              attributes: [
                "id",
                "name",
                "description",
                "detail",
                "thumbnail",
                ["retail_price", "price"],
              ],
              include: [{ model: ProductImage, attributes: ["image_url"] }],
              attributes: [
                "id",
                "name",
                "description",
                "detail",
                "thumbnail",
                ["retail_price", "price"],
              ],
            },
          ],
        },
      ],
      attributes: [
        "giver_name",
        "giver_phone",
        ["createdAt", "order_date"],
        "paid_amount",
        "status",
      ],
      where: { id: req.params.order_id, user_id: req.params.user_id },
    });

    if (!order) throw new Error(`Order not Exist`);

    order = order.toJSON();
    order["receiver"] = convertReceiverResponse(order.Receivers[0]);
    delete order.Receivers;

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    logger.error(e);
    res.status(400).json({ success: false, error: e.message });
  }
};

const postOrder = async (req, res) => {
  try {
    var price = await Price.findOne({
      where: { id: req.body.price },
    });

    if (!price) throw new Error(`Price not Exist`);
    const merchant_uid =
      req.params.user_id + "-" + getKoreaTime().toISOString();

    const order = await Orders.create({
      user_id: req.params.user_id,
      giver_name: req.body.giver_name,
      giver_phone: req.body.giver_phone,
      merchant_uid,
      paid_amount: price.toJSON().value,
      imp_uid: req.body.imp_uid,
    });
    await Receiver.create({
      name: req.body.receiver_name,
      phone: req.body.receiver_phone,
      order_id: order.toJSON().id,
      gender_id: req.body.gender,
      age_id: req.body.age,
      price_id: req.body.price,
    });

    res.status(200).json({
      success: true,
      merchant_uid,
    });
  } catch (e) {
    logger.error(e);
    res.status(400).json({ success: false, error: e.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Orders.findOne({
      where: { id: req.params.order_id, user_id: req.params.user_id },
    });
    if (!order) throw new Error(`Order not Exist`);
    if (order.status == "주문취소") throw new Error(`Order already Deleted`);
    //if (req.isAdmin) throw new Error(`Client can't delete paid order`);

    await Orders.update(
      { status: "주문취소" },
      {
        where: { id: req.params.order_id, user_id: req.params.user_id },
      }
    );

    res.status(200).json({
      success: true,
    });
  } catch (e) {
    logger.error(e);
    res.status(400).json({ success: false, error: e.message });
  }
};

module.exports = {
  postOrder,
  getOrders,
  getOrderDetail,
  deleteOrder,
};
