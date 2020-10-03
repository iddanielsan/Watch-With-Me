var playerInstance = document.getElementById('movie_player');

chrome.tabs.query({
	active: true,
	currentWindow: true
}, function(tabs) {
	document.getElementById('play_video').onclick = function() {
		chrome.tabs.sendMessage(tabs[0].id, {
			greeting: "hello"
		}, function(response) {
			console.log(response.farewell);
		});
	}
})