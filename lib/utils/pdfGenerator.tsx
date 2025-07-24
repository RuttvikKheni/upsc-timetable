import React from 'react';
import { pdf } from '@react-pdf/renderer';
import TimetablePDF from '../../components/pdf/TimetablePDF';

export const generateAndDownloadPDF = async (timetableData: any[], role:number = 0) => {
  try {
    // Create the PDF document
    
    const doc = <TimetablePDF timetableData={timetableData} />;
    
    // Generate PDF blob
    const blob = await pdf(doc).toBlob();
    
    // Create download link or open in new tab
    const url = URL.createObjectURL(blob);
    
    if(role === 0){
      // Download the PDF
      const link = document.createElement('a');
      link.href = url;
      link.download = `upsc-timetable-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Open PDF in new tab - more reliable method
      const link = document.createElement('a');
      link.href = url;

      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};

