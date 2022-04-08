'use strict';

const toString = require('./toString.js');

module.exports = function (UI) {
  try { UI = new Object(JSON.parse(JSON.stringify(UI))) } catch (e) { UI = {} }

  let parsedUI = {
    id: toString(UI.id),
    position: UI.position,
    visible: UI.visible,
    clickable: UI.clickable,
    shortcut: UI.shortcut,
    components: UI.components
  }

  if (parsedUI.visible || parsedUI.visible == null) {
    delete parsedUI.visible;
    let position = parsedUI.position, idealPos = [0, 0, 100, 100], newPos = [], count = 0;
    for (let i = 0 ; i < 4 ; ++i) {
      let pos = position?.[i];
      if (pos == null || isNaN(pos) || pos == idealPos[i]) {
        ++count;
        newPos.push(idealPos[i])
      }
      else newPos.push(+pos)
    }
    if (count == 4) delete parsedUI.position;
    else parsedUI.position = newPos
  }
  else {
    parsedUI.position = [0,0,0,0];
    parsedUI.visible = false;
    delete parsedUI.components
  }

  if (!parsedUI.clickable) {
    delete parsedUI.clickable;
    delete parsedUI.shortcut
  }

  return parsedUI
}
