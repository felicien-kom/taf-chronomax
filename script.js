btnPlayPause = document.getElementById("play-pause");
btnRestart = document.getElementById("restart");
btnTakeLap = document.getElementById("take-lap");
persoInterval = 10;// 10 millisecondes
iconPlay = document.getElementById("icon-play");
iconPause = document.getElementById("icon-pause");
PPText = document.getElementById("play-pause-text");
btnSaveAs1 = document.getElementsByClassName("save-as")[0];
//btnSaveAs2 = document.getElementsByClassName("save-as")[1];

fichierLap = 'LAPS\n\n';

docLaps = document.getElementById("laps");

startTime = 0;
duration = 0;
durationSave = 0;
rank = 1;

// Variable essentielle conditionnant le chronomètre, comme en étant false
play = false

// Variable permettant de mattre en pause ou non le chrono
indicatorPP = null;

// Tableau des laps
laps = []

hours = document.getElementById("hours");
minutes = document.getElementById("minutes");
seconds = document.getElementById("seconds");
milliseconds = document.getElementById("milliseconds");

ONE_HOUR = 3600000
ONE_MINUTE = 60000
ONE_SECOND = 1000

function formatMilli(value){
    if(value > 99){
        return '' + value;
    }
    else if(value > 9){
        return '0' + value;
    }
    else{
        return '00' + value;
    }
}
function formatSecMinHour(value){
    if(value > 9){
        return '' + value;
    }
    else{
        return '0' + value;
    }
}

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
function initialiseChrono(){
    milliseconds.textContent = '000';
    seconds.textContent = '00';
    minutes.textContent = '00';
    hours.textContent = '00';
}
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
  const maintenant = new Date();
  const jour = maintenant.getDate();
  const mois = maintenant.getMonth();
  const annee = maintenant.getFullYear();
  const heure = maintenant.getHours();
  const minute = maintenant.getMinutes();
  const seconde = maintenant.getSeconds();
  a.download = 'laps_' + annee + '' + mois + '' + jour + '' + heure + '' + minute + '' + seconde + '.txt'; // Nom du fichier
  document.body.appendChild(a);
  a.click();

  // Nettoyage
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


btnPlayPause.addEventListener('click', ()=>{
    if(!play){
        //alert("Play !");
        startTime = Date.now();
        //ajustTime(2);
        indicatorPP = setInterval(() => {
            //nowTime = Date.now();
            duration = Date.now() - startTime;
            //alert(duration);
            ajustTime(parseInt(durationSave + duration));
            //console.log('running...');
        }, persoInterval);

        btnRestart.disabled = false;
        btnTakeLap.disabled = false;
        PPText.innerHTML = 'Pause';
    }
    else{
        durationSave += Date.now() - startTime;
        clearInterval(indicatorPP);
        //console.log('il faut stopper');
        btnTakeLap.disabled = true;
        PPText.innerHTML = 'Play';
    }
    play = !play;
    iconPlay.classList.toggle('phidden');
    iconPause.classList.toggle('phidden');
});

btnRestart.addEventListener('click', ()=>{
    clearInterval(indicatorPP);
    // Des qu'on restart, on revient dans tous les cas à ceci
    play = false;
    durationSave = 0;
    initialiseChrono();
    // on vide le tableau des laps
    laps = []
    docLaps.innerHTML = '';
    rank = 1;
    btnRestart.disabled = true;
    btnTakeLap.disabled = true;
    iconPlay.classList.remove('phidden');
    iconPause.classList.add('phidden');
    btnSaveAs1.classList.add("phidden");
    //btnSaveAs2.classList.add("phidden");
    PPText.innerHTML = 'Start';
    fichierLap = 'LAPS\n\n';
});

btnTakeLap.addEventListener('click', ()=>{
    if(play){
        let lap = durationSave + Date.now() - startTime;
        let lmls = lap % ONE_SECOND;
        let lh = (lap / ONE_HOUR);
        let lm = (lap % ONE_HOUR) / ONE_MINUTE;
        let ls = ((lap % ONE_HOUR) % ONE_MINUTE) / ONE_SECOND;
        laps.push(lap);
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
        fichierLap += 'Rank ' + rank + ' --> ' + '' + formatSecMinHour(Math.trunc(lh)) +
            ':' + formatSecMinHour(Math.trunc(lm)) + ':' + formatSecMinHour(Math.trunc(ls)) +
            ':' + formatMilli(Math.trunc(lmls)) + '\n';
        //console.log(fichierLap);
        docLaps.innerHTML +=  newLap;
        // console.log(laps);
        btnSaveAs1.classList.remove("phidden");
        //btnSaveAs2.classList.remove("phidden");
        rank += 1;
    }
});

// Activation du bouton de sauvegarde des laps
btnSaveAs1.addEventListener('click', ()=>{
    downloadLaps();
})
/*
btnSaveAs2.addEventListener('click', ()=>{
    downloadLaps();
})
*/