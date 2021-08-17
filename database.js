const Pool = require('pg').Pool;
const bcrypt = require('bcrypt');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'animals',
    password: 'password',
    port: 5432
});

const sentInfo = async (req, res) => {
    const email = req.body.email.toString();
    const pass = req.body.password.toString();
    const en_pass = await bcrypt.hash(pass, 10);
    let results = await pool.query('SELECT * FROM passwordtable WHERE email=$1', [email])
    if (results.rows.length > 0) {
        res.send('Error!! This email already exist on this website!!!');
    } else {
        pool.query(`INSERT INTO passwordtable (email, password) VALUES ($1, $2)`, [email, en_pass]);
        res.redirect('/search')
    }
};

const signIn = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    let results = await pool.query('SELECT * FROM passwordtable WHERE email=$1', [email])
    if (results.rows < 1) {
        res.send('This account does not exist!!!')
    } else if (results.rows > 1) {
        console.warn("Two accounts with same email!!!")
        res.send("Detected two accounts with this email, oh no!!")
    } else {
        let password_match = await bcrypt.compare(password, results.rows[0].password);
        if (password_match) {
            req.session.email = email;
            req.session.loggedIn = true;
            res.redirect('/search')
        } else {
            res.send("Password wrong!!!! Try again Partner!!")
        }
    }
};

const checkUserLoggedIn = async (req, res, next) => {
    if (req.session.loggedIn === true) {
        next()
    } else {
        res.send("Please log in")
    }
};

const searchPost = async (req, res) => {
    const email = req.session.email
    const searched = req.body.search
    let results = await pool.query(`SELECT * FROM mock_data WHERE animals LIKE '%${searched}%' AND common_name LIKE '%${searched}%'`)
    if (results.rows === 0) {
        res.send('Error!! please type before pressing button!!!');
    } else {
        pool.query(`INSERT INTO searchtable (email, searched) VALUES ($1, $2)`, [email, searched]);
    }
    res.send(results.row)
    //return results.rows
};

const searchMongo = async (req, res) => {
    const email = req.session.email
    const searched = req.body.search
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db("sprint");
        let results = dbo.collection('animals').find({ animals : new RegExp(`${searched}`), common_name : new RegExp(`${searched}`)}).toArray()
        if (err) throw err;
            db.close();
            pool.query(`INSERT INTO searchtable (email, searched) VALUES ($1, $2)`, [email, searched]);
        return results
        });
}

const logOut = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

module.exports = {
    logOut,
    signIn,
    sentInfo,
    searchPost,
    searchMongo,
    checkUserLoggedIn
}