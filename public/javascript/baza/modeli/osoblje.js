const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    const Osoblje = sequelize.define("osoblje", {
        IME: Sequelize.STRING,
        PREZIME: Sequelize.STRING,
        ULOGA: Sequelize.STRING
    });

    return Osoblje;
}