import express, { Request, Response } from 'express';
import mysql from 'mysql2';  
import bodyParser from 'body-parser';
import path from 'path';

 
interface IUser {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    active: boolean;
}

 
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

 
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'mudar123',
    database: process.env.DB_DATABASE || 'unicesumar_blog'
});

db.connect((err: mysql.QueryError | null) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL');
});

 
app.get('/users/add', (req: Request, res: Response) => {
    res.render('addUser');
});

 
app.get('/users', (req: Request, res: Response) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err: mysql.QueryError | null, results: mysql.RowDataPacket[]) => {
        if (err) return res.status(500).send('Erro no servidor');
        const users: IUser[] = results.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            password: row.password,
            role: row.role,
            active: row.active
        }));
        res.render('users', { users });
    });
});

 
app.post('/users', (req: Request, res: Response) => {
    const { name, email, password, role, active } = req.body;
    const query = 'INSERT INTO users (name, email, password, role, active) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, email, password, role, active], (err: mysql.QueryError | null) => {
        if (err) return res.status(500).send('Erro ao criar usuário');
        res.redirect('/users');
    });
});

 
app.post('/users/:id/delete', (req: Request, res: Response) => {
    const userId = req.params.id;
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [userId], (err: mysql.QueryError | null) => {
        if (err) return res.status(500).send('Erro ao excluir usuário');
        res.redirect('/users');
    });
});

 
app.post('/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err: mysql.QueryError | null, results: mysql.RowDataPacket[]) => {
        if (err || results.length === 0) {
            return res.redirect('/login');
        }
        res.redirect('/users');
    });
});

 
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
