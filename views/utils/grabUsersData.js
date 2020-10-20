const axios = require('axios');
const qs = require('querystring');

let getData = (access_token) => {
    let options = {
        headers: {
            'Authorization': 'Bearer ' + access_token,
        }
    }
    return axios.get('https://api.spotify.com/v1/me', options).then(res => {
        return res.data;
    }).catch(err => console.log("err: ", err)); 
}


let getArtists = (access_token) => {
    let options = {
        headers: {
            'Authorization': 'Bearer ' + access_token,
        }
    }
    return axios.get('https://api.spotify.com/v1/me/top/artists', options).then(res => {
        return res.data;
    }).catch(err => console.log("err: ", err)); 
}

let getTracks = (access_token) => {
    let options = {
        headers: {
            'Authorization': 'Bearer ' + access_token,
        }
    }
    return axios.get('https://api.spotify.com/v1/me/top/tracks', options).then(res => {
        return res.data;
    }).catch(err => console.log("err: ", err)); 
}

let getRecommendations = (access_token, seed) => {
    let options = {
        headers: {
            'Authorization': 'Bearer ' + access_token,
        }
    }
    // let data = {
    //     seed_tracks: "0c6xIDDpzE81m2q797ordA",
    //     seed_artists: "4NHQUGzhtTLFvgF5SZesLK",
    //     seed_genres: "classical,country"
    // };
    return axios.get(`https://api.spotify.com/v1/recommendations?seed_tracks=${seed}`, options).then(res => {
        return res.data;
    }).catch(err => console.log("err: ", err)); 
}


module.exports = {
    'getData': (token) => {
        return getData(token);
    },
    'getArtists': (token) => {
        return getArtists(token);
    },
   'getTracks': (token) => {
        return getTracks(token);
    },
    'getRecommendations': (token, seed_uri) => {
        return getRecommendations(token, seed_uri);
    }
}