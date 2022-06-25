let valid = false;
const elem = document.querySelector('#student-ssn');
elem.onkeyup = function (event) {
  let val = elem.value;
  if (val !== null && val.length !== 0) {
    val = val.replace(/^\s*|\s*$|\-/g, '');
    if (val.length === 9) {
      console.log(`Valid SSN: ${val}!`);
      valid = true;
    }
  } else {
    console.log(`Invalid SSN: ${val}!`);
  }
};
