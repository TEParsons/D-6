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
  let maxhp = Math.floor(lvl * 6 + def);
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
  let points = parseInt(document.getElementById("lvl").value) * 6 * 6;
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
}

function getJSON() {
  let outDict = {};
  // Get values
  for (let emt of document.getElementById("write").elements) {
    // markdown object isn't recognised by form, so alias it with its editor
    if (emt === document.getElementById("background").editor) {
      emt = document.getElementById("background");
    }
    if (emt === document.getElementById("abilities").editor) {
      emt = document.getElementById("abilities");
    }
    if (emt === document.getElementById("inventory").editor) {
      emt = document.getElementById("inventory");
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

function setJSON(inStr) {
  let inDict = JSON.parse(inStr)
  // Restore values
  for (let emt of document.getElementById("write").elements) {
    // markdown object isn't recognised by form, so alias it with its editor
    if (emt === document.getElementById("background").editor) {
      emt = document.getElementById("background");
    }
    if (emt === document.getElementById("abilities").editor) {
      emt = document.getElementById("abilities");
    }
    if (emt === document.getElementById("inventory").editor) {
      emt = document.getElementById("inventory");
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
  });
  // Click to trigger previously defined functions
  loadbuffer.click();
}

function custommd(raw) {
  let re;
  let matches;
  // Find all relative values in contents
  re = /\[\d*\]\{\w*\}d?/g;
  matches = raw.match(re);
  if (matches) {
    // For each match...
    for (let rel of matches) {
      // Get number and stat from match
      let num = parseInt(rel.match(/(?<=\[)\d*(?=\])/g)[0]);
      let stat = rel.match(/(?<=\{)\w*(?=\})/g)[0].toLowerCase();
      let statVal = parseInt(document.getElementById(stat).value);
      // If there's a d on the end, make sure it goes after the value, not the context
      let _d;
      if (rel.toLowerCase().endsWith("d")) {
        _d = "d"
      } else {
        _d = ""
      }
      // Construct HTML output
      let html = `<span class=relval>${statVal * num}${_d} <span class=relval-context>(${num} x ${stat})</span></span>`
      // Replace matched string with parsed html
      raw = raw.replace(rel, html)
    };
  }

  // Find all type labels
  re = /\[\[\w*\]\]/g
  matches = raw.match(re);
  if (matches) {
    // For each match...
    for (let lbl of matches) {
      // Get inner contents
      type = lbl.match(/(?<=\[\[)\w*(?=\]\])/g)[0];
      // Define colors
      let colStr
      if (Object.keys(elementColors).includes(type)) {
        colStr = ` style="color: ${elementColors[type][1]}; background-color:${elementColors[type][0]}"`
      } else {
        colStr = ""
      }
      // Construct HTML output
      let html = `<span class=typelbl${colStr}>${type}</span>`;
      // Replace matched string with parsed html
      raw = raw.replace(lbl, html);
    }
  }
  // Return processed output
  return raw;
}