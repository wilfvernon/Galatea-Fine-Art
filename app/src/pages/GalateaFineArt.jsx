import { useState, useEffect } from 'react';
import Gallery from '../components/Gallery';
import Modal from '../components/Modal';
import './GalateaFineArt.css';

function GalateaFineArt() {
  const [data, setData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/items.json', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then((data) => setData(data))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        console.error('Error loading data:', error);
        setLoadError('Unable to load gallery items right now.');
        setData({ items: [] });
      });

    return () => controller.abort();
  }, []);

  const handleItemClick = (index) => {
    setSelectedItem(data.items[index]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  if (!data) return <div className="gallery-loading">Loading...</div>;
  if (loadError) return <div className="gallery-error">{loadError}</div>;

  return (
    <div className="galatea-container">
      <div className="galatea-header">
        <h1 className="galatea-title">Galatea Fine Art</h1>
        <p className="galatea-subtitle">Purveyor of Extraordinary Magical Wares</p>
      </div>
      <Gallery items={data.items} onItemClick={handleItemClick} />
      <Modal item={selectedItem} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

export default GalateaFineArt;
