//Where all the js  for the frontend will live

//to create the functionality see our own video

const socket = io("/");
const videoGrid = document.getElementById("video-grid");
//console.log(videoGrid);
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: 3030,
});

let myVideoStream;
//const ROOM_ID;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connecToNewUser(userId, stream);
    });
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connecToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  let d = $(".main_chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

// Mute audio
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></li>
    <span>Mute</span>
  `;
  document.querySelector(".main_mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></li>
    <span>Unmute</span>
  `;
  document.querySelector(".main_mute_button").innerHTML = html;
};

//stop video
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main_video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
    <i class="fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main_video_button").innerHTML = html;
};

let input = document.querySelector("input");

input.addEventListener("keydown", (e) => {
  if (e.keyCode === 13 && e.target.value.length !== 0) {
    console.log(e.target.value);
    socket.emit("message", e.target.value);
    document.getElementById("chat_message").value = "";
  }
});

socket.on("createMessage", (message) => {
  // document
  //   .querySelector(".messages")
  //   .append(`<li class="message"><b>USER</b><br>${message}</li>`);

  $(".messages").append(`<li class="message"><b>USER</b><br>${message}</li>`);
  scrollToBottom();
});

// let text = $("input");
// //console.log(text);
//
// $("html").keydown((e) => {
//   if (e.which == 13 && text.val().length !== 0) {
//     console.log(text.val());
//     //socket.emit("message", text.val());
//     //text.val("");
//   }
// });
