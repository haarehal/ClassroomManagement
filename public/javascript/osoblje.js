window.ucitajStr  = function(osoblje, saleOsoblja) {
    var ul = document.getElementById("lista");
    
    for(let i=0; i<osoblje.length; i++) {
        let ime = osoblje[i].ime;
        let prezime = osoblje[i].prezime;
        let uloga = osoblje[i].uloga;
        let sala = "";

        let ima = false;

        for(let j=0; j<saleOsoblja.length; j++) {
            let osoba = saleOsoblja[j].imePrezime;
            if(osoba == ime + " " + prezime) {
                ima = true;
                sala = saleOsoblja[j].sala;
                break;
            }
        }

        var li = document.createElement("li");
        li.className = "osobaSala";
        if(ima === false) li.appendChild(document.createTextNode(uloga + " " + ime + " " + prezime + " se trenutno nalazi u kancelariji"));
        else li.appendChild(document.createTextNode(uloga + " " + ime + " " + prezime + " se trenutno nalazi " + sala));
        ul.appendChild(li);
    }
}

window.setInterval(function() {
    Pozivi.ucitajZauzecaIzBazeAJAX('osoblje');
}, 30000);

window.refreshujStranicu = function() { // u slucaju update-a u bazi
    window.location.reload();
}
