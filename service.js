//var player = document.getElementById('movie_player');

// var port = chrome.runtime.connect({name: "wwm"});

var disableListeners = false
var player = document.querySelector('video');
var playing = false;

var prommify = {
  setListenersStatus: (status) => {
    return new Promise((resolve, reject) => {
      disableListeners = status

      resolve()
    })
  },
  play: (options) => {
    return new Promise((resolve, reject) => {
      player.currentTime = options.time
      player.play().then(r => {
        resolve()
      })
    });
  },
  pause: (options) => {
    return new Promise((resolve, reject) => {
      player.currentTime = options.time
      player.pause()

      resolve()
    })
  }
}



player.onplaying = function() {
  if(!disableListeners) {
    console.log('Emitindo: Play');

    sendToBackground({
      action: "send_video_action",
      options: {
        type: "play",
        currentTime: player.currentTime
      }
    });
  } else {
    console.log('Não foi possivel emitir play');
  }
}

player.onpause = function() {
  playing = false
  if(!disableListeners) {
    console.log('Emitindo: Pause');

    sendToBackground({
      action: "send_video_action", 
      options: {
        type: "pause", 
        currentTime: player.currentTime
      }
    });
  } else {
    console.log('Não foi possivel emitir play');
  }
}


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    if(message.action === "send_video_action"){

      // Desativando listeners
      await prommify.setListenersStatus(true)

      console.log('Listeners desativados')
      console.log(disableListeners);

      // Executando comandos
      await prommify[message.type](message)

      // Ativando listeners
      await prommify.setListenersStatus(false)

      console.log('Listeners ativados')
      console.log(disableListeners);
    }
  } catch(e) {
    // statements
    console.log(e);
  }
})


function sendToBackground(data) {
  chrome.runtime.sendMessage(data);
}