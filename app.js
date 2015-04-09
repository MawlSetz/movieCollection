var express = require('express');
var fs = require('fs');
var ejs = require('ejs');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
app.use(methodOverride('_method'));
app.set('view_engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
var movies = [];
var users = [];
var counter = 0;
var user_counter = 0;
var Movie = function(title, year, imdb, poster) {
	this.id = counter;
	counter++;
	this.title = title;
	this.year = year;
	this.imdb = imdb;
	this.poster = poster;
}

var User = function(name) {
	this.id = user_counter;
	this.name = name;
	user_counter++;
	this.favorites = [];
}

var paul = new User('Paul');
users.push(paul);
var molly = new User('Molly');
users.push(molly);

app.get('/', function(req, res) {
	res.redirect('/home');
});

app.get('/home', function(req, res) {
	fs.readFile('movies.json', function(err, data) {
		if (err) {
			res.render('index.ejs', { movies: movies });
		} else {
			movies = JSON.parse(data);
			res.render('index.ejs', { movies: movies });
		}
	})
});

app.get('/home/:id', function(req, res) {
	var movieID = movies[req.params.id];
	request('http://www.omdbapi.com/?i=' + movieID.imdb, function(err, response, body) {
		if (err) {
			console.log(err);
		} else {
			var film = JSON.parse(body);
			res.render('movie.ejs', { movieID: movieID, film: film });
		}
	})
});

app.get('/results', function(req, res) {
	var title = req.query.title;
	request('http://www.omdbapi.com/?s=' + title, function(err, response, body) {
		if (err) {
			console.log(err);
		} else {
			var results = JSON.parse(body).Search;
			res.render('results.ejs', { results: results, users: users });
		}
	});
});

app.post('/home', function(req, res) {
	var movie_info = JSON.parse(req.body.imdb);
	var newMovie = new Movie(movie_info.Title, movie_info.Year, movie_info.imdbID);
	movies.push(newMovie);
	users.push(req.body.username)
	fs.readFile('movies.json', function(err, data) {
		if (err) {
			fs.writeFile('movies.json', JSON.stringify(movies), function(err) {
				if (err) {
					console.log(err);
				}
			});
		} else {
			var newMovies = JSON.parse(data);
			newMovies.push(newMovie);
			fs.writeFile('movies.json', JSON.stringify(newMovies), function(err) {
				if (err) {
					console.log(err);
				}
			});
		}
	});
	res.redirect('/home');
});

app.delete('/movie/:id', function(req, res) {
	fs.readFile('movies.json', function(err, data) {
		if (err) {
			console.log(err);
		} else {
			movies = JSON.parse(data);
			console.log(req.params.id);
			console.log(movies[req.params.id]);
			delete movies[req.params.id];
			fs.writeFile('movies.json', JSON.stringify(movies), function(err) {
				if (err) {
					console.log(err);
				} else {
					res.redirect('/home');
				}
			});
		}
	});
});

app.listen(3000, function() {
	console.log('Listening on port 3000');
});