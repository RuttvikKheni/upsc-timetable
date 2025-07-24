/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const MAX_SLOTS_PER_PAGE = 3;

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  box: {
    width: 100,
    height: 3,
    backgroundColor: '#573089',
    marginBottom: 35,
  },
  center: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    border: '2px'
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    margin: 'auto',
    paddingBottom: 10,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
    margin: 'auto',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  dateTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    maxWidth: '450px',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginHorizontal: 8,
  },
  labels: {
    fontSize: 12,
    color: '#000',
    marginRight: 8,
    marginLeft: 8,
  },
  badge: {
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  total: {
    borderWidth: 1,
    borderColor: '#3b82f6',
    marginLeft: '40px',
  },
  icon: {
    width: 12,
    height: 12
  },
  start: {
    borderWidth: 1,
    borderColor: '#10b981',
  },
  end: {
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  quoteBox: {
    backgroundColor: '#E5E9F8',
    padding: 24,
    borderRadius: 8,
    marginTop: 30,
    marginBottom: 30,
  },
  quoteText: {
    fontSize: 14,
    marginBottom: 10,
    marginTop: 10,
  },
  caption: {
    fontSize: 12,
    color: '#6b7280',
    margin: 'auto'
  },
  coma: {
    width: 14,
    height: 12
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  featureBox: {
    alignItems: 'center',
    width: '33%',
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 11,
    color: '#6b7280',
  },
  linkfooter: {
    backgroundColor: '#F9FAFB',
    padding: 24,
    marginTop: 24,
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#6b7280',
    marginHorizontal: 'auto',
  },
  footersec: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    color: '#6b7280',
    marginHorizontal: 'auto',
  },
  footerlink: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    color: '#573089',
    textDecoration: 'underline',
    marginHorizontal: 'auto',
  },
  headerWrapper: {
    position: 'relative'
  },
  bar: {
    width: '100%',
    height: '65px',
  },
  footerbar: {
    width: '100%',
    height: '65px',
    transform: 'rotate(180deg)',
  },
  headerText: {
    position: 'absolute',
    top: 13,
    left: 25,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    position: 'absolute',
    top: 30,
    right: 25,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoCover: {
    borderRadius: '8px',
    backgroundColor: '#573089',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#573089'
  },
  logo: {
    width: 48,
    height: 48,
  },
  imgSection: {
    width: 32,
    height: 32,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgesText: {
    fontSize: 8,
    color: '#FFF',
    fontWeight: 'bold',
  },
  contentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  leftColumn: {
    padding: 12,
    backgroundColor: '#F6F5FA',
    borderRadius: '10px',
    flex: 0.7,
    flexDirection: 'column',
    gap: 15,
  },
  rightColumn: {
    flex: 0.3,
    flexDirection: 'column',
    gap: 15,
    paddingRight: 10
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 5,
    paddingLeft: 25,
    color: '#000',
  },
  dateText: {
    fontSize: 14,
    marginBottom: 15,
    paddingLeft: 25,
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHead: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  subject: {
    fontSize: 14,
    fontWeight: 'bold',
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
  badgeOptional: { backgroundColor: '#ddd6fe', color: '#5b21b6' },
  badgeCurrent: { backgroundColor: '#bbf7d0', color: '#15803d' },
  badgeDefault: { backgroundColor: '#f1f5f9', color: '#475569' },
  label: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  value: {
    textAlign: 'justify',
    fontSize: 11,
    marginBottom: 4,
    marginTop: 3,
  },
  widget: {
    backgroundColor: '#EFECF3',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  widgetTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  widgetText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 1.4,
    textAlign: 'justify'
  },
  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 60,
    overflow: 'hidden',
  },
  rightImg: {
    width: 30,
    height: 34,
    marginBottom: 8,
    objectFit: 'cover',
  }
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

  const splitActivities = (activities: any) => {
    if (!Array.isArray(activities)) return [];
    return activities.reduce((acc: any, curr: any, index: number) => {
      if (index % MAX_SLOTS_PER_PAGE === 0) {
        acc.push(activities.slice(index, index + MAX_SLOTS_PER_PAGE));
      }
      return acc;
    }, []);
  };

  const days = uniqueDates.map((date: any, index: number) => ({
    date,
    dayCount: index + 1,
    activities: entriesByDate[date],
  }))
    // Per Day Per Page Slot Split
    .reduce((acc: any, curr: any) => {
      const newActivities = splitActivities(curr.activities);

      newActivities.forEach((chunk: any) => {
        acc.push({
          date: curr.day,
          dayCount: curr.dayCount,
          activities: chunk
        });
      });

      return acc;
    }, []);

  const daysChunks = [];
  for (let i = 0; i < days.length; i += 2) {
    daysChunks.push(days.slice(i, i + 2));
  }

  const getBadgeStyle = (main: string) => {
    if ((main || '').toLowerCase().includes('optional')) return [styles.badge, styles.badgeOptional];
    if ((main || '').toLowerCase().includes('current')) return [styles.badge, styles.badgeCurrent];
    return [styles.badge, styles.badgeDefault];
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.center}>
          <View style={styles.logoCover}>
            <Image src="/logo.jpg" style={styles.logo} />
          </View>
          <View>
            <Text style={styles.title}>Proxy Gyan</Text>
            <Text style={styles.subtitle}>UPSC Preparation Platform</Text>
          </View>
          <Text style={styles.sectionTitle}>Study Timetable</Text>
          <View style={styles.box} />
          <View style={styles.dateTags}>
            <View style={[styles.tag, styles.total]}>
              <Image src="/calendar.png" style={styles.icon} />
              <Text style={styles.labels}> Total Days</Text>
              <View style={[styles.badges, { backgroundColor: '#2863EB' }]}>
                <Text style={styles.badgesText}>365</Text>
              </View>
            </View>
            <View style={[styles.tag, styles.start]}>
              <Image src="/play.png" style={styles.icon} />
              <Text style={styles.labels}> Start Date</Text>
              <View style={[styles.badges, { backgroundColor: '#3DB980' }]}>
                <Text style={styles.badgesText}>Jan 1, 2024</Text>
              </View>
            </View>
            <View style={[styles.tag, styles.end]}>
              <Image src="/flag.png" style={styles.icon} />
              <Text style={styles.labels}> End Date</Text>
              <View style={[styles.badges, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.badgesText}>Dec 31, 2024</Text>
              </View>
            </View>
          </View>
          <View style={styles.quoteBox}>
            <Image src="/coma.png" style={[styles.coma, styles.caption]} />
            <Text style={styles.quoteText}>
              &quot;Success is the sum of small efforts repeated day in and day out.&quot;
            </Text>
            <Text style={styles.caption}>Your journey to UPSC success starts here</Text>
          </View>

          <View style={styles.features}>
            <View style={styles.featureBox}>
              <Image src="/time.png" style={styles.imgSection} />
              <Text style={styles.featureTitle}>Time Management</Text>
              <Text style={styles.featureDesc}>Optimized schedule</Text>
            </View>
            <View style={styles.featureBox}>
              <Image src="/goal.png" style={styles.imgSection} />
              <Text style={styles.featureTitle}>Goal Oriented</Text>
              <Text style={styles.featureDesc}>Strategic approach</Text>
            </View>
            <View style={styles.featureBox}>
              <Image src="/progress.png" style={styles.imgSection} />
              <Text style={styles.featureTitle}>Progress Track</Text>
              <Text style={styles.featureDesc}>Monitor growth</Text>
            </View>
          </View>

          <View style={styles.linkfooter}>
            <Text style={styles.footer}>
              <Image src="/clock.png" style={{ width: '12px', height: '12px', marginTop: '10px' }} />  This timetable is designed to maximize your preparation efficiency{'\n'}
            </Text>
            <Text style={styles.footersec}>
              Generated on: January 2024 | Version 1.0
            </Text>
            <Text style={styles.footerlink}>
              https::/youtube.com
            </Text>
          </View>
        </View>
      </Page>
      {days.map((day: any, index: number) => (
        <Page key={day.dayCount} size="A4" style={styles.page}>
          <View style={styles.headerWrapper}>
            <Image src="/bar.png" style={styles.bar} />
            <Text style={styles.headerText}>Daily Time Table</Text>
          </View>
          <Text style={styles.dayTitle}>Day {day.dayCount}</Text>
          <Text style={styles.dateText}>{day.date}</Text>
          <View style={styles.contentRow}>
            <View style={styles.leftColumn}>
              {day.activities.map((activity: any, idx: number) => (
                <View key={idx} style={styles.card}>
                  <View style={styles.cardHead}>
                    <Text style={styles.subject}>{activity.SUBJECT || 'Untitled'}</Text>
                    <Text style={getBadgeStyle(activity['MAIN SUBJECT'])}>
                      {activity['MAIN SUBJECT'] || 'General'}
                    </Text>
                  </View>
                  {activity.HOURS &&
                    <>
                      <Text style={styles.label}>Hours</Text>
                      <Text style={styles.value}>{activity.HOURS} hours</Text>
                    </>
                  }
                  <Text style={styles.label}>Topic</Text>
                  <Text style={styles.value}>{activity.TOPIC || 'N/A'}</Text>
                  <Text style={styles.label}>Subtopics</Text>
                  <Text style={styles.value}>{activity.SUBTOPICS || 'N/A'}</Text>
                  <Text style={styles.label}>Sources</Text>
                  <Text style={styles.value}>{activity.RECOMMENDED_SOURCES || 'N/A'}</Text>
                </View>
              ))}
            </View>

            <View style={styles.rightColumn}>
              <View style={styles.widget}>
                <Image src="/health.png" style={styles.rightImg} />
                <Text style={styles.widgetTitle}>Health Tips</Text>
                <Text style={styles.widgetText}>Drink enough water, eat fresh fruits, and get 7-8 hours of sleep daily.</Text>
              </View>
              <View style={styles.widget}>
                <Image src="/quote.png" style={styles.rightImg} />
                <Text style={styles.widgetTitle}>Motivational Quote</Text>
                <Text style={styles.widgetText}>Great achievements are possible when you stay consistent, focused, and never give up.</Text>
              </View>
              <View style={styles.widget}>
                <Image src="/bulb.png" style={styles.rightImg} />
                <Text style={styles.widgetTitle}>AIR Tips</Text>
                <Text style={styles.widgetText}>Practice previous year questions regularly and revise weak topics every weekend without fail.</Text>
              </View>
            </View>
          </View>
          <View style={styles.footerWrapper}>
            <Image src="/bar.png" style={styles.footerbar} />
            <Text style={styles.footerText}>{(index + 1) <= 9 && "0"}{index + 1}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default TimetablePDF;
