// ─────────────────────────────────────────────
//  RankUpTogether — Website app.js
//  Uses Firebase compat SDK (loaded via CDN in index.html)
// ─────────────────────────────────────────────

// ── Anti-Inspect & Elements Protection ──
(function () {
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 123 || (e.ctrlKey && e.keyCode === 83) || // F12, Ctrl+S
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // Ctrl+Shift+I/J/C
            (e.ctrlKey && e.keyCode === 85)) { // Ctrl+U
            e.preventDefault();
            return false;
        }
    });
})();

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'RankUp2026!';

// ── Firebase init (compat mode, no import needed) ──
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBBlg9YGspL2aqvfe44kf4R9lCx7u8YWLA",
    authDomain: "rankuptogetherbaba.firebaseapp.com",
    projectId: "rankuptogetherbaba",
    storageBucket: "rankuptogetherbaba.firebasestorage.app",
    messagingSenderId: "784695641517",
    appId: "1:784695641517:web:5a68f60934d0ccc5658d24"
};

firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();

// ─────────────────────────────────────────────
// Global state
// ─────────────────────────────────────────────
var gamesData = {};
var editingId = null;
var editBuffer = {};

// ─────────────────────────────────────────────
// Default game data
// ─────────────────────────────────────────────
const DEFAULT_GAMES = {
    lol: { id: 'lol', name: 'LoL', color: '#C89B3C', platforms: ['PC'], roles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'], ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'], characters: [{ id: 'Aatrox', name: 'Aatrox', imageUrl: '', roles: ['Top'] }, { id: 'Ahri', name: 'Ahri', imageUrl: '', roles: ['Mid'] }, { id: 'Akali', name: 'Akali', imageUrl: '', roles: ['Top', 'Mid'] }, { id: 'Ashe', name: 'Ashe', imageUrl: '', roles: ['ADC', 'Support'] }, { id: 'Caitlyn', name: 'Caitlyn', imageUrl: '', roles: ['ADC'] }, { id: 'Darius', name: 'Darius', imageUrl: '', roles: ['Top'] }, { id: 'Draven', name: 'Draven', imageUrl: '', roles: ['ADC'] }, { id: 'Ezreal', name: 'Ezreal', imageUrl: '', roles: ['ADC'] }, { id: 'Fiora', name: 'Fiora', imageUrl: '', roles: ['Top'] }, { id: 'Garen', name: 'Garen', imageUrl: '', roles: ['Top'] }, { id: 'Graves', name: 'Graves', imageUrl: '', roles: ['Jungle'] }, { id: 'Irelia', name: 'Irelia', imageUrl: '', roles: ['Top', 'Mid'] }, { id: 'Jax', name: 'Jax', imageUrl: '', roles: ['Top', 'Jungle'] }, { id: 'Jhin', name: 'Jhin', imageUrl: '', roles: ['ADC'] }, { id: 'Jinx', name: 'Jinx', imageUrl: '', roles: ['ADC'] }, { id: 'Katarina', name: 'Katarina', imageUrl: '', roles: ['Mid'] }, { id: 'Kayn', name: 'Kayn', imageUrl: '', roles: ['Jungle'] }, { id: 'LeeSin', name: 'Lee Sin', imageUrl: '', roles: ['Jungle'] }, { id: 'Leona', name: 'Leona', imageUrl: '', roles: ['Support'] }, { id: 'Lucian', name: 'Lucian', imageUrl: '', roles: ['ADC', 'Mid'] }, { id: 'Lux', name: 'Lux', imageUrl: '', roles: ['Mid', 'Support'] }, { id: 'Morgana', name: 'Morgana', imageUrl: '', roles: ['Support', 'Mid'] }, { id: 'Riven', name: 'Riven', imageUrl: '', roles: ['Top'] }, { id: 'Samira', name: 'Samira', imageUrl: '', roles: ['ADC'] }, { id: 'Thresh', name: 'Thresh', imageUrl: '', roles: ['Support'] }, { id: 'Vayne', name: 'Vayne', imageUrl: '', roles: ['ADC', 'Top'] }, { id: 'Yasuo', name: 'Yasuo', imageUrl: '', roles: ['Mid', 'Top'] }, { id: 'Yone', name: 'Yone', imageUrl: '', roles: ['Mid', 'Top'] }, { id: 'Zed', name: 'Zed', imageUrl: '', roles: ['Mid'] }] },
    valorant: { id: 'valorant', name: 'Valorant', color: '#FF4655', platforms: ['PC'], roles: ['Duelist', 'Initiator', 'Controller', 'Sentinel'], ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'], characters: [{ id: 'jett', name: 'Jett', imageUrl: '', roles: ['Duelist'] }, { id: 'reyna', name: 'Reyna', imageUrl: '', roles: ['Duelist'] }, { id: 'raze', name: 'Raze', imageUrl: '', roles: ['Duelist'] }, { id: 'yoru', name: 'Yoru', imageUrl: '', roles: ['Duelist'] }, { id: 'neon', name: 'Neon', imageUrl: '', roles: ['Duelist'] }, { id: 'iso', name: 'Iso', imageUrl: '', roles: ['Duelist'] }, { id: 'phoenix', name: 'Phoenix', imageUrl: '', roles: ['Duelist'] }, { id: 'sova', name: 'Sova', imageUrl: '', roles: ['Initiator'] }, { id: 'breach', name: 'Breach', imageUrl: '', roles: ['Initiator'] }, { id: 'skye', name: 'Skye', imageUrl: '', roles: ['Initiator'] }, { id: 'kayo', name: 'KAY/O', imageUrl: '', roles: ['Initiator'] }, { id: 'fade', name: 'Fade', imageUrl: '', roles: ['Initiator'] }, { id: 'gekko', name: 'Gekko', imageUrl: '', roles: ['Initiator'] }, { id: 'tejo', name: 'Tejo', imageUrl: '', roles: ['Initiator'] }, { id: 'brimstone', name: 'Brimstone', imageUrl: '', roles: ['Controller'] }, { id: 'viper', name: 'Viper', imageUrl: '', roles: ['Controller'] }, { id: 'omen', name: 'Omen', imageUrl: '', roles: ['Controller'] }, { id: 'astra', name: 'Astra', imageUrl: '', roles: ['Controller'] }, { id: 'harbor', name: 'Harbor', imageUrl: '', roles: ['Controller'] }, { id: 'clove', name: 'Clove', imageUrl: '', roles: ['Controller'] }, { id: 'sage', name: 'Sage', imageUrl: '', roles: ['Sentinel'] }, { id: 'cypher', name: 'Cypher', imageUrl: '', roles: ['Sentinel'] }, { id: 'killjoy', name: 'Killjoy', imageUrl: '', roles: ['Sentinel'] }, { id: 'chamber', name: 'Chamber', imageUrl: '', roles: ['Sentinel'] }, { id: 'deadlock', name: 'Deadlock', imageUrl: '', roles: ['Sentinel'] }, { id: 'vyse', name: 'Vyse', imageUrl: '', roles: ['Sentinel'] }] },
    dota2: { id: 'dota2', name: 'Dota 2', color: '#C7281A', platforms: ['PC'], roles: ['Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support'], ranks: ['Herald', 'Guardian', 'Crusader', 'Archon', 'Legend', 'Ancient', 'Divine', 'Immortal'], characters: [{ id: 'antimage', name: 'Anti-Mage', imageUrl: '', roles: ['Carry'] }, { id: 'axe', name: 'Axe', imageUrl: '', roles: ['Offlane'] }, { id: 'crystal_maiden', name: 'Crystal Maiden', imageUrl: '', roles: ['Hard Support'] }, { id: 'invoker', name: 'Invoker', imageUrl: '', roles: ['Mid'] }, { id: 'juggernaut', name: 'Juggernaut', imageUrl: '', roles: ['Carry'] }, { id: 'lina', name: 'Lina', imageUrl: '', roles: ['Mid'] }, { id: 'lion', name: 'Lion', imageUrl: '', roles: ['Hard Support'] }, { id: 'phantom_assassin', name: 'Phantom Assassin', imageUrl: '', roles: ['Carry'] }, { id: 'pudge', name: 'Pudge', imageUrl: '', roles: ['Soft Support', 'Offlane'] }, { id: 'shadow_fiend', name: 'Shadow Fiend', imageUrl: '', roles: ['Mid', 'Carry'] }, { id: 'slark', name: 'Slark', imageUrl: '', roles: ['Carry'] }, { id: 'storm_spirit', name: 'Storm Spirit', imageUrl: '', roles: ['Mid'] }, { id: 'terrorblade', name: 'Terrorblade', imageUrl: '', roles: ['Carry'] }, { id: 'void_spirit', name: 'Void Spirit', imageUrl: '', roles: ['Mid'] }, { id: 'windrunner', name: 'Windranger', imageUrl: '', roles: ['Soft Support', 'Mid'] }] },
    tft: { id: 'tft', name: 'TFT', color: '#3BC8C8', platforms: ['PC'], roles: ['Standard', 'Double Up', 'Hyper Roll'], ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'], characters: [] },
    cs2: { id: 'cs2', name: 'CS2', color: '#E9A61F', platforms: ['PC'], roles: ['Entry Fragger', 'Sniper', 'Lurker', 'Support', 'IGL'], ranks: ['Silver I', 'Silver II', 'Silver III', 'Silver IV', 'Silver Elite', 'Silver Elite Master', 'Gold Nova I', 'Gold Nova II', 'Gold Nova III', 'Gold Nova Master', 'Master Guardian I', 'Master Guardian II', 'Master Guardian Elite', 'Distinguished Master Guardian', 'Legendary Eagle', 'Legendary Eagle Master', 'Supreme Master First Class', 'Global Elite'], characters: [{ id: 'sas', name: 'SAS', imageUrl: '', roles: ['Support'] }, { id: 'phoenix', name: 'Phoenix Connexion', imageUrl: '', roles: ['Entry Fragger'] }, { id: 'leet', name: 'Leet Crew', imageUrl: '', roles: ['Lurker'] }, { id: 'seal', name: 'SEAL Team 6', imageUrl: '', roles: ['IGL'] }] },
    pubg: { id: 'pubg', name: 'PUBG', color: '#DAA520', platforms: ['PC'], roles: ['Sniper', 'Scout', 'Fragger', 'Driver', 'Support'], ranks: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Ace Master', 'Ace Dominator', 'Conqueror'], characters: [] },
    apex: { id: 'apex', name: 'Apex Legends', color: '#FF0000', platforms: ['PC'], roles: ['Offense', 'Defense', 'Support', 'Recon'], ranks: ['Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Apex Predator'], characters: [{ id: 'wraith', name: 'Wraith', imageUrl: '', roles: ['Offense'] }, { id: 'bloodhound', name: 'Bloodhound', imageUrl: '', roles: ['Recon'] }, { id: 'gibraltar', name: 'Gibraltar', imageUrl: '', roles: ['Defense'] }, { id: 'lifeline', name: 'Lifeline', imageUrl: '', roles: ['Support'] }, { id: 'pathfinder', name: 'Pathfinder', imageUrl: '', roles: ['Recon'] }] },
    rocket_league: { id: 'rocket_league', name: 'Rocket League', color: '#00AEEF', platforms: ['PC'], roles: ['Striker', 'Defender', 'All-around'], ranks: ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Champion', 'Grand Champion', 'Supersonic Legend'], characters: [{ id: 'octane', name: 'Octane', imageUrl: '', roles: ['All-around'] }, { id: 'fennec', name: 'Fennec', imageUrl: '', roles: ['Striker'] }, { id: 'dominus', name: 'Dominus', imageUrl: '', roles: ['Defender'] }] },
    brawl_stars: { id: 'brawl_stars', name: 'Brawl Stars', color: '#F8B700', platforms: ['Mobile'], roles: ['Damage Dealer', 'Tank', 'Assassin', 'Support', 'Controller', 'Marksman', 'All Characters'], ranks: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Mythic', 'Legendary', 'Masters'], characters: [{ id: 'shelly', name: 'Shelly', imageUrl: '', roles: ['All Characters'] }, { id: 'colt', name: 'Colt', imageUrl: '', roles: ['All Characters'] }, { id: 'bull', name: 'Bull', imageUrl: '', roles: ['All Characters'] }, { id: 'crow', name: 'Crow', imageUrl: '', roles: ['All Characters'] }, { id: 'poco', name: 'Poco', imageUrl: '', roles: ['All Characters'] }, { id: 'bo', name: 'Bo', imageUrl: '', roles: ['All Characters'] }, { id: 'piper', name: 'Piper', imageUrl: '', roles: ['All Characters'] }] },
    mlbb: { id: 'mlbb', name: 'MLBB', color: '#0066FF', platforms: ['Mobile'], roles: ['Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'], ranks: ['Warrior', 'Elite', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic', 'Mythical Glory', 'Mythical Immortal'], characters: [{ id: 'tigreal', name: 'Tigreal', imageUrl: '', roles: ['Tank', 'Support'] }, { id: 'zilong', name: 'Zilong', imageUrl: '', roles: ['Fighter', 'Assassin'] }, { id: 'fanny', name: 'Fanny', imageUrl: '', roles: ['Assassin'] }, { id: 'eudora', name: 'Eudora', imageUrl: '', roles: ['Mage'] }, { id: 'miya', name: 'Miya', imageUrl: '', roles: ['Marksman'] }, { id: 'rafaela', name: 'Rafaela', imageUrl: '', roles: ['Support'] }] },
    clash_royale: { id: 'clash_royale', name: 'Clash Royale', color: '#4A90E2', platforms: ['Mobile'], roles: ['Hepsi'], ranks: ['Challenger I', 'Challenger II', 'Challenger III', 'Master I', 'Master II', 'Master III', 'Champion', 'Grand Champion', 'Royal Champion', 'Ultimate Champion'], characters: [] },
    wild_rift: { id: 'wild_rift', name: 'Wild Rift', color: '#00F0FF', platforms: ['Mobile'], roles: ['Top', 'Jungle', 'Mid', 'Duo', 'Support'], ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger', 'Sovereign'], characters: [{ id: 'garen_wr', name: 'Garen', imageUrl: '', roles: ['Top'] }, { id: 'masteryi_wr', name: 'Master Yi', imageUrl: '', roles: ['Jungle'] }, { id: 'ahri_wr', name: 'Ahri', imageUrl: '', roles: ['Mid'] }, { id: 'jinx_wr', name: 'Jinx', imageUrl: '', roles: ['Duo'] }, { id: 'blitzcrank_wr', name: 'Blitzcrank', imageUrl: '', roles: ['Support'] }] },
    pubg_mobile: { id: 'pubg_mobile', name: 'PUBG Mobile', color: '#EFA41C', platforms: ['Mobile'], roles: ['Hepsi'], ranks: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror'], characters: [] },
    knight_online: { id: 'knight_online', name: 'Knight Online', color: '#888888', platforms: ['PC'], roles: ['Warrior', 'Mage', 'Priest', 'Rogue'], ranks: ['Seviyeler/tier'], characters: [] },
    metin2: { id: 'metin2', name: 'Metin2', color: '#888888', platforms: ['PC'], roles: ['Warrior', 'Ninja', 'Sura', 'Shaman'], ranks: ['Seviyeler'], characters: [] },
    fc26: { id: 'fc26', name: 'FC 26', color: '#888888', platforms: ['PC'], roles: ['Striker', 'Midfielder', 'Def', 'GK'], ranks: ['Div 10', 'Medium', 'Elite'], characters: [] },
    rust: { id: 'rust', name: 'Rust', color: '#888888', platforms: ['PC'], roles: [], ranks: [], characters: [] },
    marvel_rivals: { id: 'marvel_rivals', name: 'Marvel Rivals', color: '#C0392B', platforms: ['PC'], roles: ['Vanguard', 'Duelist', 'Strategist'], ranks: ['Bronze', 'Medium', '1 Eternal'], characters: [] },
    pro_soccer: { id: 'pro_soccer', name: 'Pro Soccer Online', color: '#888888', platforms: ['PC'], roles: ['GK', 'Def', 'Mid', 'Att'], ranks: ['Div yapısı'], characters: [] },
    cod_warzone: { id: 'cod_warzone', name: 'Call of Duty', color: '#888888', platforms: ['PC'], roles: [], ranks: ['Bronze', 'Medium', 'Iridescent'], characters: [] },
    r6s: { id: 'r6s', name: 'Rainbow Six Siege', color: '#888888', platforms: ['PC'], roles: ['Attacker', 'Defender'], ranks: ['Copper', 'Medium', 'Champion'], characters: [] },
    tarkov: { id: 'tarkov', name: 'Escape from Tarkov', color: '#888888', platforms: ['PC'], roles: [], ranks: [], characters: [] },
    overwatch2: { id: 'overwatch2', name: 'Overwatch 2', color: '#F99E1A', platforms: ['PC'], roles: ['Tank', 'Damage', 'Support'], ranks: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Top 500'], characters: [] },
    naraka: { id: 'naraka', name: 'Naraka: Bladepoint', color: '#888888', platforms: ['PC'], roles: ['Farazi', 'Assassin', 'Support'], ranks: ['Bod', 'Medium', 'Paragon'], characters: [] },
    ark: { id: 'ark', name: 'Ark: Survival', color: '#888888', platforms: ['PC'], roles: [], ranks: [], characters: [] },
    dayz: { id: 'dayz', name: 'DayZ', color: '#888888', platforms: ['PC'], roles: [], ranks: [], characters: [] },
    palworld: { id: 'palworld', name: 'Palworld', color: '#888888', platforms: ['PC'], roles: [], ranks: [], characters: [] },
    fall_guys: { id: 'fall_guys', name: 'Fall Guys', color: '#888888', platforms: ['PC'], roles: [], ranks: ['Bronze', 'Medium', 'Legendary'], characters: [] },
    chivalry2: { id: 'chivalry2', name: 'Chivalry 2', color: '#888888', platforms: ['PC'], roles: ['Knight', 'Footman', 'Vanguard', 'Archer'], ranks: ['Tier 1', 'Medium', '60'], characters: [] },
    blazing_sails: { id: 'blazing_sails', name: 'Blazing Sails', color: '#888888', platforms: ['PC'], roles: [], ranks: [], characters: [] },
    dale_dawson: { id: 'dale_dawson', name: 'Dale Dawson Stationery', color: '#888888', platforms: ['PC'], roles: [], ranks: [], characters: [] },
    crab_game: { id: 'crab_game', name: 'Crab Game', color: '#888888', platforms: ['PC'], roles: [], ranks: [], characters: [] },
    bloodstrike: { id: 'bloodstrike', name: 'Blood Strike', color: '#888888', platforms: ['PC'], roles: [], ranks: ['Bronze', 'Medium', 'Abyss'], characters: [] },
    zula: { id: 'zula', name: 'Zula', color: '#888888', platforms: ['PC'], roles: [], ranks: ['ranklar var'], characters: [] },
    arma3: { id: 'arma3', name: 'Arma 3', color: '#888888', platforms: ['PC'], roles: [], ranks: [], characters: [] },
    dead_by_daylight: { id: 'dead_by_daylight', name: 'Dead by Daylight', color: '#888888', platforms: ['PC'], roles: ['Survivor', 'Killer'], ranks: ['Ash', 'Medium', 'Iri Emblem'], characters: [] },
    repo: { id: 'repo', name: 'REPO', color: '#888888', platforms: ['PC'], roles: [], ranks: [], characters: [] },
    arc_raiders: { id: 'arc_raiders', name: 'Arc Raiders', color: '#888888', platforms: ['PC'], roles: [], ranks: [], characters: [] },
    delta_force: { id: 'delta_force', name: 'Delta Force', color: '#888888', platforms: ['PC'], roles: [], ranks: ['rank var'], characters: [] },
    rematch: { id: 'rematch', name: 'Rematch', color: '#888888', platforms: ['PC'], roles: ['GK', 'Def', 'Mid', 'Att'], ranks: [], characters: [] },
    fc_mobile: { id: 'fc_mobile', name: 'FC Mobile', color: '#888888', platforms: ['Mobile'], roles: ['Striker', 'Mid', 'Def', 'GK'], ranks: ['Div yapısı'], characters: [] },
    efootball: { id: 'efootball', name: 'eFootball Mobile', color: '#888888', platforms: ['Mobile'], roles: ['Striker', 'Mid', 'Def', 'GK'], ranks: ['ranklar'], characters: [] },
    cod_mobile: { id: 'cod_mobile', name: 'Call of Duty Mobile', color: '#888888', platforms: ['Mobile'], roles: [], ranks: ['Bronze', 'Medium', 'Legendary'], characters: [] },
    standoff2: { id: 'standoff2', name: 'Standoff 2', color: '#888888', platforms: ['Mobile'], roles: [], ranks: ['rank var'], characters: [] },
    critical_ops: { id: 'critical_ops', name: 'Critical Ops', color: '#888888', platforms: ['Mobile'], roles: ['Entry', 'Sniper', 'Supp'], ranks: ['rank var'], characters: [] },
    arena_breakout: { id: 'arena_breakout', name: 'Arena Breakout', color: '#888888', platforms: ['Mobile'], roles: [], ranks: ['rank var'], characters: [] },
    blood_strike_m: { id: 'blood_strike_m', name: 'Blood Strike Mobile', color: '#888888', platforms: ['Mobile'], roles: [], ranks: [], characters: [] },
    free_fire: { id: 'free_fire', name: 'Free Fire', color: '#FF6600', platforms: ['Mobile'], roles: [], ranks: ['Bronze', 'Medium', 'Heroic'], characters: [] },
    rl_sideswipe: { id: 'rl_sideswipe', name: 'Rocket League Sideswipe', color: '#888888', platforms: ['Mobile'], roles: ['Striker', 'Defender'], ranks: ['Bronze', 'Medium', 'Supersonic'], characters: [] },
    ark_mobile: { id: 'ark_mobile', name: 'Ark Mobile', color: '#888888', platforms: ['Mobile'], roles: [], ranks: [], characters: [] },
    stumble_guys: { id: 'stumble_guys', name: 'Stumble Guys', color: '#888888', platforms: ['Mobile'], roles: [], ranks: ['Bronze', 'Medium', 'Legend'], characters: [] },
    zula_mobile: { id: 'zula_mobile', name: 'Zula Mobile', color: '#888888', platforms: ['Mobile'], roles: [], ranks: [], characters: [] },
    albion_mobile: { id: 'albion_mobile', name: 'Albion Online', color: '#888888', platforms: ['Mobile'], roles: ['Tank', 'Healer', 'DPS', 'Support'], ranks: ['Novice', 'Medium', 'Transcendent'], characters: [] },
    fortnite: { id: 'fortnite', name: 'Fortnite', color: '#9B59B6', platforms: ['PC', 'Mobile'], roles: [], ranks: ['Bronze', 'Medium', 'Unreal'], characters: [] },
    roblox: { id: 'roblox', name: 'Roblox', color: '#888888', platforms: ['PC', 'Mobile'], roles: [], ranks: [], characters: [] },
    among_us: { id: 'among_us', name: 'Among Us', color: '#888888', platforms: ['PC', 'Mobile'], roles: ['Crewmate', 'Impostor'], ranks: [], characters: [] },
    goose_duck: { id: 'goose_duck', name: 'Goose Goose Duck', color: '#888888', platforms: ['PC', 'Mobile'], roles: ['Crewmate', 'Impostor'], ranks: [], characters: [] },
    feign: { id: 'feign', name: 'Feign', color: '#888888', platforms: ['PC', 'Mobile'], roles: ['Crewmate', 'Impostor'], ranks: [], characters: [] },
    terraria: { id: 'terraria', name: 'Terraria', color: '#888888', platforms: ['PC', 'Mobile'], roles: [], ranks: [], characters: [] },
    genshin: { id: 'genshin', name: 'Genshin Impact', color: '#888888', platforms: ['PC', 'Mobile'], roles: [], ranks: ['AR seviyeleri'], characters: [] },
    minecraft: { id: 'minecraft', name: 'Minecraft', color: '#7CBA3B', platforms: ['PC', 'Mobile'], roles: [], ranks: [], characters: [] }
};

// ─────────────────────────────────────────────
// Tab switching
// ─────────────────────────────────────────────
function switchTab(tab) {
    var tabs = ['games', 'langs', 'users', 'reports', 'testers', 'push', 'eco'];
    var navs = ['navGames', 'navLangs', 'navUsers', 'navReports', 'navTesters', 'navPush', 'navEco'];

    tabs.forEach(function (t) {
        var el = document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1));
        if (el) el.style.display = (t === tab) ? '' : 'none';
    });

    navs.forEach(function (n) {
        var el = document.getElementById(n);
        if (el) el.classList.toggle('active', n.toLowerCase().includes(tab.toLowerCase()));
    });

    if (tab === 'langs') showLangMaintenance();
    else if (tab === 'users') loadUsers();
    else if (tab === 'reports') loadReports();
    else if (tab === 'testers') loadTesters();
    else if (tab === 'eco') loadEconomy();
}

// ─────────────────────────────────────────────
// Admin - New Features (Users, Reports, Push, Economy)
// ─────────────────────────────────────────────
var allUsers = [];

function loadUsers() {
    db.collection('users').get().then(function (snap) {
        allUsers = snap.docs.map(function (d) {
            var data = d.data();
            data.id = d.id;
            return data;
        });
        filterApUsers();
    }).catch(function (e) {
        showToast('Error loading users: ' + e.message);
    });
}

function getApTimestamp(val) {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    if (val.seconds) return val.seconds * 1000;
    if (typeof val.toMillis === 'function') return val.toMillis();
    if (typeof val.toDate === 'function') return val.toDate().getTime();
    var parsed = new Date(val).getTime();
    return isNaN(parsed) ? 0 : parsed;
}

function formatApDate(val) {
    var ts = getApTimestamp(val);
    if (!ts) return 'Bilinmiyor';
    var d = new Date(ts);
    return d.toLocaleDateString('tr-TR');
}

function filterApUsers() {
    var q = (document.getElementById('apSearchUsers') ? document.getElementById('apSearchUsers').value : '').trim().toLowerCase();
    var sortBy = (document.getElementById('apSortUsers') ? document.getElementById('apSortUsers').value : 'created_desc');
    var genderFilter = (document.getElementById('apFilterGender') ? document.getElementById('apFilterGender').value : 'all');
    var premiumFilter = (document.getElementById('apFilterPremium') ? document.getElementById('apFilterPremium').value : 'all');

    var grid = document.getElementById('apUserGrid');
    if (!grid) return;
    grid.innerHTML = '';

    var filtered = allUsers.filter(function (u) {
        var matchSearch = (!q || (u.displayName && u.displayName.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q)));
        var matchGender = (genderFilter === 'all' || u.gender === genderFilter);
        var matchPremium = (premiumFilter === 'all' || (premiumFilter === 'premium' && u.isPremium) || (premiumFilter === 'free' && !u.isPremium));
        return matchSearch && matchGender && matchPremium;
    });

    filtered.sort(function (a, b) {
        if (sortBy === 'created_desc') {
            return getApTimestamp(b.createdAt) - getApTimestamp(a.createdAt);
        }
        if (sortBy === 'created_asc') {
            return getApTimestamp(a.createdAt) - getApTimestamp(b.createdAt);
        }
        if (sortBy === 'premium_first') {
            var pA = a.isPremium ? 1 : 0;
            var pB = b.isPremium ? 1 : 0;
            if (pA !== pB) return pB - pA;
            return getApTimestamp(b.createdAt) - getApTimestamp(a.createdAt);
        }
        if (sortBy === 'diamonds_desc') {
            var dA = a.diamonds || 0;
            var dB = b.diamonds || 0;
            if (dA !== dB) return dB - dA;
            return getApTimestamp(b.createdAt) - getApTimestamp(a.createdAt);
        }
        return 0;
    });

    filtered.forEach(function (u) {
        var card = document.createElement('div');
        card.className = 'ap-game-card';
        card.style.height = 'auto';

        var createdTs = getApTimestamp(u.createdAt);
        var isNewUser = createdTs > 0 && (Date.now() - createdTs <= 3600000); // 1 hour
        var newUserHtml = isNewUser
            ? '<span style="background:rgba(0,255,156,0.15);color:#00FF9C;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;border:1px solid rgba(0,255,156,0.4);margin-left:4px;">✨ YENİ KULLANICI</span>'
            : '';

        var isOnlineHtml = u.isOnline
            ? '<span style="color:#00FF9C; font-size:10px;">🟢 Online</span>'
            : '<span style="color:gray; font-size:10px;">⭕ Offline</span>';

        var genderHtml = '';
        if (u.gender === 'kadin') genderHtml = '<span style="background:rgba(255,105,180,0.15);color:#FF69B4;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;margin-left:4px;">♀ Kadın</span>';
        else if (u.gender === 'erkek') genderHtml = '<span style="background:rgba(0,240,255,0.15);color:#00F0FF;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;margin-left:4px;">♂ Erkek</span>';
        else if (u.gender === 'diger') genderHtml = '<span style="background:rgba(180,100,255,0.15);color:#B464FF;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;margin-left:4px;">⚧ Diğer</span>';

        var premiumBadgeHtml = u.isPremium
            ? '<span style="background:rgba(255,215,0,0.15);color:#FFD700;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:bold;border:1px solid rgba(255,215,0,0.4);">⭐ PREMIUM</span>'
            : '';

        var banBtnHtml = u.isBanned
            ? '<button class="em-tag-del" style="background:#444;color:white;width:100px;" onclick="toggleBan(\'' + u.id + '\', false)">Unban</button>'
            : '<button class="em-tag-del" style="background:#FF4655;color:white;width:100px;" onclick="toggleBan(\'' + u.id + '\', true)">Ban User</button>';

        card.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">' +
            '<div style="display:flex; align-items:center; gap:10px;">' +
            (u.profileImage ? '<img src="' + u.profileImage + '" style="width:40px;height:40px;border-radius:20px;object-fit:cover;"/>' : '<div style="width:40px;height:40px;border-radius:20px;background:#333;"></div>') +
            '<div>' +
            '<div style="font-weight:bold; color:white; display:flex; align-items:center; flex-wrap:wrap;">' + (u.displayName || 'No Name') + newUserHtml + genderHtml + '</div>' +
            '<div style="font-size:11px; color:gray;">' + (u.email || 'No Email') + '</div>' +
            '</div>' +
            '</div>' +
            '<button onclick="openUserEdit(\'' + u.id + '\')" style="background:none;border:none;color:gray;cursor:pointer;font-size:18px;">⚙️</button>' +
            '</div>' +
            '<div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">' + isOnlineHtml + ' ' + premiumBadgeHtml + '</div>' +
            '<div style="font-size:11px; color:rgba(255,255,255,0.5); margin-bottom:10px;">📅 Kayıt: ' + formatApDate(u.createdAt) + '</div>' +
            '<div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">' +
            '<span style="font-size:12px; color:gray;">💎 ' + (u.diamonds || 0) + '</span>' +
            banBtnHtml +
            '</div>';

        grid.appendChild(card);
    });
}

var editingUserId = null;
var editingUserToken = null;

var editingUserGallery = [];

function openUserEdit(uid) {
    var u = allUsers.find(x => x.id === uid);
    if (!u) return;

    editingUserId = uid;
    editingUserToken = u.pushToken || null;
    editingUserGallery = u.profileImages ? [...u.profileImages] : [];

    document.getElementById('ueUserId').textContent = uid;
    document.getElementById('ueProfileImg').src = u.profileImage || '';
    document.getElementById('ueImageInput').value = u.profileImage || '';
    document.getElementById('ueNameInput').value = u.displayName || '';
    document.getElementById('uePushTitle').value = '';
    document.getElementById('uePushBody').value = '';

    renderUserGallery();

    document.getElementById('userEditModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function renderUserGallery() {
    var grid = document.getElementById('ueGalleryGrid');
    grid.innerHTML = '';
    if (editingUserGallery.length === 0) {
        grid.innerHTML = '<span style="color:var(--muted); font-size:11px;">No extra photos found.</span>';
        return;
    }

    editingUserGallery.forEach(function (url, idx) {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.width = '40px';
        div.style.height = '40px';
        div.innerHTML = '<img src="' + url + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,0.1);" />' +
            '<button onclick="removeGalleryPic(' + idx + ')" style="position:absolute;top:-6px;right:-6px;background:#FF4655;color:white;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;font-weight:bold;cursor:pointer;">✕</button>';
        grid.appendChild(div);
    });
}

function removeGalleryPic(idx) {
    editingUserGallery.splice(idx, 1);
    renderUserGallery();
}

function removeUserAvatar() {
    document.getElementById('ueImageInput').value = '';
    document.getElementById('ueProfileImg').src = '';
}

function uploadUserPhoto(event) {
    var file = event.target.files[0];
    if (!file) return;

    var statusEl = document.getElementById('ueUploadStatus');
    statusEl.style.display = 'block';
    statusEl.textContent = 'Uploading picture...';
    statusEl.style.color = 'var(--cyan)';

    var formData = new FormData();
    formData.append('image', file);

    fetch('https://api.imgbb.com/1/upload?key=960c63de050343f129d40a9ff1943f31', {
        method: 'POST',
        body: formData
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.success && data.data && data.data.url) {
                statusEl.textContent = 'Upload Successful!';
                statusEl.style.color = '#00FF9C';
                document.getElementById('ueImageInput').value = data.data.url;
                document.getElementById('ueProfileImg').src = data.data.url;
                setTimeout(function () { statusEl.style.display = 'none'; }, 2000);
            } else {
                statusEl.textContent = 'Failed to upload image.';
                statusEl.style.color = '#FF4655';
            }
        })
        .catch(function (err) {
            statusEl.textContent = 'Upload error.';
            statusEl.style.color = '#FF4655';
        });
}

function closeUserEdit() {
    document.getElementById('userEditModal').style.display = 'none';
    document.body.style.overflow = '';
    editingUserId = null;
    editingUserToken = null;
}

function saveUserEdit() {
    if (!editingUserId) return;
    var newName = document.getElementById('ueNameInput').value.trim();
    var newImg = document.getElementById('ueImageInput').value.trim();

    db.collection('users').doc(editingUserId).update({
        displayName: newName,
        profileImage: newImg,
        profileImages: editingUserGallery
    }).then(function () {
        showToast('✓ User profile updated successfully!');
        loadUsers();
        closeUserEdit();
    }).catch(function (e) {
        showToast('Error updating user: ' + e.message);
    });
}

function sendUserPush() {
    if (!editingUserToken) {
        showToast('⚠ This user does not have a valid push token currently.');
        return;
    }

    var title = document.getElementById('uePushTitle').value.trim();
    var body = document.getElementById('uePushBody').value.trim();

    if (!title || !body) {
        showToast('Please enter both title and body.');
        return;
    }

    fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            to: editingUserToken,
            sound: 'default',
            title: title,
            body: body
        })
    }).then(function () {
        showToast('✓ Notification sent directly to player!');
        document.getElementById('uePushTitle').value = '';
        document.getElementById('uePushBody').value = '';
    }).catch(function (err) {
        showToast('Error sending push: ' + err.message);
    });
}

function deleteAccount() {
    if (!editingUserId) return;
    var confirm1 = confirm('ATTENTION: This will permanently delete the user document from the database (Does not revoke auth but they become a ghost). Continue?');
    if (!confirm1) return;

    var confirm2 = confirm('Are you REALLY sure? This cannot be undone.');
    if (!confirm2) return;

    db.collection('users').doc(editingUserId).delete().then(function () {
        showToast('Account permanently deleted.');
        loadUsers();
        closeUserEdit();
    }).catch(function (err) {
        showToast('Delete error: ' + err.message);
    });
}

var banningUserId = null;

function toggleBan(uid, shouldBan) {
    if (shouldBan) {
        banningUserId = uid;
        document.getElementById('banModal').style.display = 'flex';
        document.getElementById('customBanHours').value = '';
    } else {
        if (!confirm("Kullanıcının banını açmak istiyor musunuz?")) return;
        db.collection('users').doc(uid).update({ isBanned: false, banUntil: null }).then(function () {
            showToast('Kullanıcı banı açıldı.');
            loadUsers();
            if (currentReportTab) loadReports();
        });
    }
}

function closeBanModal() {
    document.getElementById('banModal').style.display = 'none';
    banningUserId = null;
}

function applyBan(hours) {
    if (!banningUserId) return;

    var banUntil = null;
    var now = Date.now();

    if (hours === 'permanent') {
        banUntil = 4102444800000; // 2100 as permanent
    } else if (hours === 'custom') {
        var h = document.getElementById('customBanHours').value;
        if (!h || isNaN(h) || h <= 0) {
            showToast('Lütfen geçerli bir saat girin.');
            return;
        }
        banUntil = now + (Number(h) * 60 * 60 * 1000);
    } else {
        banUntil = now + (Number(hours) * 60 * 60 * 1000);
    }

    db.collection('users').doc(banningUserId).update({ isBanned: true, banUntil: banUntil }).then(function () {
        showToast('Kullanıcı başarıyla banlandı.');
        closeBanModal();
        loadUsers();
        if (currentReportTab) loadReports();
    }).catch(function (err) {
        showToast('Hata: ' + err.message);
    });
}

var currentReportTab = 'active';
var usersCacheMap = {};

function switchReportTab(tab) {
    currentReportTab = tab;
    var btnActive = document.getElementById('reportTabActive');
    var btnTrash = document.getElementById('reportTabTrash');

    if (btnActive && btnTrash) {
        btnActive.style.background = tab === 'active' ? 'rgba(0,240,255,0.12)' : 'rgba(255,255,255,0.04)';
        btnActive.style.color = tab === 'active' ? 'var(--cyan)' : 'rgba(255,255,255,0.6)';
        btnActive.style.borderColor = tab === 'active' ? 'var(--cyan)' : 'rgba(255,255,255,0.1)';

        btnTrash.style.background = tab === 'trash' ? 'rgba(255,70,85,0.12)' : 'rgba(255,255,255,0.04)';
        btnTrash.style.color = tab === 'trash' ? '#FF4655' : 'rgba(255,255,255,0.6)';
        btnTrash.style.borderColor = tab === 'trash' ? '#FF4655' : 'rgba(255,255,255,0.1)';
    }
    loadReports();
}

function loadReports() {
    var list = document.getElementById('apReportsList');
    list.innerHTML = '<div style="color:var(--muted)">Raporlar yükleniyor...</div>';

    // Add tab buttons dynamically if they don't exist
    if (!document.getElementById('reportTabActive')) {
        var topControls = document.createElement('div');
        topControls.style.cssText = 'display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap;';
        topControls.innerHTML =
            '<button id="reportTabActive" onclick="switchReportTab(\'active\')" style="padding:8px 20px; border-radius:20px; border:1.5px solid var(--cyan); background:rgba(0,240,255,0.12); color:var(--cyan); font-size:13px; font-weight:600; cursor:pointer;">⚠️ Aktif Raporlar</button>' +
            '<button id="reportTabTrash" onclick="switchReportTab(\'trash\')" style="padding:8px 20px; border-radius:20px; border:1.5px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.6); font-size:13px; font-weight:600; cursor:pointer;">🗑️ Çöpe Atılanlar</button>';
        list.parentNode.insertBefore(topControls, list);
    }

    db.collection('feedbacks').orderBy('createdAt', 'desc').get().then(async function (snap) {
        list.innerHTML = '';
        var validCount = 0;

        for (let i = 0; i < snap.docs.length; i++) {
            var doc = snap.docs[i];
            var r = doc.data();
            var status = r.status || 'active';

            if (currentReportTab === 'active' && status === 'deleted') continue;
            if (currentReportTab === 'trash' && status !== 'deleted') continue;

            validCount++;
            var repId = r.reportedId || r.reportedUserId;
            var repterId = r.reporterId;

            if (repId && !usersCacheMap[repId]) {
                var u = await db.collection('users').doc(repId).get();
                usersCacheMap[repId] = u.exists ? (u.data().displayName || repId) : repId + ' (Silinmiş Hesap)';
            }
            if (repterId && !usersCacheMap[repterId]) {
                var u = await db.collection('users').doc(repterId).get();
                usersCacheMap[repterId] = u.exists ? (u.data().displayName || repterId) : repterId + ' (Silinmiş Hesap)';
            }

            var reporterName = usersCacheMap[repterId] || 'Bilinmiyor';
            var reportedName = usersCacheMap[repId] || 'Bilinmiyor';

            var div = document.createElement('div');
            var isMessage = r.type === 'message_report';
            var reportTypeStr = isMessage ? ' (Spesifik Mesaj İhlali)' : ' (Genel Profil İhlali)';
            var dateStr = r.createdAt ? new Date(r.createdAt.toMillis ? r.createdAt.toMillis() : r.createdAt).toLocaleString() : new Date().toLocaleString();

            var cardButtons = '<button onclick="toggleBan(\'' + repId + '\', true)" style="background:#FF4655; border:none; padding:6px 12px; border-radius:6px; color:white; font-size:12px; cursor:pointer;">⛔ Hesabı Banla</button>';

            if (currentReportTab === 'active') {
                cardButtons += '<button onclick="deleteReport(\'' + doc.id + '\')" style="background:rgba(255,255,255,0.1); border:none; padding:6px 12px; border-radius:6px; color:white; font-size:12px; cursor:pointer;">✔️ Çözüldü Olarak İşaretle (Çöpe At)</button>';
            } else {
                cardButtons += '<button onclick="restoreReport(\'' + doc.id + '\')" style="background:rgba(255,255,255,0.1); border:none; padding:6px 12px; border-radius:6px; color:white; font-size:12px; cursor:pointer;">↩️ Geri Yükle</button>';
            }

            if (isMessage && r.matchId) cardButtons += '<button onclick="openChatView(\'' + r.matchId + '\', \'' + r.messageId + '\')" style="background:#00AEEF; border:none; padding:6px 12px; border-radius:6px; color:white; font-size:12px; cursor:pointer;">💬 Hangi Mesajdan Gelmiş? (Gör)</button>';
            if (repterId && repId) cardButtons += '<button onclick="openFullChatView(\'' + repterId + '\', \'' + repId + '\')" style="background:#E9A61F; border:none; padding:6px 12px; border-radius:6px; color:white; font-size:12px; cursor:pointer;">📂 Çiftin Sohbetine Gir</button>';

            div.style.cssText = 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px;';
            div.innerHTML =
                '<div style="display:flex; justify-content:space-between; margin-bottom:8px;">' +
                '<strong style="color:var(--cyan); font-size:14px;">Sebep: ' + r.reason + reportTypeStr + '</strong>' +
                '<span style="color:gray; font-size:11px;">' + dateStr + '</span>' +
                '</div>' +
                '<div style="color:var(--muted); font-size:13px; margin-bottom:12px;">' +
                'Raporlanan Kişi: <b style="color:white">' + reportedName + '</b> <span style="font-size:10px;color:rgba(255,255,255,0.3)">(' + repId + ')</span><br>' +
                'Raporlayan Kişi: <b style="color:white">' + reporterName + '</b> <span style="font-size:10px;color:rgba(255,255,255,0.3)">(' + repterId + ')</span>' +
                '</div>' +
                '<div style="display:flex; flex-wrap:wrap; gap:10px;">' + cardButtons + '</div>';
            list.appendChild(div);
        }

        if (validCount === 0) list.innerHTML = '<div style="color:rgba(255,255,255,0.3);padding:20px;text-align:center;">Bu sekmede gösterilecek rapor yok.</div>';
    }).catch(function (e) {
        list.innerHTML = '<div style="color:red">Hata: ' + e.message + '</div>';
    });
}

function openChatView(matchId, targetedMessageId) {
    var modal = document.getElementById('chatViewModal');
    var content = document.getElementById('chatViewContent');
    content.innerHTML = '<div style="color:gray;text-align:center;">Sohbet yükleniyor...</div>';
    modal.style.display = 'flex';

    db.collection('matches').doc(matchId).collection('messages').orderBy('createdAt', 'asc').get().then(function (snap) {
        content.innerHTML = '';
        if (snap.empty) {
            content.innerHTML = '<div style="color:gray;text-align:center;">Odada mesaj bulunamadı veya silinmiş.</div>';
            return;
        }
        snap.forEach(function (doc) {
            var m = doc.data();
            var date = new Date(m.createdAt ? (m.createdAt.toMillis ? m.createdAt.toMillis() : m.createdAt) : Date.now()).toLocaleTimeString();
            var isTarget = String(doc.id) === String(targetedMessageId);
            var bgUrl = isTarget ? 'rgba(255,70,85,0.2)' : 'rgba(255,255,255,0.05)';
            var borderUrl = isTarget ? '1px solid #FF4655' : '1px solid transparent';

            var senderUser = allUsers.find(u => u.id === m.senderId);
            var senderName = usersCacheMap[m.senderId] || m.senderId;

            var div = document.createElement('div');
            div.style.cssText = 'padding:10px; border-radius:8px; background:' + bgUrl + '; border:' + borderUrl + ';';
            if (isTarget) {
                div.innerHTML += '<div style="color:#FF4655; font-size:10px; font-weight:bold; margin-bottom:2px;">⚠️ RAPORLANMIŞ MESAJ</div>';
            }

            var messageTxt = m.text || '[Boş mesaj]';
            if (m.type === 'audio') messageTxt = '🎤 [Ses Dosyası]';
            if (m.deleted) {
                var backupText = m.originalText ? m.originalText : 'Mesajın eski bir kaydı yok (Sistem güncellemesinden önce silinmiş)';
                messageTxt += ' <br/><span style="color:rgba(255,70,85,0.8);font-size:11px;">(SİLİNMİŞ İÇERİK: ' + backupText + ')</span>';
            }

            div.innerHTML += '<div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:4px;">' + senderName + ' - ' + date + '</div>' +
                '<div style="color:white;font-size:14px;">' + messageTxt + '</div>';

            content.appendChild(div);
            if (isTarget) setTimeout(() => div.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
        });
    }).catch(function (e) {
        content.innerHTML = '<div style="color:red;text-align:center;">Mesajlar yüklenemedi: ' + e.message + '</div>';
    });
}

function openFullChatView(user1, user2) {
    var modal = document.getElementById('chatViewModal');
    var content = document.getElementById('chatViewContent');
    content.innerHTML = '<div style="color:gray;text-align:center;">İki kullanıcı arasındaki sohbet odası aranıyor...</div>';
    modal.style.display = 'flex';

    db.collection('matches').where('participants', 'array-contains', user1).get().then(function (snap) {
        var matchFound = null;
        snap.forEach(function (doc) {
            var data = doc.data();
            if (data.participants && data.participants.includes(user2)) {
                matchFound = doc.id;
            }
        });

        if (!matchFound) {
            content.innerHTML = '<div style="color:gray;text-align:center;">Aranan kullanıcılar arasında eşleşme/sohbet kaydı bulunamadı (Eşleşme bozulmuş olabilir).</div>';
            return;
        }

        openChatView(matchFound, null);
    }).catch(function (e) {
        content.innerHTML = '<div style="color:red;text-align:center;">Hata: ' + e.message + '</div>';
    });
}

function closeChatView() {
    document.getElementById('chatViewModal').style.display = 'none';
}

function deleteReport(reportId) {
    db.collection('feedbacks').doc(reportId).update({ status: 'deleted' }).then(function () {
        showToast('Rapor başarıyla çöpe atıldı.');
        loadReports();
    });
}

function restoreReport(reportId) {
    db.collection('feedbacks').doc(reportId).update({ status: 'active' }).then(function () {
        showToast('Rapor geri yüklendi.');
        loadReports();
    });
}

function sendGlobalPush() {
    var title = document.getElementById('pushTitle').value.trim();
    var body = document.getElementById('pushBody').value.trim();
    var status = document.getElementById('pushStatus');

    if (!title || !body) {
        showToast('⚠ Please enter title and body.');
        return;
    }

    if (!confirm("This will send a push notification to ALL users. Are you sure?")) return;

    status.textContent = 'Fetching push tokens...';
    status.style.color = 'var(--cyan)';

    db.collection('users').get().then(function (snap) {
        var tokens = [];
        snap.forEach(function (d) {
            var tk = d.data().pushToken;
            if (tk && tk.startsWith('ExponentPushToken')) {
                tokens.push(tk);
            }
        });

        if (tokens.length === 0) {
            status.textContent = 'No valid push tokens found.';
            status.style.color = '#FF4655';
            return;
        }

        status.textContent = 'Sending notification to ' + tokens.length + ' users...';

        var messages = tokens.map(function (tk) {
            return {
                to: tk,
                sound: 'default',
                title: title,
                body: body
            };
        });

        // Push in chunks of 50 to Expo
        var chunks = [];
        var CHUNK_SIZE = 50;
        for (var i = 0; i < messages.length; i += CHUNK_SIZE) {
            chunks.push(messages.slice(i, i + CHUNK_SIZE));
        }

        var promises = chunks.map(function (chunk) {
            return fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk)
            });
        });

        Promise.all(promises).then(function () {
            status.textContent = '✓ Successfully requested push send to ' + tokens.length + ' users!';
            status.style.color = '#00FF9C';
            document.getElementById('pushTitle').value = '';
            document.getElementById('pushBody').value = '';
        }).catch(function (err) {
            status.textContent = 'Error sending push: ' + err.message;
            status.style.color = '#FF4655';
        });

    }).catch(function (e) {
        status.textContent = 'Database error: ' + e.message;
        status.style.color = '#FF4655';
    });
}

function loadEconomy() {
    db.collection('admin').doc('economyConfig').get().then(function (snap) {
        if (snap.exists) {
            var data = snap.data();
            if (data.lobbyBaseCost) document.getElementById('ecoLobbyBase').value = data.lobbyBaseCost;
            if (data.lobbyPremMult) document.getElementById('ecoLobbyMult').value = data.lobbyPremMult;
            if (data.adReward) document.getElementById('ecoAdReward').value = data.adReward;
            if (data.spinCooldown) document.getElementById('ecoSpinCooldown').value = data.spinCooldown;
        }
    });
}

function saveEconomy() {
    var conf = {
        lobbyBaseCost: parseFloat(document.getElementById('ecoLobbyBase').value) || 30,
        lobbyPremMult: parseFloat(document.getElementById('ecoLobbyMult').value) || 1.5,
        adReward: parseFloat(document.getElementById('ecoAdReward').value) || 2,
        spinCooldown: parseFloat(document.getElementById('ecoSpinCooldown').value) || 3
    };

    db.collection('admin').doc('economyConfig').set(conf, { merge: true }).then(function () {
        showToast('✓ Economy settings saved successfully!');
    }).catch(function (e) {
        showToast('⚠ Error saving: ' + e.message);
    });
}


function showLangMaintenance() {
    var tab = document.getElementById('tabLangs');
    tab.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:80px 24px;text-align:center;">' +
        '<div style="font-size:64px;margin-bottom:24px;">🔧</div>' +
        '<h2 style="font-size:26px;font-weight:800;color:#fff;margin:0 0 12px 0;">Bakımda</h2>' +
        '<p style="font-size:15px;color:rgba(255,255,255,0.45);max-width:360px;line-height:1.7;margin:0;">' +
        'Dil yönetimi şu an bakım modundadır.<br>Yakında tekrar kullanıma açılacaktır.' +
        '</p>' +
        '<div style="margin-top:32px;padding:10px 24px;border:1px solid rgba(0,240,255,0.25);border-radius:30px;font-size:13px;font-weight:600;color:rgba(0,240,255,0.7);">Maintenance Mode</div>' +
        '</div>';
}

// ─────────────────────────────────────────────
// Language Management
// ─────────────────────────────────────────────
var langData = {};          // { tr: {key:val,...}, en: {key:val,...}, ar: {key:val,...} }
var activeLang = 'tr';
var langMeta = {};          // { tr: 'Türkçe', en: 'English', ar: 'Arabic', ... }

// Baseline translations from the app (TR + EN keys as reference)
var BASE_LANGS = {
    tr: 'Türkçe', en: 'English', de: 'Deutsch', fr: 'Français',
    es: 'Español', it: 'Italiano', pt: 'Português', ru: 'Русский',
    ja: '日本語', ko: '한국어'
};

// All known keys (built from TR as the master)
var ALL_KEYS = [
    'deleteAccount', 'deleteAccountConfirm',
    'tutorialWelcomeTitle', 'tutorialWelcomeDesc',
    'tutorialStep1Title', 'tutorialStep1Desc',
    'tutorialStep2Title', 'tutorialStep2Desc',
    'tutorialStep3Title', 'tutorialStep3Desc',
    'skipTutorial', 'next', 'finish',
    'selectLanguage', 'languageSubtitle', 'turkish', 'english', 'german', 'french', 'spanish', 'italian', 'portuguese', 'russian', 'japanese', 'korean', 'moreLanguages', 'continue',
    'welcome', 'welcomeSubtitle', 'login', 'register', 'registerSubtitle', 'email', 'emailPlaceholder', 'password', 'passwordPlaceholder', 'confirmPassword', 'confirmPasswordPlaceholder',
    'forgotPassword', 'noAccount', 'hasAccount', 'loginBtn', 'registerBtn', 'appleLogin', 'googleLogin', 'continueWithEmail',
    'verifyEmail', 'verifySubtitle', 'enterCode', 'verifyBtn', 'resendCode', 'resendIn',
    'createProfile', 'profileSubtitle', 'yourName', 'namePlaceholder', 'selectGame', 'selectRole', 'selectCharacter', 'selectRank',
    'lookingFor', 'lookingForGame', 'lookingForRole', 'lookingForRankMin', 'lookingForRankMax', 'completeProfile', 'step', 'of', 'lookingForSection',
    'swipeRight', 'swipeLeft', 'superLike', 'noMoreProfiles', 'noMoreSubtitle', 'reload',
    'itsAMatch', 'matchedWith', 'goToChat', 'keepSwiping', 'congrats', 'startConversation', 'matchSubtitle', 'close',
    'swipe', 'settings', 'chats', 'profile',
    'activeMatches', 'newMatches', 'messages', 'noNewMatches', 'noChats', 'noChatsSubtitle', 'typeMessage', 'online', 'today', 'swipeToFindMore',
    'preferences', 'changeLanguage', 'editPreferences', 'notifications', 'privacy', 'about', 'logout', 'logoutConfirm', 'yes', 'cancel', 'all',
    'editProfile', 'save', 'saved', 'myGames', 'lookingForTitle', 'myInfo', 'onlineBadge', 'locationPlaceholder', 'editProfileTitle', 'myProfileTitle',
    'managePhotos', 'identityInfo', 'displayNamePlaceholder', 'realNamePlaceholder', 'aboutMe', 'bioPlaceholder', 'gamePreferences', 'activeGame', 'favoriteRole', 'currentRank',
    'manageOtherGames', 'addNewGame', 'playerReviews', 'noOtherGames', 'noReviews', 'manageAchievements', 'achievements', 'maxAchievementsReached',
    'tournaments', 'comingSoon', 'watchAd', 'earnGems', 'translated', 'oneHourPremium',
    'store', 'premiumMembership', 'premiumSubtitle', 'monthlyPremium', 'yearlyPremium', 'mostPopular', 'perMonth', 'perYear', 'buyNow', 'processing',
    'diamondPacks', 'diamondSubtitle', 'buyDiamonds', 'premiumActiveMsg', 'diamondsAdded', 'storeInfo',
    'seeWhoLiked', 'unlimitedSwipes', 'fiveSuperLikes', 'adFree', 'everythingInMonthly', 'fortyPercentAdvantage', 'specialProfileBadge', 'priorityMatch', 'diamondBalance',
    'likersTitle', 'noLikersTitle', 'noLikersSubtitle', 'superLikerTag',
    'fillAll', 'invalidEmail', 'passwordMismatch', 'passwordShort', 'wrongCode', 'loginError', 'registerError', 'networkError', 'error', 'success',
    'insufficientDiamonds', 'insufficientDiamondsMsg', 'premiumRequired', 'premiumRequiredMsg', 'noUndoSteps', 'undoError', 'info', 'pleaseWait',
    'adNotLoaded', 'errorOccurred', 'appleLoginNotActive', 'emailInUse', 'termsSubtitle', 'codeResent', 'wrongCodeLong', 'bypassText1', 'bypassText2',
    'gender', 'genderMale', 'genderFemale', 'genderOther', 'locationLabel',
    'profileHighlights', 'highlightDesc', 'videoUploaded', 'uploading', 'changeBtn', 'uploadHighlight', 'videoMinError', 'videoMaxError', 'highlightUpdated', 'videoUploadError',
    'searchGame', 'searchCharacter', 'gamePreferencesTitle', 'roleAndCharacter', 'maxSideGames', 'photoRequired',
    'achWinMasterDesc', 'achHardGamerDesc', 'achMatchProDesc', 'achLoyalLegendDesc', 'achFriendlyPlayerDesc',
    'dailyStreak', 'dayN', 'claimReward', 'hoursRemaining', 'gem', 'gems', 'todaysReward', 'nextRewardIn', 'ok', 'streakLegend', 'streakFire', 'streakFlaming', 'streakHot', 'streakStart',
    'groupChat', 'group', 'members', 'player', 'endMatch', 'endMatchConfirm', 'giveUp', 'endBtn', 'reportAndBlock', 'reportTitle', 'reportSubtitle',
    'reportDone', 'reportDoneMsg', 'reportInappropriate', 'reportSpam', 'reportHarassment', 'reportFakeProfile', 'reportOther',
    'matchStartMsg', 'matchStartTitle', 'matchStartDesc', 'confirm', 'reject', 'waitingOtherPlayer', 'matchConfirmed', 'reviewTimer', 'verifyResults',
    'you', 'opponent', 'canceled', 'yourVote', 'opponentWaiting', 'canReviewNow', 'matchStarted', 'checkMatchStatus', 'justNow',
    'groupInfo', 'participants', 'participantsTitle', 'groupOwner', 'youTag', 'kick', 'groupParticipants', 'startMatchBtn',
    'lobbyHours12', 'lobbyDay1', 'lobbyDays3', 'leaveGroup', 'leaveGroupConfirm', 'leftGroup', 'leaveFailed',
    'requestSent', 'requestSentMsg', 'requestFailed', 'expired', 'hourShort', 'minuteShort', 'manage', 'leave', 'requestSentBadge',
    'notification', 'joinRequest', 'noActiveLobbies', 'createLobby', 'lobbyPhoto', 'selectCoverPhoto', 'selectGameLabel',
    'lobbyName', 'lobbyNamePlaceholder', 'description', 'lobbyDescPlaceholder', 'lobbyDuration', 'memberCount', 'personN',
    'openLobby', 'manageLobby', 'lobbyDetails', 'areYouSure', 'deleteWarning', 'yesDelete', 'updating', 'updateInfo',
    'joinRequests', 'noPendingRequests', 'membersLabel', 'closeLobby', 'lobbyCreated', 'lobbyCreateError', 'lobbyFillError',
    'insufficientGemsLobby', 'lobbyUpdated', 'updateFailed', 'lobbyDeleted', 'lobbyDeleteError',
    'userAddedToLobby', 'lobbyFull', 'userKicked', 'operationFailed', 'notifCanceled', 'notifEnabled', 'notifCanceledMsg', 'notifEnabledMsg', 'allFilter', 'loading'
];

function loadLangData() {
    setLangSyncBadge('saving');
    db.collection('admin').doc('langConfig').get().then(function (snap) {
        if (snap.exists) {
            var saved = snap.data();
            langData = saved.translations || {};
            langMeta = saved.meta || {};
        } else {
            langData = {};
            langMeta = {};
        }
        // Merge built-in lang names
        Object.keys(BASE_LANGS).forEach(function (code) {
            if (!langMeta[code]) langMeta[code] = BASE_LANGS[code];
        });
        setLangSyncBadge('synced');
        renderLangChips();
        renderLangKeys();
    }).catch(function () {
        langMeta = Object.assign({}, BASE_LANGS);
        setLangSyncBadge('synced');
        renderLangChips();
        renderLangKeys();
    });
}

function setLangSyncBadge(state) {
    var b = document.getElementById('apLangSyncBadge');
    if (!b) return;
    if (state === 'saving') { b.textContent = '⟳ Saving…'; b.className = 'ap-sync saving'; }
    else { b.textContent = '✓ Synced'; b.className = 'ap-sync synced'; }
}

function renderLangChips() {
    var row = document.getElementById('langChipsRow');
    row.innerHTML = '';
    Object.keys(langMeta).sort().forEach(function (code) {
        var btn = document.createElement('button');
        btn.textContent = langMeta[code] + ' (' + code + ')';
        btn.className = 'em-tag' + (code === activeLang ? ' lang-chip-active' : ' lang-chip');
        btn.style.cssText = 'padding:8px 16px;border-radius:20px;cursor:pointer;border:1.5px solid ' +
            (code === activeLang ? 'var(--cyan)' : 'rgba(255,255,255,0.1)') + ';background:' +
            (code === activeLang ? 'rgba(0,240,255,0.12)' : 'rgba(255,255,255,0.04)') + ';color:' +
            (code === activeLang ? 'var(--cyan)' : 'rgba(255,255,255,0.6)') + ';font-size:13px;font-weight:600;';
        btn.onclick = function () { activeLang = code; renderLangChips(); renderLangKeys(); };
        row.appendChild(btn);
    });
}

function renderLangKeys(filter) {
    var table = document.getElementById('langKeyTable');
    table.innerHTML = '';
    var q = (filter || document.getElementById('langKeySearch').value || '').trim().toLowerCase();
    var currentLangData = langData[activeLang] || {};

    ALL_KEYS.filter(function (k) { return !q || k.toLowerCase().includes(q); }).forEach(function (key) {
        var val = currentLangData[key] !== undefined ? currentLangData[key] : '';
        var row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:260px 1fr;gap:10px;align-items:start;';

        var keyLabel = document.createElement('div');
        keyLabel.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.4);font-family:monospace;padding:10px 0;word-break:break-all;';
        keyLabel.textContent = key;

        var inp = document.createElement('input');
        inp.type = 'text';
        inp.className = 'ap-search';
        inp.style.cssText = 'width:100%;box-sizing:border-box;';
        inp.value = val;
        inp.dataset.key = key;
        inp.placeholder = '(empty — falls back to EN)';
        inp.oninput = function () {
            if (!langData[activeLang]) langData[activeLang] = {};
            langData[activeLang][this.dataset.key] = this.value;
        };

        row.appendChild(keyLabel);
        row.appendChild(inp);
        table.appendChild(row);
    });

    if (table.children.length === 0) {
        table.innerHTML = '<div style="color:rgba(255,255,255,0.3);padding:20px;text-align:center;">No keys found.</div>';
    }
}

function filterLangKeys() {
    renderLangKeys(document.getElementById('langKeySearch').value);
}

function addNewLang() {
    var code = document.getElementById('newLangCode').value.trim().toLowerCase();
    var name = document.getElementById('newLangName').value.trim();
    if (!code || !name) { showToast('⚠ Enter language code and name'); return; }
    if (langMeta[code]) { showToast('Language "' + code + '" already exists'); return; }
    langMeta[code] = name;
    langData[code] = {};
    activeLang = code;
    document.getElementById('newLangCode').value = '';
    document.getElementById('newLangName').value = '';
    renderLangChips();
    renderLangKeys();
    showToast('✓ Language "' + name + '" added — now add translations and save!');
}

function saveLangData() {
    setLangSyncBadge('saving');
    db.collection('admin').doc('langConfig').set({ meta: langMeta, translations: langData })
        .then(function () {
            setLangSyncBadge('synced');
            showToast('✓ Language data saved and synced to app!');
        })
        .catch(function () {
            setLangSyncBadge('synced');
            showToast('⚠ Could not reach Firestore — check connection');
        });
}

function loadGames() {
    setSyncBadge('saving');
    db.collection('admin').doc('gameConfig').get()
        .then(function (snap) {
            if (snap.exists) {
                var saved = snap.data();
                gamesData = Object.assign({}, DEFAULT_GAMES);
                Object.keys(saved).forEach(function (k) {
                    gamesData[k] = saved[k];
                });
            } else {
                gamesData = Object.assign({}, DEFAULT_GAMES);
            }
            setSyncBadge('synced');
            renderApGrid(Object.values(gamesData));
        })
        .catch(function () {
            gamesData = Object.assign({}, DEFAULT_GAMES);
            setSyncBadge('synced');
            renderApGrid(Object.values(gamesData));
        });
}

// ─────────────────────────────────────────────
// Save to Firestore
// ─────────────────────────────────────────────
function saveToFirestore() {
    setSyncBadge('saving');
    db.collection('admin').doc('gameConfig').set(gamesData)
        .then(function () { setSyncBadge('synced'); })
        .catch(function () {
            setSyncBadge('synced');
            showToast('⚠ Could not reach Firestore — check connection');
        });
}

function setSyncBadge(state) {
    var b = document.getElementById('apSyncBadge');
    if (state === 'saving') { b.textContent = '⟳ Saving…'; b.className = 'ap-sync saving'; }
    else { b.textContent = '✓ Synced'; b.className = 'ap-sync synced'; }
}

// ─────────────────────────────────────────────
// Render game grid
// ─────────────────────────────────────────────
function renderApGrid(games) {
    var grid = document.getElementById('apGameGrid');
    grid.innerHTML = '';
    games.forEach(function (g) {
        var hasRoles = g.roles && g.roles.length > 0;
        var hasChars = g.characters && g.characters.length > 0;
        var hasRanks = g.ranks && g.ranks.length > 0;

        var rolesHtml = hasRoles
            ? g.roles.slice(0, 3).map(function (r) { return '<span class="ap-chip role">' + r + '</span>'; }).join('') + (g.roles.length > 3 ? '<span class="ap-chip none">+' + (g.roles.length - 3) + '</span>' : '')
            : '';

        var ranksHtml = hasRanks
            ? '<span class="ap-chip rank">' + g.ranks[0] + '</span><span class="ap-chip rank">…</span><span class="ap-chip rank">' + g.ranks[g.ranks.length - 1] + '</span>'
            : '<span class="ap-chip none">No ranks</span>';

        var charsHtml = hasChars
            ? g.characters.slice(0, 2).map(function (c) { return '<span class="ap-chip char">' + c.name + '</span>'; }).join('') + (g.characters.length > 2 ? '<span class="ap-chip none">+' + (g.characters.length - 2) + '</span>' : '')
            : '';

        var card = document.createElement('div');
        card.className = 'ap-game-card';
        card.dataset.id = g.id;
        card.innerHTML =
            '<div class="ap-card-top">' +
            '<div class="ap-card-dot" style="background:' + g.color + '"></div>' +
            '<div><div class="ap-card-name">' + g.name + '</div>' +
            '<div class="ap-card-id">' + g.id + '</div></div>' +
            '</div>' +
            (rolesHtml ? '<div class="ap-chip-row">' + rolesHtml + '</div>' : '') +
            '<div class="ap-chip-row">' + ranksHtml + '</div>' +
            (charsHtml ? '<div class="ap-chip-row">' + charsHtml + '</div>' : '') +
            '<div class="ap-card-edit">✏ Edit</div>';

        card.onclick = function () { openEdit(g.id); };
        grid.appendChild(card);
    });
}

function filterApGames() {
    var q = document.getElementById('apSearch').value.toLowerCase();
    var filtered = Object.values(gamesData).filter(function (g) {
        return g.name.toLowerCase().indexOf(q) !== -1 || g.id.indexOf(q) !== -1;
    });
    renderApGrid(filtered);
}

// ─────────────────────────────────────────────
// Edit modal
// ─────────────────────────────────────────────
function openEdit(id) {
    var g = gamesData[id];
    if (!g) return;
    editingId = id;
    editBuffer = JSON.parse(JSON.stringify(g));

    document.getElementById('emGameName').textContent = g.name;
    document.getElementById('emGameId').textContent = g.id;
    document.getElementById('tgRoles').checked = editBuffer.roles.length > 0;
    document.getElementById('tgChars').checked = editBuffer.characters.length > 0;
    document.getElementById('tgRanks').checked = editBuffer.ranks.length > 0;

    syncSections();
    renderRolesTags();
    renderCharsTags();
    renderRanksTags();

    document.getElementById('editModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeEdit() {
    document.getElementById('editModal').style.display = 'none';
    document.body.style.overflow = '';
    editingId = null;
}

function emOutsideClick(e) {
    if (e.target.id === 'editModal') closeEdit();
}

function syncSections() {
    var hasR = document.getElementById('tgRoles').checked;
    var hasC = document.getElementById('tgChars').checked;
    var hasRk = document.getElementById('tgRanks').checked;
    document.getElementById('emRolesSection').style.display = hasR ? '' : 'none';
    document.getElementById('emCharsSection').style.display = hasC ? '' : 'none';
    document.getElementById('emRanksSection').style.display = hasRk ? '' : 'none';
    if (!hasR) editBuffer.roles = [];
    if (!hasC) editBuffer.characters = [];
    if (!hasRk) editBuffer.ranks = [];

    // safe call if function exists
    if (typeof updateCharRoleDropdown === 'function') {
        updateCharRoleDropdown();
    }
}

// Attach toggle listeners after DOM ready
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('tgRoles').addEventListener('change', syncSections);
    document.getElementById('tgChars').addEventListener('change', syncSections);
    document.getElementById('tgRanks').addEventListener('change', syncSections);
});

// ── Tags ──
function makeTag(label, onDelete) {
    var tag = document.createElement('div');
    tag.className = 'em-tag';
    var sp = document.createElement('span');
    sp.textContent = label;
    var btn = document.createElement('button');
    btn.className = 'em-tag-del';
    btn.title = 'Remove';
    btn.textContent = '×';
    btn.onclick = onDelete;
    tag.appendChild(sp);
    tag.appendChild(btn);
    return tag;
}

function renderRolesTags() {
    var el = document.getElementById('emRolesTags');
    el.innerHTML = '';
    if (editBuffer.roles.length === 0) {
        el.innerHTML = '<span class="em-nodata">No roles — add one below</span>';
        return;
    }
    editBuffer.roles.forEach(function (r, i) {
        el.appendChild(makeTag(r, function () {
            editBuffer.roles.splice(i, 1);
            // If any character had this role, remove the role from it
            editBuffer.characters.forEach(function (c) {
                var rIdx = c.roles.indexOf(r);
                if (rIdx !== -1) c.roles.splice(rIdx, 1);
            });
            renderRolesTags();
            updateCharRoleDropdown();
            renderCharsTags();
        }));
    });
    updateCharRoleDropdown();
}

function updateCharRoleDropdown() {
    var sel = document.getElementById('emNewCharRole');
    var hasR = document.getElementById('tgRoles').checked;

    sel.innerHTML = '';
    if (!hasR || editBuffer.roles.length === 0) {
        sel.style.display = 'none';
        sel.innerHTML = '<option value="">No Role</option>';
    } else {
        sel.style.display = 'block';
        editBuffer.roles.forEach(function (r) {
            var opt = document.createElement('option');
            opt.value = r;
            opt.textContent = r;
            sel.appendChild(opt);
        });
    }
}

function renderCharsTags() {
    var el = document.getElementById('emCharsTags');
    el.innerHTML = '';
    if (editBuffer.characters.length === 0) {
        el.innerHTML = '<span class="em-nodata">No characters — add one below</span>';
        return;
    }
    editBuffer.characters.forEach(function (c, i) {
        var label = c.name + (c.roles && c.roles.length > 0 ? ' (' + c.roles.join(', ') + ')' : '');
        el.appendChild(makeTag(label, function () {
            editBuffer.characters.splice(i, 1);
            renderCharsTags();
        }));
    });
}

function renderRanksTags() {
    var el = document.getElementById('emRanksTags');
    el.innerHTML = '';
    if (editBuffer.ranks.length === 0) {
        el.innerHTML = '<span class="em-nodata">No ranks — add one below</span>';
        return;
    }
    editBuffer.ranks.forEach(function (r, i) {
        el.appendChild(makeTag(r, function () {
            editBuffer.ranks.splice(i, 1);
            renderRanksTags();
        }));
    });
}

// ── Add helpers ──
function emAddRole() {
    var inp = document.getElementById('emNewRole');
    var val = inp.value.trim();
    if (!val) return;
    if (editBuffer.roles.indexOf(val) !== -1) { showToast('Role already exists'); return; }
    editBuffer.roles.push(val);
    inp.value = '';
    renderRolesTags();
}

function emAddChar() {
    var nameInp = document.getElementById('emNewCharName');
    var roleInp = document.getElementById('emNewCharRole');
    var name = nameInp.value.trim();
    if (!name) return;

    var selectedRole = roleInp.value;
    var hasR = document.getElementById('tgRoles').checked;

    var exists = editBuffer.characters.some(function (c) { return c.name === name; });
    if (exists) { showToast('Character already exists'); return; }

    editBuffer.characters.push({
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name: name,
        imageUrl: '',
        roles: (hasR && selectedRole) ? [selectedRole] : []
    });
    nameInp.value = '';
    renderCharsTags();
}

function emAddRank() {
    var inp = document.getElementById('emNewRank');
    var val = inp.value.trim();
    if (!val) return;
    if (editBuffer.ranks.indexOf(val) !== -1) { showToast('Rank already exists'); return; }
    editBuffer.ranks.push(val);
    inp.value = '';
    renderRanksTags();
}

// ── Save ──
function saveEdit() {
    if (!editingId) return;
    gamesData[editingId] = Object.assign({}, gamesData[editingId], editBuffer);
    closeEdit();
    renderApGrid(Object.values(gamesData));
    saveToFirestore();
    showToast('✓ Changes saved successfully');
}

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────
var toastTimer;
function showToast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.style.display = 'none'; }, 3000);
}


// ─────────────────────────────────────────────
// Footer & Admin Actions
// ─────────────────────────────────────────────
function copyEmail() {
    navigator.clipboard.writeText('rankuptogether@gmail.com').then(function () {
        showToast('📧 Email copied to clipboard!');
    }).catch(function () {
        showToast('Could not copy email.');
    });
}

function openTOS() {
    document.getElementById('tosModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeTOS() {
    document.getElementById('tosModal').style.display = 'none';
    document.body.style.overflow = '';
}

function openPrivacy() {
    document.getElementById('privacyModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closePrivacy() {
    document.getElementById('privacyModal').style.display = 'none';
    document.body.style.overflow = '';
}

function toggleAdmin() {
    var panel = document.getElementById('adminLoginPanel');
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'flex';
        panel.style.flexDirection = 'column';
        panel.style.gap = '8px';
    } else {
        panel.style.display = 'none';
    }
}

function adminLogin() {
    var u = document.getElementById('aUser').value.trim();
    var p = document.getElementById('aPass').value.trim();
    var err = document.getElementById('aErr');
    if (u === ADMIN_USER && p === ADMIN_PASS) {
        err.style.display = 'none';
        document.getElementById('adminZone').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        loadGames();
    } else {
        err.style.display = 'block';
    }
}

function adminLogout() {
    document.getElementById('adminPanel').style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('adminZone').style.display = '';
    document.getElementById('adminLoginPanel').style.display = 'none';
    document.getElementById('aUser').value = '';
    document.getElementById('aPass').value = '';
}

function toggleMenu() {
    var m = document.getElementById('mobileMenu');
    m.classList.toggle('open');
}

// ─────────────────────────────────────────────
// Public Leaderboard
// ─────────────────────────────────────────────
function loadPublicLeaderboard() {
    var grid = document.getElementById('publicLeaderboardGrid');
    if (!grid || !db) return;

    // We'll limit to top 3 users.
    db.collection('users').orderBy('diamonds', 'desc').limit(3).get().then(function (snap) {
        if (snap.empty) {
            grid.innerHTML = '<div style="color:var(--muted); text-align:center; width:100%;">No players yet. Be the first!</div>';
            return;
        }

        grid.innerHTML = '';
        var rank = 1;
        snap.forEach(function (doc) {
            var u = doc.data();
            var div = document.createElement('div');
            div.className = 'feature-card';
            div.style.display = 'flex';
            div.style.flexDirection = 'column';
            div.style.alignItems = 'center';
            div.style.padding = '24px';
            div.style.gap = '12px';

            var badgeHtml = '';
            if (rank === 1) badgeHtml = '<div style="position:absolute; top:-10px; right:-10px; background:#FFD700; color:#000; width:28px; height:28px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:14px; box-shadow:0 0 10px rgba(255,215,0,0.5);">🥇</div>';
            else if (rank === 2) badgeHtml = '<div style="position:absolute; top:-10px; right:-10px; background:#C0C0C0; color:#000; width:28px; height:28px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:14px;">🥈</div>';
            else if (rank === 3) badgeHtml = '<div style="position:absolute; top:-10px; right:-10px; background:#CD7F32; color:#000; width:28px; height:28px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:14px;">🥉</div>';
            else badgeHtml = '<div style="position:absolute; top:-10px; right:-10px; background:rgba(255,255,255,0.1); color:#fff; width:28px; height:28px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:12px;">#' + rank + '</div>';

            div.innerHTML =
                '<div style="position:relative;">' +
                (u.profileImage ? '<img src="' + u.profileImage + '" style="width:80px;height:80px;border-radius:40px;object-fit:cover; border:2px solid var(--cyan);"/>' : '<div style="width:80px;height:80px;border-radius:40px;background:#333; border:2px solid var(--muted); display:flex; align-items:center; justify-content:center;"><span style="color:white; font-size:24px;">?</span></div>') +
                badgeHtml +
                '</div>' +
                '<h3 style="color:white; margin:0; font-size:18px;">' + (u.displayName || 'Unknown') + '</h3>' +
                '<p style="color:var(--muted); margin:0; font-size:14px;">' + (u.diamonds || 0) + ' Gems Earned</p>';

            grid.appendChild(div);
            rank++;
        });
    }).catch(function (err) {
        grid.innerHTML = '<div style="color:#FF4655; text-align:center; width:100%;">Failed to load leaderboard.</div>';
    });
}

// ─────────────────────────────────────────────
// Beta Tester Logic
// ─────────────────────────────────────────────
function openTesterModal() {
    document.getElementById('testerModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeTesterModal() {
    document.getElementById('testerModal').style.display = 'none';
    document.body.style.overflow = '';
}

function submitTesterApplication() {
    var email = document.getElementById('testEmail').value.trim();
    var os = document.getElementById('testOS').value;
    var games = document.getElementById('testGames').value.trim();

    if (!email) {
        showToast('Please enter your email address.');
        return;
    }

    var btn = document.getElementById('testSubmitBtn');
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    db.collection('testerApplications').add({
        email: email,
        os: os,
        games: games,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
        showToast('Application sent! Thank you.');
        document.getElementById('testEmail').value = '';
        document.getElementById('testGames').value = '';
        closeTesterModal();
        btn.textContent = 'Submit Application';
        btn.disabled = false;
    }).catch(function (error) {
        showToast('Error applying: ' + error.message);
        btn.textContent = 'Submit Application';
        btn.disabled = false;
    });
}

var _testerCurrentTab = 'pending';

function switchTesterTab(tab) {
    _testerCurrentTab = tab;
    var tabs = ['pending', 'approved', 'rejected'];
    tabs.forEach(function (t) {
        var panel = document.getElementById('apTesters' + t.charAt(0).toUpperCase() + t.slice(1));
        var btn = document.getElementById('testerTab' + t.charAt(0).toUpperCase() + t.slice(1));
        if (panel) panel.style.display = (t === tab) ? 'flex' : 'none';
        if (btn) {
            if (t === tab) {
                btn.style.border = '1.5px solid var(--cyan)';
                btn.style.background = 'rgba(0,240,255,0.12)';
                btn.style.color = 'var(--cyan)';
            } else {
                btn.style.border = '1.5px solid rgba(255,255,255,0.1)';
                btn.style.background = 'rgba(255,255,255,0.04)';
                btn.style.color = 'rgba(255,255,255,0.6)';
            }
        }
    });
}

function loadTesters() {
    var pendingEl = document.getElementById('apTestersPending');
    var approvedEl = document.getElementById('apTestersApproved');
    var rejectedEl = document.getElementById('apTestersRejected');
    pendingEl.innerHTML = '<div style="color:var(--muted)">Loading...</div>';
    approvedEl.innerHTML = '';
    rejectedEl.innerHTML = '';

    db.collection('testerApplications').orderBy('createdAt', 'desc').get().then(function (snap) {
        pendingEl.innerHTML = '';
        approvedEl.innerHTML = '';
        rejectedEl.innerHTML = '';
        var counts = { pending: 0, approved: 0, rejected: 0 };

        if (snap.empty) {
            pendingEl.innerHTML = '<div style="color:rgba(255,255,255,0.3);padding:20px;text-align:center;">No tester applications yet.</div>';
            updateTesterCounts(counts);
            return;
        }

        snap.forEach(function (doc) {
            var data = doc.data();
            var status = data.status || 'pending';
            counts[status] = (counts[status] || 0) + 1;

            var statusColor = status === 'approved' ? '#00FF9C' : status === 'rejected' ? '#FF4655' : 'var(--cyan)';
            var statusLabel = status === 'approved' ? '✅ Approved' : status === 'rejected' ? '❌ Rejected' : '⏳ Pending';
            var dateStr = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : 'Just now';

            var div = document.createElement('div');
            div.style.cssText = 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;';
            div.innerHTML =
                '<div style="flex:1; min-width:0;">' +
                '<div style="font-weight:bold; color:' + statusColor + '; margin-bottom:4px; font-size:15px;">' + data.email + '</div>' +
                '<div style="font-size:12px; color:gray;">OS: ' + (data.os || 'Unknown') + ' · Games: ' + (data.games || 'Not specified') + '</div>' +
                '<div style="font-size:11px; color:rgba(255,255,255,0.3); margin-top:4px;">' + dateStr + ' · ' + statusLabel + '</div>' +
                '</div>' +
                '<div style="display:flex; gap:8px; flex-shrink:0;">' +
                (status !== 'approved' ? '<button onclick="setTesterStatus(\'' + doc.id + '\', \'approved\')" style="padding:7px 14px; border-radius:8px; background:rgba(0,255,156,0.15); border:1px solid #00FF9C; color:#00FF9C; font-size:12px; font-weight:700; cursor:pointer;">✅ Approve</button>' : '') +
                (status !== 'rejected' ? '<button onclick="setTesterStatus(\'' + doc.id + '\', \'rejected\')" style="padding:7px 14px; border-radius:8px; background:rgba(255,70,85,0.15); border:1px solid #FF4655; color:#FF4655; font-size:12px; font-weight:700; cursor:pointer;">❌ Reject</button>' : '') +
                '</div>';

            if (status === 'approved') approvedEl.appendChild(div);
            else if (status === 'rejected') rejectedEl.appendChild(div);
            else pendingEl.appendChild(div);
        });

        if (pendingEl.children.length === 0) pendingEl.innerHTML = '<div style="color:rgba(255,255,255,0.3);padding:20px;text-align:center;">No pending applications.</div>';
        if (approvedEl.children.length === 0) approvedEl.innerHTML = '<div style="color:rgba(255,255,255,0.3);padding:20px;text-align:center;">No approved applications yet.</div>';
        if (rejectedEl.children.length === 0) rejectedEl.innerHTML = '<div style="color:rgba(255,255,255,0.3);padding:20px;text-align:center;">No rejected applications yet.</div>';

        updateTesterCounts(counts);
        switchTesterTab(_testerCurrentTab);
    }).catch(function (e) {
        pendingEl.innerHTML = '<div style="color:#FF4655">Error: ' + e.message + '</div>';
    });
}

function updateTesterCounts(counts) {
    ['pending', 'approved', 'rejected'].forEach(function (t) {
        var el = document.getElementById('testerCount' + t.charAt(0).toUpperCase() + t.slice(1));
        if (el) el.textContent = counts[t] ? '(' + counts[t] + ')' : '';
    });
}

function setTesterStatus(docId, status) {
    db.collection('testerApplications').doc(docId).update({ status: status }).then(function () {
        showToast(status === 'approved' ? '✅ Tester approved!' : '❌ Tester rejected.');
        loadTesters();
    }).catch(function (e) {
        showToast('Error: ' + e.message);
    });
}

// Call on startup
document.addEventListener('DOMContentLoaded', function () {
    loadPublicLeaderboard();
});
