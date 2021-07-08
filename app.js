const express = require('express');
const mongoose = require('mongoose');
const bodyParser=require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport'); 
const { ensureAuthenticated } = require('./auth');
require('./passport')(passport);
const cors = require('cors');
const memberRoutes = require("./routes/memberroutes")
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');
const flash = require('connect-flash');
const mysql=require('mysql');
const app = express();


const dbService = require('./dbService');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));


const dotenv = require('dotenv');
dotenv.config();




//Express App

var port = (process.env.PORT || 5000);

//Data Base
const password_db = require('./models/model.password');
const notes_db = require('./models/model.notes');
const dburl = 'mongodb+srv://phani:test123@nodeone.tz1c8.mongodb.net/Node-one?retryWrites=true&w=majority';
mongoose.connect(dburl,{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true })
.then(result=> app.listen(port))
.catch(err=>console.log(err));

//View Engine
app.set('view engine','ejs');





//Static , Password , MiddleWare
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
app.use(morgan('dev'));
app.use(session({
  secret: 'phani',
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.get('/',ensureAuthenticated,(req,res)=>{
  res.render('home');
})

app.get('/home',ensureAuthenticated,(req,res)=>{
  res.redirect('/');
})


// Authentication
app.get('/login',(req,res)=>{
  const error = req.flash().error  || [];
  res.render('login',{error})
})

app.post('/login',(req,res,next) => {

    passport.authenticate('local',{

      successRedirect:'home',
      failureRedirect:'login',
      failureFlash: 'Invalid Username or password'
    }) (req,res,next);
})

app.get('/register',(req,res)=>{
    res.render('register',{error:''});
})

app.post('/register',(req,res)=>{
        if(req.body.password1!=req.body.password2)
        {
            res.render('register',{error : 'Password did not match'});
        }
        else{
      const newuser = new password_db( {name:req.body.name ,email:req.body.mail, password:req.body.password1});
      bcrypt.genSalt(10,(err,salt) =>
        bcrypt.hash(newuser.password,salt,(err,hash) =>
        {
          if(err) throw err;
          newuser.password =hash;
          newuser.save()
          .then(user =>
            {
              res.redirect('/login')
            })
          .catch(err => {
            res.render('register',{error : 'Username Already Exists'});
            //console.log(err);
          });
        })
      )
    }
  })

  app.get('/logout',(req,res) =>{
    req.logout();
    res.redirect('/');
  })




// Member Notes














 //const bodyParser = require('body-parser')

              
              
              


//app. use (bodyParser. urlencoded ({extended: true}))
// create
app.post('/insert', (request, response) => {
    const { name } = request.body;
    const db = dbService.getDbServiceInstance();
    
    const result = db.insertNewName(name);

    result
    .then(data => response.json({ data: data}))
    .catch(err => console.log(err));
});

// read
app.get('/getAll', (request, response) => {
  console.log('ok');
    const db = dbService.getDbServiceInstance();

    const result = db.getAllData();
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

// update
app.patch('/update', (request, response) => {
    const { id, name } = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.updateNameById(id, name);
    
    result
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
});

// delete
app.delete('/delete/:id', (request, response) => {
    const { id } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.deleteRowById(id);
    
    result
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
});

app.get('/search/:name', (request, response) => {
    const { name } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchByName(name);
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})



