const fs = require('fs');

const commentPath = 'c:\\Users\\Admin\\Documents\\Karya\\RuangCerita\\src\\data\\comment.txt';
const jsPath = 'c:\\Users\\Admin\\Documents\\Karya\\RuangCerita\\src\\data\\cerpen.js';

const text = fs.readFileSync(commentPath, 'utf8');

const lines = text.split('\n');
let mainTitle = 'Cerita Baru';
let pages = {};
let pageIndex = 1;

let currentChapter = '';
let currentTitle = '';
let currentContent = [];

function savePage() {
    let contentStr = currentContent.join('\n').trim();
    if (contentStr.length > 0) {
        pages[`page${pageIndex}`] = {
            chapter: currentChapter,
            title: currentTitle,
            content: contentStr
        };
        pageIndex++;
        currentContent = [];
    }
}

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    
    if (line.startsWith('# ') && !line.startsWith('## ')) {
        mainTitle = line.substring(2).trim();
    } else if (line.startsWith('## ')) {
        savePage();
        let chapterLine = line.substring(3).trim();
        let parts = chapterLine.split('—');
        if (parts.length === 1) parts = chapterLine.split('-');
        
        currentChapter = parts[0].trim();
        currentTitle = parts.length > 1 ? parts.slice(1).join('-').trim() : '';
    } else {
        if (currentChapter === '') continue;
        
        currentContent.push(line);
        
        let currentLength = currentContent.join('\n').length;
        if (currentLength > 1200 && (line === '' || line === '---')) {
            if (line === '---') {
                currentContent.pop();
            }
            savePage();
        }
    }
}
savePage();

let newStory = `  {
    id: "the-black-scarf",
    title: "${mainTitle}",
    subtitle: "Bagian 1",
    author: "7arzz",
    genre: "Fantasy, Action",
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
    let beforeInsert = jsContent.substring(0, insertPos);
    if (!beforeInsert.trim().endsWith(',')) {
        beforeInsert += ',';
    }
    jsContent = beforeInsert + '\n' + newStory + '\n' + jsContent.substring(insertPos);
    fs.writeFileSync(jsPath, jsContent);
    console.log('Successfully inserted ' + mainTitle + ' with ' + (pageIndex - 1) + ' pages!');
} else {
    console.log('Could not find insert position.');
}
