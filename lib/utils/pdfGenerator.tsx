import React from 'react';
import { pdf } from '@react-pdf/renderer';
import TimetablePDF from '../../components/pdf/TimetablePDF';

export const generateAndDownloadPDF = async (timetableData: any[]) => {
  try {
    // Create the PDF document
    const doc = <TimetablePDF timetableData={timetableData} />;
    
    // Generate PDF blob
    const blob = await pdf(doc).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `upsc-timetable-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};
