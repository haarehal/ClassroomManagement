const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    const Termin = sequelize.define("termin", {
        REDOVNI: Sequelize.BOOLEAN,
        DAN: Sequelize.INTEGER,
        DATUM: Sequelize.STRING,
        SEMESTAR: Sequelize.STRING,
        POCETAK: Sequelize.TIME,
        KRAJ: Sequelize.TIME
    });

    return Termin;
}