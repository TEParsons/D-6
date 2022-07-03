const dicemap = {
  0: "□",
  1: "⚀",
  2: "⚁",
  3: "⚂",
  4: "⚃",
  5: "⚄",
  6: "⚅"
};
const elementColors = {
  blunt: ["#ab371d", "white"],
  sharp: ["#b5b5c5", "black"],
  psychic: ["#c92cbc", "white"],
  poison: ["#670778", "white"],
  fire: ["#f5531d", "white"],
  light: ["#ffffec", "black"],
  air: ["#aab0f0", "black"],
  electric: ["#fff928", "black"],
  water: ["#2e3ef0", "white"],
  ice: ["#97d6e8", "black"],
  earth: ["#7a6c54", "white"],
  plant: ["#31b535", "white"]
};
const statEmojis = {
    "lvl": "🏆",
    "str": "💪",
    "def": "🛡️",
    "agl": "🪶",
    "kno": "📖",
    "cun": "🔍",
    "chr": "👏",
    "mvt": "👟",
    "act": "🌟"
};
const statAliases = {
    "mvt": "movement",
    "act": "actions"
}
const pronounMap = {
    "f": "she/her",
    "m": "he/him",
    "nb": "they/them",
    "ns": "it/its",
    "oth": "other"
};
const alignMap = {
    "lg": "Lawful Good",
    "ng": "Neutral Good",
    "cg": "Chaotic Good",
    "ln": "Lawful Neutral",
    "nn": "True Neutral",
    "cn": "Chaotic Neutral",
    "le": "Lawful Evil",
    "ne": "Neutral Evil",
    "ce": "Chaotic Evil"
}

/** Basic Utility **/

function toTitleCase(content) {
    // Convert string to title case
    return content.charAt(0).toUpperCase() + content.substr(1).toLowerCase()
}


/** Specific Functions **/

function doRest() {
  document.getElementById("hp").value = parseInt(
    document.getElementById("max-hp").innerHTML
  );
}

function doRoll() {
  // Get number of dice to roll
  let ndice = parseInt(document.getElementById("ndice").value);
  // Pick that many random numbers between 1 and 6
  let outcome = [];
  for (let i = 0; i < ndice; i++) {
    outcome.push(Math.ceil(Math.random() * 6));
  }

  // Get total
  let total = outcome.reduce((a, b) => a + b, 0);
  // Get string
  let output = "";
  for (let value of outcome) {
    output += dicemap[value] + " ";
  }

  // Display total
  document.getElementById("roll-total").value = total;
  // Display string
  document.getElementById("roll-string").innerHTML = output;

  // Update exp
  document.getElementById("exp").value =
    parseInt(document.getElementById("exp").value) + ndice;
  updateLvl();
}

function updateNDice(diff) {
  let newVal = parseInt(document.getElementById("ndice").value) + diff;
  document.getElementById("ndice").value = Math.max(newVal, 1);
}

function updateMaxHp() {
  // Get required stats
  let def = parseInt(document.getElementById("def").value);
  let lvl = parseInt(document.getElementById("lvl").value);
  // Calculate max hp
  let maxhp = Math.floor(lvl * 6 + def * 2);
  document.getElementById("max-hp").value = document.getElementById(
    "hp"
  ).max = maxhp;
}

function updateLvl() {
  if (document.getElementById("exp")) {
    let exp = parseInt(document.getElementById("exp").value);
    document.getElementById("lvl").value = Math.floor(Math.log(exp / 6 + 1)) + 1;
  }
  // Update health
  updateMaxHp();
  // Update scores
  updateStats();
}

function updateStats() {
  // Get references to stats ctrls
  let ctrls = [
    document.getElementById("str"),
    document.getElementById("def"),
    document.getElementById("agl"),
    document.getElementById("kno"),
    document.getElementById("cun"),
    document.getElementById("chr")
  ];
  // How many points can they spend?
  let points = parseInt(document.getElementById("lvl").value) * 6 * 3;
  // How many points have they spent?
  let spent = 0;
  for (let ctrl of ctrls) {
    spent += parseInt(ctrl.value);
  }
  // Colour and enable controls if they have points
  for (let ctrl of ctrls) {
    if (spent >= points) {
      ctrl.style.color = "black";
      ctrl.max = parseInt(ctrl.value);
    } else {
      ctrl.style.color = "blue";
      ctrl.max = parseInt(ctrl.value) + points - spent;
    }
  }
  // Update max hp
  updateMaxHp();
  // Update action stats
  updateActionStats();
  // Update markdown
  for (let emt of document.getElementsByTagName("mark-down")) {
    emt.render()
  }
}

function updateActionStats() {
    // Calculate movement per turn
    let mvmt = document.getElementById("mvt");
    mvmt.value = 24 + parseInt(document.getElementById("agl").value);
    // Calculate actions per turn
    let nact = document.getElementById("act");
    nact.value = 1 + Math.floor(parseInt(document.getElementById("lvl").value) / 3)
}

function updateCurrency() {
  // Get controls for each currency unit
  let goldCtrl = document.getElementById("gold");
  let silverCtrl = document.getElementById("silver");
  let copperCtrl = document.getElementById("copper");
  // Convert to smallest unit
  let c = parseNum(goldCtrl.value) * 36 + parseNum(silverCtrl.value) * 6 + parseNum(copperCtrl.value);
  // Get gold
  let g = Math.floor(c / 36)
  goldCtrl.value = g
  c -= g * 36
  // Get silver
  let s = Math.floor(c / 6)
  silverCtrl.value = s
  c -= s * 6
  // Get copper
  copperCtrl.value = c
}

function getJSON() {
  let outDict = {};
  // Get values
  for (let emt of document.getElementById("write").elements) {
    // markdown object isn't recognised by form, so alias it with its editor
    if (emt.className === "md-editor") {
        emt = emt.parentNode;
    }
    if (emt.dataset.saveload !== undefined) {
      // Only add relevant values to outDict
      outDict[emt.id] = emt.value;
    }
  }

  return outDict
}

function save() {
  // Get JSON
  let outDict = getJSON();
  // Save to file
  let file = new Blob([JSON.stringify(outDict)], { type: "application/json" });
  savebuffer.href = URL.createObjectURL(file);
  if (outDict["exp"]) {
    // Save exp for PC
    savebuffer.download = [outDict["name"], outDict["exp"]].join("_") + "xp.json";
  } else {
    // Save just name for NPC
    savebuffer.download = outDict["name"] + ".json";
  }
  savebuffer.click();
}

function savemd(target) {
  // Get markdown
  let value = target.value;
  // Save to file
  let file = new Blob([value], { type: "text/markdown" });
  savebuffer.href = URL.createObjectURL(file);
  // Save
  savebuffer.download = "edited.md";
  savebuffer.click();
}

function exportmd() {
    // Get stats
    let outDict = getJSON();
    // Establish minimum keys needed
    let minkeys = [
        "name", "lvl", "pronouns", "align",
        "hp", "max-hp",
        "str", "def", "agl", "kno", "cun", "chr",
        "mvt", "act",
        "sharp", "blunt", "fire", "light", "water", "ice", "earth", "plant", "electric", "psychic", "poison",
        "abilities", "inventory", "background",
        "gold", "silver", "copper"
    ];
    // Populate missing keys
    for (key of minkeys) {
        if (!Object.keys(outDict).includes(key)) {
            let obj = document.getElementById(key);
            if (obj) {
                outDict[key] = obj.value
            } else {
                outDict[key] = "";
            }
        };
    };
    // Alias values
    if (Object.keys(pronounMap).includes(outDict['pronouns'])) {
        outDict['pronouns'] = pronounMap[outDict['pronouns']]
    }
    if (Object.keys(alignMap).includes(outDict['align'])) {
        outDict['align'] = alignMap[outDict['align']]
    }

    /* Construct markdown string */
    // Shorthand for a hr
    let hr = `>
> ---
>
`;
    // Basics
    let header = `> ### ${outDict['name']}
>
`
    let subheader = `> *${outDict['pronouns']} | ${outDict['species']} | ${outDict['align']}*
`;
    let health = `> **Health** ${outDict['max-hp']}
`;
    let mvt = `> **Movement** ${outDict['mvt']}
`;
    let act = `> **Actions** ${outDict['act']}
`;
    // Money
    let coinsList = []
    if (outDict['gold']) {
        coinsList.push(outDict['gold'] + "🥇")
    }
    if (outDict['silver']) {
        coinsList.push(outDict['silver'] + "🥈")
    }
    if (outDict['copper']) {
        coinsList.push(outDict['copper'] + "🥉")
    }
    let coinsStr
    if (!coinsList.length) {
        coinsStr = `Nothing`
    } else {
        coinsStr = coinsList.join(", ")
    }
    let drops = `> **Drops** ${coinsStr}
`;

    // Multipliers
    let multisList = []
    for (type of ["sharp", "blunt", "fire", "light", "water", "ice", "earth", "plant", "electric", "psychic", "poison"]) {
        if (outDict[type] != 1) {
            multisList.push(`\`${type}\` x${outDict[type]}`);
        }
    }
    let multis
    if (multisList.length) {
        multis = multisList.join(", ")
    } else {
        multis = "None"
    }
    multis = `> **Multipliers** ${multis}
`;
    // Create stats table
    let stats = `> | 💪 Str | 🛡️ Def  | 🪶 Agl  | 📖 Kno  | 🕵️ Cun  | 👏 Chr  |
> | ---- | ---- | ---- | ---- | ---- | ---- |
> | ${outDict['str']} | ${outDict['def']} | ${outDict['agl']} | ${outDict['kno']} | ${outDict['cun']} | ${outDict['chr']} |
`;
    // Abilities
    let abilities = ``
    if (outDict['abilities']) {
        let sanit = ``
        for (line of makeStandardMarkdown(outDict['abilities']).split("\n")) {
            sanit += `> ${line}\n`
        }
        abilities = sanit
    }
    // Background
    let background = `
${makeStandardMarkdown(outDict['background'])}`

    console.log(header + subheader + hr + health + mvt + act + multis + drops + hr + stats + hr + abilities + background)
}

function makeStandardMarkdown(raw) {
  let re;
  let matches;
  // Find all relative values in contents
  re = /\[[\d\/\.]*\]\{\w*\}\w*/g;
  matches = raw.match(re);
  if (matches) {
    // For each match...
    for (let rel of matches) {
      // Get parameters
      let params = {}
      params['qty'] = rel.match(/(?<=\[).*(?=\])/g)[0];  // Value between [ and ] is the quantity
      params['stat'] = rel.match(/(?<=\{)\w*(?=\})/g)[0].toLowerCase();  // Value between { and } is the relevant stat name
      params['units'] = rel.match(/(?<=\})\w*/g)[0];  // Value after } is the units
      // Stylise stat
      if (Object.keys(statEmojis).includes(params['stat'])) {
        params['statlbl'] = `**${statEmojis[params['stat']]}${toTitleCase(params['stat'])}**`
      }
      // Calculate value
      let val = parseInt(document.getElementById(params['stat']).value);  // Value of relevant stat
      val *= parseNum(params['qty']);  // Multiply by quantity
      val = Math.round(val);  // Round
      if (isNaN(val)) {
        val = "`?`";  // Substitute NaN with a nanval element
      }
      // Construct HTML output
      let html = `**${val}${params['units']}** *(${params['qty']} x ${params['statlbl']})*`
      // Replace matched string with parsed html
      raw = raw.replace(rel, html)
    };
  }

  // Find all type / stat / currency labels
  re = /\[\[\w*\]\]/g
  matches = raw.match(re);
  if (matches) {
    // For each match...
    for (let lbl of matches) {
      // Get inner contents
      content = lbl.match(/(?<=\[\[)\w*(?=\]\])/g)[0];
      // Define colors
      let cls
      let style
      if (Object.keys(elementColors).includes(content.toLowerCase())) {
        // Stylise type labels
        html = `\`${content}\``;
      } else if (Object.keys(statEmojis).includes(content.toLowerCase())) {
        // Append emoji to stat labels
        let label = content;
        if (Object.keys(statAliases).includes(content.toLowerCase())) {
          label = statAliases[content];
        }
        html = `**${statEmojis[content.toLowerCase()]}${toTitleCase(label)}**`;
      } else if (content.match(/^\d*[gsc]$/g)) {
        // Substitute money labels for corresponding emoji
        content = content.replace("g", "🥇");
        content = content.replace("s", "🥈");
        content = content.replace("c", "🥉");
        html = content;
      } else {
        html = content;
      }
      // Replace matched string with parsed html
      raw = raw.replace(lbl, html);
    }
  }
  // Return processed output
  return raw;
}

function setJSON(inStr) {
  let inDict = JSON.parse(inStr)
  // Restore values
  for (let emt of document.getElementById("write").elements) {
    // markdown object isn't recognised by form, so alias it with its editor
    if (emt.className === "md-editor") {
        emt = emt.parentNode;
    }
    // Only use relevant values from inDict
    if (emt.id in inDict) {
      emt.value = inDict[emt.id];
    }
  }
  // Set page title
  document.title = inDict["name"]
}

function load() {
  // Load the .json file to a dict
  var reader = new FileReader();
  loadbuffer.onchange = function () {
    reader.readAsText(loadbuffer.files[0]);
  };
  // Add listener function so loading actually happens
  reader.addEventListener("loadend", function () {
    // Set from JSON
    setJSON(reader.result);
    updateLvl();
    updateStats();
    updateMaxHp();
    updateCurrency();
  });
  // Click to trigger previously defined functions
  loadbuffer.click();
}

function loadmd(target) {
    // Load the .md file to a string
    var reader = new FileReader();
    loadbuffer.onchange = function () {
      reader.readAsText(loadbuffer.files[0]);
    };
    // Set value of target
    reader.addEventListener("loadend", function () {
      target.value = reader.result;
    });
    // Click to trigger previously defined functions
    loadbuffer.click();
}

function custommd(raw) {
  let re;
  let matches;
  // Find all relative values in contents
  re = /\[[\d\/\.]*\]\{\w*\}\w*/g;
  matches = raw.match(re);
  if (matches) {
    // For each match...
    for (let rel of matches) {
      // Get parameters
      let params = {}
      params['qty'] = rel.match(/(?<=\[).*(?=\])/g)[0];  // Value between [ and ] is the quantity
      params['stat'] = rel.match(/(?<=\{)\w*(?=\})/g)[0].toLowerCase();  // Value between { and } is the relevant stat name
      params['units'] = rel.match(/(?<=\})\w*/g)[0];  // Value after } is the units
      // Stylise stat
      if (Object.keys(statEmojis).includes(params['stat'])) {
        params['statlbl'] = `<span class=premoji>${statEmojis[params['stat']]}</span>${toTitleCase(params['stat'])}`
      }
      // Calculate value
      let val = parseInt(document.getElementById(params['stat']).value);  // Value of relevant stat
      val *= parseNum(params['qty']);  // Multiply by quantity
      val = Math.round(val);  // Round
      if (isNaN(val)) {
        val = "<span class=nanval>?</span>";  // Substitute NaN with a nanval element
      }
      // Construct HTML output
      let html = `<span class=relval>${val}${params['units']} <span class=relval-context>(${params['qty']} x ${params['statlbl']})</span></span>`
      // Replace matched string with parsed html
      raw = raw.replace(rel, html)
    };
  }

  // Find all type / stat / currency labels
  re = /\[\[\\?\w*\]\]/g
  matches = raw.match(re);
  var submap = []
  if (matches) {
    // For each match...
    for (let lbl of matches) {
      // Get inner contents
      content = lbl.match(/(?<=\[\[)\\?\w*(?=\]\])/g)[0];
      // Define colors
      let cls
      let style
      if (Object.keys(elementColors).includes(content.toLowerCase())) {
        // Stylise type labels
        cls = "typelbl";
        style = ` style="color: ${elementColors[content][1]}; background-color:${elementColors[content][0]}"`;
      } else if (Object.keys(statEmojis).includes(content.toLowerCase())) {
        // Append emoji to stat labels
        let label = content;
        if (Object.keys(statAliases).includes(content.toLowerCase())) {
          label = statAliases[content];
        }
        content = `<span class=premoji>${statEmojis[content.toLowerCase()]}</span>${toTitleCase(label)}`
        // Stylise stat labels
        cls = "statlbl";
        style = " style=font-weight:bold;";
      } else if (content.match(/^\d*[gsc]$/g)) {
        // Substitute money labels for corresponding emoji
        content = content.replace("g", "🥇");
        content = content.replace("s", "🥈");
        content = content.replace("c", "🥉");
        // Style money labels
        cls = "moneylbl";
        style = "";
      } else {
        // Style other labels
        cls = "otherlbl";
        style = "";
      }
      // Construct HTML output
      let html = `<span class=${cls}${style}>${content}</span>`;
      if (lbl.includes("\\")) {
        // If escaped, override replacement and just strip the escape
        html = lbl.replace("\\", "")
      }
      submap.push({"re": lbl, "repl": html})
    }
  }
  // Replace matched string with parsed html
  for (mapping of submap) {
    // Do non-escaped first
    if (!mapping['re'].includes("\\")) {
      raw = raw.replace(mapping['re'], mapping['repl']);
    }
  }
  for (mapping of submap) {
    // Then do escaped
    if (mapping['re'].includes("\\")) {
      raw = raw.replace(mapping['re'], mapping['repl']);
    }
  }

  // Return processed output
  return raw;
}

function parseNum(numStr) {
  // If contains a /, treat as a fraction
  if (numStr.includes("/")) {
    // Get numerator and denominator
    let numer = parseInt(numStr.split("/")[0]);
    let denom = parseInt(numStr.split("/")[1]);
    // Calculate value
    return numer / denom;
  }

  // If contains a ., treat as decimal
  else if (numStr.includes(".")) {
    // Use parseFloat
    return parseFloat(numStr)
  }

  // Otherwise, treat as int
  else {
    // Use parseInt
    return parseInt(numStr)
  }
}