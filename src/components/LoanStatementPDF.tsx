import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { LoanDetail, LoanRepayment } from '@/types';
import { format } from 'date-fns';
import logo from '../assets/logo.png';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  logo: {
    width: 120,
    height: 'auto',
  },
  titleContainer: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    textTransform: 'uppercase',
  },
  reference: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  
  // Grid layout for info sections
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 20,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
    paddingBottom: 4,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#6B7280',
    width: '40%',
  },
  value: {
    fontFamily: 'Helvetica-Bold',
    width: '60%',
    textAlign: 'right',
  },

  // Financial Summary Box
  summaryBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    padding: 12,
    marginBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryBlock: {
    width: '33.33%',
    marginBottom: 8,
    paddingRight: 8,
  },
  summaryLabel: {
    fontSize: 8,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  totalDueBlock: {
    width: '33.33%',
    marginBottom: 8,
    paddingRight: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#D1D5DB',
    paddingLeft: 12,
  },
  balanceBlock: {
    width: '33.33%',
    marginBottom: 8,
    paddingRight: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#D1D5DB',
    paddingLeft: 12,
  },

  // Table
  tableContainer: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    padding: 8,
    alignItems: 'center',
  },
  tableHeaderCell: {
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 8,
    alignItems: 'center',
  },
  tableRowAlternating: {
    backgroundColor: '#F9FAFB',
  },
  
  // Table Columns
  colDate: { width: '25%' },
  colRef: { width: '35%' },
  colChannel: { width: '15%' },
  colAmount: { width: '25%', textAlign: 'right' },

  tableCell: {
    fontSize: 9,
    color: '#374151',
  },

  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9CA3AF',
  },

  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    alignSelf: 'flex-start',
  },
});

interface LoanStatementPDFProps {
  summary: LoanDetail;
  repayments: LoanRepayment[];
}

const LoanStatementPDF: React.FC<LoanStatementPDFProps> = ({ summary, repayments }) => {
  const formatMoney = (amount?: number | null) => 
    amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00';

  const formatDateVal = (dateString?: string) => 
    dateString ? format(new Date(dateString), 'MMM dd, yyyy') : '-';

  const totalRepaidOnStatement = repayments.reduce((sum, r) => sum + (r.amountPaid || r.amount || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <Image src={logo} style={styles.logo} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Loan Statement</Text>
            <Text style={styles.reference}>Ref: {summary?.loanReference || 'N/A'}</Text>
            <Text style={{ fontSize: 9, marginTop: 4, color: '#6B7280' }}>
              Generated: {format(new Date(), 'PPP p')}
            </Text>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.gridContainer}>
          {/* Customer Details */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Borrower Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{summary?.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{summary?.customerPhoneNumber || '-'}</Text>
            </View>
          </View>

          {/* Loan Details */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Loan Details</Text>
             <View style={styles.infoRow}>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.value}>{summary?.loanStatus || summary?.status || 'Active'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date Disbursed</Text>
              <Text style={styles.value}>{formatDateVal(summary?.disbursementDate || summary?.dateCreated)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.value}>{formatDateVal(summary?.dueDate)}</Text>
            </View>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Principal Amount</Text>
            <Text style={styles.summaryValue}>{formatMoney(summary?.principalAmount)}</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Interest</Text>
            <Text style={styles.summaryValue}>{formatMoney(summary?.interestAmount)}</Text>
          </View>
          <View style={styles.totalDueBlock}>
            <Text style={styles.summaryLabel}>Total Loan Amount</Text>
            <Text style={styles.summaryValue}>{formatMoney(summary?.totalAmount ?? summary?.totalLoanAmount)}</Text>
          </View>
          
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Total Repaid</Text>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>
              {formatMoney(summary?.totalPaid ?? summary?.totalRepaid)}
            </Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Arrears</Text>
            <Text style={[styles.summaryValue, { color: '#DC2626' }]}>
              {formatMoney(summary?.arrears ?? summary?.arrearsAmount)}
            </Text>
          </View>
          <View style={styles.balanceBlock}>
            <Text style={styles.summaryLabel}>Outstanding Balance</Text>
            <Text style={[styles.summaryValue, { fontSize: 14, color: '#111827' }]}>
              {formatMoney(summary?.outstandingBalance)}
            </Text>
          </View>
        </View>

        {/* Repayments Table */}
        <View style={styles.tableContainer}>
          <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>Loan Repayments</Text>
          
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>Payment Date</Text>
            <Text style={[styles.tableHeaderCell, styles.colRef]}>Reference</Text>
            <Text style={[styles.tableHeaderCell, styles.colChannel]}>Channel</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>

          {/* Rows */}
          {repayments.length > 0 ? (
            repayments.map((repayment, index) => (
              <View 
                key={index} 
                style={[
                  styles.tableRow, 
                  index % 2 === 1 ? styles.tableRowAlternating : {}
                ]}
              >
                <Text style={[styles.tableCell, styles.colDate]}>
                  {repayment.paymentDate ? format(new Date(repayment.paymentDate), 'MMM dd, yyyy HH:mm') : '-'}
                </Text>
                <Text style={[styles.tableCell, styles.colRef]}>
                  {repayment.mpesaReference || repayment.transactionReference || '-'}
                </Text>
                <Text style={[styles.tableCell, styles.colChannel]}>
                  {repayment.paymentChannel || repayment.paymentMethod || 'M-PESA'}
                </Text>
                <Text style={[styles.tableCell, styles.colAmount]}>
                  {formatMoney(repayment.amountPaid || repayment.amount)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '100%', textAlign: 'center', padding: 20, color: '#9CA3AF' }]}>
                No repayment records found.
              </Text>
            </View>
          )}

          {/* Table Footer / Total */}
          {repayments.length > 0 && (
            <View style={[styles.tableRow, { borderTopWidth: 2, borderTopColor: '#374151', borderBottomWidth: 0 }]}>
              <Text style={[styles.tableCell, styles.colDate, { fontFamily: 'Helvetica-Bold' }]}>Total</Text>
              <Text style={[styles.tableCell, styles.colRef]}></Text>
              <Text style={[styles.tableCell, styles.colChannel]}></Text>
              <Text style={[styles.tableCell, styles.colAmount, { fontFamily: 'Helvetica-Bold' }]}>
                {formatMoney(totalRepaidOnStatement)}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Kassolend Credit System</Text>
          <Text>Page 1 of 1</Text>
        </View>

      </Page>
    </Document>
  );
};

export default LoanStatementPDF;
