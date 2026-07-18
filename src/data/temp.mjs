import fs from 'fs';
const path = "c:\\Users\\Admin\\Documents\\Karya\\RuangCerita\\src\\data\\cerpen.js";
const content = fs.readFileSync(path, 'utf8');

const startIdx = content.indexOf('/*');
const endIdx = content.lastIndexOf('*/');

if (startIdx !== -1 && endIdx !== -1) {
  let commentContent = content.substring(startIdx + 2, endIdx);
  fs.writeFileSync('c:\\Users\\Admin\\Documents\\Karya\\RuangCerita\\src\\data\\comment.txt', commentContent);
  console.log("Successfully extracted comment");
} else {
  console.log("Could not find comment block");
}
