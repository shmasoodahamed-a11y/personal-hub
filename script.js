// ==========================================
// 1. FIREBASE CONFIG & GLOBAL VARS
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCC2cE0dHyyGFLqqzVe27z8sNCYto5cHFk",
  authDomain: "personal-hub-name.firebaseapp.com",
  projectId: "personal-hub-name",
  storageBucket: "personal-hub-name.firebasestorage.app",
  messagingSenderId: "706597416203",
  appId: "1:706597416203:web:3d79bccfae03987666860e",
  measurementId: "G-B6N7YPEDR9"
};
let auth, db, currentUser = null;
let isOffline = true; 
let currentDate = new Date(); 
let autoSaveTimeout = null;
let sunsetInterval = null;
let networkListenersInitialized = false;
let taskReminderInterval = null;
let deferredInstallPrompt = null;
let pendingBackgroundImage = undefined;
let timedConfirmationInterval = null;
let timedConfirmationAction = null;
let completingSession = false;

// Try to initialize Firebase
try {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        isOffline = false;
        console.log("Cloud Mode: Active");
    } else {
        console.log("Offline Mode: Keys missing or placeholder used.");
    }
} catch(e) {
    console.warn("Offline Mode Force: ", e);
    isOffline = true;
}

// ==========================================
// 2. DATA CONSTANTS
// ==========================================
/* Deprecated built-in UPSC curriculum. User data is now stored in appData.curriculum.
const DEFAULT_UPSC_SYLLABUS_UNUSED = [
    { subject: "History: Modern (Spectrum)", chapters: [{ title: "Advent of Europeans", topics: ["Portuguese in India", "Dutch & English", "French in India", "Carnatic Wars", "Decline of Mughals"] }, { title: "British Expansion", topics: ["Battle of Plassey & Buxar", "Mysore Wars (Tipu Sultan)", "Maratha Wars", "Conquest of Sindh & Punjab", "Policy of Ring Fence & Subsidiary Alliance", "Doctrine of Lapse"] }, { title: "Revolt of 1857", topics: ["Causes (Economic/Admin/Sepoy)", "Centres & Leaders", "Suppression & Failure", "Changes after 1858 Act"] }, { title: "Socio-Religious Reforms", topics: ["Raja Rammohan Roy (Brahmo Samaj)", "Ishwar Chandra Vidyasagar", "Dayanand Saraswati (Arya Samaj)", "Vivekananda", "Aligarh Movement", "Theosophical Society"] }, { title: "Freedom Struggle Begins", topics: ["Pre-Congress Associations", "Formation of INC (1885)", "Moderate Phase (1885-1905)", "Economic Critique of British Rule"] }, { title: "National Movement (1905-18)", topics: ["Partition of Bengal & Swadeshi", "Surat Split", "Revolutionary Activities (Phase 1)", "Ghadar Party", "Home Rule League", "Lucknow Pact"] }, { title: "Mass Nationalism (1919-39)", topics: ["Arrival of Gandhi (Satyagraha)", "Rowlatt Act & Jallianwala", "Non-Cooperation & Khilafat", "Swarajists & No-Changers", "Simon Commission", "Civil Disobedience (Salt March)", "Round Table Conferences", "Karachi Session"] }, { title: "Towards Freedom (1939-47)", topics: ["August Offer", "Individual Satyagraha", "Cripps Mission", "Quit India Movement", "INA & Subhash Bose", "Cabinet Mission", "Mountbatten Plan", "Partition"] }, { title: "Post-Independence", topics: ["Integration of States", "Linguistic Reorganization", "Tribal Policy", "Foreign Policy (Non-Alignment)"] }] },
    { subject: "History: Ancient & Medieval", chapters: [{ title: "Ancient India", topics: ["Indus Valley Civilization", "Vedic Age (Early/Later)", "Mahajanapadas & Magadha", "Mauryan Empire", "Post-Mauryan (Gupta Age)", "Harshavardhana", "Sangam Age"] }, { title: "Medieval India", topics: ["Delhi Sultanate (Slave to Lodi)", "Vijayanagar & Bahmani", "Mughal Empire (Admin/Arch)", "Marathas", "Bhakti & Sufi Movements"] }, { title: "Art & Culture", topics: ["Temple Architecture", "Cave Architecture", "Sculpture forms", "Classical Dances", "Paintings (Mural/Miniature)", "UNESCO Sites"] }] },
    { subject: "Geography: Physical (11th NCERT)", chapters: [{ title: "The Earth", topics: ["Origin of Earth", "Interior of the Earth", "Distribution of Oceans & Continents"] }, { title: "Landforms", topics: ["Minerals & Rocks", "Geomorphic Processes (Weathering/Erosion)", "Landforms & Evolution (Fluvial/Glacial/Wind)"] }, { title: "Climate", topics: ["Composition of Atmosphere", "Insolation & Heat Balance", "Pressure & Winds", "Water in Atmosphere", "World Climate (Koppen)"] }, { title: "Water (Oceanography)", topics: ["Ocean Relief", "Temperature & Salinity", "Movements of Ocean Water (Waves/Tides/Currents)"] }, { title: "Life on Earth", topics: ["Biodiversity & Conservation", "Biogeochemical Cycles"] }] },
    { subject: "Geography: India Phy (11th NCERT)", chapters: [{ title: "Physiography", topics: ["Location & Space", "Structure & Relief (Himalayas/Plains/Plateau)", "Drainage Systems (Himalayan vs Peninsular)"] }, { title: "Climate & Soil", topics: ["Monsoon Mechanism", "Seasons", "Natural Vegetation (Forests)", "Soils of India (Types & Conservation)"] }, { title: "Hazards", topics: ["Natural Hazards", "Disaster Management in India"] }] },
    { subject: "Geography: Human (12th NCERT)", chapters: [{ title: "People", topics: ["Population Distribution & Density", "Population Growth", "Population Composition", "Human Development"] }, { title: "Activities", topics: ["Primary Activities (Agri/Mining)", "Secondary Activities (Manufacturing)", "Tertiary & Quaternary Activities"] }, { title: "Transport & Trade", topics: ["Transport & Communication", "International Trade"] }, { title: "Settlements", topics: ["Human Settlements (Rural vs Urban)", "Urbanization Problems"] }] },
    { subject: "Geography: India People (12th NCERT)", chapters: [{ title: "People & Economy", topics: ["Migration (Types/Causes)", "Human Development in India", "Census Data"] }, { title: "Resources", topics: ["Land Resources & Agriculture", "Water Resources", "Mineral & Energy Resources", "Manufacturing Industries"] }, { title: "Planning", topics: ["Planning in India", "Sustainable Development"] }, { title: "Transport", topics: ["Transport Networks (Road/Rail/Water/Air)", "Communication Networks"] }] },
    { subject: "Geography: Mapping", chapters: [{ title: "India Mapping", topics: ["Mountains & Peaks", "Rivers & Tributaries", "National Parks & Tiger Reserves", "Ramsar Sites", "Ports & Industrial Corridors", "Islands"] }, { title: "World Mapping", topics: ["Major Straits & Canals", "Seas & Lakes", "Grasslands & Deserts", "Mineral Belts", "Conflict Zones (Current Affairs)"] }] },
    { subject: "Polity: Laxmikanth", chapters: [{ title: "Const. Framework", topics: ["Historical Background", "Making of Constitution", "Salient Features", "Preamble", "Union & its Territory", "Citizenship", "Fundamental Rights", "DPSP", "Fundamental Duties", "Amendment of Constitution", "Basic Structure"] }, { title: "System of Govt", topics: ["Parliamentary System", "Federal System", "Centre-State Relations", "Inter-State Relations", "Emergency Provisions"] }, { title: "Central Govt", topics: ["President", "Vice-President", "Prime Minister", "Central Council of Ministers", "Cabinet Committees", "Parliament", "Parliamentary Committees", "Supreme Court"] }, { title: "State Govt", topics: ["Governor", "Chief Minister", "State Council of Ministers", "State Legislature", "High Court", "Subordinate Courts"] }, { title: "Local Govt", topics: ["Panchayati Raj", "Municipalities"] }, { title: "Const. Bodies", topics: ["Election Commission", "UPSC", "SPSC", "Finance Commission", "GST Council", "NCSC", "NCST", "NCBC", "CAG", "Attorney General", "Advocate General"] }, { title: "Non-Const. Bodies", topics: ["NITI Aayog", "NHRC", "SHRC", "CIC", "SIC", "CVC", "CBI", "Lokpal & Lokayuktas"] }] },
    { subject: "Economy: Microeconomics (Class 12)", chapters: [{ title: "Introduction", topics: ["Central Problems of Economy", "PPC (Production Possibility Curve)", "Opportunity Cost"] }, { title: "Consumer Behaviour", topics: ["Utility Analysis", "Indifference Curve", "Demand & Elasticity of Demand"] }, { title: "Producer Behaviour", topics: ["Production Function", "Cost & Revenue Curves", "Supply & Elasticity"] }, { title: "Market Forms", topics: ["Perfect Competition", "Monopoly & Oligopoly", "Price Determination"] }] },
    { subject: "Economy: Macroeconomics (Class 12)", chapters: [{ title: "National Income", topics: ["Circular Flow", "GDP, GNP, NNP", "Real vs Nominal GDP", "GDP Deflator"] }, { title: "Money & Banking", topics: ["Money Supply", "Credit Creation", "RBI Functions", "Monetary Policy Tools (Repo/CRR/SLR)"] }, { title: "Income & Employment", topics: ["Aggregate Demand/Supply", "Propensity to Consume/Save", "Multiplier", "Deficient vs Excess Demand"] }, { title: "Govt Budget", topics: ["Revenue vs Capital", "Deficits (Fiscal/Revenue/Primary)", "Budget Objectives"] }, { title: "BoP & Forex", topics: ["Balance of Payments Components", "Foreign Exchange Rate Determination"] }] },
    { subject: "Economy: Indian Eco Dev (Class 11)", chapters: [{ title: "1947-1990", topics: ["Eve of Independence", "Five Year Plans", "Agriculture & Land Reforms", "IPR 1956"] }, { title: "1991 Reforms", topics: ["Liberalisation, Privatisation, Globalisation (LPG)", "GST & Demonetization"] }, { title: "Current Challenges", topics: ["Poverty", "Human Capital Formation", "Rural Development", "Employment Growth", "Infrastructure", "Sustainable Development"] }, { title: "Comparisons", topics: ["India vs China vs Pakistan Development Experience"] }] },
    { subject: "Economy: Statistics (Class 11)", chapters: [{ title: "Data Basics", topics: ["Collection of Data", "Organization of Data", "Presentation (Tables/Diagrams)"] }, { title: "Statistical Tools", topics: ["Measures of Central Tendency (Mean/Median/Mode)", "Correlation", "Index Numbers (WPI/CPI Basics)"] }] },
    { subject: "Current Affairs & Reports", chapters: [{ title: "Monthly Tracking", topics: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] }, { title: "Major Reports", topics: ["HDR", "Global Hunger Index", "Press Freedom Index", "Gender Gap Report", "ISFR (Forest Report)", "Budget Summary", "Economic Survey"] }, { title: "Schemes", topics: ["Flagship Schemes (Central)", "State Specific Schemes", "New Launches"] }] },
    { subject: "GS IV: Ethics", chapters: [{ title: "Theory", topics: ["Human Interface", "Attitude", "Emotional Intelligence", "Moral Thinkers"] }, { title: "Governance", topics: ["Public Service Values", "Probity", "RTI", "Citizen Charters", "Corruption"] }, { title: "Applied", topics: ["Case Studies"] }] },
    { subject: "Prelims: CSAT", chapters: [{ title: "Quant", topics: ["Number System", "Percentage", "Profit/Loss", "Average", "Ratio", "Time & Work", "Speed Dist"] }, { title: "Reasoning", topics: ["Coding", "Series", "Blood Relations", "Direction", "Syllogism", "Puzzles"] }, { title: "Reading", topics: ["Reading Comprehension", "Interpersonal Skills"] }] }
];
*/

const CONSTITUTION_DATA = [
    {a:"1", t:"Name and territory of the Union"}, {a:"3", t:"Formation of new States and alteration of areas"}, {a:"13", t:"Laws inconsistent with Fundamental Rights"}, {a:"14", t:"Equality before law"}, {a:"15", t:"Prohibition of discrimination"}, {a:"16", t:"Equality of opportunity in public employment"}, {a:"17", t:"Abolition of Untouchability"}, {a:"19", t:"Freedom of speech"}, {a:"21", t:"Protection of life and personal liberty"}, {a:"21A", t:"Right to Education"}, {a:"32", t:"Remedies for enforcement of rights"}, {a:"40", t:"Organisation of village panchayats"}, {a:"44", t:"Uniform civil code"}, {a:"51A", t:"Fundamental Duties"}, {a:"52", t:"The President of India"}, {a:"72", t:"Pardoning powers of President"}, {a:"110", t:"Money Bills"}, {a:"112", t:"Annual Financial Statement (Budget)"}, {a:"280", t:"Finance Commission"}, {a:"352", t:"National Emergency"}, {a:"356", t:"President's Rule"}, {a:"360", t:"Financial Emergency"}
];
let UPSC_SYLLABUS = [];

// ==========================================
// 3. STATE & INIT
// ==========================================
let appData = {
    goals: { daily: [], weekly: [], monthly: [], halfyearly: [] },
    syllabus: {}, library: [], focusLog: {}, subjectLog: {}, plans: {}, tests: [],
    news: { date: "", hindu: false, edit: false, mag: false },
    manifesto: "", degreeMode: false, deadTime: 0, waterCount: 0, pensUsed: 0,
    btech: { subjects: [], assignments: [] }, darkMode: false,
    timer: { mode: 'timer', endTime: null, startTime: null, active: false, totalDuration: 25, subject: null, chapter: null, remaining: 0, accumulated: 0 },
    flashcards: [], mainsDrafts: [], retros: [], history: [], xp: 0,
    mapPins: [],
    treasury: { budget: 0, expenses: [] },
    sleep: [],
    bio: { weight: 0, workouts: { run: false, gym: false, yoga: false } },
    mood: [],
    gratitude: [],
    watchlist: [],
    bucket: [],
    chef: {},
    dopamine: [],
    inventory: [],
    events: [],
    // --- ADD THESE NEW LINES ---
    retroWell: "",     // For Retro: What went well
    retroBad: "",      // For Retro: What went bad
    retroStrat: "",    // For Retro: Strategy
    tempMainsBody: "", // For Mains: Draft answer
    // ---------------------------
    thoughts: ""
};
appData.preferences = appData.preferences || { currency:'INR', weekStartsMonday:false, onboardingComplete:false };
function formatCurrency(amount) {
    const currency = appData.preferences?.currency || 'INR';
    try { return new Intl.NumberFormat(undefined, { style:'currency', currency, maximumFractionDigits:2 }).format(amount); }
    catch { return `₹${Number(amount || 0).toFixed(2)}`; }
}
function openPreferences() {
    document.getElementById('prefCurrency').value = appData.preferences?.currency || 'INR';
    document.getElementById('prefWeekMonday').checked = !!appData.preferences?.weekStartsMonday;
    pendingBackgroundImage = appData.preferences?.backgroundImage || null;
    updateBackgroundPreview(pendingBackgroundImage);
    document.getElementById('preferencesModal').style.display='flex';
}
function savePreferences() {
    appData.preferences = { ...(appData.preferences || {}), currency:document.getElementById('prefCurrency').value, weekStartsMonday:document.getElementById('prefWeekMonday').checked, backgroundImage:pendingBackgroundImage || null, onboardingComplete:true };
    applyBackgroundImage();
    saveData(); closeModal('preferencesModal'); renderCalendar(); renderLedger(); renderTreasury();
}
function applyBackgroundImage(image = appData.preferences?.backgroundImage) {
    document.body.style.setProperty('--workspace-background', image ? `url("${image}")` : 'none');
    document.body.classList.toggle('has-custom-background', !!image);
}
function updateBackgroundPreview(image) {
    const preview = document.getElementById('backgroundPreview');
    if (!preview) return;
    preview.replaceChildren();
    if (image) { preview.style.backgroundImage = `url("${image}")`; }
    else { preview.style.backgroundImage = ''; const label=document.createElement('span'); label.textContent='No image selected'; preview.appendChild(label); }
}
function previewBackgroundImage(input) {
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Choose an image file.'); input.value=''; return; }
    if (file.size > 10 * 1024 * 1024) { alert('Choose an image smaller than 10 MB.'); input.value=''; return; }
    const reader = new FileReader();
    reader.onload = event => {
        const image = new Image();
        image.onload = () => {
            const maxSide=1100, scale=Math.min(1, maxSide/Math.max(image.width,image.height));
            const canvas=document.createElement('canvas'); canvas.width=Math.max(1,Math.round(image.width*scale)); canvas.height=Math.max(1,Math.round(image.height*scale));
            canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
            const compact=canvas.toDataURL('image/jpeg',0.72);
            if (compact.length > 800000) { alert('This image is still too large after optimization. Please choose a smaller image.'); input.value=''; return; }
            pendingBackgroundImage=compact; updateBackgroundPreview(compact); applyBackgroundImage(compact);
        };
        image.src=event.target.result;
    };
    reader.readAsDataURL(file);
}
function removeBackgroundImage() { pendingBackgroundImage=null; document.getElementById('backgroundImageInput').value=''; updateBackgroundPreview(null); applyBackgroundImage(null); }
function completeWelcomeSetup() {
    appData.preferences = { ...(appData.preferences || {}), currency:document.getElementById('welcomeCurrency').value, weekStartsMonday:document.getElementById('welcomeWeekMonday').checked, onboardingComplete:true };
    saveData(); closeModal('welcomeModal'); renderCalendar(); renderLedger(); renderTreasury();
}

function refreshCurriculumSelectors() {
    UPSC_SYLLABUS = Array.isArray(appData.curriculum) ? appData.curriculum : [];
    ['chapterSubject', 'topicSubject', 'preTimerSubject', 'omrSubject', 'timerSubject', 'fcInputSub'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        const first = select.options[0]?.outerHTML || '<option value="">Select subject</option>';
        select.innerHTML = first;
        UPSC_SYLLABUS.forEach(subject => select.add(new Option(subject.subject, subject.subject)));
    });
    updateCurriculumChapterOptions();
}
function updateCurriculumChapterOptions() {
    const subjectSelect = document.getElementById('topicSubject');
    const chapterSelect = document.getElementById('topicChapter');
    if (!subjectSelect || !chapterSelect) return;
    chapterSelect.innerHTML = '<option value="">Select chapter</option>';
    const subject = UPSC_SYLLABUS.find(item => item.subject === subjectSelect.value);
    subject?.chapters.forEach(chapter => chapterSelect.add(new Option(chapter.title, chapter.title)));
}
function saveCurriculum() {
    appData.curriculum = UPSC_SYLLABUS;
    refreshCurriculumSelectors();
    renderSyllabus(); renderSyllabusChart(); updateDashboard(); saveData();
}
function addSubject() {
    const input = document.getElementById('newSubjectName'); const name = input.value.trim();
    if (!name || UPSC_SYLLABUS.some(item => item.subject.toLowerCase() === name.toLowerCase())) return;
    UPSC_SYLLABUS.push({ subject: name, chapters: [] }); input.value = ''; saveCurriculum();
}
function addChapter() {
    const subject = UPSC_SYLLABUS.find(item => item.subject === document.getElementById('chapterSubject').value);
    const input = document.getElementById('newChapterName'); const title = input.value.trim();
    if (!subject || !title || subject.chapters.some(item => item.title.toLowerCase() === title.toLowerCase())) return;
    subject.chapters.push({ title, topics: [] }); input.value = ''; saveCurriculum();
}
function addTopic() {
    const subject = UPSC_SYLLABUS.find(item => item.subject === document.getElementById('topicSubject').value);
    const chapter = subject?.chapters.find(item => item.title === document.getElementById('topicChapter').value);
    const input = document.getElementById('newTopicName'); const topic = input.value.trim();
    if (!chapter || !topic || chapter.topics.some(item => item.toLowerCase() === topic.toLowerCase())) return;
    chapter.topics.push(topic); input.value = ''; saveCurriculum();
}

function getTodayDate() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function setupFinanceApp() {
    const finance = document.getElementById('ledger');
    const treasury = document.getElementById('treasury');
    if (!finance || !treasury || finance.dataset.combined === 'true') return;
    finance.id = 'finance';
    finance.dataset.combined = 'true';
    const heading = finance.querySelector('h2');
    const tabs = document.createElement('div'); tabs.className = 'finance-tabs';
    [['overview','Overview'],['transactions','Transactions']].forEach(([tab,label]) => {
        const button = document.createElement('button'); button.textContent = label; button.onclick = () => switchFinanceTab(tab); button.dataset.financeTab = tab; tabs.appendChild(button);
    });
    heading.after(tabs);
    const ledgerPanel = document.createElement('div'); ledgerPanel.id = 'financeTransactions'; ledgerPanel.className = 'finance-panel';
    let node = tabs.nextSibling;
    while (node) { const next = node.nextSibling; ledgerPanel.appendChild(node); node = next; }
    finance.appendChild(ledgerPanel);
    treasury.id = 'financeOverview'; treasury.classList.remove('section'); treasury.classList.add('finance-panel');
    const treasuryTitle = treasury.querySelector('h2'); if (treasuryTitle) treasuryTitle.remove();
    finance.appendChild(treasury);
    switchFinanceTab('overview');
}
function switchFinanceTab(tab) {
    document.querySelectorAll('#finance .finance-panel').forEach(panel => panel.classList.toggle('active', panel.id === (tab === 'overview' ? 'financeOverview' : 'financeTransactions')));
    document.querySelectorAll('#finance [data-finance-tab]').forEach(button => button.classList.toggle('active', button.dataset.financeTab === tab));
    if (tab === 'overview') renderTreasury(); else renderLedger();
}

window.onload = function() {
    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault(); deferredInstallPrompt = event;
        const button=document.getElementById('installAppButton'); if(button) button.hidden=false;
    });
    document.getElementById('installAppButton')?.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt(); await deferredInstallPrompt.userChoice;
        deferredInstallPrompt=null; document.getElementById('installAppButton').hidden=true;
    });
    setupFinanceApp();
    const removedApps = new Set(['kanban','mapmaster','soundscapes','stoic_journal','niti_dm','braindeck','goals','memo','mood','identity','thoughtpad','bio','monk','bucket','constitution','whiteboard','dojo']);
    document.querySelectorAll('#appsModal [onclick]').forEach(item => {
        const match = item.getAttribute('onclick')?.match(/selectApp\('([^']+)'\)/);
        if (match && removedApps.has(match[1])) item.remove();
        else if (item.getAttribute('onclick')?.includes('openAIModal') || item.getAttribute('onclick')?.includes('openManifesto')) item.remove();
    });
    const compass = document.getElementById('yearCompass');
    if (compass) {
        compass.classList.remove('section');
        compass.style.marginTop = '20px';
        document.getElementById('dashboard')?.appendChild(compass);
    }
    document.querySelectorAll('#appsModal [onclick*="yearCompass"]').forEach(item => item.remove());
    // Populate Dropdown immediately
    const subjSelect = document.getElementById('preTimerSubject');
    if(subjSelect) {
        subjSelect.innerHTML = '<option value="" disabled selected>-- Select Subject --</option>';
        UPSC_SYLLABUS.forEach(s => {
            subjSelect.innerHTML += `<option value="${s.subject}">${s.subject}</option>`;
        });
    }

    if (!isOffline && auth) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                document.getElementById('btnLogin').style.display = 'none';
                document.getElementById('userProfile').style.display = 'block';
                document.getElementById('userName').innerText = user.displayName;
                db.collection('users').doc(user.uid).onSnapshot((doc) => {
                    if (doc.exists) {
                        appData = { ...appData, ...doc.data() };
                        if (Array.isArray(appData.notespaceDB) && typeof nsData !== 'undefined') {
                            nsData = appData.notespaceDB;
                            if (window.AppStore) AppStore.writeCollection('notespaceDB', nsData);
                        }
                        initializeUI();
                    } else {
                        saveData(); 
                    }
                });
            } else {
                document.getElementById('btnLogin').style.display = 'block';
                document.getElementById('userProfile').style.display = 'none';
                loadLocalData();
            }
        });
    } else {
        document.getElementById('btnLogin').style.display = 'block'; 
        document.getElementById('userProfile').style.display = 'none';
        loadLocalData();
    }
};

function loadLocalData() {
    const parsed = window.AppStore ? window.AppStore.read(null) : JSON.parse(localStorage.getItem('upsc_app_data_v19') || 'null');
    if (parsed) appData = { ...appData, ...parsed, preferences:{...(appData.preferences||{}),...(parsed.preferences||{})} };
    initializeUI();
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const uploadedData = JSON.parse(e.target.result);
            const restoredAppData = uploadedData.appData || uploadedData;
            appData = {
                ...appData, 
                ...restoredAppData,
                timer: { ...appData.timer, ...(restoredAppData.timer || {}) },
                history: restoredAppData.history || [],
                mapPins: restoredAppData.mapPins || []
            };
            if (Array.isArray(uploadedData.notespaceDB)) appData.notespaceDB = uploadedData.notespaceDB;
            if (Array.isArray(appData.notespaceDB) && window.AppStore) AppStore.writeCollection('notespaceDB', appData.notespaceDB);
            saveData();
            alert("Restored Successfully!");
            location.reload();
        } catch (err) {
            alert("Error restoring file: " + err.message);
        }
    };
    reader.readAsText(file);
}

function initializeUI() {
    applyBackgroundImage();
    refreshCurriculumSelectors();
    if (!appData.preferences?.onboardingComplete) {
        document.getElementById('welcomeCurrency').value = appData.preferences?.currency || 'INR';
        document.getElementById('welcomeWeekMonday').checked = !!appData.preferences?.weekStartsMonday;
        document.getElementById('welcomeModal').style.display='flex';
    }
    if (taskReminderInterval === null) taskReminderInterval = setInterval(checkTaskReminders, 30000);
    // 1. Theme Check
    if(appData.darkMode) document.body.classList.add('dark-mode');
    
    // 2. Restore XP if missing
    if (!appData.xp || appData.xp === 0) {
        let totalMins = 0;
        if(appData.focusLog) {
            totalMins = Object.values(appData.focusLog).reduce((sum, m) => sum + m, 0);
        }
        appData.xp = totalMins * 10;
    }

    // 3. Load all modules safely
    try { checkNewsReset(); } catch(e) {}
    try { renderEvents(); } catch(e) {}
  try { renderMood(); } catch(e) {}
try { renderNotToDo(); } catch(e) {}
    try { renderIdentity(); } catch(e) {}
    try { renderSyllabus(); } catch(e) {}
    try { renderGoals(); } catch(e) {}
    try { renderYearCompass(); } catch(e) {}
    try { renderLibrary(); } catch(e) {}
    try { updateDashboard(); } catch(e) {}
    try { renderCalendar(); } catch(e) {}
    try { renderCharts(); } catch(e) {}
    try { renderSyllabusChart(); } catch(e) {}
    try { renderHeatmap(); } catch(e) {}
    try { renderMockTests(); } catch(e) {}
    try { renderBtech(); } catch(e) {}
    try { renderFlashcard(); } catch(e) {}
    try { renderHistory(); } catch(e) {}
    try { renderTreasury(); } catch(e) {}
    try { renderBio(); } catch(e) {}
    try { renderMonk(); } catch(e) {}
    try { renderWatchlist(); } catch(e) {}
    try { renderBucket(); } catch(e) {}
    try { renderChef(); } catch(e) {}
    try { renderDopamine(); } catch(e) {}
    try { renderInventory(); } catch(e) {}
  try { renderDojo(); } catch(e) {}
try { renderTribe(); } catch(e) {}
  try { renderLedger(); } catch(e) {}
    try { setupAutosave(); } catch(e) {} // Starts the "Save as you type" listener
    try { document.getElementById('thoughtArea').value = appData.thoughts || ""; } catch(e) {}

    // 4. Restore Subject & Chapter Selection (THE FIX for dropdowns)
    // We use a small delay (50ms) to ensure the dropdown list is built before we select an item
    setTimeout(() => {
        if(appData.timer && appData.timer.subject) {
            const subjSelect = document.getElementById('preTimerSubject');
            const chapSelect = document.getElementById('preTimerChapter');
            
            if(subjSelect) {
                subjSelect.value = appData.timer.subject;
                
                // Manually trigger the "populate chapters" function
                populateTimerChapters(); 
                
                // Now set the chapter if we have one
                if(appData.timer.chapter && chapSelect) {
                    chapSelect.value = appData.timer.chapter;
                }
            }
        }
    }, 50);

    // 5. Handle Timer State (THE FIX for 25:00 display)
    if (appData.timer.active) {
        const now = Date.now();
        if (appData.timer.mode === 'timer') {
            if (appData.timer.endTime && now >= appData.timer.endTime) {
                // Timer finished while app was closed
                completeSession();
            } else {
                // Timer is still running -> Resume & Update Visuals Immediately
                runTimerInterval();
                tick(); // <--- This forces "25:00" to change to the real time instantly
            }
        } else {
            // Stopwatch -> Resume & Update Visuals
            runTimerInterval();
            tick(); // <--- This forces the stopwatch to show the correct time instantly
        }
    }

    // 6. Final UI Polish
    if(document.getElementById('degreeToggle')) {
        document.getElementById('degreeToggle').checked = appData.degreeMode;
    }
    toggleDegreeMode();
    renderHydration();
    
    if(document.getElementById('deadTimeDisplay')) document.getElementById('deadTimeDisplay').innerText = `${appData.deadTime}m`;
    if(document.getElementById('penDisplay')) document.getElementById('penDisplay').innerText = appData.pensUsed;
    
    updateRank();
    updateTimerVisuals(); // Sets the button to "Pause" or "Resume" correctly

    // 7. Network Listeners (Auto-upload when internet returns)
    if (!networkListenersInitialized) {
        window.addEventListener('online', () => { console.log("Back Online"); saveData(); });
        networkListenersInitialized = true;
    }
    if (sunsetInterval === null) sunsetInterval = setInterval(checkSunset, 60000);
    checkSunset();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Offline support unavailable:', error));
}
function saveData() {
    // 1. Instant Local Save (Backup)
    if (window.AppStore) window.AppStore.write(appData);
    else localStorage.setItem('upsc_app_data_v19', JSON.stringify(appData));

    // 2. Cloud Save (Firebase)
    const statusEl = document.getElementById('saveStatus');
    
    if (typeof currentUser !== 'undefined' && currentUser && db) {
        // We use .set() with merge:true so we don't accidentally delete fields
        db.collection('users').doc(currentUser.uid).set(appData, { merge: true })
            .then(() => {
                console.log("Cloud Save Success");
                if (statusEl) {
                    statusEl.innerText = "☁️ Saved";
                    statusEl.style.color = "#10b981"; // Green
                    setTimeout(() => { statusEl.innerText = ""; }, 3000);
                }
            })
            .catch(e => {
                console.error("Cloud Save Error:", e);
                if (statusEl) {
                    statusEl.innerText = "⚠️ Offline (Saved Locally)";
                    statusEl.style.color = "#ef4444"; // Red
                }
            });
    } else {
        // Offline Mode
        if (statusEl) {
            statusEl.innerText = "💾 Saved (Offline)";
            statusEl.style.color = "gray";
            setTimeout(() => { statusEl.innerText = ""; }, 3000);
        }
    }
}
function loginGoogle() {
    if(isOffline) { alert("Please add your Firebase Keys in script.js first!"); return; }
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(e => alert(e.message));
}
function logoutGoogle() {
    if(auth) auth.signOut().then(() => location.reload());
}

// ==========================================
// 4. NAVIGATION & CORE UI
// ==========================================
function showSection(id) {
    document.querySelectorAll('.section').forEach(e => e.classList.remove('active'));
    const el = document.getElementById(id);
    if(el) {
        el.classList.add('active');
      if(id === 'dojo') renderDojo();
       if(id === 'yearCompass') renderYearCompass();
      if(id === 'events') renderEvents();
        if(id === 'tribe') renderTribe();
      
      if(id==='soundscapes') renderSoundscapes ();
     if (id === 'omr_dojo') initOMR();
      
if(id === 'nottodo') renderNotToDo();
        if(id === 'finance') switchFinanceTab('overview');
        if(id === 'identity') renderIdentity();
        if(id==='analytics') { renderCharts(); renderHistory(); renderSyllabusChart(); }
        if(id==='tests') renderMockTests(); 
        if(id==='retro') renderRetroStats(); 
        if (id === 'notespace') renderNoteSpace();
    
        if(id==='newsroom') refreshNews();
        if(id==='whiteboard') { setTimeout(() => initWhiteboard(), 200); }
        if(id==='bio') renderBio();
        if(id==='monk') renderMonk();
      if (id === 'stoic_journal') renderStoicJournal();
      if (id === 'test_analyser') renderPrelimsLogs();
      if (id === 'book_vault') renderBookVault();
if (id === 'niti_dm') {
    renderNitiGame();
}
     
    if (id === 'kanban')    renderKanban();
 
   
  
        if(id==='watchlist') renderWatchlist();
        if(id==='bucket') renderBucket();
        if(id==='chef') renderChef();
        if(id==='dopamine') renderDopamine();
        if(id==='inventory') renderInventory();
        if(id==='events') renderEvents();
      if (id === 'braindeck') renderCard();
      if (id === 'goals') renderGoals();
      if (id === 'focus_chain') renderFocusChain();
      if (id === 'memo') renderMemo();
      if(id === 'mapmaster') {
    setTimeout(() => { 
        initQuizMap(); 
        if(quizMap) quizMap.invalidateSize();
        if(!currentTarget) startMapRound(); 
    }, 300);
}
    }
}

function openAppsModal() { document.getElementById('appsModal').style.display = 'flex'; }
function openGlobalSearch() { document.getElementById('globalSearchModal').style.display='flex'; document.getElementById('globalSearchInput').focus(); runGlobalSearch(); }
function runGlobalSearch() {
    const query=(document.getElementById('globalSearchInput')?.value||'').trim().toLowerCase();
    const results=document.getElementById('globalSearchResults'); if(!results)return; results.replaceChildren();
    if(!query){results.textContent='Start typing to search your workspace.';return;}
    const matches=[]; const add=(kind,text,section)=>{if(text && text.toLowerCase().includes(query))matches.push({kind,text,section});};
    Object.entries(appData.plans||{}).forEach(([date,plan])=>(plan.tasks||[]).forEach(task=>add('Planner task',`${task.text} ${date}`,'calendar')));
    Object.values(appData.goals||{}).flat().forEach(task=>add('Task',task.text,'goals'));
    (appData.curriculum||[]).forEach(subject=>{add('Subject',subject.subject,'syllabus');(subject.chapters||[]).forEach(chapter=>{add('Chapter',chapter.title,'syllabus');(chapter.topics||[]).forEach(topic=>add('Topic',topic,'syllabus'));});});
    (appData.watchlist||[]).forEach(item=>add('Watchlist',item.t,'watchlist'));
    (appData.ledger||[]).forEach(item=>add('Finance',`${item.description||item.item||''} ${item.person||''}`,'finance'));
    (appData.events||[]).forEach(item=>add('Event',item.name||item.t,'events'));
    add('Thoughts',appData.thoughts||'','thoughtpad');
    if (typeof nsData !== 'undefined') nsData.forEach(notebook=>{add('Notebook',notebook.title,'notespace');(notebook.sections||[]).forEach(section=>{add('Section',section.title,'notespace');(section.pages||[]).forEach(page=>add('Note',`${page.title||''} ${String(page.content||'').replace(/<[^>]*>/g,' ')}`,'notespace'));});});
    matches.slice(0,100).forEach(match=>{const button=document.createElement('button');button.className='global-search-result';button.type='button';const type=document.createElement('small');type.textContent=match.kind;const text=document.createElement('span');text.textContent=match.text;button.append(type,text);button.onclick=()=>{closeModal('globalSearchModal');showSection(match.section);};results.appendChild(button);});
    if(!results.children.length)results.textContent='No matches found.';
}
function selectApp(id) { document.getElementById('appsModal').style.display = 'none'; showSection(id); }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// ==========================================
// 5. TIMER & STOPWATCH LOGIC (FIXED)
// ==========================================
let timerInterval;

function populateTimerChapters() {
    const subject = document.getElementById('preTimerSubject').value;
    const chapSelect = document.getElementById('preTimerChapter');
    chapSelect.innerHTML = '<option value="" disabled selected>-- Select Chapter --</option>';
    
    if(subject) {
        const found = UPSC_SYLLABUS.find(s => s.subject === subject);
        if(found) {
            chapSelect.style.display = 'block'; 
            found.chapters.forEach(c => {
                chapSelect.innerHTML += `<option value="${c.title}" style="font-weight:bold; background:#e5e7eb; color:black;">📂 ${c.title}</option>`;
                c.topics.forEach(t => { chapSelect.innerHTML += `<option value="${t}">   • ${t}</option>`; });
            });
        }
    } else {
        chapSelect.style.display = 'none';
    }
}

function updateTimerVisuals() {
    const btnTimer = document.getElementById('mode-timer');
    const btnStopwatch = document.getElementById('mode-stopwatch');
    const settings = document.getElementById('timerSettingsArea');
    const display = document.getElementById('timer');
    const startBtn = document.getElementById('btnStart');
    const doneBtn = document.getElementById('btnDone');
    const isStopwatch = appData.timer.mode === 'stopwatch';
    btnTimer.classList.toggle('active', !isStopwatch);
    btnStopwatch.classList.toggle('active', isStopwatch);
    settings.classList.toggle('timer-settings-hidden', isStopwatch);

    if (isStopwatch) {
        
        // Restore Stopwatch Display Logic
        let diff = appData.timer.accumulated;
        if(appData.timer.active) diff += (Date.now() - appData.timer.startTime);
        
        if (diff > 0) {
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            display.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        } else {
            display.innerText = "00:00:00";
        }

    } else {
        if (!appData.timer.active && appData.timer.remaining === 0) {
            const mins = document.getElementById('focusTime').value;
            display.innerText = `${mins.toString().padStart(2, '0')}:00`;
        }
    }
    
    if (appData.timer.active) {
        startBtn.innerText = "Pause";
        startBtn.style.background = "#f59e0b";
    } else {
        startBtn.innerText = (appData.timer.remaining > 0 || appData.timer.accumulated > 0) ? "Resume" : "Start";
        startBtn.style.background = (appData.timer.remaining > 0 || appData.timer.accumulated > 0) ? "var(--success)" : "var(--primary)";
    }
    if (doneBtn) {
        doneBtn.disabled = !appData.timer.active;
        doneBtn.title = appData.timer.active ? 'End and log this session' : 'Start a timer before ending a session';
    }
}

function switchTimerMode(mode) {
    appData.timer.mode = mode;
    appData.timer.active = false;
    appData.timer.startTime = null;
    appData.timer.endTime = null;
    appData.timer.remaining = 0;
    appData.timer.accumulated = 0;
    if(timerInterval) clearInterval(timerInterval);
    saveData();
    updateTimerVisuals();
}

function startTimer() {
    if (Notification.permission !== "granted") Notification.requestPermission();

    if (appData.timer.active) {
        pauseTimer();
        return;
    }

    if ((appData.timer.remaining > 0 || appData.timer.accumulated > 0) && !appData.timer.active) {
        if(appData.timer.mode === 'timer') {
            appData.timer.endTime = Date.now() + appData.timer.remaining;
        } else {
            appData.timer.startTime = Date.now();
        }
        appData.timer.active = true;
        if (chainState.active) { chainState.paused = false; document.getElementById('fcPauseBtn').innerText = 'Pause'; }
        updateTimerVisuals();
        saveData();
        runTimerInterval();
        return;
    }

    if (appData.timer.mode === 'timer') {
        const mins = Math.max(10, parseInt(document.getElementById('focusTime').value, 10) || 10);
        document.getElementById('focusTime').value = mins;
        appData.timer.totalDuration = mins;
        appData.timer.endTime = Date.now() + (mins * 60 * 1000);
        appData.timer.remaining = 0;
    } else {
        appData.timer.startTime = Date.now();
        appData.timer.accumulated = 0;
    }

    appData.timer.subject = document.getElementById('preTimerSubject').value || "General";
    appData.timer.chapter = document.getElementById('preTimerChapter').value || "";

    appData.timer.active = true;
    if (chainState.active) { chainState.paused = false; document.getElementById('fcPauseBtn').innerText = 'Pause'; }
    updateTimerVisuals();
    saveData();
    runTimerInterval();
}

function enforceSessionMinimum(input) {
    const value = parseInt(input.value, 10);
    if (!Number.isFinite(value) || value < 10) input.value = 10;
}

function pauseTimer() {
    if (!appData.timer.active) return;
    clearInterval(timerInterval); 
    timerInterval = null; 
    
    const now = Date.now();
    if(appData.timer.mode === 'timer') { 
        appData.timer.remaining = appData.timer.endTime - now; 
        if(appData.timer.remaining < 0) appData.timer.remaining = 0; 
    } 
    else { 
        appData.timer.accumulated += (now - appData.timer.startTime); 
        appData.timer.startTime = null; 
    }
    
    appData.timer.active = false;
    if (chainState.active) { chainState.paused = true; document.getElementById('fcPauseBtn').innerText = 'Resume'; }
        document.title = "Paused - Personal Command Center";
    updateTimerVisuals();
    saveData();
}

function finishEarly() {
    if (!appData.timer.active) return;
    const remainingMs = appData.timer.active
        ? (appData.timer.endTime || 0) - Date.now()
        : (appData.timer.remaining || 0);
    const isEarly = appData.timer.mode === 'timer' && remainingMs > 0;
    if (isEarly) {
        requestTimedConfirmation('End this session?', 'The timer is still running. You can cancel or wait 10 seconds to confirm ending it early.', finishEarlyNow);
        return;
    }
    finishEarlyNow();
}

function finishEarlyNow() {
    if (!appData.timer.active) return;
    let elapsedMinutes = 0;
    if (appData.timer.mode === 'timer') {
        if(appData.timer.active) {
            const totalMs = appData.timer.totalDuration * 60 * 1000;
            const remainingMs = appData.timer.endTime - Date.now();
            elapsedMinutes = Math.floor((totalMs - remainingMs) / 60000);
        } else {
            const totalMs = appData.timer.totalDuration * 60 * 1000;
            elapsedMinutes = Math.floor((totalMs - appData.timer.remaining) / 60000);
        }
    } else {
        let currentTotal = appData.timer.accumulated;
        if(appData.timer.active) { currentTotal += (Date.now() - appData.timer.startTime); }
        elapsedMinutes = Math.floor(currentTotal / 60000);
    }
    
    if(elapsedMinutes < 1) { alert("Session too short to log (< 1 min)."); return; }
    
    const today = getTodayDate();
    const sub = appData.timer.subject || "General";
    appData.focusLog[today] = (appData.focusLog[today]||0) + elapsedMinutes;
    appData.subjectLog[sub] = (appData.subjectLog[sub]||0) + elapsedMinutes;
    
    appData.xp = (appData.xp || 0) + (elapsedMinutes * 10);
    updateRank();
    
    logSession(sub, appData.timer.chapter, elapsedMinutes, appData.timer.mode === 'timer' ? "Timer" : "Stopwatch");
    resetTimer(false);
    saveData();
    renderCharts();
    updateDashboard();
    if (chainState.active) completeChainStep();
}

function resetTimer(persist = true) {
    clearInterval(timerInterval);
    timerInterval = null;
    appData.timer.active = false;
    appData.timer.remaining = 0;
    appData.timer.accumulated = 0;
    appData.timer.endTime = null;
    appData.timer.startTime = null;
    if (persist) saveData();
    document.title = "Personal Command Center";
    updateTimerVisuals();
}

function runTimerInterval() {
    if(timerInterval) clearInterval(timerInterval); 
    timerInterval = setInterval(tick, 1000);
    tick(); 
}

function tick() {
    if (!appData.timer.active) return;
    const now = Date.now();
    const display = document.getElementById('timer');
    
    if(appData.timer.mode === 'timer') {
        const distance = appData.timer.endTime - now;
        if (distance < 0) {
            completeSession(); 
        } else {
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            display.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            document.title = `${m}:${s} | Focus`;
        }
    } else {
        const diff = (now - appData.timer.startTime) + appData.timer.accumulated;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const timeStr = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        display.innerText = timeStr;
        document.title = `${timeStr} | Stopwatch`;
    }
}

function playTimerCompletionSound() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const context = new AudioContextClass();
        const gain = context.createGain();
        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.connect(context.destination);
        [0, 0.32].forEach((offset, index) => {
            const oscillator = context.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(index === 0 ? 880 : 1175, context.currentTime + offset);
            oscillator.connect(gain);
            gain.gain.setValueAtTime(0.0001, context.currentTime + offset);
            gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + offset + 0.025);
            gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + offset + 0.26);
            oscillator.start(context.currentTime + offset);
            oscillator.stop(context.currentTime + offset + 0.28);
        });
        setTimeout(() => context.close(), 800);
    } catch (error) { console.warn('Timer completion sound could not play:', error); }
}

function completeSession() { 
    if (!appData.timer.active || completingSession) return;
    completingSession = true;
    clearInterval(timerInterval); timerInterval = null;
    playTimerCompletionSound();
    document.title = "Time's Up!";
    const sub = appData.timer.subject || "General";
    const mins = appData.timer.totalDuration;
    const today = getTodayDate();
    appData.focusLog[today] = (appData.focusLog[today]||0) + mins;
    appData.subjectLog[sub] = (appData.subjectLog[sub]||0) + mins;
    appData.xp = (appData.xp||0) + (mins * 10);
    
    updateRank();
    logSession(sub, appData.timer.chapter, mins, "Timer");
    resetTimer(false);
    saveData();
    
    if (Notification.permission === "granted") new Notification("Session Complete!", { body: `Finished: ${sub}` });
    
    renderCharts();
    updateDashboard();
    if (chainState.active) completeChainStep();
    completingSession = false;
}

// ==========================================
// 6. MODULES (B.TECH, CHEF, ETC)
// ==========================================

// --- B.TECH (Fixed Missing Reference) ---
function toggleDegreeMode() {
    const toggle = document.getElementById('degreeToggle');
    if(toggle) appData.degreeMode = toggle.checked;
    
    const panel = document.getElementById('btech-panel');
    if (panel) {
        panel.style.display = appData.degreeMode ? 'block' : 'none';
    }
    saveData();
}

function renderBtech() {
    const list = document.getElementById('attendanceList');
    if (!list) return;
    list.innerHTML = '';
    
    if (!appData.btech) appData.btech = { subjects: [], assignments: [] };

    appData.btech.subjects.forEach((sub, i) => {
        const pct = sub.total === 0 ? 0 : Math.round((sub.present / sub.total) * 100);
        const color = pct < 75 ? 'var(--danger)' : 'var(--success)';
        
        list.innerHTML += `
            <div class="goal-item">
                <div style="display:flex; justify-content:space-between; width:100%;">
                    <strong>${sub.name}</strong>
                    <span style="color:${color}; font-weight:bold;">${pct}%</span>
                </div>
                <div style="display:flex; gap:10px; margin-top:5px;">
                    <button onclick="updateAttendance(${i}, 1, 1)" style="font-size:0.7rem; background:#10b981;">P</button>
                    <button onclick="updateAttendance(${i}, 0, 1)" style="font-size:0.7rem; background:#ef4444;">A</button>
                    <span style="font-size:0.8rem; color:gray; align-self:center;">${sub.present}/${sub.total}</span>
                    <button onclick="deleteBtechSubject(${i})" style="margin-left:auto; background:none; color:red;">x</button>
                </div>
            </div>
        `;
    });

    const assignList = document.getElementById('assignmentList');
    if(assignList) {
        assignList.innerHTML = '';
        appData.btech.assignments.forEach((task, i) => {
            assignList.innerHTML += `
                <li class="goal-item">
                    <span>${task}</span>
                    <button onclick="deleteAssignment(${i})" style="color:red; background:none;"><i class="fas fa-trash"></i></button>
                </li>
            `;
        });
    }
}

function addBtechSubject() {
    const name = document.getElementById('btechSubName').value;
    if (name) {
        if (!appData.btech) appData.btech = { subjects: [], assignments: [] };
        appData.btech.subjects.push({ name: name, present: 0, total: 0 });
        document.getElementById('btechSubName').value = '';
        saveData();
        renderBtech();
    }
}

function updateAttendance(index, p, t) {
    if (appData.btech && appData.btech.subjects[index]) {
        appData.btech.subjects[index].present += p;
        appData.btech.subjects[index].total += t;
        saveData();
        renderBtech();
    }
}

function deleteBtechSubject(index) {
    if (appData.btech && appData.btech.subjects[index]) {
        appData.btech.subjects.splice(index, 1);
        saveData();
        renderBtech();
    }
}

function addAssignment() {
    const task = document.getElementById('assignName').value;
    if (task) {
        if (!appData.btech) appData.btech = { subjects: [], assignments: [] };
        appData.btech.assignments.push(task);
        document.getElementById('assignName').value = '';
        saveData();
        renderBtech();
    }
}

function deleteAssignment(index) {
    if (appData.btech && appData.btech.assignments[index]) {
        appData.btech.assignments.splice(index, 1);
        saveData();
        renderBtech();
    }
}

// --- CHEF ---
function renderChef() {
    const grid = document.getElementById('mealGrid');
    if(!grid) return;
    grid.innerHTML = '<div style="font-weight:bold;">Day</div><div style="font-weight:bold;">Lunch</div><div style="font-weight:bold;">Dinner</div>';
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    if(!appData.chef) appData.chef = {};
    days.forEach(d => {
        if(!appData.chef[d]) appData.chef[d] = {l: "", d: ""};
        grid.innerHTML += `
            <div style="padding:10px; border-bottom:1px solid #374151;">${d}</div>
            <div><input type="text" class="modal-input" style="margin:0;" value="${appData.chef[d].l}" onchange="saveMeal('${d}', 'l', this.value)"></div>
            <div><input type="text" class="modal-input" style="margin:0;" value="${appData.chef[d].d}" onchange="saveMeal('${d}', 'd', this.value)"></div>
        `;
    });
}
function saveMeal(day, type, val) {
    if(!appData.chef) appData.chef = {};
    if(!appData.chef[day]) appData.chef[day] = {l: "", d: ""};
    appData.chef[day][type] = val;
    saveData();
}

// --- PANIC ---
function triggerPanic() {
    document.getElementById('panicModal').style.display = 'flex';
    const textEl = document.getElementById('breatheInstruction');
    if(textEl) {
        textEl.innerText = "Inhale...";
        if(window.panicInterval) clearInterval(window.panicInterval);
        window.panicInterval = setInterval(() => {
            textEl.innerText = "Inhale...";
            setTimeout(() => {
                if(document.getElementById('panicModal').style.display !== 'none') {
                    textEl.innerText = "Exhale...";
                }
            }, 2000); 
        }, 4000); 
    }
}

// --- ZEN ---
function toggleZenMode() {
    const card = document.getElementById('timerCard');
    if (card.classList.contains('fullscreen')) {
        requestTimedConfirmation('Exit Zen mode?', 'Stay in Zen mode or wait 10 seconds to confirm exiting.', exitZenMode);
        return;
    }
    card.classList.add('fullscreen');
    const isZen = true;
    document.body.classList.toggle('zen-mode-active', isZen);
    const zenButton = card.querySelector('.timer-zen-button');
    if (zenButton) {
        zenButton.textContent = isZen ? 'Exit Zen' : 'Zen mode';
        zenButton.setAttribute('aria-pressed', String(isZen));
    }
    window.scrollTo(0, 0);
}

function exitZenMode() {
    const card = document.getElementById('timerCard');
    card.classList.remove('fullscreen');
    document.body.classList.remove('zen-mode-active');
    const zenButton = card.querySelector('.timer-zen-button');
    if (zenButton) { zenButton.textContent = 'Zen mode'; zenButton.setAttribute('aria-pressed', 'false'); }
}

function requestTimedConfirmation(title, message, action) {
    cancelTimedConfirmation(false);
    timedConfirmationAction = action;
    const modal=document.getElementById('timedConfirmModal');
    const button=document.getElementById('timedConfirmButton');
    document.getElementById('timedConfirmTitle').textContent=title;
    document.getElementById('timedConfirmMessage').textContent=message;
    let remaining=10;
    button.disabled=true; button.textContent=`Confirm in ${remaining}s`;
    modal.style.display='flex';
    timedConfirmationInterval=setInterval(()=>{
        remaining--;
        if (remaining <= 0) { clearInterval(timedConfirmationInterval); timedConfirmationInterval=null; button.disabled=false; button.textContent='Yes, confirm'; }
        else button.textContent=`Confirm in ${remaining}s`;
    },1000);
}

function acceptTimedConfirmation() {
    if (!timedConfirmationAction || document.getElementById('timedConfirmButton').disabled) return;
    const action=timedConfirmationAction;
    cancelTimedConfirmation();
    action();
}

function cancelTimedConfirmation(close=true) {
    if (timedConfirmationInterval) clearInterval(timedConfirmationInterval);
    timedConfirmationInterval=null; timedConfirmationAction=null;
    const modal=document.getElementById('timedConfirmModal');
    if (close && modal) modal.style.display='none';
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.getElementById('timedConfirmModal')?.style.display === 'flex') cancelTimedConfirmation();
    else if (event.key === 'Escape' && document.getElementById('timerCard')?.classList.contains('fullscreen')) toggleZenMode();
});

// --- REST OF HELPERS (Dopamine, Inventory, etc.) ---
function logDistraction() {
    const act = document.getElementById('distractionInput').value.trim();
    const mins = parseInt(document.getElementById('distractionTime').value, 10);
    const category = document.getElementById('distractionCategory')?.value || 'Other';
    if(act && Number.isFinite(mins) && mins > 0) {
        if(!appData.dopamine) appData.dopamine = [];
        appData.dopamine.unshift({ a: act, m: mins, category, d: getTodayDate(), id:Date.now() });
        document.getElementById('distractionInput').value = '';
        document.getElementById('distractionTime').value = '';
        saveData();
        renderDopamine();
    }
}
function renderDopamine() {
    if(!appData.dopamine) appData.dopamine = [];
    const today = getTodayDate();
    const todayLogs = appData.dopamine.filter(l => l.d === today);
    const total = todayLogs.reduce((s, i) => s + Number(i.m || 0), 0);
    const limit = Number(appData.detoxGoal || 60);
    const goalLabel=document.getElementById('detoxGoalLabel'); if(goalLabel) goalLabel.textContent=`${limit}m`;
    document.getElementById('totalWasted').innerText = `${total}m`;
    const remaining=document.getElementById('detoxRemaining'); if(remaining) { const left=limit-total; remaining.textContent=left >= 0 ? `${left}m` : `${Math.abs(left)}m over`; remaining.style.color=left >= 0 ? 'var(--success)' : 'var(--danger)'; }
    const weekTotal=appData.dopamine.filter(log => (new Date(`${today}T00:00:00`) - new Date(`${log.d}T00:00:00`)) / 86400000 < 7 && log.d <= today).reduce((sum, log) => sum + Number(log.m || 0), 0);
    const week=document.getElementById('detoxWeekTotal'); if(week) week.textContent=`${weekTotal}m`;
    const byCategory={}; todayLogs.forEach(log=>byCategory[log.category || 'Other']=(byCategory[log.category || 'Other']||0)+Number(log.m||0));
    const top=Object.entries(byCategory).sort((a,b)=>b[1]-a[1])[0];
    const insight=document.getElementById('detoxInsight'); if(insight) insight.textContent=top ? `Today’s biggest pull: ${top[0]} (${top[1]}m). ${total > limit ? 'You are above your chosen limit.' : `${Math.max(0,limit-total)} minutes remain in your limit.`}` : 'No distractions logged today. Protect this space.';
    const list = document.getElementById('distractionList');
    list.innerHTML = '';
    todayLogs.forEach((l, index) => { list.innerHTML += `<div class="detox-log"><div><strong>${l.a}</strong><small>${l.category || 'Other'}</small></div><div><span>${l.m}m</span><button type="button" onclick="deleteDistraction(${index})" aria-label="Delete ${l.a}">&times;</button></div></div>`; });
}
function deleteDistraction(index) { const today=getTodayDate(); const rows=(appData.dopamine||[]).filter(log=>log.d===today); const target=rows[index]; const targetIndex=(appData.dopamine||[]).indexOf(target); if(targetIndex>=0) { appData.dopamine.splice(targetIndex,1); saveData(); renderDopamine(); } }
function setDetoxGoal() { const next=prompt('Set your daily distraction limit in minutes:', appData.detoxGoal || 60); if(next===null)return; const goal=Number(next); if(!Number.isFinite(goal)||goal<0){alert('Enter a whole number of minutes.');return;} appData.detoxGoal=Math.round(goal); saveData(); renderDopamine(); }

let shopFilter = 'open';
function addInventory() {
    const item = document.getElementById('invInput').value.trim();
    const category=document.getElementById('invCategory')?.value || 'Other';
    const qty=Math.max(1, Number(document.getElementById('invQty')?.value || 1));
    if(item) {
        if(!appData.inventory) appData.inventory = [];
        appData.inventory.push({ n: item, c: false, category, qty, createdAt:Date.now() });
        document.getElementById('invInput').value = '';
        document.getElementById('invQty').value = 1;
        saveData();
        renderInventory();
    }
}
function toggleInventory(i) {
    appData.inventory[i].c = !appData.inventory[i].c;
    saveData(); 
    renderInventory();
}
function deleteInventory(i) {
    appData.inventory.splice(i, 1);
    saveData();
    renderInventory();
}
function renderInventory() {
    const list = document.getElementById('invList');
    if(!list) return;
    if(!appData.inventory) appData.inventory = [];
    list.innerHTML = '';
    const open=appData.inventory.filter(item=>!item.c).length;
    const summary=document.getElementById('shopSummary'); if(summary) summary.textContent=`${open} to buy`;
    appData.inventory.forEach((item, i) => { const visible=shopFilter==='all'||(shopFilter==='open'&&!item.c)||(shopFilter==='done'&&item.c); if(!visible)return; list.innerHTML += `<div class="shop-item ${item.c?'purchased':''}"><button type="button" class="shop-check" onclick="toggleInventory(${i})" aria-label="Toggle purchase">${item.c?'✓':''}</button><div class="shop-item-main"><strong>${item.n}</strong><small>${item.category || 'Other'} · ${item.qty || 1} needed</small></div><div class="shop-quantity"><button type="button" onclick="changeInventoryQty(${i},-1)">−</button><span>${item.qty || 1}</span><button type="button" onclick="changeInventoryQty(${i},1)">+</button></div><button type="button" class="shop-delete" onclick="deleteInventory(${i})">Remove</button></div>`; });
    if(!list.children.length) list.innerHTML='<p class="empty-state">Nothing here yet.</p>';
}
function changeInventoryQty(index, delta) { appData.inventory[index].qty=Math.max(1,Number(appData.inventory[index].qty||1)+delta); saveData(); renderInventory(); }
function filterShop(filter, button) { shopFilter=filter; document.querySelectorAll('.shop-filter button').forEach(btn=>btn.classList.toggle('active',btn===button)); renderInventory(); }

// 5.5 THOUGHT PAD
function saveThoughts() {
    appData.thoughts = document.getElementById('thoughtArea').value;
    triggerAutoSave();
}

// --- LIFE OS (PREVIOUS) ---
function currentMonthKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`; }
function setBudget() {
    const today = new Date();
    const selectedMonth = document.getElementById('budgetMonth')?.value || currentMonthKey(today);
    if (today.getDate() !== 1 || selectedMonth !== currentMonthKey(today)) {
        alert('A budget can only be set on the first day of the current month.');
        return;
    }
    const current = appData.treasury.monthlyBudgets?.[selectedMonth] || '';
    const value = prompt(`Set budget for ${selectedMonth} (₹):`, current);
    if (value === null || value.trim() === '') return;
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) return alert('Enter a valid budget amount.');
    if (!appData.treasury.monthlyBudgets) appData.treasury.monthlyBudgets = {};
    appData.treasury.monthlyBudgets[selectedMonth] = amount;
    appData.treasury.budget = amount;
    saveData(); renderTreasury();
}
function addExpense() {
    const amt = document.getElementById('expenseAmount').value; const desc = document.getElementById('expenseDesc').value;
    if(amt && desc && Number(amt) > 0) {
        if(!appData.treasury) appData.treasury={budget:0, expenses:[]};
        const amount = Number(amt);
        appData.treasury.expenses.unshift({amt:amount, desc:desc, date:getTodayDate()});
        if (!appData.ledger) appData.ledger = [];
        appData.ledger.unshift({id:`${Date.now()}-treasury`, type:'expense', amount, person:'', description:desc, date:getTodayDate(), settled:false, source:'treasury'});
        document.getElementById('expenseAmount').value=''; document.getElementById('expenseDesc').value='';
        saveData(); renderTreasury(); renderLedger();
    }
}
function renderTreasury() {
    if(!appData.treasury) appData.treasury={budget:0, expenses:[]};
    if (!appData.treasury.monthlyBudgets) appData.treasury.monthlyBudgets = {};
    const now = new Date(); const monthInput = document.getElementById('budgetMonth');
    if (monthInput && !monthInput.value) monthInput.value = currentMonthKey(now);
    const month = monthInput?.value || currentMonthKey(now);
    if (!Object.keys(appData.treasury.monthlyBudgets).length && Number(appData.treasury.budget) > 0) appData.treasury.monthlyBudgets[currentMonthKey(now)] = Number(appData.treasury.budget);
    appData.treasury.expenses.forEach(expense => { if (!expense.date) expense.date = getTodayDate(); });
    const expenses = appData.treasury.expenses.filter(expense => expense.date.startsWith(month));
    const total = expenses.reduce((sum, expense) => sum + Number(expense.amt || 0), 0);
    const budget = Number(appData.treasury.monthlyBudgets[month] || 0);
    const pct = budget > 0 ? (total / budget) * 100 : 0;
    const money = formatCurrency;
    document.getElementById('budgetDisplay').innerText = money(budget);
    document.getElementById('budgetSpent').innerText = money(total);
    document.getElementById('budgetRemaining').innerText = money(budget-total);
    document.getElementById('budgetBar').style.width = Math.min(pct,100)+'%';
    document.getElementById('budgetBar').classList.toggle('over-budget', budget > 0 && total > budget);
    const isBudgetDay = now.getDate() === 1 && month === currentMonthKey(now);
    const button = document.getElementById('setBudgetButton'); button.disabled = !isBudgetDay;
    document.getElementById('budgetRuleMessage').textContent = isBudgetDay ? 'Today is the first: you can set this month’s budget.' : 'Monthly budgets can only be set on the first day of the month.';
    const list = document.getElementById('expenseList'); list.replaceChildren();
    expenses.forEach(expense => { const row=document.createElement('div'); row.className='expense-item'; const desc=document.createElement('span'); desc.textContent=expense.desc; const amount=document.createElement('strong'); amount.textContent=`−${money(Number(expense.amt)||0)}`; row.append(desc,amount); list.appendChild(row); });
}

function logSleep() { const h=document.getElementById('sleepHours').value; if(h){ if(!appData.sleep)appData.sleep=[]; appData.sleep.unshift({date:getTodayDate(), hrs:parseFloat(h)}); saveData(); renderBio(); } }
function saveBio() { if(!appData.bio)appData.bio={}; appData.bio.weight=document.getElementById('weightInput').value; saveData(); }
function renderBio() {
    if(!appData.sleep) appData.sleep=[];
    const total = appData.sleep.reduce((s,i)=>s+i.hrs,0);
    const avg = appData.sleep.length ? (total/appData.sleep.length).toFixed(1) : 0;
    document.getElementById('avgSleep').innerText = avg + "h avg";
    if(appData.bio) document.getElementById('weightInput').value = appData.bio.weight||'';
}

function logMood(m) { document.getElementById('moodStatus').innerText = `Mood: ${m}`; }
function saveGratitude() { const t=document.getElementById('gratitudeText').value; if(t){ if(!appData.gratitude)appData.gratitude=[]; appData.gratitude.unshift({t:t}); saveData(); renderMonk(); } }
function renderMonk() { const l=document.getElementById('gratitudeList'); if(!appData.gratitude)return; l.innerHTML=''; appData.gratitude.slice(0,3).forEach(g=>{ l.innerHTML+=`<div>${g.t}</div>`; }); }

function addWatchItem() { 
    const input = document.getElementById('watchTitle');
    const t = input.value.trim();
    const type = document.getElementById('watchType').value;
    const scheduledAt = document.getElementById('watchSchedule').value || '';
    if(t) {
        if(!appData.watchlist) appData.watchlist = []; 
        appData.watchlist.unshift({t, type, status:'planned', watched:false, scheduledAt});
        input.value = '';
        document.getElementById('watchSchedule').value = '';
        saveData(); 
        renderWatchlist(); 
    } 
}
function renderWatchlist() { 
    const list = document.getElementById('watchListContainer');
    if (!list) return;
    if (!appData.watchlist) appData.watchlist = [];
    list.replaceChildren();
    const query = (document.getElementById('watchSearch')?.value || '').trim().toLowerCase();
    const filter = document.getElementById('watchFilter')?.value || 'all';
    const completed = appData.watchlist.filter(item => item.watched || item.status === 'completed').length;
    const summary = document.getElementById('watchSummary');
    if (summary) summary.textContent = `${appData.watchlist.length} items · ${completed} completed`;
    appData.watchlist.forEach((item, index) => {
        const status = item.watched ? 'completed' : (item.status || 'planned');
        if (!item.status) item.status = status;
        if ((query && !item.t.toLowerCase().includes(query)) || (filter !== 'all' && status !== filter)) return;
        const row = document.createElement('article'); row.className = `watch-item${status === 'completed' ? ' is-complete' : ''}`;
        const info = document.createElement('div'); info.className = 'watch-item-info';
        const icon = document.createElement('i'); icon.className = `fas ${item.type === 'Book' ? 'fa-book' : item.type === 'Game' ? 'fa-gamepad' : item.type === 'Podcast' ? 'fa-podcast' : 'fa-film'}`; icon.setAttribute('aria-hidden','true');
        const text = document.createElement('div');
        const title = document.createElement('strong'); title.textContent = item.t;
        const kind = document.createElement('small'); kind.textContent = item.type || 'Other';
        const when = document.createElement('small');
        when.className = 'watch-when';
        when.textContent = status === 'completed' && item.watchedAt
            ? `Watched ${new Date(item.watchedAt).toLocaleString()}`
            : item.scheduledAt ? `Planned for ${new Date(item.scheduledAt).toLocaleString()}` : 'No date scheduled';
        text.append(title, kind, when); info.append(icon, text);
        const controls = document.createElement('div'); controls.className = 'watch-item-controls';
        const schedule = document.createElement('input'); schedule.type = 'datetime-local'; schedule.value = item.scheduledAt || ''; schedule.setAttribute('aria-label', `Planned time for ${item.t}`);
        schedule.onchange = () => { item.scheduledAt = schedule.value; saveData(); renderWatchlist(); };
        const select = document.createElement('select'); select.setAttribute('aria-label', `Status for ${item.t}`);
        [['planned','Planned'],['in-progress','In progress'],['completed','Completed']].forEach(([value,label]) => select.add(new Option(label,value)));
        select.value = status; select.onchange = () => { item.status = select.value; item.watched = select.value === 'completed'; if (item.watched && !item.watchedAt) item.watchedAt = new Date().toISOString(); if (!item.watched) item.watchedAt = ''; saveData(); renderWatchlist(); };
        const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.onclick = () => { appData.watchlist.splice(index,1); saveData(); renderWatchlist(); };
        controls.append(schedule, select, remove); row.append(info, controls); list.appendChild(row);
    });
    if (!list.children.length) { const empty = document.createElement('p'); empty.className = 'watch-empty'; empty.textContent = query || filter !== 'all' ? 'No matching items.' : 'Your list is empty. Add something you want to enjoy.'; list.appendChild(empty); }
}

function addBucketItem() { const t=document.getElementById('bucketItem').value; if(t){ if(!appData.bucket)appData.bucket=[]; appData.bucket.push({t:t, done:false}); saveData(); renderBucket(); } }
function toggleBucket(i) { appData.bucket[i].done = !appData.bucket[i].done; saveData(); renderBucket(); }
function renderBucket() { 
    const l=document.getElementById('bucketListContainer'); if(!appData.bucket)return; l.innerHTML=''; 
    appData.bucket.forEach((b,i)=>{ 
        const cls = b.done ? 'checked' : '';
        l.innerHTML+=`<li class="bucket-item ${cls}"><span>${b.t}</span><input type="checkbox" ${b.done?'checked':''} onchange="toggleBucket(${i})"></li>`; 
    }); 
}

// --- NEWS ---
let currentNewsSource = 'hindu';
function refreshNews() { loadNewsSource(currentNewsSource); }
function loadNewsSource(s) {
    currentNewsSource = s;
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    const tabs = document.querySelectorAll('#newsroom .tab');
    if(s === 'hindu') tabs[0].classList.add('active');
    if(s === 'express') tabs[1].classList.add('active');
    if(s === 'pib') tabs[2].classList.add('active');

    const container = document.getElementById('newsContainer');
    container.innerHTML = '<div style="text-align:center; grid-column:span 3; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Fetching Headlines...</div>';

    // FALLBACK IF API FAILS
    const manualLinks = `
        <div style="text-align:center; grid-column: span 3; color: #9ca3af;">
            <p>Feed unavailable (API Limit). Use direct links:</p>
            <div style="display:flex; gap:10px; justify-content:center;">
                <a href="https://www.thehindu.com/" target="_blank" style="color:var(--primary); text-decoration:none; border:1px solid var(--primary); padding:5px 10px; border-radius:5px;">The Hindu</a>
                <a href="https://indianexpress.com/section/explained/" target="_blank" style="color:var(--primary); text-decoration:none; border:1px solid var(--primary); padding:5px 10px; border-radius:5px;">Indian Express</a>
                <a href="https://pib.gov.in/" target="_blank" style="color:var(--primary); text-decoration:none; border:1px solid var(--primary); padding:5px 10px; border-radius:5px;">PIB</a>
            </div>
        </div>
    `;

    let rssUrl = "";
    if(s === 'hindu') rssUrl = "https://www.thehindu.com/news/national/feeder/default.rss";
    if(s === 'express') rssUrl = "https://indianexpress.com/section/explained/feed/";
    if(s === 'pib') rssUrl = "https://news.google.com/rss/search?q=PIB+India&hl=en-IN&gl=IN&ceid=IN:en";

    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`)
    .then(r=>r.json())
    .then(d=>{
        if(d.status === 'ok') {
            renderNews(d.items);
        } else {
            container.innerHTML = manualLinks;
        }
    })
    .catch(e => {
        container.innerHTML = manualLinks;
    });
}

function renderNews(items) {
    const container = document.getElementById('newsContainer');
    container.innerHTML = '';
    items.slice(0, 9).forEach(item => {
        const cleanDesc = item.description ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '';
        const date = new Date(item.pubDate).toLocaleDateString();
        container.innerHTML += `
            <div class="news-card">
                <span class="news-source">${currentNewsSource.toUpperCase()}</span>
                <span class="news-date">${date}</span>
                <a href="${item.link}" target="_blank" class="news-link">
                    <h3 class="news-title">${item.title}</h3>
                </a>
                <p style="font-size:0.8rem; color:#9ca3af; margin-bottom:0;">${cleanDesc}</p>
            </div>
        `;
    });
}

// --- WAR ROOM ---
let map;
let mapMarkers = [];

function initMap() {
    if(map) return;
    map = L.map('map').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    map.on('click', e=>{
        const n=prompt("Name:"); if(n){
            const p={lat:e.latlng.lat, lng:e.latlng.lng, name:n};
            appData.mapPins.push(p); saveData(); addPinToMap(p); renderPinList();
        }
    });
    if(appData.mapPins) { appData.mapPins.forEach(p=>addPinToMap(p)); renderPinList(); }
}
function addPinToMap(p) { const m = L.marker([p.lat,p.lng]).addTo(map).bindPopup(p.name); mapMarkers.push(m); }
function renderPinList() { 
    const l=document.getElementById('pinList'); l.innerHTML=''; 
    if(appData.mapPins) appData.mapPins.forEach((p,i)=>{ l.innerHTML+=`<div class="pin-item" onclick="panToPin(${p.lat},${p.lng})">${p.name} <button onclick="deletePin(event,${i})" style="color:red;float:right;">x</button></div>`; }); 
}
function panToPin(lat,lng){ map.flyTo([lat,lng],8); }
function deletePin(e,i) { 
    e.stopPropagation(); 
    appData.mapPins.splice(i,1); 
    saveData(); 
    mapMarkers.forEach(m => map.removeLayer(m));
    mapMarkers = [];
    appData.mapPins.forEach(p=>addPinToMap(p)); 
    renderPinList(); 
}

// --- WHITEBOARD (SLIDES SYSTEM) ---
let canvas, ctx, painting = false;
let currentSlideIndex = 0;

function initWhiteboard() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');
    
    // Set size to match container
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    // Default Styles
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff'; // Default to white
    
    // Event Listeners
    canvas.addEventListener('mousedown', startP);
    canvas.addEventListener('mouseup', endP);
    canvas.addEventListener('mousemove', drawP);
    
    // Touch support (for mobile/tablet)
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startP(e.touches[0]); });
    canvas.addEventListener('touchend', endP);
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); drawP(e.touches[0]); });

    document.getElementById('brushColor').addEventListener('input', e => ctx.strokeStyle = e.target.value);

    // Initialize Slides Data
    if (!appData.slides || appData.slides.length === 0) {
        appData.slides = [""]; // Start with 1 empty slide
    }
    
    loadSlide(0); // Load the first slide
}

// Drawing Functions
function startP(e) { painting = true; drawP(e); }
function endP() { painting = false; ctx.beginPath(); }
function drawP(e) {
    if (!painting) return;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// Slide Management Functions
function updateSlideUI() {
    document.getElementById('slideCounter').innerText = `${currentSlideIndex + 1} / ${appData.slides.length}`;
}

function saveCurrentSlide() {
    // Save current canvas pixels to the array
    appData.slides[currentSlideIndex] = canvas.toDataURL();
    saveData();
    
    // Visual feedback
    const btn = document.querySelector("button[onclick='saveCurrentSlide()']");
    const oldText = btn.innerText;
    btn.innerText = "Saved!";
    setTimeout(() => btn.innerText = oldText, 1000);
}

function loadSlide(index) {
    // 1. Validate index
    if (index < 0) index = 0;
    if (index >= appData.slides.length) index = appData.slides.length - 1;
    currentSlideIndex = index;

    // 2. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3. Load Image (if exists)
    const data = appData.slides[currentSlideIndex];
    if (data && data.length > 10) { // Check if it's a real image string
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        };
        img.src = data;
    }
    
    updateSlideUI();
}

function newSlide() {
    saveCurrentSlide(); // Auto-save current work first
    appData.slides.push(""); // Add new empty slot
    loadSlide(appData.slides.length - 1); // Go to it
    saveData();
}

function changeSlide(direction) {
    saveCurrentSlide(); // Auto-save before leaving
    let newIndex = currentSlideIndex + direction;
    
    // Bounds check
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= appData.slides.length) newIndex = appData.slides.length - 1;
    
    loadSlide(newIndex);
}

function deleteSlide() {
    if (confirm("Delete this slide?")) {
        appData.slides.splice(currentSlideIndex, 1);
        
        // Never allow 0 slides
        if (appData.slides.length === 0) appData.slides.push("");
        
        // Adjust index if we deleted the last one
        if (currentSlideIndex >= appData.slides.length) {
            currentSlideIndex = appData.slides.length - 1;
        }
        
        saveData();
        loadSlide(currentSlideIndex);
    }
}

function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }
function downloadCanvas() { const l = document.createElement('a'); l.download = `slide_${currentSlideIndex+1}.png`; l.href = canvas.toDataURL(); l.click(); }

// --- CONSTITUTION ---
function searchConstitution() {
    const q=document.getElementById('constSearch').value.toLowerCase(); const d=document.getElementById('constResults'); d.innerHTML='';
    if(!q)return;
    const matches=CONSTITUTION_DATA.filter(c=>c.a.toLowerCase().includes(q)||c.t.toLowerCase().includes(q));
    matches.forEach(m=>{ d.innerHTML+=`<div class="const-result-item"><strong>Article ${m.a}</strong>: ${m.t}</div>`; });
}

// ==========================================
// 6. RENDER & UTILS (FULL LOGIC)
// ==========================================
function logSession(subject, chapter, duration, mode) {
    const session = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        subject: subject,
        chapter: chapter || "General",
        duration: duration,
        mode: mode
    };
    appData.history.unshift(session);
    if(appData.history.length > 500) appData.history.pop();
    renderHistory();
}

function renderHistory() {
    const tbody = document.getElementById('historyTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    if(appData.history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:10px; color:gray;">No history yet.</td></tr>';
        return;
    }
    appData.history.forEach(s => {
        const badgeColor = s.mode.includes('Timer') ? '#dbeafe' : '#fef3c7';
        tbody.innerHTML += `
            <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:10px;">${s.date} <small style="color:gray;">${s.time}</small></td>
                <td style="padding:10px;">${s.subject}</td>
                <td style="padding:10px;"><small>${s.chapter}</small></td>
                <td style="padding:10px;"><strong>${s.duration}m</strong></td>
                <td style="padding:10px;"><span style="font-size:0.8rem; background:${badgeColor}; color:#000000; padding:2px 6px; border-radius:4px; font-weight:bold;">${s.mode}</span></td>
            </tr>
        `;
    });
}

function clearHistory() {
    if(confirm("Clear all session history?")) {
        appData.history = [];
        saveData();
        renderHistory();
    }
}

function renderSyllabusChart() {
    const ctx = document.getElementById('syllabusChart'); if(!ctx) return;
    if(window.syllChart) window.syllChart.destroy();
    const labels = []; const data = [];
    UPSC_SYLLABUS.forEach(sub => {
        let total = 0, done = 0;
        sub.chapters.forEach(chap => {
            chap.topics.forEach(t => {
                total++;
                const key = `${sub.subject}-${chap.title}-${t}`;
                if(appData.syllabus[key] && appData.syllabus[key].status === 3) done++;
            });
        });
        labels.push(sub.subject.split(':')[0]);
        data.push(total === 0 ? 0 : Math.round((done/total)*100));
    });
    const color = appData.darkMode ? '#fff' : '#000';
    window.syllChart = new Chart(ctx, {
        type: 'bar', data: { labels: labels, datasets: [{ label: '% Completed', data: data, backgroundColor: '#10b981' }] },
        options: { indexAxis: 'y', maintainAspectRatio: false, scales: { x: { beginAtZero: true, max: 100, ticks: { color: color } }, y: { ticks: { color: color } } }, plugins: { legend: { display: false } } }
    });
}

function renderSyllabus() {
    const container = document.getElementById('syllabus-container'); 
    container.innerHTML = '';
    
    let html = '<table><thead><tr><th>Topic</th><th width="30">St</th><th width="30">PYQ</th><th width="80">Rev</th><th width="40">Res</th></tr></thead><tbody>';
    if (!UPSC_SYLLABUS.length) {
        container.innerHTML = '<div class="card">Your learning plan is empty. Add a subject above to get started.</div>';
        return;
    }
    
    UPSC_SYLLABUS.forEach((sub, sIdx) => {
        const topicCount=sub.chapters.reduce((sum, chapter)=>sum+chapter.topics.length,0);
        html += `<tr class="subject-header"><td colspan="5"><span class="curriculum-level">Subject</span><strong>${sub.subject}</strong><small>${sub.chapters.length} chapters · ${topicCount} topics</small></td></tr>`;
        
        sub.chapters.forEach((chap, cIdx) => {
            const chapId = `chap-${sIdx}-${cIdx}`;
            
            // --- THE FIX: Check if this chapter was left open ---
            const isOpen = appData.expanded && appData.expanded.includes(chapId);
            const visibilityClass = isOpen ? 'visible' : ''; 
            // ---------------------------------------------------

            html += `<tr class="chapter-row" onclick="toggleChapter('${chapId}')"><td colspan="5"><i class="fas fa-chevron-right" id="icon-${chapId}"></i><span class="curriculum-level">Chapter</span> ${chap.title} <small>${chap.topics.length} topics</small></td></tr>`;
            
            chap.topics.forEach(top => {
                const key = `${sub.subject}-${chap.title}-${top}`;
                const safeKey = key.replace(/'/g, "\\'"); // Escape quotes
                const data = appData.syllabus[key] || {status:0, pyq:false, rev:0};
                const hasNote = (data.note || data.link || (data.links && data.links.length > 0)) ? 'has-note' : '';
                
                // Add the 'visibilityClass' here so it stays open if needed
                html += `<tr class="topic-row ${chapId} ${visibilityClass}"><td class="topic-name"><span class="topic-dot"></span><span>${top}</span></td><td><div class="status-btn status-${data.status}" onclick="cycleStatus('${safeKey}', this)"></div></td><td><input type="checkbox" onchange="togglePYQ('${safeKey}')" ${data.pyq?'checked':''}></td><td><div class="rev-box"><button class="rev-btn" onclick="updateRev('${safeKey}', -1, this)">-</button><span>${data.rev||0}</span><button class="rev-btn" onclick="updateRev('${safeKey}', 1, this)">+</button></div></td><td style="text-align:center;"><button class="note-btn ${hasNote}" onclick="openNoteModal('${safeKey}')"><i class="fas fa-sticky-note"></i></button></td></tr>`;
            });
        });
    });
    html += '</tbody></table>'; 
    container.innerHTML = html;
    let subjectIndex = -1, chapterIndex = -1, topicIndex = -1;
    container.querySelectorAll('tr').forEach(row => {
        if (row.classList.contains('subject-header')) {
            subjectIndex++; chapterIndex = -1;
            addCurriculumActions(row.cells[0], 'subject', subjectIndex, -1);
        } else if (row.classList.contains('chapter-row')) {
            chapterIndex++; topicIndex = -1;
            addCurriculumActions(row.cells[0], 'chapter', subjectIndex, chapterIndex);
        } else if (row.classList.contains('topic-row')) {
            topicIndex++;
            addCurriculumActions(row.cells[0], 'topic', subjectIndex, chapterIndex, topicIndex);
        }
    });
}
function addCurriculumActions(cell, type, subjectIndex, chapterIndex, topicIndex) {
    const controls = document.createElement('span');
    controls.style.cssText = 'float:right;display:inline-flex;gap:4px';
    const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Rename';
    edit.onclick = event => { event.stopPropagation(); editCurriculumItem(type, subjectIndex, chapterIndex, topicIndex); };
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Delete'; remove.style.background = 'var(--danger)';
    remove.onclick = event => { event.stopPropagation(); deleteCurriculumItem(type, subjectIndex, chapterIndex, topicIndex); };
    controls.append(edit, remove); cell.appendChild(controls);
}
function editCurriculumItem(type, s, c, t) {
    const subject = UPSC_SYLLABUS[s];
    const current = type === 'subject' ? subject.subject : type === 'chapter' ? subject.chapters[c].title : subject.chapters[c].topics[t];
    const next = prompt(`Rename ${type}:`, current)?.trim();
    if (!next || next === current) return;
    if (type === 'subject') {
        const old = subject.subject; subject.subject = next;
        Object.entries(appData.syllabus || {}).forEach(([key, value]) => { if (key.startsWith(`${old}-`)) { appData.syllabus[`${next}${key.slice(old.length)}`] = value; delete appData.syllabus[key]; } });
        if (appData.subjectLog?.[old] !== undefined) { appData.subjectLog[next] = appData.subjectLog[old]; delete appData.subjectLog[old]; }
        (appData.focusChain || []).forEach(step => { if (step.subject === old) step.subject = next; });
    } else if (type === 'chapter') {
        const old = subject.chapters[c].title; subject.chapters[c].title = next;
        subject.chapters[c].topics.forEach(topic => { const oldKey = `${subject.subject}-${old}-${topic}`; if (appData.syllabus?.[oldKey]) { appData.syllabus[`${subject.subject}-${next}-${topic}`] = appData.syllabus[oldKey]; delete appData.syllabus[oldKey]; } });
    } else {
        const chapter = subject.chapters[c], old = chapter.topics[t]; chapter.topics[t] = next;
        const oldKey = `${subject.subject}-${chapter.title}-${old}`; if (appData.syllabus?.[oldKey]) { appData.syllabus[`${subject.subject}-${chapter.title}-${next}`] = appData.syllabus[oldKey]; delete appData.syllabus[oldKey]; }
    }
    saveCurriculum();
}
function deleteCurriculumItem(type, s, c, t) {
    const subject = UPSC_SYLLABUS[s];
    const topics = type === 'subject' ? subject.chapters.flatMap(ch => ch.topics.map(topic => [ch.title, topic])) : type === 'chapter' ? subject.chapters[c].topics.map(topic => [subject.chapters[c].title, topic]) : [[subject.chapters[c].title, subject.chapters[c].topics[t]]];
    const tracked = topics.some(([chapter, topic]) => appData.syllabus?.[`${subject.subject}-${chapter}-${topic}`]);
    const name = type === 'subject' ? subject.subject : type === 'chapter' ? subject.chapters[c].title : subject.chapters[c].topics[t];
    if (!confirm(`Delete ${type} “${name}”${tracked ? ' and its saved progress and notes' : ''}?`)) return;
    topics.forEach(([chapter, topic]) => { delete appData.syllabus?.[`${subject.subject}-${chapter}-${topic}`]; });
    if (type === 'subject') UPSC_SYLLABUS.splice(s, 1);
    else if (type === 'chapter') subject.chapters.splice(c, 1);
    else subject.chapters[c].topics.splice(t, 1);
    saveCurriculum();
}
function cycleStatus(key, btn) { if(!appData.syllabus[key]) appData.syllabus[key] = {status:0, pyq:false, rev:0}; appData.syllabus[key].status = (appData.syllabus[key].status + 1) % 4; btn.className = `status-btn status-${appData.syllabus[key].status}`; saveData(); updateDashboard(); renderSyllabusChart(); }
function togglePYQ(key) { if(!appData.syllabus[key]) appData.syllabus[key]={status:0, rev:0}; appData.syllabus[key].pyq = !appData.syllabus[key].pyq; saveData(); }
function updateRev(key, change, btn) { if (!appData.syllabus[key]) appData.syllabus[key] = { status: 0, pyq: false, rev: 0 }; let val = (appData.syllabus[key].rev || 0) + change; if(val < 0) val = 0; appData.syllabus[key].rev = val; saveData(); btn.parentElement.querySelector('span').innerText = val; }

function renderCalendar() { 
    const grid = document.getElementById('calendarGrid');
    const heading = document.getElementById('monthYearDisplay');
    if (!grid || !heading) return;
    processRecurringTasks();
    const year = currentDate.getFullYear(), month = currentDate.getMonth();
    heading.textContent = currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    grid.replaceChildren();
    const weekdays = appData.preferences?.weekStartsMonday ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    weekdays.forEach(label => {
        const header = document.createElement('div'); header.className = 'day-header'; header.textContent = label; grid.appendChild(header);
    });
    const weekStart = appData.preferences?.weekStartsMonday ? 1 : 0;
    const firstDay = (new Date(year, month, 1).getDay() - weekStart + 7) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) { const blank = document.createElement('div'); blank.className = 'day empty'; grid.appendChild(blank); }
    const today = getTodayDate();
    if (!appData.plans) appData.plans = {};
    for (let day = 1; day <= count; day++) {
        const date = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const plan = appData.plans[date];
        const cell = document.createElement('button');
        cell.type = 'button'; cell.className = `day${date === today ? ' current-day' : ''}${plan ? ' has-plan' : ''}`;
        cell.setAttribute('aria-label', `${date}${plan?.plan ? `: ${plan.plan}` : ''}`);
        cell.onclick = () => openPlanModal(date);
        const number = document.createElement('strong'); number.textContent = day; cell.appendChild(number);
        const tasks = Array.isArray(plan?.tasks) ? plan.tasks : (plan?.plan?.trim() ? [{ text: plan.plan, completed: false }] : []);
        if (tasks.length) {
            const progress = document.createElement('span'); progress.className = 'plan-indicator';
            const complete = tasks.filter(task => task.completed).length;
            progress.textContent = `${complete}/${tasks.length} tasks`;
            cell.appendChild(progress);
            tasks.slice(0, 2).forEach(task => { const label = document.createElement('span'); label.className = 'calendar-task-preview'; label.textContent = `${task.completed ? '✓' : '•'} ${task.text}`; cell.appendChild(label); });
        }
        grid.appendChild(cell);
    }
}
function changeMonth(d) { currentDate.setMonth(currentDate.getMonth()+d); renderCalendar(); }
function goToToday() { currentDate = new Date(); renderCalendar(); }
function openPlanModal(date) {
    document.getElementById('modalDate').textContent = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric', year:'numeric' });
    document.getElementById('planModal').dataset.date = date;
    if (!appData.plans) appData.plans = {};
    if (!appData.plans[date]) appData.plans[date] = { tasks: [] };
    if (!Array.isArray(appData.plans[date].tasks)) appData.plans[date].tasks = appData.plans[date].plan?.trim() ? [{ text: appData.plans[date].plan, completed: false }] : [];
    renderCalendarTasks();
    document.getElementById('calendarTaskInput').value = '';
    document.getElementById('planModal').style.display = 'flex';
}
function renderCalendarTasks() {
    const date = document.getElementById('planModal').dataset.date;
    const list = document.getElementById('calendarTaskList');
    list.replaceChildren();
    (appData.plans[date]?.tasks || []).forEach((task, index) => {
        const item = document.createElement('li'); item.className = 'calendar-task-item';
        const label = document.createElement('label');
        const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = !!task.completed;
        checkbox.onchange = () => { task.completed = checkbox.checked; const shared = appData.goals?.daily?.find(goal => goal.id === task.id); if (shared) shared.completed = task.completed; saveData(); renderCalendarTasks(); renderCalendar(); renderGoals(); };
        const text = document.createElement('span'); text.textContent = task.text; if (task.completed) text.classList.add('completed');
        label.append(checkbox, text);
        const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.onclick = () => { appData.plans[date].tasks.splice(index, 1); if (task.id) appData.goals?.daily && (appData.goals.daily = appData.goals.daily.filter(goal => goal.id !== task.id)); saveData(); renderCalendarTasks(); renderCalendar(); renderGoals(); };
        item.append(label, remove); list.appendChild(item);
    });
    if (!list.children.length) { const empty = document.createElement('li'); empty.className = 'calendar-task-empty'; empty.textContent = 'No tasks planned for this day.'; list.appendChild(empty); }
}
function addCalendarTask() {
    const date = document.getElementById('planModal').dataset.date;
    const input = document.getElementById('calendarTaskInput'); const text = input.value.trim();
    if (!date || !text) return;
    const task = { id:`plan-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, text, completed:false, reminderSent:false };
    appData.plans[date].tasks.push(task);
    if (!appData.goals.daily) appData.goals.daily = [];
    appData.goals.daily.push({ id:task.id, text, completed:false, prio:false, dueDate:date, source:'planner' });
    if (document.getElementById('calendarTaskRepeat').value === 'monthly') {
        if (!appData.recurringTasks) appData.recurringTasks = [];
        appData.recurringTasks.push({ id:`repeat-${task.id}`, text, day:Number(date.slice(-2)), startMonth:date.slice(0,7), active:true });
    }
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    input.value = ''; document.getElementById('calendarTaskRepeat').value='';
    saveData(); renderCalendarTasks(); renderCalendar(); input.focus();
}
function savePlan() { saveData(); closeModal('planModal'); renderCalendar(); }

function processRecurringTasks() {
    if (!appData.recurringTasks) appData.recurringTasks = [];
    if (!appData.plans) appData.plans = {};
    const now = new Date(); const monthKey = currentMonthKey(now); const year=now.getFullYear(), month=now.getMonth();
    appData.recurringTasks.filter(rule => rule.active && rule.startMonth <= monthKey).forEach(rule => {
        const day = Math.min(rule.day, new Date(year,month+1,0).getDate());
        const date = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        if (!appData.plans[date]) appData.plans[date] = { tasks:[] };
        if (!appData.plans[date].tasks.some(task => task.recurrenceId === rule.id)) {
            const task = { id:`${rule.id}-${monthKey}`, recurrenceId:rule.id, text:rule.text, completed:false, reminderSent:false };
            appData.plans[date].tasks.push(task);
            if (!appData.goals.daily) appData.goals.daily=[];
            appData.goals.daily.push({ id:task.id,text:task.text,completed:false,prio:false,dueDate:date,source:'planner' });
            saveData();
        }
    });
}
function checkTaskReminders() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date(); const today=getTodayDate(); let changed=false;
    Object.entries(appData.plans || {}).forEach(([date,plan]) => {
        if (date !== today) return;
        (plan.tasks || []).forEach(task => {
            if (!task.completed && !task.reminderSent) {
                new Notification('Task reminder', { body:task.text }); task.reminderSent=true; changed=true;
            }
        });
    });
    if(changed) saveData();
}

function renderCharts() {
    const color = appData.darkMode?'#fff':'#000';
    if(!appData.subjectLog) appData.subjectLog = {};
    const activeSubjects = Object.keys(appData.subjectLog).filter(k => appData.subjectLog[k] > 0);
    const subLabels = activeSubjects.length ? activeSubjects : ['No Data'];
    const subData = activeSubjects.length ? activeSubjects.map(k => appData.subjectLog[k]) : [1];
    const subColors = activeSubjects.length ? ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ccc'] : ['#374151']; 
    const ctxS = document.getElementById('subjectChart'); 
    if(window.subChart) window.subChart.destroy();
    window.subChart = new Chart(ctxS, { 
        type: 'pie', data: { labels: subLabels, datasets: [{data: subData, backgroundColor: subColors}] }, 
        options: { maintainAspectRatio: false, plugins: { legend: { labels: { color: color } } } } 
    });
    const ctxF = document.getElementById('focusChart'); if(window.focusChart) window.focusChart.destroy();
    const labels=[], data=[]; for(let i=6; i>=0; i--) { const d=new Date(); d.setDate(d.getDate()-i); const dStr=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; labels.push(dStr); data.push(appData.focusLog[dStr]||0); }
    window.focusChart = new Chart(ctxF, { type:'bar', data: { labels:labels, datasets:[{label:'Mins', data:data, backgroundColor:'#2563eb'}] }, options: { maintainAspectRatio: false, scales:{x:{ticks:{color:color}}, y:{ticks:{color:color}}} } });
}

// UPDATE RANK
function updateRank() {
    if (typeof appData.xp === 'undefined' || isNaN(appData.xp)) {
        appData.xp = 0;
    }
    const xp = Number(appData.xp);
    const xpPerLevel = 500;
    const level = Math.floor(xp / xpPerLevel) + 1;
    const currentLevelXP = xp % xpPerLevel;
    const progressPct = (currentLevelXP / xpPerLevel) * 100;

    const lvlEl = document.getElementById('levelDisplay');
    const barEl = document.getElementById('xpBar');

    if(lvlEl) lvlEl.innerText = level;
    if(barEl) barEl.style.width = `${progressPct}%`;
}

// COMPLETION CALCULATOR
function calculateCompletion() { 
    try {
        let total = 0, done = 0; 
        UPSC_SYLLABUS.forEach(s => s.chapters.forEach(c => c.topics.forEach(t => { 
            total++; 
            if(appData.syllabus[`${s.subject}-${c.title}-${t}`]?.status === 3) done++; 
        }))); 
        
        if (total === 0) return "N/A";
        const remaining = total - done; 
        if(remaining <= 0) return "Goal Reached!";
        const daysLeft = Math.ceil(remaining / 3); 
        const targetDate = new Date(); 
        targetDate.setDate(targetDate.getDate() + daysLeft); 
        return targetDate.toDateString(); 
    } catch(e) {
        console.error("Calc Error:", e);
        return "Error";
    }
}

function updateDashboard() {
    const today = getTodayDate();
    document.getElementById('todayFocus').innerText = `${appData.focusLog[today]||0} mins`;
    document.getElementById('todayTasks').innerText = appData.goals.daily ? appData.goals.daily.filter(g=>g.completed).length : 0;
    let total=0, done=0;
    UPSC_SYLLABUS.forEach(s => s.chapters.forEach(c => c.topics.forEach(t => { total++; if(appData.syllabus[`${s.subject}-${c.title}-${t}`]?.status === 3) done++; })));
    document.getElementById('totalCoverage').innerText = total===0? '0%' : `${Math.round((done/total)*100)}%`;
    document.getElementById('completionPredictor').innerText = calculateCompletion();
    updateRank(); 
}


// MISC UTILS
function triggerPanic() { document.getElementById('panicModal').style.display = 'flex'; }
function addDeadTime() { appData.deadTime += 10; document.getElementById('deadTimeDisplay').innerText = `${appData.deadTime}m`; saveData(); }
function renderHydration() { const container = document.getElementById('hydration-tracker'); container.innerHTML = ''; for(let i=0; i<8; i++) { const cls = i < appData.waterCount ? 'filled' : ''; container.innerHTML += `<div class="water-drop ${cls}" onclick="toggleWater(${i})"></div>`; } }
function toggleWater(i) { if(i < appData.waterCount) appData.waterCount = i; else appData.waterCount = i + 1; saveData(); renderHydration(); }
function checkSunset() { const hour = new Date().getHours(); if(hour >= 22 && !appData.darkMode) { toggleTheme(); console.log("Sunset Mode Activated"); } }
function addPen() { appData.pensUsed += 1; document.getElementById('penDisplay').innerText = appData.pensUsed; saveData(); }
function openManifesto() { document.getElementById('manifestoText').value = appData.manifesto || ""; document.getElementById('manifestoModal').style.display = 'flex'; }
function saveManifesto() { appData.manifesto = document.getElementById('manifestoText').value; saveData(); closeModal('manifestoModal'); }


function openCalcModal() { document.getElementById('calcModal').style.display = 'flex'; }

function openAIModal() { const sel = document.getElementById('aiTopic'); sel.innerHTML = '<option value="" disabled selected>Select Topic...</option>'; UPSC_SYLLABUS.forEach(s => s.chapters.forEach(c => c.topics.forEach(t => sel.innerHTML += `<option value="${t}">${t}</option>`))); document.getElementById('aiModal').style.display = 'flex'; }
function generateAIPrompt() { const topic = document.getElementById('aiTopic').value; const mode = document.getElementById('aiMode').value; if(!topic) return; let prompt = ""; if(mode === "explain") prompt = `Explain "${topic}" in simple terms.`; if(mode === "quiz") prompt = `Generate 5 MCQs on "${topic}".`; if(mode === "mains") prompt = `Structure a Mains answer for "${topic}".`; if(mode === "facts") prompt = `Key facts for "${topic}".`; document.getElementById('aiOutput').value = prompt; }
function startMainsTimer() { document.getElementById('focusTime').value = 10; startTimer(); }
function setupAutosave() {
    // This list connects the HTML ID to the App Data variable
    const mappings = [
        { id: 'manifestoText', field: 'manifesto' },
        { id: 'thoughtArea', field: 'thoughts' },
        { id: 'retroWell', field: 'retroWell' }, 
        { id: 'retroBad', field: 'retroBad' },
        { id: 'retroStrat', field: 'retroStrat' },
        { id: 'mainsBody', field: 'tempMainsBody' }
    ];

    mappings.forEach(map => {
        const el = document.getElementById(map.id);
        if (el && el.dataset.autosaveBound !== 'true') {
            el.dataset.autosaveBound = 'true';
            // 1. Load saved text when app opens
            if (appData[map.field]) {
                el.value = appData[map.field];
            }

            // 2. Listen for typing and trigger save
            el.addEventListener('input', () => {
                appData[map.field] = el.value; // Update variable
                triggerAutoSave(); // Call the smart save function
            });
        }
    });
}
function triggerAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(saveData, 500);
}
function exportData() { const notes=Array.isArray(appData.notespaceDB) ? appData.notespaceDB : (window.AppStore ? AppStore.readCollection('notespaceDB',[]) : []); appData.notespaceDB=notes; const payload=window.AppStore ? AppStore.createBackup(appData,notes) : {format:'personal-command-center',version:2,appData,notespaceDB:notes}; const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "Personal_Command_Center_Backup.json"; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
function toggleTheme() { document.body.classList.toggle('dark-mode'); appData.darkMode = !appData.darkMode; saveData(); renderCharts(); }
function copyToClipboard() { document.getElementById("aiOutput").select(); document.execCommand("copy"); alert("Copied!"); }
function saveRetro() { appData.retros.push({date: new Date().toISOString(), well: document.getElementById('retroWell').value, bad: document.getElementById('retroBad').value, strat: document.getElementById('retroStrat').value}); saveData(); alert("Review Locked!"); }

function scanSyllabus() { const text = document.getElementById('scanInput').value.toLowerCase(); const resultDiv = document.getElementById('scanResults'); resultDiv.innerHTML = ''; if(!text) return; const keywords = text.split(' ').filter(w => w.length > 3); let matches = []; UPSC_SYLLABUS.forEach(sub => { sub.chapters.forEach(chap => { let score = 0; keywords.forEach(k => { if(chap.title.toLowerCase().includes(k)) score += 2; }); if(score > 0) matches.push({ subject: sub.subject, chapter: chap.title }); }); }); matches.forEach(m => { resultDiv.innerHTML += `<div>${m.subject} - ${m.chapter}</div>`; }); }

function toggleChapter(id) {
    // 1. Initialize the storage array if missing
    if (!appData.expanded) appData.expanded = [];

    // 2. Add or Remove the Chapter ID from our "Open List"
    const index = appData.expanded.indexOf(id);
    if (index > -1) {
        appData.expanded.splice(index, 1); // It was open, so remove it (Close)
    } else {
        appData.expanded.push(id); // It was closed, so add it (Open)
    }

    // 3. Update the UI instantly
    const rows = document.querySelectorAll('.' + id);
    rows.forEach(e => e.classList.toggle('visible'));
    
    // 4. Save this preference so it stays open next time
    saveData();
}
/* =========================================
   SYLLABUS NOTE & RESOURCE VAULT
   ========================================= */

let currentNoteLinks = []; // Temporary array to hold links while the modal is open

function openNoteModal(k) { 
    const topicName = k.split('-')[2];
    document.getElementById('noteTopicTitle').innerText = topicName; 
    document.getElementById('noteText').value = appData.syllabus[k]?.note || ''; 
    
    // Load existing links
    // Backward compatibility: If an old single 'link' exists, convert it to an array automatically
    if (appData.syllabus[k]?.link && !appData.syllabus[k]?.links) {
        currentNoteLinks = [appData.syllabus[k].link];
    } else {
        currentNoteLinks = appData.syllabus[k]?.links || [];
    }
    
    document.getElementById('noteModal').dataset.key = k; 
    document.getElementById('noteModal').style.display = 'flex'; 
    renderNoteLinks();
}

function addNoteLink() {
    const linkInput = document.getElementById('newNoteLink');
    const url = linkInput.value.trim();
    if (url) {
        currentNoteLinks.push(url); // Add to our temporary array
        linkInput.value = ''; // Clear the input box
        renderNoteLinks(); // Refresh the visual list
    }
}

function removeNoteLink(index) {
    currentNoteLinks.splice(index, 1);
    renderNoteLinks();
}

function renderNoteLinks() {
    const container = document.getElementById('noteLinksContainer');
    container.innerHTML = '';
    
    if(currentNoteLinks.length === 0) {
        container.innerHTML = '<div style="font-size:0.8rem; color:gray; text-align:center; padding:10px;">No links attached yet.</div>';
        return;
    }

    currentNoteLinks.forEach((link, i) => {
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:8px 12px; border-radius:4px; border:1px solid var(--border); font-size:0.85rem;">
                <a href="${link}" target="_blank" style="color:var(--primary); text-decoration:none; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:85%;">
                    <i class="fas fa-external-link-alt" style="margin-right:5px; font-size:0.7rem;"></i> ${link}
                </a>
                <button onclick="removeNoteLink(${i})" style="background:none; color:var(--danger); border:none; padding:0 5px; cursor:pointer;" title="Remove Link">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
}

function saveNote() { 
    const k = document.getElementById('noteModal').dataset.key; 
    
    // Ensure the data structure exists for this topic
    if(!appData.syllabus[k]) {
        appData.syllabus[k] = { status:0, pyq:false, rev:0 }; 
    }
    
    // Save text and the new array of links
    appData.syllabus[k].note = document.getElementById('noteText').value; 
    appData.syllabus[k].links = [...currentNoteLinks]; 
    
    // Cleanup the old variable if it existed to keep the database clean
    if (appData.syllabus[k].link) {
        delete appData.syllabus[k].link;
    }
    
    saveData(); 
    document.getElementById('noteModal').style.display = 'none'; 
    renderSyllabus(); // Refresh the syllabus table to show the yellow sticky note icon
}
function closeModal(id) { document.getElementById(id).style.display='none'; }

function checkNewsReset() { const t=getTodayDate(); if(appData.news.date!==t) appData.news={date:t,hindu:false,edit:false,mag:false}; document.getElementById('news-hindu').checked=appData.news.hindu; document.getElementById('news-edit').checked=appData.news.edit; document.getElementById('news-mag').checked=appData.news.mag; }
function toggleNews(k) { appData.news[k]=document.getElementById(`news-${k}`).checked; saveData(); }
function renderHeatmap() { const d=document.getElementById('heatmap'); d.innerHTML=''; for(let i=364; i>=0; i--){ const dt=new Date(); dt.setDate(dt.getDate()-i); const dStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; const m=appData.focusLog[dStr]||0; let c=''; if(m>0)c='heat-1'; if(m>60)c='heat-2'; if(m>180)c='heat-3'; d.innerHTML+=`<div class="heat-box ${c}" title="${m}m"></div>`; } }
function addFlashcard() { const f = document.getElementById('fcFront').value; const b = document.getElementById('fcBack').value; if(f && b) { appData.flashcards.push({front: f, back: b}); document.getElementById('fcFront').value = ''; document.getElementById('fcBack').value = ''; saveData(); renderFlashcard(); alert("Card Added!"); } }

window.onclick = e => { if(e.target.classList.contains('modal')) e.target.style.display='none'; }
// ==========================================
// NEW LIFE APPS (Dojo & Tribe)
// ==========================================

// --- THE DOJO (Fitness) ---
function renderDojo() {
    const container = document.getElementById('dojoLog');
    if (!container) return; // Stop if HTML is missing
    container.innerHTML = '';
    
    if (!appData.dojo) appData.dojo = [];
    
    // Show last 5 workouts (newest first)
    appData.dojo.slice().reverse().slice(0, 5).forEach((item, i) => {
        const date = new Date(item.date).toLocaleDateString();
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border);">
                <span><b>${item.ex}</b>: ${item.reps}</span>
                <span style="color:gray; font-size:0.8rem;">${date}</span>
            </div>
        `;
    });
}

function logExercise() {
    const ex = document.getElementById('exerciseInput').value;
    const reps = document.getElementById('repsInput').value;
    if (ex) {
        if (!appData.dojo) appData.dojo = [];
        appData.dojo.push({ ex: ex, reps: reps, date: Date.now() });
        
        document.getElementById('exerciseInput').value = '';
        document.getElementById('repsInput').value = '';
        saveData();
        renderDojo();
    }
}

// --- THE TRIBE (Relationships) ---
function renderTribe() {
    const container = document.getElementById('tribeList');
    if (!container) return;
    container.innerHTML = '';
    
    if (!appData.tribe) appData.tribe = [];
    
    const due=appData.tribe.filter(p => Math.floor((Date.now()-(p.lastContact||0))/86400000) >= Number(p.freq||7)).length;
    const summary=document.getElementById('tribeSummary'); if(summary) summary.textContent=due ? `${due} check-in${due===1?'':'s'} due` : 'All caught up';
    appData.tribe.forEach((p, i) => {
        // Calculate days since last contact
        const last = p.lastContact || 0;
        const diff = Date.now() - last;
        const daysAgo = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        // Green if recent, Red if overdue
        const isOverdue = daysAgo >= Number(p.freq || 7);
        const color = isOverdue ? 'var(--danger)' : 'var(--success)';
        const status = isOverdue ? `Call! (${daysAgo}d)` : `${daysAgo}d ago`;
        
        container.innerHTML += `<article class="tribe-person ${isOverdue?'due':''}"><button type="button" class="tribe-delete" onclick="deletePerson(${i})" aria-label="Remove ${p.name}">&times;</button><span class="tribe-relation">${p.relationship || 'Friend'}</span><h3>${p.name}</h3><p class="tribe-status" style="color:${color}">${status} · every ${p.freq || 7}d</p>${p.note ? `<p class="tribe-note">${p.note}</p>` : ''}<button type="button" onclick="contactPerson(${i})">Mark contacted</button></article>`;
    });
}

function addPerson() {
    const name = document.getElementById('personInput').value.trim();
    const freq = Math.max(1, Number(document.getElementById('freqInput').value || 7));
    const relationship=document.getElementById('tribeRelationship')?.value || 'Friend';
    const note=document.getElementById('tribeNote')?.value.trim() || '';
    if (name) {
        if (!appData.tribe) appData.tribe = [];
        appData.tribe.push({ name, freq, relationship, note, lastContact: Date.now() });
        
        document.getElementById('personInput').value = '';
        document.getElementById('tribeNote').value = '';
        saveData();
        renderTribe();
    }
}

function contactPerson(index) {
    appData.tribe[index].lastContact = Date.now();
    saveData();
    renderTribe();
}

function deletePerson(index) {
    if(confirm("Remove this person?")) {
        appData.tribe.splice(index, 1);
        saveData();
        renderTribe();
    }
}
// --- THE LEDGER (Lent/Borrowed) ---
function addToLedger() {
    const type = document.getElementById('ledgerType').value;
    const amount = Number(document.getElementById('ledgerAmount').value);
    const person = document.getElementById('ledgerPerson').value.trim();
    const description = document.getElementById('ledgerItem').value.trim();
    const date = document.getElementById('ledgerDate').value || getTodayDate();
    const category = document.getElementById('ledgerCategory').value;
    const repeat = document.getElementById('ledgerRepeat').value;
    if (!Number.isFinite(amount) || amount <= 0 || !description) return alert('Enter a valid amount and description.');
    if (!appData.ledger) appData.ledger = [];
    const transaction = { id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, type, amount, person, description, category, date, settled:false, repayments:[] };
    appData.ledger.unshift(transaction);
    if (type === 'expense') mirrorLedgerExpense(transaction);
    if (repeat === 'monthly') {
        if (!appData.recurringTransactions) appData.recurringTransactions = [];
        appData.recurringTransactions.push({ id: `repeat-${transaction.id}`, type, amount, person, description, category, startDate: nextMonthStart(date), active:true });
    }
    ['ledgerAmount','ledgerPerson','ledgerItem'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('ledgerRepeat').value = '';
    document.getElementById('ledgerDate').value = getTodayDate();
    saveData(); renderLedger();
}
function nextMonthStart(dateString) { const date = new Date(`${dateString}T12:00:00`); return `${date.getFullYear() + (date.getMonth() === 11 ? 1 : 0)}-${String((date.getMonth()+1)%12+1).padStart(2,'0')}-01`; }
function ensureRecurringTransactions() {
    if (!appData.recurringTransactions) appData.recurringTransactions = [];
    if (!appData.ledger) appData.ledger = [];
    const now = new Date(); const currentKey = currentMonthKey(now); let generatedAny = false;
    appData.recurringTransactions.filter(rule => rule.active).forEach(rule => {
        let cursor = rule.startDate.slice(0,7);
        while (cursor <= currentKey) {
            const [year,month] = cursor.split('-').map(Number);
            const date = `${cursor}-01`;
            const exists = appData.ledger.some(entry => entry.recurringId === rule.id && entry.date.slice(0,7) === cursor);
            if (!exists && date <= getTodayDate()) {
                const generated = { ...rule, id:`${rule.id}-${cursor}`, recurringId:rule.id, date, settled:false, repayments:[] };
                appData.ledger.unshift(generated);
                if (generated.type === 'expense') mirrorLedgerExpense(generated);
                generatedAny = true;
            }
            cursor = currentMonthKey(new Date(year, month, 1));
        }
    });
    if (generatedAny) saveData();
}
function mirrorLedgerExpense(entry) {
    if (!appData.treasury) appData.treasury = {budget:0,expenses:[]};
    if (!appData.treasury.expenses.some(expense => expense.sourceLedgerId === entry.id)) appData.treasury.expenses.unshift({ amt:entry.amount, desc:entry.description, date:entry.date, sourceLedgerId:entry.id });
}

function renderLedger() {
    const container = document.getElementById('ledgerList');
    if(!container) return;
    if(!appData.ledger) appData.ledger = [];
    ensureRecurringTransactions();
    appData.ledger.forEach(entry => {
        if (entry.amount !== undefined) return;
        const parsed = Number(String(entry.item || '').replace(/[^\d.-]/g,'')) || 0;
        entry.amount = parsed; entry.description = entry.item || 'Previous entry'; entry.person ||= '';
        entry.type = entry.type === 'gave' ? 'lent' : 'borrowed';
        const parsedDate = new Date(entry.date);
        entry.date = Number.isNaN(parsedDate.getTime()) ? getTodayDate() : `${parsedDate.getFullYear()}-${String(parsedDate.getMonth()+1).padStart(2,'0')}-${String(parsedDate.getDate()).padStart(2,'0')}`;
        entry.settled = false;
        entry.repayments = [];
    });
    const now = new Date();
    const monthInput = document.getElementById('ledgerMonth');
    if (monthInput && !monthInput.value) monthInput.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const dateInput = document.getElementById('ledgerDate');
    if (dateInput && !dateInput.value) dateInput.value = getTodayDate();
    const month = monthInput?.value || '';
    const query = (document.getElementById('ledgerSearch')?.value || '').trim().toLowerCase();
    const monthly = appData.ledger.filter(entry => (entry.date || '').startsWith(month));
    const total = type => monthly.filter(entry => entry.type === type).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const money = formatCurrency;
    document.getElementById('ledgerIncome').textContent = money(total('income'));
    document.getElementById('ledgerExpenses').textContent = money(total('expense'));
    const net = total('income') - total('expense');
    document.getElementById('ledgerNet').textContent = money(net);
    document.getElementById('ledgerNet').className = net < 0 ? 'negative' : 'positive';
    const balances = new Map();
    appData.ledger.filter(entry => !entry.settled && ['lent','borrowed'].includes(entry.type)).forEach(entry => {
        const name = entry.person || 'Unspecified';
        balances.set(name, (balances.get(name) || 0) + ledgerRemaining(entry) * (entry.type === 'lent' ? 1 : -1));
    });
    const people = document.getElementById('ledgerPeople'); people.replaceChildren();
    const balanceValues = [...balances.values()];
    document.getElementById('ledgerOutstanding').textContent = money(balanceValues.reduce((sum, value) => sum + value, 0));
    if (!balances.size) people.innerHTML = '<p class="ledger-empty">No outstanding balances.</p>';
    else balances.forEach((balance, name) => { const row = document.createElement('div'); row.className='ledger-person-row'; const who=document.createElement('strong'); who.textContent=name; const amount=document.createElement('span'); amount.textContent=balance >= 0 ? `Owes you ${money(balance)}` : `You owe ${money(Math.abs(balance))}`; row.append(who,amount); people.appendChild(row); });
    container.replaceChildren();
    const entries = appData.ledger.filter(entry => (!month || (entry.date || '').startsWith(month)) && (!query || `${entry.person} ${entry.description}`.toLowerCase().includes(query)));
    renderLedgerCategoryChart(monthly);
    renderRecurringRules();
    if (!entries.length) { container.innerHTML = '<p class="ledger-empty">No matching transactions for this month.</p>'; return; }
    entries.forEach(entry => {
        const row=document.createElement('article'); row.className=`ledger-transaction type-${entry.type}${entry.settled?' is-settled':''}`;
        const details=document.createElement('div'); details.className='ledger-transaction-details';
        const title=document.createElement('strong'); title.textContent=entry.description || 'Transaction';
        const repaymentTotal = (entry.repayments || []).reduce((sum,repayment) => sum + Number(repayment.amount || 0),0);
        const meta=document.createElement('small'); meta.textContent=`${entry.date} · ${entry.person || 'No person'} · ${entry.category || 'General'}${repaymentTotal ? ` · repaid ${formatCurrency(repaymentTotal)}` : ''}`;
        details.append(title,meta);
        const amount=document.createElement('strong'); amount.className='ledger-amount'; amount.textContent=`${['expense','borrowed'].includes(entry.type)?'−':'+'}${money(Number(entry.amount)||0)}`;
        const badge=document.createElement('span'); badge.className='ledger-type-label'; badge.textContent=`${entry.type}${entry.settled?' · settled':''}`;
        const controls=document.createElement('div'); controls.className='ledger-transaction-controls';
        if(['lent','borrowed'].includes(entry.type) && !entry.settled && ledgerRemaining(entry)>0){const repay=document.createElement('button'); repay.textContent='Add repayment'; repay.onclick=()=>addLedgerRepayment(appData.ledger.indexOf(entry)); controls.appendChild(repay);}
        const remove=document.createElement('button'); remove.textContent='Delete'; remove.onclick=()=>deleteLedgerEntry(appData.ledger.indexOf(entry)); controls.appendChild(remove);
        row.append(details,amount,badge,controls); container.appendChild(row);
    });
}

function settleLedger(index) {
    const entry = appData.ledger[index];
    if (!entry || !confirm('Mark this balance as settled? The transaction will remain in your history.')) return;
    entry.settled = true; entry.settledDate = getTodayDate(); saveData(); renderLedger();
}
function ledgerRemaining(entry) { return Math.max(0, Number(entry.amount || 0) - (entry.repayments || []).reduce((sum, item) => sum + Number(item.amount || 0), 0)); }
function addLedgerRepayment(index) {
    const entry = appData.ledger[index]; if (!entry) return;
    const value = Number(prompt(`Remaining balance: ₹${ledgerRemaining(entry)}. Enter repayment amount:`));
    if (!Number.isFinite(value) || value <= 0 || value > ledgerRemaining(entry)) return alert('Enter a repayment greater than zero and no more than the remaining balance.');
    if (!entry.repayments) entry.repayments = [];
    entry.repayments.push({ amount:value, date:getTodayDate() });
    if (ledgerRemaining(entry) === 0) entry.settled = true;
    saveData(); renderLedger();
}
function deleteLedgerEntry(index) {
    if (!appData.ledger[index] || !confirm('Delete this transaction permanently?')) return;
    appData.ledger.splice(index,1); saveData(); renderLedger();
}
function renderLedgerCategoryChart(entries) {
    const canvas = document.getElementById('ledgerCategoryChart'); if (!canvas || typeof Chart === 'undefined') return;
    const totals = new Map();
    entries.filter(entry => entry.type === 'expense').forEach(entry => totals.set(entry.category || 'General', (totals.get(entry.category || 'General') || 0) + Number(entry.amount || 0)));
    if (window.ledgerCategoryChart) window.ledgerCategoryChart.destroy();
    const labels = [...totals.keys()];
    window.ledgerCategoryChart = new Chart(canvas, { type:'doughnut', data:{ labels:labels.length ? labels : ['No expenses'], datasets:[{data:labels.length ? [...totals.values()] : [1], backgroundColor:['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#64748b','#ec4899','#84cc16']}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}} });
}
function renderRecurringRules() {
    const list = document.getElementById('recurringList'); if (!list) return;
    list.replaceChildren();
    (appData.recurringTransactions || []).forEach((rule,index) => {
        const row=document.createElement('div'); row.className='ledger-person-row';
        const label=document.createElement('span'); label.textContent=`${rule.description} · ${rule.category || 'General'} · ${formatCurrency(rule.amount)} monthly`;
        const toggle=document.createElement('button'); toggle.textContent=rule.active ? 'Pause' : 'Resume'; toggle.onclick=()=>{rule.active=!rule.active;saveData();renderLedger();};
        const remove=document.createElement('button'); remove.textContent='Remove'; remove.onclick=()=>{appData.recurringTransactions.splice(index,1);saveData();renderLedger();};
        row.append(label,toggle,remove); list.appendChild(row);
    });
    if (!list.children.length) list.innerHTML='<p class="ledger-empty">No recurring transactions yet.</p>';
}
// --- YEAR COMPASS ---
function renderYearCompass() {
    const grid = document.getElementById('weeksGrid');
    const percentDisplay = document.getElementById('yearPercent');
    if(!grid) return;
    
    grid.innerHTML = '';
    
    // 1. Calculate Time
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1); // Jan 1st
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // 2. Calculate Percentage
    const percent = ((dayOfYear / 365) * 100).toFixed(1);
    percentDisplay.innerText = `${percent}%`;
    
    // 3. Render 52 Weeks
    const currentWeek = Math.floor(dayOfYear / 7); // 0 to 51
    
    for(let i = 0; i < 52; i++) {
        let style = '';
        let title = `Week ${i+1}`;
        
        if (i < currentWeek) {
            // Past: Faded Gray
            style = 'background:var(--text); opacity:0.2;'; 
            title += " (Gone)";
        } else if (i === currentWeek) {
            // Present: Bright Primary Color
            style = 'background:var(--primary); box-shadow: 0 0 10px var(--primary); transform:scale(1.2);'; 
            title += " (Now)";
        } else {
            // Future: Empty Border
            style = 'border:1px solid var(--border);'; 
            title += " (Remaining)";
        }
        
        grid.innerHTML += `<div title="${title}" style="height:15px; border-radius:3px; ${style}"></div>`;
    }
}
// --- EVENTS (Countdown) ---
function addEvent() {
    const name = document.getElementById('eventName').value;
    const date = document.getElementById('eventDate').value;

    if(name && date) {
        if(!appData.events) appData.events = [];
        appData.events.push({ name, date });
        document.getElementById('eventName').value = '';
        saveData();
        renderEvents();
    }
}

function renderEvents() {
    const container = document.getElementById('eventList');
    if(!container) return;
    container.innerHTML = '';

    if(!appData.events) appData.events = [];

    // Sort by date (Soonest event comes first)
    appData.events.sort((a, b) => new Date(a.date) - new Date(b.date));

    appData.events.forEach((e, i) => {
        const target = new Date(e.date);
        const now = new Date();
        
        // Calculate difference in time
        const diff = target - now;
        // Convert to days (rounding up)
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        let statusHtml = '';
        let color = 'var(--primary)';

        if(days < 0) {
            statusHtml = `<span style="color:gray;">Done (${Math.abs(days)}d ago)</span>`;
            color = 'gray';
        } else if (days === 0) {
            statusHtml = `<span style="color:var(--danger); font-weight:bold;">TODAY!</span>`;
            color = 'var(--danger)';
        } else {
            statusHtml = `<span style="font-size:1.5rem; font-weight:bold; color:var(--primary);">${days}</span> <small>Days Left</small>`;
        }

        container.innerHTML += `
            <div style="background:var(--bg); border-left:4px solid ${color}; padding:15px; border-radius:4px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                <div>
                    <div style="font-weight:bold; font-size:1.1rem;">${e.name}</div>
                    <div style="font-size:0.8rem; opacity:0.7;">${target.toDateString()}</div>
                </div>
                <div style="text-align:right;">
                    <div>${statusHtml}</div>
                    <button onclick="deleteEvent(${i})" style="font-size:0.7rem; color:red; background:none; border:none; cursor:pointer; margin-top:5px;">Remove</button>
                </div>
            </div>
        `;
    });
}

function deleteEvent(i) {
    if(confirm("Delete this countdown?")) {
        appData.events.splice(i, 1);
        saveData();
        renderEvents();
    }
}// --- IDENTITY (My Numbers) ---
function addIdentity() {
    const label = document.getElementById('idLabel').value;
    const val = document.getElementById('idValue').value;

    if(label && val) {
        if(!appData.identity) appData.identity = [];
        appData.identity.push({ label, val });
        
        document.getElementById('idLabel').value = '';
        document.getElementById('idValue').value = '';
        saveData();
        renderIdentity();
    }
}

function renderIdentity() {
    const container = document.getElementById('identityList');
    if(!container) return;
    container.innerHTML = '';

    if(!appData.identity) appData.identity = [];

    appData.identity.forEach((item, i) => {
        container.innerHTML += `
            <div style="background:var(--bg); border:1px solid var(--border); padding:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <div style="overflow:hidden;">
                    <div style="font-size:0.8rem; color:gray; text-transform:uppercase; letter-spacing:1px;">${item.label}</div>
                    <div style="font-weight:bold; font-size:1.1rem; font-family:monospace;">${item.val}</div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="copyIdentity('${item.val}')" style="background:var(--primary); padding:5px 10px; font-size:0.9rem;" title="Copy"><i class="fas fa-copy"></i></button>
                    <button onclick="deleteIdentity(${i})" style="background:none; color:red; border:none;">&times;</button>
                </div>
            </div>
        `;
    });
}

function deleteIdentity(i) {
    if(confirm("Delete this ID?")) {
        appData.identity.splice(i, 1);
        saveData();
        renderIdentity();
    }
}

function copyIdentity(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied: " + text);
    });
}// --- MOOD GRID ---
function logMood(rating) {
    if(!appData.moods) appData.moods = {};
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    appData.moods[today] = rating;
    saveData();
    renderMood();
}

function renderMood() {
    const container = document.getElementById('moodGrid');
    if(!container) return;
    container.innerHTML = '';
    
    if(!appData.moods) appData.moods = {};
    
    // Generate last 30 days
    for(let i=29; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const rating = appData.moods[dateKey] || 0;
        
        let color = 'var(--bg)'; // Default (Empty)
        if(rating === 1) color = '#ef4444'; // Red
        if(rating === 2) color = '#f97316'; // Orange
        if(rating === 3) color = '#eab308'; // Yellow
        if(rating === 4) color = '#84cc16'; // Light Green
        if(rating === 5) color = '#22c55e'; // Green
        
        // Border for "Today"
        const border = (i === 0) ? 'border: 2px solid var(--text);' : 'border: 1px solid var(--border);';
        
        container.innerHTML += `
            <div title="${dateKey}: ${rating}/5" style="aspect-ratio:1; background:${color}; border-radius:4px; ${border}"></div>
        `;
    }
}


// --- NOT-TO-DO LIST ---
function addNotToDo() {
    const text = document.getElementById('ntdInput').value;
    if(text) {
        if(!appData.nottodo) appData.nottodo = [];
        appData.nottodo.push({ text: text, lastCheck: null, streak: 0 });
        document.getElementById('ntdInput').value = '';
        saveData();
        renderNotToDo();
    }
}

function renderNotToDo() {
    const container = document.getElementById('ntdList');
    if(!container) return;
    container.innerHTML = '';
    
    if(!appData.nottodo) appData.nottodo = [];
    
    const todayStr = new Date().toDateString();

    appData.nottodo.forEach((item, i) => {
        const isDoneToday = item.lastCheck === todayStr;
        const btnColor = isDoneToday ? 'var(--success)' : 'var(--bg)';
        const btnText = isDoneToday ? 'Success!' : 'I avoided this today';
        
        container.innerHTML += `
            <div style="background:var(--bg); padding:15px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; border:1px solid var(--border);">
                <div>
                    <div style="font-weight:bold; color:var(--danger);"><i class="fas fa-ban"></i> ${item.text}</div>
                    <div style="font-size:0.8rem; color:gray;">Streak: <span style="color:var(--text); font-weight:bold;">${item.streak} days</span></div>
                </div>
                <div style="text-align:right;">
                     <button onclick="checkNotToDo(${i})" style="font-size:0.8rem; padding:5px 10px; background:${btnColor}; border:1px solid var(--border);">${btnText}</button>
                     <div onclick="deleteNotToDo(${i})" style="font-size:0.7rem; color:red; margin-top:5px; cursor:pointer;">Remove</div>
                </div>
            </div>
        `;
    });
}

function checkNotToDo(i) {
    const todayStr = new Date().toDateString();
    // Only allow checking if not already done today
    if(appData.nottodo[i].lastCheck !== todayStr) {
        appData.nottodo[i].lastCheck = todayStr;
        appData.nottodo[i].streak += 1;
        saveData();
        renderNotToDo();
        
        // Celebration effect
        alert("Good job! Discipline +1");
    }
}

function deleteNotToDo(i) {
    if(confirm("Remove this rule?")) {
        appData.nottodo.splice(i, 1);
        saveData();
        renderNotToDo();
    }
}
// ==========================================
// NEW APP: MEMO
// ==========================================

function renderMemo() {
    const container = document.getElementById('memoList');
    if (!container) return;
    container.innerHTML = '';

    // 1. Initialize data if it doesn't exist
    if (!appData.memos) appData.memos = [];

    // 2. Loop through data and create HTML
    appData.memos.forEach((item, index) => {
        container.innerHTML += `
            <div style="background:var(--bg); padding:10px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; border:1px solid var(--border);">
                <span>${item.text}</span>
                <button onclick="deleteMemo(${index})" style="color:red; background:none; padding:5px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
}

function addMemo() {
    const input = document.getElementById('memoInput');
    const text = input.value;
    
    if (text) {
        if (!appData.memos) appData.memos = [];
        
        // Add new item to array
        appData.memos.push({ text: text, date: new Date().toISOString() });
        
        input.value = ''; // Clear input
        saveData();       // Save to Firebase/Local
        renderMemo();     // Refresh screen
    }
}

function deleteMemo(index) {
    if (confirm("Delete this memo?")) {
        appData.memos.splice(index, 1); // Remove item
        saveData();
        renderMemo();
    }
}
// ==========================================
// APP: MAP MASTER ULTRA
// ==========================================

// 1. MASSIVE DATASET
const MM_DATA = [
    // --- INDIA CAPITALS ---
    { n: "New Delhi", lat: 28.6139, lng: 77.2090, cat: "india_cap" },
    { n: "Mumbai", lat: 19.0760, lng: 72.8777, cat: "india_cap" },
    { n: "Chennai", lat: 13.0827, lng: 80.2707, cat: "india_cap" },
    { n: "Kolkata", lat: 22.5726, lng: 88.3639, cat: "india_cap" },
    { n: "Bengaluru", lat: 12.9716, lng: 77.5946, cat: "india_cap" },
    { n: "Hyderabad", lat: 17.3850, lng: 78.4867, cat: "india_cap" },
    { n: "Gandhinagar", lat: 23.2156, lng: 72.6369, cat: "india_cap" },
    { n: "Jaipur", lat: 26.9124, lng: 75.7873, cat: "india_cap" },
    { n: "Lucknow", lat: 26.8467, lng: 80.9462, cat: "india_cap" },
    { n: "Bhopal", lat: 23.2599, lng: 77.4126, cat: "india_cap" },
    { n: "Patna", lat: 25.5941, lng: 85.1376, cat: "india_cap" },
    { n: "Ranchi", lat: 23.3441, lng: 85.3096, cat: "india_cap" },
    { n: "Raipur", lat: 21.2514, lng: 81.6296, cat: "india_cap" },
    { n: "Chandigarh", lat: 30.7333, lng: 76.7794, cat: "india_cap" },
    { n: "Shimla", lat: 31.1048, lng: 77.1734, cat: "india_cap" },
    { n: "Srinagar", lat: 34.0837, lng: 74.7973, cat: "india_cap" },
    { n: "Leh", lat: 34.1526, lng: 77.5770, cat: "india_cap" },
    { n: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366, cat: "india_cap" },
    { n: "Dispur", lat: 26.1433, lng: 91.7898, cat: "india_cap" },
    { n: "Itanagar", lat: 27.0844, lng: 93.6053, cat: "india_cap" },
    { n: "Kohima", lat: 25.6751, lng: 94.1086, cat: "india_cap" },
    { n: "Imphal", lat: 24.8170, lng: 93.9368, cat: "india_cap" },
    { n: "Aizawl", lat: 23.7271, lng: 92.7176, cat: "india_cap" },
    { n: "Agartala", lat: 23.8315, lng: 91.2868, cat: "india_cap" },
    { n: "Shillong", lat: 25.5788, lng: 91.8933, cat: "india_cap" },
    { n: "Gangtok", lat: 27.3389, lng: 88.6065, cat: "india_cap" },
    { n: "Bhubaneswar", lat: 20.2961, lng: 85.8245, cat: "india_cap" },
    { n: "Panaji", lat: 15.4909, lng: 73.8278, cat: "india_cap" },
    { n: "Amaravati", lat: 16.5062, lng: 80.5226, cat: "india_cap" },
    { n: "Dehradun", lat: 30.3165, lng: 78.0322, cat: "india_cap" },

    // --- INDIA PHYSICAL (Rivers/Lakes) ---
    { n: "Ganga (Origin/Devprayag)", lat: 30.1459, lng: 78.5986, cat: "india_phy" },
    { n: "Yamuna (Delhi stretch)", lat: 28.6100, lng: 77.2800, cat: "india_phy" },
    { n: "Godavari (Delta)", lat: 16.7320, lng: 82.2079, cat: "india_phy" },
    { n: "Krishna River (Vijayawada)", lat: 16.5000, lng: 80.6000, cat: "india_phy" },
    { n: "Kaveri (Delta)", lat: 11.1300, lng: 79.8000, cat: "india_phy" },
    { n: "Narmada (Marble Rocks)", lat: 23.1200, lng: 79.8000, cat: "india_phy" },
    { n: "Brahmaputra (Guwahati)", lat: 26.1800, lng: 91.7300, cat: "india_phy" },
    { n: "Chilika Lake", lat: 19.6500, lng: 85.3000, cat: "india_phy" },
    { n: "Dal Lake", lat: 34.1100, lng: 74.8700, cat: "india_phy" },
    { n: "Loktak Lake", lat: 24.5500, lng: 93.8000, cat: "india_phy" },
    { n: "Vembanad Lake", lat: 9.6000, lng: 76.3800, cat: "india_phy" },
    { n: "Sambhar Lake", lat: 26.9000, lng: 75.1000, cat: "india_phy" },
    { n: "Thar Desert", lat: 26.8000, lng: 71.0000, cat: "india_phy" },
    { n: "Kanchenjunga", lat: 27.7025, lng: 88.1475, cat: "india_phy" },
    { n: "Nanda Devi", lat: 30.3753, lng: 79.9705, cat: "india_phy" },

    // --- WORLD CAPITALS ---
    { n: "Washington DC, USA", lat: 38.9072, lng: -77.0369, cat: "world_cap" },
    { n: "London, UK", lat: 51.5074, lng: -0.1278, cat: "world_cap" },
    { n: "Paris, France", lat: 48.8566, lng: 2.3522, cat: "world_cap" },
    { n: "Berlin, Germany", lat: 52.5200, lng: 13.4050, cat: "world_cap" },
    { n: "Moscow, Russia", lat: 55.7558, lng: 37.6173, cat: "world_cap" },
    { n: "Beijing, China", lat: 39.9042, lng: 116.4074, cat: "world_cap" },
    { n: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, cat: "world_cap" },
    { n: "Canberra, Australia", lat: -35.2809, lng: 149.1300, cat: "world_cap" },
    { n: "Ottawa, Canada", lat: 45.4215, lng: -75.6972, cat: "world_cap" },
    { n: "Brasilia, Brazil", lat: -15.7975, lng: -47.8919, cat: "world_cap" },
    { n: "Buenos Aires, Argentina", lat: -34.6037, lng: -58.3816, cat: "world_cap" },
    { n: "Cairo, Egypt", lat: 30.0444, lng: 31.2357, cat: "world_cap" },
    { n: "Abuja, Nigeria", lat: 9.0765, lng: 7.3986, cat: "world_cap" },
    { n: "Pretoria, South Africa", lat: -25.7479, lng: 28.2293, cat: "world_cap" },
    { n: "Nairobi, Kenya", lat: -1.2921, lng: 36.8219, cat: "world_cap" },
    { n: "Riyadh, Saudi Arabia", lat: 24.7136, lng: 46.6753, cat: "world_cap" },
    { n: "Tehran, Iran", lat: 35.6892, lng: 51.3890, cat: "world_cap" },
    { n: "Jakarta, Indonesia", lat: -6.2088, lng: 106.8456, cat: "world_cap" },
    { n: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018, cat: "world_cap" },
    { n: "Hanoi, Vietnam", lat: 21.0285, lng: 105.8542, cat: "world_cap" },
    { n: "Seoul, South Korea", lat: 37.5665, lng: 126.9780, cat: "world_cap" },
    { n: "Rome, Italy", lat: 41.9028, lng: 12.4964, cat: "world_cap" },
    { n: "Madrid, Spain", lat: 40.4168, lng: -3.7038, cat: "world_cap" },
    { n: "Ankara, Turkey", lat: 39.9334, lng: 32.8597, cat: "world_cap" },

    // --- WORLD PHYSICAL (Rivers, Deserts, Mountains) ---
    { n: "Nile River (Delta)", lat: 30.1700, lng: 31.1000, cat: "world_phy" },
    { n: "Amazon River (Mouth)", lat: -0.1700, lng: -49.0000, cat: "world_phy" },
    { n: "Mississippi River (Delta)", lat: 29.1500, lng: -89.2500, cat: "world_phy" },
    { n: "Yangtze River", lat: 31.2300, lng: 121.4700, cat: "world_phy" },
    { n: "Danube River", lat: 45.2000, lng: 29.6000, cat: "world_phy" },
    { n: "Volga River", lat: 46.0000, lng: 48.0000, cat: "world_phy" },
    { n: "Sahara Desert", lat: 23.0000, lng: 12.0000, cat: "world_phy" },
    { n: "Gobi Desert", lat: 42.0000, lng: 105.0000, cat: "world_phy" },
    { n: "Kalahari Desert", lat: -23.0000, lng: 22.0000, cat: "world_phy" },
    { n: "Atacama Desert", lat: -23.0000, lng: -69.0000, cat: "world_phy" },
    { n: "Mt Everest", lat: 27.9881, lng: 86.9250, cat: "world_phy" },
    { n: "Mt Kilimanjaro", lat: -3.0674, lng: 37.3556, cat: "world_phy" },
    { n: "Mt Aconcagua (Andes)", lat: -32.6532, lng: -70.0109, cat: "world_phy" },
    { n: "Mt Denali (Alaska)", lat: 63.0692, lng: -151.0070, cat: "world_phy" },
    { n: "Mt Elbrus", lat: 43.3499, lng: 42.4453, cat: "world_phy" },
    { n: "Mont Blanc (Alps)", lat: 45.8326, lng: 6.8652, cat: "world_phy" },
    { n: "Great Barrier Reef", lat: -18.2871, lng: 147.6992, cat: "world_phy" }
];

let quizMap, currentTarget, quizMarker, lineLayer;
let quizScore = 0;
let quizActive = false;

function initQuizMap() {
    if(quizMap) return;
    
    // Default view: Center of the World
    quizMap = L.map('quizMap').setView([20, 0], 2);
    
    // Satellite/Dark Style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { 
        attribution: '© OpenStreetMap', 
        maxZoom: 10, minZoom: 2, noWrap: true
    }).addTo(quizMap);

    quizMap.on('click', handleMapClick);
}

function startMapRound() {
    // 1. Clear previous
    if(quizMarker) quizMap.removeLayer(quizMarker);
    if(lineLayer) quizMap.removeLayer(lineLayer);
    document.getElementById('mmResult').style.display = 'none';
    
    // 2. Filter by Category
    const cat = document.getElementById('mmCategory').value;
    let pool = MM_DATA;
    
    if(cat !== 'all') {
        pool = MM_DATA.filter(i => i.cat === cat);
    }
    
    if(pool.length === 0) { alert("No locations in this category!"); return; }

    // 3. Pick Random
    const randomIndex = Math.floor(Math.random() * pool.length);
    currentTarget = pool[randomIndex];
    quizActive = true;

    // 4. Update UI
    document.getElementById('mmQuestion').innerText = currentTarget.n;
    
    // Zoom out if world mode, zoom in if India mode
    if(cat.includes('india')) {
        quizMap.setView([22.5, 78.9], 4);
    } else {
        quizMap.setView([20, 0], 2);
    }
}

function handleMapClick(e) {
    if (!quizActive || !currentTarget) return;

    const userLat = e.latlng.lat;
    const userLng = e.latlng.lng;
    const dist = getDistance(userLat, userLng, currentTarget.lat, currentTarget.lng);
    
    // Score Logic (Stricter for India, looser for World)
    let points = 0;
    let color = "red";
    let msg = "Missed";
    
    // Dynamic difficulty: If looking for a city, be strict. If looking for a river/mountain, be nice.
    const threshold = currentTarget.cat.includes('cap') ? 100 : 300; 

    if (dist < threshold) { points = 100; msg = "🎯 Spot On!"; color = "#10b981"; }
    else if (dist < threshold * 3) { points = 50; msg = "🔥 Close!"; color = "#f59e0b"; }
    else { points = 0; msg = "❌ Too far"; color = "#ef4444"; }

    // Visuals
    quizMarker = L.marker([currentTarget.lat, currentTarget.lng]).addTo(quizMap)
        .bindPopup(`<b>${currentTarget.n}</b>`).openPopup();

    lineLayer = L.polyline([[userLat, userLng], [currentTarget.lat, currentTarget.lng]], 
        {color: color, weight: 3, dashArray: '10, 10'}).addTo(quizMap);

    // Update Score
    quizScore += points;
    document.getElementById('mmScore').innerText = quizScore;
    
    const resBox = document.getElementById('mmResult');
    resBox.innerHTML = `<div>${msg}</div><div style="font-size:0.8rem; opacity:0.8;">${Math.round(dist)} km away</div>`;
    resBox.style.display = 'block';
    resBox.style.borderColor = color;

    quizActive = false;
}

function giveUpMap() {
    if(!currentTarget) return;
    quizActive = false;
    quizMarker = L.marker([currentTarget.lat, currentTarget.lng]).addTo(quizMap)
        .bindPopup(`<b>${currentTarget.n}</b>`).openPopup();
    quizMap.flyTo([currentTarget.lat, currentTarget.lng], 5);
}

// Haversine Algo
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
// ==========================================
// APP: PROPER GOALS (Restored)
// ==========================================

let currentGoalTab = 'daily';

function switchGoalTab(tab) {
    currentGoalTab = tab;
    
    // 1. Update Tab UI
    document.querySelectorAll('#goals .tab').forEach(t => t.classList.remove('active'));
    // Find the tabs specifically inside the goals section to avoid conflicts
    const tabs = document.querySelectorAll('#goals .tab');
    if (tab === 'daily') tabs[0].classList.add('active');
    if (tab === 'weekly') tabs[1].classList.add('active');
    if (tab === 'monthly') tabs[2].classList.add('active');
    document.querySelectorAll('[data-home-goal-tab]').forEach(t => t.classList.toggle('active', t.dataset.homeGoalTab === tab));

    // 2. Update Placeholder
    const input = document.getElementById('newGoalInput');
    if(input) input.placeholder = `Add a ${tab} task...`;

    // 3. Render Data
    renderGoals();
}

function renderGoals() {
    if (!appData.goals) appData.goals = { daily: [], weekly: [], monthly: [] };
    if (!appData.goals[currentGoalTab]) appData.goals[currentGoalTab] = [];
    renderGoalList('goalList', 'emptyGoalMsg');
    renderGoalList('homeGoalList', 'homeEmptyGoalMsg');
}

function renderGoalList(listId, emptyId) {
    const list = document.getElementById(listId);
    const emptyMsg = document.getElementById(emptyId);
    if (!list) return;
    list.innerHTML = '';
    if (!appData.goals) appData.goals = { daily: [], weekly: [], monthly: [] };
    if (!appData.goals[currentGoalTab]) appData.goals[currentGoalTab] = [];

    const tasks = appData.goals[currentGoalTab];

    // 2. Sort: High Priority First, then Regular
    // We create a copy to avoid messing up the original order permanently if not desired
    // or just render them based on the 'prio' flag.
    const sortedTasks = [...tasks].sort((a, b) => (b.prio === true) - (a.prio === true));

    // 3. Show Empty State if needed
    if (tasks.length === 0) {
        if(emptyMsg) emptyMsg.style.display = 'block';
    } else {
        if(emptyMsg) emptyMsg.style.display = 'none';
        
        sortedTasks.forEach((g, i) => {
            // Find the original index to allow deletion/toggling correctly
            const originalIndex = tasks.indexOf(g);
            
            const prioStyle = g.prio ? 'border-left: 4px solid var(--danger); background: rgba(239, 68, 68, 0.05);' : 'border-left: 4px solid transparent;';
            const doneStyle = g.completed ? 'opacity:0.5; text-decoration:line-through;' : '';
            const icon = g.completed ? '<i class="fas fa-check-circle" style="color:var(--success)"></i>' : '<i class="far fa-circle"></i>';

            list.innerHTML += `
                <li class="goal-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border); ${prioStyle} ${doneStyle}">
                    <div onclick="toggleGoal(${originalIndex})" style="cursor:pointer; display:flex; align-items:center; gap:10px; flex:1;">
                        ${icon}
                        <span style="font-size:1rem;">${g.text}</span>
                        ${g.prio ? '<span style="font-size:0.7rem; background:var(--danger); color:white; padding:2px 6px; border-radius:4px;">IMPORTANT</span>' : ''}
                    </div>
                    <button onclick="deleteGoal(${originalIndex})" style="color:#ef4444; background:none; border:none; padding:5px; cursor:pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </li>
            `;
        });
    }
}

function addGoal(source = 'app') {
    const input = document.getElementById(source === 'home' ? 'homeGoalInput' : 'newGoalInput');
    const prioCheck = document.getElementById('goalPriority');
    const text = input.value.trim();
    
    if (text) {
        if (!appData.goals) appData.goals = { daily: [], weekly: [], monthly: [] };
        if (!appData.goals[currentGoalTab]) appData.goals[currentGoalTab] = [];

        // Add new task
        appData.goals[currentGoalTab].unshift({
            text: text,
            completed: false,
            prio: prioCheck?.checked || false
        });

        // Reset Inputs
        input.value = '';
        if (prioCheck) prioCheck.checked = false;

        saveData();
        renderGoals();
    }
}

function toggleGoal(index) {
    if (appData.goals && appData.goals[currentGoalTab][index]) {
        appData.goals[currentGoalTab][index].completed = !appData.goals[currentGoalTab][index].completed;
        const changedGoal = appData.goals[currentGoalTab][index];
        if (changedGoal.id) Object.values(appData.plans || {}).forEach(plan => (plan.tasks || []).forEach(task => { if (task.id === changedGoal.id) task.completed = changedGoal.completed; }));
        
        // Optional: Add XP if completing a task
        if(appData.goals[currentGoalTab][index].completed) {
            appData.xp = (appData.xp || 0) + 20; 
            try { updateRank(); } catch(e) {} // Updates rank if function exists
        }

        saveData();
        renderGoals();
    }
}

function deleteGoal(index) {
    if(confirm("Delete this task?")) {
        const [removed] = appData.goals[currentGoalTab].splice(index, 1);
        if (removed?.id) Object.values(appData.plans || {}).forEach(plan => { if (Array.isArray(plan.tasks)) plan.tasks = plan.tasks.filter(task => task.id !== removed.id); });
        saveData();
        renderGoals();
    }
}
// ====================
// APP: BRAIN DECK
// ====================
const FLASHCARDS = [
    { q: "Article 32", a: "Right to Constitutional Remedies (Heart & Soul of Constitution)" },
    { q: "Ohm's Law", a: "V = IR (Voltage = Current × Resistance)" },
    { q: "Battle of Plassey", a: "1757 - British victory over Nawab of Bengal" },
    { q: "Capital of Mizoram", a: "Aizawl" }
];

let fcIndex = 0;
let fcFlipped = false;

function renderCard() {
    const card = FLASHCARDS[fcIndex];
    const el = document.getElementById('fcContent');
    const hint = document.getElementById('fcHint');
    
    // Reset state
    fcFlipped = false; 
    el.innerText = card.q;
    el.style.color = "var(--text)";
    hint.innerText = "(Tap to reveal answer)";
}

function flipCard() {
    const card = FLASHCARDS[fcIndex];
    const el = document.getElementById('fcContent');
    const hint = document.getElementById('fcHint');

    if (fcFlipped) {
        el.innerText = card.q;
        el.style.color = "var(--text)";
        hint.innerText = "(Tap to reveal answer)";
    } else {
        el.innerText = card.a;
        el.style.color = "var(--primary)"; // Highlight answer
        hint.innerText = "(Tap to see question)";
    }
    fcFlipped = !fcFlipped;
}

function nextCard(step) {
    fcIndex += step;
    if (fcIndex >= FLASHCARDS.length) fcIndex = 0;
    if (fcIndex < 0) fcIndex = FLASHCARDS.length - 1;
    renderCard();
}
// ==========================================
// ==========================================
// ==========================================
// APP: TEST ANALYSER (SAFE MODE)
// ==========================================

function switchTestMode(mode) {
    const vPrelims = document.getElementById('view-objective');
    const vMains = document.getElementById('view-scored');
    if(!vPrelims || !vMains) return;

    vPrelims.style.display = mode === 'objective' ? 'block' : 'none';
    vMains.style.display = mode === 'scored' ? 'block' : 'none';
    
    document.getElementById('tab-objective').className = mode === 'objective' ? 'tab active' : 'tab';
    document.getElementById('tab-scored').className = mode === 'scored' ? 'tab active' : 'tab';
    
    if(mode === 'objective') renderPrelimsLogs();
    else renderMainsLogs();
}

function getTestAnalytics() {
    if (!appData.testAnalytics) appData.testAnalytics = {};
    if (!appData.testAnalytics.objective) appData.testAnalytics.objective = appData.testAnalytics.prelims || [];
    if (!appData.testAnalytics.scored) appData.testAnalytics.scored = appData.testAnalytics.mains || [];
    return appData.testAnalytics;
}

function addPrelimsLog() {
    const sub = document.getElementById('pSubject')?.value;
    const att = parseInt(document.getElementById('pAtt')?.value);
    const corr = parseInt(document.getElementById('pCorr')?.value);
    const correctMarks = Number(document.getElementById('pCorrectMarks')?.value || 1);
    const negativeMarks = Number(document.getElementById('pNegativeMarks')?.value || 0);

    if (sub && Number.isFinite(att) && att > 0 && Number.isFinite(corr) && corr >= 0 && corr <= att && correctMarks >= 0 && negativeMarks >= 0) {
        const wrong = att - corr;
        const marks = (corr * correctMarks) - (wrong * negativeMarks);
        const accuracy = att > 0 ? Math.round((corr / att) * 100) : 0;
        
        getTestAnalytics().objective.unshift({
            date: new Date().toLocaleDateString(), sub, att, corr, wrong, score: marks.toFixed(2), acc: accuracy, correctMarks, negativeMarks
        });

        document.getElementById('pSubject').value = '';
        document.getElementById('pAtt').value = '';
        document.getElementById('pCorr').value = '';
        saveData();
        renderPrelimsLogs();
    } else {
        alert("Add a test name, valid attempts, correct answers, and marking values.");
    }
}

function renderPrelimsLogs() {
    const list = document.getElementById('prelimsList');
    if (!list) return; // Prevents crash if HTML is missing
    
    const logs = getTestAnalytics().objective || [];

    if (logs.length > 0) {
        const avgAcc = logs.reduce((sum, i) => sum + i.acc, 0) / logs.length;
        const avgSc = logs.reduce((sum, i) => sum + parseFloat(i.score), 0) / logs.length;
        const accEl = document.getElementById('pAvgAcc');
        const scoreEl = document.getElementById('pAvgScore');
        if(accEl) accEl.innerText = Math.round(avgAcc) + "%";
        if(scoreEl) scoreEl.innerText = avgSc.toFixed(1);
    }

    list.innerHTML = '';
    logs.forEach((log, i) => {
        let color = log.score > 100 ? '#10b981' : (log.score > 80 ? '#f59e0b' : '#ef4444');
        list.innerHTML += `
            <div class="card" style="padding:15px; border-left: 5px solid ${color}; position:relative; margin-bottom:10px;">
                <button onclick="delTestLog('objective', ${i})" style="position:absolute; top:10px; right:10px; color:red; background:none;">&times;</button>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="font-weight:bold;">${log.sub}</span>
                    <span style="font-weight:bold; color:${color};">${log.score} Marks</span>
                </div>
                <div style="font-size:0.9rem; color:gray;">
                    <span>✅${log.corr} ❌${log.wrong}</span> • <span>${log.acc}% Acc</span>
                </div>
            </div>
        `;
    });
}

function addMainsLog() {
    const name = document.getElementById('mTestName')?.value;
    const paper = document.getElementById('mPaper')?.value;
    const marks = parseFloat(document.getElementById('mMarks')?.value);
    const total = parseFloat(document.getElementById('mTotal')?.value) || 250;

    if (name && !isNaN(marks) && total > 0) {
        getTestAnalytics().scored.unshift({
            date: new Date().toLocaleDateString(),
            name, paper, marks, total
        });
        document.getElementById('mTestName').value = '';
        document.getElementById('mMarks').value = '';
        saveData();
        renderMainsLogs();
    }
}

function renderMainsLogs() {
    const list = document.getElementById('mainsList');
    if (!list) return;

    const logs = getTestAnalytics().scored || [];

    list.innerHTML = '';
    logs.forEach((log, i) => {
        const pct = Math.round((log.marks / log.total) * 100);
        let color = pct >= 50 ? '#10b981' : (pct < 35 ? '#ef4444' : '#3b82f6');
        list.innerHTML += `
            <div class="card" style="padding:15px; border-left: 5px solid ${color}; position:relative; margin-bottom:10px;">
                <button onclick="delTestLog('scored', ${i})" style="position:absolute; top:10px; right:10px; color:red; background:none;">&times;</button>
                <div style="display:flex; justify-content:space-between;">
                    <div><span style="color:${color}; font-weight:bold; font-size:0.8rem;">${log.paper}</span> <b>${log.name}</b></div>
                    <div style="font-weight:bold; color:${color};">${log.marks}/${log.total}</div>
                </div>
            </div>
        `;
    });
}

function delTestLog(type, index) {
    if(confirm("Delete this log?")) {
        getTestAnalytics()[type].splice(index, 1);
        saveData();
        if(type === 'objective') renderPrelimsLogs();
        else renderMainsLogs();
    }
}
// ==========================================
// APP: BOOK VAULT (Advanced Library)
// ==========================================

let bvFilter = 'all'; // Current filter state

function filterBookVault(mode) {
    bvFilter = mode;
    
    // Update Tabs UI
    document.querySelectorAll('#book_vault .tab').forEach(t => t.classList.remove('active'));
    if(mode === 'all') document.getElementById('tab-bv-all').classList.add('active');
    if(mode === 'owned') document.getElementById('tab-bv-owned').classList.add('active');
    if(mode === 'wishlist') document.getElementById('tab-bv-wish').classList.add('active');
    if(mode === 'read') document.getElementById('tab-bv-read').classList.add('active');

    renderBookVault();
}

/* =========================================
   APP: BOOK VAULT (Progress Bar + Working Buttons)
   ========================================= */

function addBookVault() {
    const title = document.getElementById('bvTitle').value.trim();
    const pages = parseInt(document.getElementById('bvTotalPages').value) || 0; 
    const own = document.getElementById('bvCheckOwn').checked;
    const read = document.getElementById('bvCheckRead').checked;

    if (title) {
        if (!appData.bookVault) appData.bookVault = [];

        appData.bookVault.unshift({
            id: Date.now(), 
            title: title,
            own: own,         // true = Owned, false = Wishlist
            read: read,       // true = Finished, false = Unread
            totalPages: pages,
            currentPage: read ? pages : 0, 
            date: new Date().toLocaleDateString()
        });

        // Reset Inputs
        document.getElementById('bvTitle').value = '';
        document.getElementById('bvTotalPages').value = '';
        document.getElementById('bvCheckOwn').checked = false;
        document.getElementById('bvCheckRead').checked = false;

        saveData();
        renderBookVault();
    } else {
        alert("Please enter a book name!");
    }
}

function renderBookVault() {
    const list = document.getElementById('bvList');
    if (!list) return;

    if (!appData.bookVault) appData.bookVault = [];

    // STATS
    const totalBooks = appData.bookVault.length;
    const totalRead = appData.bookVault.filter(b => b.read).length;
    const readPct = totalBooks === 0 ? 0 : Math.round((totalRead / totalBooks) * 100);
    
    if(document.getElementById('bvCount')) document.getElementById('bvCount').innerText = totalBooks;
    if(document.getElementById('bvReadPct')) document.getElementById('bvReadPct').innerText = readPct + "%";

    // FILTER & SEARCH
    const search = document.getElementById('bvSearch').value.toLowerCase();
    let books = appData.bookVault.filter(b => b.title.toLowerCase().includes(search));

    if (bvFilter === 'owned') books = books.filter(b => b.own);
    if (bvFilter === 'wishlist') books = books.filter(b => !b.own);
    if (bvFilter === 'read') books = books.filter(b => b.read);

    list.innerHTML = '';

    if (books.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:30px; color:gray;">No books found.</div>`;
        return;
    }

    books.forEach((book) => {
        // Find the exact index in the main array so buttons work safely
        const realIndex = appData.bookVault.findIndex(b => b.id === book.id);

        // Safe Migration for old data
        if(book.totalPages === undefined) book.totalPages = 0;
        if(book.currentPage === undefined) book.currentPage = book.read ? book.totalPages : 0;

        // Dynamic Icons
        const ownIcon = book.own 
            ? '<i class="fas fa-check-circle" style="color:#10b981"></i> Owned' 
            : '<i class="far fa-circle" style="color:gray"></i> Wishlist';
        
        const readIcon = book.read 
            ? '<i class="fas fa-book-open" style="color:#3b82f6"></i> Read' 
            : '<i class="fas fa-book" style="color:gray"></i> Unread';

        const cardStyle = book.own ? 'background:var(--bg-card);' : 'background:rgba(0,0,0,0.2); opacity:0.9;';
        const borderStyle = book.read ? 'border-left: 4px solid #3b82f6;' : 'border-left: 4px solid gray;';

        // Build Progress Bar UI
        let progressHtml = '';
        if (book.totalPages > 0) {
            const pct = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
            progressHtml = `
                <div style="margin-top: 15px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:gray; margin-bottom:4px;">
                        <span>Page ${book.currentPage} / ${book.totalPages}</span>
                        <span style="color:var(--text); font-weight:bold;">${pct}%</span>
                    </div>
                    <div style="height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; display:flex;">
                        <div style="width: ${pct}%; background: var(--success); transition: width 0.3s ease;"></div>
                    </div>
                    <div style="margin-top: 8px; display:flex; gap: 8px;">
                        <button onclick="updateBookPage(${realIndex}, 10)" style="padding: 4px 10px; font-size: 0.75rem; background: var(--bg); color: var(--text); border: 1px solid var(--border); cursor:pointer;">+10 Pages</button>
                        <button onclick="setBookPage(${realIndex})" style="padding: 4px 10px; font-size: 0.75rem; background: var(--bg); color: var(--text); border: 1px solid var(--border); cursor:pointer;">Set Page</button>
                    </div>
                </div>
            `;
        }

        list.innerHTML += `
            <div class="card" style="padding:15px; ${cardStyle} ${borderStyle} display:flex; flex-direction:column;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="flex:1;">
                        <div style="font-weight:bold; font-size:1.1rem; margin-bottom:8px;">${book.title}</div>
                        <div style="display:flex; gap:15px; font-size:0.85rem; user-select:none;">
                            <span onclick="toggleBV(${realIndex}, 'own')" style="cursor:pointer; padding:4px 8px; background:var(--bg); border-radius:4px; border:1px solid var(--border);">
                                ${ownIcon}
                            </span>
                            <span onclick="toggleBV(${realIndex}, 'read')" style="cursor:pointer; padding:4px 8px; background:var(--bg); border-radius:4px; border:1px solid var(--border);">
                                ${readIcon}
                            </span>
                        </div>
                    </div>
                    <button onclick="deleteBV(${realIndex})" style="color:#ef4444; background:none; border:none; padding:10px; cursor:pointer;" title="Delete Book">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                ${progressHtml}
            </div>
        `;
    });
}

// --- ESSENTIAL BUTTON HELPER FUNCTIONS ---

// 1. Toggles Wishlist/Owned and Read/Unread
function toggleBV(index, field) {
    if (appData.bookVault[index]) {
        // Flip the boolean (true to false, false to true)
        appData.bookVault[index][field] = !appData.bookVault[index][field];
        
        // Smart Sync: If marking as Read, auto-fill the pages to 100%
        if (field === 'read' && appData.bookVault[index].read) {
            appData.bookVault[index].currentPage = appData.bookVault[index].totalPages;
        }
        
        // Smart Sync: If marking as Unread, reset pages to 0
        if (field === 'read' && !appData.bookVault[index].read) {
            appData.bookVault[index].currentPage = 0;
        }

        saveData();
        renderBookVault();
    }
}

// 2. Deletes the book entirely
function deleteBV(index) {
    if (confirm("Remove this book from your Vault?")) {
        appData.bookVault.splice(index, 1);
        saveData();
        renderBookVault();
    }
}

// 3. Adds +10 pages from the quick button
function updateBookPage(index, amount) {
    let book = appData.bookVault[index];
    book.currentPage += amount;
    
    // Stop it from going below 0 or above total pages
    if(book.currentPage < 0) book.currentPage = 0;
    if(book.currentPage > book.totalPages) book.currentPage = book.totalPages;
    
    // Auto-check the 'Read' box if you hit the final page
    book.read = (book.currentPage === book.totalPages);
    
    saveData();
    renderBookVault();
}

// 4. Sets an exact page number from prompt
function setBookPage(index) {
    let book = appData.bookVault[index];
    let val = prompt(`Enter current page (Max ${book.totalPages}):`, book.currentPage);
    
    if (val !== null) {
        val = parseInt(val);
        if (!isNaN(val)) {
            book.currentPage = val;
            
            // Stop it from going out of bounds
            if(book.currentPage < 0) book.currentPage = 0;
            if(book.currentPage > book.totalPages) book.currentPage = book.totalPages;
            
            // Auto-check the 'Read' box if you hit the final page
            book.read = (book.currentPage === book.totalPages);
            
            saveData();
            renderBookVault();
        }
    }
}

/* =========================================
   APP: NITI DM (Decision Simulator)
   ========================================= */

// 1. The Core Event Database
const nitiEventsDatabase = [
    // --- SDM LEVEL (Years 1-5) : FIELD CHALLENGES ---
    { minYear: 1, maxYear: 5, rank: "SDM", title: "The Sand Mafia", desc: "Local mafia is illegally mining sand. The MLA asks you to look the other way.", choices: [{ text: "Raid with police.", effects: { public: 15, pol: -20, fam: 0, stress: 15 } }, { text: "Ignore it.", effects: { public: -15, pol: 15, fam: 0, stress: -5 } }] },
    { minYear: 1, maxYear: 5, rank: "SDM", title: "Festival Flashpoint", desc: "Two communities want the central ground for festivals on the same day.", choices: [{ text: "Impose Section 144.", effects: { public: -20, pol: -5, fam: 0, stress: 25 } }, { text: "Negotiate a time-split.", effects: { public: 20, pol: 10, fam: -10, stress: 15 } }] },
    { minYear: 1, maxYear: 4, rank: "SDM", title: "UPSC Prelims Leak", desc: "You catch a center supervisor using a OnePlus Nord CE 4 to leak the GS Paper 1.", choices: [{ text: "Cancel the center's exam & arrest him.", effects: { public: 25, pol: -15, fam: 0, stress: 30 } }, { text: "Confiscate the phone quietly, let exams finish.", effects: { public: -10, pol: 10, fam: 0, stress: 10 } }] },
    { minYear: 1, maxYear: 5, rank: "SDM", title: "The Workshop Strike", desc: "1st-year B.Tech students are protesting dangerous lathes in the mechanical workshop.", choices: [{ text: "Sanction emergency funds for safety.", effects: { public: 20, pol: -10, fam: 0, stress: 15 } }, { text: "Order police to clear the campus.", effects: { public: -25, pol: 15, fam: 0, stress: 20 } }] },
    { minYear: 2, maxYear: 5, rank: "SDM", title: "Midnight Hospital Raid", desc: "At 2 AM, you find the Chief Medical Officer sleeping at home while patients wait.", choices: [{ text: "Suspend the CMO instantly.", effects: { public: 25, pol: -10, fam: 0, stress: 15 } }, { text: "Issue a strict warning.", effects: { public: 5, pol: 5, fam: 0, stress: 5 } }] },
    { minYear: 1, maxYear: 4, rank: "SDM", title: "Article 19 Clash", desc: "A group invokes Fundamental Rights to block a national highway.", choices: [{ text: "Lathi charge.", effects: { public: -15, pol: 15, fam: 0, stress: 25 } }, { text: "Negotiate.", effects: { public: 15, pol: -5, fam: 0, stress: 10 } }] },
    { minYear: 2, maxYear: 5, rank: "SDM", title: "The Legacy Crash", desc: "The district's C++ based land registry crashes, erasing a week of data.", choices: [{ text: "Work 48 hours to manually recover data.", effects: { public: 15, pol: 5, fam: -20, stress: 30 } }, { text: "Blame state IT.", effects: { public: -10, pol: -20, fam: 0, stress: 5 } }] },
    { minYear: 1, maxYear: 4, rank: "SDM", title: "Sub-Standard Silicon", desc: "A vendor supplying Basic Electronic Circuits to rural labs is providing faulty hardware.", choices: [{ text: "Blacklist the vendor.", effects: { public: 20, pol: -25, fam: 0, stress: 15 } }, { text: "Issue a warning.", effects: { public: -15, pol: 15, fam: 0, stress: 0 } }] },
    { minYear: 1, maxYear: 5, rank: "SDM", title: "Ration Shop Scam", desc: "Subsidized grain is being diverted. The supply officer is complicit.", choices: [{ text: "File an FIR.", effects: { public: 25, pol: -15, fam: 0, stress: 15 } }, { text: "Transfer quietly.", effects: { public: 5, pol: 10, fam: 0, stress: 0 } }] },
    { minYear: 2, maxYear: 4, rank: "SDM", title: "Illegal Encroachment", desc: "A religious structure is built on public land overnight.", choices: [{ text: "Bring bulldozers.", effects: { public: -10, pol: -20, fam: 0, stress: 30 } }, { text: "Seek Court orders.", effects: { public: 5, pol: 5, fam: 0, stress: 10 } }] },

    // --- DM LEVEL (Years 5-13) : DISTRICT COMMANDER ---
    { minYear: 5, maxYear: 12, rank: "DM", title: "The Election Seizure", desc: "During MCC, your squad intercepts ₹5 Crores belonging to the ruling party.", choices: [{ text: "Seize & report to EC.", effects: { public: 25, pol: -30, fam: 0, stress: 25 } }, { text: "Delay the report.", effects: { public: -25, pol: 25, fam: 0, stress: 10 } }] },
    { minYear: 5, maxYear: 10, rank: "DM", title: "IT Procurement Fraud", desc: "A massive scam invoicing thousands of Dell WM118 wireless mice at ₹50,000 each is uncovered.", choices: [{ text: "Arrest the procurement head.", effects: { public: 30, pol: -25, fam: 0, stress: 20 } }, { text: "Bury the audit to protect the Ministry.", effects: { public: -20, pol: 20, fam: 0, stress: -5 } }] },
    { minYear: 6, maxYear: 12, rank: "DM", title: "Engineering Marvel vs Reality", desc: "A new flyover shows sheer-stress fractures. Contractor is CM's friend.", choices: [{ text: "Shut down bridge.", effects: { public: 20, pol: -35, fam: 0, stress: 25 } }, { text: "Quiet night repairs.", effects: { public: -15, pol: 20, fam: 0, stress: 15 } }] },
    { minYear: 5, maxYear: 12, rank: "DM", title: "Flood vs. Photo-Op", desc: "District is flooded. CM demands an unannounced aerial survey and helipad.", choices: [{ text: "Attend the CM.", effects: { public: -25, pol: 20, fam: 0, stress: 10 } }, { text: "Stay with rescue boats.", effects: { public: 20, pol: -25, fam: 0, stress: 15 } }] },
    { minYear: 7, maxYear: 13, rank: "DM", title: "The Water War", desc: "Severe drought. Farmers want canal water, but the city needs drinking water.", choices: [{ text: "Divert to city.", effects: { public: -20, pol: 10, fam: 0, stress: 35 } }, { text: "Divert to farms.", effects: { public: 15, pol: -25, fam: 0, stress: 40 } }] },
    { minYear: 5, maxYear: 13, rank: "DM", title: "Oxygen Crisis", desc: "Hospital is out of oxygen. Neighboring DM refuses to share spare tanks.", choices: [{ text: "Hijack tanks with police.", effects: { public: 30, pol: -25, fam: 0, stress: 35 } }, { text: "Wait for State orders.", effects: { public: -30, pol: 10, fam: 0, stress: 20 } }] },
    { minYear: 8, maxYear: 13, rank: "DM", title: "The Farmer's March", desc: "10,000 farmers marching to the capital. Politicians want them stopped.", choices: [{ text: "Barricade borders.", effects: { public: -30, pol: 20, fam: 0, stress: 30 } }, { text: "Provide safe passage.", effects: { public: 25, pol: -30, fam: 0, stress: 15 } }] },
    { minYear: 6, maxYear: 11, rank: "DM", title: "Factory Explosion", desc: "Chemical plant explodes. Owner tries to flee the country.", choices: [{ text: "Seal borders & arrest.", effects: { public: 30, pol: -10, fam: -10, stress: 25 } }, { text: "Focus purely on evacuation.", effects: { public: 10, pol: 5, fam: 0, stress: 15 } }] },
    { minYear: 5, maxYear: 12, rank: "DM", title: "Cyber Ransom", desc: "Hackers lock treasury servers for Bitcoin.", choices: [{ text: "Refuse to pay. Rebuild DB.", effects: { public: -25, pol: -10, fam: -20, stress: 45 } }, { text: "Secretly pay ransom.", effects: { public: 10, pol: -35, fam: 0, stress: 50 } }] },
    { minYear: 9, maxYear: 13, rank: "DM", title: "Rogue Encounter", desc: "Your SP executes a gangster in a fake encounter. Public cheers, HR groups furious.", choices: [{ text: "Order magisterial inquiry.", effects: { public: -25, pol: -15, fam: -10, stress: 35 } }, { text: "Sign self-defense report.", effects: { public: 25, pol: 20, fam: 0, stress: 10 } }] },
    { minYear: 5, maxYear: 10, rank: "DM", title: "The Imphal Deputation", desc: "Posted to Manipur. Must balance ethnic dynamics and infrastructure.", choices: [{ text: "Host community dialogues.", effects: { public: 25, pol: -10, fam: -15, stress: 20 } }, { text: "Strict law & order.", effects: { public: -10, pol: 15, fam: 0, stress: 25 } }] },

    // --- JOINT SECRETARY (Years 14-25) : POLICY & POWER ---
    { minYear: 14, maxYear: 22, rank: "JS", title: "International Relations Trade", desc: "Foreign delegates insist on terms hurting local manufacturers.", choices: [{ text: "Refuse terms.", effects: { public: 20, pol: -10, fam: 0, stress: 20 } }, { text: "Sign treaty.", effects: { public: -20, pol: 25, fam: 0, stress: 15 } }] },
    { minYear: 15, maxYear: 24, rank: "JS", title: "Tech Monopolies", desc: "Drafting IT regulations. Lobbyists offer a post-retirement board seat.", choices: [{ text: "Draft strict laws.", effects: { public: 25, pol: -15, fam: 0, stress: 30 } }, { text: "Include loopholes.", effects: { public: -25, pol: 20, fam: 25, stress: -10 } }] },
    { minYear: 16, maxYear: 26, rank: "JS", title: "The Whistleblower", desc: "Junior officer brings proof of ₹10,000 Cr scam involving a Minister.", choices: [{ text: "Send dossier to CBI.", effects: { public: 35, pol: -40, fam: 0, stress: 40 } }, { text: "Bury the file.", effects: { public: -30, pol: 25, fam: 0, stress: -10 } }] },
    { minYear: 16, maxYear: 25, rank: "JS", title: "Defense Procurement Hitch", desc: "You find a technical flaw in a drone deal backed by the Defense Minister.", choices: [{ text: "Halt the deal.", effects: { public: 15, pol: -40, fam: 0, stress: 40 } }, { text: "Approve the file.", effects: { public: -15, pol: 25, fam: 0, stress: 5 } }] },
    { minYear: 15, maxYear: 25, rank: "JS", title: "Centre vs. State Scheme", desc: "Centre mandates a scheme, CM wants a rival one.", choices: [{ text: "Push Centre's scheme.", effects: { public: 10, pol: -25, fam: 0, stress: 20 } }, { text: "Push State's scheme.", effects: { public: 10, pol: 20, fam: 0, stress: 10 } }] },
    { minYear: 14, maxYear: 20, rank: "JS", title: "Supreme Court Notice", desc: "SC issues contempt notice for failing to implement an environmental order.", choices: [{ text: "Apologize & implement.", effects: { public: 15, pol: -15, fam: -15, stress: 30 } }, { text: "Draft complex affidavit to delay.", effects: { public: -10, pol: 25, fam: 0, stress: 20 } }] },
    { minYear: 19, maxYear: 25, rank: "JS", title: "Global Pandemic", desc: "New virus emerges. Minister wants to downplay it for the stock market.", choices: [{ text: "Leak severity to WHO.", effects: { public: 40, pol: -50, fam: 0, stress: 45 } }, { text: "Follow orders.", effects: { public: -40, pol: 25, fam: 0, stress: 30 } }] },
    { minYear: 18, maxYear: 25, rank: "JS", title: "The Austerity Measure", desc: "Economy crashing. Draft a bill cutting government pensions.", choices: [{ text: "Draft ruthless cuts.", effects: { public: -30, pol: 15, fam: -20, stress: 25 } }, { text: "Suggest raising taxes instead.", effects: { public: -40, pol: -10, fam: 10, stress: 20 } }] },
    { minYear: 15, maxYear: 25, rank: "JS", title: "Space Launch", desc: "ISRO ready for launch, but you spot a 0.5% structural anomaly.", choices: [{ text: "Scrub launch.", effects: { public: -10, pol: -40, fam: 0, stress: 45 } }, { text: "Clear launch.", effects: { public: 20, pol: 30, fam: -10, stress: 50 } }] },
    { minYear: 14, maxYear: 23, rank: "JS", title: "Pharmaceutical Lobby", desc: "Life-saving drug patent held by US corp. Invoke compulsory licensing?", choices: [{ text: "Break patent for cheap generics.", effects: { public: 40, pol: -30, fam: 0, stress: 35 } }, { text: "Respect patent.", effects: { public: -40, pol: 20, fam: 0, stress: 15 } }] },

    // --- CHIEF SEC / CABINET SEC (Years 26-35) : THE APEX ---
    { minYear: 26, maxYear: 32, rank: "CS", title: "The Governor's Rebellion", desc: "Governor and CM in constitutional deadlock. Both issue contradictory orders.", choices: [{ text: "Obey CM.", effects: { public: 10, pol: -15, fam: 0, stress: 35 } }, { text: "Obey Governor.", effects: { public: -10, pol: -25, fam: 0, stress: 35 } }] },
    { minYear: 28, maxYear: 35, rank: "CS", title: "Police Mutiny", desc: "State police on strike demanding higher pay. Law & order collapsing.", choices: [{ text: "Invoke ESMA, arrest leaders.", effects: { public: 10, pol: 10, fam: 0, stress: 40 } }, { text: "Give in to demands.", effects: { public: -25, pol: -20, fam: 0, stress: 15 } }] },
    { minYear: 32, maxYear: 35, rank: "CAB", title: "Nuclear Escalation", desc: "Border tensions peak. PM asks if bureaucracy is ready for a tactical strike.", choices: [{ text: "Tell the truth: Unprepared.", effects: { public: 0, pol: -20, fam: -10, stress: 40 } }, { text: "Present optimistic fake report.", effects: { public: 0, pol: 25, fam: 0, stress: 20 } }] },
    { minYear: 30, maxYear: 35, rank: "CAB", title: "Coalition Collapse", desc: "Outgoing PM demands you shred sensitive PMO documents before opposition takes over.", choices: [{ text: "Refuse. Preserve files.", effects: { public: 30, pol: -40, fam: 0, stress: 40 } }, { text: "Shred documents.", effects: { public: -30, pol: 40, fam: 0, stress: 30 } }] },
    { minYear: 26, maxYear: 32, rank: "CS", title: "The Fiscal Ruin", desc: "Elections in 6 months. CM orders free electricity ordinance that will bankrupt state.", choices: [{ text: "Write strong dissent note.", effects: { public: 10, pol: -30, fam: 0, stress: 20 } }, { text: "Sign the file.", effects: { public: -20, pol: 25, fam: 0, stress: 0 } }] },
    { minYear: 26, maxYear: 32, rank: "CS", title: "CM's Nephew", desc: "CM's nephew caught driving drunk. CM asks you to 'handle the police'.", choices: [{ text: "Refuse, protect police.", effects: { public: 30, pol: -50, fam: 0, stress: 40 } }, { text: "Transfer police, bury tape.", effects: { public: -40, pol: 40, fam: 0, stress: -10 } }] },
    { minYear: 28, maxYear: 35, rank: "CAB", title: "Midnight Cabinet", desc: "PM wants to pass controversial executive order at 2 AM bypassing Parliament.", choices: [{ text: "Sign procedural paperwork.", effects: { public: -30, pol: 30, fam: 0, stress: 25 } }, { text: "Resign in protest.", effects: { public: 40, pol: -100, fam: 20, stress: 0 } }] },

    // --- PERSONAL / FAMILY / SURVIVAL (Any Year) ---
    { minYear: 3, maxYear: 30, rank: "ANY", title: "Anniversary Forgotten", desc: "Worked 16-hour shifts for 3 weeks. Forgot anniversary, spouse packing bags.", choices: [{ text: "Take 3 days emergency leave.", effects: { public: -10, pol: -10, fam: 35, stress: -20 } }, { text: "Buy gift, go back to office.", effects: { public: 5, pol: 5, fam: -15, stress: 5 } }] },
    { minYear: 5, maxYear: 25, rank: "ANY", title: "Board Exams vs Crisis", desc: "Child's Class 12 board exam panic attack vs factory fire in district.", choices: [{ text: "Rush to factory.", effects: { public: 20, pol: 10, fam: -30, stress: 25 } }, { text: "Stay home with child.", effects: { public: -25, pol: -15, fam: 30, stress: -10 } }] },
    { minYear: 8, maxYear: 28, rank: "ANY", title: "The Remote Transfer", desc: "Transferred to remote district. No good schools for kids.", choices: [{ text: "Take family with you.", effects: { public: 15, pol: 10, fam: -25, stress: 20 } }, { text: "Pull political strings to cancel.", effects: { public: -15, pol: -20, fam: 25, stress: -5 } }] },
    { minYear: 10, maxYear: 25, rank: "ANY", title: "Old College Friend", desc: "Old B.Tech roommate asks for a 'small favor' on a government tender.", choices: [{ text: "Throw him out.", effects: { public: 15, pol: 0, fam: -10, stress: 10 } }, { text: "Give him the tender.", effects: { public: -25, pol: -10, fam: 20, stress: 20 } }] },
    { minYear: 15, maxYear: 32, rank: "ANY", title: "Parent's Funeral", desc: "Parent passes away suddenly. Same day, a massive riot breaks out.", choices: [{ text: "Leave to perform last rites.", effects: { public: -30, pol: -20, fam: 40, stress: 20 } }, { text: "Stay in control room.", effects: { public: 30, pol: 20, fam: -50, stress: 50 } }] },
    { minYear: 20, maxYear: 34, rank: "ANY", title: "Medical Breakdown", desc: "Years of extreme stress. You collapse and wake up in ICU.", choices: [{ text: "Take 3-month sabbatical.", effects: { public: -10, pol: -15, fam: 25, stress: -50 } }, { text: "Return to work after 3 days.", effects: { public: 15, pol: 20, fam: -25, stress: 45 } }] },
    { minYear: 15, maxYear: 35, rank: "ANY", title: "The Tell-All Book", desc: "Publisher offers ₹2 Cr for anonymous 'tell-all' exposing bureaucracy.", choices: [{ text: "Write it.", effects: { public: 40, pol: -40, fam: 10, stress: 35 } }, { text: "Refuse offer.", effects: { public: -10, pol: 20, fam: -10, stress: -5 } }] },
    { minYear: 8, maxYear: 20, rank: "ANY", title: "Engineering Admission", desc: "Child failed entrance exam. College offers free seat if you approve their land expansion.", choices: [{ text: "Approve file.", effects: { public: -30, pol: 10, fam: 40, stress: 15 } }, { text: "Reject it. Make child drop a year.", effects: { public: 20, pol: -10, fam: -40, stress: 25 } }] }
];
    

// 2. The Rank System
const nitiRanks = [
    { year: 1, title: "Sub-Divisional Magistrate (SDM)" },
    { year: 5, title: "District Magistrate (DM)" },
    { year: 14, title: "Divisional Commissioner" },
    { year: 20, title: "Joint Secretary (Govt of India)" },
    { year: 28, title: "Chief Secretary (State)" },
    { year: 33, title: "Cabinet Secretary (GOI)" }
];

// 3. The Game Engine
function initNitiGame() {
    if (!appData.nitiGame) {
        appData.nitiGame = {
            year: 1,
            stats: { public: 50, pol: 50, fam: 50, stress: 0 }
        };
    }
}

function renderNitiGame() {
    initNitiGame();
    const game = appData.nitiGame;

    // A. Check Game Over states
    if (game.stats.stress >= 100) return triggerGameOver("You suffered a severe heart attack from sheer administrative stress.");
    if (game.stats.pol <= 0) return triggerGameOver("You were permanently suspended for insubordination and excessive political friction.");
    if (game.stats.public <= 0) return triggerGameOver("Massive riots forced the government to terminate your service.");
    if (game.year >= 35) return triggerGameOver("Congratulations. You have reached retirement age and stepped down with full honors.", true);

    // B. Determine Current Rank
    let currentRank = nitiRanks[0].title;
    for(let r of nitiRanks) {
        if (game.year >= r.year) currentRank = r.title;
    }

    // C. Update UI Text
    document.getElementById('nitiYears').innerText = `Year ${game.year}`;
    document.getElementById('nitiRank').innerText = currentRank;
    
    // D. Update Progress Bars
    ['public', 'pol', 'fam', 'stress'].forEach(stat => {
        let val = game.stats[stat];
        if(val > 100) val = 100; if(val < 0) val = 0;
        
        const capStat = stat.charAt(0).toUpperCase() + stat.slice(1);
        if(document.getElementById(`stat${capStat}`)) {
            document.getElementById(`stat${capStat}`).innerText = `${val}%`;
            document.getElementById(`bar${capStat}`).style.width = `${val}%`;
        }
    });

    // E. Load the next scenario
    loadNitiEvent(currentRank);
}

function loadNitiEvent(currentRank) {
    const game = appData.nitiGame;
    
    let rankCode = "SDM";
    if (currentRank.includes("District")) rankCode = "DM";
    if (currentRank.includes("Joint Secretary") || currentRank.includes("Commissioner")) rankCode = "JS";
    if (currentRank.includes("Chief Secretary")) rankCode = "CS";
    if (currentRank.includes("Cabinet")) rankCode = "CAB";

    const validEvents = nitiEventsDatabase.filter(e => 
        game.year >= e.minYear && 
        game.year <= e.maxYear && 
        (e.rank === "ANY" || e.rank === rankCode)
    );

    let eventList = validEvents.length > 0 ? validEvents : nitiEventsDatabase.filter(e => e.rank === "ANY");
    if(eventList.length === 0) eventList = nitiEventsDatabase; // Ultimate fallback

    const event = eventList[Math.floor(Math.random() * eventList.length)];

    document.getElementById('nitiEventTitle').innerText = event.title;
    document.getElementById('nitiEventDesc').innerText = event.desc;

    const choicesDiv = document.getElementById('nitiChoices');
    choicesDiv.innerHTML = ''; // Clear old buttons

    // Generate new buttons
    event.choices.forEach((choice) => {
        const btn = document.createElement('button');
        btn.className = 'niti-choice-btn';
        btn.innerText = choice.text;
        btn.onclick = () => applyNitiChoice(choice.effects);
        choicesDiv.appendChild(btn);
    });
}

function applyNitiChoice(effects) {
    let game = appData.nitiGame;
    
    game.stats.public += effects.public || 0;
    game.stats.pol += effects.pol || 0;
    game.stats.fam += effects.fam || 0;
    game.stats.stress += effects.stress || 0;

    for(let key in game.stats) {
        if(game.stats[key] > 100) game.stats[key] = 100;
        if(game.stats[key] < 0) game.stats[key] = 0;
    }

    game.year += 1;
    game.stats.stress -= 2; // Natural stress decay
    game.stats.fam -= 1;    // Natural family decay

    saveData();
    renderNitiGame();
}

function triggerGameOver(reason, isWin = false) {
    document.getElementById('nitiEventCard').style.display = 'none';
    const endScreen = document.getElementById('nitiEndScreen');
    endScreen.style.display = 'block';
    
    endScreen.style.background = isWin ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    endScreen.style.borderColor = isWin ? 'var(--success)' : 'var(--danger)';
    endScreen.querySelector('h3').innerText = isWin ? 'Happy Retirement!' : 'Career Terminated';
    endScreen.querySelector('h3').style.color = isWin ? 'var(--success)' : 'var(--danger)';
    
    document.getElementById('nitiEndReason').innerText = reason;
}

function resetNitiGame() {
    if(confirm("Are you sure you want to resign and start a new lifetime?")) {
        appData.nitiGame = null; // Wipe save data
        document.getElementById('nitiEventCard').style.display = 'block';
        document.getElementById('nitiEndScreen').style.display = 'none';
        saveData();
        renderNitiGame();
    }
}
// ==========================================
// APP: THE STOIC JOURNAL (Sentiment Analysis)
// ==========================================

const STOIC_DICT = {
    pos: ['calm', 'peace', 'good', 'great', 'happy', 'joy', 'love', 'focus', 'strong', 'courage', 'wise', 'wisdom', 'justice', 'temperate', 'control', 'better', 'improve', 'win', 'won', 'success', 'progress', 'confident', 'grateful', 'content', 'patient', 'learn', 'understood', 'accepted', 'productive'],
    neg: ['angry', 'anger', 'sad', 'bad', 'terrible', 'worst', 'fear', 'afraid', 'anxious', 'stress', 'fail', 'lost', 'waste', 'tired', 'exhausted', 'pain', 'hurt', 'grief', 'hate', 'jealous', 'envy', 'distracted', 'weak', 'complaint', 'blame', 'lazy']
};

function addStoicEntry() {
    const text = document.getElementById('stoicInput').value;
    if(text) {
        if(!appData.stoicJournal) appData.stoicJournal = [];
        
        // Analyze Sentiment
        const score = analyzeStoicSentiment(text);
        
        appData.stoicJournal.unshift({
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            text: text,
            score: score
        });

        document.getElementById('stoicInput').value = '';
        saveData();
        renderStoicJournal();
    } else {
        alert("Write something first, stoic.");
    }
}

function analyzeStoicSentiment(text) {
    const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
    let score = 0;
    
    words.forEach(w => {
        if(STOIC_DICT.pos.includes(w)) score += 1;
        if(STOIC_DICT.neg.includes(w)) score -= 1;
    });

    // Clamp score between -5 and 5 for consistent graphing
    return Math.max(-5, Math.min(5, score));
}

function renderStoicJournal() {
    const list = document.getElementById('stoicList');
    const chart = document.getElementById('stoicChart');
    const trendDisplay = document.getElementById('stoicTrendScore');
    
    if(!list || !chart) return;

    if(!appData.stoicJournal) appData.stoicJournal = [];

    // 1. RENDER LIST
    list.innerHTML = '';
    
    if(appData.stoicJournal.length === 0) {
        list.innerHTML = '<div style="text-align:center; color:gray; padding:20px;">No entries yet. Reflect on your day.</div>';
    }

    appData.stoicJournal.forEach((entry, i) => {
        let color = 'gray';
        let mood = 'Neutral';
        
        if(entry.score > 0) { color = '#10b981'; mood = 'Positive'; }
        if(entry.score < 0) { color = '#ef4444'; mood = 'Negative'; }

        list.innerHTML += `
            <div class="card" style="padding:15px; border-left: 4px solid ${color}; position:relative;">
                 <button onclick="deleteStoicEntry(${i})" style="position:absolute; top:10px; right:10px; color:red; background:none; border:none; cursor:pointer;">&times;</button>
                <div style="font-size:0.8rem; color:gray; margin-bottom:5px;">${entry.date} • ${entry.time}</div>
                <div style="font-style:italic; margin-bottom:10px;">"${entry.text}"</div>
                <div style="font-weight:bold; color:${color}; font-size:0.85rem; display:flex; align-items:center; gap:5px;">
                    Positivity Score: ${entry.score} (${mood})
                </div>
            </div>
        `;
    });

    // 2. RENDER CHART (Last 7 Entries)
    chart.innerHTML = '';
    const recent = appData.stoicJournal.slice(0, 7).reverse(); // Oldest to newest of the last 7
    
    if(recent.length === 0) {
        chart.innerHTML = '<div style="width:100%; text-align:center; color:gray; align-self:center;">Chart empty</div>';
    } else {
        recent.forEach(entry => {
            // Calculate Bar Height
            // Base line is 50%. Score of 0 = 50% height.
            // Max score (5) = 100%, Min score (-5) = 0%
            let heightPct = 50 + (entry.score * 10);
            heightPct = Math.max(10, Math.min(100, heightPct)); // Keep between 10% and 100%
            
            let barColor = entry.score >= 0 ? '#10b981' : '#ef4444';
            let opacity = 0.6 + (Math.abs(entry.score) / 10); // More intense score = darker color
            
            chart.innerHTML += `
                <div style="flex:1; background:${barColor}; height:${heightPct}%; border-radius:3px 3px 0 0; opacity:${opacity}; position:relative;" title="${entry.date}: Score ${entry.score}"></div>
            `;
        });
    }

    // 3. OVERALL TREND TEXT
    const totalScore = appData.stoicJournal.reduce((sum, e) => sum + e.score, 0);
    if(totalScore > 2) { trendDisplay.innerText = "Positive (Stoic)"; trendDisplay.style.color = "#10b981"; }
    else if(totalScore < -2) { trendDisplay.innerText = "Troubled (Negative)"; trendDisplay.style.color = "#ef4444"; }
    else { trendDisplay.innerText = "Balanced (Neutral)"; trendDisplay.style.color = "gray"; }
}

function deleteStoicEntry(i) {
    if(confirm("Delete this reflection?")) {
        appData.stoicJournal.splice(i, 1);
        saveData();
        renderStoicJournal();
    }
}
// ==========================================
// APP: FOCUS CHAIN
// ==========================================

let chainInterval = null;
let chainState = { active: false, paused: false, currentIdx: -1, remainingSeconds: 0 };

function renderFocusChain() {
    const list = document.getElementById('fcList');
    if (!list) return;

    if (!appData.focusChain) appData.focusChain = [];
    if (Number.isInteger(appData.focusChainActiveIndex) && appData.focusChain[appData.focusChainActiveIndex]) {
        chainState.currentIdx = appData.focusChainActiveIndex;
        chainState.active = true;
        chainState.paused = !appData.timer?.active;
        const panel = document.getElementById('fcActivePanel');
        if (panel) panel.style.display = 'block';
        document.getElementById('fcActiveSubject').innerText = appData.focusChain[chainState.currentIdx].subject;
        document.getElementById('fcPauseBtn').innerText = chainState.paused ? 'Resume' : 'Pause';
        if (!chainInterval && appData.timer?.active) chainInterval = setInterval(chainTick, 1000);
        chainTick();
    }
    
    // 1. Calculate Total Time
    const totalMins = appData.focusChain.reduce((sum, item) => sum + item.duration, 0);
    document.getElementById('fcTotalTime').innerText = `${totalMins}m Sequence`;

    // 2. Render List
    list.innerHTML = '';
    if(appData.focusChain.length === 0) {
        list.innerHTML = `<div style="text-align:center; color:gray; padding:20px;">No steps added. Build your study plan!</div>`;
    }

    appData.focusChain.forEach((step, i) => {
        let statusIcon = '<i class="far fa-circle"></i>';
        let statusClass = '';
        let rowStyle = 'opacity: 1;';

        if (step.status === 'done') {
            statusIcon = '<i class="fas fa-check-circle" style="color:#10b981"></i>';
            rowStyle = 'opacity: 0.5; text-decoration: line-through;';
        } else if (step.status === 'active') {
            statusIcon = '<i class="fas fa-play-circle" style="color:#6366f1; animation: pulse 2s infinite;"></i>';
            rowStyle = 'border: 2px solid #6366f1; background: var(--bg-card);';
        }

        list.innerHTML += `
            <div class="card" style="padding:15px; display:flex; justify-content:space-between; align-items:center; ${rowStyle}">
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="font-size:1.2rem;">${statusIcon}</span>
                    <div>
                        <div style="font-weight:bold; font-size:1.1rem;">${step.subject}</div>
                        <div style="font-size:0.9rem; color:gray;">${step.duration} Minutes</div>
                    </div>
                </div>
                ${step.status === 'pending' ? `<div><button onclick="moveChainStep(${i},-1)">↑</button><button onclick="moveChainStep(${i},1)">↓</button><button onclick="editChainStep(${i})">Edit</button><button onclick="removeChainStep(${i})" style="color:red; background:none; padding:5px;"><i class="fas fa-trash"></i></button></div>` : ''}
            </div>
        `;
    });
}

function addChainStep() {
    const sub = document.getElementById('fcInputSub').value;
    const time = parseInt(document.getElementById('fcInputTime').value);

    if (!UPSC_SYLLABUS.some(subject => subject.subject === sub)) {
        alert('Add a subject to your Learning Plan, then choose it here.');
        return;
    }
    if (sub && Number.isFinite(time) && time > 0) {
        if (!appData.focusChain) appData.focusChain = [];
        appData.focusChain.push({ subject: sub, duration: time, status: 'pending' }); // status: pending, active, done
        
        document.getElementById('fcInputSub').value = '';
        document.getElementById('fcInputTime').value = '';
        saveData();
        renderFocusChain();
    }
}

function removeChainStep(i) {
    appData.focusChain.splice(i, 1);
    saveData();
    renderFocusChain();
}

function moveChainStep(index, direction) {
    const target = index + direction;
    if (!appData.focusChain || target < 0 || target >= appData.focusChain.length) return;
    [appData.focusChain[index], appData.focusChain[target]] = [appData.focusChain[target], appData.focusChain[index]];
    saveData(); renderFocusChain();
}

function editChainStep(index) {
    const step = appData.focusChain?.[index];
    if (!step || step.status !== 'pending') return;
    const duration = Number(prompt('Step duration in minutes:', step.duration));
    if (!Number.isFinite(duration) || duration < 1) return;
    step.duration = Math.round(duration);
    saveData(); renderFocusChain();
}

function startFocusChain() {
    if (!appData.focusChain || appData.focusChain.length === 0) return alert("Add steps first!");

    // Find first pending step
    const nextIdx = appData.focusChain.findIndex(s => s.status === 'pending');
    
    if (nextIdx === -1) {
        if(confirm("Chain complete! Restart?")) resetChain();
        return;
    }
    if (!UPSC_SYLLABUS.some(subject => subject.subject === appData.focusChain[nextIdx].subject)) {
        alert('This step uses a subject that is no longer in your Learning Plan. Remove it and add a step using a listed subject.');
        return;
    }

    // Initialize Step
    chainState.currentIdx = nextIdx;
    chainState.remainingSeconds = appData.focusChain[nextIdx].duration * 60;
    chainState.active = true;
    chainState.paused = false;

    // Update Data
    appData.focusChain.forEach(s => { if(s.status === 'active') s.status = 'done'; }); // Safety cleanup
    appData.focusChain[nextIdx].status = 'active';
    appData.focusChainActiveIndex = nextIdx;
    
    // UI Updates
    document.getElementById('fcActivePanel').style.display = 'block';
    document.getElementById('fcActiveSubject').innerText = appData.focusChain[nextIdx].subject;
    document.getElementById('fcPauseBtn').innerText = "Pause";
    
    const step = appData.focusChain[nextIdx];
    const subjectSelect = document.getElementById('preTimerSubject');
    const chapterSelect = document.getElementById('preTimerChapter');
    if (subjectSelect) subjectSelect.value = UPSC_SYLLABUS.some(s => s.subject === step.subject) ? step.subject : '';
    if (chapterSelect) { populateTimerChapters(); chapterSelect.value = step.chapter || ''; }
    document.getElementById('focusTime').value = step.duration;
    appData.timer.mode = 'timer';
    appData.timer.active = false;
    appData.timer.remaining = 0;
    appData.timer.accumulated = 0;
    appData.timer.subject = step.subject || 'General';
    appData.timer.chapter = step.chapter || '';
    appData.timer.totalDuration = Number(step.duration);
    appData.timer.endTime = null;
    appData.timer.startTime = null;
    saveData();
    renderFocusChain();
    startTimer();
    if (chainInterval) clearInterval(chainInterval);
    chainInterval = setInterval(chainTick, 1000);
}

function chainTick() {
    if (!chainState.active) return;
    const remaining = appData.timer.mode === 'timer' && appData.timer.active ? Math.max(0, Math.ceil((appData.timer.endTime - Date.now()) / 1000)) : appData.timer.remaining || chainState.remainingSeconds;
    chainState.remainingSeconds = remaining;
    const display = document.getElementById('fcTimerDisplay');
    if (display) display.textContent = `${Math.floor(remaining / 60).toString().padStart(2,'0')}:${(remaining % 60).toString().padStart(2,'0')}`;
}

function completeChainStep() {
    if (!chainState.active) return;
    clearInterval(chainInterval); chainInterval = null;
    const step = appData.focusChain[chainState.currentIdx];
    if (step) step.status = 'done';
    chainState.active = false; chainState.paused = false;
    appData.focusChainActiveIndex = null;
    saveData(); renderFocusChain();
    const next = appData.focusChain.findIndex(item => item.status === 'pending');
    if (next >= 0) setTimeout(startFocusChain, 800);
    else { const panel = document.getElementById('fcActivePanel'); if (panel) panel.style.display = 'none'; }
}

function pauseChain() {
    chainState.paused = !chainState.paused;
    if (chainState.paused) pauseTimer(); else startTimer();
    document.getElementById('fcPauseBtn').innerText = chainState.paused ? "Resume" : "Pause";
}

function skipChainStep() {
    if(confirm("Skip this step and mark as done?")) {
        clearInterval(chainInterval);
        pauseTimer();
        resetTimer();
        appData.focusChain[chainState.currentIdx].status = 'done';
        saveData();
        renderFocusChain();
        startFocusChain(); // Move to next
    }
}

function resetChain() {
    if(confirm("Reset all progress?")) {
        clearInterval(chainInterval);
        if (appData.timer.active) pauseTimer();
        resetTimer();
        chainState.active = false;
        chainState.paused = false;
        appData.focusChainActiveIndex = null;
        document.getElementById('fcActivePanel').style.display = 'none';
        document.title = "Personal Command Center";
        
        if(appData.focusChain) {
            appData.focusChain.forEach(s => s.status = 'pending');
        }
        saveData();
        renderFocusChain();
    }
}


// --- SOUNDSCAPES LOGIC (Web Audio API) ---
let audioCtx;
let noiseSource;

function toggleNoise(type) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (noiseSource) { noiseSource.stop(); noiseSource = null; }
    
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds buffer
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if(type === 'brown') {
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; 
        } else {
            // Simple white noise for others for now
            data[i] = white * 0.5;
        }
    }
    
    noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    noiseSource.connect(audioCtx.destination);
    noiseSource.start();
}
let lastOut = 0;

function stopAllNoise() {
    if (noiseSource) { noiseSource.stop(); noiseSource = null; }
}

/* =========================================
   NOTESPACE LOGIC (Notebooks -> Sections -> Pages)
   ========================================= */

// Data Structure:
// [ { id, title, sections: [ { id, title, pages: [ { id, title, content } ] } ] } ]

let nsData = Array.isArray(appData.notespaceDB) ? appData.notespaceDB : (window.AppStore ? AppStore.readCollection('notespaceDB',[]) : (JSON.parse(localStorage.getItem('notespaceDB')) || []));
appData.notespaceDB = nsData;
let activeNbId = null;
let activeSecId = null;
let activePageId = null;

function renderNoteSpace() {
    const list = document.getElementById('nsNotebookList');
    list.innerHTML = "";
    
    nsData.forEach(nb => {
        // 1. Create Notebook Div
        const nbDiv = document.createElement('div');
        nbDiv.className = `ns-notebook ${activeNbId === nb.id ? 'active' : ''}`;
        nbDiv.innerHTML = `<span>📚 ${nb.title}</span> <button onclick="addNsSection('${nb.id}', event)" style="padding:0 5px; font-size:0.6rem; background:#4b5563;">+</button>`;
        nbDiv.onclick = () => toggleNsNotebook(nb.id);
        
        // 2. Create Section Container
        const secGroup = document.createElement('div');
        secGroup.className = `ns-section-group ${activeNbId === nb.id ? 'open' : ''}`;
        
        nb.sections.forEach(sec => {
            const secDiv = document.createElement('div');
            secDiv.className = `ns-section ${activeSecId === sec.id ? 'active' : ''}`;
            secDiv.innerText = `📁 ${sec.title}`;
            secDiv.onclick = (e) => { e.stopPropagation(); selectNsSection(nb.id, sec.id); };
            secGroup.appendChild(secDiv);
        });

        list.appendChild(nbDiv);
        list.appendChild(secGroup);
    });
}

// --- ACTIONS ---

function addNotebook() {
    const title = prompt("Notebook Name (e.g. General Studies):");
    if(!title) return;
    
    const newNb = { id: Date.now().toString(), title: title, sections: [] };
    nsData.push(newNb);
    saveNsData();
    renderNoteSpace();
}

function addNsSection(nbId, e) {
    if(e) e.stopPropagation();
    const title = prompt("New Section Name (e.g. History):");
    if(!title) return;
    
    const nb = nsData.find(n => n.id === nbId);
    if(nb) {
        nb.sections.push({ id: Date.now().toString(), title: title, pages: [] });
        saveNsData();
        // Auto expand this notebook
        activeNbId = nbId; 
        renderNoteSpace();
    }
}

function toggleNsNotebook(nbId) {
    // Just toggles the accordion view
    activeNbId = (activeNbId === nbId) ? null : nbId;
    renderNoteSpace();
}

function selectNsSection(nbId, secId) {
    activeNbId = nbId;
    activeSecId = secId;
    activePageId = null; // Reset page selection
    
    renderNoteSpace(); // To highlight selection
    renderNsPageList();
    
    // Reset Editor
    document.getElementById('nsEditor').style.display = 'none';
    document.getElementById('nsToolbar').style.display = 'none';
    document.getElementById('nsPageTitle').style.display = 'none';
    document.getElementById('nsEmptyState').style.display = 'flex';
}

function renderNsPageList() {
    const pageList = document.getElementById('nsPageList');
    pageList.innerHTML = "";
    
    const nb = nsData.find(n => n.id === activeNbId);
    if(!nb) return;
    const sec = nb.sections.find(s => s.id === activeSecId);
    if(!sec) return;
    
    document.getElementById('nsCurrentSectionName').innerText = sec.title;
    document.getElementById('btnAddPage').style.display = 'block';

    if(sec.pages.length === 0) {
        pageList.innerHTML = "<div style='padding:20px; color:gray; text-align:center; font-size:0.8rem;'>No pages yet.</div>";
        return;
    }

    sec.pages.forEach(pg => {
        const pDiv = document.createElement('div');
        pDiv.className = `ns-page-item ${activePageId === pg.id ? 'active' : ''}`;
        pDiv.innerText = pg.title || "Untitled Page";
        pDiv.onclick = () => loadNsPage(pg.id);
        pageList.appendChild(pDiv);
    });
}

function addNsPage() {
    const nb = nsData.find(n => n.id === activeNbId);
    const sec = nb.sections.find(s => s.id === activeSecId);
    
    const newPage = { id: Date.now().toString(), title: "Untitled Page", content: "" };
    sec.pages.push(newPage);
    saveNsData();
    loadNsPage(newPage.id); // Auto open
}

function loadNsPage(pageId) {
    activePageId = pageId;
    renderNsPageList(); // Update highlights
    
    // Find Data
    const nb = nsData.find(n => n.id === activeNbId);
    const sec = nb.sections.find(s => s.id === activeSecId);
    const pg = sec.pages.find(p => p.id === pageId);
    
    // Show Editor
    document.getElementById('nsEmptyState').style.display = 'none';
    document.getElementById('nsToolbar').style.display = 'flex';
    
    const titleInput = document.getElementById('nsPageTitle');
    const editor = document.getElementById('nsEditor');
    
    titleInput.style.display = 'block';
    editor.style.display = 'block';
    
    titleInput.value = pg.title;
    editor.innerHTML = pg.content;
}

function saveNsCurrentPage() {
    if(!activePageId) return;
    
    const nb = nsData.find(n => n.id === activeNbId);
    const sec = nb.sections.find(s => s.id === activeSecId);
    const pg = sec.pages.find(p => p.id === activePageId);
    
    pg.title = document.getElementById('nsPageTitle').value;
    pg.content = document.getElementById('nsEditor').innerHTML;
    
    saveNsData();
    
    // Update list title dynamically if title changed
    renderNsPageList(); 
}

function saveNsData() {
    appData.notespaceDB = nsData;
    if (window.AppStore) AppStore.writeCollection('notespaceDB', nsData);
    else localStorage.setItem('notespaceDB', JSON.stringify(nsData));
    saveData();
}

// --- EDITOR TOOLBAR LOGIC ---
function execNsCmd(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('nsEditor').focus();
}

/* =========================================
   1. KANBAN COMMAND (Restructured & Safe)
   ========================================= */

function initKanbanData() {
    // 1. Ensure the main object exists
    if (!appData.kanban || typeof appData.kanban !== 'object') {
        appData.kanban = { todo: [], doing: [], done: [] };
    }
    
    // 2. Ensure every column exists as an array and sanitize old data
    ['todo', 'doing', 'done'].forEach(col => {
        if (!Array.isArray(appData.kanban[col])) {
            appData.kanban[col] = [];
        }
        
        // 3. Migration: Convert any old string tasks into objects to prevent crashes
        appData.kanban[col] = appData.kanban[col].map(task => {
            if (typeof task === 'string') {
                return { id: 'k-' + Date.now() + Math.floor(Math.random()*1000), text: task, prio: false };
            }
            return task; // If it's already an object, return it as is
        });
    });
}

function renderKanban() {
    initKanbanData();
    
    ['todo', 'doing', 'done'].forEach(col => {
        const list = document.getElementById(`list-${col}`);
        const count = document.getElementById(`count-${col}`);
        
        // Safety check: Stop here if the HTML hasn't loaded properly
        if (!list || !count) return; 

        list.innerHTML = "";
        count.innerText = appData.kanban[col].length;
        
        appData.kanban[col].forEach((task) => {
            const div = document.createElement('div');
            div.className = `kanban-card ${task.prio ? 'prio-high' : ''}`;
            div.draggable = true;
            
            // Fallback for missing text
            const safeText = task.text || "Untitled Task";
            
            div.innerHTML = `
                <div class="k-card-text">${safeText}</div>
                <div class="k-card-actions">
                    <i class="fas fa-edit k-btn-edit" onclick="editKanbanTask('${col}', '${task.id}')" title="Edit"></i>
                    <i class="fas fa-trash k-btn-del" onclick="delKanbanTask('${col}', '${task.id}')" title="Delete"></i>
                </div>
            `;
            
            // Drag Events
            div.ondragstart = (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ col, id: task.id }));
                e.dataTransfer.effectAllowed = "move";
                div.style.opacity = '0.4';
                div.style.transform = 'scale(0.95)';
            };
            div.ondragend = () => { 
                div.style.opacity = '1'; 
                div.style.transform = 'scale(1)';
            };
            
            list.appendChild(div);
        });
    });
}

function addKanbanTask(col) {
    initKanbanData();
    const input = document.getElementById(`input-${col}`);
    const val = input.value.trim();
    
    if(val) {
        const isPrio = val.startsWith('!');
        const cleanText = isPrio ? val.substring(1).trim() : val;

        appData.kanban[col].push({ 
            id: 'k-' + Date.now() + Math.floor(Math.random()*1000), 
            text: cleanText,
            prio: isPrio
        });
        
        input.value = "";
        saveData(); 
        renderKanban();
    }
}

function editKanbanTask(col, id) {
    const task = appData.kanban[col].find(t => t.id === id);
    if(task) {
        const newText = prompt("Edit Task:", task.text);
        if(newText !== null && newText.trim() !== "") {
            task.text = newText.trim();
            saveData();
            renderKanban();
        }
    }
}

function delKanbanTask(col, id) {
    if(confirm("Delete this task?")) {
        appData.kanban[col] = appData.kanban[col].filter(t => t.id !== id);
        saveData();
        renderKanban();
    }
}

function kanbanAllowDrop(e) { e.preventDefault(); }

function kanbanDrop(e) {
    e.preventDefault();
    let target = e.target;
    while(target && !target.id.startsWith('col-')) {
        target = target.parentElement;
    }
    if(!target) return;
    
    const targetCol = target.id.split('-')[1];
    
    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const srcCol = data.col;
        const taskId = data.id;

        if(srcCol !== targetCol && appData.kanban[srcCol] && appData.kanban[targetCol]) {
            const taskIndex = appData.kanban[srcCol].findIndex(t => t.id === taskId);
            if(taskIndex > -1) {
                const task = appData.kanban[srcCol].splice(taskIndex, 1)[0];
                appData.kanban[targetCol].push(task);
                saveData();
                renderKanban();
            }
        }
    } catch(err) { console.error("Drop Parse Error", err); }
}

function clearKanban() {
    if(confirm("Clear entire board? This cannot be undone.")) {
        appData.kanban = { todo: [], doing: [], done: [] };
        saveData();
        renderKanban();
    }
}

/* =========================================
   OMR DOJO v2.0 (Chapter-wise + Logging)
   ========================================= */

let omrState = {
    active: false, questions: 50, answers: {}, key: {}, 
    timer: null, timeLeft: 0, manualCheckMode: false,
    subject: "", chapter: ""
};

// 1. SETUP FUNCTIONS
function initOMR() {
    // Populate Subject Dropdown from Global Syllabus
    const subSel = document.getElementById('omrSubject');
    if(subSel && subSel.options.length === 1) { // Only do it once
        UPSC_SYLLABUS.forEach(s => {
            subSel.innerHTML += `<option value="${s.subject}">${s.subject}</option>`;
        });
    }
    renderOMRHistory();
}

function populateOMRChapters() {
    const sub = document.getElementById('omrSubject').value;
    const chapSel = document.getElementById('omrChapter');
    chapSel.innerHTML = '<option value="" disabled selected>Select Chapter</option>';
    
    const found = UPSC_SYLLABUS.find(s => s.subject === sub);
    if(found) {
        chapSel.style.display = 'block';
        found.chapters.forEach(c => {
            chapSel.innerHTML += `<option value="${c.title}">${c.title}</option>`;
        });
    } else {
        chapSel.style.display = 'none';
    }
}

function startOMR() {
    const qCount = parseInt(document.getElementById('omrQCount').value) || 50;
    const mins = parseInt(document.getElementById('omrTimeLimit').value) || 60;
    
    // Determine Test Name
    const sub = document.getElementById('omrSubject').value;
    const chap = document.getElementById('omrChapter').value;
    const manualName = document.getElementById('omrTestName').value;
    
    let displayName = manualName;
    if(!displayName && sub) displayName = `${sub} - ${chap || 'Full Test'}`;
    if(!displayName) displayName = "Untitled Mock";

    // Reset State
    omrState = {
        active: true, questions: qCount, answers: {}, key: {}, 
        timer: null, timeLeft: mins * 60, manualCheckMode: false,
        name: displayName
    };

    // UI Switch
    document.getElementById('omrSetup').style.display = 'none';
    document.getElementById('omrSheetView').style.display = 'block';
    document.getElementById('omrTimer').style.display = 'block';

    renderOMRGrid();
    startOMRTimer();
}

// 2. GRID & INTERACTION (Same as before)
function renderOMRGrid() {
    const grid = document.getElementById('omrGrid');
    grid.innerHTML = "";
    for(let i=1; i<=omrState.questions; i++) {
        const row = document.createElement('div');
        row.className = 'omr-row';
        row.id = `qrow-${i}`;
        let bubblesHtml = "";
        ['A','B','C','D'].forEach(opt => {
            bubblesHtml += `<div class="omr-bubble" onclick="clickBubble(${i}, '${opt}', this)" id="b-${i}-${opt}">${opt}</div>`;
        });
        row.innerHTML = `<div class="omr-q-num">${i}</div><div class="omr-bubbles">${bubblesHtml}</div>`;
        grid.appendChild(row);
    }
}

function clickBubble(qNum, opt, el) {
    if(omrState.manualCheckMode) { setCorrectKey(qNum, opt); return; }
    if(!omrState.active) return;
    
    const row = document.getElementById(`qrow-${qNum}`);
    
    if(omrState.answers[qNum] === opt) {
        delete omrState.answers[qNum];
        el.classList.remove('selected');
    } else {
        row.querySelectorAll('.omr-bubble').forEach(b => b.classList.remove('selected'));
        el.classList.add('selected');
        omrState.answers[qNum] = opt;
    }
    document.getElementById('omrAttemptCount').innerText = Object.keys(omrState.answers).length;
}

// 3. TIMER & SUBMISSION
function startOMRTimer() {
    clearInterval(omrState.timer);
    omrState.timer = setInterval(() => {
        omrState.timeLeft--;
        const h = Math.floor(omrState.timeLeft / 3600).toString().padStart(2,'0');
        const m = Math.floor((omrState.timeLeft % 3600) / 60).toString().padStart(2,'0');
        const s = (omrState.timeLeft % 60).toString().padStart(2,'0');
        document.getElementById('omrTimer').innerText = `${h}:${m}:${s}`;
        
        if(omrState.timeLeft <= 0) {
            submitOMR();
            alert("Time's Up!");
        }
    }, 1000);
}

function submitOMR() {
    if(!confirm("Submit Test?")) return;
    clearInterval(omrState.timer);
    omrState.active = false;
    document.getElementById('omrSheetView').style.display = 'none';
    document.getElementById('omrAnalysis').style.display = 'block';
    calcOMRScore();
}

// 4. ANALYSIS & MANUAL CHECK
function toggleOMRManualCheck() {
    omrState.manualCheckMode = !omrState.manualCheckMode;
    const btn = document.getElementById('btnManualCheck');
    if(omrState.manualCheckMode) {
        btn.innerText = "Done Inputting";
        btn.style.background = "#10b981";
        document.getElementById('omrSheetView').style.display = 'block';
        document.getElementById('omrAnalysis').style.display = 'none';
        alert("Tap correct answers on the grid.");
    } else {
        btn.innerText = "Manual Tap Mode";
        btn.style.background = "#4b5563";
        document.getElementById('omrSheetView').style.display = 'none';
        document.getElementById('omrAnalysis').style.display = 'block';
        calcOMRScore();
    }
}

function setCorrectKey(qNum, opt) {
    omrState.key[qNum] = opt;
    const row = document.getElementById(`qrow-${qNum}`);
    row.querySelectorAll('.omr-bubble').forEach(b => b.classList.remove('correct', 'missed'));
    document.getElementById(`b-${qNum}-${opt}`).classList.add('missed');
}

function processOMRKey() {
    const raw = document.getElementById('omrKeyInput').value.toUpperCase();
    const clean = raw.replace(/[^A-D]/g, '');
    if(clean.length > 0) {
        for(let i=0; i<clean.length && i < omrState.questions; i++) {
            omrState.key[i+1] = clean[i];
        }
        calcOMRScore();
    }
}

function calcOMRScore() {
    let correct = 0, wrong = 0, unattempted = 0;
    let detailHTML = "";
    
    for(let i=1; i<=omrState.questions; i++) {
        const user = omrState.answers[i];
        const right = omrState.key[i];
        let color = "gray";
        
        if(!right) { /* No key */ }
        else if (!user) { unattempted++; }
        else if (user === right) { correct++; color = "#10b981"; }
        else { wrong++; color = "#ef4444"; }
    }
    
    const netScore = (correct * 2) - (wrong * 0.66);
    const accuracy = (correct + wrong) > 0 ? Math.round((correct / (correct+wrong))*100) : 0;
    
    // Store for saving
    omrState.result = { score: netScore.toFixed(2), acc: accuracy, c: correct, w: wrong, u: unattempted };
    
    document.getElementById('resScore').innerText = netScore.toFixed(2);
    document.getElementById('resAcc').innerText = accuracy + "%";
    document.getElementById('resNeg').innerText = "-" + (wrong * 0.66).toFixed(2);
    
    // Update Chart
    const ctx = document.getElementById('omrChart');
    if(window.omrPieChart) window.omrPieChart.destroy();
    window.omrPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Correct', 'Wrong', 'Skipped'], datasets: [{ data: [correct, wrong, unattempted], backgroundColor: ['#10b981', '#ef4444', '#4b5563'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'white' } } } }
    });
}

// 5. SAVING & LOGGING (NEW)
function saveAndCloseOMR() {
    if(!omrState.result) { alert("Calculate score first!"); return; }
    
    if(!appData.omrLogs) appData.omrLogs = [];
    appData.omrLogs.unshift({
        date: new Date().toLocaleDateString(),
        name: omrState.name,
        score: omrState.result.score,
        acc: omrState.result.acc
    });
    
    saveData(); // Save to Firebase/Local
    renderOMRHistory();
    
    // Reset UI
    document.getElementById('omrSetup').style.display = 'block';
    document.getElementById('omrAnalysis').style.display = 'none';
    document.getElementById('omrTimer').style.display = 'none';
    document.getElementById('omrKeyInput').value = "";
}

function renderOMRHistory() {
    const tbody = document.getElementById('omrLogBody');
    if(!tbody) return;
    tbody.innerHTML = "";
    
    if(!appData.omrLogs || appData.omrLogs.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='text-align:center; padding:10px; color:gray;'>No tests taken yet.</td></tr>";
        return;
    }
    
    appData.omrLogs.forEach(log => {
        let color = log.score >= 100 ? '#10b981' : (log.score >= 80 ? '#f59e0b' : '#ef4444');
        tbody.innerHTML += `
            <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:5px; color:gray;">${log.date}</td>
                <td style="padding:5px;">${log.name}</td>
                <td style="padding:5px; text-align:center; font-weight:bold; color:${color};">${log.score}</td>
                <td style="padding:5px; text-align:right;">${log.acc}%</td>
            </tr>
        `;
    });
}

function clearOMRLog() {
    if(confirm("Clear test history?")) {
        appData.omrLogs = [];
        saveData();
        renderOMRHistory();
    }
}
