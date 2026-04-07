import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Props = {
  images: string[];
  fallbackImage?: string;
  altText: string;
};

export default function ImageCarousel({ images, fallbackImage, altText }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out any undefined or broken strings if necessary, though they should be valid URLs
  const validImages = images?.length > 0 ? images : [fallbackImage || 'https://dummyimage.com/400x200/222/fff&text=Unavailable'];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering parent clicks
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const setIndex = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* IMAGES */}
      <div 
        style={{ 
          display: 'flex', 
          width: `${validImages.length * 100}%`,
          height: '100%',
          transform: `translateX(-${(currentIndex * 100) / validImages.length}%)`,
          transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
      >
        {validImages.map((img, i) => (
          <img 
            key={i} 
            src={img} 
            alt={`${altText} ${i + 1}`} 
            style={{ width: `${100 / validImages.length}%`, height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.src = 'https://dummyimage.com/400x200/222/fff&text=Unavailable'; }}
          />
        ))}
      </div>

      {/* ARROWS */}
      {validImages.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', color: '#333' }}
          >
            <FaChevronLeft size={14} />
          </button>
          
          <button 
            onClick={handleNext}
            style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', color: '#333' }}
          >
            <FaChevronRight size={14} />
          </button>

          {/* DOTS */}
          <div style={{ position: 'absolute', bottom: '15px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '6px' }}>
            {validImages.map((_, i) => (
              <div 
                key={i} 
                onClick={(e) => setIndex(e, i)}
                style={{ 
                  width: '6px', height: '6px', borderRadius: '50%', 
                  background: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }} 
              />
            ))}
          </div>
        </>
      )}

    </div>
  );
}
