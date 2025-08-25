import React from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { Dialog, DialogContent } from './dialog'

interface Photo {
  id: number
  name: string
  description?: string
  url: string
  context?: string
  tags?: string[]
}

interface PhotoDisplayProps {
  photos: Photo[]
  isOpen: boolean
  onClose: () => void
}

export function PhotoDisplay({ photos, isOpen, onClose }: PhotoDisplayProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0)
    }
  }, [isOpen])

  if (!photos || photos.length === 0) return null

  const currentPhoto = photos[currentIndex]
  const hasMultiplePhotos = photos.length > 1

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="relative bg-black">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Navigation arrows */}
          {hasMultiplePhotos && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={goToNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Photo display */}
          <div className="flex flex-col h-full">
                         {/* Image */}
             <div className="flex-1 flex items-center justify-center p-4">
               <img
                 src={currentPhoto.url}
                 alt={currentPhoto.name}
                 className="max-w-full max-h-full object-contain rounded-lg"
                 crossOrigin="anonymous"
                 onError={(e) => {
                   console.error('Failed to load image:', currentPhoto.url)
                   e.currentTarget.src = '/placeholder.jpg'
                 }}
                 onLoad={() => {
                   console.log('Image loaded successfully:', currentPhoto.url)
                 }}
               />
             </div>

            {/* Photo info */}
            <div className="bg-white p-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentPhoto.name}
                </h3>
                {hasMultiplePhotos && (
                  <span className="text-sm text-gray-500">
                    {currentIndex + 1} of {photos.length}
                  </span>
                )}
              </div>
              
              {currentPhoto.context && (
                <p className="text-gray-700 mb-2">{currentPhoto.context}</p>
              )}
              
              {currentPhoto.description && (
                <p className="text-sm text-gray-600 mb-2">{currentPhoto.description}</p>
              )}
              
              {currentPhoto.tags && currentPhoto.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {currentPhoto.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
