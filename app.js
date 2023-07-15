const express = require('express');
const {get} = require("http");
const querystring = require("querystring");
const request = require('request');
const cors = require('cors');
require('dotenv').config();

const database = require('./database.js');
const {response} = require("express");
const instance = new database();

const redirect = process.env.REDIRECT_URI;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const scopes = 'user-read-email user-read-private user-top-read';

const app = express();
app.set('view engine', 'ejs');

app.use(express.static('.'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false}));

// mysql
app.post('/insert', (request, response) => {
    console.log(request.body);
    const username = request.body.username;
    const token = request.body.token;
    const firstLogin = request.body.firstLogin;
    const db = database.getServiceInstance();
    const result = instance.postInsert(username, token, firstLogin);
    result.then(data => response.json({data : data})).catch(err => console.log(err));
})

app.get('/getdata', (request, response) => {
    const db = database.getServiceInstance();
    const result = instance.getEntries();

    result.then(data => response.json({data : data})).catch(err => console.log(err));
})

app.get('/getusername/:name', (request, response) => {
    const username = request.params.name;
    const db = database.getServiceInstance();
    const result = instance.getUsername(username);
    result.then(data => response.json({data : data})).catch(err => console.log(err));
})

app.get('/insertsongs/:name/:school', (request, response) => {
    const username = request.params.name;
    const school = request.params.school;
    const db = database.getServiceInstance();
    instance.insertSchool(school, username);
    getTopTracks(username).then(data => addTracksAndLinkUser(data, username)).catch(err => console.log('error: ' + err));
})

// spotify API routes
app.get('', function(req, res) {
    console.log('home');
    // res.sendFile(__dirname + '/views/login.ejs');
    res.render('login');
});

app.get('/login', function(req, res) {
   console.log('login');
   const state = '34fFs29kd09';
   res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scopes,
        redirect_uri: redirect,
        state: state
    }));
});

app.get('/callback', function(req, res) {
    console.log('callback');
    const code = req.query.code || null;
    const state = req.query.state || null;

    if(state === null) {
        alert('state mismatch');
    } else {
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };
        request.post(authOptions, async function(error, response, body) {
            if (!error && response.statusCode === 200) {
                const access_token = body.access_token;
                const username = await getSpotifyUsername(access_token);
                const firstLogin = await isFirstTimeLogin(username);

                // const topTracks = await getTopTracks(username);
                // console.log(topTracks.items[0].name);
                // insert username and token into database
                await fetch('http://localhost:8080/insert', {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        username: username,
                        token: access_token,
                        firstLogin: firstLogin
                    })
                })
            }
            res.render('home', {username: await getSpotifyUsername(body.access_token)});
        })
    }
    // res.sendFile(__dirname + '/views/home.ejs');
});

function addTracksAndLinkUser(songs, username) {
    songs.items.forEach(track => {
        instance.insertSong(track.name, track.artists[0].name, track.album.name, track.external_urls.spotify, track.id)
            .then(instance.linkSongWithUser(track.id, username)
                .catch(err => console.log('error: ' + err)))
            .catch(err => console.log('error: ' + err));
    });
}

async function getSpotifyUsername(access_token) {
    const options = {
        url: 'https://api.spotify.com/v1/me/',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
    };
    return new Promise((resolve, reject) => {
        request.get(options, async function(error, response, body) {
            if(error) {
                reject(error);
            } else {
                resolve(body.id);
            }
        })
    });
}

async function isFirstTimeLogin(spotifyID) {
    return new Promise((resolve) => {
        fetch('http://localhost:8080/getusername/' + spotifyID).then(response => response.json()).then(response => {
            resolve(response.data.length === 0);
        });
    })
}

async function getTopTracks(username) {
    const access_token = await instance.getUserToken(username);
    const options = {
        url: 'https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=25&offset=0',
        headers: { 'Authorization': 'Bearer ' + access_token[0].token},
        json: true
    };
    return new Promise((resolve, reject) => {
        request.get(options, async function(error, response, body) {
            if(error) {
                reject(error);
            } else {
                resolve(body);
            }
        })
    })
}

app.listen(8080);
console.log("Listening on 8080");