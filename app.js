//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));
//session initialize
app.use(session({
    secret : 'This is a secretKey.',
    resave : false,
    saveUninitialized : false
}))

// Use passport
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://localhost:27017/secretsUserDB', {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});


//Hash and salt passwords and save to db
userSchema.plugin(passportLocalMongoose);
const userMod = mongoose.model('user', userSchema);



passport.use(userMod.createStrategy());

passport.serializeUser(userMod.serializeUser());
passport.deserializeUser(userMod.deserializeUser());






app.get('/', (req,res) => {
    res.render('home');
});

app.get('/register', (req,res) => {
    res.render('register');
});

app.get('/login', (req,res) => {
    res.render('login');
});

app.get('/secrets', (req,res) => {
    if(req.isAuthenticated()){
        res.render('secrets')
    } else {
        res.redirect('login');
    }
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });


app.post('/register', (req, res) => {

    userMod.register({username:req.body.username}, req.body.password, (err,userMod) => {
        if(err){
            console.log(err);
            
            res.redirect('/register');
        }else{
            passport.authenticate('local')(req,res,function(){
                res.redirect('/secrets');
            });   
        }
    });    
});

app.post('/login', (req,res) => {

    const user = new userMod({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user, (err) => {
        if(err)
            console.log(err);
        else
        passport.authenticate('local')(req,res,function(){
            res.redirect('/secrets');
        });
    });    
});




app.listen(3000, function(){
    console.log('Secrets app launched on port: 3000');
})