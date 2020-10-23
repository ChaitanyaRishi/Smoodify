  const express = require("express");
  const app = express();
  const router = express.Router();
  const path = require('path');
  const cors = require('cors');
  const cookieParser = require('cookie-parser');
  const queryString = require('querystring');
  let accessToken, refreshToken;
  const request = require('request');
  let tokenGen = require('./views/utils/grabAccessToken');
  let userData = require('./views/utils/grabUsersData');
  let userInfo, artistInfo, trackInfo, updatedInfo;
  let trackIds = {};

  require('dotenv').config();

  //enter your spotify developer details here
  let client_id = process.env.client_id;
  let redirect_uri = process.env.redirect_uri;


  //this is to generate random state variable which is used as some security measure
  let generateRandomString = function(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  let stateKey = 'spotify_auth_state';

  app.set('view engine', 'ejs');

  console.log('dirname: ',__dirname);
  console.log('path: ', path);
  app.use(express.static(__dirname + '/views')).use(cors()).use(cookieParser());

  router.get('/', (req, res) => {
    console.log(path);
    res.render('index');
  })


   router.get('/test', (req, res) => {
    res.send('test site');
  })


  router.get('/login', (req, res) => {
    let state = generateRandomString(16);
    let scope = 'streaming, user-read-private user-read-email user-top-read';
    
    res.cookie(stateKey, state);

    res.redirect('https://accounts.spotify.com/authorize?' + queryString.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
  })

  router.get('/callback', (req, resp) => {
    let state = req.query.state;
    let code = req.query.code;
    let storedState = req.cookies ? req.cookies[stateKey]:null;
    if(state === null || state !== storedState) {
      //something is wrong
      resp.send("something went wrong with your request");
    }
    else {
        resp.clearCookie(stateKey);
        tokenGen.getTokenFromCode(code).then((tokens) => {
          userData.getData(tokens.access_token).then(res => {
            let data = res;
            refreshToken = tokens.refresh_token;
            accessToken = tokens.access_token;
            data['access_token'] = tokens.access_token;
            data['refresh_token'] = tokens.refresh_token;
            data['recommendationInfo'] = false;
            userData.getArtists(accessToken).then((res) => {
              let i = 0;
              res.items.forEach(item => {
                if(i <= 9) {
                  i += 1;
                  data[`artist_${i}`] = item.name;
                }
              })
              userData.getTracks(accessToken).then((res) => {
                let i = 0;
                res.items.forEach(item => {
                  if(i <= 9) {
                    trackIds[i] = item.id;
                    i += 1;
                    data[`track_${i}`] = item.name;
                  }
                })
                data['recommendationInfo'] = false;
                updatedInfo = data;
                resp.render('./logged_in.ejs', updatedInfo);
              })
            }).catch(err => console.log('errrrrr: ', err));
           
          });
        });
    }
  })

  router.get('/getRecommendations', (req, response) => {
    let seed = [trackIds[0], trackIds[1], trackIds[2], trackIds[3], trackIds[4]];
    seed = seed.join(',')
    userData.getRecommendations(accessToken, seed).then(res => {
      let recommendations = {};
      let i = 0;
      res.tracks.forEach(item => {
        if(i <= 9) {
          i += 1;
          recommendations[`rec_${i}`] = item.name;
          recommendations[`uri_${i}`] = item.uri;
        }
      })
      recommendations['recommendationInfo'] = true;
      updatedInfo = {...updatedInfo,...recommendations};
      response.render('./logged_in.ejs', updatedInfo);
    });
    
  }) 

  const host = '0.0.0.0';
  const port = process.env.PORT || 8888;

  app.use('/', router);
  app.listen(port, host, function () {
    console.log('server has started');
  });
