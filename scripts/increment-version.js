#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Type of version increment
// 'patch' = 0.1.1 -> 0.1.2
// 'minor' = 0.1.1 -> 0.2.0
// 'major' = 0.1.1 -> 1.0.0
const INCREMENT_TYPE = process.argv[2] || 'patch';

// Function to read and parse package.json
function readPackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  return JSON.parse(packageJsonContent);
}

// Function to increment version
function incrementVersion(currentVersion, type) {
  const versionParts = currentVersion.split('.');
  
  switch (type) {
    case 'major':
      return `${parseInt(versionParts[0], 10) + 1}.0.0`;
    case 'minor':
      return `${versionParts[0]}.${parseInt(versionParts[1], 10) + 1}.0`;
    case 'patch':
    default:
      return `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2], 10) + 1}`;
  }
}

// Function to update package.json
function updatePackageJson(newVersion) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = readPackageJson();
  
  packageJson.version = newVersion;
  
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf8'
  );
  
  console.log(`Updated package.json version to ${newVersion}`);
}

// Function to update CHANGELOG.md
function updateChangelog(newVersion) {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  
  if (!fs.existsSync(changelogPath)) {
    console.log('CHANGELOG.md not found, skipping update');
    return;
  }
  
  let changelogContent = fs.readFileSync(changelogPath, 'utf8');
  
  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Create new version heading
  const newVersionHeading = `## [${newVersion}] - ${today}

### Added
- 

### Changed
- 

### Fixed
- 

`;
  
  // Find position after the header to insert new version
  const headerEndPos = changelogContent.indexOf('## [');
  
  if (headerEndPos === -1) {
    console.log('Could not find version section in CHANGELOG.md, skipping update');
    return;
  }
  
  // Insert new version heading after headers but before first version
  changelogContent = 
    changelogContent.substring(0, headerEndPos) + 
    newVersionHeading + 
    changelogContent.substring(headerEndPos);
  
  fs.writeFileSync(changelogPath, changelogContent, 'utf8');
  console.log(`Updated CHANGELOG.md with new version ${newVersion}`);
}

// Main execution
try {
  const packageJson = readPackageJson();
  const currentVersion = packageJson.version;
  const newVersion = incrementVersion(currentVersion, INCREMENT_TYPE);
  
  console.log(`Incrementing version: ${currentVersion} -> ${newVersion} (${INCREMENT_TYPE})`);
  
  updatePackageJson(newVersion);
  updateChangelog(newVersion);
  
  console.log('Version increment completed successfully.');
  console.log('Remember to update the CHANGELOG.md with your changes before publishing.');
} catch (error) {
  console.error('Error incrementing version:', error.message);
  process.exit(1);
} 