// ═══════════════════════════════════════════════════════════════
//  ForcedVN — forcedVN.js
//
//  USAGE:
//    <script src="forcedVN.js"></script>
//    Then call VN.init({ ... }) at the bottom of this file,
//    or put your game in a separate .js file loaded after.
//
//  SPRITE PATHS:
//    sprite: "assets/sprites/P1.png"   ← local file
//    sprite: "https://example.com/a.png"  ← URL
//    sprites: { default: "a.png", happy: "a_happy.png" }
//
//  AUDIO:  local paths, e.g. "assets/music/theme.mp3"
//
//  THEMING:
//    Put a `theme: { ... }` object in VN.init(), or call
//    VN.theme({ accent: "#ff6b6b" }) anytime to update live.
//
//  SETTINGS CONFIG:
//    settings: {
//      textSpeed: true, musicVolume: true, sfxVolume: true,
//      autoSave: true, fullscreen: true,
//      myToggle: { label: "My Option", type: "toggle", default: false }
//    }
// ═══════════════════════════════════════════════════════════════

(function buildEngine() {

// ── INJECT STYLES ───────────────────────────────────────────────
document.head.insertAdjacentHTML('beforeend', `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style id="vn-theme-vars">
:root {
  --vn-bg: #0a0a0f;
  --vn-panel: rgba(8,8,16,0.92);
  --vn-panel-blur: 12px;
  --vn-border: rgba(255,255,255,0.08);
  --vn-accent: #c89b6e;
  --vn-accent2: #7e9fc7;
  --vn-text: #e8e0d4;
  --vn-muted: rgba(232,224,212,0.5);
  --vn-title-bg: #060609;
  --vn-choice-bg: rgba(20,20,35,0.9);
  --vn-choice-hover: rgba(200,155,110,0.15);
  --vn-choice-border: rgba(200,155,110,0.3);
  --vn-font: 'Crimson Pro', Georgia, serif;
  --vn-font-mono: 'Space Mono', monospace;
  --vn-dialog-radius: 0px;
  --vn-choice-radius: 0px;
}
</style>
<style id="vn-core-css">
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
html, body { width:100%; height:100%; background:var(--vn-bg); font-family:var(--vn-font); color:var(--vn-text); overflow:hidden; }

#vn-stage { position:relative; width:100%; height:100%; display:flex; flex-direction:column; justify-content:flex-end; }

/* Background */
#vn-bg { position:absolute; inset:0; background:#0a0a12; }
#vn-bg::after { content:''; position:absolute; inset:0; background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px); pointer-events:none; }
#vn-bg-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0.7; display:none; }
#vn-transition { position:absolute; inset:0; z-index:5; pointer-events:none; opacity:0; background:#000; }

/* Sprites */
#vn-sprites { position:absolute; inset:0; display:flex; align-items:flex-end; pointer-events:none; perspective:1000px; }
.vn-sprite { position:absolute; bottom:0; max-height:80%; object-fit:contain; transition:opacity 0.4s, transform 0.4s, filter 0.4s; transform-style:preserve-3d; }
.vn-sprite.left   { left:10%; }
.vn-sprite.center { left:50%; transform:translateX(-50%); }
.vn-sprite.right  { right:10%; }
.vn-sprite.dim    { filter:brightness(0.45) saturate(0.3); }
.vn-sprite.hidden { opacity:0; }
.vn-sprite.center.dim { transform:translateX(-50%); }

/* Dialogue box */
#vn-box { position:relative; z-index:10; margin:0 2% 2% 2%; background:var(--vn-panel); border:1px solid var(--vn-border); border-top:1px solid rgba(200,155,110,0.2); backdrop-filter:blur(var(--vn-panel-blur)); padding:28px 36px 24px; min-height:160px; cursor:pointer; user-select:none; box-shadow:0 -4px 40px rgba(0,0,0,0.5); border-radius:var(--vn-dialog-radius); }
#vn-box::before { content:''; position:absolute; top:0; left:36px; right:36px; height:1px; background:linear-gradient(90deg,transparent,var(--vn-accent),transparent); opacity:0.6; }
#vn-name { font-family:var(--vn-font-mono); font-size:13px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--vn-accent); margin-bottom:12px; min-height:18px; transition:color 0.3s; }
#vn-text { font-size:20px; line-height:1.65; color:var(--vn-text); min-height:60px; font-weight:300; }
#vn-arrow { position:absolute; bottom:18px; right:28px; width:10px; height:10px; border-right:2px solid var(--vn-accent); border-bottom:2px solid var(--vn-accent); transform:rotate(45deg); opacity:0; animation:vnArrow 1.2s ease-in-out infinite; }
#vn-arrow.visible { opacity:1; }
@keyframes vnArrow { 0%,100%{opacity:0.3;transform:rotate(45deg) translate(0,0)} 50%{opacity:1;transform:rotate(45deg) translate(2px,2px)} }

/* Choices */
#vn-choices { position:absolute; inset:0; z-index:20; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:40px; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); opacity:0; pointer-events:none; transition:opacity 0.4s; }
#vn-choices.active { opacity:1; pointer-events:all; }
.vn-choice { width:100%; max-width:560px; background:var(--vn-choice-bg); border:1px solid var(--vn-choice-border); color:var(--vn-text); font-family:var(--vn-font); font-size:18px; padding:16px 28px; cursor:pointer; text-align:left; transition:background 0.2s,border-color 0.2s,transform 0.15s; border-radius:var(--vn-choice-radius); }
.vn-choice:hover { background:var(--vn-choice-hover); border-color:var(--vn-accent); transform:translateX(6px); }

/* Title screen */
#vn-title { position:absolute; inset:0; z-index:50; display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--vn-title-bg); transition:opacity 0.8s; }
#vn-title.hidden { opacity:0; pointer-events:none; }
#vn-title-name { font-family:var(--vn-font); font-size:clamp(36px,6vw,72px); font-weight:300; font-style:italic; color:var(--vn-accent); text-shadow:0 0 60px rgba(200,155,110,0.3); margin-bottom:8px; }
#vn-title-sub { font-family:var(--vn-font-mono); font-size:11px; letter-spacing:0.25em; text-transform:uppercase; color:var(--vn-muted); margin-bottom:60px; }
#vn-start-btn { font-family:var(--vn-font-mono); font-size:12px; letter-spacing:0.2em; text-transform:uppercase; color:var(--vn-accent); border:1px solid rgba(200,155,110,0.4); background:transparent; padding:14px 40px; cursor:pointer; transition:background 0.3s,color 0.3s,border-color 0.3s; }
#vn-start-btn:hover { background:rgba(200,155,110,0.12); color:#fff; border-color:var(--vn-accent); }

/* Menu bar */
#vn-menubar { position:absolute; top:14px; left:14px; z-index:30; display:flex; gap:8px; }
.vn-menu-btn { font-family:var(--vn-font-mono); font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--vn-muted); background:rgba(8,8,16,0.7); border:1px solid var(--vn-border); padding:6px 12px; cursor:pointer; transition:color 0.2s,border-color 0.2s; }
.vn-menu-btn:hover { color:var(--vn-text); border-color:rgba(255,255,255,0.2); }

/* Settings panel */
#vn-settings { position:absolute; inset:0; z-index:40; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); backdrop-filter:blur(6px); opacity:0; pointer-events:none; transition:opacity 0.3s; }
#vn-settings.open { opacity:1; pointer-events:all; }
#vn-settings-inner { background:var(--vn-panel); border:1px solid var(--vn-border); backdrop-filter:blur(var(--vn-panel-blur)); padding:36px 40px; min-width:360px; max-width:480px; width:90%; }
#vn-settings-title { font-family:var(--vn-font-mono); font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:var(--vn-accent); margin-bottom:28px; }
.vn-setting-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; gap:16px; }
.vn-setting-label { font-family:var(--vn-font-mono); font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--vn-text); opacity:0.8; }
.vn-slider { -webkit-appearance:none; appearance:none; width:160px; height:3px; background:var(--vn-border); outline:none; cursor:pointer; }
.vn-slider::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:var(--vn-accent); cursor:pointer; }
.vn-slider::-moz-range-thumb { width:14px; height:14px; border-radius:50%; background:var(--vn-accent); cursor:pointer; border:none; }
.vn-toggle { position:relative; display:inline-block; width:40px; height:22px; cursor:pointer; flex-shrink:0; }
.vn-toggle input { opacity:0; width:0; height:0; position:absolute; }
.vn-toggle-track { position:absolute; inset:0; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.1); transition:background 0.3s; border-radius:11px; }
.vn-toggle input:checked + .vn-toggle-track { background:var(--vn-accent); border-color:var(--vn-accent); }
.vn-toggle-thumb { position:absolute; top:4px; left:4px; width:12px; height:12px; background:#fff; border-radius:50%; transition:transform 0.3s; pointer-events:none; }
.vn-toggle input:checked ~ .vn-toggle-thumb { transform:translateX(18px); }
.vn-settings-close { font-family:var(--vn-font-mono); font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:var(--vn-muted); background:transparent; border:1px solid var(--vn-border); padding:8px 20px; cursor:pointer; margin-top:12px; transition:color 0.2s,border-color 0.2s; }
.vn-settings-close:hover { color:var(--vn-text); border-color:rgba(255,255,255,0.2); }

/* Notify */
#vn-notify { position:absolute; top:20px; right:20px; z-index:100; font-family:var(--vn-font-mono); font-size:11px; letter-spacing:0.1em; background:rgba(10,10,20,0.9); border:1px solid var(--vn-border); border-left:2px solid var(--vn-accent2); padding:10px 16px; color:var(--vn-accent2); opacity:0; pointer-events:none; transition:opacity 0.3s; max-width:260px; }
#vn-notify.show { opacity:1; }

/* Debug */
#vn-debug { position:absolute; top:50px; left:14px; z-index:30; background:rgba(0,0,0,0.85); border:1px solid var(--vn-border); padding:10px 14px; font-family:var(--vn-font-mono); font-size:10px; color:rgba(126,159,199,0.8); min-width:180px; display:none; line-height:1.7; }
#vn-debug.visible { display:block; }

/* Typewriter cursor */
.vn-cursor { display:inline-block; width:2px; height:1em; background:var(--vn-accent); vertical-align:text-bottom; animation:vnBlink 0.85s step-end infinite; margin-left:2px; }
@keyframes vnBlink { 0%,100%{opacity:1} 50%{opacity:0} }

/* Shake */
@keyframes vnShake {
  0%,100% { transform:translateX(0); }
  20%     { transform:translateX(-8px) rotate(-0.5deg); }
  40%     { transform:translateX( 8px) rotate( 0.5deg); }
  60%     { transform:translateX(-5px); }
  80%     { transform:translateX( 5px); }
}
.vn-shake { animation:vnShake 0.4s ease; }
</style>`);

// ── INJECT HTML ─────────────────────────────────────────────────
document.body.insertAdjacentHTML('beforeend', `
<div id="vn-title">
  <div id="vn-title-name">My Visual Novel</div>
  <div id="vn-title-sub">A story</div>
  <button id="vn-start-btn" onclick="VN.start()">Start</button>
</div>
<div id="vn-stage">
  <div id="vn-bg"><img id="vn-bg-img" alt=""></div>
  <div id="vn-transition"></div>
  <div id="vn-sprites"></div>

  <div id="vn-menubar">
    <button class="vn-menu-btn" onclick="VN.save()">Save</button>
    <button class="vn-menu-btn" onclick="VN.load()">Load</button>
    <button class="vn-menu-btn" onclick="VN.openSettings()">Settings</button>
    <button class="vn-menu-btn" onclick="VN.toggleDebug()">Vars</button>
    <button class="vn-menu-btn" onclick="VN.restart()">Restart</button>
  </div>

  <div id="vn-settings">
    <div id="vn-settings-inner">
      <div id="vn-settings-title">Settings</div>
      <div id="vn-settings-rows"></div>
      <button class="vn-settings-close" onclick="VN.closeSettings()">Close</button>
    </div>
  </div>

  <div id="vn-debug"></div>
  <div id="vn-notify"></div>
  <div id="vn-choices"></div>
  <div id="vn-input-container" style="display:none; position:absolute; bottom:140px; left:50%; transform:translateX(-50%); max-width:600px; width:90%; z-index:100;">
    <input id="vn-text-input" type="text" placeholder="Enter text..." style="width:100%; padding:12px; font-family:var(--vn-font); font-size:16px; background:var(--vn-panel); color:var(--vn-text); border:1px solid var(--vn-choice-border); border-radius:var(--vn-choice-radius);" />
  </div>

  <div id="vn-box" onclick="VN.advance()">
    <div id="vn-name"></div>
    <div id="vn-text"></div>
    <div id="vn-arrow"></div>
  </div>
</div>`);


// ═══════════════════════════════════════════════════════════════
//  ENGINE CORE
// ═══════════════════════════════════════════════════════════════
window.VN = (() => {
  const $ = id => document.getElementById(id);

  // ── STATE ──────────────────────────────────────────────────
  let script = null;
  let currentLabel, stepIndex, vars, callStack;
  let typing = false, typeTimeout = null, fullText = '', waitingInput = false;
  let debugVisible = false;
  let activeSprites = {};

  // ── AUDIO ──────────────────────────────────────────────────
  const bgmAudio = new Audio();
  const ambAudio = new Audio();
  bgmAudio.loop = true;
  ambAudio.loop = true;

  // ── SETTINGS STATE ─────────────────────────────────────────
  let settingsState = {
    textSpeed:       1.0,
    musicVolume:     0.7,
    sfxVolume:       1.0,
    ambienceVolume:  0.5,
    autoSave:        false,
    fullscreen:      false,
  };

  // ── THEME MAP ──────────────────────────────────────────────
  const THEME_MAP = {
    bg:           '--vn-bg',
    panel:        '--vn-panel',
    panelBlur:    '--vn-panel-blur',
    border:       '--vn-border',
    accent:       '--vn-accent',
    accent2:      '--vn-accent2',
    text:         '--vn-text',
    muted:        '--vn-muted',
    titleBg:      '--vn-title-bg',
    choiceBg:     '--vn-choice-bg',
    choiceHover:  '--vn-choice-hover',
    choiceBorder: '--vn-choice-border',
    font:         '--vn-font',
    fontMono:     '--vn-font-mono',
    dialogRadius: '--vn-dialog-radius',
    choiceRadius: '--vn-choice-radius',
  };

  function theme(overrides) {
    const root = document.documentElement;
    for (const [key, cssVar] of Object.entries(THEME_MAP)) {
      if (overrides[key] !== undefined) root.style.setProperty(cssVar, overrides[key]);
    }
  }

  // ── INIT ───────────────────────────────────────────────────
  function init(game) {
    script = game;
    if (game.title)    $('vn-title-name').textContent = game.title;
    if (game.subtitle) $('vn-title-sub').textContent  = game.subtitle;
    vars = game.vars ? { ...game.vars } : {};
    if (game.theme) theme(game.theme);
    buildSettingsPanel(game.settings || {});
    const saved = localStorage.getItem('vn_settings');
    if (saved) Object.assign(settingsState, JSON.parse(saved));
    applyAudioVolumes();
  }

  // ── START / RESTART ─────────────────────────────────────────
  function start() {
    $('vn-title').classList.add('hidden');
    setTimeout(() => $('vn-title').style.display = 'none', 900);
    vars = script.vars ? { ...script.vars } : {};
    callStack = []; activeSprites = {};
    jumpTo(script.start || 'start');
  }

  function restart() {
    stopAllAudio();
    clearSprites();
    setSceneDirect(null, '#0a0a12');
    $('vn-name').textContent = '';
    $('vn-text').textContent = '';
    $('vn-arrow').classList.remove('visible');
    $('vn-choices').classList.remove('active');
    $('vn-choices').innerHTML = '';
    waitingInput = typing = false;
    clearTimeout(typeTimeout);
    $('vn-title').style.display = '';
    $('vn-title').classList.remove('hidden');
  }

  // ── NAVIGATION ─────────────────────────────────────────────
  function jumpTo(label) {
    if (!script.labels[label]) { console.error(`[VN] Label "${label}" not found.`); return; }
    currentLabel = label; stepIndex = 0; runStep();
  }

  function runStep() {
    if (!script.labels[currentLabel]) return;
    const steps = script.labels[currentLabel];
    if (stepIndex >= steps.length) {
      if (callStack.length) {
        const r = callStack.pop();
        currentLabel = r.label; stepIndex = r.index;
        runStep();
      }
      return;
    }
    execCmd(steps[stepIndex++]);
  }

  function execCmd(cmd) {
    switch (cmd.type) {
      case 'say':       cmdSay(cmd); break;
      case 'scene':     cmdScene(cmd); break;          // async
      case 'show':      cmdShow(cmd); runStep(); break;
      case 'hide':      cmdHide(cmd); runStep(); break;
      case 'dim':       cmdDim(cmd, true);  runStep(); break;
      case 'undim':     cmdDim(cmd, false); runStep(); break;
      case 'choice':    cmdChoice(cmd); break;
      case 'jump':      jumpTo(cmd.label); break;
      case 'call':      callStack.push({ label:currentLabel, index:stepIndex }); jumpTo(cmd.label); break;
      case 'setVar':    vars[cmd.key] = cmd.val; updateDebug(); runStep(); break;
      case 'addVar':    vars[cmd.key] = (vars[cmd.key]||0) + cmd.amount; updateDebug(); runStep(); break;
      case 'mulVar':    vars[cmd.key] = (vars[cmd.key]||0) * cmd.amount; updateDebug(); runStep(); break;
      case 'divVar':    vars[cmd.key] = (vars[cmd.key]||0) / (cmd.amount || 1); updateDebug(); runStep(); break;
      case 'modVar':    vars[cmd.key] = (vars[cmd.key]||0) % (cmd.amount || 1); updateDebug(); runStep(); break;
      case 'concatVar': vars[cmd.key] = String(vars[cmd.key]||'') + String(cmd.val); updateDebug(); runStep(); break;
      case 'ifVar':     vars[cmd.key] === cmd.val ? jumpTo(cmd.label) : runStep(); break;
      case 'ifVarOp':   cmdIfVarOp(cmd); break;
      case 'input':     cmdInput(cmd); break;
      case 'pause':     setTimeout(runStep, cmd.ms || 1000); break;
      case 'notify':    showNotify(cmd.text); runStep(); break;
      case 'shake':     cmdShake(); break;             // async
      case 'flash':     cmdFlash(cmd); break;          // async
      case 'transition':cmdDoTransition(cmd); break;   // async
      case 'bgm':       cmdBGM(cmd); runStep(); break;
      case 'stopBgm':   stopBGM(); runStep(); break;
      case 'sfx':       playSFX(cmd.src, cmd.volume); runStep(); break;
      case 'ambience':  cmdAmbience(cmd); runStep(); break;
      case 'stopAmb':   ambAudio.pause(); ambAudio.src = ''; runStep(); break;
      case 'end':       cmdEnd(); break;
      default: console.warn('[VN] Unknown command:', cmd); runStep();
    }
  }

  // ── SAY ────────────────────────────────────────────────────
  function cmdSay({ who, text }) {
    const char = who && script.characters?.[who];
    $('vn-name').textContent = char ? char.name : (who || '');
    $('vn-name').style.color = char?.color || 'var(--vn-accent)';
    fullText = text;
    $('vn-text').innerHTML = '';
    $('vn-arrow').classList.remove('visible');
    waitingInput = false; typing = true;

    if (who) {
      for (const [id, s] of Object.entries(activeSprites))
        s.el?.classList.toggle('dim', id !== who);
    }

    if (char?.voice) playSFX(char.voice);

    typeText(text, () => {
      typing = false; waitingInput = true;
      $('vn-arrow').classList.add('visible');
      if (settingsState.autoSave) save(true);
    });
  }

  // ── SCENE ──────────────────────────────────────────────────
  function cmdScene({ bg, color, transition: tr }) {
    doTransition(tr || 'fade', () => setSceneDirect(bg, color), runStep);
  }

  function setSceneDirect(bg, color) {
    $('vn-bg').style.background = color || '#0a0a12';
    const img = $('vn-bg-img');
    if (bg) { img.src = bg; img.style.display = 'block'; }
    else    { img.src = ''; img.style.display = 'none'; }
  }

  // ── SHOW SPRITE ────────────────────────────────────────────
  function cmdShow(cmd) {
    const { char, pos, expr, reset, ...props } = cmd;
    const charDef = script.characters?.[char];
    if (!charDef) { console.warn('[VN] Character not defined:', char); return; }

    let active = activeSprites[char];
    if (!active) {
      const el = document.createElement('img');
      el.className = `vn-sprite center`; // default pos
      el.alt = char;
      $('vn-sprites').appendChild(el);
      active = activeSprites[char] = { el, pos:'center', expr:'default', props:{} };
    }

    if (reset) active.props = {};
    if (pos) active.pos = pos;
    if (expr) active.expr = expr;
    // Merge any new props (offset, scale, rotate, flipX, flipY, skew, yaw)
    Object.assign(active.props, props);

    const { el, pos: resolvedPos, expr: resolvedExpr, props: overrides } = active;
    el.className = `vn-sprite ${resolvedPos}`;

    let data = null;
    if (charDef.sprites) {
      data = charDef.sprites[resolvedExpr] || charDef.sprites.default || Object.values(charDef.sprites)[0];
    } else if (charDef.sprite) {
      data = charDef.sprite;
    }

    let src = typeof data === 'string' ? data : data?.src || '';
    
    // Fallback order: Sprite Data -> Character Def -> Default (null/1)
    const getVal = (key, defVal) => {
      if (overrides[key] !== undefined) return overrides[key];
      if (data && typeof data === 'object' && data[key] !== undefined) return data[key];
      if (charDef[key] !== undefined) return charDef[key];
      return defVal;
    };

    const offset = getVal('offset', null);
    const scale  = getVal('scale', 1);
    const rotate = getVal('rotate', 0);
    const flipX  = getVal('flipX', false);
    const flipY  = getVal('flipY', false);
    const skew   = getVal('skew', null);
    const yaw    = getVal('yaw', 0);

    if (src) {
      el.src = src;
      el.style.display = '';

      let transform = resolvedPos === 'center' ? 'translateX(-50%)' : '';

      if (offset) {
        const [ox, oy] = offset;
        transform += ` translate(${ox}px, ${-oy}px)`;
      }
      if (scale !== 1 || flipX || flipY) {
        let sx = scale * (flipX ? -1 : 1);
        let sy = scale * (flipY ? -1 : 1);
        transform += ` scale(${sx}, ${sy})`;
      }
      if (rotate) transform += ` rotate(${rotate}deg)`;
      if (skew) {
        const [kx, ky] = skew;
        transform += ` skew(${kx}deg, ${ky}deg)`;
      }
      if (yaw) transform += ` rotateY(${yaw}deg)`;

      el.style.transform = transform;
      el.style.transformOrigin = 'bottom center';
    } else {
      el.style.display = 'none';
    }

    el.classList.remove('hidden', 'dim');
  }

  function cmdHide({ char }) { activeSprites[char]?.el.classList.add('hidden'); }

  function cmdDim({ char }, dim) {
    if (char && activeSprites[char]) activeSprites[char].el?.classList.toggle('dim', dim);
    else for (const s of Object.values(activeSprites)) s.el?.classList.toggle('dim', dim);
  }

  // ── CHOICES ────────────────────────────────────────────────
  function cmdChoice({ options }) {
    $('vn-arrow').classList.remove('visible');
    const box = $('vn-choices');
    box.innerHTML = ''; box.classList.add('active');
    waitingInput = false;

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'vn-choice';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
        box.classList.remove('active'); box.innerHTML = '';
        if (opt.setVar) vars[opt.setVar.key] = opt.setVar.val;
        if (opt.addVar) vars[opt.addVar.key] = (vars[opt.addVar.key]||0) + opt.addVar.amount;
        if (opt.sfx)   playSFX(opt.sfx);
        updateDebug();
        jumpTo(opt.jump);
      });
      box.appendChild(btn);
    });
  }

  // ── END ────────────────────────────────────────────────────
  function cmdEnd() {
    stopAllAudio();
    $('vn-name').textContent = '';
    $('vn-text').innerHTML = '<span style="color:var(--vn-muted);font-style:italic;font-size:16px">— The End —</span>';
    $('vn-arrow').classList.remove('visible');
    waitingInput = false;
  }

  // ── SHAKE ──────────────────────────────────────────────────
  function cmdShake() {
    const stage = $('vn-stage');
    stage.classList.remove('vn-shake');
    void stage.offsetWidth;
    stage.classList.add('vn-shake');
    stage.addEventListener('animationend', () => {
      stage.classList.remove('vn-shake');
      runStep();
    }, { once: true });
  }

  // ── FLASH ──────────────────────────────────────────────────
  function cmdFlash({ color = '#ffffff', ms = 200 }) {
    const el = $('vn-transition');
    el.style.background = color;
    el.style.transition = 'none';
    el.style.opacity = '1';
    setTimeout(() => {
      el.style.transition = `opacity ${ms}ms ease`;
      el.style.opacity = '0';
      setTimeout(runStep, ms + 60);
    }, 40);
  }

  // ── TRANSITION (standalone command) ────────────────────────
  function cmdDoTransition({ transition: tr, color, ms }) {
    if (tr === 'flash') { cmdFlash({ color, ms }); return; }
    doTransition(tr, () => {}, runStep);
  }

  // ── TRANSITION HELPER ──────────────────────────────────────
  // doTransition(type, midFn, doneFn)
  // midFn  — called at the black frame (swap your BG here)
  // doneFn — called when fully done
  //
  // Types: 'fade' | 'white' | 'dissolve' | 'none'
  function doTransition(type, mid, done) {
    const overlay = $('vn-transition');

    if (!type || type === 'none') { mid(); done(); return; }

    if (type === 'fade' || type === 'white') {
      const col = type === 'white' ? '#fff' : '#000';
      const dur = 350;
      overlay.style.background = col;
      overlay.style.transition = 'none';
      overlay.style.opacity = '1';
      setTimeout(() => {
        mid();
        overlay.style.transition = `opacity ${dur}ms ease`;
        overlay.style.opacity = '0';
        setTimeout(done, dur + 40);
      }, dur);
      return;
    }

    if (type === 'dissolve') {
      const img = $('vn-bg-img');
      img.style.transition = 'opacity 0.5s';
      img.style.opacity = '0';
      setTimeout(() => {
        mid();
        img.style.opacity = '0.7';
        setTimeout(done, 540);
      }, 520);
      return;
    }

    // Unknown type — just swap
    mid(); done();
  }

  // ── AUDIO ──────────────────────────────────────────────────
  function cmdBGM({ src, volume, loop = true, fadeIn = false }) {
    bgmAudio.pause();
    bgmAudio.src = src;
    bgmAudio.loop = loop;
    const vol = volume !== undefined ? volume : settingsState.musicVolume;
    bgmAudio.volume = fadeIn ? 0 : vol;
    bgmAudio.play().catch(() => {});
    if (fadeIn) fadeTo(bgmAudio, vol, 1500);
  }

  function stopBGM(fadeOut = false) {
    if (fadeOut) fadeTo(bgmAudio, 0, 800, () => { bgmAudio.pause(); bgmAudio.src = ''; });
    else { bgmAudio.pause(); bgmAudio.src = ''; }
  }

  function playSFX(src, volume) {
    if (!src) return;
    const sfx = new Audio(src);
    sfx.volume = volume !== undefined ? volume : settingsState.sfxVolume;
    sfx.play().catch(() => {});
  }

  function cmdAmbience({ src, volume }) {
    ambAudio.pause();
    ambAudio.src = src;
    ambAudio.volume = volume !== undefined ? volume : settingsState.ambienceVolume;
    ambAudio.play().catch(() => {});
  }

  function stopAllAudio() {
    bgmAudio.pause(); bgmAudio.src = '';
    ambAudio.pause(); ambAudio.src = '';
  }

  function fadeTo(audioEl, targetVol, ms, onDone) {
    const start = audioEl.volume;
    const diff = targetVol - start;
    const steps = 30;
    let i = 0;
    const t = setInterval(() => {
      i++;
      audioEl.volume = Math.max(0, Math.min(1, start + diff * (i / steps)));
      if (i >= steps) { clearInterval(t); onDone?.(); }
    }, ms / steps);
  }

  function applyAudioVolumes() {
    bgmAudio.volume = settingsState.musicVolume;
    ambAudio.volume = settingsState.ambienceVolume;
  }

  // ── TYPEWRITER ─────────────────────────────────────────────
  function typeText(text, onDone) {
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'vn-cursor';
    const speed = Math.max(1, Math.round(30 / (settingsState.textSpeed || 1)));

    function tick() {
      if (i < text.length) {
        $('vn-text').textContent = text.slice(0, ++i);
        $('vn-text').appendChild(cursor);
        typeTimeout = setTimeout(tick, speed);
      } else { cursor.remove(); onDone?.(); }
    }
    tick();
  }

  // ── CONDITIONAL VARIABLE CHECK ────────────────────────
  function cmdIfVarOp(cmd) {
    const val = vars[cmd.key] ?? 0;
    let condition = false;
    switch (cmd.op) {
      case '==': condition = val === cmd.val; break;
      case '!=': condition = val !== cmd.val; break;
      case '>':  condition = val > cmd.val; break;
      case '<':  condition = val < cmd.val; break;
      case '>=': condition = val >= cmd.val; break;
      case '<=': condition = val <= cmd.val; break;
      default: console.warn('[VN] Unknown operator:', cmd.op);
    }
    condition ? jumpTo(cmd.label) : runStep();
  }

  // ── TEXT INPUT ─────────────────────────────────────────
  function cmdInput(cmd) {
    const container = $('vn-input-container');
    const input = $('vn-text-input');
    
    $('vn-arrow').classList.remove('visible');
    container.style.display = 'block';
    input.value = '';
    input.placeholder = cmd.placeholder || 'Enter text...';
    input.focus();
    waitingInput = false;
    
    const handleSubmit = () => {
      const userInput = input.value;
      if (cmd.storeIn) vars[cmd.storeIn] = userInput;
      container.style.display = 'none';
      input.removeEventListener('keydown', handleKeyDown);
      runStep();
    };
    
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') handleSubmit();
    };
    
    input.removeEventListener('keydown', handleKeyDown);
    input.addEventListener('keydown', handleKeyDown);
  }

  // ── ADVANCE ────────────────────────────────────────────
  function advance() {
    if ($('vn-choices').classList.contains('active')) return;
    if ($('vn-settings').classList.contains('open'))  return;
    if ($('vn-input-container').style.display !== 'none') return;

    if (typing) {
      clearTimeout(typeTimeout); typing = false;
      $('vn-text').querySelector('.vn-cursor')?.remove();
      $('vn-text').textContent = fullText;
      waitingInput = true; $('vn-arrow').classList.add('visible');
      return;
    }
    if (waitingInput) {
      waitingInput = false;
      $('vn-arrow').classList.remove('visible');
      runStep();
    }
  }

  document.addEventListener('keydown', e => {
    if (['Space','Enter','ArrowRight'].includes(e.code)) { e.preventDefault(); advance(); }
    if (e.code === 'Escape' && $('vn-settings').classList.contains('open')) closeSettings();
  });

  // ── NOTIFY ─────────────────────────────────────────────────
  let notifyTimer;
  function showNotify(text) {
    clearTimeout(notifyTimer);
    $('vn-notify').textContent = text;
    $('vn-notify').classList.add('show');
    notifyTimer = setTimeout(() => $('vn-notify').classList.remove('show'), 3000);
  }

  // ── SETTINGS PANEL ─────────────────────────────────────────
  const BUILTIN_SETTINGS = {
    textSpeed:      { label:'Text Speed',      type:'slider', min:0.25, max:4,   step:0.25 },
    musicVolume:    { label:'Music Volume',    type:'slider', min:0,    max:1,   step:0.05 },
    sfxVolume:      { label:'SFX Volume',      type:'slider', min:0,    max:1,   step:0.05 },
    ambienceVolume: { label:'Ambience Volume', type:'slider', min:0,    max:1,   step:0.05 },
    autoSave:       { label:'Auto Save',       type:'toggle' },
    fullscreen:     { label:'Fullscreen',      type:'toggle' },
  };

  function buildSettingsPanel(cfg) {
    const rows = $('vn-settings-rows');
    rows.innerHTML = '';

    const keys = (cfg === true || Object.keys(cfg).length === 0)
      ? Object.keys(BUILTIN_SETTINGS)
      : Object.keys(cfg);

    keys.forEach(key => {
      const builtin = BUILTIN_SETTINGS[key];
      const custom  = cfg !== true && cfg[key] && typeof cfg[key] === 'object' ? cfg[key] : null;
      if (!builtin && !custom) return;

      const label = custom?.label || builtin?.label || key;
      const type  = custom?.type  || builtin?.type  || 'toggle';

      if (!(key in settingsState)) {
        settingsState[key] = custom?.default !== undefined ? custom.default
          : type === 'slider' ? (builtin?.min ?? 0) : false;
      }

      const row = document.createElement('div');
      row.className = 'vn-setting-row';
      row.innerHTML = `<span class="vn-setting-label">${label}</span>`;

      if (type === 'slider') {
        const min = (custom || builtin).min ?? 0;
        const max = (custom || builtin).max ?? 1;
        const step = (custom || builtin).step ?? 0.05;
        const slider = document.createElement('input');
        slider.type = 'range'; slider.className = 'vn-slider';
        slider.min = min; slider.max = max; slider.step = step;
        slider.value = settingsState[key];
        slider.addEventListener('input', () => {
          settingsState[key] = parseFloat(slider.value);
          onSettingChange(key);
        });
        row.appendChild(slider);
      } else {
        const wrap = document.createElement('label');
        wrap.className = 'vn-toggle';
        wrap.innerHTML = `<input type="checkbox" ${settingsState[key] ? 'checked' : ''}><div class="vn-toggle-track"></div><div class="vn-toggle-thumb"></div>`;
        wrap.querySelector('input').addEventListener('change', e => {
          settingsState[key] = e.target.checked;
          onSettingChange(key);
        });
        row.appendChild(wrap);
      }
      rows.appendChild(row);
    });
  }

  function onSettingChange(key) {
    if (key === 'musicVolume')    bgmAudio.volume = settingsState.musicVolume;
    if (key === 'ambienceVolume') ambAudio.volume = settingsState.ambienceVolume;
    if (key === 'fullscreen') {
      settingsState.fullscreen
        ? document.documentElement.requestFullscreen?.().catch(()=>{})
        : document.exitFullscreen?.().catch(()=>{});
    }
    localStorage.setItem('vn_settings', JSON.stringify(settingsState));
    script?.onSettingChange?.(key, settingsState[key], settingsState);
  }

  function openSettings()  { $('vn-settings').classList.add('open'); }
  function closeSettings() { $('vn-settings').classList.remove('open'); }

  // ── SAVE / LOAD ────────────────────────────────────────────
  function save(silent = false) {
    localStorage.setItem('vn_save', JSON.stringify({
      currentLabel, stepIndex: stepIndex - 1, vars, callStack
    }));
    if (!silent) showNotify('Game saved.');
  }

  function load() {
    const raw = localStorage.getItem('vn_save');
    if (!raw) { showNotify('No save found.'); return; }
    const s = JSON.parse(raw);
    vars = s.vars || {}; callStack = s.callStack || [];
    clearSprites();
    $('vn-choices').classList.remove('active'); $('vn-choices').innerHTML = '';
    typing = false; clearTimeout(typeTimeout); waitingInput = false;
    currentLabel = s.currentLabel; stepIndex = s.stepIndex;
    updateDebug(); showNotify('Game loaded.');
    execCmd(script.labels[currentLabel][stepIndex]);
    stepIndex++;
  }

  // ── DEBUG ──────────────────────────────────────────────────
  function updateDebug() {
    if (!debugVisible) return;
    $('vn-debug').innerHTML = Object.entries(vars)
      .map(([k,v]) => `<b style="color:var(--vn-accent)">${k}</b>: ${JSON.stringify(v)}`)
      .join('<br>') || '<i>no vars</i>';
  }

  function toggleDebug() {
    debugVisible = !debugVisible;
    $('vn-debug').classList.toggle('visible', debugVisible);
    updateDebug();
  }

  function clearSprites() { $('vn-sprites').innerHTML = ''; activeSprites = {}; }

  // ── COMMAND BUILDER HELPERS ────────────────────────────────
  const cmd = {
    // Dialogue
    say:        (who, text)              => ({ type:'say', who, text }),
    narrate:    (text)                   => ({ type:'say', who:null, text }),

    // Scene  —  transition types: 'fade' | 'white' | 'dissolve' | 'none'
    scene:      (bg, color, tr)          => ({ type:'scene', bg, color, transition:tr }),

    // Sprites — show(char, pos, expr, { scale, rotate, offset, flipX, flipY, skew, yaw })
    // pos: 'left' | 'center' | 'right'
    // scale: 0.5–2 (numeric multiplier)
    // rotate: 0–360 (degrees)
    // offset: [x, y] (pixel offsets)
    // flipX/flipY: true/false
    // skew: [x, y] (degrees)
    // yaw: 0–360 (3D rotation)
    show:       (char, pos, expr, props) => ({ type:'show', char, pos, expr, ...props }),
    hide:       (char)                   => ({ type:'hide', char }),
    dim:        (char)                   => ({ type:'dim', char }),
    undim:      (char)                   => ({ type:'undim', char }),

    // Choices
    choice:     (options)                => ({ type:'choice', options }),

    // Flow
    jump:       (label)                  => ({ type:'jump', label }),
    call:       (label)                  => ({ type:'call', label }),
    setVar:     (key, val)               => ({ type:'setVar', key, val }),
    addVar:     (key, amount)            => ({ type:'addVar', key, amount }),
    // Advanced variable operations: multiply, divide, modulo, concatenate
    mulVar:     (key, amount)            => ({ type:'mulVar', key, amount }),
    divVar:     (key, amount)            => ({ type:'divVar', key, amount }),
    modVar:     (key, amount)            => ({ type:'modVar', key, amount }),
    concatVar:  (key, val)               => ({ type:'concatVar', key, val }),
    // Conditionals: ifVar (equality), ifVarOp (with operators)
    ifVar:      (key, val, label)        => ({ type:'ifVar', key, val, label }),
    ifVarOp:    (key, op, val, label)    => ({ type:'ifVarOp', key, op, val, label }),
    // Text input
    input:      (storeIn, placeholder)   => ({ type:'input', storeIn, placeholder }),
    pause:      (ms)                     => ({ type:'pause', ms }),
    notify:     (text)                   => ({ type:'notify', text }),
    end:        ()                       => ({ type:'end' }),

    // Effects
    shake:      ()                       => ({ type:'shake' }),
    flash:      (color, ms)              => ({ type:'flash', color, ms }),
    transition: (tr, color, ms)          => ({ type:'transition', transition:tr, color, ms }),

    // Audio  (local file paths or URLs)
    // bgm(src)         — start looping background music
    // bgm(src, vol)    — with custom volume 0–1
    // bgm(src, vol, true/false, true) — loop + fade in
    bgm:        (src, vol, loop, fadeIn) => ({ type:'bgm', src, volume:vol, loop, fadeIn }),
    stopBgm:    ()                       => ({ type:'stopBgm' }),
    sfx:        (src, vol)               => ({ type:'sfx', src, volume:vol }),
    ambience:   (src, vol)               => ({ type:'ambience', src, volume:vol }),
    stopAmb:    ()                       => ({ type:'stopAmb' }),
  };

  return { init, start, restart, advance,
           save, load, openSettings, closeSettings,
           toggleDebug, theme, cmd };
})();

})(); // end buildEngine IIFE
