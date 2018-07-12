const express = require('express')
const userRouter = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');



userRouter.get('/signup',(req,res,next)=>{
    res.render('userViews/signupPage')
    
});



userRouter.post('/signup', (req,res,next)=>{
    const thePassword = req.body.thePassword;
    const theUsername = req.body.theUsername;
    const salt = bcrypt.genSaltSync(10);

    if(thePassword ==="" || theUsername ===""){
        res.render('userViews/signupPage', {errorMessage: 'Please fill both a username and password to create an account'})
        return;
    }

    User.findOne({username: theUsername})
    .then((responseFromDb)=>{
        if(responseFromDb !== null){
            res.render('userViews/signupPage',{errorMessage:`Sorry,the username ${theUsername} is awesome, so you can't have it!`});
            return;
        }
            
        
        
        
        const hashedPassword = bcrypt.hashSync(thePassword, salt);
        
        User.create({username: theUsername, password: hashedPassword})
        .then((response)=>{
            res.redirect('/');
            
        })
        .catch((err)=>{
            next(err);
        })
        
        
    })
    
});

userRouter.get('/login',(req,res, next)=>{
    
    res.render('userViews/loginPage');
    
});

userRouter.post('/login', (req,res,next)=>{
    const theUsername = req.body.theUsername;
    const thePassword = req.body.thePassword;
    
    if (theUsername === "" || thePassword === "") {
        res.render("userViews/loginPage", {
            errorMessage: "Indicate a username and a password to sign up"
        });
        return;
    }
    
    User.findOne({ "username": theUsername }, (err, user) => {
        if (err || !user) {
            res.render("userViews/loginPage", {
                errorMessage: "Sorry, that username doesn't exist"
            });
            return;
        }
        if (bcrypt.compareSync(thePassword, user.password)) {
            // Save the login in the session!
            req.session.currentUser = user;
            res.redirect("/main");
            console.log(`The user is: ${req.session.currentUser}`)
            
        } else {
            res.render("userViews/loginPage", {
                errorMessage: "Incorrect password"
            });
        }
    });
});


userRouter.get("/logout", (req, res, next) => {
    req.session.destroy((err) => {
        // cannot access session here
        res.redirect("/login");
    });
});

userRouter.use((req, res, next) => {
    if (req.session.currentUser) {
      next();
    } else {
      res.redirect("/login");
    }
  });
    userRouter.get("/private", (req, res, next) => {
        const data = {};
        console.log(`The data before any input is ${data}`);
        if(req.session.currentUser){
            data.theUser = req.session.currentUser
        }
        res.render("private", data);
        console.log(`lets get ${data}`)
        });

    userRouter.get("/main", (req, res, next) => {
        const data = {};
        console.log(`The data before any input is ${data}`);
        if(req.session.currentUser){
            data.theUser = req.session.currentUser
        }
        res.render("mainPage", data);
        console.log(`lets get ${data}`)
        });



      module.exports = userRouter;