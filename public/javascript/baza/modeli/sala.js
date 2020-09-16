const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    const Sala = sequelize.define("sala", {
        NAZIV: Sequelize.STRING
    });

    return Sala;
}