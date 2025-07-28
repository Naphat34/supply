import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Box, Chip,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField
} from '@mui/material';
import axios from 'axios';

const ApprovalPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/requests/pending');
      setRequests(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError('ไม่สามารถดึงข้อมูลคำขอที่รออนุมัติได้');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
    setComment('');
  };

  const handleApprove = async () => {
    try {
      await axios.put(`/api/requests/${selectedRequest.id}/approve`, { comment });
      fetchPendingRequests();
      handleCloseDialog();
    } catch (err) {
      console.error('Error approving request:', err);
      setError('ไม่สามารถอนุมัติคำขอได้');
    }
  };

  const handleReject = async () => {
    try {
      await axios.put(`/api/requests/${selectedRequest.id}/reject`, { comment });
      fetchPendingRequests();
      handleCloseDialog();
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('ไม่สามารถปฏิเสธคำขอได้');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="รออนุมัติ" color="warning" size="small" />;
      case 'APPROVED':
        return <Chip label="อนุมัติแล้ว" color="success" size="small" />;
      case 'REJECTED':
        return <Chip label="ปฏิเสธ" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading) return <Typography>กำลังโหลด...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>อนุมัติคำขอเบิกวัสดุ</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>รหัสคำขอ</TableCell>
              <TableCell>วันที่ขอ</TableCell>
              <TableCell>แผนก</TableCell>
              <TableCell>ผู้ขอ</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell>การดำเนินการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString('th-TH')}</TableCell>
                  <TableCell>{request.department?.name || '-'}</TableCell>
                  <TableCell>{request.requestedBy?.firstName} {request.requestedBy?.lastName}</TableCell>
                  <TableCell>{getStatusChip(request.status)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => handleViewDetails(request)}
                    >
                      ดูรายละเอียด
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">ไม่พบคำขอที่รออนุมัติ</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedRequest && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>รายละเอียดคำขอเบิก #{selectedRequest.id}</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">ข้อมูลคำขอ</Typography>
              <Typography>ผู้ขอ: {selectedRequest.requestedBy?.firstName} {selectedRequest.requestedBy?.lastName}</Typography>
              <Typography>แผนก: {selectedRequest.department?.name || '-'}</Typography>
              <Typography>วันที่ขอ: {new Date(selectedRequest.createdAt).toLocaleDateString('th-TH')}</Typography>
              <Typography>สถานะ: {selectedRequest.status}</Typography>
            </Box>

            <Typography variant="subtitle1">รายการที่ขอเบิก</Typography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>รหัสวัสดุ</TableCell>
                    <TableCell>ชื่อวัสดุ</TableCell>
                    <TableCell align="right">จำนวนที่ขอ</TableCell>
                    <TableCell>หน่วย</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedRequest.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.material?.code || '-'}</TableCell>
                      <TableCell>{item.material?.name || '-'}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell>{item.material?.unit || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TextField
              label="หมายเหตุ"
              multiline
              rows={3}
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>ยกเลิก</Button>
            <Button onClick={handleReject} color="error">ปฏิเสธ</Button>
            <Button onClick={handleApprove} color="primary" variant="contained">อนุมัติ</Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default ApprovalPage;