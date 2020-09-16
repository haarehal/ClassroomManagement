const Sequelize = require('sequelize');

const db = {};
const sequelize = new Sequelize("exDB", "root", "", {
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false
});

// Definisanje database objekta
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.osoblje = sequelize.import(__dirname + "/modeli/osoblje.js");
db.rezervacija = sequelize.import(__dirname + "/modeli/rezervacija.js");
db.termin = sequelize.import(__dirname + "/modeli/termin.js");
db.sala = sequelize.import(__dirname + "/modeli/sala.js");

// Relacije modela/tabela
db.osoblje.hasMany(db.rezervacija, { foreignKey: 'osobaFK', as: 'rezervacijeOsoblja' }); // relacija [1 - *]
db.sala.hasMany(db.rezervacija, { foreignKey: 'salaFK', as: 'rezervacijeSale' }); // relacija [1 - *]
db.osoblje.hasOne(db.sala, { foreignKey: 'zaduzenaOsobaFK', as: 'salaOsoblja' }); // relacija [1 - 1]
db.termin.hasOne(db.rezervacija, { foreignKey: 'terminFK', as: 'terminRezervacije' }); // relacija [1 - 1]

module.exports = db;