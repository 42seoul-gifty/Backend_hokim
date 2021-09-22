const { User, Orders } = require("../../models");
const Sequelize = require("../../models").Sequelize;
const sequelize = require("../../models").sequelize;

const getUserDetailPage = async (req, res) => {
  const user = await User.findOne({ where: { id: req.params.user_id } });
  const orders = await Orders.findAll({
    attributes: {
      include: [
        [
          Sequelize.fn(
            "date_format",
            Sequelize.col("Orders.createdAt"),
            "%Y-%m-%d %H:%i"
          ),
          "createdAt",
        ],
      ],
    },
    where: { user_id: req.params.user_id },
  });
  res.render("admin/userDetail", {
    layout: "layout/layout",
    csrfToken: req.csrfToken(),
    user,
    orders,
  });
};

const getUserPage = async (req, res) => {
  res.render("admin/userManage", {
    layout: "layout/layout",
    csrfToken: req.csrfToken(),
    page: req.query.page ? req.query.page : 0,
  });
};

const getAdminFilterdUser = async (req, res) => {
  try {
    const page = req.query.page ? req.query.page : 0;
    const limit = 2;

    const orderValue = [];
    if (req.query.value && req.query.order)
      orderValue.push([sequelize.literal(req.query.value), req.query.order]);
    const user = await User.findAll({
      attributes: {
        include: [
          [
            Sequelize.fn(
              "date_format",
              Sequelize.col("User.createdAt"),
              "%Y-%m-%d %H:%i"
            ),
            "createdAt",
          ],
          [
            Sequelize.fn("COUNT", Sequelize.col("Orders.user_id")),
            "order_count",
          ],
          [
            Sequelize.fn("SUM", Sequelize.col("Orders.paid_amount")),
            "order_amount",
          ],
        ],
      },
      include: [
        {
          model: Orders,
          attributes: [],
        },
      ],
      group: ["User.id"],
      raw: true,
      order: orderValue,
      offset: page * limit,
      limit: limit,
      subQuery: false,
    });

    var totalPage = await User.count({});

    totalPage =
      totalPage % limit == 0
        ? Math.floor(totalPage / limit) - 1
        : Math.floor(totalPage / limit);
    res.status(200).json({ success: true, user, page, totalPage });
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false, error: e.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    user = await User.update(
      { deleted: true },
      { where: { id: req.params.user_id } }
    );
    console.log(user);
    res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false, error: e.message });
  }
};

const restoreUser = async (req, res) => {
  try {
    user = await User.update(
      { deleted: false },
      { where: { id: req.params.user_id } }
    );
    console.log(user);
    res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false, error: e.message });
  }
};

module.exports = {
  deleteUser,
  restoreUser,
  getUserPage,
  getUserDetailPage,
  getAdminFilterdUser,
};
