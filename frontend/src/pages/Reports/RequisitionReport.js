import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField
} from '@mui/material';
import {
  Download,
  Description,
  Error as ErrorIcon,
  Business,
  Category,
  CalendarToday
} from '@mui/icons-material';

const RequisitionReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [startDate, setStartDate] = useState(() => new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedDept, startDate, endDate]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/departments');
      setDepartments(res.data);
    } catch (err) {
      setDepartments([]);
    }
  };

  const fetchData = async () => {
    if (!startDate || !endDate) {
      setData([]);
      setError('กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/reports/requisition-by-department?startDate=${startDate}&endDate=${endDate}`);
      let apiData = response.data;
      let filtered = apiData;
      if (selectedDept !== 'all') {
        filtered = apiData.filter(d => d.department_id === selectedDept || d.department === departments.find(dep => dep.department_id === selectedDept)?.department_name);
      }
      setData(filtered);
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    try {
      setExporting(true);
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('รายการการเบิกวัสดุตามหน่วยงาน', 14, 20);
      
      // Add generated date
      doc.setFontSize(10);
      doc.text(`วันที่สร้างรายงาน: ${new Date().toLocaleDateString('th-TH')}`, 14, 30);
      
      // Prepare table data
     const tableData = [];
        data.forEach((dept, deptIdx) => {
          dept.materials.forEach((mat, matIdx) => {
            tableData.push([
              deptIdx * dept.materials.length + matIdx + 1,
              dept.department,
              mat.material,
              mat.total_quantity?.toLocaleString() || '0',
              mat.totalIssued?.toLocaleString() || '0'
            ]);
          });
        });
      
      // Add table
      doc.autoTable({
        head: [['#', 'หน่วยงาน', 'วัสดุ', 'จำนวน', 'จำนวนจ่าย']],
        body: tableData,
        startY: 40,
        styles: {
          font: 'helvetica',
          fontSize: 10,
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      });
      
      doc.save(`requisition_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
    } finally {
      setExporting(false);
    }
  };

  const retry = () => {
    fetchData();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="h6">กำลังโหลดข้อมูล...</Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card sx={{ border: '1px solid', borderColor: 'error.light' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 8 }}>
            <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              เกิดข้อผิดพลาด
            </Typography>
            <Typography variant="body1" color="error" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button variant="outlined" onClick={retry}>
              ลองใหม่อีกครั้ง
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Description color="primary" />
              รายการการเบิกวัสดุตามหน่วยงาน
            </Typography>
            <Typography variant="body1" color="text.secondary">
              จำนวนรายการทั้งหมด: {data.length.toLocaleString()} รายการ
            </Typography>
          </Box>
          <Button 
            variant="contained"
            startIcon={exporting ? <CircularProgress size={16} /> : <Download />}
            onClick={exportPDF} 
            disabled={exporting || data.length === 0}
            sx={{ minWidth: 150 }}
          >
            {exporting ? 'กำลังสร้างไฟล์...' : 'ส่งออก PDF'}
          </Button>
        </Box>

        {/* Filters */}
        <Card>
          <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel id="department-select-label">เลือกหน่วยงาน</InputLabel>
              <Select
                labelId="department-select-label"
                value={selectedDept}
                label="เลือกหน่วยงาน"
                onChange={e => setSelectedDept(e.target.value)}
              >
                <MenuItem value="all">ทุกหน่วยงาน</MenuItem>
                {departments.map(dep => (
                  <MenuItem key={dep.department_id} value={dep.department_id}>{dep.department_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="วันที่เริ่มต้น"
              type="date"
              size="small"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="วันที่สิ้นสุด"
              type="date"
              size="small"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card>
          <CardHeader 
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description />
                <Typography variant="h6">รายละเอียดการเบิกวัสดุ</Typography>
              </Box>
            }
          />
          <CardContent>
            {data.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Description sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  ไม่พบข้อมูลการเบิกวัสดุ
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: 80 }}>
                        #
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business fontSize="small" />
                          หน่วยงาน
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Category fontSize="small" />
                          วัสดุ
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        จำนวนเบิก
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        จำนวนจ่าย
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                          <CalendarToday fontSize="small" />
                          วันที่
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((dept, deptIdx) =>
                      dept.materials.map((mat, matIdx) => (
                        <TableRow key={dept.department + '-' + mat.material} hover>
                          <TableCell align="center">
                            <Chip label={deptIdx * dept.materials.length + matIdx + 1} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" fontWeight="medium">
                              {dept.department}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {mat.material}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="medium">
                              {mat.total_quantity ? mat.total_quantity.toLocaleString() : '0'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="medium">
                              {mat?.totalIssued?.toLocaleString?.() || '0'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">-</Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {data.length > 0 && (
          <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
            <CardContent sx={{ py: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    สรุปข้อมูล
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 4 }}>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {data.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        รายการทั้งหมด
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {new Set(data.map(item => item.department?.name)).size}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        หน่วยงาน
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {data.reduce((sum, item) => sum + (item.quantity || 0), 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        จำนวนรวม
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Description sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.3)' }} />
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default RequisitionReport;