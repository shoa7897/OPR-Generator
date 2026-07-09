import React from 'react';
import { ReportData } from '../types';

interface Props {
  data: ReportData;
  id?: string;
}

export default function ReportPreview({ data, id = "print-area" }: Props) {
  // Helper to format text with newlines into bullet points or paragraphs
  const renderList = (text: string) => {
    if (!text) return null;
    const items = text.split('\n').filter(item => item.trim() !== '');
    if (items.length === 1 && !text.includes('\n')) {
       return <p className="leading-snug" style={{ color: '#334155', fontSize: `${data.fontSize || 12}px` }}>{text}</p>;
    }
    return (
      <ul className="list-disc pl-4 leading-snug space-y-0" style={{ color: '#334155', fontSize: `${data.fontSize || 12}px` }}>
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  };

  const renderParagraphs = (text: string) => {
     if (!text) return null;
     const items = text.split('\n').filter(item => item.trim() !== '');
     return (
       <div className="leading-snug space-y-1 text-justify" style={{ color: '#334155', fontSize: `${data.fontSize || 12}px` }}>
         {items.map((item, idx) => (
           <p key={idx}>{item}</p>
         ))}
       </div>
     );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  return (
    <div 
      id={id} 
      className="shadow-2xl flex flex-col mx-auto"
      style={{
        width: '794px',
        height: '1123px',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        backgroundColor: '#ffffff',
        position: 'relative',
      }}
    >
      <div className="h-2 w-full shrink-0" style={{ backgroundColor: data.themeColor }}></div>
      
      {data.showHeader !== false && (
        <header className="px-8 py-6 flex items-center gap-6 border-b shrink-0" style={{ borderColor: '#f1f5f9' }}>
          {data.logos.filter(Boolean).length > 0 ? (
             <div className="flex gap-2 items-center">
               {data.logos.filter(Boolean).map((logo, idx) => (
                  <img key={idx} src={logo} alt="Logo" className="w-16 h-16 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
               ))}
             </div>
          ) : (
             <div className="w-16 h-16 rounded-sm flex items-center justify-center font-bold text-xs" style={{ backgroundColor: '#e2e8f0', color: '#94a3b8' }}>
               LOGO
             </div>
          )}
          <div>
            <h2 className="text-sm font-bold uppercase leading-tight tracking-wide" style={{ color: '#1e293b' }}>{data.schoolName}</h2>
            <p className="text-[10px] italic uppercase" style={{ color: '#64748b' }}>{data.reportType}</p>
          </div>
        </header>
      )}
      
      <div className="flex-1 px-8 py-4 flex flex-col min-h-0">
        <h1 className="text-xl font-black text-center mb-4 leading-none uppercase shrink-0 p-3 rounded text-white" style={{ backgroundColor: data.themeColor }}>{data.programTitle}</h1>
        
        {data.showProgramDetails !== false && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4 shrink-0">
            <div className="space-y-3">
              <div className="p-2 rounded border-l-4" style={{ backgroundColor: '#f1f5f9', borderColor: data.secondaryColor }}>
                <p className="text-[9px] font-bold uppercase mb-0.5" style={{ color: data.secondaryColor }}>Tarikh</p>
                <p className="text-xs uppercase" style={{ color: '#1e293b' }}>{formatDate(data.tarikh)}</p>
              </div>
              <div className="p-2 rounded border-l-4" style={{ backgroundColor: '#f1f5f9', borderColor: data.secondaryColor }}>
                <p className="text-[9px] font-bold uppercase mb-0.5" style={{ color: data.secondaryColor }}>Tempat</p>
                <p className="text-xs uppercase" style={{ color: '#1e293b' }}>{data.tempat}</p>
              </div>
              <div className="p-2 rounded border-l-4" style={{ backgroundColor: '#f1f5f9', borderColor: data.secondaryColor }}>
                <p className="text-[9px] font-bold uppercase mb-0.5" style={{ color: data.secondaryColor }}>Sasaran</p>
                <p className="text-xs uppercase" style={{ color: '#1e293b' }}>{data.sasaran}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-2 rounded border-l-4" style={{ backgroundColor: '#f1f5f9', borderColor: data.secondaryColor }}>
                <p className="text-[9px] font-bold uppercase mb-0.5" style={{ color: data.secondaryColor }}>Masa</p>
                <p className="text-xs uppercase" style={{ color: '#1e293b' }}>{data.masa}</p>
              </div>
              <div className="p-2 rounded border-l-4" style={{ backgroundColor: '#f1f5f9', borderColor: data.secondaryColor }}>
                <p className="text-[9px] font-bold uppercase mb-0.5" style={{ color: data.secondaryColor }}>Anjuran</p>
                <p className="text-xs uppercase" style={{ color: '#1e293b' }}>{data.anjuran}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
            <div className="flex flex-col gap-4 h-full min-h-0">
              {data.showObjektif !== false && (
                <div className="p-2 rounded border-l-4 shrink-0" style={{ backgroundColor: '#f1f5f9', borderColor: data.secondaryColor }}>
                  <p className="text-[9px] font-bold uppercase mb-1" style={{ color: data.secondaryColor }}>Objektif Program</p>
                  {renderParagraphs(data.objektif)}
                </div>
              )}
              {data.showAktiviti !== false && (
                <div className="p-2 rounded border-l-4 flex-1 min-h-0 overflow-hidden flex flex-col" style={{ backgroundColor: '#f1f5f9', borderColor: data.secondaryColor }}>
                  <p className="text-[9px] font-bold uppercase mb-1 shrink-0" style={{ color: data.secondaryColor }}>Aktiviti Program</p>
                  <div className="flex-1 overflow-hidden">
                    {renderList(data.aktiviti)}
                  </div>
                </div>
              )}
              {data.showImpak !== false && (
                <div className="p-2 rounded border-l-4 shrink-0" style={{ backgroundColor: '#f1f5f9', borderColor: data.secondaryColor }}>
                  <p className="text-[9px] font-bold uppercase mb-1" style={{ color: data.secondaryColor }}>Impak Program</p>
                  {renderParagraphs(data.impak)}
                </div>
              )}
            </div>
            
            {data.showPhotos !== false && (
              <div className="grid grid-rows-5 gap-3 h-full min-h-0">
                {[0, 1, 2, 3, 4].map((idx) => {
                  return (
                    <div key={idx} className="rounded relative flex items-center justify-center overflow-hidden w-full h-full min-h-0" style={{ backgroundColor: '#e2e8f0' }}>
                      {data.photos[idx] ? (
                        <img src={data.photos[idx]} alt={`Foto ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <span className="text-[8px] font-bold relative z-10" style={{ color: '#94a3b8' }}>FOTO {idx + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {data.showCadangan !== false && (
            <div className="p-2 rounded border-l-4 shrink-0" style={{ backgroundColor: '#f1f5f9', borderColor: data.secondaryColor }}>
              <p className="text-[9px] font-bold uppercase mb-1" style={{ color: data.secondaryColor }}>Cadangan Penambahbaikan</p>
              <div className="text-justify" style={{ color: '#334155' }}>
                {renderParagraphs(data.cadangan)}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {data.showFooter !== false && (
        <footer className="px-8 pb-3 pt-0 flex justify-end shrink-0 mt-auto z-10" style={{ backgroundColor: '#ffffff' }}>
          <div className="w-48 text-right">
            <p className="text-[10px] font-medium mb-6 text-left" style={{ color: '#475569' }}>Disediakan oleh,</p>
            <div className="border-b w-full mb-1" style={{ borderColor: '#0f172a' }}></div>
            <p className="text-[10px] font-bold uppercase text-left" style={{ color: '#1e293b' }}>{data.preparedByName}</p>
            <p className="text-[9px] italic text-left" style={{ color: '#64748b' }}>{data.preparedByRole}</p>
            {data.showDateStamp !== false && data.preparedDate && (
               <p className="text-[9px] italic mt-0.5 text-left" style={{ color: '#64748b' }}>Tarikh: {formatDate(data.preparedDate)}</p>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
