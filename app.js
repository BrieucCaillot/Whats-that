const express = require('express');
const twig = require('twig');
const bodyParser = require('body-parser');
const stringify = require('json-stringify')
const fs = require('fs');
const yaml = require('js-yaml');

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
app.use(bodyParser.urlencoded({
    extented: false
}));

// console.log
var wr = function (str) {
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
// if (settings.mysql.cnct == true) {
//     var db = mysql.createConnection({
//         host: settings.mysql.host,
//         user: settings.mysql.user,
//         password: settings.mysql.pssw,
//         database: settings.mysql.dbts
//     })
// }
// try connection
// db.connect((err) => {
//     if (err) throw err;
// console.log('Connexion succeed');
// });

// Routes
app.get('/', (req, res) => {
    res.render(views('index'))
})

app.get('/definition', (req, res) => {
    res.render(views('definition'))
})

app.get('/write', (req, res) => {
    res.render(views('write'))
})&

app.get('/results', (req, res) => {
    res.render(views('results'))
})

app.get('/bookmarks', (req, res) => {
    res.render(views('bookmarks'))
})

app.get('/welcome', (req, res) => {
    res.render(views('welcome'))
})

app.get('/signin', (req, res) => {
    res.render(views('signin'))
})

app.get('/signup', (req, res) => {
    res.render(views('signup'))
})

app.get('/modify', (req, res) => {
    res.render(views('modify'))
})

app.listen(settings.port.local, () => {
    wr(`Listening on port ${settings.port.local}`);
});

