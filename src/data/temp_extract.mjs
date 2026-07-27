import fs from 'fs';

const commentPath = "c:\\Users\\Admin\\Documents\\Karya\\RuangCerita\\src\\data\\comment.txt";
const jsPath = "c:\\Users\\Admin\\Documents\\Karya\\RuangCerita\\src\\data\\cerpen.js";

const text = fs.readFileSync(commentPath, 'utf8');

// Parse chapters for Season 3
const chapterRegex = /# \*\*(Season 3 [^\*]+)\*\*\s*\n\s*# \*\*([^\*]+)\*\*\s*\n([\s\S]*?)(?=(?:# \*\*Season|\*\*Bersambung|\*\*— TAMAT —\*\*|— TAMAT —|$))/g;

let pages = {};
let match;
let pageIndex = 1;

while ((match = chapterRegex.exec(text)) !== null) {
    const chapterName = match[1].trim();
    const titleName = match[2].trim();
    let content = match[3].trim();
    
    // Clean up content, remove tamat if it got caught
    content = content.replace(/\*\*— TAMAT —\*\*/g, '').trim();
    
    pages[`page${pageIndex}`] = {
        chapter: chapterName.replace('Season 3 - ', 'Season 3 — ').replace('Season 3 — ', 'Season 3 — '),
        title: titleName,
        content: content
    };
    pageIndex++;
}

// Construct JS object string
let newStory = `  {
    id: "dibalik-lampu-studio-s3",
    title: "Dibalik Lampu Studio",
    subtitle: "Season 3",
    author: "7arzz",
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
    fs.writeFileSync(jsPath, jsContent);
    console.log("Successfully inserted Season 3 with " + (pageIndex - 1) + " pages!");
} else {
    console.log("Could not find insert position.");
}
