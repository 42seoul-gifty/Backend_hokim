module.exports = (sequelize, DataTypes) => {
  const PreferencePrice = sequelize.define(
    "PreferencePrice",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      value: { type: DataTypes.STRING, comment: "price name" },
      retail_price: { type: DataTypes.INTEGER, comment: "retail price" },
    },
    {
      tableName: "PreferencePrice",
    }
  );

  PreferencePrice.associate = (models) => {
    PreferencePrice.hasMany(models.Preference, {
      foreignKey: "price_id",
    });
  };

  return PreferencePrice;
};
