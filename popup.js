
buttonCreate = document.getElementById('create_room_button')
buttonEnter = document.getElementById('enter_room_button')
inputUsername = document.getElementById('create_room_username_input')
inputEnterCode = document.getElementById('enter_room_code_input')
inputEnterUsername = document.getElementById('enter_room_username_input')

async function createRoom(){
	const rawResponse = await fetch('http://127.0.0.1:3333/room', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({username: inputUsername.value })
  })

  const content = await rawResponse.json()

  return content;
}

async function enterRoom(){
  const rawResponse = await fetch(`http://127.0.0.1:3333/room?code=${inputEnterCode.value}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })

  const content = await rawResponse.json()

  return content;
}

buttonCreate.addEventListener("click", function(){
	createRoom().then(r => {
		chrome.storage.local.set({channel: r.channel, code: r.code})
    document.getElementById('form').style.display = 'none';
    document.getElementById('code').style.display = 'block';
    document.getElementById('code_text').innerText = r.code;

    chrome.runtime.sendMessage({action: "connect_socket", options: {
      code: r.code,
      channel: r.channel,
      username: r.username
    }});
	})
})

buttonEnter.addEventListener("click", function(){
  enterRoom().then(r => {
    document.getElementById('form').style.display = 'none';
    document.getElementById('enter_room_form').style.display = 'none';
    document.getElementById('code').style.display = 'block';
    document.getElementById('code_text').innerText = r.data.room_code;

    chrome.runtime.sendMessage({action: "connect_socket", options: {
      code: r.data.room_code,
      channel: r.data.room_channel,
      username: inputEnterUsername.value
    }});
  })
})