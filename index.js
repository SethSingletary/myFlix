const { response } = require('express');
const express = require('express');
const res = require('express/lib/response');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
const morgan = require('morgan');

/**
 * Cors and allowedOrgins declares what browsers can get through the cors policy
 * app.use(cors) checks if the browser can get through and then lets you know what happens
 */

const cors = require('cors');
let allowedOrigins = ['http://localhost:3000', 'http://testsite.com', 'https://resonant-cassata-933e3a.netlify.app', 'http://localhost:4200', 'http://localhost:4200/', 'https://sethsingletary.github.io/myFlix-Angular-client/', 'https://sethsingletary.github.io/myFlix-Angular-client/welcome', 'https://sethsingletary.github.io'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));


let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Model = require('./models.js');
const { title } = require('process');
const { check, validationResult } = require('express-validator');


const Movies = Model.Movie;
const Users = Model.User;

/**
 * this code connects the app to the database
 */
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true});

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));

/**
 * this trys to take you to the default path
 */
app.get('/', (req, res) => {
    res.send('Default response');
});

//app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  //Movies.find().then(Movies => res.json(Movies))
  //});

/**
 * this requests a list of all the movies from the database
 */
app.get('/movies', (req, res) => {
  Movies.find().then(Movies => res.json(Movies))
 });
/**
 * this pulls a specific user
 */

app.get('/users/:Username', (req, res) => {
  Users.findOne({Username : req.params.Username}).then((User) => {res.json(User)})
});

/**
 * this pulls one specific movie
 */
app.get('/movies/:title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({Title : req.params.title }).then((Movie) => {res.json(Movie)})
  });

  /**
   * this pulls the genre of one specific movie
   */

app.get('/movies/genres/:title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({Title : req.params.title}).then((Movie) => {res.json(Movie.Genre)});
  });

/**
 * This gets the director of the movie
*/  
app.get('/movies/directors/:director', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Director.Name': req.params.director }).then((Movie) => {res.json(Movie.Director)});
  });

/**
 * this creates the user
 * it also checks if the user is already made
 */
app.post('/users',[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username:req.body.Username }).then((User) =>{
    if(User) {
      return res.status(400).send(req.body.Username + ' already exists');
    } else{
      Users.create({
        Username: req.body.Username,
        Password: hashPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }).then((User) =>{res.json(User)});
    }
  });
});

/**
 * this allows the user to update their information
 */
app.put('/users/:Username', (req, res) => {

  let hashPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({Username: req.params.Username}, {$set:{
    Username: req.body.Username,
    Password: hashPassword,
    Email: req.body.Email,
    Birthday: req.body.Birthday
  }
},
{new: true},
(err, updatedUser) => {
  if(err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  } else {
    res.json(updatedUser);
  }
}
);
});


/** 
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {

  let hashPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({Username: req.params.Username}, {$set:{
    Username: req.body.Username,
    Password: hashPassword,
    Email: req.body.Email,
    Birthday: req.body.Birthday
  }
},
{new: true},
(err, updatedUser) => {
  if(err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  } else {
    res.json(updatedUser);
  }
}
);
});
*/

/**
 * this addes a movie to their favorites, and sends an error if it can't
 */

app.post('/users/:Username/:movieID', (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {$push:{FavoriteMovies: req.params.movieID}},
    {new:true},
    (err, updatedUser) => {
      if(err){
        console.log(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    }
    )
  //res.send('Successful POST request adding movie to favorites');
});

/** 
app.post('/users/:Username/:movieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {$push:{FavoriteMovies: req.params.movieID}},
    {new:true},
    (err, updatedUser) => {
      if(err){
        console.log(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    }
    )
  //res.send('Successful POST request adding movie to favorites');
});
*/
/** 
app.delete('/users/:Username/:movieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {$pull:{FavoriteMovies: req.params.movieID}},
    {new:true},
    (err, updatedUser) => {
      if(err){
        console.log(err);
        res.status(500).send('Error: ' + err);
      } else{
        res.json(updatedUser);
      }
    }
    )
    //res.send('Successful DELETE request deleting movie from favorites');
  });
*/

/**
 * this removes a movie from the favorites list
 */

  app.delete('/users/:Username/:movieID', (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username}, {$pull:{FavoriteMovies: req.params.movieID}},
      {new:true},
      (err, updatedUser) => {
        if(err){
          console.log(err);
          res.status(500).send('Error: ' + err);
        } else{
          res.json(updatedUser);
        }
      }
      )
      //res.send('Successful DELETE request deleting movie from favorites');
    });
/** 
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndDelete({Username: req.params.Username}).then((User) => {
    if(!User){
      res.status(400).send(req.params.Username + ' was not found');
    } else{
      res.status(200).send(req.params.Username + ' was deleted');
    }
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send('Error: ' + err);
  });
    //res.send('Successful DELETE request deleting user');
  });
  */

/**
 * this deletes a user
 */

  app.delete('/users/:Username', (req, res) => {
    Users.findOneAndDelete({Username: req.params.Username}).then((User) => {
      if(!User){
        res.status(400).send(req.params.Username + ' was not found');
      } else{
        res.status(200).send(req.params.Username + ' was deleted');
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
      //res.send('Successful DELETE request deleting user');
    });

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port' + port);
});
/** 
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
*/
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });