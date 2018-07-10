module.exports = function(sequelize, DataTypes) {
    var Account = sequelize.define('account', {
        accountno: {
            type: DataTypes.STRING,
            allowNull: false
        },
        institution: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        subtype: {
            type: DataTypes.STRING
        },
        user: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        accountid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        currentbalance: {
            type: DataTypes.DECIMAL(10, 2)
        },
        availablebalance: {
            type: DataTypes.DECIMAL(10, 2)
        },
        limit: {
            type: DataTypes.DECIMAL(10, 2)
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        subname: {
            type: DataTypes.STRING
        },
        currencycode: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false
    });

    return Account;
};