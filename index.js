const { response } = require('express');
const express = require('express');
const res = require('express/lib/response');
const app = express();

let topMovies = [
    {
        title: 'Star wars',
        author: 'LucasFilms'
    }
];

const http = require('http');

http.createServer((request, response) => {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Welcome to my book club!\n');
}).listen(8080);

app.get('/movies', (req, res) =>{
    res.json(topMovies);
    console.log('movies!!');
})
app.get('/', (req, res) =>{
    console.log('default response');
})
app.use(express.static('public'));

console.log('My first node server is running on Port 8080.');