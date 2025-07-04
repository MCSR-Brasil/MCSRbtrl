// List of allowed live accounts (add or remove accounts as needed)
const ALLOWED_LIVE_ACCOUNTS = [
  'epik_runs',
  'poc415',
  'jap_aaa',
  'tresdentess',
  'BOOSTERRUNS',
  'ykija',
  'luc4szin_',
  'reeiper',
  'braahmaquente',
  'batatowisk08',
  'hangeamorzinho',
  'psemtube',
    'patoooooooooo_',
  'TWRenatoGo',
  'Petalight',
  'shhy_y',
  'darkk575',
  'dertskapog',
  '9jeffer',
  'pedroferrer',
  'sylvsunday',
  'sanjinhu_',
  'lusodudu',
  'renatogoforgrind',
  'avokarpio',
  'luigilander_'
];

async function getLivePlayers() {
    try {
      const response = await fetch('https://paceman.gg/api/ars/liveruns?gameVersion=116l&liveOnly=false');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const data = await response.json();
  
      // Filter runs where liveAccount is not null and is in the allowed list
      const livePlayers = data
        .filter(run => {
          const liveAccount = run.user?.liveAccount?.toLowerCase();
          return liveAccount && ALLOWED_LIVE_ACCOUNTS.some(
            allowed => allowed.toLowerCase() === liveAccount
          );
        })
        .map(run => ({
          nickname: run.nickname,
          liveAccount: run.user.liveAccount,
          worldId: run.worldId,
          gameVersion: run.gameVersion,
          lastUpdated: run.lastUpdated,
          isCheated: run.isCheated,
          isHidden: run.isHidden,
          numLeaves: run.numLeaves,
          eventList: run.eventList,
          contextEventList: run.contextEventList
        }));
  
      return livePlayers;
  
    } catch (error) {
      console.error('Error fetching live players:', error);
      return [];
    }
  }

  const EVENT_BASE_PRIORITY = {
    "rsg.credits": 600,
    "rsg.enter_end": 750,
    "rsg.enter_stronghold": 700,
    "rsg.second_portal": 650,
    "rsg.first_portal": 500,
    "rsg.obtain_blaze_rod": 450,
    "rsg.obtain_obsidian": 352,
    "rsg.obtain_crying_obsidian": 351,
    "rsg.loot_bastion": 350,
    "rsg.enter_bastion": 300,
    "rsg.enter_nether": 70,
    "rsg.obtain_iron_ingot": 50,
    "rsg.obtain_lava_bucket": 30,
    "rsg.obtain_iron_pickaxe": 10
  };

  function getRunScore(event, player) {
    let basePriority = EVENT_BASE_PRIORITY[event.eventId];
    if (basePriority === undefined) return 0;

    // Special case: If player got blaze rod but hasn't entered/looted bastion, reduce priority
    if (event.eventId === 'rsg.obtain_blaze_rod') {
      const hasBastionEvents = [...(player.eventList || []), ...(player.contextEventList || [])]
        .some(e => e.eventId === 'rsg.enter_bastion' || e.eventId === 'rsg.loot_bastion');
      
      if (!hasBastionEvents) {
        basePriority = 300; // Lower priority if no bastion interaction
      }
    }

    const minutes = event.igt / 60000;
    
    // Time bonus: up to 100 points for very fast times
    // The bonus decreases linearly from 100 at 0 minutes to 0 at 30 minutes
    const timeBonus = Math.max(0, 100 * (1 - minutes / 30));
    
    // Diminuir se first portals e etc ruins estiverem com prioridade a fortress e etc bons
    const score = (basePriority * 6) + timeBonus;
  
    return score;
  }

  function getBestLivePlayer(livePlayers) {
    const now = Date.now();
    const STALE_THRESHOLD = 3 * 60 * 1000;
  
    let bestPlayer = null;
  
    for (const player of livePlayers) {
      const { eventList = [], contextEventList = [], lastUpdated } = player;
      if (eventList.length === 0 && contextEventList.length === 0) continue;
  
      const isStale = now - lastUpdated > STALE_THRESHOLD;
  
      let bestEvent = null;
      let highestScore = -Infinity;
  
      // Check both event lists for the highest scoring event
      const allEvents = [...eventList, ...contextEventList];
      for (const event of allEvents) {
        const score = getRunScore(event, player);
        if (score > highestScore) {
          highestScore = score;
          bestEvent = event;
        }
      }
  
      if (!bestEvent) continue;
  
      if (
        !bestPlayer ||
        (highestScore > bestPlayer.score && !isStale) ||
        (bestPlayer.isStale && !isStale)
      ) {
        bestPlayer = {
          ...player,
          bestEvent,
          score: highestScore,
          isStale
        };
      }
    }
  
    return bestPlayer;
  }
  