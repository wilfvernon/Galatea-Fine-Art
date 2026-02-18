import React, { useState, useEffect } from 'react'
import Header from './components/HeaderPinned'
import Gallery from './components/GalleryWithMeta'
import Modal from './components/Modal'

export default function AppMain() {
  const [data, setData] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetch('/items.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`)
        return r.json()
      })
      .then(data => setData(data))
      .catch(error => {
        console.error('Error loading data:', error)
        setData({ items: [] })
      })
  }, [])

  const handleItemClick = (index) => {
    setSelectedItem(data.items[index])
    setIsModalOpen(true)
  }

  const handleCloseModal = () => setIsModalOpen(false)

  if (!data) return <div className="wrap">Loading...</div>

  return (
    <>
      <Header />
      <div className="wrap">
        <Gallery items={data.items} onItemClick={handleItemClick} />
      </div>
      <Modal item={selectedItem} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  )
}
