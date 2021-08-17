const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database');
const nunjucks = require('nunjucks');
const nun = require('./pull');
const theport = 42069

const app = express();

nunjucks.configure('', {
    express: app
 });

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.use(session({secret:"SnoopDogg"}))

app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, 'signin.html'))
})

app.post("/signin", db.signIn);

app.get("/signup", function(req, res){
    res.sendFile(path.join(__dirname, 'signup.html'))
})

app.post("/signup", db.sentInfo);

app.post("/search", db.checkUserLoggedIn, (req, res)=>{
    const database = req.body.database.toLowerCase()
    if (database === "postgres"){
        nun.postLanding(req, res)
    }else if(database === "mongodb"){
        nun.mongoLanding(req, res)
    }else if(database === "both"){
        nun.bothLanding(req, res)
    }
});

app.get("/search", db.checkUserLoggedIn, (req, res)=>{
    res.sendFile(path.join(__dirname, 'search.html'))
    // const database = req.query.database.toLowerCase()
    // if(database === "postgres"){ 
    //     db.searchPost(req, res)
    // }else if(database === "mongodb"){
    //     db.searchMongo(req, res)
    // }else if(database === "both"){
    //     db.searchPost(req, res)
    //     db.searchMongo(req, res)
    // }
});

app.get("/logout", function(req, res){
    res.sendFile(path.join(__dirname, 'logout.html'))
})

app.post('/logout', db.logOut);

app.listen(theport, () => {
    console.log(`Listened at http://localhost:${theport}`)
})