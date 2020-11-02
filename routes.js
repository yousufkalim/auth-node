//init
const express = require('express');
const routes = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const users = require('./models/users');
const passport = require('passport');
const { findOne, findOneAndDelete } = require('./models/users');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const { Router } = require('express');


//Middleware
routes.use(bodyParser.urlencoded({ extended : true }));
routes.use(cookieParser('secret'));
routes.use(session({
    secret: 'secret',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: true,
}));

//Passport
routes.use(passport.initialize());
routes.use(passport.session());

//Flash Stuff
routes.use(flash());
routes.use((req, res, next) => {
    res.locals.error = req.flash('error');
    next();
})

//Autchentication checking middleware
const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()){
        res.set('cache-control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next()
    }else{
        res.redirect('/login');
    };
};

const loginPageAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect('/success');
    }else{
        next();
    };
};

//Routes
routes.get('/', (req, res) => {
    res.status(200).render('index');
});


//Register
routes.post('/register', (req, res) => {
    var { email, username, password, confirmpassword } = req.body;
    let err;
    if (!email || !username || !password || !confirmpassword) {
        err = 'Please fill all the fields...'
        res.render('index', { 'err' : err })
    } else if (password != confirmpassword) {
        err = `Password didn't matched`;
        res.render('index', { 'err' : err, 'email' : email, 'username' : username })
    } else {
        users.findOne({email : email}, (err, data) => {
            if (err) throw err;
            const hashedPassword = bcrypt.hashSync(password, 10);
            if (data) {
                err = 'User Already Exist';
                res.render('index', { 'err' : err, 'email' : email, 'username' : username})
            } else {
                users.create({
                    email : email,
                    username : username,
                    password : hashedPassword
                }, (err, data) => {
                    if (err) throw err;

                    req.flash('success_message', 'Registered Successfully.. Login to continue');
                    res.redirect('/login');
                });
            }
        });
    }
});

//Login

//LocalStrategy
const localStrategy = require('passport-local').Strategy;
passport.use(new localStrategy({ usernameField : 'email' }, (email, password, done) => {
    users.findOne({ email : email}, (err, data) => {
        if (err) throw err;
        if (!data) {
            return done(null, false, { message : 'User not exist...'});
        };
        bcrypt.compare(password, data.password, (err, match) => {
            if (err) {
                return done(null, false);
            } else if ( !match ) {
                return done(null, false, { message : 'Password not matched' });
            }else if(match) {
                return done(null, data);
            };
        });
    });
}));

//Serialize Users
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    users.findById(id, (err, user) => {
        done(err, user);
    });
});

//End of LS

routes.get('/login', loginPageAuth, (req, res) => {
    res.render('login', { successMessage : req.flash('success_message') });
});

routes.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect : '/login',
        successRedirect : '/success',
        failureFlash : true,
    })(req, res, next);
});

//Success
routes.get('/success', checkAuth,(req, res) => {
    res.render('success', { user : req.user });
});

//Logout
routes.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

//add message
routes.post('/addmsg', checkAuth, (req, res) => {
    users.findOneAndUpdate(
        {
            email : req.user.email
        },
        {
            $push : {
                message : req.body['msg']
            }
        },
        (err, result) => {
            if (err) throw err;
        }
    );
    res.redirect('/success');
})

//Module Exports
module.exports = routes;