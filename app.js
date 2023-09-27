
let date = '00/00/0000';
let goalsMap = [];

// Fonction pour récupérer les objectifs depuis le serveur
function getGoals() {
    fetch('/api/goals')
        .then(response => response.json())
        .then(data => {
            // Traitez les données ici et mettez à jour le tableau goalsMap
            goalsMap = data;
            console.log("Données récupérées depuis le serveur :", goalsMap);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des objectifs :', error);
        });
}



function updateView() {
    const objectifTitle = document.querySelector('.objectif-title');
    const objectifContent = document.querySelector('.objectif-content');
    const logoValidation = document.querySelector('.logoValidation img');

    console.log("Date à rechercher :", date);

    // Recherchez la date dans le tableau goalsMap en utilisant une boucle for
    let goalData = undefined;
    for (let i = 0; i < goalsMap.length; i++) {
        if (goalsMap[i][0] === date) {
            goalData = goalsMap[i];
            break; // Sortez de la boucle une fois que l'élément est trouvé
        }
    }

    console.log("goalData =", goalData);

    if (goalData) {
        objectifTitle.textContent = `Objectif du ${date}`;
        objectifContent.textContent = goalData[1].objectif; // L'objectif est le deuxième élément du tableau

        // Vérifiez si l'objectif est réalisé et mettez à jour l'image en conséquence
        if (goalData[1].realise == "oui") {
            logoValidation.src = "images/ok.png";
        } else {
            logoValidation.src = "images/no.png";
        }
    } else {
        objectifTitle.textContent = `Objectif du ${date}`;
        objectifContent.textContent = "Objectif non défini pour cette date.";
        logoValidation.src = "images/no.png"; // Par défaut, utilisez l'image "no.png" si l'objectif n'est pas défini
    }
    updateStreak();
}


// Fonction pour inverser la réalisation côté serveur
function inverserRealisation(date) {
    // Envoyez une requête au serveur pour inverser la réalisation de l'objectif
    fetch('/api/inverserRealisation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date }),
    })
        .then(response => response.text())
        .then(data => {
            // Rafraîchissez les données depuis le serveur après la mise à jour
            getGoals();
        })
        .catch(error => {
            console.error('Erreur lors de linversion de la réalisation :', error);
        });
}


// Fonction pour ajouter un jour à la date actuelle
function ajouterUnJour() {
    const dateParts = date.split('/');
    const [jour, mois, annee] = dateParts;
    const currentDate = new Date(`${mois}/${jour}/${annee}`);
    currentDate.setDate(currentDate.getDate() + 1);
    const newDay = currentDate.getDate().toString().padStart(2, '0'); // Conserver le "0" devant le jour
    const newMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Conserver le "0" devant le mois
    const newYear = currentDate.getFullYear();
    date = `${newDay}/${newMonth}/${newYear}`;
    updateView();
}

// Fonction pour soustraire un jour à la date actuelle
function soustraireUnJour() {
    const dateParts = date.split('/');
    const [jour, mois, annee] = dateParts;
    const currentDate = new Date(`${mois}/${jour}/${annee}`);
    currentDate.setDate(currentDate.getDate() - 1);
    const newDay = currentDate.getDate().toString().padStart(2, '0'); // Conserver le "0" devant le jour
    const newMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Conserver le "0" devant le mois
    const newYear = currentDate.getFullYear();
    date = `${newDay}/${newMonth}/${newYear}`;
    updateView();
}

// Fonction pour initialiser la date au format "JJ/MM/AAAA"
function initializeDate() {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0'); // Conserver le "0" devant le jour
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Conserver le "0" devant le mois
    const year = currentDate.getFullYear();
    date = `${day}/${month}/${year}`;
}

function updateStreak() {
    const currentStreakDiv = document.querySelector('.currentStreak');
    const currentStreakImg = currentStreakDiv.querySelector('img');
    let streakCount = 0;

    let goalData = undefined;
    for (let i = 0; i < goalsMap.length; i++) {
        if (goalsMap[i][0] == currentDate) {
            index = i;
            goalData = goalsMap[i];
            break;
        }
    }

    while (goalsMap[index][1].realise == "oui") {
        index --;
        streakCount ++;
    }


    currentStreakDiv.textContent = `Streak : ${streakCount}`;
    currentStreakDiv.appendChild(currentStreakImg);
}


initializeDate();
let currentDate = date;

document.addEventListener('DOMContentLoaded', () => {
    getGoals(); // Appeler updateView toutes les 500ms
    setInterval(updateView, 500); // Appeler updateView toutes les 500ms

    // Ajoutez un gestionnaire d'événement pour le bouton "Valider"
    const validerButton = document.querySelector('.valider-button');
    validerButton.addEventListener('click', () => {
        // Appelez la fonction pour inverser la réalisation
        inverserRealisation(date);
        getGoals();
        updateView();
    });

    const leftArrow = document.querySelector('.leftArrow');
    const rightArrow = document.querySelector('.rightArrow');

    leftArrow.addEventListener('click', soustraireUnJour);
    rightArrow.addEventListener('click', ajouterUnJour);
});
