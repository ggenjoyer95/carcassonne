// Script to fix area names in tileDefinitions.js
// This script removes numbers from area names in the edges section
// but keeps the original area names in the areas section
//
// The issue: In the original tileDefinitions.js file, some tiles like CastleSidesQuad0
// have area names with numbers (like "castle1", "castle2") in both the edges section
// and the areas section. The matching algorithm in matchRules.js checks if the area names
// match exactly, which means that CastleSidesQuad0 can't match with other tiles that
// have "castle" edges.
//
// The solution: This script removes the numbers from area names in the edges section
// (changing "castle1" to "castle"), but keeps the original area names in the areas section.
// This way, the matching algorithm will be able to match the edges, but the frontend
// will still be able to render the areas correctly.
//
// Note: We also updated the placeMeeple function in gameController.js to handle this case
// by checking if the area name starts with the segment area name.

const fs = require('fs');
const path = require('path');

// Path to the tileDefinitions.js file
const tileDefinitionsPath = path.join(__dirname, 'tileDefinitions.js');
// Path for the backup file
const backupPath = path.join(__dirname, 'tileDefinitions_backup.js');

// Read the tileDefinitions.js file
console.log('Reading tileDefinitions.js...');
const content = fs.readFileSync(tileDefinitionsPath, 'utf8');

// Create a backup of the original file
console.log('Creating backup...');
fs.writeFileSync(backupPath, content, 'utf8');

// Regular expression to find area names with numbers in the edges section
// This pattern looks for { index: X, area: "nameWithNumber", group: "X" }
const areaNamePattern = /(\s*{\s*index:\s*\d+,\s*area:\s*")([a-zA-Z]+)(\d+)("(?:,|\s+)(?:\s*group:\s*"[^"]*")?)/g;

// Replace area names with numbers with their base name
console.log('Fixing area names in edges section...');
const fixedContent = content.replace(areaNamePattern, (match, prefix, baseName, number, suffix) => {
  console.log(`Replacing ${baseName}${number} with ${baseName}`);
  return `${prefix}${baseName}${suffix}`;
});

// Write the modified content back to the file
console.log('Writing fixed content...');
fs.writeFileSync(tileDefinitionsPath, fixedContent, 'utf8');

console.log('Done! The tileDefinitions.js file has been updated.');
console.log('A backup of the original file has been saved as tileDefinitions_backup.js');