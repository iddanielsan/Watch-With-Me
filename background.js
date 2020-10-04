


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
        subscription.on('video_action', (message) => {
            sendToContentScript(message);
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

function sendAction(options){
    console.log('SendAction: Sending a new event');
    console.log(options);

    state.wsc.emit('message', {
        action: options.action,
        type: options.type,
        username: state.username,
        time: options.videoTime
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

    if(state.connected){
        sendAction({
            action: request.action,
            type: request.options.type,
            videoTime: request.options.currentTime
        });
    }
})

function sendToContentScript(data){
    console.log('Recebida uma mensagem do servidor');

    chrome.tabs.query({active: true}, function(tabs){
        chrome.tabs.sendMessage(tabID, data);
    });
}

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
