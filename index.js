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


app.get('/', (req, res) => {
    res.send('Default response');
});
app.get('/movies', (req, res) => {
  Movies.find().then(Movies => res.json(Movies))
  });
app.get('/movies/:title', (req, res) => {
  Movies.findOne({Title : req.params.title }).then((Movie) => {res.json(Movie)})
  });
app.get('/movies/genres/:title', (req, res) => {
  Movies.findOne({Genre : req.params.title }).then((Movie) => {res.json(Movie.Genre)});
  });
app.get('/movies/directors/:director', (req, res) => {
  Movies.findOne({'Director.Name': req.params.director }).then((Movie) => {res.json(Movie.Director)});
  });
app.post('/users', (req, res) => {
  Users.findOne({ Username:req.body.Username }).then((User) =>{
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
});
app.put('/users/:Username', (req, res) => {
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
});

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

app.delete('/users/:Username/:movieID', (req, res) => {
  Users.findOneAndDelete({Username: req.params.Username}, {$set:{FavoriteMovies: req.params.movieID}},
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


app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });