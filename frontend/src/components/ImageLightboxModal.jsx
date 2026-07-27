import React, { useState } from 'react';

const ImageLightboxModal = ({ isOpen, onClose, imageUrl, imageTitle }) => {
  const [zoomScale, setZoomScale] = useState(1);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.3, 3.5));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.3, 0.5));
  const handleResetZoom = () => setZoomScale(1);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    const safeTitle = (imageTitle || 'slide_image').toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `${safeTitle}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0d10]/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 md:p-6 animate-fade-in print-hidden">
      {/* Top Header Bar */}
      <div className="w-full max-w-6xl flex justify-between items-center bg-[#13151a] p-4 px-6 rounded-2xl border border-zinc-800 shadow-2xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#da6b38] flex items-center justify-center text-white font-bold text-base shadow-sm">
            🔍
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#da6b38] font-bold">
              AI Slide Diagram Inspector
            </div>
            <h3 className="text-sm font-bold text-white font-heading truncate max-w-xs md:max-w-md">
              {imageTitle || 'Slide Graphic'}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="bg-[#0c0d10] p-1 rounded-xl flex items-center border border-zinc-800 font-mono text-xs text-zinc-300">
            <button
              onClick={handleZoomOut}
              className="p-1.5 px-2.5 hover:bg-zinc-800 rounded-lg transition-colors font-bold"
              title="Zoom Out (-)"
            >
              -
            </button>
            <span className="px-2 font-bold text-[#da6b38]">{Math.round(zoomScale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 px-2.5 hover:bg-zinc-800 rounded-lg transition-colors font-bold"
              title="Zoom In (+)"
            >
              +
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 px-2 hover:bg-zinc-800 rounded-lg transition-colors text-[10px] uppercase font-bold text-zinc-400 border-l border-zinc-800 ml-1"
              title="Reset Zoom to 100%"
            >
              Reset
            </button>
          </div>

          {/* Download Image Button */}
          <button
            onClick={handleDownload}
            className="btn-primary px-4 py-2 rounded-xl text-xs font-bold font-heading flex items-center gap-2 shadow-sm"
            title="Download this slide image individually"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>Download Image</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors text-base"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Center Image Zoom Canvas */}
      <div className="flex-1 w-full flex items-center justify-center overflow-auto p-4 relative">
        <div 
          className="transition-transform duration-200 ease-out max-w-full max-h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ transform: `scale(${zoomScale})` }}
        >
          <img
            src={imageUrl}
            alt={imageTitle || 'Zoomed Slide Graphic'}
            className="max-w-[85vw] max-h-[75vh] object-contain rounded-2xl border border-zinc-800 shadow-2xl bg-black"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-[11px] font-mono text-zinc-500 bg-[#13151a] px-4 py-2 rounded-xl border border-zinc-800">
        💡 Use controls above to zoom, inspect details, or save this slide image individually.
      </div>
    </div>
  );
};

export default ImageLightboxModal;
