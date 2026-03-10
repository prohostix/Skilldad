#!/usr/bin/env node

/**
 * Script to automatically fix common ESLint errors
 * Run with: node fix-lint-errors.js
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  // Remove unused motion import when not used
  {
    pattern: /import { motion } from 'framer-motion';\n/g,
    check: (content) => !content.includes('<motion.') && !content.includes('motion('),
    replacement: ''
  },
  // Remove unused motion from destructured imports
  {
    pattern: /import { motion, (.*?) } from 'framer-motion';/g,
    check: (content) => !content.includes('<motion.') && !content.includes('motion('),
    replacement: 'import { $1 } from \'framer-motion\';'
  },
  // Remove unused axios import
  {
    pattern: /import axios from 'axios';\n/g,
    check: (content) => !content.includes('axios.') && !content.includes('axios('),
    replacement: ''
  },
  // Remove unused useEffect
  {
    pattern: /import React, { (.*?), useEffect(.*?) } from 'react';/g,
    check: (content) => !content.includes('useEffect('),
    replacement: 'import React, { $1$2 } from \'react\';'
  },
  // Remove unused useNavigate
  {
    pattern: /import { (.*?), useNavigate(.*?) } from 'react-router-dom';/g,
    check: (content) => !content.includes('useNavigate(') && !content.includes('const navigate = useNavigate'),
    replacement: 'import { $1$2 } from \'react-router-dom\';'
  },
  // Remove unused useParams
  {
    pattern: /import { (.*?), useParams(.*?) } from 'react-router-dom';/g,
    check: (content) => !content.includes('useParams(') && !content.includes('const { ') && !content.includes('const params'),
    replacement: 'import { $1$2 } from \'react-router-dom\';'
  },
  // Remove unused useContext
  {
    pattern: /import React, { (.*?), useContext(.*?) } from 'react';/g,
    check: (content) => !content.includes('useContext('),
    replacement: 'import React, { $1$2 } from \'react\';'
  },
  // Remove unused useMemo
  {
    pattern: /import React, { (.*?), useMemo(.*?) } from 'react';/g,
    check: (content) => !content.includes('useMemo('),
    replacement: 'import React, { $1$2 } from \'react\';'
  }
];

function cleanupImports(content) {
  // Clean up double commas
  content = content.replace(/,\s*,/g, ',');
  // Clean up leading commas
  content = content.replace(/{\s*,/g, '{');
  // Clean up trailing commas before }
  content = content.replace(/,\s*}/g, '}');
  // Clean up empty imports
  content = content.replace(/import {\s*} from ['"].*?['"];\n/g, '');
  
  return content;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  fixes.forEach(fix => {
    if (fix.check(content)) {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }
  });

  if (modified) {
    content = cleanupImports(content);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${filePath}`);
    return true;
  }

  return false;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      callback(filePath);
    }
  });
}

console.log('Starting automatic lint fixes...\n');

let fixedCount = 0;
const srcDir = path.join(__dirname, 'src');

walkDir(srcDir, (filePath) => {
  if (fixFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\n✓ Fixed ${fixedCount} files`);
console.log('\nNote: Some errors require manual fixes:');
console.log('- Missing useEffect dependencies');
console.log('- Unused variables in function parameters');
console.log('- Complex unused variable scenarios');
