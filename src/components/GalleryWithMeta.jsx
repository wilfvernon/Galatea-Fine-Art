import React from 'react'
import Gallery from './Gallery'

export default function GalleryWithMeta({ items, onItemClick }) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = months[new Date().getMonth()];
  const note = 'These are the ones that worked.';

  return (
    <div>
      <div className="subtitle">Exhibition — {currentMonth}</div>
      <div className="note">{note}</div>
      <Gallery items={items} onItemClick={onItemClick} />
    </div>
  )
}
