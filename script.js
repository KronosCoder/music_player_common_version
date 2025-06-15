import { songs } from './songs.js';

// DOM Element
const songList = document.getElementById('songList')
const videoBgContainer = document.getElementById('videoBgContainer')
const backgroundVideo = document.getElementById('backgroundVideo')
const songListContainer = document.getElementById('songListContainer')

function renderSongList () {
    songs.forEach((song , index) => {
        // console.log(song)
        const songListItem = document.createElement('li')
        // set list's attribute
        songListItem.setAttribute('data-id' , song.id)
        // set list animation by aos library
        songListItem.setAttribute('data-aos' , 'fade-down')
        songListItem.setAttribute('data-aos-duration' , 100)
        songListItem.setAttribute('data-aos-delay' , index * 200)
        songListItem.setAttribute('class' , 'song-list')
        // set inner html
        songListItem.innerHTML = `
        <img src="${song.albumArtUrl}" alt="${song.title}">
            <div class="song-detail">
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
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
            // console.log('list hovering class added')
            console.log(e.target.dataset.id)
            videoBgContainer.classList.add('list-hovering')
        })
        item.addEventListener('mouseleave' , (e) => {
            // console.log('list hovering class removed')
            videoBgContainer.classList.remove('list-hovering')
        })
    })
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