// ═══════════════════════════════════════════════════════════════
//  YOUR GAME - here's the example file to use when making your game.
// ═══════════════════════════════════════════════════════════════

const { say, narrate, scene, show, hide, dim, undim,
        choice, jump, call, setVar, addVar, ifVar,
        pause, notify, end,
        shake, flash, transition,
        bgm, stopBgm, sfx, ambience, stopAmb } = VN.cmd;

VN.init({
  title:    "Game",
  subtitle: "Made using ForcedVN.js",

  start: "start",

  // ── THEME (optional) ──────────────────────────────────────
  // Uncomment any of these to restyle the engine.
  // theme: {
  //   accent:       '#ff6b6b',       // main color (names, arrows, etc.)
  //   accent2:      '#6bffb8',       // secondary color (notifications)
  //   bg:           '#0f0a0a',       // page background
  //   panel:        'rgba(20,8,8,0.94)',
  //   text:         '#f0e8e8',       // dialogue text color
  //   font:         "'Georgia', serif",
  //   fontMono:     "'Courier New', monospace",
  //   dialogRadius: '8px',           // rounded corners on dialogue box
  //   choiceRadius: '4px',
  //   titleBg:      '#0f0000',       // title screen background
  // },

  // ── SETTINGS ─────────────────────────────────────────────
  // List only the settings you want shown. Set to {} for all defaults.
  settings: {
    textSpeed:      true,
    musicVolume:    true,
    sfxVolume:      true,
    ambienceVolume: true,
    autoSave:       true,
    fullscreen:     true,
    // Custom setting example (value accessible via settingsState):
    // subtitles: { label: "Subtitles", type: "toggle", default: true },
  },

  // Optional callback when the player changes a setting
  // onSettingChange(key, value, allSettings) { ... }

   // ── VARIABLES ─────────────────────────────────────────────
  vars: {
    score: 0,
  },

  // ── CHARACTERS ────────────────────────────────────────────
  characters: {
    a: {
      name:  "P1",
      color: "#c89b6e",

      // Single sprite — local file or URL:
      sprite: "assets/sprites/P1.png",
      // sprite: "https://placecats.com/300/600",

      // Multiple expressions (use show('a', 'left', 'happy')):
      // sprites: {
      //   default: "assets/sprites/P1.png",
      //   happy:   "assets/sprites/P1_happy.png",
      //   sad:     "assets/sprites/P1_sad.png",
      // },

      // Voice blip played on each line:
      // voice: "assets/voice/P1_blip.wav",
    },
    b: {
      name:  "P2",
      color: "#7e9fc7",
      sprite: "assets/sprites/P2.png",
      // voice: "assets/voice/P2_blip.wav",
    },
  },

  // ── LABELS ────────────────────────────────────────────────
  labels: {

    start: [
      // scene(bgImage, fallbackColor, transitionType)
      // transitionType: 'fade' | 'white' | 'dissolve' | 'none'
      scene("assets/bg/room.png", "#0d0d18", "fade"),

      narrate("This is a narration line."),

      show('a', 'left'),
      say('a', "Hi, I'm P1."),
      show('b', 'right'),
      say('b', "And I'm P2."),
      say('a', "Make a choice:"),
      choice([
        { text: "Choice A",             jump: "branch_a" },
        { text: "Choice B (score +1)",  jump: "branch_b",
          addVar: { key:'score', amount:1 } },
      ]),
    ],

    branch_a: [
      sfx("assets/sfx/click.wav"),
      say('a', "You picked A."),
      shake(),
      jump("ending"),
    ],

    branch_b: [
      flash("#ffffff", 150),
      say('b', "You picked B."),
      notify("Score +1"),
      jump("ending"),
    ],

    ending: [
      scene(null, "#000000", "fade"),
      // stopBgm(),
      narrate("The end."),
      end(),
    ],

  },
});
