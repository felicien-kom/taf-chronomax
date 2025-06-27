// Recuperation des elements du HTML à manipuler
var blocLaps = document.getElementById("laps");
var btnPlayPause = document.getElementById("play-pause");
var btnRestart = document.getElementById("restart");
var btnTakeLap = document.getElementById("take-lap");
var persoInterval = 10;// en millisecondes
var iconPlay = document.getElementById("icon-play");
var iconPause = document.getElementById("icon-pause");
var PPText = document.getElementById("play-pause-text");
var btnSaveAs = document.getElementsByClassName("save-as")[0];
var hours = document.getElementById("hours");
var minutes = document.getElementById("minutes");
var seconds = document.getElementById("seconds");
var milliseconds = document.getElementById("milliseconds");

// Contenu textuel du fichier des laps telecheargeable
var contenuInitial = 'LAPS\n\n';
var fichierLap = contenuInitial;

var startTime = 0;// Point de depart après chaque lancement ou relancement
var duration = 0;// Duree ecoulee depuis le dernier startTime
var durationSave = 0;// Duree enregistrée depuis la dernière pause
var rank = 1;// Rang des laps

// Variable essentielle conditionnant le chronomètre, initialisée à false
var play = false;// false, car au debut le chrono n'est pas encore lancé

// Variable permettant de controler le rafraichissement ou le gel du chrono
var indicatorPP = null;

// Tableau des laps
var laps = [];

const ONE_HOUR = 3600000;
const ONE_MINUTE = 60000;
const ONE_SECOND = 1000;

// Fonction utile pour bien formater les millisecondes sous 3 chiffres
function formatMilli(value){
    if(value > 99){return '' + value;}
    else if(value > 9){return '0' + value;}
    else{return '00' + value;}
}

// Fonction utile pour bien formater les h, m et s sous minimum 2 chiffres
function formatSecMinHour(value){
    if(value > 9){return '' + value;}
    else{return '0' + value;}
}

// Fonction utilisee pour rafraichir le contenu affiché au chrono 
function ajustTime(timeValue){
    let mls = timeValue % ONE_SECOND;
    let h = (timeValue / ONE_HOUR);
    let m = (timeValue % ONE_HOUR) / ONE_MINUTE;
    let s = ((timeValue % ONE_HOUR) % ONE_MINUTE) / ONE_SECOND;
    milliseconds.textContent = formatMilli(Math.trunc(mls));
    seconds.textContent = formatSecMinHour(Math.trunc(s));
    minutes.textContent = formatSecMinHour(Math.trunc(m));
    hours.textContent = formatSecMinHour(Math.trunc(h));
}
// Fonction simple utilisee pour remettre le contenu affiche au chrono a zero lors d'un Restart
function initialiseChrono(){
    milliseconds.textContent = '000';
    seconds.textContent = '00';
    minutes.textContent = '00';
    hours.textContent = '00';
}
// Fonction spéciale pour telecharger sous fichier texte les laps enregistrés
function downloadLaps(){
    // Contenu du fichier texte
    const texte = fichierLap;

    // Création d’un Blob à partir du texte
    const blob = new Blob([texte], { type: 'text/plain' });

    // Création de l’URL temporaire
    const url = URL.createObjectURL(blob);

    // Création et configuration d’un lien invisible
    const a = document.createElement('a');
    a.href = url;

    // Attribution d'un nom de fichier adapté. Exemple : "laps_20250627084430.txt pour être aussi unique 
    // et identifiable que possible
    const maintenant = new Date();
    const nJour = maintenant.getDate();
    const nMois = maintenant.getMonth();
    const nAnnee = maintenant.getFullYear();
    const nHeure = maintenant.getHours();
    const nMinute = maintenant.getMinutes();
    const nSeconde = maintenant.getSeconds();
    // Nom du fichier à télécharger
    a.download = 'laps_' + nAnnee + '' + nMois + '' + nJour + '' + nHeure + '' + nMinute + '' + nSeconde + '.txt';
    
    // Ajout et execution automatique du lien invisible
    document.body.appendChild(a);
    a.click();

    // Nettoyage
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Execution lorsqu'on clique sur Play/Pause
btnPlayPause.addEventListener('click', ()=>{
    if(!play){// On veut lancer (ou relancer) le chrono
        // alert("Play !");
        startTime = Date.now();
        // ajustTime(2);
        indicatorPP = setInterval(() => {
            // Duree ecoulee depuis la derniere pause
            duration = Date.now() - startTime;
            // alert(duration);

            // Le temps c'est la duree qui s'est écoulee depuis la dernière pause plus la duree enregistree avant celle-ci
            ajustTime(parseInt(durationSave + duration));
            // console.log('running...');
        }, persoInterval);
        // Lorsque le chrono tourne, les boutons Restart et Laps sont disponibles
        btnRestart.disabled = false;
        btnTakeLap.disabled = false;
        PPText.innerHTML = 'Pause';
    }
    else{// On veut mettre sur pause
        // Lorsqu'on pause le chrono, on sauvegarde la duree ecoulee
        durationSave += Date.now() - startTime;
        // Et on stoppe le rafraichissement du contenu du chrono
        clearInterval(indicatorPP);

        // console.log('il faut stopper');

        // Lorsqu'on pause, on ne prend pas de Laps
        btnTakeLap.disabled = true;
        PPText.innerHTML = 'Play';
    }

    // Dans tous les cas, dès qu'on clique sur ce bouton :
    play = !play;
    iconPlay.classList.toggle('phidden');
    iconPause.classList.toggle('phidden');
});

// Execution lorsqu'on clique sur Restart
btnRestart.addEventListener('click', ()=>{
    // En Restart, on stoppe le rafraichissement du contenu du chrono
    clearInterval(indicatorPP);
    // Et on remet TOUT à sa valeur initiale
    play = false;
    durationSave = 0;
    initialiseChrono();
    laps = [];// On vide le tableau des laps
    blocLaps.innerHTML = '';
    rank = 1;
    btnRestart.disabled = true;// Ces boutons sont à nouveaux indisponibles comme au tout départ
    btnTakeLap.disabled = true;
    iconPlay.classList.remove('phidden');
    iconPause.classList.add('phidden');
    btnSaveAs.classList.add("phidden");
    PPText.innerHTML = 'Start';
    fichierLap = contenuInitial;
});

// Execution lorsqu'on clique sur Lap
btnTakeLap.addEventListener('click', ()=>{
    if(play){// Le bouton Lap n'est disponible que lorque le chrono tourne
        // Enregistrement du temps intermediaire
        let lap = durationSave + Date.now() - startTime;
        let lmls = lap % ONE_SECOND;
        let lh = (lap / ONE_HOUR);
        let lm = (lap % ONE_HOUR) / ONE_MINUTE;
        let ls = ((lap % ONE_HOUR) % ONE_MINUTE) / ONE_SECOND;
        // Ajout du temps dans le tableau des Laps
        laps.push(lap);
        // Creation du bloc du Lap à afficher
        let newLap = '<div class="lap">' +
                        '<div class="indicator">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">' +
                                '<path d="M360-840v-80h240v80H360Zm80 440h80v-240h-80v240Zm40 320q-74 0-139.5-28.5T226-186q-49-49-77.5-114.5T120-440q0-74 28.5-139.5T226-694q49-49 114.5-77.5T480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80Zm0-80q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-280Z"/>' +
                            '</svg>' +
                            '<span class="rank">' + rank + '</span>' +
                        '</div>' +
                        '<div class="value">' +
                           '<span class="h">' + formatSecMinHour(Math.trunc(lh)) + '</span><span>:</span>' +
                            '<span class="m">' + formatSecMinHour(Math.trunc(lm)) + '</span><span>:</span>' +
                            '<span class="s">' + formatSecMinHour(Math.trunc(ls)) + '</span><span>:</span>' +
                            '<span class="mls">' + formatMilli(Math.trunc(lmls)) + '</span>' +
                        '</div>';
        // Ajout du Lap dans le fichier texte telecheargeable    
        fichierLap += 'Rank ' + rank + ' --> ' + '' + formatSecMinHour(Math.trunc(lh)) +
            ':' + formatSecMinHour(Math.trunc(lm)) + ':' + formatSecMinHour(Math.trunc(ls)) +
            ':' + formatMilli(Math.trunc(lmls)) + '\n';
        // console.log(fichierLap);

        // Affichage du Lap dans la liste des Laps
        blocLaps.innerHTML +=  newLap;

        // console.log(laps);

        // Disponibilite du bouton de sauvegarde
        btnSaveAs.classList.remove("phidden");
        // Incrementation du rang des Laps
        rank += 1;
    }
});

// Activation du bouton de sauvegarde des laps
btnSaveAs.addEventListener('click', ()=>{
    // On execute la fonction de telechargement
    downloadLaps();
});