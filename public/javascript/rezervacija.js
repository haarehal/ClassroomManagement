window.potvrdiRezervaciju = function (danRedni) {
    let kalendarRef = document.getElementById("tabelaKalendar");
    let sala = document.getElementById('selectSale').value;
    let pocetak = document.getElementById('pocetak').value;
    let kraj = document.getElementById('kraj').value;
    let periodicnaRez = document.getElementById("checkPer").checked;
    let mjesec = Kalendar.pretvoriMjesecStringURedni(document.getElementById('mjesec').innerHTML);
    let semestar = Kalendar.dajSemestar(mjesec);
    let dan;
    let osoba = document.getElementById('selectOsoblje').value;

    // Ako nisu odabrana sva polja, onemoguceno je pristupanje rezervaciji
    if (sala === "x" || osoblje === "x" || pocetak === "" || kraj === "") {
        alert("Potrebno je odabrati sva polja prije rezervacije termina!");
    }
    // Ako prikazani mjesec nije u ljetnom ili zimskom semestru, onemoguceno je pristupanje periodicnoj rezervaciji
    else if (semestar === null && periodicnaRezervacija) {
        alert("Izvan ljetnog i zimskog semestra, moguća je samo vanredna rezervacija!");
    }
    else {
        if (confirm("Da li želite rezervisati ovaj termin?") == true) {
            for (let i = 0; i < kalendarRef.rows.length; i++) {
                for (let j = 0; j < kalendarRef.rows[i].cells.length; j++) {
                    let celija = kalendarRef.rows[i].cells[j];
                    let celijaCSS = window.getComputedStyle(celija);
                    if (celijaCSS.visibility === "visible" && celija.innerHTML === danRedni) {
                        dan = j;
                        break;
                    }
                }
            }

            //Pozivi.upisiZauzeceAJAX(sala, pocetak, kraj, periodicnaRez, mjesec, danRedni, dan);
            Pozivi.upisiZauzeceUBazuAJAX(sala, pocetak, kraj, periodicnaRez, mjesec, danRedni, dan, osoba); 
        }
    }
}

window.ucitajOsoblje = function (osoblje) {
    var selectOsoblje = document.getElementById("selectOsoblje");

    for (let i = 0; i < osoblje.length; i++) {
        let ime = osoblje[i].ime;
        let prezime = osoblje[i].prezime;
        let uloga = osoblje[i].uloga;

        let opcija = this.document.createElement('option');
        opcija.value = ime + " " + prezime + "," + uloga;
        opcija.innerHTML = ime + " " + prezime;

        selectOsoblje.appendChild(opcija);
    }
}