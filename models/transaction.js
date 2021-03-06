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
            allowNull: false,
            defaultValue: 0.00
        },
        split: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        account: {
            type: DataTypes.STRING,
            allowNull: false
        },
        placecategory1: {
            type: DataTypes.STRING   
        },
        placecategory2: {
            type: DataTypes.STRING   
        },
        placecategory3: {
            type: DataTypes.STRING   
        }
    }, {
            timestamps: false
    });

    return Transaction;
}