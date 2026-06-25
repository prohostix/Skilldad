const fs = require('fs');
const path = require('path');

function checkBalance(content) {
    let stack = [];
    // Enhanced regex to catch more tags and ignore self-closing ones
    let tags = content.match(/<[a-zA-Z0-9\.]+(?:\s+[^>]*?)?\/?>|<\/[a-zA-Z0-9\.]+>|\{|\}/g);
    
    if (!tags) return "No tags found";

    for (let tag of tags) {
        if (tag === '{') {
            stack.push('{');
        } else if (tag === '}') {
            if (stack.length === 0 || stack[stack.length - 1] !== '{') {
                return `Unbalanced } found at tag position. Stack: ${stack.join(', ')}`;
            }
            stack.pop();
        } else if (tag.startsWith('</')) {
            let tagName = tag.substring(2, tag.length - 1);
            if (stack.length === 0 || stack[stack.length - 1] !== tagName) {
                return `Unbalanced closing tag: ${tag} (Expected </${stack[stack.length-1]}>)`;
            }
            stack.pop();
        } else if (tag.startsWith('<')) {
            if (tag.endsWith('/>')) continue;
            let tagName = tag.substring(1).split(/[\s>]/)[0];
            
            const selfClosing = ['img', 'input', 'br', 'hr', 'meta', 'link'];
            if (!selfClosing.includes(tagName.toLowerCase())) {
                stack.push(tagName);
            }
        }
    }

    if (stack.length > 0) {
        return `Unbalanced stack: ${stack.join(', ')}`;
    }

    return "Balanced!";
}

const targetFile = 'C:\\Users\\lenovo\\Desktop\\ProHostix\\SkillDad02\\SkillDad\\client\\src\\pages\\university\\ExamManagement.jsx';
const content = fs.readFileSync(targetFile, 'utf8');
console.log(checkBalance(content));
