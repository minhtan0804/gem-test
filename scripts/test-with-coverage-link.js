#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Run vitest with coverage
const vitest = spawn('npx', ['vitest', 'run', '--reporter=html', '--coverage'], {
  stdio: 'inherit',
  shell: true,
  cwd: projectRoot,
});

vitest.on('close', (code) => {
  const coveragePath = resolve(projectRoot, 'coverage', 'index.html');
  const htmlReportPath = resolve(projectRoot, 'html-report', 'index.html');
  
  // Function to create clickable hyperlink using OSC 8 (ANSI escape codes)
  // This works in iTerm2, VS Code terminal, Windows Terminal, and other modern terminals
  const createHyperlink = (text, url) => {
    // OSC 8 escape sequence format: ESC]8;;URL\aTEXT\a
    // Using BEL character (\x07) instead of \x1b\\ for better compatibility
    return `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`;
  };
  
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  
  if (existsSync(coveragePath)) {
    const fileUrl = `file://${coveragePath}`;
    console.log('📊 Coverage Report:');
    // Create clickable link
    const link = createHyperlink('👉 Click here to open coverage report', fileUrl);
    console.log(`   ${link}`);
    // Also show the URL for terminals that don't support hyperlinks
    console.log(`   ${fileUrl}`);
    console.log('');
  }
  
  if (existsSync(htmlReportPath)) {
    const fileUrl = `file://${htmlReportPath}`;
    console.log('📋 Test Report:');
    // Create clickable link
    const link = createHyperlink('👉 Click here to open test report', fileUrl);
    console.log(`   ${link}`);
    // Also show the URL for terminals that don't support hyperlinks
    console.log(`   ${fileUrl}`);
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  
  process.exit(code);
});

