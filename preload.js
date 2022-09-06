/**
 * @ Author: Guillaume Arthaud & Matthias Riffard (OwnTech Fundation)
 * @ Website: https://www.owntech.org/
 * @ Mail: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-20 14:21:39
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-09-05 15:30:36
 * @ Description:
 */

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
  
  //document.getElementById('serialport-version').innerText = require('serialport/package').version
})
