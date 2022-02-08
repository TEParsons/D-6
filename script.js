/** Style weakness/resistance labels **/
var elementColors = {
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
for (obj of document.getElementsByClassName("typelbl")) {
  if (Object.keys(elementColors).includes(obj.innerHTML)) {
    obj.style.color = elementColors[obj.innerHTML][1];
    obj.style.backgroundColor = elementColors[obj.innerHTML][0];
  }
}

updateLvl();
doRest();