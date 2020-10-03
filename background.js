


var tabID = null
var state = {
    connected: false
};

function startSocket(channel, username) {
    //let ws = new WebSocket('ws://127.0.0.1:3333/ws', {transports: ['websocket']});
    const ws = adonis.Ws('ws://localhost:3333');
    ws.connect();


    ws.on('open', () => {
        const subscription = ws.subscribe(`room:${channel}`);

        // Registra eventos
        subscription.on('room:play', (message) => {
            console.log('Nova mensagem');
            //sendToContent(message);
            sendToContentScript('room:play', message);
        })

        state = {
            connected: true,
            ws: ws,
            channel: channel,
            wsc: ws.getSubscription(`room:${channel}`),
            user: username,
            users: {}
        }
    })
}

function sendPlay(time) {
    console.log('Enviando solicitação de play para os clients');

    state.wsc.emit('message', {
        action: 'room:play',
        username: state.username,
        time: time
    })
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.action === "connect_socket") {
        chrome.tabs.query({active: true}, function(tabs){
            tabID = tabs[0].id

            console.log(`TAB ID SAVED: ${tabID}`);
        })

        startSocket(request.options.channel, request.options.username);
    }

    if(request.action === "play") {
        console.log('Ação de play recebida no background');

        if(state.connected) {
            sendPlay(request.options.currentTime);
        }
    }
})

function sendToContentScript(action, options){
    console.log('Recebida uma mensagem do servidor');
    
    chrome.tabs.query({active: true}, function(tabs){
        chrome.tabs.sendMessage(tabID, {action: action, options: options});
    });
}


chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
    	console.log('created new tab after install');
    	chrome.tabs.create({
            'url': "https://www.netflixparty.com/tutorial"
        }, function() {
            console.log('created new tab after install');
        });
    }
});

chrome.runtime.onInstalled.addListener(function(details) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        hostContains: '.youtube.',
                        pathPrefix: '/watch',
                        schemes: ['http', 'https']
                    }
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});
