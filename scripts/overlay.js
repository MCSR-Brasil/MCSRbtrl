let counter = 0;
let currentPlayer = null;

setInterval(async () => {
    await fetchInfo();
    console.log("Fetched info");
  }, 15 * 1000); // 15 seconds


async function fetchInfo() {
    const livePlayers = await getLivePlayers();
    const bestPlayer = getBestLivePlayer(livePlayers);
    fetchTopTen(BR_RANKING_SPREADSHEET_ID, 'ranking');
    console.log("current best player:", bestPlayer);
    
    // Only update if we have a valid best player
    if (bestPlayer) {
        currentPlayer = bestPlayer;
    }
    
    // If we have a current player (either from before or just set), update the UI
    if (currentPlayer) {
        twitchEmbed(currentPlayer);
        changeOverlay(currentPlayer);
        
    } else {
        console.log("No current player");
    }
    
    sidebarDisplayPaceman(livePlayers);
}


// Store the player instance and current channel outside the function
let twitchPlayer = null;
let currentChannel = null;

async function twitchEmbed(pacemanInfo) {
    if (!pacemanInfo) return;
    const newChannel = pacemanInfo.liveAccount;
    const pb = await getPB(pacemanInfo.liveAccount);
    document.getElementById('pb').innerHTML = `PB: <span class="pbTime">${pb}</span>`;
    console.log('Requested channel:', newChannel);
    
    // If the channel hasn't changed and player exists, do nothing
    if (twitchPlayer && currentChannel === newChannel) {
        console.log('Channel has not changed, skipping reload');
        return;
    }
    
    console.log('Loading new channel:', newChannel);
    currentChannel = newChannel;
    
    var hostname = window.location.hostname || 'tchongas.red';
    var embedElement = document.getElementById('twitch-embed');
    
    // Clear the existing player if it exists
    if (twitchPlayer) {
        twitchPlayer.destroy();
        twitchPlayer = null;
        embedElement.innerHTML = ''; // Clear the container
    }
    
    var options = {
        width: '100%',
        height: '100%',
        channel: pacemanInfo.liveAccount,
        parent: [window.location.hostname],
        autoplay: true
      };

    try {
        // Create new player instance
        twitchPlayer = new Twitch.Player("twitch-embed", options);
        twitchPlayer.setVolume(0.5);
        
        // Handle window resize
        function handleResize() {
            var width = window.innerWidth;
            var height = window.innerHeight;
            
            if (width / height > 16/9) {
                // Window is wider than 16:9
                embedElement.style.width = '177.78vh';
                embedElement.style.height = '100vh';
            } else {
                // Window is taller than 16:9
                embedElement.style.width = '100vw';
                embedElement.style.height = '56.25vw';
            }
            embedElement.style.maxWidth = 'none';
            embedElement.style.maxHeight = 'none';
        }
        
        // Add resize event listener
        window.addEventListener('resize', handleResize);
        
        // Store the handler so we can remove it later
        twitchPlayer._resizeHandler = handleResize;
        
        // Trigger initial resize
        handleResize();
        
    } catch (error) {
        console.error('Twitch player error:', error);
        embedElement.innerHTML = 
            '<div style="color: white; text-align: center; padding: 20px; font-family: Arial, sans-serif;">' +
            'Error loading Twitch player. Please try opening this page through a local web server.</div>';
    }
}

async function changeOverlay(pacemanInfo) {
    if (!pacemanInfo) return;
    document.getElementById('streamerName').innerHTML = pacemanInfo.liveAccount;

}




function sidebarDisplayPaceman(pacemanInfo) {
    const pacesDiv = document.getElementById('paces');
    const children = pacesDiv.children;
    for (let i = 0; i < children.length; i++) {
        children[i].innerHTML = '<span class="stat-invisible">.</span>';
    }
    
    const formattedInfo = pacemanInfo
    for (let i = 0; i < 5; i++) {
        if (!formattedInfo[i]) continue;
        const lastEvent = formattedInfo[i].eventList[formattedInfo[i].eventList.length - 1];
        pacesDiv.children[i].innerHTML = '<span class="stat-value">' + formattedInfo[i].nickname + '</span><span class="stat-label">' + getFormattedText(lastEvent.eventId) + '</span></div>';
    } 

}

fetchInfo();

function getFormattedText(text) {
    const dict = {
        "rsg.enter_nether": "Nether",
        "rsg.enter_bastion": "Bastion",
        "rsg.enter_fortress": "Fortaleza",
        "rsg.first_portal": "Primeiro Portal",
        "rsg.second_portal": "Segundo Portal",
        "rsg.enter_stronghold": "Stronghold",
        "rsg.enter_end": "End",
        "rsg.credits": "Zerou",

    }
    return dict[text] || text;
}