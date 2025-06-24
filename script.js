import { albums } from './albums.js';

const songListContainer = document.getElementById('songListContainer');
const homePage = document.getElementById('homePage');
const backButtonEl = document.getElementById('backButton');
const musicPlayerHeaderEl = document.getElementById('musicPlayerHeader');
const groupsPlayerEL = document.querySelectorAll('.group-player');
const currentProgressEl = document.getElementById('currentProgress');
const currentSecEl = document.getElementById('currentSecond');
const maxTimerEl = document.getElementById('maxTimer');
const togglePlayAndPauseEl = document.getElementById('togglePlayAndPause');
const repeatButtonEl = document.getElementById('repeatSong');
const shuffleButtonEl = document.getElementById('shuffleSong');
const nextSongEl = document.getElementById('nextSong');
const prevSongEl = document.getElementById('prevSong');
const videoBgContainer = document.getElementById('videoBgContainer');
const backgroundVideo = document.getElementById('backgroundVideo');
const volumeSliderEl = document.getElementById('volumeSlider');
const iconVolumeStatusEl = document.getElementById('iconStatusVolume');
const closeShortButtonEl = document.getElementById('closeShortButton');
const displayInfoEl = document.getElementById('playerInfo');
const progressPlayerEl = document.getElementById('progressPlayer');
const lyricContainerEl = document.getElementById('lyricContainer');
const speedSliderEl = document.getElementById('playSpeedSlider');

const currentPage = 'current-page';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const modes = ['next', 'previous', 'repeat', 'shuffle'];

let isTransitioning = false;
let currentData = null;
let audio = null;
let animationFrameId = null;
let isPlaying = false;
let currentMode = [];
let lyricIndex = 0;
let lastLyricIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    (function setupEventListeners() {
        backButtonEl.addEventListener('click', backToHome);
        closeShortButtonEl.addEventListener('click', backToHome);
        progressInteraction();
        displayInfoInteraction();
    })();

    (function renderSongList() {
        albums.forEach(song => {
            const songListItem = document.createElement('li');
            songListItem.setAttribute('data-id', song.id);
            songListItem.setAttribute('class', 'song-list');
            songListItem.innerHTML = `
                <img class="currentSongPicture" src="${song.albumArtUrl}" alt="${song.title}">
                <div class="current-song-detail">
                    <h3 class="currentSongName">${song.title}</h3>
                    <p class="currentSongArtist">${song.artist}</p>
                </div>
            `;
            songListContainer.appendChild(songListItem);
        });
        listInteraction();
    })();
});

function listInteraction() {
    const songListItems = document.querySelectorAll('.song-list');
    songListItems.forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            const listItemId = e.target.dataset.id;
            currentBackgroundVideo(listItemId);
            videoBgContainer.classList.add('list-hovering');
        });
        item.addEventListener('mouseleave', () => {
            videoBgContainer.classList.remove('list-hovering');
        });
        item.addEventListener('click', (e) => {
            const listItemId = e.target.closest('.song-list').dataset.id;
            handlePlayerPage(listItemId);
        });
    });
}
function handlePlayerPage(songId) {
    cleanupPlayer();
    currentData = albums.find(s => s.id == songId);
    audio = new Audio(currentData.audioSrc);
    setupAudioEvents();
    showMusicPlayer();
}

function setupAudioEvents() {
    audio.onloadedmetadata = () => {
        const duration = audio.duration;
        const totalMinutes = Math.floor(duration / 60);
        const totalSeconds = Math.floor(duration % 60);
        const formatSeconds = totalSeconds < 10 ? '0' + totalSeconds : totalSeconds;
        audio.volume = volumeSliderEl.value / 100;
        maxTimerEl.innerHTML = `${totalMinutes}:${formatSeconds}`;
    };

    audio.onended = () => {
        checkCurrentMode();
        isPlaying = false;
        togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-play"></i>';
        cleanupInterval();
    };
}

function showMusicPlayer() {
    startPlayer();
    updateUI();
    switchToPlayerPage();
    renderLyrics();
}

function startPlayer() {
    isPlaying = true;
    togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-pause"></i>';
    
    cleanupInterval();
    renderLyrics();

    audio.play()
        .then(() => {
            progressTracker();
        })
        .catch(error => console.warn('Playback failed:', error));
}

function progressInteraction () {
    togglePlayAndPauseEl.addEventListener('click', togglePlayAndPause);

    nextSongEl.addEventListener('click', (e) => handleControlPlayer(0, e));
    prevSongEl.addEventListener('click', (e) => handleControlPlayer(1, e));
    repeatButtonEl.addEventListener('click', (e) => handleControlPlayer(2, e));
    shuffleButtonEl.addEventListener('click', (e) => handleControlPlayer(3, e));
    volumeSliderEl.addEventListener('input', (e) => updateVolume(e));
    volumeSliderEl.addEventListener('change', (e) => updateVolume(e));
    speedSliderEl.addEventListener('input', (e) => updateRateAudio(e));
    speedSliderEl.addEventListener('change', (e) => updateRateAudio(e));
    iconVolumeStatusEl.addEventListener('click', toggleVolume);

    progressPlayerEl.addEventListener('mouseenter' , (e) => updateAudioTime(e));
    // progressPlayerEl.addEventListener('mousemove' , (e) => updateAudioTime(e));
    progressPlayerEl.addEventListener('input' , (e) => updateAudioTime(e));
    progressPlayerEl.addEventListener('click' , (e) => updateAudioTime(e));
}

function progressTracker() {
    if (!audio || !isPlaying || isTransitioning) return;
    const currentTime = audio.currentTime;
    const duration = audio.duration;
    const progress = (currentTime / duration) * 100;

    currentProgressEl.style.width = progress + '%';
    currentProgressEl.classList.add('running');

    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);

    const formatMinute = minutes < 10 ? `${minutes}` : minutes;
    const formatSecond = seconds < 10 ? `0${seconds}` : seconds;

    currentSecEl.innerHTML = `${formatMinute}:${formatSecond}`;
    animationFrameId = requestAnimationFrame(progressTracker);
}

function togglePlayAndPause() {
    if (!audio) return;

    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

function pauseAudio() {
    isPlaying = false;
    audio.pause();
    togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-play"></i>';
    currentProgressEl.classList.remove('running');

    cleanupInterval();
}

function playAudio() {
    if (audio.ended) {
        initialVideoBackground();
        renderLyrics();
    }
    audio.play()
        .then(() => {
            isPlaying = true;
            togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-pause"></i>';
            currentProgressEl.classList.add('running');
            progressTracker();
        })
        .catch(error => console.warn('Playback failed:', error));
}

function updateUI() {
    musicPlayerHeaderEl.innerHTML = `
    <img id="currentSongPicture" src="${currentData.albumArtUrl}" alt="${currentData.title}">
    <div class="current-song-detail">
        <h3 id="currentSongName">${currentData.title}</h3>
        <p id="currentSongArtist">${currentData.artist}</p>
    </div>
    `;
}

function updateVolume(e) {
    const levelVolume = e.target.value / 100;
    audio.volume = levelVolume;
}

function toggleVolume() {
    if (!audio.muted) {
        iconVolumeStatusEl.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    } else {
        iconVolumeStatusEl.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    }
    audio.muted = !audio.muted;
}

function switchToPlayerPage() {
    initialVideoBackground();
    homePage.classList.remove(currentPage);

    groupsPlayerEL.forEach(group => {
        group.classList.add(currentPage);
    });
    
    videoBgContainer.classList.add('player-active');
}

function backToHome() {
    cleanupPlayer();
    resetUI();
    groupsPlayerEL.forEach(group => {
        group.classList.remove(currentPage);
    });
    videoBgContainer.classList.remove('player-active');
    homePage.classList.add(currentPage);
}

// Control player function 

function handleControlPlayer(idxMode, e) {
    switch (idxMode) {
        case 0:
            playNextSong();
            break;
        case 1:
            playPreviousSong();
            break;
        case 2:
            if (currentMode.length > 0) {
                currentMode.pop();
                currentMode.push(idxMode);
            } else {
                currentMode.push(idxMode);
            }
            console.log(currentMode);
            togglePlayerMode(e);
            break;
        case 3:
            if (currentMode.length > 0) {
                currentMode.pop();
                currentMode.push(idxMode);
            } else {
                currentMode.push(idxMode);
            }
            console.log(currentMode);
            togglePlayerMode(e);
            break;

    }
}

async function checkCurrentMode() {
    console.log(currentMode);

    if (currentMode.length > 0) {
        switch (parseInt(currentMode.toString() , 10)) {  
            case 2:
                repeatMode();
                break;
            case 3:
                shufffleMode();
                break;
            default:
                console.log("This Mode doesn't match !!");
        }
    }
}

function togglePlayerMode(e) {
    const isCurrentMode = e.target.classList.contains('current-mode');
    const currentModeEl = document.querySelector('.current-mode');
    
    currentModeEl?.classList.remove('current-mode');

    if (!isCurrentMode) {
        e.target.classList.add('current-mode');
    }
}

async function playNextSong() {
    if (isTransitioning) return;
    isTransitioning = true;
    nextSongEl.setAttribute('disabled' , true)
    
    const currentIndex = albums.findIndex(song => song.id === currentData.id);
    const nextIndex = (currentIndex + 1) % albums.length;
    const nextSongId = albums[nextIndex].id;
    await switchSong(nextSongId);
    
    nextSongEl.removeAttribute('disabled')
    isTransitioning = false;
}

async function playPreviousSong() {
    if (isTransitioning) return;
    isTransitioning = true;
    nextSongEl.setAttribute('disabled' , true)

    const currentIndex = albums.findIndex(song => song.id === currentData.id);
    const prevIndex = currentIndex - 1 < 0 ? albums.length - 1 : currentIndex - 1;
    const prevSongId = albums[prevIndex].id;
    await switchSong(prevSongId);

    nextSongEl.removeAttribute('disabled')
    isTransitioning = false;
}

async function switchSong(songId) {
    cleanupPlayer();
    await delay(1000)
    currentBackgroundVideo(songId);
    handlePlayerPage(songId);
}

async function repeatMode() {
    await delay(1500);
    resetUI();
    initialVideoBackground();
    cleanupInterval();
    startPlayer();
    renderLyrics();
}

async function shufffleMode() {
    await delay(1500);
    const currentIndex = albums.findIndex(s => s.id === currentData.id);
    let randomIndex = null;
    while (randomIndex === null || randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * albums.length);
    } 
    await switchSong(randomIndex);
}

async function updateAudioTime(e) {
    if (!audio || !audio.duration) return;

    const currentEvent = e.type;
    const rect = progressPlayerEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percent = Math.abs(Math.round((mouseX / progressPlayerEl.offsetWidth) * 100));
    const newTime = Math.abs(Math.round((percent / 100) * audio.duration));
    
    if (currentEvent === 'click') {
        if (!isPlaying) startPlayer();
        
        if (audio.ended) {
            cleanupInterval();
            startPlayer();
        }

        audio.pause;
        audio.currentTime = newTime;
        isTransitioning = true;
        await delay(200);
        audio.play;
        isTransitioning = false;
        renderLyrics();
        progressTracker();
    }
}

function displayInfoInteraction() {
    volumeSliderEl.addEventListener('mouseenter' , (e) => {
        displayInfoEl.style.opacity = '1';
        updateDisPlayInfo(e);
    });
    volumeSliderEl.addEventListener('mouseleave' , () => {
        displayInfoEl.style.opacity = '0';
        updateDisPlayInfo();
    });
    volumeSliderEl.addEventListener('input' , (e) => {
        updateDisPlayInfo(e);
    });

    speedSliderEl.addEventListener('mouseenter' , (e) => {
        displayInfoEl.style.opacity = '1';
        updateDisPlayInfo(e);
    });
    speedSliderEl.addEventListener('mouseleave' , () => {
        displayInfoEl.style.opacity = '0';
        updateDisPlayInfo();
    });
    speedSliderEl.addEventListener('input' , (e) => {
        updateDisPlayInfo(e);
    });
}

function updateDisPlayInfo (e) {
    const srcElementId = e?.srcElement.id;
    console.log(srcElementId)
    if (srcElementId === 'volumeSlider') {
        if (audio.muted) return displayInfoEl.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>'
        displayInfoEl.innerHTML = (Math.floor(audio.volume * 100)) + '%'
    } else if (srcElementId === 'playSpeedSlider') {
        displayInfoEl.innerHTML = 'x' + (Math.abs(audio.playbackRate));
    }
}

function updateRateAudio(e) {
    const currentRate = e.target.value;
    console.log(currentRate);
    audio.playbackRate = currentRate;
}
// Lyrics Tracking

function renderLyrics() {
    lyricContainerEl.innerHTML = ''
    const lyrics = currentData.lyrics;
    lyrics.forEach((lyric) => {
        const lyricLine = document.createElement('div');
        lyricLine.setAttribute('class' , 'lyric-line'); 
        lyricLine.innerHTML = lyric.text;
        lyricContainerEl.appendChild(lyricLine);
    });
    lyricIndex = 0;
    animationFrameId = requestAnimationFrame(lyricTracking);
}

function lyricTracking() {
    if (!audio) return;

    const lyrics = currentData.lyrics;
    (function updateLyric() {
        for (let i = lyricIndex; i < lyrics.length; i++) {
            // console.log(lyrics[i].time);
            if (audio.currentTime >= lyrics[i].time) {
                lyricIndex = i;
                hightLightLyric(i);
            } else {
                break;
            }
        }
        animationFrameId = requestAnimationFrame(lyricTracking);
    })();
}

function hightLightLyric(lyricIndex) {
    const lyricLines = document.querySelectorAll('.lyric-line');

    if (lyricIndex !== lastLyricIndex || lastLyricIndex == 0) {
        lastLyricIndex = lyricIndex;
        lyricLines.forEach((line , index) => {
            if (lyricIndex === index) { 
                lyricLines[index].classList.add('current-lyric');
                lyricLines[index].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'  
                });
            } else {
                lyricLines[index].classList.remove('current-lyric');
            }
        });
    }
}


// utils function 

function cleanupPlayer() {
    cleanupInterval();
    resetAudio();
    resetUI();
}

function cleanupInterval() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function resetAudio() {
    if (audio) {
        audio.pause();
        audio.src = '';
        audio.load();
        audio = null;
    }
    isPlaying = false;
}

function resetUI() {
    currentProgressEl.style.width = '0%';
    currentProgressEl.classList.remove('running');
    currentSecEl.innerHTML = '0:00';
    togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-play"></i>';
}

function currentBackgroundVideo(songId) {
    initialVideoBackground();
    const song = albums.find(s => s.id == songId);
    if (song) {
        backgroundVideo.src = song.videoBgSrc;
    }
}

function initialVideoBackground() {
    backgroundVideo.currentTime = 0;
}
