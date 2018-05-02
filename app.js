const express = require('express');
const session = require('express-session');
const twig = require('twig');
const bodyParser = require('body-parser');
const stringify = require('json-stringify')
const moment = require('moment');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const fs = require('fs');
const yaml = require('js-yaml');

let myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

// defined express
const app = express();

// configuration file
try {
	var settings = yaml.safeLoad(
		fs.readFileSync('.config.yml', 'utf-8')
	);
} catch (e) {
	console.log(e)
}

// twig as render
app.set('view engine', 'twig');

// bodyParser => form (input)
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// expression session
app.use(session({
	secret: '!"dzjdjzijzjdjéé"&',
	resave: true,
	saveUninitialized: true,
	// cookie: { secure: true }
}))

// console.log
var wr = (str) => {
	console.log('[-] ' + str)
	return;
}

// function views for live link
var views = function (link) {
	return __dirname + settings.links.views + link;
}

// function assets for live link
var assets = function (type, link) {
	var assets;
	if (type == 'public') {
		assets = settings.links.assets.public + link + '/';
	} else if (type == 'private') {
		assets = __dirname + settings.links.assets.private + link;
	} else {
		return;
	}

	return assets;
}

// stylesheets / javascript / images / fonts
app.use(assets('public', 'css'),
	express.static(assets('private', 'css'))
);

app.use(assets('public', 'js'),
	express.static(assets('private', 'js'))
);

app.use(assets('public', 'img'),
	express.static(assets('private', 'img'))
);

app.use(assets('public', 'svg'),
	express.static(assets('private', 'svg'))
);

app.use(assets('public', 'fonts'),
	express.static(assets('private', 'fonts'))
);


// connection database (if settings.mysql.cnct is true connection ok => .config.yml)
if (settings.mysql.cnct == true) {
	var db = mysql.createConnection({
		host: settings.mysql.host,
		user: settings.mysql.user,
		password: settings.mysql.pssw,
		database: settings.mysql.dbts
	})
}

db.connect((err) => {
	if (err) throw err;
	wr('Connected to database');
});

var sessionData;

// Routes`
app.get('/', (req, res) => {
	let sql = "SELECT DISTINCT w.name FROM word w";
	db.query(sql, (err, results, fields) => {
		if (err) throw err;
		let words = results;
		let sql = "SELECT * FROM word w JOIN user u WHERE w.user_id = u.id;";
		db.query(sql, (err, results, fields) => {
			let recentword = results.slice(-1)[0]
			res.render(views('index'), {
				words: words,
				recentword: recentword
			});
		});
	});
})

app.get('/definition', (req, res) => {
	let word = req.param('word')
	let sql = "SELECT * FROM word w JOIN user u WHERE w.`name` = '" + word + "' AND w.user_id = u.id"
	db.query(sql, (err, results, fields) => {
		if (err) throw err;
		let words = results
		let name = results[0].name
		res.render(views('definition'), {
			words: words,
			name: name
		});
	});
})

app.get('/api/test', (req, res) => {
	let sql = "SELECT * FROM word w JOIN user u on w.user_id = u.id WHERE w.`name` = 'Iteration' AND w.user_id = u.id";
	db.query(sql, (err, results, fields) => {
		res.send(results)
	})
});

app.get('/write', (req, res) => {
	if (sessionData != undefined) {
		let word = req.param('word')
		let sql = "SELECT name FROM word WHERE name = '" + word + "' "
		db.query(sql, (err, results, fields) => {
			if (err) throw err;
			let word = results[0]
			res.render(views('write'), {
				word: word,
			});
		});
	} else {
		res.redirect('/welcome')
	}
})


app.post('/write', (req, res) => {
	if (sessionData.token != undefined) {
		let sql = "SELECT * FROM `user` WHERE id = " + sessionData.token;
		db.query(sql, (err, results, fields) => {
			if (err) throw err;
			let definition = req.body.definition.toLowerCase().replace(/'/g, '\\\'');
			let name = req.body.searchHidden.toLowerCase()
			let sql = "INSERT INTO word (`user_id`, `name`, `definition`, `created`, `modified`) VALUES (" + sessionData.token + ", '" + name + "', '" + definition + "', '" + myDate + "', '" + myDate + "')";
			db.query(sql, (err, results, fields) => {
				if (err) throw err;
				wr('Nouvelle définition créee');
				res.send('Nouvelle définition créee');
			})
		})
	} else {
		res.redirect('/welcome')
	}
})


app.get('/research', (req, res) => {
	req.param('word')
	if (req.param('word') != undefined) {
		let word = req.param('word')
		let sql = "SELECT * FROM word WHERE name LIKE '" + word + "' "
		db.query(sql, (err, results, fields) => {
			if (err) throw err;
			let name = results[0]
			res.render(views('research'), {
				name: name,
			});
		});
	} else {
		res.render(views('/research'))
	}

})

app.get('/bookmarks', (req, res) => {
	if (sessionData != undefined) {
		let sql = "SELECT DISTINCT w.name FROM word w WHERE w.user_id = '" + sessionData.token + "' "
		db.query(sql, (err, results, fields) => {
			if (err) throw err;
			let words = results
			res.render(views('bookmarks'), {
				words: words,
			});
		});
	} else {
		res.redirect('/welcome')
	}
})

app.get('/welcome', (req, res) => {
	wr('Welcome page')
	if (sessionData != undefined) {
		res.redirect('/modify')
	} else {
		res.render(views('welcome'))
	}
})

app.get('/signin', (req, res) => {
	if (sessionData != undefined) {
		res.redirect('/modify')
	} else {
		res.render(views('signin'))
	}
})

app.post('/signin', (req, res) => {
	let sql = 'SELECT * FROM user WHERE email LIKE "' + req.body.email + '";'
	db.query(sql, (err, results) => {
		if (err) throw err;
		if (results.length > 0) {
			bcrypt.compare(req.body.password, results[0].password).then((password) => {
				if (password === true) {
					sessionData = req.session;
					sessionData.token = results[0].id;
					res.redirect('/');
					wr('Connexion worked out - Good password')
				} else {
					res.render(views('signin', {
						checkPassword: password
					}))
					wr('Connexion didn\'t worked out - Wrong password')
				}
			})
		} else {
			res.render(views('signin'));
			wr('Vous n\'êtes pas inscrit, ou l\'email renseignée n\'est pas bonne');
		}
	});
})

app.get('/signup', (req, res) => {
	if (sessionData != undefined) {
		res.redirect('/modify')
	} else {
		res.render(views('signup'))
	}
})

app.post('/signup', (req, res) => {
	if (req.body.password === req.body.repassword) {
		let hash = bcrypt.hashSync(req.body.password, 10);
		let sql = 'INSERT INTO user(`lastname`, `firstname`, `email`, `gender`, `password`, `created`, `modified`) VALUES("' + req.body.lastname + '", "' + req.body.firstname + '", "' + req.body.email + '", "' + req.body.gender + '", "' + hash + '", "' + myDate + '", "' + myDate + '")';
		db.query(sql, (err, result) => {
			if (err) throw err;
			wr('Insertion reussie : ' + result);
			res.send('You are now signed up');
		})
	} else {
		res.send('Use the same password please')
	}
});

app.get('/modify', (req, res) => {
	if (sessionData != undefined) {
		let sql = "SELECT `lastname`, `firstname`, `email` FROM user WHERE id = '" + sessionData.token + "' "
		db.query(sql, (err, results, fields) => {
			if (err) throw err;
			let user = results[0]
			res.render(views('modify'), {
				user: user,
			});
		});
	} else {
		res.redirect('/welcome')
	}
})

app.post('/modify', (req, res) => {
	let sql = "SELECT `password` FROM user WHERE id = '" + sessionData.token + "' "
	db.query(sql, (err, results, fields) => {
		if (err) throw err;
		let oldpassword = results[0].password
		if (bcrypt.compareSync(req.body.oldpassword, oldpassword)) {
			wr(JSON.stringify(oldpassword))
			if (req.body.newpassword === req.body.newpassword2) {
				let hash = bcrypt.hashSync(req.body.newpassword, 10);
				let sql = 'UPDATE user SET `firstname` = "' + req.body.firstname + '", `lastname` = "' + req.body.lastname + '", `email` = "' + req.body.email + '", `password` = "' + hash + '", `modified` = "' + myDate + '" WHERE `id` = "' + sessionData.token + '" ';
				db.query(sql, (err, result) => {
					if (err) throw err;
					res.send('Vos informations ont bien été modifiées');
				})
			} else {
				res.send('Les nouveaux mots de passe ne correspondent pas, veuillez réessayer')
			}
		} else {
			res.send('Votre ancien mot de passe ne correspond pas')
		}
	});
});

app.get('/disconnect', (req, res) => {
	if (sessionData != undefined) {
		sessionData = undefined
		res.redirect('/')
	} else {
		res.redirect('/welcome')
	}
	wr('Disconnected')
})

app.listen(settings.port.local, () => {
	wr(`Listening on port ${settings.port.local}`);
});