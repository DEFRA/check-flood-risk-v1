module.exports = function (fullString, length, hasElpises, options) {
  var shortString = fullString.substring(0,length)
  // Remove trailing white space
  shortString = shortString.replace(/\s+$/, '')
  // Remove trailing comma
  shortString = shortString.replace(/,\s*$/, '')
  // Add elipses
  if (hasElpises === true) {
    shortString += '...'
  }
  return shortString
}
