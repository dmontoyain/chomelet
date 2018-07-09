module.exports = function(sequelize, DataTypes) {
    var Item = sequelize.define('item', {
       itemid: {
           type: DataTypes.STRING,
           allowNull: false
       },
       access_token: {
           type: DataTypes.STRING,
           allowNull: false
       },
       user: {
           type: DataTypes.INTEGER,
           allowNull: false
       },
       institution: {
           type: DataTypes.INTEGER,
           allowNull: false
       },
       date_created: {
           type: DataTypes.DATE,
           allowNull: false,
           defaultValue: DataTypes.NOW
       }
    }, {
           timestamps: false
    });

    return Item;
};