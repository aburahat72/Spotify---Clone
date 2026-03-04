let currentSong = new Audio();
let songs = [];
let currentIndex = 0;

// iam adding the fuction to display the album card to the display
async function displayplaylists() {
  const response = await fetch("./info.json");
  const data = await response.json();
  const cardcontainer = document.querySelector(".cardcontainer");
  cardcontainer.innerHTML = "";
  data.playlists.forEach((playlist) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-folder", playlist.folder);
    card.innerHTML = `
      <div class="play">
      <img src="logo/playbtn.svg" alt="play">
      </div>
      <img src="${playlist.image}" alt="${playlist.title}">
      <h2>${playlist.title}</h2>
      <p>${playlist.description}</p>
    `;
    card.addEventListener("click", async () => {
      await loadPlaylistSongs(playlist.folder, playlist.title);
    });
    cardcontainer.appendChild(card);
  });
}
// here load the playlists function
async function loadPlaylistSongs(folderName, playlistTitle) {
  const response = await fetch(`./songs/${folderName}/`);
  const text = await response.text();
  const div = document.createElement("div");
  div.innerHTML = text;
  const links = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < links.length; i++) {
    const element = links[i];
    if (element.href.endsWith(".mp3")) {
      const decodedUrl = decodeURIComponent(element.href);
      const songName = decodedUrl.split(/[\\/]/).pop();
      songs.push(`${folderName}/${songName}`);
    }
  }
  //update global songs array
  window.songs = songs;
  window.currentIndex = 0;
  if (songs.length > 0) {
    //play first song
    playmusic(songs[0]);
    // update library UI
    updateLibraryUI(songs, playlistTitle);
    // Auto open the sidebar in the mobile view
    const leftsidebar = document.querySelector(".left");
    if (window.innerWidth <= 768) {
      leftsidebar.style.left = "0%";
    }
  }
}

//update Library UI function
function updateLibraryUI(songs, playlistTitle) {
  const songUL = document.querySelector(".songlists ul");
  songUL.innerHTML = "";
  songs.forEach((songPath, index) => {
    const songName = songPath.split("/").pop().replaceAll("%20", " ");
    const li = document.createElement("li");
    li.setAttribute("data-index", index);
    li.innerHTML = `
      <img class="invert" src="logo/music.svg" alt="music">
      <div class="info">
        <div>${songName}</div>
        <div>${playlistTitle}</div>
      </div>
      <div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="logo/play.svg" alt="playbtn">
      </div>
    `;
    li.addEventListener("click", () => {
      const index = parseInt(li.getAttribute("data-index"));
      playmusic(songs[index]);
    });
    songUL.appendChild(li);
  });
}

// here the seconds to minutes function format
function secondsTominutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  // Add leading zeros
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(secs).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
const playmusic = (track, pause = true) => {
  currentSong.src = "./songs/" + encodeURIComponent(track);
  currentIndex = songs.indexOf(track);
  // get the song name without folder and without .mp3
  const parts = track.split("/");
  const fileName = parts[parts.length - 1];
  const songName = fileName
    .replace(".mp3", "") // Remove extension
    .replace(/%20/g, " ") // Replace %20 with spaces
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/-/g, " "); // Replace hyphens with spaces

  if (!pause) {
  currentSong.play();
  play.src = "logo/pause.svg";
} else {
  play.src = "logo/play.svg";
}
  document.querySelector(".songinfo").innerHTML = songName;
  document.querySelector(".songtime").innerHTML = "0:00 / 0:00";
  //reset the seekbar position
  document.querySelector(".circle").style.left = "0%";
  // add this line showplaybar in the mobile screen after the song load successfully
  document.querySelector(".playbar").style.display = "flex";
  updateLibraryPlayIcons();
};

// Here iam updating the library UI function (play/pause button and previous and next button)
function updateLibraryPlayIcons() {
  // get all song items in the library
  const songItems = document.querySelectorAll(".songlists ul li");
  // Reset all icons to play button
  songItems.forEach((item) => {
    const playBtn = item.querySelector(".playnow img");
    if (playBtn) {
      playBtn.src = "logo/play.svg";
    }
  });
  // change currentsong icon to pause button
  if (songItems[currentIndex]) {
    const currentplayBtn =
      songItems[currentIndex].querySelector(".playnow img");
    if (currentplayBtn) {
      // check song is played orr paused
      currentplayBtn.src = currentSong.paused
        ? "logo/play.svg"
        : "logo/pause.svg";
    }
  }
}
async function main() {
  // Display the card
  await displayplaylists();
  const isMobile = window.innerWidth <= 768;

    // load the song by default
    const response = await fetch("./info.json");
    const data = await response.json();
    if (data.playlists.length > 0) {
      const firstPlaylist = data.playlists[0];
      await loadPlaylistSongs(firstPlaylist.folder, firstPlaylist.title);
    }
  // get control with their ids
  // Attach the event listeners to the play previous and next btn
  const play = document.getElementById("play");
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "logo/pause.svg";
    } else {
      currentSong.pause();
      play.src = "logo/play.svg";
    }
    // Add this Line to update library icon when play/pause is clicked
    updateLibraryPlayIcons();
  });
  currentSong.addEventListener("ended", () => {
    document.getElementById("play").src = "logo/play.svg";
    updateLibraryPlayIcons();
  });
  //  add the Event listener to the previous btn
  const previous = document.getElementById("previous");
  previous.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = songs.length - 1; // Loop to last song if at first
    }

    playmusic(songs[currentIndex]);
    updateLibraryPlayIcons();
  });
  // add the event listerner to next btn

  const nextBtn = document.getElementById("next"); // still showws the undefined
  nextBtn.addEventListener("click", () => {
    currentSong.pause();
    if (currentIndex < songs.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0; // Loop to first song if at last
    }

    playmusic(songs[currentIndex]);
    updateLibraryPlayIcons();
  });
  // listen for the time update event
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsTominutesSeconds(
      currentSong.currentTime
    )}/${secondsTominutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = `${
      (currentSong.currentTime / currentSong.duration) * 100
    }%`;
  });

  // add an event listener to the seek bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });
  document.querySelector(".close-btn").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });
  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/ 100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });
}
main();

// here we need to start the eventlistener by the user
