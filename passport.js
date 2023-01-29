const passport = require('passport'),
LocalStratagy = require('passport-local').Strategy,
Models = require('./models.js'),
passportJWT = require('passport-jwt');

let Users = Models.Users,
JWTStrategy = passportJWT.Strategy,
ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStratagy({
    usernameField: 'Username',
    passwordField: 'Password'},
    (username, password, callback) => {
        console.log(username + ' ' + password);
        Users.findOne({Username: username}, (error, user) => {
            if(error){
                console.log(error);
                return callback(error);
            }
            if(!user){
                console.log('incorrect username');
                return callback(null, false, {message: 'incorrect username'});
            }
            console.log('Finished');
            return callback(null, user);
        });
    }));
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'},
    (jwtPayload, callback) => {
        return Users.findById(jwtPayload._id).then((user) => {
            return callback(null, user);
        }).catch((error) => {
            return callback(error);
        });
    }));