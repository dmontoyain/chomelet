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
        user: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        accountid: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false
    });

    return Account;
};