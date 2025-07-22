import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Modern, attractive PDF design with 2 days per page
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 25,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: 'normal',
  },
  pageInfo: {
    textAlign: 'center',
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  pageInfoText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  daysContainer: {
    flexDirection: 'column',
    gap: 25,
  },
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayHeader: {
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 10,
    textAlign: 'center',
  },
  publicHoliday: {
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#fef2f2',
    padding: 6,
    borderRadius: 4,
    textAlign: 'center',
  },
  activity: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fafbff',
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#8b5cf6',
    borderWidth: 1,
    borderColor: '#e0e7ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  subject: {
    fontWeight: 'bold',
    color: '#1e40af',
    fontSize: 14,
    flex: 1,
  },
  mainSubject: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    color: '#475569',
    textAlign: 'center',
  },
  mainSubjectOptional: {
    backgroundColor: '#ddd6fe',
    color: '#5b21b6',
  },
  mainSubjectCurrentAffairs: {
    backgroundColor: '#bbf7d0',
    color: '#15803d',
  },
  mainSubjectCsat: {
    backgroundColor: '#fed7aa',
    color: '#c2410c',
  },
  mainSubjectRevision: {
    backgroundColor: '#e9d5ff',
    color: '#7c2d12',
  },
  activityDetails: {
    fontSize: 11,
    color: '#475569',
    marginTop: 8,
  },
  detailRow: {
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#64748b',
    width: 70,
    fontSize: 10,
  },
  detailContent: {
    flex: 1,
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.4,
  },
  hours: {
    fontWeight: 'bold',
    color: '#059669',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

interface TimetablePDFProps {
  timetableData: any[];
}

const TimetablePDF: React.FC<TimetablePDFProps> = ({ timetableData }) => {
  // Group data by date (same logic as backend)
  const entriesByDate = timetableData.reduce((acc: any, entry: any) => {
    if (!acc[entry.DATE]) {
      acc[entry.DATE] = [];
    }
    acc[entry.DATE].push(entry);
    return acc;
  }, {});

  // Parse date function (same as backend)
  const parseDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
      return new Date(dateStr);
    } catch (error) {
      console.error('Date parsing error for:', dateStr, error);
      return new Date();
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

  const getMainSubjectStyle = (mainSubject: string) => {
    const subject = (mainSubject || '').toLowerCase();
    if (subject.includes('optional')) return styles.mainSubjectOptional;
    if (subject.includes('current affairs')) return styles.mainSubjectCurrentAffairs;
    if (subject.includes('csat')) return styles.mainSubjectCsat;
    if (subject.includes('revision')) return styles.mainSubjectRevision;
    return styles.mainSubject;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Split days into chunks of 2 for modern layout
  const daysChunks = [];
  for (let i = 0; i < days.length; i += 2) {
    daysChunks.push(days.slice(i, i + 2));
  }

  return (
    <Document>
      {daysChunks.map((chunk, chunkIndex) => (
        <Page key={chunkIndex} size="A4" style={styles.page}>
          {/* Header - only on first page */}
          {chunkIndex === 0 && (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>UPSC Preparation Timetable</Text>
              <Text style={styles.headerSubtitle}>
                Total Days: {uniqueDates.length} | Start Date: {uniqueDates[0] || 'N/A'} | Generated on: {new Date().toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Page Info */}
          <View style={styles.pageInfo}>
            <Text style={styles.pageInfoText}>
              Days {chunk[0]?.dayCount}{chunk[1] ? ` - ${chunk[1].dayCount}` : ''} | Page {chunkIndex + 1} of {daysChunks.length}
            </Text>
          </View>

          {/* Days Container */}
          <View style={styles.daysContainer}>
            {chunk.map((day: any) => (
              <View key={day.dayCount} style={styles.dayCard}>
                <Text style={styles.dayHeader}>Day {day.dayCount} - {day.date}</Text>
                
                {/* Public Holiday */}
                {day.activities.length && day.activities[0]?.isHoliday && (
                  <Text style={styles.publicHoliday}>{day.activities[0].isHoliday}</Text>
                )}

                {/* Activities */}
                {day.activities.map((activity: any, actIndex: number) => (
                  <View key={actIndex} style={styles.activity}>
                    {/* Activity Header */}
                    <View style={styles.activityHeader}>
                      <Text style={styles.subject}>
                        {truncateText(activity.SUBJECT, 45)}
                      </Text>
                      <Text style={[styles.mainSubject, getMainSubjectStyle(activity['MAIN SUBJECT'])]}>
                        {activity['MAIN SUBJECT'] || 'N/A'}
                      </Text>
                    </View>

                    {/* Activity Details */}
                    <View style={styles.activityDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Topic:</Text>
                        <Text style={styles.detailContent}>
                          {truncateText(activity.TOPIC, 80)}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Subtopic:</Text>
                        <Text style={styles.detailContent}>
                          {truncateText(activity.SUBTOPICS, 80)}
                        </Text>
                      </View>

                      {activity.HOURS && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Hours:</Text>
                          <Text style={[styles.detailContent, styles.hours]}>
                            {activity.HOURS} hours
                          </Text>
                        </View>
                      )}

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Sources:</Text>
                        <Text style={styles.detailContent}>
                          {truncateText(activity.RECOMMENDED_SOURCES, 120)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default TimetablePDF;
