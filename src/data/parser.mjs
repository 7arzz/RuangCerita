import fs from 'fs';

const commentPath = "c:\\Users\\Admin\\Documents\\Karya\\RuangCerita\\src\\data\\comment.txt";
const jsPath = "c:\\Users\\Admin\\Documents\\Karya\\RuangCerita\\src\\data\\cerpen.js";

const text = fs.readFileSync(commentPath, 'utf8');

// Parse chapters
const chapterRegex = /# \*\*([^\*]+)\*\*\s*\n\s*# \*\*([^\*]+)\*\*\s*\n([\s\S]*?)(?=(?:# \*\*|\*\*Bersambung|\*\*— TAMAT —\*\*))/g;

let pages = {};
let match;
let pageIndex = 1;

while ((match = chapterRegex.exec(text)) !== null) {
    const chapterName = match[1].trim();
    const titleName = match[2].trim();
    let content = match[3].trim();
    
    pages[`page${pageIndex}`] = {
        chapter: chapterName,
        title: titleName,
        content: content
    };
    pageIndex++;
}

// Construct JS object string
let newStory = `  {
    id: "lumora-digital-studio-s2",
    title: "Lumora Digital Studio",
    subtitle: "Season 2",
    author: "Elvano & Rhea",
    genre: "Romance, Slice of Life",
    year_published: "2026",
    theme: {
      styleClass: "vintage-emerald",
      accentColor: "#fbe680",
    },
    pages: ${JSON.stringify(pages, null, 6).replace(/\n/g, '\n    ')}
  }`;

let jsContent = fs.readFileSync(jsPath, 'utf8');
const insertPos = jsContent.lastIndexOf('];');

if (insertPos !== -1) {
    jsContent = jsContent.substring(0, insertPos) + ",\n" + newStory + "\n" + jsContent.substring(insertPos);
    
    // Also remove the comment block at the end
    const commentStart = jsContent.indexOf('/*');
    const commentEnd = jsContent.lastIndexOf('*/');
    if (commentStart !== -1 && commentEnd !== -1 && commentStart > insertPos) {
       jsContent = jsContent.substring(0, commentStart) + jsContent.substring(commentEnd + 2);
    }
    
    fs.writeFileSync(jsPath, jsContent);
    console.log("Successfully inserted story!");
} else {
    console.log("Could not find insert position.");
}
