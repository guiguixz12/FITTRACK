require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const { initDB } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads dir exists
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

initDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/diet', require('./routes/diet'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/workout-templates', require('./routes/workout-templates'));
app.use('/api/diet-templates',   require('./routes/diet-templates'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/users', require('./routes/users'));
app.use('/api/water', require('./routes/water'));
app.use('/api/stats', require('./routes/stats'));

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/app', (req, res) => res.sendFile(path.join(__dirname, 'public', 'app.html')));
app.get('/', (req, res) => res.redirect('/login'));

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || 'Erro interno do servidor' });
});

app.listen(PORT, () => console.log(`FitTracker rodando na porta ${PORT}`));
