/**
 * Immutable value objects used in the book
 * Author: Luis Atencio
 */
function coordinate(lat, long) {
  const _lat = lat;
  const _long = long;
  return {
    latitude() {
      return _lat;
    },
    longitude() {
      return _long;
    },
    translate(dx, dy) {
      return coordinate(_lat + dx, _long + dy);
    },
    toString() {
      return `(${_lat},${_long})`;
    },
  };
}

function zipCode(code, location) {
  const _code = code;
  const _location = location || '';
  return {
    code() {
      return _code;
    },
    location() {
      return _location;
    },
    fromString(str) {
      const parts = str.split('-');
      return zipCode(parts[0], parts[1]);
    },
    toString() {
      return `${_code}-${_location}`;
    },
  };
}

module.exports = {
  coordinate,
  zipCode,
};
