const pg = require('pg');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

const FRONTEND_ORIGIN = 'http://localhost:8080';

const pool = new pg.Pool({
    user: process.env.APP_DB_USER,
    host: process.env.DB_HOST || 'db',
    database: process.env.POSTGRES_DB,
    password: process.env.APP_DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    connectionTimeoutMillis: 5000
});

console.log('Connecting...');

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origin === FRONTEND_ORIGIN) {
            return callback(null, true);
        }
        return callback(new Error('Blocked by CORS'));
    }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.get('/authenticate/:username/:password', async (request, response) => {
    const username = request.params.username;
    const password = request.params.password;

    const query = `
        SELECT id, user_name
        FROM users
        WHERE user_name = $1
          AND password = crypt($2, password)
    `;

    try {
        const results = await pool.query(query, [username, password]);
        response.status(200).json(results.rows);
    } catch (error) {
        console.error(error);
        response.status(500).send('Internal Server Error');
    }
});

// Handle CORS errors cleanly
app.use((err, req, res, next) => {
    if (err && err.message === 'Blocked by CORS') {
        return res.status(403).json({ error: 'CORS blocked this origin' });
    }
    next(err);
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});