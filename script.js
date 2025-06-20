import { albums } from './albums.js'

// DOM Elements
const songListContainer = document.getElementById('songListContainer')
const homePage = document.getElementById('homePage')
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
const videoBgContainer = document.getElementById('videoBgContainer')
const backgroundVideo = document.getElementById('backgroundVideo')
const volumeSliderEl = document.getElementById('volumeSlider')
const iconVolumeStatusEl = document.getElementById('iconStatusVolume')
const closeShortButton = document.getElementById('closeShortButton')

// Global Variables
const currentPage = 'current-page'
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const modes = ['next' , 'previous' , 'repeat' , 'shuffle']

let isTransitioning = false
let currentData = null
let audio = null
let animationFrameId = null
let isPlaying = false
let currentMode = null

// Render Song List
function renderSongList() {
    albums.forEach(song => {
        const songListItem = document.createElement('li')
        songListItem.setAttribute('data-id', song.id)
        songListItem.setAttribute('class', 'song-list')
        
        songListItem.innerHTML = `
            <img id="currentSongPicture" src="${song.albumArtUrl}" alt="${song.title}">
            <div class="current-song-detail">
            <h3 id="currentSongName">${song.title}</h3>
            <p id="currentSongArtist">${song.artist}</p>
            </div>
        `

        songListContainer.appendChild(songListItem)
    })
    
    listInteraction()
}

// List Interactions
function listInteraction() {
    const songListItems = document.querySelectorAll('.song-list')
    
    songListItems.forEach(item => {
        item.addEventListener('mouseenter', handleMouseEnter)
        item.addEventListener('mouseleave', handleMouseLeave)
        item.addEventListener('click', handleSongClick)
    })
}

function handleMouseEnter(e) {
    const listItemId = e.target.dataset.id
    currentBackgroundVideo(listItemId)
    videoBgContainer.classList.add('list-hovering')
}

function handleMouseLeave(e) {
    videoBgContainer.classList.remove('list-hovering')
}

function handleSongClick(e) {
    const listItemId = e.target.closest('.song-list').dataset.id
    handlePlayerPage(listItemId)
}

// Player Functions
function handlePlayerPage(songId) {
    cleanupPlayer()
    
    currentData = albums.find(s => s.id == songId)
    audio = new Audio(currentData.audioSrc)
    
    setupAudioEvents()
    showMusicPlayer()
}

function setupAudioEvents() {
    audio.onloadedmetadata = () => {
        const duration = audio.duration
        const totalMinutes = Math.floor(duration / 60)
        const totalSeconds = Math.floor(duration % 60)
        const formatSeconds = totalSeconds < 10 ? '0' + totalSeconds : totalSeconds
        // console.log(volumeSliderEl.value)
        audio.volume = volumeSliderEl.value / 100
        maxTimerEl.innerHTML = `${totalMinutes}:${formatSeconds}`
    }
    
    audio.onended = () => {
        checkCurrentMode()
        isPlaying = false
        togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-play"></i>'
        cleanupInterval()
    }
}

function showMusicPlayer() {
    isPlaying = true
    togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-pause"></i>'
    
    startPlayer()
    updateUI()
    switchToPlayerPage()
}

function startPlayer() {
    cleanupInterval()
    
    audio.play()
        .then(() => {
            progressTracker()
        })
        .catch(error => console.warn('Playback failed:', error))
}

function progressTracker() {
    if (!audio || !isPlaying) return
    
    const currentTime = audio.currentTime
    const duration = audio.duration
    
    // Update progress bar
    const progress = (currentTime / duration) * 100
    currentProgressEl.style.width = progress + '%'
    currentProgressEl.classList.add('running')
    
    // Update time display
    const minutes = Math.floor(currentTime / 60)
    const seconds = Math.floor(currentTime % 60)
    const formatMinute = minutes < 10 ? `0${minutes}` : minutes
    const formatSecond = seconds < 10 ? `0${seconds}` : seconds
    
    currentSecEl.innerHTML = `${formatMinute}:${formatSecond}`

    animationFrameId = requestAnimationFrame(progressTracker)
}

function togglePlayAndPause() {
    if (!audio) return
    
    if (isPlaying) {
        pauseAudio()
    } else {
        playAudio()
    }
}

function pauseAudio() {
    isPlaying = false
    audio.pause()
    togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-play"></i>'
    currentProgressEl.classList.remove('running')
    cleanupInterval()
}

function playAudio() {
    audio.play()
        .then(() => {
            isPlaying = true
            togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-pause"></i>'
            currentProgressEl.classList.add('running')
            progressTracker()
        })
        .catch(error => console.warn('Playback failed:', error))
}

function updateUI() {
    musicPlayerHeaderEl.innerHTML = `
    <img id="currentSongPicture" src="${currentData.albumArtUrl}" alt="${currentData.title}">
    <div class="current-song-detail">
        <h3 id="currentSongName">${currentData.title}</h3>
        <p id="currentSongArtist">${currentData.artist}</p>
    </div>
    `
}

function updateVolume(e) {
    const levelVolume = e.target.value / 100
    audio.volume = levelVolume
}

function toggleVolume () {
    if (!audio.muted) {
        iconVolumeStatusEl.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>'
    } else {
        iconVolumeStatusEl.innerHTML = '<i class="fa-solid fa-volume-high"></i>'
    }
    audio.muted = !audio.muted
}

function switchToPlayerPage() {
    initialVideoBackground()
    homePage.classList.remove(currentPage)
    
    groupsPlayerEL.forEach(group => {
        group.classList.add(currentPage)
    })

    videoBgContainer.classList.add('player-active')
}

function backToHome() {
    cleanupPlayer()
    resetUI()
    
    groupsPlayerEL.forEach(group => {
        group.classList.remove(currentPage)
    })

    videoBgContainer.classList.remove('player-active')
    homePage.classList.add(currentPage)
}

// Control Functions
function handleControlPlayer(idxMode, e) {
    switch (idxMode) {
        case 0:
            playNextSong()
            break
        case 1:
            playPreviousSong()
            break
        case 2:
            if (!currentMode) {
                currentMode = idxMode
            } else {
                currentMode = null
            }

            console.log(currentMode)
            togglePlayerMode(e)
            break
        case 3:
            togglePlayerMode(e)
            break
    }
}

async function checkCurrentMode () {
    console.log(currentMode);
    if (currentMode !== null) {
        switch(currentMode) {
            case 2:         
                repeatMode()
                break;
            case 3:
                break;
            default:
            console.log("This Mode doesn't match !!")
        }
        return
    } 
}

function togglePlayerMode(e) {
    const isCurrentMode = e.target.classList.contains('current-mode')
    const currentModeEl = document.querySelector('.current-mode')
    
    currentModeEl?.classList.remove('current-mode')
    
    if (!isCurrentMode) {
        e.target.classList.add('current-mode')
    }
}

async function playNextSong() {
    if (isTransitioning) return
    isTransitioning = true
    
    const currentIndex = albums.findIndex(song => song.id === currentData.id)
    const nextIndex = (currentIndex + 1) % albums.length
    const nextSongId = albums[nextIndex].id
    
    await switchSong(nextSongId)
    isTransitioning = false
}

async function playPreviousSong() {
    if (isTransitioning) return
    isTransitioning = true
    
    const currentIndex = albums.findIndex(song => song.id === currentData.id)
    const prevIndex = currentIndex - 1 < 0 ? albums.length - 1 : currentIndex - 1
    const prevSongId = albums[prevIndex].id
    
    await switchSong(prevSongId)
    isTransitioning = false
}

async function switchSong(songId) {
    cleanupPlayer()
    await delay(100)
    currentBackgroundVideo(songId)
    handlePlayerPage(songId)
}

async function repeatMode () {
    cleanupPlayer()
    await delay(500) 
    startPlayer()
}

// Utility Functions
function cleanupPlayer() {
    cleanupInterval()
    resetAudio()
    resetUI()
}

function cleanupInterval() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
    }
}

function resetAudio() {
    if (audio) {
        audio.pause()
        audio.src = ''
        audio.load()
        audio = null
    }
    isPlaying = false
}

function resetUI() {
    currentProgressEl.style.width = '0%'
    currentProgressEl.classList.remove('running')
    currentSecEl.innerHTML = '00:00'
    togglePlayAndPauseEl.innerHTML = '<i class="fa-solid fa-play"></i>'
}

function currentBackgroundVideo(songId) {
    initialVideoBackground()
    
    const song = albums.find(s => s.id == songId)
    if (song) {
        backgroundVideo.src = song.videoBgSrc
    }
}

function initialVideoBackground() {
    backgroundVideo.currentTime = 0
}

// Event Listeners
function setupEventListeners() {
    backButtonEl.addEventListener('click', backToHome)
    closeShortButton.addEventListener('click' , backToHome)

    togglePlayAndPauseEl.addEventListener('click', togglePlayAndPause)
    nextSongEl.addEventListener('click', (e) => handleControlPlayer(0 , e))
    prevSongEl.addEventListener('click', (e) => handleControlPlayer(1 , e))
    repeatButtonEl.addEventListener('click', (e) => handleControlPlayer(2 , e))
    shuffleButtonEl.addEventListener('click', (e) => handleControlPlayer(3 , e))
    volumeSliderEl.addEventListener('input' , (e) => updateVolume(e))
    volumeSliderEl.addEventListener('change' , (e) => updateVolume(e))
    iconVolumeStatusEl.addEventListener('click' , toggleVolume)
}

// Initialize function
function init() {
    console.log('Music Player Started...')
    renderSongList()
    setupEventListeners()
}

document.addEventListener('DOMContentLoaded', init)