import { songs } from './songs.js';

// DOM Element
const songList = document.getElementById('songList')
const videoBgContainer = document.getElementById('videoBgContainer')
const backgroundVideo = document.getElementById('backgroundVideo')
const songListContainer = document.getElementById('songListContainer')
const homePage = document.getElementById('homePage')
const playerPageContainer = document.getElementById('playerPageContainer')
const backButton = document.getElementById('backButton')
const musicPlayerHeader = document.getElementById('musicPlayerHeader')
const groupsPlayer = document.querySelectorAll('.group-player')
const currentProgressbar = document.getElementById('currentProgressbar')
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
    let isPause = false

    const showMusicPlayer = (function () {
        initialVideoBackground()
        homePage.classList.remove(currentPage)
        groupsPlayer.forEach((group , index) => {
            if (!group.classList.contains(currentPage)) { 
                group.classList.add(currentPage)
                videoBgContainer.classList.add('player-active')
            }
        })
        
        const currentData = currentSongData(songId)
        musicPlayerHeader.innerHTML = `
            <img id="currentSongPicture" src="${currentData.albumArtUrl}" alt="${currentData.title}">
            <div class="current-song-detail">
                <h3 id="currentSongName">${currentData.title}</h3>
                <p id="currentSongArtist">${currentData.artist}</p>
            </div>
        `
    })()

    function currentSongData (songId) {
        const data = songs.find(s => s.id == songId)
        return data
    }

    function handleProgressbar () {
        const data = currentSongData() 
        const songLength = backgroundVideo.length
        if (!isPause) {
            for (let i = 0; i < data.) {

            }
        }
    }
}

function backToHome () {
    groupsPlayer.forEach((group , index) => {
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

backButton.addEventListener('click' , () => backToHome())

function initailFunction () {
    console.log('Started ...')
    renderSongList()
}

document.addEventListener('DOMContentLoaded' , initailFunction())