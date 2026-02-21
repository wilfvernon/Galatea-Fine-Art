import { useState } from 'react';
import SpellImporter from '../components/SpellImporter';

export default function DndAdmin() {
  const [activeTab, setActiveTab] = useState('spells');

  return (
    <div style={{ padding: '20px' }}>
      <h1>D&D Admin Dashboard</h1>
      
      <div style={{ 
        borderBottom: '2px solid #ccc', 
        marginBottom: '20px',
        display: 'flex',
        gap: '20px'
      }}>
        <button
          onClick={() => setActiveTab('spells')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'spells' ? '#4CAF50' : 'transparent',
            color: activeTab === 'spells' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'spells' ? '3px solid #4CAF50' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          📜 Spells
        </button>
        
        <button
          onClick={() => setActiveTab('items')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'items' ? '#4CAF50' : 'transparent',
            color: activeTab === 'items' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'items' ? '3px solid #4CAF50' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          ⚔️ Magic Items (Coming soon)
        </button>
        
        <button
          onClick={() => setActiveTab('feats')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'feats' ? '#4CAF50' : 'transparent',
            color: activeTab === 'feats' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'feats' ? '3px solid #4CAF50' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          🎯 Feats (Coming soon)
        </button>

        <button
          onClick={() => setActiveTab('characters')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'characters' ? '#4CAF50' : 'transparent',
            color: activeTab === 'characters' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'characters' ? '3px solid #4CAF50' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          🎲 Characters (Coming soon)
        </button>
      </div>

      <div>
        {activeTab === 'spells' && <SpellImporter />}
        {activeTab === 'items' && <div>Magic item importer coming soon...</div>}
        {activeTab === 'feats' && <div>Feat importer coming soon...</div>}
        {activeTab === 'characters' && <div>Character importer coming soon...</div>}
      </div>
    </div>
  );
}
