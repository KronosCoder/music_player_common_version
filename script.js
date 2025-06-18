import { albums } from './albums.js'

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
const repeatButtonEl = document.getElementById('repeatSong')
const shuffleButtonEl = document.getElementById('shuffleSong')
const nextSongEl = document.getElementById('nextSong')
const prevSongEl = document.getElementById('prevSong')


// utils
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let isTransitioning = false;
let audio = null
let playerInterval = null 
let thisMinute = 0 
let thisSecond = 0 
let isPlaying = false 
let currentData = null
// 

const currentPage = 'current-page'
const modes = ['repeat' , 'shuffle']


function renderSongList () {
    albums.forEach((song , index) => {
        const songListItem = document.createElement('li')
        songListItem.setAttribute('data-id', song.id)
        songListItem.setAttribute('class', 'song-list')
        songListItem.innerHTML = `
        <img src="${song.albumArtUrl}" alt="${song.title}">
        <div class="song-detail">
            <h3 class="title">${song.title}</h3>
            <p class="artist">${song.artist}</p>
        </div>
        `
        songListContainer.appendChild(songListItem)
    })

    listInteraction()
}

function listInteraction () {
    const songListItems = document.querySelectorAll('.song-list')
    songListItems.forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            currentBackgroundVideo(e.target.dataset.id)
            videoBgContainer.classList.add('list-hovering')
        })
        item.addEventListener('mouseleave', () => {
            videoBgContainer.classList.remove('list-hovering')
        })
        item.addEventListener('click', (e) => {
            const listItemId = e.target.closest('.song-list').dataset.id
            handlePlayerPage(listItemId)
        })
    })
}

function handlePlayerPage (songId) {
    currentData = currentSongData(songId)
    audio = new Audio(currentData.audioSrc)
    let currentProgress = 0

    audio.onloadedmetadata = () => {
        let duration = audio.duration
        let totalMinutes = Math.floor(duration / 60)
        let totalSeconds = Math.floor(duration % 60)
        let formatSeconds = totalSeconds < 10 ? '0' + totalSeconds : totalSeconds
        let timer = `${totalMinutes}:${formatSeconds}`
        maxTimerEl.innerHTML = timer
    }

    function showMusicPlayer () {
        if (playerInterval) clearInterval(playerInterval)

        isPlaying = true
        togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-pause"></i>'
        handlePlayer()

        initialVideoBackground()

        homePage.classList.remove(currentPage)

        groupsPlayerEL.forEach(group => {
            if (!group.classList.contains(currentPage)) { 
                group.classList.add(currentPage)
                videoBgContainer.classList.add('player-active')
            }
        })

        musicPlayerHeaderEl.innerHTML = `
        <img id="currentSongPicture" src="${currentData.albumArtUrl}" alt="${currentData.title}">
        <div class="current-song-detail">
            <h3 id="currentSongName">${currentData.title}</h3>
            <p id="currentSongArtist">${currentData.artist}</p>
        </div>
        `
    }

    function currentSongData (songId) {
        return albums.find(s => s.id == songId)
    }

    async function handlePlayer() {
        resetTimer()
        await audio.play() 
        .then(() => {
            playerInterval = setInterval(() => {
                if (isPlaying && !audio.ended) {
                    const updateTime = progressTracker()
                    thisMinute = updateTime.thisMinute
                    thisSecond = updateTime.thisSecond
                } else {
                    isPlaying = false
                    togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-play"></i>'
                    clearInterval(playerInterval)
                    playerInterval = null
                }
            }, 1000)
        })
        .catch((error) => {
            console.warn('Playback failed or was interrupted : ' + error)
        })
    }

    function progressTracker() {
        if (thisSecond >= 59) {
            thisSecond = -1
            thisMinute++
        }

        thisSecond++
        currentProgress = (audio.currentTime / audio.duration) * 100 
        currentProgressEl.style.width = currentProgress + '%' 

        const formatMinute = thisMinute < 10 ? `0${thisMinute}` : thisMinute
        const thisTime = thisSecond < 10 ? `${formatMinute}:0${thisSecond}` : `${formatMinute}:${thisSecond}`
        currentSecEl.innerHTML = thisTime

        return { thisMinute , thisSecond }
    }

    function togglePlayAndPause() {
        if (isPlaying) {
            audio.pause()
            isPlaying = false
            clearInterval(playerInterval)
            playerInterval = null
            togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-play"></i>'
        } else {
            isPlaying = true
            togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-pause"></i>'
            handlePlayer()
        }
    }

    function backToHome() {
        if (audio) {
            resetAudio()
            resetTimer()
            isPlaying = false
            if (playerInterval) clearInterval(playerInterval)
        }
        groupsPlayerEL.forEach(group => {
            if (group.classList.contains(currentPage)) {
                group.classList.remove(currentPage)
                videoBgContainer.classList.remove('player-active')
            }
        })
        homePage.classList.add(currentPage)
    }

    function handleControlPlayer (selectMode , e) {
        console.log(selectMode)
        switch (selectMode) {
            case 'next':
                playNextSong()
                break;

            case 'previous':
                playPreviousSong(e)
                break;
            case 'repeat':
                togglePlayerMode(e)
                break;

            case 'shuffle':
                togglePlayerMode(e)
                break;
            default:
                console.log('Unknown selected mode !')
        }

        function togglePlayerMode (e) {
            const isCurrentMode = e.target.classList.contains('current-mode')
            const currentModeEl = document.querySelector('.current-mode')

            if (!isCurrentMode) {
                currentModeEl?.classList.remove('current-mode')
                e.target.classList.add('current-mode')
            } else {
                currentModeEl?.classList.remove('current-mode')
                e.target.classList.remove('current-mode')
            }
        }

        async function playNextSong() {
            if (isTransitioning) return;
            isTransitioning = true;
        
            resetAudio()
            await delay(100)
        
            const currentIndex = albums.findIndex(song => song.id === currentData.id)
            let nextIndex = (currentIndex + 1) % albums.length
            const nextSongId = albums[nextIndex].id
        
            handlePlayerPage(nextSongId)
    
            isTransitioning = false
        }

        async function playPreviousSong() {
            if (isTransitioning) return;
            isTransitioning = true;
        
            resetAudio()
            await delay(100)
        
            const currentIndex = albums.findIndex(song => song.id === currentData.id)
            let prevIndex = (currentIndex - 1)
            if (prevIndex < 0) prevIndex = albums.length - 1
            const prevSongId = albums[prevIndex].id
        
            handlePlayerPage(prevSongId)
    
            isTransitioning = false
        }
    }

    
    backButtonEl.addEventListener('click', backToHome)
    togglePlayAndPauseEl.addEventListener('click', togglePlayAndPause)

    nextSongEl.addEventListener('click' , (e) => handleControlPlayer('next' , e)) 
    prevSongEl.addEventListener('click' , (e) => handleControlPlayer('previous' , e)) 
    repeatButtonEl.addEventListener('click' , (e) => handleControlPlayer('repeat' , e))
    shuffleButtonEl.addEventListener('click', (e) => handleControlPlayer('shuffle' , e))

    showMusicPlayer()
}

function resetTimer () {() => 
    thisMinute = 0
    thisSecond = 0
}

function resetAudio () {
    if (audio) {
        audio.pause()
        audio.src = ''
        audio.load()
        audio = null
    }
}


function currentBackgroundVideo (songId) {
    initialVideoBackground()
    albums.forEach((song) => {
        if (song.id == songId) {
            backgroundVideo.setAttribute('src', song.videoBgSrc)
        }
    })
}

function initialVideoBackground () {
    backgroundVideo.currentTime = 0
}

function initailFunction () {
    console.log('Started ...')
    renderSongList()
}

document.addEventListener('DOMContentLoaded', initailFunction())
