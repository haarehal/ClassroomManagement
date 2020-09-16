// Modul za AJAX funkcije
var Pozivi = (function () {
    // Atributi
    var ajax = new XMLHttpRequest();
    var duzina;
    var zauzecaIzBaze = { "periodicna": [], "vanredna": [] };

    // Metode
    var ucitajZauzecaAJAX = function () {
        ajax.open("GET", "/zauzeca.json", true);
        ajax.send();

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                let zauzeca = ajax.responseText; // JSON objekat
                zauzeca = JSON.parse(zauzeca);
                Kalendar.ucitajPodatke(zauzeca.periodicna, zauzeca.vanredna);
                Kalendar.obojiZauzeca(document.getElementById('tabelaKalendar'), Kalendar.pretvoriMjesecStringURedni(document.getElementById('mjesec').innerHTML),
                    document.getElementById('selectSale').value, document.getElementById('pocetak').value, document.getElementById('kraj').value);
            }
            else if (ajax.readyState == 4 && ajax.status == 404) {
                // ...
            }
        }
    }

    var upisiZauzeceAJAX = function (sala, pocetak, kraj, periodicnaRez, mjesec, danRedni, dan) {
        ajax.open("POST", "/zauzeca.json", true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send(JSON.stringify({ sala: sala, pocetak: pocetak, kraj: kraj, periodicnaRez: periodicnaRez, mjesec: mjesec, danRedni: danRedni, dan: dan })); // JSON objekat

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                ucitajZauzecaAJAX();
            }
            else if (ajax.readyState == 4 && ajax.status == 400) {
                let error = JSON.parse(ajax.responseText);
                alert(error["poruka"]);
            }
        }
    }

    var ucitajSlikeAJAX = function (duzina = 0) {
        ajax.open("GET", "/slike" + "?d=" + duzina, true);
        ajax.send();
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                var slike = JSON.parse(ajax.responseText).slike; // niz stringova sa nazivima slika
                var ukupanBrSlika = JSON.parse(ajax.responseText).ukupanBrSlika;
                window.parent.updateujPodatkePocetna(slike, ukupanBrSlika);
                window.parent.updateujHTML();
            }
            else if (ajax.readyState == 4 && ajax.status == 404) {
                // ...
            }
        }
    }

    var upisiPosjetiocaAJAX = function () {
        ajax.open("POST", "/posjetioci.json", true);
        ajax.send();
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                window.parent.updateujPosjetioce(JSON.parse(ajax.responseText));
                ucitajSlikeAJAX(duzina);
            }
            else if (ajax.readyState == 4 && ajax.status == 404) {
                // ...
            }
        }
    }

    var ucitajPosjetiocaISlikeAJAX = function (duzina) {
        this.duzina = duzina;
        upisiPosjetiocaAJAX();
    }

    var ucitajOsobljeAJAX = function (stranica) {
        ajax.open("GET", "/osoblje", true);
        ajax.send();

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                let osoblje = ajax.responseText; // JSON objekat
                osoblje = JSON.parse(osoblje);
                osoblje = JSON.parse(osoblje);
                if (stranica === "rezervacija") window.parent.ucitajOsoblje(osoblje);
                else if (stranica === "osoblje") ucitajSaleOsobljaAJAX(osoblje);
            }
            else if (ajax.readyState == 4 && ajax.status == 404) {
                // ...
            }
        }
    }

    var ucitajZauzecaIzBazeAJAX = function (stranica) {
        ajax.open("GET", "/rezervacije", true);
        ajax.send();

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                let zauzeca = ajax.responseText; // JSON objekat
                zauzeca = JSON.parse(zauzeca);

                // Formiranje periodicnih i vanrednih zauzeca pogodnih za modul Kalendar
                let periodicna = [];
                let vanredna = [];
                for (let i = 0; i < zauzeca.length; i++) {
                    let z = zauzeca[i];

                    if (z.periodicnaRez) {
                        let p = {};

                        p.dan = z.dan;
                        p.semestar = z.semestar;
                        let poc = z.pocetak; // "hh:mm:ss"
                        poc = poc.split(":");
                        p.pocetak = poc[0] + ":" + poc[1]; // "hh:mm"
                        let kr = z.kraj; // "hh:mm:ss"
                        kr = kr.split(":");
                        p.kraj = kr[0] + ":" + kr[1];
                        p.naziv = z.sala;
                        

                        periodicna.push(p);
                    }
                    else {
                        let v = {};

                        v.datum = z.datum;
                        let poc = z.pocetak;
                        poc = poc.split(":"); // "hh:mm:ss"
                        v.pocetak = poc[0] + ":" + poc[1];
                        let kr = z.kraj; // "hh:mm:ss"
                        kr = kr.split(":");
                        v.kraj = kr[0] + ":" + kr[1]; // "hh:mm"
                        v.naziv = z.sala;
                        

                        vanredna.push(v);
                    }
                }

                if (stranica === 'osoblje') {
                    if(zauzecaIzBaze.periodicna != periodicna || zauzecaIzBaze.vanredna != vanredna){
                        window.parent.refreshujStranicu();
                    }
                }
                else {
                    Kalendar.ucitajPodatke(periodicna, vanredna);
                    Kalendar.obojiZauzeca(document.getElementById('tabelaKalendar'), Kalendar.pretvoriMjesecStringURedni(document.getElementById('mjesec').innerHTML),
                        document.getElementById('selectSale').value, document.getElementById('pocetak').value, document.getElementById('kraj').value);
                }
                zauzecaIzBaze.periodicna = periodicna;
                zauzecaIzBaze.vanredna = vanredna;
            }
            else if (ajax.readyState == 4 && ajax.status == 404) {
                // ...
            }
        }
    }

    var upisiZauzeceUBazuAJAX = function (sala, pocetak, kraj, periodicnaRez, mjesec, danRedni, dan, osoba) {
        ajax.open("POST", "/rezervacije", true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send(JSON.stringify({ zauzecaIzBaze: zauzecaIzBaze, sala: sala, pocetak: pocetak, kraj: kraj, periodicnaRez: periodicnaRez, mjesec: mjesec, danRedni: danRedni, dan: dan, osoba: osoba })); // JSON objekat

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                ucitajZauzecaIzBazeAJAX();
            }
            else if (ajax.readyState == 4 && ajax.status == 400) {
                let error = JSON.parse(ajax.responseText);
                alert(error["poruka"]);
            }
        }
    }

    var ucitajSaleOsobljaAJAX = function (osoblje) {
        ajax.open("GET", "/osobe", true);
        ajax.send();

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                var saleOsoblja = JSON.parse(ajax.responseText);
                window.parent.ucitajStr(osoblje, saleOsoblja);
            }
            else if (ajax.readyState == 4 && ajax.status == 404) {
                // ...
            }
        }
    }

    // public atributi/metode
    return {
        ucitajZauzecaAJAX: ucitajZauzecaAJAX,
        upisiZauzeceAJAX: upisiZauzeceAJAX,
        ucitajPosjetiocaISlikeAJAX: ucitajPosjetiocaISlikeAJAX,
        ucitajSlikeAJAX: ucitajSlikeAJAX,
        upisiPosjetiocaAJAX: upisiPosjetiocaAJAX,
        ucitajOsobljeAJAX: ucitajOsobljeAJAX,
        ucitajZauzecaIzBazeAJAX: ucitajZauzecaIzBazeAJAX,
        upisiZauzeceUBazuAJAX: upisiZauzeceUBazuAJAX,
        ucitajSaleOsobljaAJAX: ucitajSaleOsobljaAJAX
    }
}());