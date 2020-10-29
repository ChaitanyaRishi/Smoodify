window.onSpotifyWebPlaybackSDKReady = () => {
    const token = document.getElementById('access_token').innerText;
    console.log(token);
    // const uri = document.getElementById('val1').innerText;
    let deviceId = null;
    const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => {
            cb(token);
        }
    });

    // Error handling
    player.addListener('initialization_error', ({
        message
    }) => {
        console.error(message);
    });
    player.addListener('authentication_error', ({
        message
    }) => {
        console.error(message);
    });
    player.addListener('account_error', ({
        message
    }) => {
        console.error(message);
    });
    player.addListener('playback_error', ({
        message
    }) => {
        console.error(message);
    });

    // Playback status updates
    player.addListener('player_state_changed', state => {
        console.log(state);
    });

    // Ready
    player.addListener('ready', ({
        device_id
    }) => {
        deviceId = device_id;
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({
        device_id
    }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.connect().then(() => {
        console.log('connected....');
    });
    const play = ({
        spotify_uri,
        playerInstance: {
            _options: {
                getOAuthToken,
                id
            }
        }
    }) => {
        getOAuthToken(access_token => {
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    uris: [spotify_uri.trim()]
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
            }).then(response => {
                console.log(response)
            }).then(result => console.log(
                result)).catch(
                err => console.log('errror:', err));
        });
    };
    for (let i = 1; i <= 10; i++) {
        document.getElementById(`play${i}`).addEventListener('click', () => {
            const uri = document.getElementById(`rec_val${i}`).innerText;
            // console.log('uriiii: ', uri);
            play({
                playerInstance: player,
                spotify_uri: uri
            })
        })
    }
    for (let i = 1; i <= 10; i++) {
        document.getElementById(`mood_play${i}`).addEventListener('click', () => {
            const uri = document.getElementById(`mood_val${i}`).innerText;
            play({
                playerInstance: player,
                spotify_uri: uri
            })
        })
    }
    document.getElementById('pause1').addEventListener('click', () => {
        player.pause().then(() => {
            console.log('Paused!');
        });
    })
    document.getElementById('resume1').addEventListener('click', () => {
        player.resume().then(() => {
            console.log('Resumed!');
        });
    })
    document.getElementById('pause2').addEventListener('click', () => {
        player.pause().then(() => {
            console.log('Paused!');
        });
    })
    document.getElementById('resume2').addEventListener('click', () => {
        player.resume().then(() => {
            console.log('Resumed!');
        });
    })
};