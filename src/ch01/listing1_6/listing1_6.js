window.addEventListener('DOMContentLoaded', (_event) => {
  const elem = document.querySelector('#student-ssn');
  elem.onkeyup = function (_e) {
    let val = elem.value;
    if (val !== null && val.length !== 0) {
      val = val.replace(/^\s*|\s*$|\-/g, '');
      if (val.length === 9) {
        console.log(`Valid SSN: ${val}!`);
      }
    } else {
      console.log(`Invalid SSN: ${val}!`);
    }
  };
})
