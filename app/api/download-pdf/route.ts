import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  let browser;
  try {
    const { timetableData } = await request.json();

    if (!timetableData || !timetableData.length) {
      return NextResponse.json(
        { error: 'No timetable data provided' },
        { status: 400 }
      );
    }


    // Group data by date
    const entriesByDate = timetableData.reduce((acc: any, entry: any) => {
      if (!acc[entry.DATE]) {
        acc[entry.DATE] = [];
      }
      acc[entry.DATE].push(entry);
      return acc;
    }, {});

    // Fixed date parsing function to handle DD-MM-YYYY format
    const parseDate = (dateStr: string) => {
      try {
        // Handle DD-MM-YYYY format
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const year = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
        // Fallback to default parsing
        return new Date(dateStr);
      } catch (error) {
        console.error('Date parsing error for:', dateStr, error);
        return new Date(); // Return current date as fallback
      }
    };

    const uniqueDates = Object.keys(entriesByDate).sort((a, b) => {
      const dateA = parseDate(a);
      const dateB = parseDate(b);
      return dateA.getTime() - dateB.getTime();
    });

    const days = uniqueDates.map((date: any, index: number) => ({
      date,
      dayCount: index + 1,
      activities: entriesByDate[date],
    }));

    const weeks = days.reduce((acc: any, day: any) => {
      const week = Math.floor((day.dayCount - 1) / 7) + 1;
      if (!acc[week]) acc[week] = [];
      acc[week].push(day);
      return acc;
    }, {});

    (`Organized into ${Object.keys(weeks).length} weeks`); 

    // Optimized HTML content for PDF with better performance
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>UPSC Timetable</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 15px;
              background: white;
              color: #333;
              font-size: 12px;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 15px;
            }
            .header h1 {
              color: #1f2937;
              margin: 0;
              font-size: 24px;
            }
            .header p {
              color: #6b7280;
              margin: 8px 0 0 0;
              font-size: 12px;
            }
            .week-section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .week-title {
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
              padding: 8px 0;
              border-bottom: 1px solid #d1d5db;
            }
            .days-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
              gap: 15px;
            }
            .day-card {
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 12px;
              background: #f9fafb;
              page-break-inside: avoid;
            }
            .day-header {
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .public-holiday {
              font-weight: bold;
              color: red;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .activity {
              margin-bottom: 12px;
              padding: 10px;
              background: white;
              border-radius: 4px;
              border-left: 3px solid #3b82f6;
            }
            .activity:last-child {
              margin-bottom: 0;
            }
            .activity-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 6px;
              flex-wrap: wrap;
            }
            .subject {
              font-weight: 600;
              color: #1f2937;
              font-size: 13px;
            }
            .main-subject {
              font-size: 10px;
              font-weight: 500;
              padding: 2px 6px;
              border-radius: 10px;
              background: #e5e7eb;
              color: #374151;
              white-space: nowrap;
              page-break-inside: avoid
            }
            .main-subject.optional { background: #e0e7ff; color: #3730a3; }
            .main-subject.current-affairs { background: #dcfce7; color: #166534; }
            .main-subject.csat { background: #fed7aa; color: #9a3412; }
            .main-subject.revision { background: #f3e8ff; color: #7c3aed; }
            .main-subject.history { background: #fef3c7; color: #92400e; }
            .main-subject.geography { background: #d1fae5; color: #065f46; }
            .main-subject.polity-and-governance { background: #dbeafe; color: #1e40af; }
            .main-subject.economy { background: #fce7f3; color: #be185d; }
            .activity-details {
              font-size: 11px;
              color: #4b5563;
            }
            .detail-row {
              margin-bottom: 3px;
              word-wrap: break-word;
            }
            .detail-label {
              font-weight: 500;
              color: #6b7280;
              display: inline-block;
              width: 60px;
              vertical-align: top;
            }
            .detail-content {
              display: inline-block;
              width: calc(100% - 65px);
              vertical-align: top;
            }
            .hours {
              font-weight: 600;
              color: #059669;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .week-section { page-break-before: auto; }
              .day-card { page-break-inside: avoid; }
              .main-subject { page-break-inside: auto; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>UPSC Preparation Timetable</h1>
            <p>Total Days: ${uniqueDates.length} | Start Date: ${uniqueDates[0] || 'N/A'} | Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          ${Object.entries(weeks).map(([weekKey, weekData]: [string, any]) => `
              <div class="week-title">Week ${weekKey}</div>
              <div class="days-grid">
                ${weekData.map((day: any) => `
                  <div class="day-card">
                    <div class="day-header">Day ${day.dayCount} - ${day.date}</div>
                    <div class="public-holiday">${day.activities.length && (day.activities[0]?.isHoliday ?? "")}</div>
                    ${day.activities.map((activity: any) => {
                      const mainSubjectClass = (activity['MAIN SUBJECT'] || '').toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
                      return `
                        <div class="activity">
                          <div class="activity-header">
                            <span class="subject">${(activity.SUBJECT || 'N/A').substring(0, 50)}${(activity.SUBJECT || '').length > 50 ? '...' : ''}</span>
                            <span class="main-subject ${mainSubjectClass}">${activity['MAIN SUBJECT'] || 'N/A'}</span>
                          </div>
                          <div class="activity-details">
                            <div class="detail-row">
                              <span class="detail-label">Topic:</span>
                              <span class="detail-content">${(activity.TOPIC || 'N/A').substring(0, 100)}${(activity.TOPIC || '').length > 100 ? '...' : ''}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Subtopic:</span>
                              <span class="detail-content">${(activity.SUBTOPICS || 'N/A').substring(0, 100)}${(activity.SUBTOPICS || '').length > 100 ? '...' : ''}</span>
                            </div>
                            ${activity.HOURS ? `
                              <div class="detail-row">
                                <span class="detail-label">Hours:</span>
                                <span class="detail-content hours">${activity.HOURS} hours</span>
                              </div>
                            ` : ''}
                            <div class="detail-row">
                              <span class="detail-label">Sources:</span>
                              <span class="detail-content">${(activity.RECOMMENDED_SOURCES || 'N/A').substring(0, 150)}${(activity.RECOMMENDED_SOURCES || '').length > 150 ? '...' : ''}</span>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `).join('')}
              </div>
          `).join('')}
        </body>
      </html>
    `;

    ('Starting Puppeteer browser...');

    // Launch puppeteer with optimized settings for large documents
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--memory-pressure-off'
      ],
      timeout: 60000 // 60 seconds for browser launch
    });

    const page = await browser.newPage();
    
    // Optimize page settings for large content
    await page.setViewport({ width: 1200, height: 800 });
    await page.setDefaultTimeout(90000); // 90 seconds
    
    ('Setting page content...');
    
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded', // Changed from networkidle0 for better performance
      timeout: 60000 
    });
    
    ('Generating PDF...');
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15px',
        right: '15px',
        bottom: '15px',
        left: '15px'
      },
      timeout: 90000, // 90 seconds for PDF generation
      preferCSSPageSize: true
    });

    await browser.close();
    browser = null;

    (`PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    // Return PDF as response
    return new Response(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="upsc-timetable-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    
    // Ensure browser is closed even on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 