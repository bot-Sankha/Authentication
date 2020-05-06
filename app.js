//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption')

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));

mongoose.connect('mongodb://localhost:27017/secretsUserDB', {useNewUrlParser: true, useUnifiedTopology: true });
const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

userSchema.plugin(encrypt, { secret : process.env.SECRET, encryptedFields: ['password'] });

const userMod = mongoose.model('user', userSchema);



app.get('/', (req,res) => {
    res.render('home');
});

app.get('/register', (req,res) => {
    res.render('register');
});

app.get('/login', (req,res) => {
    res.render('login');
});


app.post('/register', (req, res) => {
    const newUser = new userMod({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save((err) => {
        if(err)
            console.log(err);
        else
            res.render('secrets');
    });
});

app.post('/login', (req,res) => {
    const uName = req.body.username;
    const uPass = req.body.password;

    userMod.findOne({email : uName}, (err, foundUser) => {
        if(err){
            console.log(err);
        } else {
            if(foundUser){
                if(foundUser.password === uPass){
                    res.render('secrets');
                }else{
                    res.send('Wrong password')
                }
            } else {
                res.send('User not found');
            }
        }
        
    })
});




app.listen(3000, function(){
    console.log('Secrets app launched on port: 3000');
})