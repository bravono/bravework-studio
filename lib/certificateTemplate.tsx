import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface CertificateTemplateProps {
  name: string;
  course: string;
  date: string;
  issuer: string;
}

// Create styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  border: {
    border: '10px solid #333333',
    padding: 40,
  },
  title: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 20,
    color: '#0056b3',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333333',
    fontWeight: 'bold',
  },
  course: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
    color: '#007bff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 50,
  },
  footerItem: {
    textAlign: 'center',
    width: '40%',
  },
  footerText: {
    fontSize: 12,
    borderBottom: '1px solid #333333',
    paddingBottom: 5,
    marginBottom: 5,
  },
  footerLabel: {
    fontSize: 10,
    color: '#666666',
  },
});

const CertificateDocument = ({ name, course, date, issuer }: CertificateTemplateProps): JSX.Element => {
  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.border}>
          <Text style={styles.title}>CERTIFICATE OF COMPLETION</Text>
          <Text style={styles.subtitle}>This certifies that</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>has successfully completed the course</Text>
          <Text style={styles.course}>{course}</Text>
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Text style={styles.footerText}>{date}</Text>
              <Text style={styles.footerLabel}>Date</Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={styles.footerText}>{issuer}</Text>
              <Text style={styles.footerLabel}>Issuer</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default CertificateDocument;
