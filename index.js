const { response } = require('express');
const express = require('express');
const res = require('express/lib/response');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Model = require('./models.js');
const { title } = require('process');


const Movies = Model.Movie;
const Users = Model.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true});

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));

let topMovies = [
    {
        title: 'Star wars',
        author: 'LucasFilms'
    }
];

app.get('/', (req, res) => {
    res.send('Default response');
});
app.get('/movies', (req, res) => {
  Movies.find().then(Movies => res.json(Movies))
  //res.send('Successful GET request returning data on all movies');
  });
app.get('/movies/:title', (req, res) => {
  Movies.findOne({Title : req.body.Title}).then((Movie) => {res.json(Movie)})
    //res.send('Successful GET request returning data on chosen movie');
  });
app.get('/movies/genres/:title', (req, res) => {
  Movies.findOne({Genre : req.body.Genre}).then((Movie) => {res.json(Movie.Genre)});
    //res.send('Successful GET request returning data on chosen movies genre');
  });
app.get('/movies/directors/:director', (req, res) => {
  Movies.findOne({'Director.Name': req.body.Director.Name}).then((Movie) => {res.json(Movie.Director)});
    //res.send('Successful GET request returning data on chosen movies director');
  });
app.post('/users', (req, res) => {
  Users.findOne({Username:req.body.Username}).then((User) =>{
    if(User) {
      return res.status(400).send(req.body.Username + 'already exists');
    } else{
      Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }).then((User) =>{res.json(User)});
    }
  });
    //res.send('Successful POST request creating new user');
  });
app.put('/users/:id', (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {$set:{
    Username: req.body.Username,
    Password: req.body.Password,
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
    //res.send('Successful PUT request updating user data');
  });
app.delete('/users/:id/:movieTitle', (req, res) => {
    res.send('Successful DELETE request deleting movie from favorites');
  });
app.delete('/users/:id', (req, res) => {
    res.send('Successful DELETE request deleting user');
  });

app.use(express.static('public'));

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });