
const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');


const app = express();
const port = 3000;

app.use(express.static(__dirname));

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api/goals', (req, res) => {
    fs.readFile('data.csv', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier :', err);
            res.status(500).send('Erreur lors de la lecture du fichier');
            return;
        }

        const lines = data.trim().split('\n');
        const header = lines[0].split(',');
        const goalsMap = new Map();

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const date = values[0];
            const objectif = values[1];
            const realise = values[2];

            goalsMap.set(date, { objectif, realise });
        }

        res.json(Array.from(goalsMap.entries()));
    });
});

// Endpoint pour inverser la réalisation
app.post('/api/inverserRealisation', (req, res) => {
    const { date } = req.body;

    // Lire le fichier CSV
    fs.readFile('data.csv', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier CSV :', err);
            res.status(500).send('Erreur lors de la lecture du fichier');
            return;
        }

        // Traiter le contenu du fichier CSV
        const lines = data.trim().split('\n');
        const header = lines[0].split(',');
        const goals = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const goalDate = values[0];
            const objectif = values[1];
            let realise = values[2];

            // Si la date correspond à celle fournie dans la requête
            if (goalDate === date) {
                // Inverser la réalisation
                if (realise.toLowerCase() === 'oui') {
                    realise = 'non';
                } else if (realise.toLowerCase() === 'non') {
                    realise = 'oui';
                }
            }

            goals.push([goalDate, objectif, realise]);
        }

        // Reconstruire le contenu mis à jour du fichier CSV
        const updatedCSV = [header.join(','), ...goals.map(goal => goal.join(','))].join('\n');

        // Écrire le contenu mis à jour dans le fichier CSV
        fs.writeFile('data.csv', updatedCSV, 'utf8', err => {
            if (err) {
                console.error('Erreur lors de lécriture du fichier CSV :', err);
                res.status(500).send('Erreur lors de lécriture du fichier');
                return;
            }

            res.status(200).send('Réalisation mise à jour avec succès');
        });
    });
});


// Route pour déclencher la fonction pushCsvModification
app.post('/api/push-csv', (req, res) => {
    commitAndPush();
    res.status(200).send('Opération de mise à jour en cours...');
});


// Fonction pour effectuer un commit et une poussée
function commitAndPush() {
  // Ajoutez tous les fichiers modifiés ou supprimés
  exec('git add .', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur lors de l'ajout des fichiers : ${error}`);
      return;
    }

    // Créez un message de commit (personnalisez-le en fonction de vos besoins)
    const commitMessage = 'Mise à jour automatique des données';

    // Effectuez un commit
    exec(`git commit -m "${commitMessage}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erreur lors du commit : ${error}`);
        return;
      }

      // Poussez les modifications vers le référentiel GitHub en utilisant l'authToken
      exec(`git push origin main`, {
        env: { GITHUB_AUTH_TOKEN: authToken }, // Utilisez votre variable authToken
      }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Erreur lors de la poussée : ${error}`);
          return;
        }

        console.log('Modifications poussées avec succès vers GitHub');
      });
    });
  });
}

// Exemple d'utilisation de la fonction avec un token d'authentification
const authToken = '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';

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
