// Modul = Closure funkcija (samopozivajuca i aninonimna funkcija) sa ogranicenim i zasticenim scope-om
var Kalendar = (function () {
    // Atributi
    var prikazaniMjesec; // string
    var trenutniMjesec; // string
    var per; // niz objekata (periodicnih rezervacija)
    var van; // niz objekata (vanrednih rezervacija)

    // Metode
    function pretvoriMjesecRedniUString(mjesec) {
        if (mjesec === 0) mjesec = "Januar";
        else if (mjesec === 1) mjesec = "Februar";
        else if (mjesec === 2) mjesec = "Mart";
        else if (mjesec === 3) mjesec = "April";
        else if (mjesec === 4) mjesec = "Maj";
        else if (mjesec === 5) mjesec = "Juni";
        else if (mjesec === 6) mjesec = "Juli";
        else if (mjesec === 7) mjesec = "August";
        else if (mjesec === 8) mjesec = "Septembar";
        else if (mjesec === 9) mjesec = "Oktobar";
        else if (mjesec === 10) mjesec = "Novembar";
        else mjesec = "Decembar";

        return mjesec;
    }

    var pretvoriMjesecStringURedni = function (mjesec) {
        if (mjesec === "Januar") mjesec = 0;
        else if (mjesec === "Februar") mjesec = 1;
        else if (mjesec === "Mart") mjesec = 2;
        else if (mjesec === "April") mjesec = 3;
        else if (mjesec === "Maj") mjesec = 4;
        else if (mjesec === "Juni") mjesec = 5;
        else if (mjesec === "Juli") mjesec = 6;
        else if (mjesec === "August") mjesec = 7;
        else if (mjesec === "Septembar") mjesec = 8;
        else if (mjesec === "Oktobar") mjesec = 9;
        else if (mjesec === "Novembar") mjesec = 10;
        else mjesec = 11;

        return mjesec;
    }

    function postaviValueTabele(kalendarRef, mjesec) {
        if (mjesec === 0 || mjesec === "Januar") kalendarRef.value = "0";
        else if (mjesec === 1 || mjesec === "Februar") kalendarRef.value = "1";
        else if (mjesec === 2 || mjesec === "Mart") kalendarRef.value = "2";
        else if (mjesec === 3 || mjesec === "April") kalendarRef.value = "3";
        else if (mjesec === 4 || mjesec === "Maj") kalendarRef.value = "4";
        else if (mjesec === 5 || mjesec === "Juni") kalendarRef.value = "5";
        else if (mjesec === 6 || mjesec === "Juli") kalendarRef.value = "6";
        else if (mjesec === 7 || mjesec === "August") kalendarRef.value = "7";
        else if (mjesec === 8 || mjesec === "Septembar") kalendarRef.value = "8";
        else if (mjesec === 9 || mjesec === "Oktobar") kalendarRef.value = "9";
        else if (mjesec === 10 || mjesec === "Novembar") kalendarRef.value = "10";
        else kalendarRef.value = "11";
    }

    function dajSemestar(mjesec) {
        if ((mjesec === "Oktobar" || mjesec === 9) || (mjesec === "Novembar" || mjesec === 10) || (mjesec === "Decembar" || mjesec === 11) || (mjesec === "Januar" || mjesec === 0)) {
            return "zimski";
        }
        else if ((mjesec === "Februar" || mjesec === 1) || (mjesec === "Mart" || mjesec === 2) || (mjesec === "April" || mjesec === 3) || (mjesec === "Maj" || mjesec === 4) || (mjesec === "Juni" || mjesec === 5)) {
            return "ljetni";
        }

        return null;
    }

    var dajMjesec = function (datumStr) { // "dd.mm.yyyy"
        var mjesec = "";
        for (var i = 0; i < datumStr.length; i++) {
            var c = datumStr[i];
            if (c === ".") {
                mjesec += datumStr[i + 1] + datumStr[i + 2];
                break;
            }
        }

        if (mjesec === "01") mjesec = "Januar";
        else if (mjesec === "02") mjesec = "Februar";
        else if (mjesec === "03") mjesec = "Mart";
        else if (mjesec === "04") mjesec = "April";
        else if (mjesec === "05") mjesec = "Maj";
        else if (mjesec === "06") mjesec = "Juni";
        else if (mjesec === "07") mjesec = "Juli";
        else if (mjesec === "08") mjesec = "August";
        else if (mjesec === "09") mjesec = "Septembar";
        else if (mjesec === "10") mjesec = "Oktobar";
        else if (mjesec === "11") mjesec = "Novembar";
        else mjesec = "Decembar";

        return mjesec;
    }

    var dajDan = function (datumStr) {
        var dan = "";
        dan += datumStr[0] + datumStr[1];

        if (dan === "01") dan = "1";
        else if (dan === "02") dan = "2";
        else if (dan === "03") dan = "3";
        else if (dan === "04") dan = "4";
        else if (dan === "05") dan = "5";
        else if (dan === "06") dan = "6";
        else if (dan === "07") dan = "7";
        else if (dan === "08") dan = "8";
        else if (dan === "09") dan = "9";

        return dan;
    }

    var dajBrojDana = function (mjesec) {
        if (mjesec === 0 || mjesec === "Januar") return 31;
        else if (mjesec === 1 || mjesec === "Februar") return 28;
        else if (mjesec === 2 || mjesec === "Mart") return 31;
        else if (mjesec === 3 || mjesec === "April") return 30;
        else if (mjesec === 4 || mjesec === "Maj") return 31;
        else if (mjesec === 5 || mjesec === "Juni") return 30;
        else if (mjesec === 6 || mjesec === "Juli") return 31;
        else if (mjesec === 7 || mjesec === "August") return 31;
        else if (mjesec === 8 || mjesec === "Septembar") return 30;
        else if (mjesec === 9 || mjesec === "Oktobar") return 31;
        else if (mjesec === 10 || mjesec === "Novembar") return 30;
        else return 31;
    }

    function ucitajKalendar(kalendarRef, mjesec) {
        // Postavljanje osnovnih funkcionalnosti
        prikazaniMjesec = pretvoriMjesecRedniUString(mjesec);
        postaviValueTabele(kalendarRef, prikazaniMjesec);
        kalendarRef.rows[0].cells[0].innerHTML = prikazaniMjesec;
        var sestaSedmica = document.getElementById("sestaSedmica");
        sestaSedmica.style.visibility = "collapse";

        // Disable-anje i enable-anje button-a
        var dugmePrethodni = document.getElementById("dugmePrethodni");
        var dugmeSljedeci = document.getElementById("dugmeSljedeci");
        if (prikazaniMjesec === "Januar") dugmePrethodni.disabled = true;
        else if (prikazaniMjesec === "Decembar") dugmeSljedeci.disabled = true;
        else if (prikazaniMjesec === "Februar" && dugmePrethodni.disabled === true) dugmePrethodni.disabled = false;
        else if (prikazaniMjesec === "Novembar" && dugmeSljedeci.disabled === true) dugmeSljedeci.disabled = false;

        // Odredjivanje prvog dana na kalendaru
        var preskociCelije;
        if (mjesec === pretvoriMjesecStringURedni(trenutniMjesec)) preskociCelije = 4; // FIKSNI USLOV: preskace 4 celije - prvi dan trenutnog mjeseca iz kalendara ide od petka
        else if (prikazaniMjesec === "Januar") preskociCelije = 1; // FIKSNI USLOV: preskace jednu celiju - januar ide od utorka
        else if (prikazaniMjesec === "Februar") preskociCelije = 4; // preskace 4 celije - februar ide od petka
        else if (prikazaniMjesec === "Mart") preskociCelije = 4; // preskace 4 celije - mart ide od petka
        else if (prikazaniMjesec === "April") preskociCelije = 0; // ne preskace celije - april ide od ponedjeljka
        else if (prikazaniMjesec === "Maj") preskociCelije = 2; // preskace 2 celije - maj ide od srijede
        else if (prikazaniMjesec === "Juni") preskociCelije = 5; // preskace 5 celija - juni ide od subote
        else if (prikazaniMjesec === "Juli") preskociCelije = 0; // ne preskace celije - juli ide od ponedjeljka
        else if (prikazaniMjesec === "August") preskociCelije = 3; // preskace 3 celije - august ide od cetvrtka
        else if (prikazaniMjesec === "Septembar") preskociCelije = 6; // preskace 6 celija - septembar ide od nedjelje
        else if (prikazaniMjesec === "Oktobar") preskociCelije = 1; // preskace jednu celiju - oktobar ide od utorka
        else if (prikazaniMjesec === "Novembar") preskociCelije = 4; // preskace 4 celije - novembar ide od petka
        else preskociCelije = 6; // preskace 6 celija - decembar ide od nedjelje

        // Ucitavanje kalendara za odredjeni mjesec
        var dan = 1, br = 1;
        for (var i = 2; i < kalendarRef.rows.length; i++) {
            for (var j = 0; j < kalendarRef.rows[i].cells.length; j++) {
                var celija = kalendarRef.rows[i].cells[j];
                var celijaCSS = window.getComputedStyle(celija); // vraca sva CSS svojsta
                if (celijaCSS.id !== null) celija.removeAttribute("id");

                if ((dan <= 31 && (prikazaniMjesec === "Januar" || prikazaniMjesec === "Mart" || prikazaniMjesec === "Maj" || prikazaniMjesec === "Juli" || prikazaniMjesec === "August" || prikazaniMjesec === "Oktobar" || prikazaniMjesec === "Decembar"))
                    || (dan <= 30 && (prikazaniMjesec === "April" || prikazaniMjesec === "Juni" || prikazaniMjesec === "Septembar" || prikazaniMjesec === "Novembar"))
                    || (dan <= 28 && prikazaniMjesec === "Februar")) {

                    // Otkrivanje nove sedmice za specijalne slucajve
                    if ((dan === 31 && preskociCelije === 5) || (dan >= 30 && preskociCelije === 6)) {
                        var sestaSedmica = document.getElementById("sestaSedmica");
                        sestaSedmica.style.visibility = "visible";
                    }

                    if (br > preskociCelije) {
                        if (celijaCSS.visibility === "hidden") celija.style.visibility = "visible";
                        celija.innerHTML = dan;
                        celija.id = "celija" + dan;
                        celija.className = "dan slobodna";
                        dan++;
                    }
                    else {
                        if (celijaCSS.visibility === "visible") celija.style.visibility = "hidden";
                        br++;
                    }
                }
                else {
                    celija.style.visibility = "hidden";
                }
            }
        }
    }

    var obojiZauzecaImpl = function (kalendarRef, mjesec, sala, pocetak, kraj) {
        // Resetovanje dana na slobodne
        for (var i = 2; i < kalendarRef.rows.length; i++) {
            for (var j = 0; j < kalendarRef.rows[i].cells.length; j++) {
                var celija = kalendarRef.rows[i].cells[j];
                var celijaCSS = window.getComputedStyle(celija);
                if (celijaCSS.visibility === "visible") celija.className = "dan slobodna";
            }
        }

        // Ako nisu odabrana sva polja - funkcija ne radi nista (sve sale ostaju neobojene)
        if (sala === "x" || pocetak === "" || kraj === "") return;

        // Bojenje periodicnih zauzeca na kalendaru
        if (typeof per === "undefined") return;
        for (var i = 0; i < per.length; i++) {
            if (per[i].semestar === dajSemestar(mjesec) && per[i].naziv === sala && (per[i].pocetak === pocetak || per[i].kraj === kraj)) {
                var k = per[i].dan;
                for (var j = 2; j < kalendarRef.rows.length; j++) {
                    var celija = kalendarRef.rows[j].cells[k];
                    var celijaCSS = window.getComputedStyle(celija);
                    if (celijaCSS.visibility === "visible") celija.className = "dan zauzeta";
                }
            }
        }

        // Bojenje vanrednih zauzeca u kalendaru
        if (typeof van === "undefined") return;
        for (var i = 0; i < van.length; i++) {
            if (dajMjesec(van[i].datum) === prikazaniMjesec && van[i].naziv === sala && van[i].pocetak === pocetak && van[i].kraj === kraj) {
                var celija = document.getElementById("celija" + dajDan(van[i].datum));
                celija.className = "dan zauzeta";
            }
        }
    }

    var ucitajStranicu = function () {
        var datum = new Date();
        var mjesec = datum.getMonth();
        trenutniMjesec = pretvoriMjesecRedniUString(mjesec);

        ucitajKalendar(document.getElementById("tabelaKalendar"), mjesec);
    }

    var ucitajPodatkeImpl = function (periodicna, vanredna) {
        // Hardkodirani podaci
        /* periodicna = [
            {
                dan: 1,
                semestar: "zimski",
                pocetak: "10:00",
                kraj: "12:00",
                naziv: "S0",
                predavac: "Zeljko Juric"
            },
            {
                dan: 4,
                semestar: "ljetni",
                pocetak: "13:00",
                kraj: "14:30",
                naziv: "2-02",
                predavac: "Huse Fatkic"
            }
        ];

        vanredna = [
            {
                datum: "20.11.2019",
                pocetak: "11:00",
                kraj: "13:00",
                naziv: "VA1",
                predavac: "Zikrija Avdagic"
            },
            {
                datum: "03.06.2019",
                pocetak: "15:00",
                kraj: "17:00",
                naziv: "0-03",
                predavac: "Vensada Okanovic"
            }
        ]; */

        // Update podataka
        per = periodicna;
        van = vanredna;
    }

    var iscrtajKalendarImpl = function (kalendarRef, mjesec, dugmeId = null) {
        if (dugmeId === "dugmePrethodni") mjesec = mjesec - 1;
        else if (dugmeId === "dugmeSljedeci") mjesec = mjesec + 1;

        ucitajKalendar(kalendarRef, mjesec); // ucitavanje kalendara za zeljeni mjesec
    }

    function dajRGB(str) {
        var match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
        return match ? {
            r: match[1],
            g: match[2],
            b: match[3]
        } : {};
    }

    // return vraca objekat sa poljima cime naglasava da su public, dok je sve ostalo private
    return {
        obojiZauzeca: obojiZauzecaImpl,
        ucitajPodatke: ucitajPodatkeImpl,
        iscrtajKalendar: iscrtajKalendarImpl,
        pretvoriMjesecStringURedni: pretvoriMjesecStringURedni,
        dajDan: dajDan,
        dajMjesec: dajMjesec,
        dajBrojDana: dajBrojDana,
        dajSemestar: dajSemestar,
        ucitajStranicu: ucitajStranicu
    }
}());
