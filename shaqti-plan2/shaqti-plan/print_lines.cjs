const fs = require('fs');
const path = require('path');
const target = process.argv[2];
if (!target) {
  console.error('usage: node print_lines.cjs <file>');
  process.exit(1);
}
const filePath = path.resolve(target);
const text = fs.readFileSync(filePath, 'utf8').split('\\n');
text.forEach((line, i) => {
  console.log((i + 1).toString().padStart(3, '0') + ': ' + line);
});
