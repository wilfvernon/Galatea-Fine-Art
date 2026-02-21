#!/usr/bin/env node

/**
 * Test script to preview the character transformation
 * 
 * Usage: node testTransform.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { transformDnDBeyondCharacter } from './characterTransformer.js';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the Corrin character JSON (located in app directory)
const corrinPath = join(__dirname, '../../corrin.json');
const corrinJson = JSON.parse(readFileSync(corrinPath, 'utf-8'));

// Transform it
console.log('Transforming Corrin Vale from D&D Beyond...\n');
const transformed = transformDnDBeyondCharacter(corrinJson, 'test-user-id');

// Display results
console.log('═══════════════════════════════════════');
console.log('CHARACTER CORE DATA');
console.log('═══════════════════════════════════════');
console.log(JSON.stringify(transformed.character, null, 2));

console.log('\n═══════════════════════════════════════');
console.log('SKILLS (Proficient/Expertise Only)');
console.log('═══════════════════════════════════════');
console.log(JSON.stringify(transformed.skills, null, 2));

console.log('\n═══════════════════════════════════════');
console.log('SPELLS');
console.log('═══════════════════════════════════════');
console.log(`Total: ${transformed.spells.length} spells`);
transformed.spells.slice(0, 5).forEach(spell => {
  console.log(`- ${spell.name} (Level ${spell.level})${spell.prepared ? ' [Prepared]' : ''}`);
});
if (transformed.spells.length > 5) {
  console.log(`... and ${transformed.spells.length - 5} more`);
}

console.log('\n═══════════════════════════════════════');
console.log('FEATURES');
console.log('═══════════════════════════════════════');
console.log(`Total: ${transformed.features.length} features`);
transformed.features.slice(0, 5).forEach(feature => {
  console.log(`- [${feature.source.toUpperCase()}] ${feature.name}`);
  if (feature.maxUses) {
    console.log(`  Uses: ${feature.maxUses}/${feature.resetOn}`);
  }
});
if (transformed.features.length > 5) {
  console.log(`... and ${transformed.features.length - 5} more`);
}

console.log('\n═══════════════════════════════════════');
console.log('FEATS');
console.log('═══════════════════════════════════════');
transformed.feats.forEach(feat => {
  console.log(`- ${feat.name} (${feat.source})`);
});

console.log('\n═══════════════════════════════════════');
console.log('INVENTORY');
console.log('═══════════════════════════════════════');
console.log(`Total: ${transformed.inventory.length} items`);
transformed.inventory.slice(0, 8).forEach(item => {
  const name = item.mundaneItemName || item.itemDetails.name;
  const equipped = item.equipped ? ' [E]' : '';
  const attuned = item.attuned ? ' [A]' : '';
  const qty = item.quantity > 1 ? ` (x${item.quantity})` : '';
  console.log(`- ${name}${equipped}${attuned}${qty}`);
});
if (transformed.inventory.length > 8) {
  console.log(`... and ${transformed.inventory.length - 8} more`);
}

console.log('\n═══════════════════════════════════════');
console.log('CURRENCY');
console.log('═══════════════════════════════════════');
console.log(`Gold: ${transformed.currency.gold} gp`);

console.log('\n═══════════════════════════════════════');
console.log('SENSES');
console.log('═══════════════════════════════════════');
transformed.senses.forEach(sense => {
  console.log(`- ${sense.type}: ${sense.range} ft`);
});

console.log('\n═══════════════════════════════════════');
console.log('CLASS-SPECIFIC DATA');
console.log('═══════════════════════════════════════');
console.log(JSON.stringify(transformed.classSpecific, null, 2));

console.log('\n✅ Transformation complete!\n');
