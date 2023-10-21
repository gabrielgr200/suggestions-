const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const levenshtein = require('fast-levenshtein');

const app = express();
const port = 6060;

const db = mysql.createConnection({
  host: 'bancomysql.c1rmsxzyhbjb.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'Skyfall20#?',
  database: 'Integrador',
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão bem-sucedida ao banco de dados MySQL');
});

app.use(cors());

app.get('/autocomplete', (req, res) => {
  const userQuery = req.query.query ? req.query.query.toLowerCase() : '';

  const sql = "SELECT * FROM Banco";

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar sugestões:', err);
      res.status(500).json({ error: 'Erro ao buscar sugestões.' });
      return;
    }

    const suggestions = [];
    const maxDistance = 4;

    results.forEach((row) => {
      const principio = row.Principio.toLowerCase();
      const distance = levenshtein.get(userQuery, principio);

      if (distance <= maxDistance) {
        suggestions.push({ principio, distance });
      }
    });
    suggestions.sort((a, b) => a.distance - b.distance);
    const suggestedPrincipios = suggestions.map((suggestion) => suggestion.principio);

    res.json(suggestedPrincipios);
  });
});

app.listen(port, () => {
  console.log(`API de autocompletar está rodando em http://localhost:${port}`);
});
