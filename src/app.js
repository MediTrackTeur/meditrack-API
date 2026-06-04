'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const medicationsRouter = require('./routes/medications');
const alertsRouter = require('./routes/alerts');
const prescriptionsRouter = require('./routes/prescriptions');
const patientsRouter = require('./routes/patients');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
// Pas de logs HTTP pendant les tests pour garder une sortie propre.
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());

// Health check (monte directement, hors router).
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/medications', medicationsRouter);
app.use('/alerts', alertsRouter);
app.use('/prescriptions', prescriptionsRouter);
app.use('/patients', patientsRouter);

// 404 puis gestionnaire d'erreurs (toujours en dernier).
app.use(notFound);
app.use(errorHandler);

module.exports = app;
