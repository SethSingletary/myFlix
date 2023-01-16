const { response } = require('express');
const express = require('express');
const res = require('express/lib/response');
const app = express();
const morgan = require('morgan');
const fs = require('fs');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));

let topMovies = [
    {
        title: 'Star wars',
        author: 'LucasFilms'
    }
];

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