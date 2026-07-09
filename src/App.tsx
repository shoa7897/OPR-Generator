/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { ReportData } from './types';
import ReportForm from './components/ReportForm';
import ReportPreview from './components/ReportPreview';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { initAuth, googleSignIn, getAccessToken, logout, saveReportData, loadReportData } from './firebase';
import { User } from 'firebase/auth';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

const defaultData: ReportData = {
  themeColor: '#2e0a6d', // Deep purple
  secondaryColor: '#f59e0b', // Orange
  schoolName: 'SEKOLAH KEBANGSAAN TUN BANIR',
  logos: [],
  programTitle: 'PROGRAM',
  reportType: 'ONE PAGE REPORT',
  tarikh: '2026-07-01',
  masa: 'Sepanjang waktu persekolahan',
  tempat: 'Kawasan Sekolah',
  anjuran: 'Unit Hal Ehwal Murid dengan Kerjasama Jawatankuasa PPDa',
  sasaran: 'Semua murid Tahap 1 dan Tahap 2',
  objektif: 'Program ini dilaksanakan bagi membudayakan kesedaran tentang bahaya penyalahgunaan dadah melalui pelbagai aktiviti yang menarik dan berinformasi.\nSelain itu, program ini bertujuan meningkatkan penglibatan murid dalam aktiviti pencegahan dadah serta memperkukuhkan nilai diri dan sahsiah agar mereka mampu menjauhi gejala sosial yang negatif.',
  aktiviti: 'Majlis pelancaran Minggu Anti Dadah\nCeramah kesedaran anti dadah\nPertandingan melukis poster anti dadah\nKuiz dan aktiviti interaktif PPDa\nPameran maklumat berkaitan dadah\nPenutupan dan penyampaian hadiah',
  impak: 'Murid memperoleh pengetahuan yang lebih mendalam tentang bahaya dadah.\nKesedaran dan sikap menolak dadah dapat diperkukuh.\nPenglibatan aktif murid dalam aktiviti sekolah meningkat.\nPersekitaran sekolah menjadi lebih positif dan selamat.',
  cadangan: 'Menambah lebih banyak aktiviti kreatif dan interaktif.\nMelibatkan agensi luar seperti AADK dan pihak polis.\nMemperluaskan pameran dengan bahan yang lebih menarik.\nMengadakan program susulan selepas minggu tersebut.',
  photos: [],
  preparedByName: 'Setiausaha Program / Setiausaha HEM',
  preparedByRole: 'Sekolah Kebangsaan Tun Banir',
  preparedDate: '2026-04-18',
  showHeader: true,
  showFooter: true,
  showDateStamp: true,
  showProgramDetails: true,
  showObjektif: true,
  showAktiviti: true,
  showImpak: true,
  showCadangan: true,
  showPhotos: true,
  fontSize: 12,
};

export default function App() {
  const [data, setData] = useState<ReportData>(() => {
    try {
      const savedDraft = localStorage.getItem('reportDraft');
      if (savedDraft) {
        return { ...defaultData, ...JSON.parse(savedDraft) };
      }
    } catch (e) {
      console.error('Failed to load draft', e);
    }
    return defaultData;
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [isSavingDefault, setIsSavingDefault] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [driveMenuOpen, setDriveMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    const updateScale = () => {
      const screenWidth = window.innerWidth;
      // 794 is the A4 width, 32 is padding.
      if (screenWidth < 826) {
        setPreviewScale(Math.max(0.3, (screenWidth - 32) / 794));
      } else {
        setPreviewScale(1);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('reportDraft', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  }, [data]);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('reportDraft');
      if (!savedDraft) {
        console.log('App: Loading defaults from local storage');
        loadReportData('local').then(loadedData => {
          if (loadedData) {
            if (loadedData.logos) {
              loadedData.logos = loadedData.logos.filter(l => l && !l.startsWith('blob:'));
            }
            if (loadedData.photos) {
              loadedData.photos = loadedData.photos.filter(p => p && !p.startsWith('blob:'));
            }
            setData(prev => ({ ...prev, ...loadedData }));
          }
        });
      }
    } catch (e) {
      console.error('App: Failed to load data:', e);
    }

    console.log('App: useEffect for auth initializing');
    const unsubscribe = initAuth(
      async (user) => {
        console.log('App: Auth success callback fired:', user);
        setUser(user);
      },
      () => {
        console.log('App: Auth failure callback fired');
        setUser(null);
      }
    );
    return () => {
      console.log('App: Unsubscribing from auth');
      unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    console.log('Attempting login...');
    try {
      await googleSignIn();
      toast.success('Successfully logged in');
      console.log('Login successful');
    } catch (err) {
      console.error('Login failed:', err);
      toast.error('Login failed. Please check the console or try in a new tab.');
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      toast.success('Successfully logged out');
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Failed to log out');
    }
  };

  const handleSaveDefault = async () => {
      setIsSavingDefault(true);
      try {
          const { schoolName, logos } = data;
          await saveReportData('local', { schoolName, logos });
          toast.success('Tetapan berjaya disimpan sebagai lalai!');
      } catch (err) {
          console.error('Save default failed:', err);
          toast.error('Gagal menyimpan tetapan');
      } finally {
          setIsSavingDefault(false);
      }
  };

  const handleReset = () => {
    setData({
      themeColor: '#4f46e5',
      secondaryColor: '#f1f5f9',
      schoolName: '',
      logos: [],
      programTitle: '',
      reportType: 'LAPORAN PROGRAM',
      tarikh: '',
      masa: '',
      tempat: '',
      sasaran: '',
      anjuran: '',
      objektif: '',
      aktiviti: '',
      impak: '',
      cadangan: '',
      photos: [],
      preparedByName: '',
      preparedByRole: '',
      preparedDate: new Date().toISOString().split('T')[0],
      showHeader: true,
      showFooter: true,
      showDateStamp: true,
      fontSize: 12,
    });
  };

  const handleExport = async ({ saveToDrive = false, format = 'pdf' }: { saveToDrive?: boolean, format?: 'pdf' | 'png' } = {}) => {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;
    
    let currentAccessToken = await getAccessToken();
    if (saveToDrive && !currentAccessToken) {
      try {
        const result = await googleSignIn();
        if (result) {
          currentAccessToken = result.accessToken;
          setUser(result.user);
        } else {
          toast.error('Log masuk diperlukan untuk menyimpan ke Google Drive.');
          return;
        }
      } catch (err) {
        toast.error('Gagal log masuk ke Google.');
        return;
      }
    }

    if (saveToDrive) setIsSavingToDrive(true);
    else setIsExporting(true);

    const exportPromise = (async () => {
      const canvas = await html2canvas(printArea, {
        scale: format === 'png' ? 2 : 1.5,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', format === 'png' ? undefined : 0.85);
      
      if (format === 'png') {
        if (saveToDrive) {
          if (!currentAccessToken) throw new Error('Not authenticated');
          
          const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
          const metadata = {
            name: 'Laporan_Program.png',
            mimeType: 'image/png',
          };
          
          const form = new FormData();
          form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
          form.append('file', blob);
          
          const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentAccessToken}` },
            body: form,
          });
          
          if (!response.ok) throw new Error('Failed to upload to Drive');
          return 'Imej berjaya disimpan ke Google Drive!';
        } else {
          const link = document.createElement('a');
          link.href = imgData;
          link.download = 'Laporan_Program.png';
          link.click();
          return 'Imej berjaya dimuat turun!';
        }
      } else {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const a4Width = pdf.internal.pageSize.getWidth();
        const a4Height = pdf.internal.pageSize.getHeight();
        
        const ratio = Math.min(a4Width / canvas.width, a4Height / canvas.height);
        const pdfWidth = canvas.width * ratio;
        const pdfHeight = canvas.height * ratio;
        
        const x = (a4Width - pdfWidth) / 2;
        const y = (a4Height - pdfHeight) / 2;
        
        pdf.addImage(imgData, 'JPEG', x, y, pdfWidth, pdfHeight);
        
        if (saveToDrive) {
          if (!currentAccessToken) throw new Error('Not authenticated');
          
          const pdfBlob = pdf.output('blob');
          
          const metadata = {
            name: 'Laporan_Program.pdf',
            mimeType: 'application/pdf',
          };
          
          const form = new FormData();
          form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
          form.append('file', pdfBlob);
          
          const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentAccessToken}` },
            body: form,
          });
          
          if (!response.ok) throw new Error('Failed to upload to Drive');
          return 'PDF berjaya disimpan ke Google Drive!';
        } else {
          pdf.save('Laporan_Program.pdf');
          return 'PDF berjaya dimuat turun!';
        }
      }
    })();

    if (saveToDrive) {
      toast.promise(exportPromise, {
        loading: 'Muat naik ke Google Drive...',
        success: (msg) => msg as string,
        error: 'Terdapat ralat semasa memuat naik ke Google Drive.',
      });
    }

    try {
      const msg = await exportPromise;
      if (!saveToDrive) toast.success(msg as string);
    } catch (error) {
      console.error('Error generating/saving file', error);
      if (!saveToDrive) toast.error('Terdapat ralat semasa menjana/menyimpan fail. Sila cuba lagi.');
    } finally {
      setIsExporting(false);
      setIsSavingToDrive(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f0f2f5] dark:bg-slate-900 overflow-hidden font-sans print:block print:h-auto print:w-full print:bg-white print:overflow-visible">
      <Toaster position="top-right" richColors theme={darkMode ? 'dark' : 'light'} />
      
      {/* Header Form - Hidden when printing */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm no-print">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight hidden sm:block">OPR Generator</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={handleReset}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-red-500 rounded-md transition-all shadow-sm flex items-center justify-center"
              title="Reset Form"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
            <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md transition-all shadow-sm flex items-center justify-center"
              title="Toggle Dark Mode"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
              )}
            </button>
          </div>
          
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center shrink-0"
            title="Preview Report"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          
          <div className="relative shrink-0 hidden md:block">
            <button 
              onClick={() => { setExportMenuOpen(!exportMenuOpen); setDriveMenuOpen(false); setProfileMenuOpen(false); }}
              disabled={isExporting || isSavingToDrive}
              className={`p-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white rounded-lg transition-colors flex items-center justify-center ${isExporting ? 'opacity-70 cursor-not-allowed' : ''} relative z-50`}
              title="Export Options"
            >
              {isExporting ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              )}
            </button>
            <AnimatePresence>
              {exportMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
                  >
                    <button onClick={() => { handleExport({ format: 'pdf' }); setExportMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Export as PDF
                    </button>
                    <button onClick={() => { handleExport({ format: 'png' }); setExportMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      Export as Image
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={handleSaveDefault}
            disabled={isSavingDefault}
            className={`hidden md:flex p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors items-center justify-center shrink-0 ${isSavingDefault ? 'opacity-70 cursor-not-allowed' : ''}`}
            title="Save As Default Template"
          >
            {isSavingDefault ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            )}
          </button>
          {user ? (
            <>
              <div className="relative shrink-0 hidden md:block">
                <button 
                  onClick={() => { setDriveMenuOpen(!driveMenuOpen); setExportMenuOpen(false); setProfileMenuOpen(false); }}
                  disabled={isExporting || isSavingToDrive}
                  className={`p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-700 ${isSavingToDrive ? 'opacity-70 cursor-not-allowed' : ''} relative z-50`}
                  title="Save to Google Drive"
                >
                  {isSavingToDrive ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                      <path d="M7.71 3.5L1.15 15l3.43 6L11.14 9.5L7.71 3.5Z" fill="#FFC107"/>
                      <path d="M9.97 21H23.11L19.68 15H6.54L9.97 21Z" fill="#4CAF50"/>
                      <path d="M22.85 15L16.29 3.5H9.43L16 15H22.85Z" fill="#1976D2"/>
                    </svg>
                  )}
                </button>
                <AnimatePresence>
                  {driveMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDriveMenuOpen(false)}></div>
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
                      >
                        <button onClick={() => { handleExport({ saveToDrive: true, format: 'pdf' }); setDriveMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                          Save PDF to Drive
                        </button>
                        <button onClick={() => { handleExport({ saveToDrive: true, format: 'png' }); setDriveMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          Save Image to Drive
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative shrink-0 hidden md:block">
                <button
                  onClick={() => { setProfileMenuOpen(!profileMenuOpen); setDriveMenuOpen(false); setExportMenuOpen(false); }}
                  className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 relative z-50"
                  title="Profile Menu"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-md object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-md bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-xs text-slate-600 dark:text-slate-200 font-bold uppercase">
                      {(user.displayName || 'U')[0]}
                    </div>
                  )}
                </button>
                <AnimatePresence>
                  {profileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)}></div>
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden w-48 flex flex-col z-50 origin-top-right"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{user.displayName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                        <button onClick={() => { handleLogout(); setProfileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <button 
              onClick={handleLogin}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center shrink-0"
              title="Log In with Google"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c5.05 0 9.14-4.09 9.14-9.14 0-1.25-.26-2.45-.73-3.54l-8.41 8.41V20.94z"/><path d="M3.59 9.87l6.83 6.83L12 15V8.12l-8.41 8.41z"/><path d="M12 3.06v6.82l6.83-6.83C17.55 1.5 14.88.06 12 .06 6.95.06 2.86 4.15 2.86 9.2c0 1.25.26 2.45.73 3.54L12 3.06z"/></svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-print bg-white dark:bg-slate-900 p-4 mx-auto w-full max-w-4xl shadow-sm border-x border-slate-200 dark:border-slate-800">
        <ReportForm data={data} setData={setData} />
      </div>

      {/* Modal and Off-screen Preview Area for PDF Generation */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col no-print"
          >
            <div className="flex justify-between items-center p-4 bg-slate-900 text-white shrink-0 shadow-md">
              <h2 className="text-lg font-bold">Live Preview</h2>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-sm transition-colors"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
              <motion.div 
                initial={{ scale: 0.95, y: 10, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 10, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.4, delay: 0.1 }}
                className="relative"
                style={{ width: `${794 * previewScale}px`, height: `${1123 * previewScale}px` }}
              >
                 <div style={{ 
                   transform: `scale(${previewScale})`, 
                   transformOrigin: 'top left', 
                   width: '794px', 
                   height: '1123px',
                   position: 'absolute',
                   top: 0,
                   left: 0
                 }}>
                    <ReportPreview data={data} id="preview-area" />
                 </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden print:hidden">
        <div className="relative">
          <AnimatePresence>
            {isFabMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFabMenuOpen(false)}></div>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-16 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden w-56 flex flex-col z-50 origin-bottom-right"
                >
                  <button onClick={() => { handleExport({ format: 'pdf' }); setIsFabMenuOpen(false); }} className="w-full text-left px-4 py-4 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Export as PDF
                  </button>
                  <button onClick={() => { handleExport({ format: 'png' }); setIsFabMenuOpen(false); }} className="w-full text-left px-4 py-4 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    Export as Image
                  </button>
                  {user && (
                    <>
                      <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-md object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-sm text-slate-600 dark:text-slate-200 font-bold uppercase shrink-0">
                            {(user.displayName || 'U')[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{user.displayName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button onClick={() => { handleReset(); setIsFabMenuOpen(false); }} className="w-full text-left px-4 py-4 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        Clear All Form Data
                      </button>
                      <button onClick={() => { handleExport({ saveToDrive: true, format: 'pdf' }); setIsFabMenuOpen(false); }} className="w-full text-left px-4 py-4 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        Save PDF to Drive
                      </button>
                      <button onClick={() => { handleExport({ saveToDrive: true, format: 'png' }); setIsFabMenuOpen(false); }} className="w-full text-left px-4 py-4 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        Save Image to Drive
                      </button>
                      <button onClick={() => { handleLogout(); setIsFabMenuOpen(false); }} className="w-full text-left px-4 py-4 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Sign Out
                      </button>
                    </>
                  )}
                  {!user && (
                    <button onClick={() => { handleLogin(); setIsFabMenuOpen(false); }} className="w-full text-left px-4 py-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c5.05 0 9.14-4.09 9.14-9.14 0-1.25-.26-2.45-.73-3.54l-8.41 8.41V20.94z"/><path d="M3.59 9.87l6.83 6.83L12 15V8.12l-8.41 8.41z"/><path d="M12 3.06v6.82l6.83-6.83C17.55 1.5 14.88.06 12 .06 6.95.06 2.86 4.15 2.86 9.2c0 1.25.26 2.45.73 3.54L12 3.06z"/></svg>
                      Log In with Google
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
            className="w-14 h-14 bg-slate-800 dark:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-slate-700 dark:hover:bg-blue-500 transition-colors focus:outline-none focus:ring-4 focus:ring-slate-300 dark:focus:ring-blue-800 relative z-50"
          >
            {isExporting || isSavingToDrive ? (
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isFabMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            )}
          </button>
        </div>
      </div>

      <div className="absolute top-0 left-[-9999px] print:static print:w-full">
        <ReportPreview data={data} id="print-area" />
      </div>
    </div>
  );
}
