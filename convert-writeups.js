#!/usr/bin/env node

/**
 * Convert Markdown writeups to JSON format for the blog
 * Usage: node convert-writeups.js <input-dir> [output-file]
 * 
 * Reads .md files with YAML frontmatter and converts to blog JSON format
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
  // Split into lines for processing
  const lines = markdown.split('\n');
  const result = [];
  let i = 0;

  // Process code blocks first (preserve them)
  const preservedBlocks = [];
  let processed = markdown;
  
  processed = processed.replace(/```(?:[\w]*\n)?([\s\S]*?)```/g, (match, code) => {
    const escaped = code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const placeholder = `__CODEBLOCK_${preservedBlocks.length}__`;
    preservedBlocks.push(`<pre><code>${escaped}</code></pre>`);
    return placeholder;
  });

  // Now process line by line
  const processedLines = processed.split('\n');
  let inUnorderedList = false;
  let inOrderedList = false;
  let buffer = '';

  for (let i = 0; i < processedLines.length; i++) {
    let line = processedLines[i];

    // Headers
    if (line.match(/^#{1,4}\s+/)) {
      if (buffer.trim()) {
        result.push(wrapParagraph(buffer));
        buffer = '';
      }
      if (inUnorderedList) {
        result.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        result.push('</ol>');
        inOrderedList = false;
      }
      
      const match = line.match(/^(#{1,4})\s+(.*)/);
      const level = match[1].length;
      const text = processFormatting(match[2]);
      result.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    // Code blocks (preserved)
    if (line.includes('__CODEBLOCK_')) {
      if (buffer.trim()) {
        result.push(wrapParagraph(buffer));
        buffer = '';
      }
      if (inUnorderedList) {
        result.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        result.push('</ol>');
        inOrderedList = false;
      }
      result.push(line);
      continue;
    }

    // Blockquotes
    if (line.match(/^>\s+/)) {
      if (buffer.trim()) {
        result.push(wrapParagraph(buffer));
        buffer = '';
      }
      if (inUnorderedList) {
        result.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        result.push('</ol>');
        inOrderedList = false;
      }
      const text = line.replace(/^>\s+/, '');
      result.push(`<blockquote>${processFormatting(text)}</blockquote>`);
      continue;
    }

    // Unordered list items
    if (line.match(/^[-*]\s+/)) {
      if (buffer.trim()) {
        result.push(wrapParagraph(buffer));
        buffer = '';
      }
      if (inOrderedList) {
        result.push('</ol>');
        inOrderedList = false;
      }
      if (!inUnorderedList) {
        result.push('<ul>');
        inUnorderedList = true;
      }
      const text = line.replace(/^[-*]\s+/, '');
      result.push(`<li>${processFormatting(text)}</li>`);
      continue;
    }

    // Ordered list items
    if (line.match(/^\d+\.\s+/)) {
      if (buffer.trim()) {
        result.push(wrapParagraph(buffer));
        buffer = '';
      }
      if (inUnorderedList) {
        result.push('</ul>');
        inUnorderedList = false;
      }
      if (!inOrderedList) {
        result.push('<ol>');
        inOrderedList = true;
      }
      const text = line.replace(/^\d+\.\s+/, '');
      result.push(`<li>${processFormatting(text)}</li>`);
      continue;
    }

    // Empty line
    if (!line.trim()) {
      if (buffer.trim()) {
        result.push(wrapParagraph(buffer));
        buffer = '';
      }
      if (inUnorderedList) {
        result.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        result.push('</ol>');
        inOrderedList = false;
      }
      continue;
    }

    // Regular paragraph text
    buffer += (buffer ? ' ' : '') + line;
  }

  // Flush remaining buffer
  if (buffer.trim()) {
    result.push(wrapParagraph(buffer));
  }
  if (inUnorderedList) {
    result.push('</ul>');
  }
  if (inOrderedList) {
    result.push('</ol>');
  }

  let html = result.join('\n');

  // Restore code blocks
  preservedBlocks.forEach((block, i) => {
    html = html.replace(`__CODEBLOCK_${i}__`, block);
  });

  return html;
}

function processFormatting(text) {
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  
  // Italic
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  return text;
}

function wrapParagraph(text) {
  text = text.trim();
  if (!text) return '';
  return `<p>${processFormatting(text)}</p>`;
}

// Parse YAML frontmatter from markdown
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return { metadata: {}, content: content };

  const yamlStr = match[1];
  const metadata = {};

  // Simple YAML parser for our use case
  yamlStr.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (!key.trim()) return;

    let value = valueParts.join(':').trim();

    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Parse arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/^["']|["']$/g, ''));
    }

    metadata[key.trim()] = value;
  });

  const contentStart = match[0].length;
  const mdContent = content.slice(contentStart).trim();

  return { metadata, content: mdContent };
}

// Generate SHA512 hash of content
function generateHash(content) {
  return 'sha512:' + crypto.createHash('sha512').update(content).digest('hex').slice(0, 12);
}

// Convert markdown title to slug (ID)
function generateId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

// Parse a markdown file into a writeup object
function parseWriteup(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { metadata, content: mdContent } = parseFrontmatter(content);

  // Extract tags from metadata (handle both comma and array formats)
  let tags = metadata.tags || [];
  if (typeof tags === 'string') {
    tags = tags
      .replace(/[\[\]"']/g, '')
      .split(',')
      .map(t => t.trim())
      .filter(t => t);
  }

  // Extract difficulty from tags if present
  let difficulty = 'medium';
  const diffTags = tags.filter(t => ['init', 'medium', 'hard'].includes(t.toLowerCase()));
  if (diffTags.length > 0) {
    difficulty = diffTags[0].toLowerCase();
    tags = tags.filter(t => !['init', 'medium', 'hard'].includes(t.toLowerCase()));
  }

  // Extract category from title or metadata
  let category = metadata.category || 'general';
  const titleMatch = metadata.title.match(/(\w+)\/(.+)/);
  if (titleMatch) {
    category = titleMatch[1].toLowerCase();
  }

  // Clean up title
  let title = metadata.title;
  if (titleMatch) {
    title = titleMatch[2].trim();
  }

  // Build writeup object
  const writeup = {
    id: generateId(title),
    title: title,
    category: category,
    difficulty: difficulty,
    summary: metadata.subtitle || mdContent.split('\n')[0].slice(0, 300),
    content: markdownToHtml(mdContent),
    tags: tags.filter(t => t),
    hash: generateHash(mdContent),
    mitigations: extractMitigations(mdContent),
    date: metadata.date || new Date().toISOString()
  };

  return writeup;
}

// Extract mitigations/recommendations from content
function extractMitigations(content) {
  const mitigations = [];
  
  // Look for section headers like "## Mitigations" or "## Defense"
  const lines = content.split('\n');
  let inMitigationSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for mitigation-like headers
    if (line.match(/^#+\s*(mitigation|defense|protection|countermeasure|remediation)/i)) {
      inMitigationSection = true;
      continue;
    }

    // Stop if we hit another section
    if (inMitigationSection && line.match(/^#+\s/)) {
      break;
    }

    // Extract bullet points
    if (inMitigationSection && line.match(/^[-*]\s+/)) {
      const mitigation = line.replace(/^[-*]\s+/, '').trim();
      if (mitigation && mitigations.length < 10) {
        mitigations.push(mitigation);
      }
    }
  }

  // Fallback mitigations if none found
  if (mitigations.length === 0) {
    mitigations.push('Review and validate security controls');
    mitigations.push('Implement proper input validation');
    mitigations.push('Enable security monitoring and logging');
  }

  return mitigations;
}

// Main conversion logic
function convertWriteupsDirectory(inputDir, outputFile) {
  if (!fs.existsSync(inputDir)) {
    console.error(`Error: Input directory "${inputDir}" not found`);
    process.exit(1);
  }

  // Read all .md files
  const files = fs.readdirSync(inputDir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(inputDir, f));

  if (files.length === 0) {
    console.warn(`No .md files found in "${inputDir}"`);
    process.exit(0);
  }

  console.log(`Found ${files.length} markdown file(s)...`);

  // Parse each file
  const writeups = files
    .map(file => {
      try {
        const writeup = parseWriteup(file);
        console.log(`✓ Parsed: ${path.basename(file)} → ${writeup.id}`);
        return writeup;
      } catch (err) {
        console.error(`✗ Error parsing ${path.basename(file)}: ${err.message}`);
        return null;
      }
    })
    .filter(w => w !== null);

  // Sort by date (newest first)
  writeups.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Write output
  const json = JSON.stringify(writeups, null, 2);
  fs.writeFileSync(outputFile, json, 'utf8');
  
  console.log(`\n✓ Converted ${writeups.length} writeup(s)`);
  console.log(`✓ Output: ${outputFile}`);
}

// CLI
const args = process.argv.slice(2);
const inputDir = args[0] || './writeups-md';
const outputFile = args[1] || './assets/data/writeups.json';

console.log('📝 Converting Markdown writeups to JSON...\n');
convertWriteupsDirectory(inputDir, outputFile);
