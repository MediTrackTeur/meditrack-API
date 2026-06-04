'use strict';

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MediTrack API a l'ecoute sur le port ${PORT}`);
});
