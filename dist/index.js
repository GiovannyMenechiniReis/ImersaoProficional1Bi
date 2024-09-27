"use strict";
import express from 'express';
import mysql from 'mysql2';  
import bodyParser from 'body-parser';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();  

 
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

 
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'mudar123',
    database: process.env.DB_DATABASE || 'unicesumar_blog'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL');
});

 
app.get('/users', (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Erro no servidor');
        res.render('users', { users: results });
    });
});

app.get('/users/add', (req, res) => {
    res.render('addUser');
});

app.post('/users', (req, res) => {
    const { name, email, password, role, active } = req.body;
    const query = 'INSERT INTO users (name, email, password, role, active) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, email, password, role, active], (err) => {
        if (err) return res.status(500).send('Erro ao criar usuário');
        res.redirect('/users');
    });
});

app.post('/users/:id/delete', (req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [userId], (err) => {
        if (err) return res.status(500).send('Erro ao excluir usuário');
        res.redirect('/users');
    });
});

 
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err || results.length === 0) {
            return res.redirect('/login');
        }
        res.redirect('/users');
    });
});

 
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
