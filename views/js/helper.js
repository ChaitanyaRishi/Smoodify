const mood_selected = document.querySelector('#moodSelector');
let track1 = document.getElementById('trackId5').innerText.trim();
let track2 = document.getElementById('trackId6').innerText.trim();
let track3 = document.getElementById('trackId7').innerText.trim();
let track4 = document.getElementById('trackId8').innerText.trim();
let track5 = document.getElementById('trackId9').innerText.trim();
let seed = [track1, track2, track3, track4, track5];
seed = seed.join(',');
const token = document.getElementById('access_token').innerText;
const mood_music_container = document.querySelector('#display_mood_results');
mood_selected.addEventListener('change', (e) => {
    let selected_value = mood_selected.value;
    console.log(selected_value);
    mood_music_container.innerHTML = (`<h4> Songs for <b> ${selected_value} </b> mood: </h4>`);
    switch (selected_value) {
        case "happy": 
            func(seed, 0.7, 0.8);
            break;
        case "sad": 
            func(seed, 0.2, 0.2);
            break;
        case "party": 
            func(seed, 0.9, 0.9);
            break;
        case "chill": 
            func(seed, 0.56, 0.3);
            break;
        case "frustrated": 
            func(seed, 0.1, 0.7);
            break;
        case "random": 
            func(seed, Math.random(), Math.random());
            break;
    }
})

const func = async (seed, valence, energy) => {
    let songs = await getSongs(seed,valence, energy);
    console.log(songs.data);
    var songList = '<ul>';
    for(let track of songs.data.tracks) {
        songList += '<li>' + track.name + '</li>';
    }
    songList += '</ul>';
    mood_music_container.innerHTML = songList;
}


const getSongs = async (seed,valence,energy) => {
    try {
        let options = {
            headers: {
                'Authorization': 'Bearer ' + token,
            }
        }
        let songs = await axios.get(`https://api.spotify.com/v1/recommendations?seed_tracks=${seed}&target_valence=${valence}&target_energy=${energy}`, options);
        return songs;
    }
    catch{
        console.log('theres an error');
    }
    
}
