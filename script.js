/** Style weakness/resistance labels **/
for (obj of document.getElementsByClassName("typelbl")) {
  if (Object.keys(elementColors).includes(obj.innerHTML)) {
    obj.style.color = elementColors[obj.innerHTML][1];
    obj.style.backgroundColor = elementColors[obj.innerHTML][0];
  }
}

updateLvl();
doRest();