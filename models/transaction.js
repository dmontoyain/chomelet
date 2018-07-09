module.exports = function(sequelize, DataTypes) {
    var Transaction = sequelize.define('transaction', {
        transaction: {
            type: DataTypes.STRING,
            allowNull: false
        },
        place: {
            type: DataTypes.STRING,
            allowNull: false
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        split: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        account: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
            timestamps: false
    });

    return Transaction;
}