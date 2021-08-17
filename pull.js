const db = require('./database');


const postLanding = (req, res) => {
    let post = db.searchPost(req, res)
    res.render('search.html', {
        postgres : post,
        postgresList : true
    });  
}

const mongoLanding = (req, res) => {
    let mongo = db.searchMongo(req, res)
    res.render('search.html', {
        mongodb : mongo,
        mongoList : true
    })  
}

const bothLanding = (req, res) => {
    let post = db.searchPost(req, res)
    let mongo = db.searchMongo(req, res)
    res.render('search.html', {
        postgres : post,
        mongodb : mongo,
        bothList : true
    })  
}
module.exports = {
    postLanding,
    mongoLanding,
    bothLanding
}