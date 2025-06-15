import { songs } from './songs.js';

// DOM Element
const songList = document.getElementById('songList')
const videoBgContainer = document.getElementById('videoBgContainer')
const backgroundVideo = document.getElementById('backgroundVideo')
const songListContainer = document.getElementById('songListContainer')
const homePage = document.getElementById('homePage')
const playerPage = document.getElementById('playerPage')

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
            console.log(e.target.dataset.id)
            videoBgContainer.classList.add('list-hovering')
        })
        item.addEventListener('mouseleave' , () => {
            videoBgContainer.classList.remove('list-hovering')
        })
        item.addEventListener('click' , (e) => {
            renderPlayerPage(e.target.dataset.id)
        })
    })
}

function renderPlayerPage (songId) {
    homePage.classList.remove(currentPage)
    if (!playerPage.classList.contains(currentPage)) {
        playerPage.classList.add(currentPage)
    }
}


function currentBackgroundVideo (songId) {
    initailVideoBackground()
    songs.forEach((song , index) => {
        if (song.id == songId) {
            backgroundVideo.setAttribute('src' , song.videoBgSrc)
        }
    })
}

function initailVideoBackground () {
    backgroundVideo.currentTime = 0
}

function initailFunction () {
    console.log('Started ...')
    renderSongList()
}

document.addEventListener('DOMContentLoaded' , initailFunction())