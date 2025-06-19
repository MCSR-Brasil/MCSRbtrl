setInterval(async () => {
    await fetchInfo();
  }, 15 * 1000); // 15 seconds


async function fetchInfo() {
    const livePlayers = await getLivePlayers();
    const bestPlayer = getBestLivePlayer(livePlayers);
    console.log(bestPlayer);
    twitchEmbed(bestPlayer);
    changeOverlay(bestPlayer);
}


// Store the player instance and current channel outside the function
let twitchPlayer = null;
let currentChannel = null;

async function twitchEmbed(pacemanInfo) {
    const newChannel = pacemanInfo.liveAccount;
    console.log('Requested channel:', newChannel);
    
    // If the channel hasn't changed and player exists, do nothing
    if (twitchPlayer && currentChannel === newChannel) {
        console.log('Channel has not changed, skipping reload');
        return;
    }
    
    console.log('Loading new channel:', newChannel);
    currentChannel = newChannel;
    
    var hostname = window.location.hostname || 'localhost';
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
        parent: [hostname, 'localhost', '127.0.0.1'],
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

function changeOverlay(pacemanInfo) {
    document.getElementById('streamerName').innerHTML = pacemanInfo.liveAccount;
}

fetchInfo();
