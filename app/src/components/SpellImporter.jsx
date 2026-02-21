import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SpellImporter() {
  const [jsonUrl, setJsonUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Fetch JSON from URL
      console.log('Fetching from:', jsonUrl);
      const response = await fetch(jsonUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data);

      // Transform and insert spells
      const spells = transformSpellData(data);
      console.log('Transformed spells:', spells.length);

      if (spells.length === 0) {
        throw new Error('No valid spells found in JSON');
      }

      // Insert into database
      const { data: insertedSpells, error: insertError } = await supabase
        .from('spells')
        .upsert(spells, { 
          onConflict: 'name',
          ignoreDuplicates: false 
        })
        .select();

      if (insertError) {
        throw new Error(`Database error: ${insertError.message}`);
      }

      setResult({
        success: true,
        count: insertedSpells?.length || spells.length,
        spells: insertedSpells || spells,
      });

    } catch (err) {
      console.error('Import error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Transform various spell JSON formats to our schema
  const transformSpellData = (data) => {
    let spellArray = [];

    // Handle different JSON structures
    if (Array.isArray(data)) {
      spellArray = data;
    } else if (data.spells && Array.isArray(data.spells)) {
      spellArray = data.spells;
    } else if (data.results && Array.isArray(data.results)) {
      spellArray = data.results;
    } else if (typeof data === 'object') {
      // Single spell object
      spellArray = [data];
    }

    return spellArray
      .filter(spell => spell.name) // Must have a name
      .map(spell => ({
        name: spell.name,
        level: spell.level ?? 0,
        school: spell.school?.name || spell.school || null,
        casting_time: spell.casting_time || spell.castingTime || null,
        range: spell.range || null,
        components: spell.components?.join(', ') || spell.components || null,
        duration: spell.duration || null,
        description: spell.desc?.join('\n') || spell.description || spell.desc || 'No description available',
        higher_levels: spell.higher_level?.join('\n') || spell.higherLevel || spell.higher_levels || null,
      }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>📜 Import Spells</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Paste a URL to a JSON file containing spell data. Supports D&D 5e API format and simple spell arrays.
      </p>

      <form onSubmit={handleImport}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="jsonUrl" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            JSON URL:
          </label>
          <input
            id="jsonUrl"
            type="url"
            value={jsonUrl}
            onChange={(e) => setJsonUrl(e.target.value)}
            placeholder="https://example.com/spells.json"
            required
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !jsonUrl}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Importing...' : 'Import Spells'}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '4px',
          color: '#c62828',
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e8f5e9',
          border: '1px solid #4CAF50',
          borderRadius: '4px',
          color: '#2e7d32',
        }}>
          <strong>✅ Success!</strong> Imported {result.count} spell{result.count !== 1 ? 's' : ''}
          
          <details style={{ marginTop: '15px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              View imported spells
            </summary>
            <ul style={{ marginTop: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {result.spells.map((spell, idx) => (
                <li key={idx}>
                  <strong>{spell.name}</strong> (Level {spell.level}, {spell.school || 'Unknown school'})
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Example JSON Formats:</h3>
        
        <h4>Array of spells:</h4>
        <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`[
  {
    "name": "Fireball",
    "level": 3,
    "school": "Evocation",
    "casting_time": "1 action",
    "range": "150 feet",
    "components": "V, S, M",
    "duration": "Instantaneous",
    "description": "A bright streak flashes...",
    "higher_levels": "When you cast this spell..."
  }
]`}
        </pre>

        <h4>D&D 5e API format:</h4>
        <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`{
  "results": [
    {
      "name": "Fireball",
      "level": 3,
      "school": { "name": "Evocation" },
      "desc": ["A bright streak flashes..."],
      "higher_level": ["When you cast this spell..."]
    }
  ]
}`}
        </pre>

        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          <strong>Tip:</strong> Try <a href="https://www.dnd5eapi.co/api/spells" target="_blank" rel="noopener noreferrer">https://www.dnd5eapi.co/api/spells</a>
        </p>
      </div>
    </div>
  );
}
