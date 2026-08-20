const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Colors
    content = content.replace(/#00d4aa/g, '#fbbf24'); // teal -> amber-400 (gold)
    content = content.replace(/#00b4d8/g, '#f59e0b'); // cyan -> amber-500 (gold)
    content = content.replace(/rgba\(0,212,170/g, 'rgba(251,191,36'); // teal rgba -> amber rgba
    content = content.replace(/rgba\(0, 212, 170/g, 'rgba(251, 191, 36');
    content = content.replace(/rgba\(0,180,216/g, 'rgba(245,158,11'); // cyan rgba -> amber rgba
    
    // Backgrounds & Glass (Dark to Light)
    content = content.replace(/rgba\(15,32,68/g, 'rgba(255,255,255');
    content = content.replace(/rgba\(15, 32, 68/g, 'rgba(255, 255, 255');
    content = content.replace(/rgba\(8,18,36/g, 'rgba(255,255,255');
    content = content.replace(/rgba\(8, 18, 36/g, 'rgba(255, 255, 255');
    content = content.replace(/#0a1628/g, '#ffffff'); // dark navy -> white
    content = content.replace(/#0f2044/g, '#f8fafc'); // lighter navy -> light gray
    
    // Text Colors (Light to Dark)
    content = content.replace(/#e2e8f0/g, '#1e293b'); // slate-200 -> slate-800
    content = content.replace(/#94a3b8/g, '#64748b'); // slate-400 -> slate-500
    content = content.replace(/#cbd5e1/g, '#475569'); // slate-300 -> slate-600
    
    // Borders & Overlays (Light to Dark)
    content = content.replace(/rgba\(255,255,255,0\.05\)/g, 'rgba(0,0,0,0.03)');
    content = content.replace(/rgba\(255, 255, 255, 0\.05\)/g, 'rgba(0, 0, 0, 0.03)');
    content = content.replace(/rgba\(255,255,255,0\.07\)/g, 'rgba(0,0,0,0.05)');
    content = content.replace(/rgba\(255, 255, 255, 0\.07\)/g, 'rgba(0, 0, 0, 0.05)');
    content = content.replace(/rgba\(255,255,255,0\.08\)/g, 'rgba(0,0,0,0.06)');
    content = content.replace(/rgba\(255, 255, 255, 0\.08\)/g, 'rgba(0, 0, 0, 0.06)');
    content = content.replace(/rgba\(255,255,255,0\.1\)/g, 'rgba(0,0,0,0.08)');
    content = content.replace(/rgba\(255, 255, 255, 0\.1\)/g, 'rgba(0, 0, 0, 0.08)');
    content = content.replace(/rgba\(255,255,255,0\.12\)/g, 'rgba(0,0,0,0.1)');
    content = content.replace(/rgba\(255, 255, 255, 0\.12\)/g, 'rgba(0, 0, 0, 0.1)');
    content = content.replace(/rgba\(255,255,255,0\.2\)/g, 'rgba(0,0,0,0.15)');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverseDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
            replaceInFile(fullPath);
        }
    }
}

traverseDirectory(directoryPath);
console.log('Theme update complete!');
