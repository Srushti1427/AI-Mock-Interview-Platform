const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'app');
const componentsPath = path.join(__dirname, 'components');
const globalsConfigPath = path.join(__dirname, 'app', 'globals.css');
const tailwindConfigPath = path.join(__dirname, 'tailwind.config.js');

const replacements = [
    { regex: /from-blue-900/g, replacement: 'from-strawberry' },
    { regex: /hover:from-blue-800/g, replacement: 'hover:from-strawberry-dark' },
    { regex: /to-orange-500/g, replacement: 'to-salmon' },
    { regex: /hover:to-orange-600/g, replacement: 'hover:to-salmon-dark' },
    { regex: /via-orange-500/g, replacement: 'via-salmon' },
    { regex: /text-blue-900/g, replacement: 'text-strawberry' },
    { regex: /text-orange-500/g, replacement: 'text-salmon' },
    { regex: /shadow-orange-500/g, replacement: 'shadow-salmon/40' },
    { regex: /border-orange-500/g, replacement: 'border-salmon' },
    { regex: /border-orange-200/g, replacement: 'border-peach' },
    { regex: /border-orange-900/g, replacement: 'border-strawberry-dark' },
    { regex: /bg-blue-600/g, replacement: 'bg-strawberry' },
    { regex: /from-blue-500/g, replacement: 'from-strawberry' },
    { regex: /from-blue-300/g, replacement: 'from-peach' },
    { regex: /to-orange-300/g, replacement: 'to-mint' },
    { regex: /from-orange-500/g, replacement: 'from-salmon' },
    { regex: /to-blue-900/g, replacement: 'to-strawberry' },
    { regex: /bg-orange-100/g, replacement: 'bg-peach' },
    { regex: /from-violet-600/g, replacement: 'from-strawberry' },
    { regex: /via-indigo-500/g, replacement: 'via-salmon' },
    { regex: /to-purple-500/g, replacement: 'to-peach' },
    { regex: /from-violet-400/g, replacement: 'from-strawberry' },
    { regex: /via-indigo-400/g, replacement: 'via-salmon' },
    { regex: /to-purple-400/g, replacement: 'to-peach' },
    { regex: /shadow-violet-500/g, replacement: 'shadow-strawberry' },
    { regex: /hover:shadow-violet-500/g, replacement: 'hover:shadow-strawberry' },
    { regex: /hover:border-violet-200/g, replacement: 'hover:border-peach' },
    { regex: /from-violet-700/g, replacement: 'from-strawberry-dark' },
    { regex: /to-indigo-600/g, replacement: 'to-salmon' },
    { regex: /to-indigo-700/g, replacement: 'to-salmon-dark' },
    { regex: /border-violet-200/g, replacement: 'border-peach' },
    { regex: /border-violet-800/g, replacement: 'border-strawberry-dark' },
    { regex: /text-orange-600/g, replacement: 'text-salmon-dark' },
    { regex: /bg-gradient-to-r from-blue-900 to-orange-500/g, replacement: 'bg-gradient-to-r from-strawberry to-salmon' }
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = [...walk(directoryPath)];
if (fs.existsSync(componentsPath)) {
    files.push(...walk(componentsPath));
}

let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
    });

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Finished updating ${changedCount} files.`);
