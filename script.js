import { albums } from './albums.js'

// All DOM Element
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


// util variables

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const currentPage = 'current-page'
const allModes = ['repeat' , 'shuffle']

let isTransitioning = false , isPlaying = false , currentData = null
let audio = null , playerInterval = null 
let thisMinute = 0 , thisSecond = 0 

// 


// Render all of song list items
function renderSongList () {

    // Loop the all of songs in album  
    albums.forEach((song , index) => {
        // Create li element and set attribute
        const songListItem = document.createElement('li')
        songListItem.setAttribute('data-id', song.id)
        songListItem.setAttribute('class', 'song-list')

        // Set content in each li element by song detail
        songListItem.innerHTML = `
        <img src="${song.albumArtUrl}" alt="${song.title}">
        <div class="song-detail">
            <h3 class="title">${song.title}</h3>
            <p class="artist">${song.artist}</p>
        </div>
        `
        // Append the content of li to parent's element
        songListContainer.appendChild(songListItem)
    })

    // Call interaction of list item #Ex : Hover , Click etc.
    listInteraction()
}

// Handle all of users interaction to list items ( song )
function listInteraction () {
    const songListItems = document.querySelectorAll('.song-list')
    songListItems.forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            const listItemId = e.target.dataset.id
            
            currentBackgroundVideo(listItemId)
            listHoveringEffect(listItemId , e)
            
            videoBgContainer.classList.add('list-hovering')
        })
        item.addEventListener('mouseleave', (e) => {
            const listItemId = e.target.dataset.id
            videoBgContainer.classList.remove('list-hovering')
            listHoveringEffect(listItemId , e)
        })
        item.addEventListener('click', (e) => {
            const listItemId = e.target.closest('.song-list').dataset.id
            handlePlayerPage(listItemId , e)
        })
    })

    function listHoveringEffect (listItemId , e) {
        const songListItems = document.querySelectorAll('.song-list')

        if (e.type === 'mouseenter') {
            songListItems[listItemId - 1]?.classList.add('main-list-hover')
            setTimeout(() => {
                songListItems[listItemId]?.classList.add('side-list-hover')
                songListItems[listItemId - 2]?.classList.add('side-list-hover')
            } , 80)
        } else {
            songListItems.forEach(item => {
                item.classList.remove('main-list-hover')
                item.classList.remove('side-list-hover')
            })
        } 
    }
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
        if (!audio.pause) return
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
            console.warn('Playback failed : ' + error)
        })
    }

    function progressTracker() {
        // add glowing effect to progressbar while running
        if (isPlaying) currentProgressEl.classList.add('running')

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
            console.log('Pause ...')
            // Pause the music
            audio.pause()
            isPlaying = false
            
            // clear all interval
            clearInterval(playerInterval)
            playerInterval = null
            
            // change the icon in main control
            togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-play"></i>'
            
            // remove glowing effect to progressbar while running
            currentProgressEl.classList.remove('running')
            console.log(isPlaying)
        } else {
            console.log('Playing ...')
            // start playig
            isPlaying = true
            
            // change the icon in main control
            togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-pause"></i>'
            
            // add glowing effect to progressbar while running
            currentProgressEl.classList.add('running')
            handlePlayer()
            console.log(isPlaying)
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
            
            currentBackgroundVideo(nextSongId)
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
        
            currentBackgroundVideo(prevSongId)
            handlePlayerPage(prevSongId)
    
            isTransitioning = false
        }
    }

    
    // all of event in music player's page
    backButtonEl.addEventListener('click', backToHome)
    togglePlayAndPauseEl.addEventListener('click', togglePlayAndPause)

    nextSongEl.addEventListener('click' , (e) => handleControlPlayer('next' , e)) 
    prevSongEl.addEventListener('click' , (e) => handleControlPlayer('previous' , e)) 
    repeatButtonEl.addEventListener('click' , (e) => handleControlPlayer('repeat' , e))
    shuffleButtonEl.addEventListener('click', (e) => handleControlPlayer('shuffle' , e))

    // initial function
    showMusicPlayer()
}

// reset timer in player
function resetTimer () {() => 
    thisMinute = 0
    thisSecond = 0
}

// reset audio setting in player
function resetAudio () {
    if (audio) {
        audio.pause()
        audio.src = ''
        audio.load()
        audio = null
    }
}

// Check current song data and set background to current song 
function currentBackgroundVideo (songId) {

    // Set background's video to default ( reset )
    initialVideoBackground()

    // Loop all songs in albums and set current background from current song
    albums.forEach((song) => {
        if (song.id == songId) {
            backgroundVideo.src = ''
            backgroundVideo.setAttribute('src', song.videoBgSrc)
        }
    })
}

// Reset current video background time to start 
function initialVideoBackground () {
    backgroundVideo.currentTime = 0
}

// Main initial function 
function initailFunction () {
    console.log('Started ...')

    // Call render song function
    renderSongList()
}

//  Wait til dom loaded and call initail function
document.addEventListener('DOMContentLoaded', initailFunction())
