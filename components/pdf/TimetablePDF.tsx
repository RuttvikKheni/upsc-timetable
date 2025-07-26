/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
  Font,
} from "@react-pdf/renderer";
import { stylesData } from "./Style";

const MAX_SLOTS_PER_PAGE = 3;

const styles = StyleSheet.create(stylesData as any);

interface TimetablePDFProps {
  timetableData: any[];
}

const TimetablePDF: React.FC<TimetablePDFProps> = ({ timetableData }) => {

  Font.register({
    family: 'Poppins', fonts: [
      { src: './fonts/Poppins-Regular.ttf', fontStyle: 'normal', fontWeight: 'normal' },
      { src: './fonts/Poppins-Bold.ttf', fontStyle: 'normal', fontWeight: 'bold' },
      { src: './fonts/Poppins-Italic.ttf', fontStyle: 'italic', fontWeight: 'normal' },
      { src: './fonts/Poppins-BoldItalic.ttf', fontStyle: 'italic', fontWeight: 'bold' },
      { src: './fonts/Poppins-Light.ttf', fontStyle: 'normal', fontWeight: 'light' },
      { src: './fonts/Poppins-LightItalic.ttf', fontStyle: 'italic', fontWeight: 'light' },
      { src: './fonts/Poppins-Medium.ttf', fontStyle: 'normal', fontWeight: 500 },
      { src: './fonts/Poppins-MediumItalic.ttf', fontStyle: 'italic', fontWeight: 500 },
      { src: './fonts/Poppins-SemiBold.ttf', fontStyle: 'normal', fontWeight: 600 },
      { src: './fonts/Poppins-SemiBoldItalic.ttf', fontStyle: 'italic', fontWeight: 600 },
      { src: './fonts/Poppins-ExtraBold.ttf', fontStyle: 'normal', fontWeight: 800 },
      { src: './fonts/Poppins-ExtraBoldItalic.ttf', fontStyle: 'italic', fontWeight: 800 },
      { src: './fonts/Poppins-Black.ttf', fontStyle: 'normal', fontWeight: 900 },
      { src: './fonts/Poppins-BlackItalic.ttf', fontStyle: 'italic', fontWeight: 900 },
    ]
  });

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
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
      return new Date(dateStr);
    } catch (error) {
      console.error("Date parsing error for:", dateStr, error);
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

  const days = uniqueDates
    .map((date: any, index: number) => ({
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
          activities: chunk,
        });
      });

      return acc;
    }, []);
  console.log("days=========================", days);
  const daysChunks = [];
  for (let i = 0; i < days.length; i += 2) {
    daysChunks.push(days.slice(i, i + 2));
  }

  const getBadgeStyle = (main: string) => {
    if ((main || "").toLowerCase().includes("optional"))
      return [styles.badge, styles.badgeOptional];
    if ((main || "").toLowerCase().includes("current"))
      return [styles.badge, styles.badgeCurrent];
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
              <Text style={styles.labels}> Total Days </Text>
              <View style={[styles.badges, { backgroundColor: "#2863EB" }]}>
                <Text style={styles.badgesText}>{days.length}</Text>
              </View>
            </View>
            <View style={[styles.tag, styles.start]}>
              <Image src="/play.png" style={styles.icon} />
              <Text style={styles.labels}> Start Date</Text>
              <View style={[styles.badges, { backgroundColor: "#3DB980" }]}>
                <Text style={styles.badgesText}>{uniqueDates[0]}</Text>
              </View>
            </View>
            <View style={[styles.tag, styles.end]}>
              <Image src="/flag.png" style={styles.icon} />
              <Text style={styles.labels}> End Date</Text>
              <View style={[styles.badges, { backgroundColor: "#F59E0B" }]}>
                <Text style={styles.badgesText}>
                  {uniqueDates[uniqueDates.length - 1]}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.quoteBox}>
            <Image src="/coma.png" style={[styles.coma, styles.caption]} />
            <Text style={styles.quoteText}>
              &quot;Success is the sum of small efforts repeated day in and day out.&quot;
            </Text>
            <Text style={styles.caption}>
              Your journey to UPSC success starts here
            </Text>
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
              <Image
                src="/clock.png"
                style={{ width: "12px", height: "12px", marginTop: "10px" }}
              />{" "}
              This timetable is designed to maximize your preparation efficiency
              {"\n"}
            </Text>
            <Text style={styles.footersec}>
              Generated on:{" "}
              {new Date().toLocaleString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}{" "}
              | Version 1.0
            </Text>
            <Text style={styles.footerlink}>
              <Link href="www.proxygyan.com">
                www.proxygyan.com
              </Link>
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
                    <Text style={styles.subject}>
                      {activity.SUBJECT || "Untitled"}
                    </Text>
                    <Text style={getBadgeStyle(activity["MAIN SUBJECT"])}>
                      {activity["MAIN SUBJECT"] || "General"}
                    </Text>
                  </View>
                  <Text style={styles.publicHoliday}>{day.activities[0]?.isHoliday ?? ""}</Text>
                  {activity.HOURS && (
                    <>
                      <Text style={styles.label}>Hours</Text>
                      <Text style={styles.value}>{activity.HOURS} hours</Text>
                    </>
                  )}
                  <Text style={styles.label}>Topic</Text>
                  <Text style={styles.value}>{activity.TOPIC || "N/A"}</Text>
                  <Text style={styles.label}>Subtopics</Text>
                  <Text style={styles.value}>
                    {activity.SUBTOPICS || "N/A"}
                  </Text>
                  <Text style={styles.label}>Sources</Text>
                  <Text style={styles.value}>
                    {activity.RECOMMENDED_SOURCES || "N/A"}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.rightColumn}>
              <View style={styles.widget}>
                <Image src="/health.png" style={styles.rightImg} />
                <Text style={styles.widgetTitle}>Health Tips</Text>
                <Text style={styles.widgetText}>
                  Drink enough water, eat fresh fruits, and get 7-8 hours of
                  sleep daily.
                </Text>
              </View>
              <View style={styles.widget}>
                <Image src="/quote.png" style={styles.rightImg} />
                <Text style={styles.widgetTitle}>Motivational Quote</Text>
                <Text style={styles.widgetText}>
                  Great achievements are possible when you stay consistent,
                  focused, and never give up.
                </Text>
              </View>
              <View style={styles.widget}>
                <Image src="/bulb.png" style={styles.rightImg} />
                <Text style={styles.widgetTitle}>AIR Tips</Text>
                <Text style={styles.widgetText}>
                  Practice previous year questions regularly and revise weak
                  topics every weekend without fail.
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.footerWrapper}>
            <Image src="/bar.png" style={styles.footerbar} />
            <Text style={styles.footerText}>
              {index + 1 <= 9 && "0"}
              {index + 1}
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default TimetablePDF;
