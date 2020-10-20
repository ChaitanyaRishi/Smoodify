  const express = require("express");
  const app = express();
  const router = express.Router();
  const path = require('path');
  const cors = require('cors');
  const cookieParser = require('cookie-parser');
  const queryString = require('querystring');
  // const axios = require('axios');
  let accessToken, refreshToken;
  const request = require('request');
  // import {getTokenFromCode, getTokenFromRefresh} from './utils/grabAccessToken';
  let tokenGen = require('./views/utils/grabAccessToken');
  let userData = require('./views/utils/grabUsersData');
  let userInfo, artistInfo, trackInfo, updatedInfo;
  let trackIds = {};

  require('dotenv').config();

  //enter your spotify developer details here
  let client_id = process.env.client_id;
  let client_secret = process.env.client_secret;
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
    // res.sendFile(path.join(__dirname+'/public/index.html'));
    res.render('index');
  })

  // router.get('/dashboard', (req, res) => {
  //   res.render('./logged_in.ejs', req.body.data);
  // })

   router.get('/test', (req, res) => {
    res.send('test site');
  })

  // router.get('/refresh', )


  router.get('/login', (req, res) => {
    let state = generateRandomString(16);
    let scope = 'user-read-private user-read-email user-top-read';
    
    res.cookie(stateKey, state);

    res.redirect('https://accounts.spotify.com/authorize?' + queryString.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
    //send the req. data to the spotify accounts server
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

  // router.get('/getArtists', function(req, response) {
  //   console.log(accessToken);
  //   userData.getArtists(accessToken).then((res) => {
  //     let artist_names = {};
  //     let i = 0;
  //     res.items.forEach(item => {
  //       if(i <= 9) {
  //         i += 1;
  //         artist_names[`artist_${i}`] = item.name;
  //       }
  //     })
  //     artistInfo = artist_names;
  //     artist_names['recommendationInfo'] = false;
  //     artist_names['trackInfo'] = false;
  //     artist_names['artistInfo'] = true;
  //     artist_names['userInfo'] = true;
  //     updatedInfo = {...userInfo,...artist_names};
  //     response.render('./logged_in.ejs', updatedInfo);
  //   }).catch(err => console.log('errrrrr: ', err));
  // })

  // router.get('/getTracks', (req, response) => {
  //   console.log(accessToken);
  //   userData.getTracks(accessToken).then((res) => {
  //     let track_names = {};
  //     let i = 0;
  //     res.items.forEach(item => {
  //       if(i <= 9) {
  //         trackIds[i] = item.id;
  //         i += 1;
  //         track_names[`track_${i}`] = item.name;
  //       }
  //     })
  //     console.log('track info: ', res);
  //     trackInfo = track_names;
  //     // track_names['artistInfo'] = true;
  //     // track_names['userInfo'] = true;
  //     track_names['recommendationInfo'] = false;
  //     track_names['trackInfo'] = true;
  //     updatedInfo = {...updatedInfo,...track_names};
  //     response.render('./logged_in.ejs', updatedInfo);
  //   }).catch(err => console.log('errrrrr: ', err));
  // })

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
        }
      })
      // track_names['artistInfo'] = true;
      // track_names['userInfo'] = true;
      recommendations['recommendationInfo'] = true;
      updatedInfo = {...updatedInfo,...recommendations};
      response.render('./logged_in.ejs', updatedInfo);
    });
    
  }) 

  //replace this with the helper function
  router.get('/refresh_token', function(req, res) {

    // requesting access token from refresh token
    let refresh_token = refreshToken;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
  });


  app.use('/', router);
  app.listen(process.env.port || 8888);

  console.log('running at port 8888');
