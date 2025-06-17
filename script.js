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
const currentSecEl = document.getElementById('currentSecond')
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
    let progressPercent = 0
    let currentProgress = 0
    let isPlaying = false
    let duration = 0 , minutes = 0 , seconds = 0 , formatSeconds = 0 , timer = 0

    audio.onloadedmetadata = () => {
        duration = audio.duration 
        minutes = Math.floor(duration / 60)
        seconds = Math.floor(duration % 60)
        formatSeconds = seconds < 10 ? '0' + seconds : seconds
        timer = `${minutes}:${formatSeconds}`
        maxTimerEl.innerHTML = timer
    }
    

    // i declare this function as auto run function
    function showMusicPlayer () {
        // set default playing to true
        isPlaying = true
        handlePlayer()

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
    }

    function currentSongData (songId) {
        return songs.find(s => s.id == songId)
       
    }

    function handlePlayer() {
        audio.play()        
        const interval = setInterval(() => {
            if (isPlaying && !audio.ended) {
                progressPercent = (audio.currentTime / audio.duration) * 100
                togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-pause"></i>';
                progressTracker()
            } else {
                togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-play"></i>';
                clearInterval(interval)
            }
        }, 1000)
    }


    function togglePlayAndPause() {
        if (isPlaying) {
            isPlaying = false;
            audio.pause();
            togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-play"></i>';
        } else {
            isPlaying = true;
            togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-pause"></i>';
            handlePlayer()
        }
    }


    function progressTracker() {
        currentProgress = (audio.currentTime / audio.duration) * 100 
        currentProgressEl.style.width = currentProgress + '%' 
        const currentSecond = Math.round(audio.currentTime) < 10 ? '0' + Math.round(audio.currentTime) : Math.round(audio.currentTime) 
        // const currentMinute =  currentSecond
        console.log(currentSecond)

        console.log(audio.currentTime)
    }

    togglePlayAndPauseEl.addEventListener('click', togglePlayAndPause)
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
    backgroundVideo.currentTime = 0
}

backButtonEl.addEventListener('click' , () => backToHome())

function initailFunction () {
    console.log('Started ...')
    renderSongList()
}

document.addEventListener('DOMContentLoaded' , initailFunction())