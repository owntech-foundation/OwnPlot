/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-06-28 14:52:53
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-07-08 16:52:21
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
