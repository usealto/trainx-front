/**
 * This node script can be run before build
 * * npm run prebuild
 *
 * It will create a .ts file used to display in the HTML the exact date at which this version was built.
 * * <div>{{ buildTime }}</div>
 */

var fs = require('fs');
var stamp = new Date().toUTCString();

fs.writeFile('src/build-time.ts', 'export const buildTime="' + stamp + '"', function (err) {
  if (err) {
    return console.log(err);
  }
  console.log('The file was saved!');
});
