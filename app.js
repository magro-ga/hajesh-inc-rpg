const express = require('express');
const app = express();

const rotaSalas = require('./routes/salas');

app.use('/salas', rotaSalas);

module.exports = app;
