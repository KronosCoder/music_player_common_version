import { songs } from './songs.js'

// DOM Element
const songList = document.getElementById('songList')
const videoBgContainer = document.getElementById('videoBgContainer')
const backgroundVideo = document.getElementById('backgroundVideo')
const songListContainer = document.getElementById('songListContainer')
const homePage = document.getElementById('homePage')
const playerPageContainerEl = document.getElementById('playerPageContainer')
const backButtonEl = document.getElementById('backButton')
const musicPlayerHeaderEl = document.getElementById('musicPlayerHeader')
const groupsPlayerEL = document.querySelectorAll('.group-player')
const currentProgressEl = document.getElementById('currentProgress')
const currentSecEl = document.getElementById('currentSec')
const maxTimerEl = document.getElementById('maxTimer')
const togglePlayAndPauseEl = document.getElementById('togglePlayAndPause')

const currentPage = 'current-page'

function renderSongList () {
    songs.forEach((song , index) => {
        // console.log(song)
        const songListItem = document.createElement('li')
        // set list's attribute
        songListItem.setAttribute('data-id' , song.id)
        songListItem.setAttribute('class' , 'song-list')
        // set inner html
        songListItem.innerHTML = `
        <img src="${song.albumArtUrl}" alt="${song.title}">
            <div class="song-detail">
            <h3 class="title">${song.title}</h3>
            <p class="artist">${song.artist}</p>
        </div>
        `
        // append list content to parent element
        songListContainer.appendChild(songListItem)
    })

    // call interaction function 
    listInteraction()
}

function listInteraction () {
    const songListItems = document.querySelectorAll('.song-list')
    songListItems.forEach((item , index) => {
        item.addEventListener('mouseenter' , (e) => {
            currentBackgroundVideo(e.target.dataset.id)
            videoBgContainer.classList.add('list-hovering')
        })
        item.addEventListener('mouseleave' , () => {
            videoBgContainer.classList.remove('list-hovering')
        })
        item.addEventListener('click' , (e) => {
            const listItemId = e.target.closest('.song-list').dataset.id
            handlePlayerPage(listItemId)
        })
    })
}

function handlePlayerPage (songId) {
    const currentData = currentSongData(songId)
    const audio = new Audio(currentData.audioSrc)
    let currentSec = 0
    let currentProgress = 0
    let isPlaying = true

    // i declare this function as auto run function
    function showMusicPlayer () {
        // set variable
        // set video to start
        initialVideoBackground()
        // remove class from home page ( change page )
        homePage.classList.remove(currentPage)
        // add class to new page  ( show page )
        groupsPlayerEL.forEach((group , index) => {
            if (!group.classList.contains(currentPage)) { 
                group.classList.add(currentPage)
                videoBgContainer.classList.add('player-active')
            }
        })
        // set song's detail to current song
        musicPlayerHeaderEl.innerHTML = `
        <img id="currentSongPicture" src="${currentData.albumArtUrl}" alt="${currentData.title}">
        <div class="current-song-detail">
        <h3 id="currentSongName">${currentData.title}</h3>
        <p id="currentSongArtist">${currentData.artist}</p>
        </div>
        `        

        initialProgress()
    }

    function currentSongData (songId) {
        return songs.find(s => s.id == songId)
       
    }

    function initialProgress () {
        audio.onloadedmetadata = () => {
            const duration = audio.duration 
            const minutes = Math.floor(duration / 60)
            const seconds = Math.floor(duration % 60)
            const formatSeconds = seconds < 10 ? '0' + seconds : seconds
            let timer = `${minutes}:${formatSeconds}`
            maxTimerEl.innerHTML = timer
            currentProgressEl.style.width = currentProgress + '%' 
        }        
    }

    function handlePlayer() {
        audio.play()
        const interval = setInterval(() => {
            if (isPlaying && !audio.ended) {
                currentSec = audio.currentTime // fix: use currentTime correctly (was referring to currentSec)
                console.log(currentSec) // fix: changed to currentSec
                progressTracker()
            } else {
                togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-pause"></i>'
                clearInterval(interval)
            }
        }, 1000)
    }


    function togglePlayAndPause() {
        if (isPlaying) {
            audio.play();
            isPlaying = false;
            console.log('Play');
            togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-pause"></i>';
            handlePlayer();
        } else {
            console.log('Pause');
            togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-play"></i>';
            audio.pause();
            isPlaying = true;
        }
    }


    function progressTracker() {
        currentProgress = (audio.currentTime / audio.duration) * 100 // fix: correctly using audio.currentTime instead of audio.currentSec
        currentProgressEl.style.width = currentProgress + '%' // fix: correctly update progress
    }

    togglePlayAndPauseEl.addEventListener('click', togglePlayAndPause)
    // Removed unnecessary setInterval for logging currentSec because it's redundant with progressTracker()
    showMusicPlayer()
}



function backToHome () {
    groupsPlayerEL.forEach((group , index) => {
        if (group.classList.contains(currentPage)) { 
            group.classList.remove(currentPage)
            videoBgContainer.classList.remove('player-active')
        }
    })
    homePage.classList.add(currentPage)
}

function currentBackgroundVideo (songId) {
    initialVideoBackground()
    songs.forEach((song , index) => {
        if (song.id == songId) {
            backgroundVideo.setAttribute('src' , song.videoBgSrc)
        }
    })
}

function initialVideoBackground () {
    backgroundVideo.currentSec = 0
}

backButtonEl.addEventListener('click' , () => backToHome())

function initailFunction () {
    console.log('Started ...')
    renderSongList()
}

document.addEventListener('DOMContentLoaded' , initailFunction())