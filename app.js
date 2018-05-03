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
			if (req.body.searchHidden.length > 0) {
				req.body.searchHidden.toLowerCase()
				if (req.body.definition.length > 30) {
					let definition = req.body.definition.toLowerCase().replace(/'/g, '\\\'');
					let sql = "INSERT INTO word (`user_id`, `name`, `definition`, `created`, `modified`) VALUES (" + sessionData.token + ", '" + name + "', '" + definition + "', '" + myDate + "', '" + myDate + "')";
					db.query(sql, (err, results, fields) => {
						if (err) throw err;
						wr('Nouvelle définition créee');
						wr(name)
						res.redirect('/definition?word=' + name)
					})
				} else {
					let message = "La définition est trop courte"
					res.render(views('write'), {
						message: message,
					});
				}
			} else {
				let message = "Vous devez rentrer le nom d'une définition à définir"
				res.render(views('write'), {
					message: message,
				});
			}
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
				} else if (password === false) {
					let message = 'Le mot de passe est incorrect'
					res.render(views('signin'), {
						message: message,
					});
				} else {
					let message = "Pour pouvoir donner une définition et sauvegarder des mots, vous devez d’abord vous inscrire."
					res.render(views('signin'), {
						message: message,
					});
				}
			})
		} else {
			let message = "Vous n\'êtes pas inscrit, ou l\'email renseignée n\'est pas bonne"
			res.render(views('signin'), {
				message: message,
			});
		}
	});
})

app.get('/signup', (req, res) => {
	if (sessionData != undefined) {
		res.redirect('/modify')
	} else {
		let message = "Pour pouvoir donner une définition et sauvegarder des mots, vous devez d’abord vous inscrire";
		res.render(views('signup'), {
			message: message,
		});
	}
})

app.post('/signup', (req, res) => {
	let regExpEmail = /^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/;
	let sql = "SELECT `email` FROM user u WHERE u.email = '" + req.body.email + "';"
	db.query(sql, (err, results, fields) => {
		if (err) throw err;
		if (results.length == 0) {
			//req.body.email.length > 3 && req.body.email.match(regExpEmail
			if (req.body.email.length > 3 && req.body.email.match(regExpEmail)) {
				if (req.body.password === req.body.repassword) {
					if (req.body.lastname.length > 2 && req.body.firstname.length > 2) {
						let hash = bcrypt.hashSync(req.body.password, 10);
						let sql = 'INSERT INTO user(`lastname`, `firstname`, `email`, `gender`, `password`, `created`, `modified`) VALUES("' + req.body.lastname + '", "' + req.body.firstname + '", "' + req.body.email + '", "' + req.body.gender + '", "' + hash + '", "' + myDate + '", "' + myDate + '")';
						db.query(sql, (err, result) => {
							if (err) throw err;
							wr('Insertion reussie : ' + result);
							res.redirect('/')
						})
					} else {
						let message = "Le nom et/ou prénom ne sont pas valides"
						res.render(views('signup'), {
							message: message,
						});
					}
				} else {
					let message = "Utilisez le même mot de passe"
					res.render(views('signup'), {
						message: message,
					});
				}
			} else {
				let message = "L\'email rentré est invalide"
				res.render(views('signup'), {
					message: message,
				});
			}
		} else {
			let messageEmail1 = "L\'email renseigné est déja utilisé, vous pouvez vous"
			let messageEmail2 = "connecter"
			res.render(views('signup'), {
				messageEmail1: messageEmail1,
				messageEmail2: messageEmail2
			});
		}
	})
});

app.get('/api/test', (req, res) => {
	let sql = "SELECT `email` FROM user u WHERE u.email = 'brieuc@gmail.com'"
	db.query(sql, (err, results, fields) => {
		if (results) {
			res.send(results[0].email)
		} else {
			wr('nope')
		}
	})
});

app.get('/api/autocomplete', (req, res) => {
	let sql = "SELECT DISTINCT w.name FROM word w;"
	db.query(sql, (err, results, fields) => {
		res.send(results)
	})
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