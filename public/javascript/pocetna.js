var slike = []; // niz stringova sa nazivima slika i formatom
var slikeIdHTML = ["prvaSlika", "drugaSlika", "trecaSlika"];
var br;
var brSljed = 0;
var ukupanBrSlika = 0;
var dugmePrethodni = document.getElementById("dugmePrethodni");
var dugmeSljedeci = document.getElementById("dugmeSljedeci");
var prvaSlika = document.getElementById("prvaSlika");
var drugaSlika = document.getElementById("drugaSlika");
var trecaSlika = document.getElementById("trecaSlika");
var brojPosjetioca = document.getElementById("brojPosjetioca");
var chrome = document.getElementById("chrome");
var firefox = document.getElementById("firefox");
var brChrome = 0;
var brFirefox = 0;
var brPosjetioca = 0;
var posjetioci = [];
let brojaneAdrese = [];

window.onload = function () {
    Pozivi.ucitajPosjetiocaISlikeAJAX(slike.length);
}

window.updateujPodatkePocetna = function (slike, ukupanBrSlika) {
    for (let i = 0; i < slike.length; i++) this.slike.push(slike[i]);
    if (ukupanBrSlika !== 0) this.ukupanBrSlika = ukupanBrSlika;
}

function odrediVidljivostHTMLSlike(slika) {
    if (slika.src.match(null)) slika.style.visibility = "hidden";
    else slika.style.visibility = "visible";
}

window.updateujHTML = function () {
    // Update slika
    br = 0;
    for (let i = brSljed; i < brSljed + 3; i++) {
        if (i >= ukupanBrSlika) document.getElementById(slikeIdHTML[br++]).src = null;
        else document.getElementById(slikeIdHTML[br++]).src = "../images/images-pocetna/" + slike[i];
    }

    if (brSljed >= ukupanBrSlika - 3) dugmeSljedeci.disabled = true;
    else dugmeSljedeci.disabled = false;
    if (prvaSlika.src.match(slike[0])) dugmePrethodni.disabled = true;
    else dugmePrethodni.disabled = false;

    odrediVidljivostHTMLSlike(prvaSlika);
    odrediVidljivostHTMLSlike(drugaSlika);
    odrediVidljivostHTMLSlike(trecaSlika);

    // Update informacija o posjetiocima
    if (slike.length <= 3) { // update se vrsi samo kad se prvi put pristupi stranici
        brPosjetioca = 0;

        for (let i = 0; i < posjetioci.length; i++) {
            let ip = posjetioci[i].ip;
            let pretrazivac = posjetioci[i].pretrazivac;
            if (brojaneAdrese.length === 0 || brojaneAdrese.includes(ip) === false) {
                brojaneAdrese.push(ip);
                brPosjetioca++;
            }
            if (pretrazivac === "Chrome") brChrome++;
            if (pretrazivac === "Firefox") brFirefox++;
        }

        brojPosjetioca.innerHTML = brPosjetioca;
        chrome.innerHTML = brChrome;
        firefox.innerHTML = brFirefox;
    }
}

window.klikSljedeci = function () {
    brSljed += 3;
    Pozivi.ucitajSlikeAJAX(slike.length);
}

window.klikPrethodni = function () {
    brSljed -= 3;
    updateujHTML();
}

window.updateujPosjetioce = function (posjetioci) {
    this.posjetioci = posjetioci;
}