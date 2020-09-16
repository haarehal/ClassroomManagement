const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require("express-session");
const UAParser = require('ua-parser-js');
const IP = require("ip");
const db = require(__dirname + '/public/javascript/baza/db.js');

const app = express();
const port = 8080;
const IDrez = 2; // dvije pocetne rezervacije u bazi
const promjena = false;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
//app.use(express.static('public/css'));
app.use(express.static('public/html'));
//app.use(express.static('public/images'));
app.use(express.static('public/javascript'));
app.use(express.static('public/json'));
app.use(session({
    secret: "mojaSifra123456",
    resave: true,
    saveUninitialized: true
}));

db.sequelize.sync({ force: true }).then(function () {
    inicijalizirajTabele().then(function () {
        console.log("Završeno kreiranje tabela sa početnim podacima!");
        //process.exit();
    });
});

function ispitajVanrednaZauzeca(zauzeca, danRedni, mjesec, pocetak, kraj, sala) {
    for (let i = 0; i < zauzeca.vanredna.length; i++) {
        let z = zauzeca.vanredna[i];
        let datumJSON = z.datum;
        let pocetakJSON = z.pocetak;
        let krajJSON = z.kraj;
        let nazivJSON = z.naziv;

        datumJSON = datumJSON.split('.');

        let danJSON = datumJSON[0];
        if (danJSON[0] === "0") danJSON = danJSON[1]; // "1",...,"31"

        let mjesecJSON = datumJSON[1];
        if (mjesecJSON[0] === "0") mjesecJSON = mjesecJSON[1]; // "1",...,"12"

        if (danRedni == danJSON && mjesec == mjesecJSON && pocetak === pocetakJSON && kraj === krajJSON && sala === nazivJSON) {
            return true;
        }
    }

    return false;
}

function inicijalizirajTabele() {
    var osobljeListaPromisea = [];
    var rezervacijeListaPromisea = [];
    var saleListaPromisea = [];
    var terminiListaPromisea = [];

    return new Promise(function (resolve, reject) {
        rezervacijeListaPromisea.push(db.rezervacija.create({}));
        rezervacijeListaPromisea.push(db.rezervacija.create({}));

        Promise.all(rezervacijeListaPromisea).then(function (rezervacije) {
            var rezervacija1 = rezervacije.filter(function (r) { return r.id === 1; })[0];
            var rezervacija2 = rezervacije.filter(function (r) { return r.id === 2; })[0];

            saleListaPromisea.push(db.sala.create({ NAZIV: '1-11' }).then(function (s) {
                return s.setRezervacijeSale([rezervacija1, rezervacija2]);
            }));
            saleListaPromisea.push(db.sala.create({ NAZIV: '1-15' }));

            Promise.all(saleListaPromisea).then(function (sale) {
                var sala1 = sale.filter(function (s) { return s.NAZIV === '1-11'; })[0];
                var sala2 = sale.filter(function (s) { return s.NAZIV === '1-15'; })[0];

                osobljeListaPromisea.push(db.osoblje.create({ IME: 'Neko', PREZIME: 'Nekić', ULOGA: 'profesor' }).then(function (o) {
                    return o.setRezervacijeOsoblja([rezervacija1]).then(function () {
                        return o.setSalaOsoblja(sala1).then(function () {
                            return new Promise(function (resolve, reject) { resolve(o); });
                        });
                    });
                }));
                osobljeListaPromisea.push(db.osoblje.create({ IME: 'Drugi', PREZIME: 'Neko', ULOGA: 'asistent' }).then(function (o) {
                    return o.setSalaOsoblja(sala2).then(function () {
                        return new Promise(function (resolve, reject) { resolve(o); });
                    });
                }));
                osobljeListaPromisea.push(db.osoblje.create({ IME: 'Test', PREZIME: 'Test', ULOGA: 'asistent' }).then(function (o) {
                    return o.setRezervacijeOsoblja([rezervacija2]).then(function () {
                        return new Promise(function (resolve, reject) { resolve(o); });
                    });
                }));

                Promise.all(osobljeListaPromisea).then(function (osoblje) {
                    terminiListaPromisea.push(db.termin.create({ REDOVNI: false, DAN: null, DATUM: '01.01.2020', SEMESTAR: null, POCETAK: '12:00', KRAJ: '13:00' }).then(function (t) {
                        return t.setTerminRezervacije(rezervacija1).then(function () {
                            return new Promise(function (resolve, reject) { resolve(t); });
                        });
                    }));
                    terminiListaPromisea.push(db.termin.create({ REDOVNI: true, DAN: 0, DATUM: null, SEMESTAR: 'zimski', POCETAK: '13:00', KRAJ: '14:00' }).then(function (t) {
                        return t.setTerminRezervacije(rezervacija2).then(function () {
                            return new Promise(function (resolve, reject) { resolve(t); });
                        });
                    }));

                    Promise.all(terminiListaPromisea).then(function (termini) {
                        resolve(termini);

                    }).catch(function (err) { console.log("Termin greška " + err); });
                }).catch(function (err) { console.log("Osoblje greška " + err); });
            }).catch(function (err) { console.log("Sale greška " + err); });
        }).catch(function (err) { console.log("Rezervacije greška " + err); });
    });
}

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/html/pocetna.html');
});
app.get('/zauzeca.json', function (req, res) {
    fs.readFile(__dirname + '/public/json/zauzeca.json', function (err, data) {
        if (err) throw err;
        let zauzeca = JSON.parse(data); // JSON objekat

        res.json(zauzeca);
    });
});
/* app.post('/zauzeca.json', function (req, res) {
    let sala = req.body["sala"]; // "XXY"
    let pocetak = req.body["pocetak"]; // "HH:MM"
    let kraj = req.body["kraj"]; // "HH:MM"
    let periodicnaRez = req.body["periodicnaRez"]; // true ili false
    let mjesec = req.body["mjesec"]; // 0,...,11
    let danRedni = req.body["danRedni"]; // "1",...,"31" - redni broj dana na koji je kliknuto
    let dan = req.body["dan"]; // 0,...,6 - dan [ponedjeljak,...,nedjelja] kojem pripada kliknuti redni broj dana

    let semestar;
    if (mjesec === 9 || mjesec === 10 || mjesec === 11 || mjesec === 0) semestar = "zimski";
    else if (mjesec === 1 || mjesec === 2 || mjesec === 3 || mjesec === 4 || mjesec === 5) semestar = "ljetni";

    fs.readFile(__dirname + '/public/json/zauzeca.json', function (err, data) {
        if (err) throw err;

        let zauzeca = JSON.parse(data);
        mjesec = mjesec + 1; // 1,...,12

        // Ispitivanje zauzeca
        let postojiZauzece = false;
        // Ispitivanje da li postoji periodicno zauzece
        for (let i = 0; i < zauzeca.periodicna.length; i++) {
            let z = zauzeca.periodicna[i];
            let danJSON = z.dan;
            let semestarJSON = z.semestar;
            let pocetakJSON = z.pocetak;
            let krajJSON = z.kraj;
            let nazivJSON = z.naziv;

            if (dan == danJSON && semestar === semestarJSON && pocetak === pocetakJSON && kraj === krajJSON && sala === nazivJSON) {
                postojiZauzece = true;
                break;
            }
        }
        // Ako nije pronadjeno nijedno periodicno zauzece, ispitujemo vanredna zauzeca
        if (postojiZauzece === false) {
            if (periodicnaRez) { // Specijalni slucaj: pokusaj periodicne rezervacije dok u istom danu [ponedjeljak,...,nedjelja] neke sedmice bi moglo postojati vanredno zauzece
                let dR1 = parseInt(danRedni); // min 1
                let dR2 = dR1; // max 31
                for (let i = 0; i < 6; i++) { // postoji 5, odnosno max 6 sedmica
                    if (!((dR2 + 7 > 31 && (mjesec === 1 || mjesec === 3 || mjesec === 5 || mjesec === 7 || mjesec === 8 || mjesec === 10 || mjesec === 12))
                        || (dR2 + 7 > 30 && (mjesec === 4 || mjesec === 6 || mjesec === 9 || mjesec === 11))
                        || (dR2 + 7 > 28 && (mjesec === 2)))) dR2 += 7;
                    if (!(dR1 - 7 < 1)) dR1 -= 7;
                }

                do {
                    postojiZauzece = ispitajVanrednaZauzeca(zauzeca, dR1, mjesec, pocetak, kraj, sala);
                    if (postojiZauzece == true) break;
                    dR1 += 7;
                }
                while (dR1 <= dR2);
            }
            else {
                postojiZauzece = ispitajVanrednaZauzeca(zauzeca, danRedni, mjesec, pocetak, kraj, sala);
            }
        }

        if (danRedni < 10) danRedni = "0" + danRedni;
        if (mjesec < 10) mjesec = "0" + mjesec;

        // Slanje poruke o greski
        if (postojiZauzece) {
            return res.status(400).send({
                "poruka": "Nije moguće rezervisati salu " + sala + " za navedeni datum " + danRedni + "/" + mjesec + "/" + "2019 i termin od " + pocetak + " do " + kraj + "!"
            });
        }
        // Upisivanje zauzeca
        else {
            if (periodicnaRez) {
                zauzeca.periodicna.push({ dan: dan, semestar: semestar, pocetak: pocetak, kraj: kraj, naziv: sala, predavac: "%nepoznato%" });
            }
            else {
                let datum = danRedni + "." + mjesec + "." + "2019";
                zauzeca.vanredna.push({ datum: datum, pocetak: pocetak, kraj: kraj, naziv: sala, predavac: "%nepoznato%" });
            }

            zauzeca = JSON.stringify(zauzeca);

            fs.writeFile(__dirname + '/public/json/zauzeca.json', zauzeca, function (err) {
                if (err) throw err;
                res.json(zauzeca);
            });
        }
    });
}); */
app.get('/slike', function (req, res) {
    fs.readdir(__dirname + "/public/images/images-pocetna", function (err, files) {
        if (err) throw err;

        let g1, g2;
        let slike = [];
        let ukupanBrSlika = files.length;

        if (req.session.g1 == null || req.session.g1 >= ukupanBrSlika || req.query.d == 0) {
            req.session.g1 = 0; // donja granica niza files
            req.session.g2 = 3; // gornja granica niza files
        }

        g1 = req.session.g1;
        g2 = req.session.g2;

        for (let i = g1; i < g2; i++) { // slike ce sadrzavati tacan broj naziva slika koliko ih je i preostalo u files pri svakom pozivu
            if (i > ukupanBrSlika - 1) break;
            slike.push(files[i]);
        }

        g1 += 3;
        g2 += 3;
        req.session.g1 = g1;
        req.session.g2 = g2;

        res.json({ slike: slike, ukupanBrSlika: ukupanBrSlika });
    });
});
app.post('/posjetioci.json', function (req, res) {
    fs.readFile(__dirname + '/public/json/posjetioci.json', function (err, data) {
        if (err) throw err;

        let p = JSON.parse(data);

        // Detekcija IP adrese (IPv4) posjetioca
        let ip = IP.address();

        // Detekcija browser-a od posjetioca
        var parser = new UAParser();
        var ua = req.headers['user-agent'];
        var pretrazivac = parser.setUA(ua).getBrowser().name;

        let postojiPosjetioc = false;
        for (let i = 0; i < p.posjetioci.length; i++) {
            if (p.posjetioci[i].ip == ip && p.posjetioci[i].pretrazivac == pretrazivac) {
                postojiPosjetioc = true;
                break;
            }
        }

        if (!postojiPosjetioc) p.posjetioci.push({ ip: ip, pretrazivac: pretrazivac });

        var posjetioci = p.posjetioci;
        p = JSON.stringify(p);

        fs.writeFile(__dirname + '/public/json/posjetioci.json', p, function (err) {
            if (err) throw err;

            res.send(posjetioci);
        });
    });
});
app.get('/osoblje', function (req, res) {
    db.osoblje.findAll().then(function (o) {
        var osoblje = [];
        for (let i = 0; i < o.length; i++) {
            var osoba = {};
            osoba.ime = o[i].IME;
            osoba.prezime = o[i].PREZIME;
            osoba.uloga = o[i].ULOGA;
            osoblje.push(osoba);
        }

        res.json(JSON.stringify(osoblje));
    });
});
app.get('/rezervacije', function (req, res) {
    var zauzeca = [];
    db.termin.findAll().then(function (termini) {
        var br = 0;
        termini.forEach(tn => {
            //console.log(termin.REDOVNI + "|" + termin.DAN + "|" + termin.DATUM + "|" + termin.SEMESTAR + "|" + termin.POCETAK + "|" + termin.KRAJ);
            tn.getTerminRezervacije().then(function (r) {
                db.sala.findOne({ where: { id: r.salaFK } }).then(function (s) {
                    db.osoblje.findOne({ where: { id: r.osobaFK } }).then(function (o) {
                        zauzeca.push({ periodicnaRez: tn.REDOVNI, dan: tn.DAN, datum: tn.DATUM, semestar: tn.SEMESTAR, pocetak: tn.POCETAK, kraj: tn.KRAJ, sala: s.NAZIV});
                        if (br === termini.length - 1) res.send(zauzeca);
                        br++;
                    });
                });
            });
        });
    });
});
app.post('/rezervacije', function (req, res) {
    let zauzeca = req.body["zauzecaIzBaze"];
    let sala = req.body["sala"]; // "XXY"
    let pocetak = req.body["pocetak"]; // "HH:MM"
    let kraj = req.body["kraj"]; // "HH:MM"
    let periodicnaRez = req.body["periodicnaRez"]; // true ili false
    let mjesec = req.body["mjesec"]; // 0,...,11
    let danRedni = req.body["danRedni"]; // "1",...,"31" - redni broj dana na koji je kliknuto
    let dan = req.body["dan"]; // 0,...,6 - dan [ponedjeljak,...,nedjelja] kojem pripada kliknuti redni broj dana
    let osoba = req.body["osoba"]; // "Ime Prezime,uloga"
    osoba = osoba.split(","); // ['Ime Prezime','uloga']
    let uloga = osoba[1]; // 'uloga'
    osoba = osoba[0]; // 'Ime Prezime'
    let ime_prezime = osoba.split(" "); // ['Ime','Prezime']
    let ime = ime_prezime[0]; // 'Ime'
    let prezime = ime_prezime[1]; // 'Prezime'
    let datum;
    let semestar;
    if (mjesec === 9 || mjesec === 10 || mjesec === 11 || mjesec === 0) semestar = "zimski";
    else if (mjesec === 1 || mjesec === 2 || mjesec === 3 || mjesec === 4 || mjesec === 5) semestar = "ljetni";

    mjesec = mjesec + 1; // 1,...,12

    // Ispitivanje zauzeca
    let postojiZauzece = false;
    // Ispitivanje da li postoji periodicno zauzece
    for (let i = 0; i < zauzeca.periodicna.length; i++) {
        let z = zauzeca.periodicna[i];
        let danJSON = z.dan;
        let semestarJSON = z.semestar;
        let pocetakJSON = z.pocetak;
        let krajJSON = z.kraj;
        let nazivJSON = z.naziv;

        if (dan == danJSON && semestar === semestarJSON && pocetak === pocetakJSON && kraj === krajJSON && sala === nazivJSON) {
            postojiZauzece = true;
            break;
        }
    }
    // Ako nije pronadjeno nijedno periodicno zauzece, ispitujemo vanredna zauzeca
    if (postojiZauzece === false) {
        if (periodicnaRez) { // Specijalni slucaj: pokusaj periodicne rezervacije dok u istom danu [ponedjeljak,...,nedjelja] neke sedmice bi moglo postojati vanredno zauzece
            let dR1 = parseInt(danRedni); // min 1
            let dR2 = dR1; // max 31
            for (let i = 0; i < 6; i++) { // postoji 5, odnosno max 6 sedmica
                if (!((dR2 + 7 > 31 && (mjesec === 1 || mjesec === 3 || mjesec === 5 || mjesec === 7 || mjesec === 8 || mjesec === 10 || mjesec === 12))
                    || (dR2 + 7 > 30 && (mjesec === 4 || mjesec === 6 || mjesec === 9 || mjesec === 11))
                    || (dR2 + 7 > 28 && (mjesec === 2)))) dR2 += 7;
                if (!(dR1 - 7 < 1)) dR1 -= 7;
            }

            do {
                postojiZauzece = ispitajVanrednaZauzeca(zauzeca, dR1, mjesec, pocetak, kraj, sala);
                if (postojiZauzece == true) break;
                dR1 += 7;
            }
            while (dR1 <= dR2);
        }
        else {
            postojiZauzece = ispitajVanrednaZauzeca(zauzeca, danRedni, mjesec, pocetak, kraj, sala);
        }
    }

    if (danRedni < 10) danRedni = "0" + danRedni;
    if (mjesec < 10) mjesec = "0" + mjesec;

    // Slanje poruke o greski
    if (postojiZauzece) {
        return res.status(400).send({
            "poruka": "Nije moguće rezervisati salu " + sala + " za navedeni datum " + danRedni + "/" + mjesec + "/" + "2020 i termin od " + pocetak + " do " + kraj + "!"
        });
    }
    // Upisivanje zauzeca
    else {
        if (periodicnaRez) {
            datum = null;
            zauzeca.periodicna.push({ dan: dan, semestar: semestar, pocetak: pocetak, kraj: kraj, naziv: sala, predavac: osoba });
        }
        else {
            semestar = null;
            datum = danRedni + "." + mjesec + "." + "2020";
            zauzeca.vanredna.push({ datum: datum, pocetak: pocetak, kraj: kraj, naziv: sala, predavac: osoba });
        }

        db.termin.findOrCreate({ where: { REDOVNI: periodicnaRez, DAN: dan, DATUM: datum, SEMESTAR: semestar, POCETAK: pocetak, KRAJ: kraj } }).then(function (t) {
            t = t[0];
            db.rezervacija.create({}).then(function (r) {
                t.setTerminRezervacije(r);
                db.sala.findOrCreate({ where: { NAZIV: sala } }).then(function (s) {
                    s = s[0];
                    s.setRezervacijeSale(r);
                    db.osoblje.findOrCreate({ where: { IME: ime, PREZIME: prezime, ULOGA: uloga } }).then(function (o) {
                        o = o[0];
                        o.setRezervacijeOsoblja(r);
                        res.send();
                    });
                });
            });
        });
    }
});
app.get('/osobe', function (req, res) {
    var datum = new Date();

    var minute = datum.getMinutes(); // 0,1,2,...,59
    if (minute < 10) minute = "0" + minute;

    var sat = datum.getHours(); // 0,...,23
    if (sat < 10) sat = "0" + sat;

    var dan = datum.getDay(); // 1,...,7
    if (dan === 0) dan = 6; // 6
    else dan--; // 0,...,5

    var danRedni = datum.getDate(); // 1,...,31
    if (danRedni < 10) danRedni = "0" + danRedni;

    var mjesec = datum.getMonth(); // 0,...,11
    let semestar;
    if (mjesec === 9 || mjesec === 10 || mjesec === 11 || mjesec === 0) semestar = "zimski";
    else if (mjesec === 1 || mjesec === 2 || mjesec === 3 || mjesec === 4 || mjesec === 5) semestar = "ljetni";
    mjesec++; // 1,...12
    if (mjesec < 10) mjesec = "0" + mjesec;

    var godina = datum.getFullYear(); // yyyy

    datum = danRedni + "." + mjesec + "." + godina;
    vrijeme = sat + ":" + minute;

    db.termin.findAll().then(function (termini) {
        var br = 0;
        var saleOsoblja = [];
        termini.forEach(t => {
            t.getTerminRezervacije().then(function (r) {
                db.sala.findOne({ where: { id: r.salaFK } }).then(function (s) {
                    db.osoblje.findOne({ where: { id: r.osobaFK } }).then(function (o) {
                        if (br === termini.length - 1) { res.send(JSON.stringify(saleOsoblja)); }

                        var so = {};
                        var rezervisano = false;

                        if (t.REDOVNI == false) {
                            var dt = t.DATUM;
                            var vr = t.POCETAK;
                            var poc = vr[0] + vr[1] + vr[2] + vr[3] + vr[4];
                            vr = t.KRAJ;
                            var kr = vr[0] + vr[1] + vr[2] + vr[3] + vr[4];

                            var dat = godina + "-" + mjesec + "-" + danRedni + "T" + sat + ":" + minute;
                            var dat1 = dt[6] + dt[7] + dt[8] + dt[9] + "-" + dt[3] + dt[4] + "-" + dt[0] + dt[1] + "T" + poc;
                            var dat2 = dt[6] + dt[7] + dt[8] + dt[9] + "-" + dt[3] + dt[4] + "-" + dt[0] + dt[1] + "T" + kr;

                            if (poklapanjeDatumaIVremena(dat, dat1, dat2)) rezervisano = true;
                        }
                        else {
                            if (dan == t.DAN && semestar == t.SEMESTAR) {
                                var vr = t.POCETAK;
                                var poc = vr[0] + vr[1] + vr[2] + vr[3] + vr[4];
                                vr = t.KRAJ;
                                var kr = vr[0] + vr[1] + vr[2] + vr[3] + vr[4];

                                var dat = "1999-01-01T" + sat + ":" + minute; // datum nebitan
                                var dat1 = "1999-01-01T" + poc; // datum nebitan
                                var dat2 = "1999-01-01T" + kr; // datum nebitan

                                if (poklapanjeDatumaIVremena(dat, dat1, dat2)) rezervisano = true;
                            }
                        }

                        if (rezervisano) {
                            so.imePrezime = o.IME + " " + o.PREZIME;
                            so.sala = s.NAZIV;
                        }
                        else {
                            so.imePrezime = o.IME + " " + o.PREZIME;
                            so.sala = "u kancelariji";
                        }

                        saleOsoblja.push(so);

                        br++;
                    });
                });
            });
        });
    });
});

function poklapanjeDatumaIVremena(dat, dat1, dat2) { // "yyyy-mm-ddThh:mm"
    var dat = Date.parse(dat);
    var dat1 = Date.parse(dat1);
    var dat2 = Date.parse(dat2);

    if (dat >= dat1 && dat <= dat2) return true;

    return false;
}


app.listen(port, function () {
    console.log("Osluškivanje na portu " + port + "!");
});