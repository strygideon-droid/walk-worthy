import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const $ = id => document.getElementById(id);
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[char]));

const BOOKS = [
  ["Matthew","MAT"],["Mark","MRK"],["Luke","LUK"],["John","JHN"],["Acts","ACT"],["Romans","ROM"],
  ["1 Corinthians","1CO"],["2 Corinthians","2CO"],["Galatians","GAL"],["Ephesians","EPH"],
  ["Philippians","PHP"],["Colossians","COL"],["1 Thessalonians","1TH"],["2 Thessalonians","2TH"],
  ["1 Timothy","1TI"],["2 Timothy","2TI"],["Titus","TIT"],["Philemon","PHM"],["Hebrews","HEB"],
  ["James","JAS"],["1 Peter","1PE"],["2 Peter","2PE"],["1 John","1JN"],["2 John","2JN"],
  ["3 John","3JN"],["Jude","JUD"],["Revelation","REV"]
].map(([name,code],index)=>({name,code,order:index+1}));

const CATEGORIES = [
  "Love & Relationships","Speech","Character","Spiritual Life","Community & Service",
  "Money & Stewardship","Purity & Self-Control","Justice & Mercy","Work & Responsibility",
  "Suffering & Perseverance","Truth & Wisdom","Other"
];

const STARTER_KEYWORDS = [
  ["Love","Love & Relationships"],["Forgiveness","Love & Relationships"],["Reconciliation","Love & Relationships"],
  ["Marriage","Love & Relationships"],["Family","Love & Relationships"],["Enemies","Love & Relationships"],
  ["Gossip","Speech"],["Slander","Speech"],["Truthful Speech","Speech"],["Encouragement","Speech"],
  ["Complaining","Speech"],["Correction","Speech"],["Humility","Character"],["Patience","Character"],
  ["Kindness","Character"],["Self-Control","Character"],["Integrity","Character"],["Contentment","Character"],
  ["Prayer","Spiritual Life"],["Faith","Spiritual Life"],["Worship","Spiritual Life"],["Obedience","Spiritual Life"],
  ["Scripture","Spiritual Life"],["Holy Spirit","Spiritual Life"],["Unity","Community & Service"],
  ["Service","Community & Service"],["Hospitality","Community & Service"],["Church","Community & Service"],
  ["Spiritual Gifts","Community & Service"],["Generosity","Money & Stewardship"],["Money","Money & Stewardship"],
  ["Stewardship","Money & Stewardship"],["Greed","Money & Stewardship"],["Sexual Purity","Purity & Self-Control"],
  ["Temptation","Purity & Self-Control"],["Drunkenness","Purity & Self-Control"],["Justice","Justice & Mercy"],
  ["Mercy","Justice & Mercy"],["Care for the Poor","Justice & Mercy"],["Work","Work & Responsibility"],
  ["Responsibility","Work & Responsibility"],["Perseverance","Suffering & Perseverance"],
  ["Suffering","Suffering & Perseverance"],["Hope","Suffering & Perseverance"],["Wisdom","Truth & Wisdom"],
  ["False Teaching","Truth & Wisdom"],["Discernment","Truth & Wisdom"]
];

// Suggestions deliberately describe Christian actions, habits, loyalties, and warnings.
const SUGGESTION_RULES = [
  {name:"Confession",category:"Spiritual Life",types:["Do"],patterns:[/\bconfess(?:es|ed|ing)?\b/i,/\backnowledge(?:s|d|ing)?\s+(?:our|your|their)?\s*sin/i]},
  {name:"Honesty with God",category:"Spiritual Life",types:["Do"],patterns:[/\bconfess\b/i,/\bclaim to be without sin\b/i,/\bdo not deceive ourselves\b/i]},
  {name:"Repentance",category:"Spiritual Life",types:["Do"],patterns:[/\brepent/i,/\bturn (?:away )?from (?:your )?sin/i,/\bturn to god\b/i]},
  {name:"Obedience",category:"Spiritual Life",types:["Do"],patterns:[/\bobey/i,/\bkeep (?:his|my|the) command/i,/\bdo what (?:he|i) command/i,/\bwalk as jesus did\b/i]},
  {name:"Prayer",category:"Spiritual Life",types:["Do"],patterns:[/\bpray/i,/\bpetition/i,/\bask (?:god|the father|in my name)/i]},
  {name:"Faith",category:"Spiritual Life",types:["Do"],patterns:[/\bbeliev/i,/\bfaith\b/i,/\btrust (?:in )?(?:god|jesus|the lord)/i]},
  {name:"Worship",category:"Spiritual Life",types:["Do"],patterns:[/\bworship/i,/\bpraise/i,/\bglorif(?:y|ies|ied)/i]},
  {name:"Love",category:"Love & Relationships",types:["Do"],patterns:[/\blove (?:one another|each other|your neighbour|your neighbor|your enemies|the lord|god)/i,/\bdo everything in love\b/i]},
  {name:"Forgiveness",category:"Love & Relationships",types:["Do"],patterns:[/\bforgiv/i,/\bbear with each other/i]},
  {name:"Reconciliation",category:"Love & Relationships",types:["Do"],patterns:[/\breconcil/i,/\bmake peace/i,/\bsettle matters/i]},
  {name:"Encouragement",category:"Speech",types:["Do"],patterns:[/\bencourag/i,/\bbuild(?:ing)? (?:one another|each other|others) up/i,/\bhelpful for building others up/i]},
  {name:"Truthful Speech",category:"Speech",types:["Do"],patterns:[/\bspeak (?:the )?truth/i,/\bput off falsehood/i,/\btruthful/i]},
  {name:"Gossip",category:"Speech",types:["Don't"],patterns:[/\bgossip/i,/\bbusybody/i,/\bmalicious talk/i]},
  {name:"Slander",category:"Speech",types:["Don't"],patterns:[/\bslander/i,/\bspeak evil/i,/\bmalice/i]},
  {name:"Complaining",category:"Speech",types:["Don't"],patterns:[/\bcomplain/i,/\bgrumbl/i]},
  {name:"Humility",category:"Character",types:["Do"],patterns:[/\bhumbl/i,/\bconsider others above/i,/\bdo not think of yourself more highly/i]},
  {name:"Patience",category:"Character",types:["Do"],patterns:[/\bpatient/i,/\bslow to anger/i,/\bwait (?:for|on) the lord/i]},
  {name:"Kindness",category:"Character",types:["Do"],patterns:[/\bkind(?:ness)?\b/i,/\bcompassion/i,/\btenderhearted/i]},
  {name:"Self-Control",category:"Character",types:["Do"],patterns:[/\bself[- ]control/i,/\bsober[- ]minded/i,/\bcontrol (?:your|their) bod/i]},
  {name:"Integrity",category:"Character",types:["Do"],patterns:[/\bintegrity/i,/\bblameless/i,/\bwithout hypocrisy/i,/\bdo what is right/i]},
  {name:"Contentment",category:"Character",types:["Do"],patterns:[/\bcontent/i,/\bbe satisfied/i]},
  {name:"Unity",category:"Community & Service",types:["Do"],patterns:[/\bunity/i,/\bone body/i,/\blive in harmony/i,/\bmake every effort to keep the unity/i]},
  {name:"Service",category:"Community & Service",types:["Do"],patterns:[/\bserve (?:one another|others|the lord)/i,/\buse whatever gift/i,/\bwash one another/i]},
  {name:"Hospitality",category:"Community & Service",types:["Do"],patterns:[/\bhospitality/i,/\bwelcome one another/i,/\bentertain strangers/i]},
  {name:"Generosity",category:"Money & Stewardship",types:["Do"],patterns:[/\bgenerous/i,/\bgive (?:to|what|freely|cheerfully)/i,/\bshare with/i]},
  {name:"Stewardship",category:"Money & Stewardship",types:["Do"],patterns:[/\bsteward/i,/\bentrusted/i,/\bfaithful with/i]},
  {name:"Greed",category:"Money & Stewardship",types:["Don't"],patterns:[/\bgreed/i,/\blove of money/i,/\bcovet/i]},
  {name:"Materialism",category:"Money & Stewardship",types:["Don't"],patterns:[/\bpossessions/i,/\btreasures on earth/i,/\bpride of life/i,/\bcraving for whatever we see/i]},
  {name:"Worldliness",category:"Spiritual Life",types:["Don't"],patterns:[/\bdo not love the world/i,/\blove of the father is not in them/i,/\bdesires of the flesh/i,/\bpride of life/i]},
  {name:"Sexual Purity",category:"Purity & Self-Control",types:["Do","Don't"],patterns:[/\bsexual immorality/i,/\bflee from sexual/i,/\bpure/i,/\badulter/i]},
  {name:"Temptation",category:"Purity & Self-Control",types:["Don't"],patterns:[/\btempt/i,/\bevil desire/i,/\bdesire gives birth to sin/i]},
  {name:"Mercy",category:"Justice & Mercy",types:["Do"],patterns:[/\bmerciful/i,/\bshow mercy/i,/\bmercy triumphs/i]},
  {name:"Care for the Poor",category:"Justice & Mercy",types:["Do"],patterns:[/\bpoor/i,/\bwidow/i,/\borphan/i,/\bhungry/i,/\bneedy/i]},
  {name:"Justice",category:"Justice & Mercy",types:["Do"],patterns:[/\bjustice/i,/\bact justly/i,/\bimpartial/i]},
  {name:"Work",category:"Work & Responsibility",types:["Do"],patterns:[/\bwork (?:with|at|for)/i,/\bwork with your hands/i,/\bwhatever you do, work/i]},
  {name:"Responsibility",category:"Work & Responsibility",types:["Do"],patterns:[/\bcarry (?:your|their) own load/i,/\bprovide for/i,/\bresponsib/i]},
  {name:"Perseverance",category:"Suffering & Perseverance",types:["Do"],patterns:[/\bpersever/i,/\bendure/i,/\bdo not grow weary/i,/\bstand firm/i]},
  {name:"Hope",category:"Suffering & Perseverance",types:["Do"],patterns:[/\bhope\b/i,/\bset your hope/i]},
  {name:"Discernment",category:"Truth & Wisdom",types:["Do"],patterns:[/\btest the spirits/i,/\bdiscern/i,/\btest everything/i,/\bexamine/i]},
  {name:"Test Teaching",category:"Truth & Wisdom",types:["Do"],patterns:[/\btest the spirits/i,/\btest everything/i,/\bfalse prophets/i]},
  {name:"False Teaching",category:"Truth & Wisdom",types:["Don't"],patterns:[/\bfalse prophet/i,/\bfalse teacher/i,/\bdeceiv/i,/\bdifferent gospel/i]},
  {name:"Confess Christ",category:"Spiritual Life",types:["Do"],patterns:[/\backnowledges? that jesus christ/i,/\bconfess(?:es)? (?:that )?jesus/i,/\bjesus is lord/i]},
  {name:"Wisdom",category:"Truth & Wisdom",types:["Do"],patterns:[/\bwisdom/i,/\bwise\b/i,/\bunderstanding/i]}
];

let sb;
let session = null;
let authMode = "signin";
let passages = [];
let keywords = [];
let links = [];
let selectedKeywords = new Set();
let selectedTypes = new Set();
let selectedCreedFocus = null;
let currentPassage = null;
let exactDuplicateBlocked = false;
let allowExactDuplicate = false;
let isSaving = false;
let requestId = makeRequestId();
let lastAttemptFingerprint = "";
let verseTimer;
let enterPromise = null;
let activeUserId = null;
let currentModalId = null;
let creedResizeObserver = null;

function makeRequestId(){
  return globalThis.crypto?.randomUUID?.() || `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toast(message){
  const element = $("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(()=>element.classList.remove("show"),3200);
}

function setBusy(button,on,text="Working…"){
  if(on){
    button.dataset.originalText ||= button.textContent;
    button.disabled = true;
    button.textContent = text;
  }else{
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

function formatDate(value){
  return value ? new Date(value).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"}) : "";
}

function classificationsFor(passage){
  return Array.isArray(passage.classifications) ? passage.classifications : [];
}

function keywordLinksFor(passageId){
  return links.filter(link=>link.passage_id===passageId);
}

function keywordsFor(passageId){
  const ids = new Set(keywordLinksFor(passageId).map(link=>link.keyword_id));
  return keywords.filter(keyword=>ids.has(keyword.id));
}

function keywordUsage(){
  const counts = Object.fromEntries(keywords.map(keyword=>[keyword.id,0]));
  links.forEach(link=>counts[link.keyword_id]=(counts[link.keyword_id]||0)+1);
  return counts;
}

function classificationTags(passage){
  return classificationsFor(passage).map(type=>`<span class="tag ${type==="Do"?"do":"dont"}">${type==="Don't"?"Don’t":type}</span>`).join("");
}

function emptyState(title,paragraph,buttonLabel="",pageId=""){
  return `<div class="empty"><h3>${esc(title)}</h3><p>${esc(paragraph)}</p>${buttonLabel?`<button class="btn primary" data-go="${pageId}">${esc(buttonLabel)}</button>`:""}</div>`;
}

function barList(items,emptyText="No data yet."){
  if(!items.length) return `<span class="muted">${esc(emptyText)}</span>`;
  const max = Math.max(...items.map(item=>item.count),1);
  return `<div class="bar-list">${items.map(item=>`<div><div class="bar-top"><span class="bar-name">${esc(item.name)}</span><span class="bar-count">${item.count}</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(6,item.count/max*100)}%"></div></div></div>`).join("")}</div>`;
}

function page(id,scroll=true){
  document.querySelectorAll(".page").forEach(section=>section.classList.toggle("on",section.id===id));
  document.querySelectorAll("[data-page]").forEach(button=>button.classList.toggle("on",button.dataset.page===id));
  $("side").classList.remove("open");
  render();
  if(id==="creed") requestAnimationFrame(positionCreedBubbles);
  if(scroll) window.scrollTo({top:0,behavior:"smooth"});
}

function bind(){
  document.querySelectorAll("[data-page]").forEach(button=>button.onclick=()=>page(button.dataset.page));
  wireGoButtons();
  $("menuBtn").onclick=()=>$("side").classList.toggle("open");
  $("mobileAdd").onclick=()=>page("add");
  $("logout").onclick=()=>sb?.auth.signOut();

  document.querySelectorAll("[data-mode]").forEach(button=>button.onclick=()=>setAuthMode(button.dataset.mode));
  $("authForm").onsubmit=handleAuth;

  ["book","chapter","verse"].forEach(id=>$(id).oninput=scheduleVerseLoad);
  $("loadVerse").onclick=loadVerse;
  $("typeDo").onclick=()=>toggleType("Do");
  $("typeDont").onclick=()=>toggleType("Don't");
  $("kwSearch").oninput=renderKeywordChips;
  $("addKw").onclick=addKeywordFromForm;
  $("passageForm").onsubmit=savePassage;
  $("clearBtn").onclick=clearForm;
  $("cancelEdit").onclick=()=>{clearForm();page("browse")};
  $("jesusCreed").onchange=handleCreedToggle;
  document.querySelectorAll("[data-creed-focus]").forEach(button=>button.onclick=()=>setCreedFocus(button.dataset.creedFocus));

  ["search","bookFilter","typeFilter","kwFilter","favFilter"].forEach(id=>$(id).oninput=renderBrowse);
  $("kwPageSearch").oninput=renderKeywordPage;
  $("catFilter").oninput=renderKeywordPage;
  $("showCreator").onclick=()=>$("creator").classList.toggle("hide");
  $("creatorSave").onclick=addKeywordFromPage;

  $("exportJson").onclick=exportJSON;
  $("exportCsv").onclick=exportCSV;
  $("restoreBtn").onclick=()=>$("restoreFile").click();
  $("restoreFile").onchange=restoreBackup;

  $("closeModal").onclick=closeModal;
  $("modal").onclick=event=>{if(event.target===$("modal")) closeModal()};
  $("mEdit").onclick=()=>{const id=currentModalId;closeModal();if(id) editPassage(id)};
  $("mDelete").onclick=async()=>{const id=currentModalId;closeModal();if(id) await deletePassage(id)};
  document.addEventListener("keydown",event=>{if(event.key==="Escape") closeModal()});

}

function populate(){
  $("book").innerHTML=`<option value="">Choose a book</option>${BOOKS.map(book=>`<option>${book.name}</option>`).join("")}`;
  $("bookFilter").innerHTML=`<option value="">All books</option>${BOOKS.map(book=>`<option>${book.name}</option>`).join("")}`;
  const categories=CATEGORIES.map(category=>`<option>${category}</option>`).join("");
  $("newCat").innerHTML=categories;
  $("creatorCat").innerHTML=categories;
  $("catFilter").innerHTML=`<option value="">All categories</option>${categories}`;
}

function setAuthMode(nextMode){
  authMode=nextMode;
  document.querySelectorAll("[data-mode]").forEach(button=>button.classList.toggle("on",button.dataset.mode===nextMode));
  $("authBtn").textContent=nextMode==="signin"?"Sign in":"Create account";
  $("password").autocomplete=nextMode==="signin"?"current-password":"new-password";
  $("authMsg").classList.add("hide");
}

async function handleAuth(event){
  event.preventDefault();
  setBusy($("authBtn"),true,authMode==="signin"?"Signing in…":"Creating account…");
  try{
    const email=$("email").value.trim();
    const password=$("password").value;
    const result=authMode==="signin"
      ? await sb.auth.signInWithPassword({email,password})
      : await sb.auth.signUp({email,password,options:{emailRedirectTo:location.origin}});
    if(result.error) throw result.error;
    if(authMode==="signup"&&!result.data.session){
      showAuthMessage("Account created. Check your email, confirm it, then return to sign in.","success");
    }
  }catch(error){
    showAuthMessage(error.message,"error");
  }finally{
    setBusy($("authBtn"),false);
  }
}

function showAuthMessage(message,type){
  const element=$("authMsg");
  element.textContent=message;
  element.className=`message ${type}`;
}

async function init(){
  bind();
  populate();
  try{
    const response=await fetch("/api/config",{cache:"no-store"});
    const config=await response.json();
    if(!response.ok) throw new Error(config.error||"The website is not connected to Supabase.");
    sb=createClient(config.supabaseUrl,config.supabaseKey,{auth:{persistSession:true,detectSessionInUrl:true,autoRefreshToken:true}});

    // Supabase auth callbacks stay synchronous; database work is deferred.
    sb.auth.onAuthStateChange((event,nextSession)=>{
      session=nextSession;
      if(event==="SIGNED_OUT") setTimeout(showAuth,0);
      else if(event==="SIGNED_IN"||event==="TOKEN_REFRESHED") setTimeout(enterApp,0);
    });

    const result=await sb.auth.getSession();
    if(result.error) throw result.error;
    session=result.data.session;
    if(session) await enterApp(); else showAuth();
  }catch(error){
    $("loading").classList.add("hide");
    $("auth").classList.remove("hide");
    showAuthMessage(error.message,"error");
  }
}

function showAuth(){
  activeUserId=null;
  $("loading").classList.add("hide");
  $("shell").classList.add("hide");
  $("auth").classList.remove("hide");
}

async function enterApp(){
  if(!session) return showAuth();
  if(enterPromise) return enterPromise;
  if(activeUserId===session.user.id&&!$("shell").classList.contains("hide")) return;

  enterPromise=(async()=>{
    $("loading").classList.remove("hide");
    $("auth").classList.add("hide");
    $("accountEmail").textContent=session.user.email||"";
    window.fums?.("config",{userId:session.user.id});
    try{
      await ensureStarterKeywords();
      await loadAllData();
      activeUserId=session.user.id;
      $("shell").classList.remove("hide");
    }catch(error){
      $("shell").classList.remove("hide");
      toast(`Could not load your library: ${error.message}`);
    }finally{
      $("loading").classList.add("hide");
    }
  })().finally(()=>{enterPromise=null});

  return enterPromise;
}

async function ensureStarterKeywords(){
  const result=await sb.from("keywords").select("*",{count:"exact",head:true});
  if(result.error) throw result.error;
  if(!result.count){
    const inserted=await sb.from("keywords").insert(STARTER_KEYWORDS.map(([name,category])=>({name,category})));
    if(inserted.error) throw inserted.error;
  }
}

async function loadAllData(){
  const [passageResult,keywordResult,linkResult]=await Promise.all([
    sb.from("passages").select("*").order("created_at",{ascending:false}),
    sb.from("keywords").select("*").order("name"),
    sb.from("passage_keywords").select("*")
  ]);
  if(passageResult.error) throw passageResult.error;
  if(keywordResult.error) throw keywordResult.error;
  if(linkResult.error) throw linkResult.error;
  passages=passageResult.data||[];
  keywords=keywordResult.data||[];
  links=linkResult.data||[];
  render();
}

function render(){
  renderFilters();
  renderDashboard();
  renderTypeChoices();
  renderSuggestions();
  renderKeywordChips();
  renderCreedSelector();
  renderBrowse();
  renderKeywordPage();
  renderCreedPage();
  renderInsights();
  readiness();
}

function renderFilters(){
  const current=$("kwFilter").value;
  $("kwFilter").innerHTML=`<option value="">All keywords</option>${keywords.map(keyword=>`<option value="${keyword.id}">${esc(keyword.name)}</option>`).join("")}`;
  if([...$("kwFilter").options].some(option=>option.value===current)) $("kwFilter").value=current;
}

function renderDashboard(){
  const counts=keywordUsage();
  const top=keywords.map(keyword=>({...keyword,count:counts[keyword.id]||0})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name))[0];
  $("statPassages").textContent=passages.length;
  $("statKeywords").textContent=new Set(links.map(link=>link.keyword_id)).size;
  $("statBooks").textContent=new Set(passages.map(passage=>passage.book)).size;
  $("statTop").textContent=top?.count?top.name:"—";
  $("statTopNote").textContent=top?.count?`${top.count} passage${top.count===1?"":"s"}`:"No entries yet";

  $("recent").innerHTML=passages.length?`<div class="recent-list">${passages.slice(0,5).map(passage=>{
    const passageKeywords=keywordsFor(passage.id);
    const visible=passageKeywords.slice(0,3);
    const extra=Math.max(0,passageKeywords.length-visible.length);
    return `<div class="recent-item" data-recent-id="${passage.id}"><div class="recent-book">${esc(passage.book.replace(/\s/g,"").slice(0,4))}</div><div><h4>${esc(passage.reference)}</h4><div class="tags">${classificationTags(passage)}${visible.map(keyword=>`<span class="tag">${esc(keyword.name)}</span>`).join("")}${extra?`<span class="tag more-tag">+${extra}</span>`:""}</div></div><div class="recent-date">${formatDate(passage.created_at)}</div></div>`;
  }).join("")}</div>`:emptyState("Your library is ready","Add your first passage.","Add passage","add");
  document.querySelectorAll("[data-recent-id]").forEach(item=>item.onclick=()=>viewPassage(item.dataset.recentId));

  $("dashboardKeywords").innerHTML=barList(keywords.map(keyword=>({name:keyword.name,count:counts[keyword.id]||0})).filter(item=>item.count).sort((a,b)=>b.count-a.count).slice(0,7),"No keywords recorded yet.");
  wireGoButtons();
}

function parseVerseList(value){
  const normalized=String(value||"").trim().replace(/[–—]/g,"-").replace(/\s+/g,"");
  if(!normalized) return null;
  const rawSegments=[];
  for(const token of normalized.split(",")){
    const match=token.match(/^(\d+)(?:-(\d+))?$/);
    if(!match) return null;
    const start=Number(match[1]);
    const end=Number(match[2]||match[1]);
    if(start<1||end<start) return null;
    rawSegments.push({startVerse:start,endVerse:end});
  }
  rawSegments.sort((a,b)=>a.startVerse-b.startVerse||a.endVerse-b.endVerse);
  const merged=[];
  for(const segment of rawSegments){
    const previous=merged[merged.length-1];
    if(previous&&segment.startVerse<=previous.endVerse){
      previous.endVerse=Math.max(previous.endVerse,segment.endVerse);
    }else{
      merged.push({...segment});
    }
  }
  return merged;
}

function displaySegments(segments){
  return segments.map(segment=>segment.startVerse===segment.endVerse?String(segment.startVerse):`${segment.startVerse}–${segment.endVerse}`).join(", ");
}

function verseSignature(chapter,segments){
  return segments.map(segment=>`${chapter}:${segment.startVerse}-${segment.endVerse}`).join(";");
}

function getSelection(showError=true){
  const book=BOOKS.find(item=>item.name===$("book").value);
  const chapter=Number($("chapter").value);
  const parsed=parseVerseList($("verse").value);
  if(!book||!Number.isInteger(chapter)||chapter<1||!parsed){
    if(showError) toast("Choose a valid book, chapter, and verse list such as 12,15 or 12–13,15.");
    return null;
  }
  const segments=parsed.map(segment=>({
    chapter,
    startVerse:segment.startVerse,
    endVerse:segment.endVerse,
    apiPassageId:`${book.code}.${chapter}.${segment.startVerse}-${book.code}.${chapter}.${segment.endVerse}`
  }));
  return {
    book,chapter,segments,
    signature:verseSignature(chapter,segments),
    reference:`${book.name} ${chapter}:${displaySegments(segments)}`,
    start:Math.min(...segments.map(segment=>segment.startVerse)),
    end:Math.max(...segments.map(segment=>segment.endVerse))
  };
}

function scheduleVerseLoad(){
  currentPassage=null;
  $("verseBox").classList.add("hide");
  $("dupe").classList.add("hide");
  exactDuplicateBlocked=false;
  allowExactDuplicate=false;
  clearTimeout(verseTimer);
  verseTimer=setTimeout(()=>{if(getSelection(false)) loadVerse()},750);
  renderSuggestions();
  readiness();
}

function cleanText(value){
  return String(value||"").replace(/\s+/g," ").replace(/\s([,.;:!?])/g,"$1").trim();
}

async function fetchSegment(segment){
  const response=await fetch(`/api/verse?passageId=${encodeURIComponent(segment.apiPassageId)}`,{cache:"no-store"});
  const data=await response.json();
  if(!response.ok) throw new Error(data.error||"The passage could not be loaded.");
  if(data.fumsToken) window.fums?.("trackView",data.fumsToken);
  return data;
}

async function loadVerse(){
  const selected=getSelection();
  if(!selected) return;
  setBusy($("loadVerse"),true,"Loading…");
  $("verseStatus").textContent="Retrieving NIV passage…";
  try{
    const results=await Promise.all(selected.segments.map(fetchSegment));
    const content=results.map(result=>cleanText(result.content)).join("\n\n");
    currentPassage={
      ...selected,
      content,
      bibleId:results[0]?.bibleId||"",
      apiPassageIds:selected.segments.map(segment=>segment.apiPassageId),
      copyright:results[0]?.copyright||""
    };
    $("verseRef").textContent=selected.reference;
    $("verseCount").textContent=`${selected.segments.reduce((sum,segment)=>sum+(segment.endVerse-segment.startVerse+1),0)} selected verse${selected.segments.reduce((sum,segment)=>sum+(segment.endVerse-segment.startVerse+1),0)===1?"":"s"}`;
    $("verseText").textContent=content;
    $("verseCopyright").textContent=currentPassage.copyright;
    $("verseBox").classList.remove("hide");
    $("verseStatus").textContent="NIV passage loaded. Confirm it below.";
    renderDuplicates(selected);
    renderSuggestions();
  }catch(error){
    currentPassage=null;
    $("verseBox").classList.add("hide");
    $("verseStatus").textContent=error.message;
    toast(error.message);
  }finally{
    setBusy($("loadVerse"),false);
    readiness();
  }
}

function segmentsForPassage(passage){
  if(Array.isArray(passage.verse_segments)&&passage.verse_segments.length){
    return passage.verse_segments.map(segment=>({
      chapter:Number(segment.chapter??passage.start_chapter),
      startVerse:Number(segment.startVerse??segment.start_verse),
      endVerse:Number(segment.endVerse??segment.end_verse),
      apiPassageId:segment.apiPassageId??segment.api_passage_id
    }));
  }
  return [{
    chapter:Number(passage.start_chapter),
    startVerse:Number(passage.start_verse),
    endVerse:Number(passage.end_verse),
    apiPassageId:passage.api_passage_id
  }];
}

function signatureForPassage(passage){
  return passage.verse_signature||verseSignature(Number(passage.start_chapter),segmentsForPassage(passage));
}

function segmentsOverlap(a,b){
  return Number(a.chapter)===Number(b.chapter)&&Number(a.startVerse)<=Number(b.endVerse)&&Number(a.endVerse)>=Number(b.startVerse);
}

function renderDuplicates(selected){
  const editId=$("editId").value;
  const matches=passages.filter(passage=>passage.id!==editId&&Number(passage.book_order)===selected.book.order).map(passage=>{
    const exact=signatureForPassage(passage)===selected.signature;
    const overlap=segmentsForPassage(passage).some(existing=>selected.segments.some(candidate=>segmentsOverlap(existing,candidate)));
    return overlap?{...passage,kind:exact?"exact":"overlap"}:null;
  }).filter(Boolean);

  exactDuplicateBlocked=matches.some(match=>match.kind==="exact");
  allowExactDuplicate=false;
  const box=$("dupe");
  if(!matches.length){
    box.classList.add("hide");
    readiness();
    return;
  }

  box.className=`duplicate ${exactDuplicateBlocked?"exact":""}`;
  box.innerHTML=`<div class="duplicate-title">${exactDuplicateBlocked?"You already added this exact passage.":"This selection overlaps an earlier passage."}</div>${matches.map(match=>`<div class="duplicate-item"><strong>${esc(match.reference)}</strong>${match.comment?`<p>${esc(match.comment)}</p>`:""}<small>${esc(keywordsFor(match.id).map(keyword=>keyword.name).join(", "))}</small></div>`).join("")}${exactDuplicateBlocked?`<label class="allow-duplicate"><input id="allowDupe" type="checkbox"> Save another separate entry for this exact selection anyway</label>`:""}`;
  box.classList.remove("hide");
  $("allowDupe")?.addEventListener("change",event=>{
    allowExactDuplicate=event.target.checked;
    exactDuplicateBlocked=!allowExactDuplicate;
    readiness();
  });
  readiness();
}

function toggleType(type){
  if(selectedTypes.has(type)) selectedTypes.delete(type); else selectedTypes.add(type);
  renderTypeChoices();
  renderSuggestions();
  readiness();
}

function renderTypeChoices(){
  $("typeDo").classList.toggle("on",selectedTypes.has("Do"));
  $("typeDont").classList.toggle("on",selectedTypes.has("Don't"));
}

function suggestionScore(rule,text,reference){
  if(selectedTypes.size&&rule.types&&!rule.types.some(type=>selectedTypes.has(type))) return 0;
  let score=0;
  for(const pattern of rule.patterns){
    if(pattern.test(text)) score+=2;
  }
  const special={
    "1 John 1:9":["Confession","Honesty with God","Repentance"],
    "1 John 2:15":["Worldliness","Materialism"],
    "1 John 4:1–2":["Discernment","Test Teaching","False Teaching","Confess Christ"]
  };
  if(special[reference]?.includes(rule.name)) score+=5;
  return score;
}

function getKeywordSuggestions(){
  if(!currentPassage||selectedTypes.size===0) return [];
  const text=currentPassage.content.toLowerCase();
  return SUGGESTION_RULES.map(rule=>({...rule,score:suggestionScore(rule,text,currentPassage.reference)}))
    .filter(rule=>rule.score>0)
    .sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name))
    .slice(0,7);
}

function renderSuggestions(){
  const suggestions=getKeywordSuggestions();
  if(!currentPassage){
    $("suggestionHint").textContent="Load a passage and choose Do or Don’t to see suggestions.";
    $("suggestions").innerHTML="";
    return;
  }
  if(selectedTypes.size===0){
    $("suggestionHint").textContent="Choose Do or Don’t so the suggestions match the instruction.";
    $("suggestions").innerHTML="";
    return;
  }
  $("suggestionHint").textContent="Suggestions focus on what Christians should practise or avoid.";
  if(!suggestions.length){
    $("suggestions").innerHTML=`<span class="suggestion-empty">No strong suggestion found. Choose from your library or create your own.</span>`;
    return;
  }
  $("suggestions").innerHTML=suggestions.map(suggestion=>{
    const existing=keywords.find(keyword=>keyword.name.toLowerCase()===suggestion.name.toLowerCase());
    const selected=existing&&selectedKeywords.has(existing.id);
    return `<button type="button" class="suggestion-chip ${selected?"selected":""} ${existing?"":"new"}" data-suggestion-name="${esc(suggestion.name)}" data-suggestion-category="${esc(suggestion.category)}">${esc(suggestion.name)}</button>`;
  }).join("");
  document.querySelectorAll("[data-suggestion-name]").forEach(button=>button.onclick=()=>chooseSuggestion(button.dataset.suggestionName,button.dataset.suggestionCategory));
}

async function chooseSuggestion(name,category){
  try{
    let keyword=keywords.find(item=>item.name.toLowerCase()===name.toLowerCase());
    if(!keyword) keyword=await addKeyword(name,category);
    if(selectedKeywords.has(keyword.id)) selectedKeywords.delete(keyword.id); else selectedKeywords.add(keyword.id);
    renderKeywordChips();
    renderSuggestions();
    readiness();
  }catch(error){
    toast(error.message);
  }
}

function renderKeywordChips(){
  const query=$("kwSearch").value.trim().toLowerCase();
  const list=keywords.filter(keyword=>!query||`${keyword.name} ${keyword.category}`.toLowerCase().includes(query));
  $("kwChips").innerHTML=list.length?list.map(keyword=>`<button type="button" class="chip ${selectedKeywords.has(keyword.id)?"on":""}" data-keyword="${keyword.id}" title="${esc(keyword.category)}">${esc(keyword.name)}</button>`).join(""):`<span class="muted">No matching keywords.</span>`;
  document.querySelectorAll("[data-keyword]").forEach(button=>button.onclick=()=>{
    const id=button.dataset.keyword;
    if(selectedKeywords.has(id)) selectedKeywords.delete(id); else selectedKeywords.add(id);
    renderKeywordChips();
    renderSuggestions();
    readiness();
  });
}

async function addKeyword(name,category){
  name=String(name||"").trim();
  if(!name) throw new Error("Enter a keyword name.");
  const existing=keywords.find(keyword=>keyword.name.toLowerCase()===name.toLowerCase());
  if(existing) return existing;
  const result=await sb.from("keywords").insert({name,category:category||"Other"}).select().single();
  if(result.error) throw result.error;
  keywords.push(result.data);
  keywords.sort((a,b)=>a.name.localeCompare(b.name));
  return result.data;
}

async function addKeywordFromForm(){
  setBusy($("addKw"),true,"Adding…");
  try{
    const keyword=await addKeyword($("newKw").value,$("newCat").value);
    selectedKeywords.add(keyword.id);
    $("newKw").value="";
    $("kwSearch").value="";
    render();
    toast("Keyword added and selected.");
  }catch(error){toast(error.message)}finally{setBusy($("addKw"),false)}
}

async function addKeywordFromPage(){
  setBusy($("creatorSave"),true,"Saving…");
  try{
    await addKeyword($("creatorName").value,$("creatorCat").value);
    $("creatorName").value="";
    $("creator").classList.add("hide");
    render();
    toast("Keyword created.");
  }catch(error){toast(error.message)}finally{setBusy($("creatorSave"),false)}
}

function handleCreedToggle(){
  if(!$("jesusCreed").checked) selectedCreedFocus=null;
  renderCreedSelector();
  readiness();
}

function setCreedFocus(focus){
  selectedCreedFocus=focus;
  $("jesusCreed").checked=true;
  renderCreedSelector();
  readiness();
}

function renderCreedSelector(){
  const checked=$("jesusCreed").checked;
  $("creedFocusBox").classList.toggle("hide",!checked);
  document.querySelectorAll("[data-creed-focus]").forEach(button=>button.classList.toggle("on",button.dataset.creedFocus===selectedCreedFocus));
}

function readiness(){
  const creedReady=!$("jesusCreed").checked||Boolean(selectedCreedFocus);
  const ready=Boolean(currentPassage)&&selectedTypes.size>0&&selectedKeywords.size>0&&creedReady&&!exactDuplicateBlocked&&!isSaving;
  $("save").disabled=!ready;
  $("ready").textContent=!currentPassage?"Load a valid passage before saving.":selectedTypes.size===0?"Choose Do, Don’t, or both.":exactDuplicateBlocked?"Confirm the exact duplicate first.":selectedKeywords.size===0?"Select at least one keyword.":!creedReady?"Choose Love God, Love Others, or Both for the Jesus Creed.":isSaving?"Saving securely…":"Ready to save.";
}

function payloadFingerprint(payload,keywordIds,types){
  return JSON.stringify({payload,keywordIds:[...keywordIds].sort(),types:[...types].sort()});
}

async function savePassage(event){
  event.preventDefault();
  if(isSaving||$("save").disabled||!currentPassage) return;

  const editId=$("editId").value||null;
  const verseSegments=currentPassage.segments.map(segment=>({
    chapter:segment.chapter,
    startVerse:segment.startVerse,
    endVerse:segment.endVerse,
    apiPassageId:segment.apiPassageId
  }));
  const payload={
    book:currentPassage.book.name,
    book_order:currentPassage.book.order,
    start_chapter:currentPassage.chapter,
    start_verse:currentPassage.start,
    end_chapter:currentPassage.chapter,
    end_verse:currentPassage.end,
    reference:currentPassage.reference,
    bible_id:currentPassage.bibleId,
    api_passage_id:currentPassage.apiPassageIds.join(","),
    translation:"NIV",
    comment:$("comment").value.trim(),
    is_favorite:$("fav").checked,
    verse_segments:verseSegments,
    verse_signature:currentPassage.signature,
    is_jesus_creed:$("jesusCreed").checked,
    jesus_creed_focus:$("jesusCreed").checked?selectedCreedFocus:null
  };

  const fingerprint=payloadFingerprint(payload,selectedKeywords,selectedTypes);
  if(fingerprint!==lastAttemptFingerprint){
    requestId=makeRequestId();
    lastAttemptFingerprint=fingerprint;
  }

  isSaving=true;
  setBusy($("save"),true,editId?"Updating…":"Saving…");
  readiness();

  try{
    const result=await sb.rpc("save_passage_with_keywords",{
      p_passage_id:editId,
      p_client_request_id:requestId,
      p_book:payload.book,
      p_book_order:payload.book_order,
      p_start_chapter:payload.start_chapter,
      p_start_verse:payload.start_verse,
      p_end_chapter:payload.end_chapter,
      p_end_verse:payload.end_verse,
      p_reference:payload.reference,
      p_bible_id:payload.bible_id,
      p_api_passage_id:payload.api_passage_id,
      p_translation:payload.translation,
      p_comment:payload.comment,
      p_is_favorite:payload.is_favorite,
      p_classifications:[...selectedTypes],
      p_keyword_ids:[...selectedKeywords],
      p_allow_exact_duplicate:allowExactDuplicate,
      p_verse_segments:payload.verse_segments,
      p_verse_signature:payload.verse_signature,
      p_is_jesus_creed:payload.is_jesus_creed,
      p_jesus_creed_focus:payload.jesus_creed_focus
    });
    if(result.error) throw result.error;

    const message=editId?"Passage updated.":"Passage saved.";
    await loadAllData();
    clearForm();
    page("browse");
    toast(message);
  }catch(error){
    if(String(error.message||"").includes("EXACT_DUPLICATE")){
      exactDuplicateBlocked=true;
      allowExactDuplicate=false;
      toast("That exact passage already exists. Confirm the duplicate option only if you truly want another entry.");
      const selected=getSelection(false);
      if(selected) renderDuplicates(selected);
    }else{
      toast(`Save failed: ${error.message}`);
    }
  }finally{
    isSaving=false;
    setBusy($("save"),false);
    readiness();
  }
}

function clearForm(){
  $("passageForm").reset();
  $("editId").value="";
  $("formTitle").textContent="Add a Passage";
  $("save").textContent="Save passage";
  $("cancelEdit").classList.add("hide");
  $("verseBox").classList.add("hide");
  $("dupe").classList.add("hide");
  $("verseStatus").textContent="Select a New Testament passage.";
  currentPassage=null;
  selectedKeywords=new Set();
  selectedTypes=new Set();
  selectedCreedFocus=null;
  exactDuplicateBlocked=false;
  allowExactDuplicate=false;
  requestId=makeRequestId();
  lastAttemptFingerprint="";
  render();
}

async function editPassage(id){
  const passage=passages.find(item=>item.id===id);
  if(!passage) return;
  page("add");
  $("editId").value=id;
  $("formTitle").textContent="Edit Passage";
  $("save").textContent="Update passage";
  $("cancelEdit").classList.remove("hide");
  $("book").value=passage.book;
  $("chapter").value=passage.start_chapter;
  const segments=segmentsForPassage(passage);
  $("verse").value=displaySegments(segments);
  $("comment").value=passage.comment||"";
  $("fav").checked=Boolean(passage.is_favorite);
  $("jesusCreed").checked=Boolean(passage.is_jesus_creed);
  selectedCreedFocus=passage.jesus_creed_focus||null;
  selectedKeywords=new Set(keywordLinksFor(id).map(link=>link.keyword_id));
  selectedTypes=new Set(classificationsFor(passage));
  requestId=makeRequestId();
  lastAttemptFingerprint="";
  renderTypeChoices();
  renderKeywordChips();
  renderCreedSelector();
  await loadVerse();
}

async function deletePassage(id){
  const passage=passages.find(item=>item.id===id);
  if(!passage||!confirm(`Delete ${passage.reference}? This cannot be undone.`)) return;
  const result=await sb.from("passages").delete().eq("id",id);
  if(result.error) return toast(result.error.message);
  await loadAllData();
  toast("Passage deleted.");
}

async function toggleFavourite(id){
  const passage=passages.find(item=>item.id===id);
  if(!passage) return;
  const result=await sb.from("passages").update({is_favorite:!passage.is_favorite}).eq("id",id);
  if(result.error) return toast(result.error.message);
  passage.is_favorite=!passage.is_favorite;
  render();
}

function renderBrowse(){
  const query=$("search").value.trim().toLowerCase();
  const book=$("bookFilter").value;
  const type=$("typeFilter").value;
  const keyword=$("kwFilter").value;
  const favourites=$("favFilter").checked;

  const list=passages.filter(passage=>{
    const names=keywordsFor(passage.id).map(item=>item.name);
    const types=classificationsFor(passage);
    const typeMatch=!type||(type==="Unclassified"?types.length===0:types.includes(type));
    const haystack=`${passage.reference} ${passage.comment||""} ${names.join(" ")} ${types.join(" ")}`.toLowerCase();
    return (!query||haystack.includes(query))&&(!book||passage.book===book)&&typeMatch&&(!keyword||links.some(link=>link.passage_id===passage.id&&link.keyword_id===keyword))&&(!favourites||passage.is_favorite);
  });

  $("browseCount").textContent=`${list.length} of ${passages.length} passage${passages.length===1?"":"s"} shown`;
  $("passageGrid").innerHTML=list.length?list.map(passage=>{
    const passageKeywords=keywordsFor(passage.id);
    const visible=passageKeywords.slice(0,4);
    const extra=Math.max(0,passageKeywords.length-visible.length);
    return `<article class="passage-card" data-passage-card="${passage.id}" tabindex="0" role="button" aria-label="Open ${esc(passage.reference)}"><div class="passage-top"><div><h3>${esc(passage.reference)}</h3><small class="muted">NIV</small></div><button class="star-btn ${passage.is_favorite?"on":""}" data-favourite="${passage.id}" aria-label="Toggle favourite">${passage.is_favorite?"★":"☆"}</button></div><div class="tags">${classificationTags(passage)}${passage.is_jesus_creed?`<span class="tag creed">Jesus Creed</span>`:""}</div><div class="tags">${visible.map(item=>`<span class="tag">${esc(item.name)}</span>`).join("")}${extra?`<span class="tag more-tag">+${extra}</span>`:""}</div><div class="card-footer"><span class="date">${formatDate(passage.created_at)}</span><span class="open-hint">Open passage ›</span></div></article>`;
  }).join(""):emptyState(passages.length?"No passages found":"No passages yet",passages.length?"Try another filter.":"Add your first passage.",passages.length?"":"Add passage","add");

  document.querySelectorAll("[data-passage-card]").forEach(card=>{
    card.onclick=()=>viewPassage(card.dataset.passageCard);
    card.onkeydown=event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();viewPassage(card.dataset.passageCard)}};
  });
  document.querySelectorAll("[data-favourite]").forEach(button=>button.onclick=event=>{event.stopPropagation();toggleFavourite(button.dataset.favourite)});
  wireGoButtons();
}

async function fetchPassageDisplay(passage){
  const segments=segmentsForPassage(passage);
  const results=await Promise.all(segments.map(fetchSegment));
  return {
    text:results.map(result=>cleanText(result.content)).join("\n\n"),
    copyright:results[0]?.copyright||""
  };
}

async function viewPassage(id){
  const passage=passages.find(item=>item.id===id);
  if(!passage) return;
  currentModalId=id;
  $("mRef").textContent=passage.reference;
  $("mMeta").innerHTML=`${classificationTags(passage)}${keywordsFor(id).map(keyword=>`<span class="tag">${esc(keyword.name)}</span>`).join("")}${passage.is_jesus_creed?`<span class="tag creed">Jesus Creed · ${esc(passage.jesus_creed_focus||"")}</span>`:""}${passage.is_favorite?`<span class="tag">★ Favourite</span>`:""}`;
  const comment=String(passage.comment||"").trim();
  $("mComment").textContent=comment||"No personal comment added.";
  $("mCommentBlock").classList.toggle("empty-comment",!comment);
  $("mLoading").classList.remove("hide");
  $("mLoading").textContent="Loading NIV passage…";
  $("mText").classList.add("hide");
  $("mCopy").textContent="";
  $("modal").classList.remove("hide");
  try{
    const display=await fetchPassageDisplay(passage);
    $("mText").textContent=display.text;
    $("mCopy").textContent=display.copyright;
    $("mLoading").classList.add("hide");
    $("mText").classList.remove("hide");
  }catch(error){
    $("mLoading").textContent=error.message;
  }
}

function closeModal(){
  $("modal").classList.add("hide");
  currentModalId=null;
}

function renderKeywordPage(){
  const counts=keywordUsage();
  const query=$("kwPageSearch").value.trim().toLowerCase();
  const category=$("catFilter").value;
  const list=keywords.filter(keyword=>(!query||keyword.name.toLowerCase().includes(query))&&(!category||keyword.category===category)).sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0)||a.name.localeCompare(b.name));
  $("kwGrid").innerHTML=list.length?list.map(keyword=>`<div class="keyword-card"><div class="keyword-card-top"><div><h3>${esc(keyword.name)}</h3><div class="keyword-category">${esc(keyword.category)}</div></div><div class="keyword-count">${counts[keyword.id]||0}</div></div><div class="keyword-actions"><button class="btn secondary small" data-keyword-view="${keyword.id}">View passages</button><button class="btn secondary small" data-keyword-delete="${keyword.id}" ${(counts[keyword.id]||0)?"disabled":""}>Delete</button></div></div>`).join(""):emptyState("No matching keywords","Try another search or category.");
  document.querySelectorAll("[data-keyword-view]").forEach(button=>button.onclick=()=>{$("kwFilter").value=button.dataset.keywordView;page("browse")});
  document.querySelectorAll("[data-keyword-delete]").forEach(button=>button.onclick=()=>deleteKeyword(button.dataset.keywordDelete));
}

async function deleteKeyword(id){
  if(keywordUsage()[id]) return toast("This keyword is still used.");
  const keyword=keywords.find(item=>item.id===id);
  if(!keyword||!confirm(`Delete ${keyword.name}?`)) return;
  const result=await sb.from("keywords").delete().eq("id",id);
  if(result.error) return toast(result.error.message);
  await loadAllData();
}

function renderCreedPage(){
  const stage=$("creedStage");
  const creedPassages=passages.filter(passage=>passage.is_jesus_creed);
  stage.innerHTML=`<div class="creed-center"><strong>Jesus<br>Creed</strong><span>Love God · Love Others</span></div>${creedPassages.map((passage,index)=>`<button class="creed-bubble ${creedClass(passage.jesus_creed_focus)}" data-creed-index="${index}" data-creed-id="${passage.id}">${esc(passage.reference)}</button>`).join("")}${creedPassages.length?"":`<div class="creed-empty">Passages you mark as Jesus Creed will gather around the centre here.</div>`}`;
  document.querySelectorAll("[data-creed-id]").forEach(button=>button.onclick=()=>viewPassage(button.dataset.creedId));
  requestAnimationFrame(positionCreedBubbles);
  if(!creedResizeObserver&&globalThis.ResizeObserver){
    creedResizeObserver=new ResizeObserver(()=>positionCreedBubbles());
    creedResizeObserver.observe(stage);
  }
}

function creedClass(focus){
  return focus==="Love God"?"god":focus==="Love Others"?"others":"both";
}

function positionCreedBubbles(){
  const stage=$("creedStage");
  if(!stage||stage.offsetParent===null) return;
  const bubbles=[...stage.querySelectorAll(".creed-bubble")];
  const count=bubbles.length;
  const rings=Math.max(1,Math.ceil(count/10));
  const height=Math.max(520,440+rings*95);
  stage.style.minHeight=`${height}px`;
  const width=stage.clientWidth;
  const centreX=width/2;
  const centreY=height/2;

  bubbles.forEach((bubble,index)=>{
    const ring=Math.floor(index/10);
    const ringStart=ring*10;
    const ringCount=Math.min(10,count-ringStart);
    const position=index-ringStart;
    const angle=-Math.PI/2+(position/ringCount)*Math.PI*2+(ring%2?Math.PI/ringCount:0);
    const maxRx=Math.max(105,width/2-72);
    const radiusX=Math.min(maxRx,Math.max(125,145+ring*82));
    const radiusY=Math.min(height/2-65,Math.max(155,170+ring*88));
    bubble.style.left=`${centreX+Math.cos(angle)*radiusX}px`;
    bubble.style.top=`${centreY+Math.sin(angle)*radiusY}px`;
  });
}

function renderInsights(){
  const counts=keywordUsage();
  const books={};
  const categories={};
  passages.forEach(passage=>books[passage.book]=(books[passage.book]||0)+1);
  links.forEach(link=>{
    const keyword=keywords.find(item=>item.id===link.keyword_id);
    if(keyword) categories[keyword.category]=(categories[keyword.category]||0)+1;
  });

  const doCount=passages.filter(passage=>classificationsFor(passage).includes("Do")).length;
  const dontCount=passages.filter(passage=>classificationsFor(passage).includes("Don't")).length;
  $("snapshot").innerHTML=`<div class="snapshot-grid"><div class="snapshot"><span>Passages</span><strong>${passages.length}</strong></div><div class="snapshot"><span>Keywords Used</span><strong>${new Set(links.map(link=>link.keyword_id)).size}</strong></div><div class="snapshot"><span>Books Referenced</span><strong>${new Set(passages.map(passage=>passage.book)).size}</strong></div><div class="snapshot"><span>Jesus Creed</span><strong>${passages.filter(passage=>passage.is_jesus_creed).length}</strong></div></div>`;
  $("iKw").innerHTML=barList(keywords.map(keyword=>({name:keyword.name,count:counts[keyword.id]||0})).filter(item=>item.count).sort((a,b)=>b.count-a.count).slice(0,10));
  $("iBooks").innerHTML=barList(Object.entries(books).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count));
  $("iCats").innerHTML=barList(Object.entries(categories).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count));
  $("iTypes").innerHTML=barList([{name:"Do",count:doCount},{name:"Don’t",count:dontCount}].filter(item=>item.count));
}

function backupObject(){
  return {
    app:"Walk Worthy",
    version:3,
    exported_at:new Date().toISOString(),
    passages:passages.map(({user_id,start_key,end_key,...rest})=>rest),
    keywords:keywords.map(({user_id,...rest})=>rest),
    passage_keywords:links.map(({user_id,...rest})=>rest)
  };
}

function download(name,text,type){
  const anchor=document.createElement("a");
  const url=URL.createObjectURL(new Blob([text],{type}));
  anchor.href=url;
  anchor.download=name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function exportJSON(){
  download(`walk-worthy-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(backupObject(),null,2),"application/json");
  toast("JSON backup downloaded.");
}

function csvCell(value){return `"${String(value??"").replace(/"/g,'""')}"`}

function exportCSV(){
  const rows=[["Reference","Book","Chapter","Verse Selection","Do / Don't","Comment","Keywords","Jesus Creed","Jesus Creed Focus","Favourite","Created"],...passages.map(passage=>[
    passage.reference,passage.book,passage.start_chapter,displaySegments(segmentsForPassage(passage)),classificationsFor(passage).join("; "),passage.comment||"",keywordsFor(passage.id).map(keyword=>keyword.name).join("; "),passage.is_jesus_creed?"Yes":"No",passage.jesus_creed_focus||"",passage.is_favorite?"Yes":"No",passage.created_at
  ])];
  download(`walk-worthy-passages-${new Date().toISOString().slice(0,10)}.csv`,"\uFEFF"+rows.map(row=>row.map(csvCell).join(",")).join("\n"),"text/csv;charset=utf-8");
  toast("CSV downloaded.");
}

function normaliseBackupPassage(passage){
  const clean={...passage};
  delete clean.user_id;
  delete clean.start_key;
  delete clean.end_key;
  if(!Array.isArray(clean.verse_segments)||!clean.verse_segments.length){
    clean.verse_segments=[{
      chapter:Number(clean.start_chapter),
      startVerse:Number(clean.start_verse),
      endVerse:Number(clean.end_verse),
      apiPassageId:clean.api_passage_id
    }];
  }
  clean.verse_signature=clean.verse_signature||verseSignature(Number(clean.start_chapter),clean.verse_segments);
  clean.is_jesus_creed=Boolean(clean.is_jesus_creed);
  clean.jesus_creed_focus=clean.is_jesus_creed?(clean.jesus_creed_focus||"Both"):null;
  clean.comment=clean.comment||"";
  return clean;
}

async function restoreBackup(event){
  const file=event.target.files?.[0];
  event.target.value="";
  if(!file) return;
  try{
    const data=JSON.parse(await file.text());
    if(data.app!=="Walk Worthy"||!Array.isArray(data.passages)||!Array.isArray(data.keywords)||!Array.isArray(data.passage_keywords)) throw new Error("Invalid Walk Worthy backup.");
    if(!confirm("Replace all current data with this backup?")) return;
    $("loading").classList.remove("hide");

    let result=await sb.from("passage_keywords").delete().neq("passage_id","00000000-0000-0000-0000-000000000000");
    if(result.error) throw result.error;
    result=await sb.from("passages").delete().neq("id","00000000-0000-0000-0000-000000000000");
    if(result.error) throw result.error;
    result=await sb.from("keywords").delete().neq("id","00000000-0000-0000-0000-000000000000");
    if(result.error) throw result.error;

    if(data.keywords.length){
      result=await sb.from("keywords").insert(data.keywords.map(({user_id,...rest})=>rest));
      if(result.error) throw result.error;
    }
    if(data.passages.length){
      result=await sb.from("passages").insert(data.passages.map(normaliseBackupPassage));
      if(result.error) throw result.error;
    }
    if(data.passage_keywords.length){
      result=await sb.from("passage_keywords").insert(data.passage_keywords.map(({user_id,...rest})=>rest));
      if(result.error) throw result.error;
    }

    await loadAllData();
    page("dashboard");
    toast("Backup restored.");
  }catch(error){
    toast(error.message);
  }finally{
    $("loading").classList.add("hide");
  }
}

function wireGoButtons(){
  document.querySelectorAll("[data-go]").forEach(button=>button.onclick=()=>page(button.dataset.go));
}


init();
