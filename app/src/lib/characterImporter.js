/**
 * Example usage of the D&D Beyond character transformer
 * 
 * This demonstrates how to transform the D&D Beyond JSON into
 * our database schema format
 */

import { transformDnDBeyondCharacter } from './characterTransformer.js';

/**
 * Example: Transform a D&D Beyond character for database insertion
 * 
 * @param {Object} dndBeyondJson - The raw JSON from D&D Beyond API
 * @param {string} userId - The authenticated user's ID from Supabase
 * @returns {Object} Structured data ready for database operations
 */
export async function importCharacterFromDnDBeyond(dndBeyondJson, userId) {
  // Transform the data
  const transformedData = transformDnDBeyondCharacter(dndBeyondJson, userId);
  
  console.log('Transformed character data:', {
    name: transformedData.character.name,
    level: transformedData.character.level,
    class: transformedData.character.class,
    species: transformedData.character.species,
  });
  
  return transformedData;
}

/**
 * Example: Insert transformed character into Supabase
 * 
 * This shows the pattern for inserting the character and all related data
 * using the transformed structure
 */
export async function insertCharacterToDatabase(supabase, transformedData) {
  // 1. Insert main character record
  const { data: character, error: characterError } = await supabase
    .from('characters')
    .insert([transformedData.character])
    .select()
    .single();
  
  if (characterError) {
    throw new Error(`Failed to insert character: ${characterError.message}`);
  }
  
  const characterId = character.id;
  
  // 2. Insert skills (only proficient/expertise)
  if (transformedData.skills.length > 0) {
    const skillsWithCharId = transformedData.skills.map(skill => ({
      ...skill,
      character_id: characterId,
    }));
    
    const { error: skillsError } = await supabase
      .from('character_skills')
      .insert(skillsWithCharId);
    
    if (skillsError) {
      console.error('Failed to insert skills:', skillsError);
    }
  }
  
  // 3. Insert spells
  if (transformedData.spells.length > 0) {
    // Note: In production, you'd first ensure spells exist in the `spells` table
    // and then reference their IDs. For now, we'll skip this step.
    console.log(`Would insert ${transformedData.spells.length} spells`);
  }
  
  // 4. Insert features
  if (transformedData.features.length > 0) {
    const featuresWithCharId = transformedData.features.map(feature => ({
      ...feature,
      character_id: characterId,
    }));
    
    const { error: featuresError } = await supabase
      .from('character_features')
      .insert(featuresWithCharId);
    
    if (featuresError) {
      console.error('Failed to insert features:', featuresError);
    }
  }
  
  // 5. Insert feats
  if (transformedData.feats.length > 0) {
    // Note: Similar to spells, you'd reference the feats table
    console.log(`Would insert ${transformedData.feats.length} feats`);
  }
  
  // 6. Insert inventory
  if (transformedData.inventory.length > 0) {
    const inventoryWithCharId = transformedData.inventory.map(item => ({
      character_id: characterId,
      magic_item_id: item.magicItemId,
      mundane_item_name: item.mundaneItemName,
      quantity: item.quantity,
      equipped: item.equipped,
      attuned: item.attuned,
      notes: item.notes,
    }));
    
    const { error: inventoryError } = await supabase
      .from('character_inventory')
      .insert(inventoryWithCharId);
    
    if (inventoryError) {
      console.error('Failed to insert inventory:', inventoryError);
    }
  }
  
  // 7. Insert currency
  const { error: currencyError } = await supabase
    .from('character_currency')
    .insert({
      character_id: characterId,
      ...transformedData.currency,
    });
  
  if (currencyError) {
    console.error('Failed to insert currency:', currencyError);
  }
  
  // 8. Insert senses
  if (transformedData.senses.length > 0) {
    const sensesWithCharId = transformedData.senses.map(sense => ({
      ...sense,
      character_id: characterId,
    }));
    
    const { error: sensesError } = await supabase
      .from('character_senses')
      .insert(sensesWithCharId);
    
    if (sensesError) {
      console.error('Failed to insert senses:', sensesError);
    }
  }
  
  // 9. Insert class-specific data
  if (Object.keys(transformedData.classSpecific).length > 0) {
    const { error: classSpecificError } = await supabase
      .from('character_class_specific')
      .insert({
        character_id: characterId,
        data: transformedData.classSpecific,
      });
    
    if (classSpecificError) {
      console.error('Failed to insert class-specific data:', classSpecificError);
    }
  }
  
  return character;
}

/**
 * Example: Complete workflow - fetch from D&D Beyond and save to database
 */
export async function importAndSaveCharacter(supabase, dndBeyondCharacterId, userId) {
  try {
    // 1. Fetch from D&D Beyond API
    const response = await fetch(
      `https://character-service.dndbeyond.com/character/v5/character/${dndBeyondCharacterId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch character from D&D Beyond');
    }
    
    const dndBeyondJson = await response.json();
    
    // 2. Transform the data
    const transformedData = importCharacterFromDnDBeyond(dndBeyondJson, userId);
    
    // 3. Insert into database
    const character = await insertCharacterToDatabase(supabase, transformedData);
    
    console.log('Successfully imported character:', character.name);
    return character;
    
  } catch (error) {
    console.error('Error importing character:', error);
    throw error;
  }
}

/**
 * Example: Dry run - just see what the transformation produces
 */
export function previewTransformation(dndBeyondJson) {
  const userId = 'example-user-id';
  const transformed = transformDnDBeyondCharacter(dndBeyondJson, userId);
  
  console.log('\n=== CHARACTER PREVIEW ===');
  console.log('Name:', transformed.character.name);
  console.log('Level:', transformed.character.level);
  console.log('Class:', transformed.character.class, transformed.character.subclass);
  console.log('Species:', transformed.character.species);
  console.log('HP:', transformed.character.maxHp);
  console.log('\n=== ABILITY SCORES ===');
  console.log('STR:', transformed.character.strength, '(Save:', transformed.character.saveStrength + ')');
  console.log('DEX:', transformed.character.dexterity, '(Save:', transformed.character.saveDexterity + ')');
  console.log('CON:', transformed.character.constitution, '(Save:', transformed.character.saveConstitution + ')');
  console.log('INT:', transformed.character.intelligence, '(Save:', transformed.character.saveIntelligence + ')');
  console.log('WIS:', transformed.character.wisdom, '(Save:', transformed.character.saveWisdom + ')');
  console.log('CHA:', transformed.character.charisma, '(Save:', transformed.character.saveCharisma + ')');
  console.log('\n=== SKILLS ===');
  transformed.skills.forEach(skill => {
    console.log(`- ${skill.name}${skill.expertise ? ' (Expertise)' : ''}`);
  });
  console.log('\n=== SPELLS ===');
  console.log('Total spells:', transformed.spells.length);
  console.log('\n=== FEATURES ===');
  console.log('Total features:', transformed.features.length);
  console.log('\n=== INVENTORY ===');
  console.log('Total items:', transformed.inventory.length);
  console.log('\n=== CURRENCY ===');
  console.log('Gold:', transformed.currency.gold);
  
  return transformed;
}
