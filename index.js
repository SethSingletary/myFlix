const { response } = require('express');
const express = require('express');
const res = require('express/lib/response');
const app = express();
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));

let topMovies = [
    {
        title: 'Star wars',
        author: 'LucasFilms'
    }
];

app.get('/movies', (req, res) => {
    res.send('Successful GET request returning data on all movies');
  });
app.get('/movies/:title', (req, res) => {
    res.send('Successful GET request returning data on chosen movie');
  });
app.get('/movies/genres/:title', (req, res) => {
    res.send('Successful GET request returning data on chosen movies genre');
  });
app.get('/movies/directors', (req, res) => {
    res.send('Successful GET request returning data on chosen movies director');
  });
app.post('/users', (req, res) => {
    res.send('Successful POST request creating new user');
  });
app.put('/users/:id', (req, res) => {
    res.send('Successful PUT request updating user data');
  });
app.delete('/users/:id/:movieTitle', (req, res) => {
    res.send('Successful DELETE request deleting movie from favorites');
  });
app.delete('/users/:id', (req, res) => {
    res.send('Successful DELETE request deleting user');
  });




app.get('/movies', (req, res) =>{
    res.json(topMovies);
    console.log('movies!!');
})
app.get('/', (req, res) =>{
    console.log('default response');
})
app.use(express.static('public'));

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });