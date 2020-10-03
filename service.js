//var player = document.getElementById('movie_player');

// var port = chrome.runtime.connect({name: "wwm"});

var disableListeners = false

var player = document.querySelector('video');


document.querySelector('video').onplaying = function() {
  if(!disableListeners) {
    console.log('Ação de play detectada, enviando informação para o background');

    sendToBackground({action: "play", options: {
      currentTime: player.currentTime
    }});
  }
}


function playerPlay(options){
  player.currentTime = options.time;
  player.play().then(r => {
    disableListeners = false;
  })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received');
  if(message.action === "room:play"){
    disableListeners = true;
    playerPlay(message.options);
  }
})


function sendToBackground(data) {
  chrome.runtime.sendMessage(data);
}