'use strict'

const phoneNumberLength = 9
window.addEventListener('DOMContentLoaded', (_event) => {
  const elem = document.querySelector('#student-ssn') as HTMLInputElement;
  elem.onkeyup = function (_e: KeyboardEvent) {
    let val = elem.value;
    if (val !== null && val.length > 0) {
      val = val.replace(/^\s*|\s*$|-/gu, '');
      if (val.length === phoneNumberLength) {
        console.log(`Valid SSN: ${val}!`);
      }
    } else {
      console.log(`Invalid SSN: ${val}!`);
    }
  };
});
