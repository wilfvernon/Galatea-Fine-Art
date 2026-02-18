import React from 'react'

export default function HeaderPinned() {
  const title = 'Galatea Fine Art'

  return (
    <>
      <div className="pinned-title" role="banner">
        <img className="artist-inline" src="/artist.png" alt="The Artist" />
        <h1>{title}</h1>
      </div>
      <div className="pinned-divider" aria-hidden="true" />
    </>
  )
}
