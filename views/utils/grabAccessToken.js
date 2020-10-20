const axios = require('axios');
const queryString = require('querystring');

let grabTokenCode = (code) => {
    let data = queryString.stringify({
        grant_type: 'authorization_code',
        redirect_uri: process.env.redirect_uri,
        code: code,
    });
    let options = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': process.env.auth_code,
      }
    }
    //this is the most important function: it gives us the access token that we need to use in other calls!
    return axios.post('https://accounts.spotify.com/api/token',data, options).then(res => {
        let access_token = res.data.access_token,
            refresh_token = res.data.refresh_token;
        return {access_token, refresh_token};
    }).catch(err => console.log('oh ohh', err));
};

let grabTokenRefresh = (token) => {
    let refresh_token = token;
    let data = queryString.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
    });
    let options = {
        headers: {
          'Authorization': process.env.auth_code,
        }
    }
    return axios.post('https://accounts.spotify.com/api/token', data, options).then((res) => {
      return res.data.access_token;
    }).catch(err => console.log(err));
}


module.exports = {
    getTokenFromRefresh: (refresh_token) => {
      return grabTokenRefresh(refresh_token);
    },
    getTokenFromCode: (code) => {
        return grabTokenCode(code);
    },
   
}