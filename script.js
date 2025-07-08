/*****************************************************************/
/***************** SCRIPT PRINCIPAL DE CHRONOMAX *****************/
/*****************************************************************/

// Recuperation des elements du HTML à manipuler
const blocLaps = document.getElementById("laps");
const btnPlayPause = document.getElementById("play-pause");
const btnRestart = document.getElementById("restart");
const btnTakeLap = document.getElementById("take-lap");

const persoInterval = 10;// en millisecondes

const iconPlay = document.getElementById("icon-play");
const iconPause = document.getElementById("icon-pause");
const PPText = document.getElementById("play-pause-text");
const btnSaveAs = document.getElementById("save-as");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");
const seconds = document.getElementById("seconds");
const milliseconds = document.getElementById("milliseconds");

// Contenu textuel du fichier des laps telecheargeable
let contenuInitial = 'LAPS\n\n';
let fichierLap = contenuInitial;

let startTime = 0;// Point de depart après chaque lancement ou relancement
let duration = 0;// Duree ecoulee depuis le dernier startTime
let durationSave = 0;// Duree enregistrée depuis la dernière pause
let rank = 1;// Rang des laps

// Variable essentielle conditionnant le chronomètre, initialisée à false
let play = false;// false, car au debut le chrono n'est pas encore lancé

// Variable permettant de controler le rafraichissement ou le gel du chrono
let indicatorPP = null;

// Tableau des laps
let laps = [];

// Constantes de conversion basees sur les millisecondes
const ONE_HOUR = 3600000;
const ONE_MINUTE = 60000;
const ONE_SECOND = 1000;

// Fonction utile pour bien formater les millisecondes sous 3 chiffres
function formatMilli(value){
    if(value > 99){ return '' + value; }
    else if(value > 9){ return '0' + value; }
    else{ return '00' + value; }
}

// Fonction utile pour bien formater les h, m et s sous minimum 2 chiffres
function formatSecMinHour(value){
    if(value > 9){ return '' + value; }
    else{ return '0' + value; }
}

// Fonction utilisee pour rafraichir le contenu affiché au chrono.
// timeValue c'est une difference de Date.now() donc en le passant dans les opérations il est comme un entier
function ajustTime(timeValue){
    let mls = timeValue % ONE_SECOND;
    let h = (timeValue / ONE_HOUR);
    let m = (timeValue % ONE_HOUR) / ONE_MINUTE;
    let s = ((timeValue % ONE_HOUR) % ONE_MINUTE) / ONE_SECOND;
    milliseconds.innerHTML = formatMilli(Math.trunc(mls));
    seconds.innerHTML = formatSecMinHour(Math.trunc(s));
    minutes.innerHTML = formatSecMinHour(Math.trunc(m));
    hours.innerHTML = formatSecMinHour(Math.trunc(h));
}
// Fonction simple utilisee pour remettre le contenu affiche au chrono a zero lors d'un Restart
function initialiseChrono(){
    milliseconds.innerHTML = '000';
    seconds.innerHTML = '00';
    minutes.innerHTML = '00';
    hours.innerHTML = '00';
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

    // Attribution d'un nom de fichier adapté.
    // Exemple : Ressemblant à "laps_20250627084430.txt" pour être aussi unique 
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

// Fonction correspondant au clic sur le bouton Play/Pause
function actionOnPlayPause(){
    if(!play){// On veut lancer (ou relancer) le chrono
        // alert("Play !");
        startTime = Date.now();
        // ajustTime(2);
        indicatorPP = setInterval(() => {
            // Duree ecoulee depuis la derniere pause
            duration = Date.now() - startTime;
            // alert(duration);

            // Le temps c'est la duree qui s'est écoulee depuis la dernière pause plus la duree sauvegardée avant celle-ci
            ajustTime(parseInt(durationSave + duration));
            // console.log('running...');
        }, persoInterval);
        // Lorsque le chrono tourne, le bouton Lap est disponible
        btnTakeLap.disabled = false;
        // Mais on ne peut pas directement restart pas mesure de sécurité
        btnRestart.disabled = true;
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
        // Et quand on pause on a de nouveau accès à Restart
        btnRestart.disabled = false;
        PPText.innerHTML = 'Play';
    }

    // Dans tous les cas, dès qu'on clique sur ce bouton, on permute:
    play = !play;
    iconPlay.classList.toggle('phidden');
    iconPause.classList.toggle('phidden');
}

// Fonction correspondant au clic sur le bouton Restart
function actionOnRestart(){
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
}

// Fonction correspondant au clic sur le bouton Lap
function actionOnLap(){
    if(play){// Le bouton Lap n'est disponible que lorque le chrono tourne
        // Enregistrement du temps intermediaire
        let lap = durationSave + Date.now() - startTime;
        let lmls = lap % ONE_SECOND;
        let lh = (lap / ONE_HOUR);
        let lm = (lap % ONE_HOUR) / ONE_MINUTE;
        let ls = ((lap % ONE_HOUR) % ONE_MINUTE) / ONE_SECOND;
        // Ajout du temps dans le tableau des Laps
        laps.push(lap);
        // On aurait pu utiliser les methodes du DOM createElement ici mais j'ai simplemetn prefere
        // le formatage de chaine pour aller plus vite vu que le div à insérer est asssez court
        // Creation du bloc du Lap à afficher
        newLap = '<div class="lap">' +
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
                        '</div>' +
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
}

/* Mise en place des ecouteurs et execution des actions */

// Execution lorsqu'on clique sur Play/Pause
btnPlayPause.addEventListener('click', ()=>{
    actionOnPlayPause();
});

// Execution lorsqu'on clique sur Restart
btnRestart.addEventListener('click', ()=>{
    actionOnRestart();
});

// Execution lorsqu'on clique sur Lap
btnTakeLap.addEventListener('click', ()=>{
    actionOnLap();
});

// Activation du bouton de sauvegarde des laps
btnSaveAs.addEventListener('click', ()=>{
    // On execute la fonction de telechargement
    downloadLaps();
});