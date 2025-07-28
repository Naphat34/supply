import React, { useState, useEffect } from 'react';
import {
    Typography, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Chip, Box, Alert, TablePagination, Button,
    Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions,
    IconButton, Tooltip,
    CircularProgress,  TextField, InputAdornment,
    Card, CardContent, Grid, Fade, Slide,
    useTheme, alpha, 
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getRequisitionHistory, updateRequisitionStatus, getCurrentUser } from '../../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import '../../font/THSarabunNew-normal';

const History = () => {
    const theme = useTheme();
    const [requisitions, setRequisitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [actionType, setActionType] = useState('');
    const [search, setSearch] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [pdfPreview, setPdfPreview] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('');
    const [fullName, setFullName] = useState('');

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await getCurrentUser();
                const u = res.data || res;
                setUser(u);
                setRole(u?.role || '');
                setFullName(`${u?.firstName || ''} ${u?.lastName || ''}`);
            } catch {
                setUser(null);
                setRole('');
                setFullName('');
            }
        }
        fetchUser();
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getRequisitionHistory();
                setRequisitions(res.requisitions || res);
            } catch (err) {
                setError(err.message || 'ไม่สามารถโหลดข้อมูลประวัติการเบิกได้');
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleApprove = (req) => {
        setSelectedReq(req);
        setActionType('approve');
        setDialogOpen(true);
    };

    const handleReject = (req) => {
        setSelectedReq(req);
        setActionType('reject');
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedReq(null);
        setActionType('');
    };

    const handleConfirmAction = async () => {
        if (!selectedReq) return;
        try {
            // แก้ไขการส่งพารามิเตอร์ให้เป็น object
            await updateRequisitionStatus(selectedReq.requestId, {
                approvalStatus: actionType === 'approve' ? 'APPROVED' : 'REJECTED',
                processingStatus: actionType === 'approve' ? 'PENDING_ISSUE' : 'REJECTED'
            });
            setSuccess(`ดำเนินการ${actionType === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}สำเร็จ`);
            setDialogOpen(false);
            const res = await getRequisitionHistory();
            setRequisitions(res.requisitions || res);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาด');
        }
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredRequisitions = requisitions
        .filter(row => {
            const matchNumber = search
                ? row.requestNumber?.toLowerCase().includes(search.toLowerCase())
                : true;
            const matchDate = searchDate
                ? row.requestDate?.slice(0, 10) === searchDate
                : true;
            return matchNumber && matchDate;
        })
        .sort((a, b) => {
            const numA = parseInt(a.requestNumber?.replace(/\D/g, ''), 10);
            const numB = parseInt(b.requestNumber?.replace(/\D/g, ''), 10);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numB - numA;
            }
            return (b.requestNumber || '').localeCompare(a.requestNumber || '');
        });

    const handlePrint = (row) => {
        const doc = new jsPDF();
        doc.setFont('THSarabunNew', 'normal');
        doc.setFontSize(22);
        doc.text('รายการเบิก - จ่ายวัสดุหน่วยงาน', 105, 20, { align: 'center' });

        doc.setFontSize(18);
        doc.text(`เลขที่ใบเบิก: ${row.requestNumber || '-'}`, 14, 30);
        doc.text(`วันที่ขอเบิก: ${row.requestDate?.slice(0, 10) || '-'}`, 14, 38);
        doc.text(`แผนก: ${row.department?.department_name || '-'}`, 14, 46);
        doc.text(`ผู้ขอเบิก: ${fullName || '-'}`, 14, 54);

        const items = row.requestItems || [];
        autoTable(doc, {
            startY: 62,
            head: [['ลำดับ', 'ชื่อวัสดุ', 'จำนวนเบิก', 'หมายเหตุ']],
            body: items.map((item, idx) => [
                idx + 1,
                item.material?.materialNameTh || item.material?.materialName || item.material?.name || '-',
                item.requestedQuantity || item.quantity || '-',
                item.note || '-'
            ]),
            styles: { font: 'THSarabunNew', fontStyle: 'normal', fontSize: 16 },
            headStyles: { font: 'THSarabunNew', fontStyle: 'normal', fontSize: 16 }
        });

        const finalY = doc.lastAutoTable.finalY || 80;
        const leftX = 14;
        const rightX = 120;

        doc.setFontSize(16);
        doc.text('ลงชื่อ.....................................................', leftX, finalY + 20);
        doc.text(`(${row.requester?.firstName || '-'} ${row.requester?.lastName || '-'})`, leftX + 10, finalY + 28);
        doc.text(`แผนก: ${row.department?.department_name || '-'}`, leftX, finalY + 36);
        doc.text(`วันที่: ${row.requestDate ? row.requestDate.slice(0, 10) : '-'}`, leftX, finalY + 44);

        doc.text('ลงชื่อ.....................................................', rightX, finalY + 20);
        doc.text(`(${row.approver?.firstName || '-'} ${row.approver?.lastName || '-'})`, rightX + 10, finalY + 28);
        doc.text(`แผนก: ${row.department?.department_name || '-'}`, rightX, finalY + 36);
        doc.text(`วันที่: ${row.approvedDate ? row.approvedDate.slice(0, 10) : '-'}`, rightX, finalY + 44);

        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfPreview(pdfUrl);
        setPreviewOpen(true);
    };

    const StatCard = ({ title, value, icon, color, gradient }) => (
        <Fade in timeout={1000}>
            <Card 
                sx={{ 
                    background: gradient,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 24px ${alpha(color, 0.3)}`,
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100px',
                        height: '100px',
                        background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
                        transform: 'translate(30px, -30px)',
                    }
                }}
            >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                                {value}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                {title}
                            </Typography>
                        </Box>
                        <Box sx={{ opacity: 0.7, fontSize: '3rem' }}>
                            {icon}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Fade>
    );

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 4 
        }}>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Slide direction="down" in timeout={800}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <HistoryIcon sx={{ fontSize: '4rem', color: 'white', mb: 2 }} />
                        <Typography 
                            variant="h3" 
                            fontWeight="bold" 
                            sx={{ 
                                color: 'white', 
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                mb: 1
                            }}
                        >
                            ประวัติการเบิกวัสดุ
                        </Typography>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                color: alpha('#fff', 0.8),
                                fontWeight: 300
                            }}
                        >
                            ติดตามและจัดการประวัติการเบิกวัสดุทั้งหมด
                        </Typography>
                    </Box>
                </Slide>

                </Box>

            {/* Main Content */}
            <Fade in timeout={1200}>
                <Paper 
                    sx={{ 
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    {/* Search Section */}
                    <Box 
                        sx={{ 
                            p: 4, 
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            borderBottom: '1px solid rgba(0,0,0,0.1)'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <FilterListIcon sx={{ mr: 2, color: '#667eea' }} />
                            <Typography variant="h6" fontWeight="600" color="#667eea">
                                ค้นหาและกรองข้อมูล
                            </Typography>
                        </Box>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="ค้นหาเลขที่ใบเบิก"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: '#667eea' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            backgroundColor: 'white',
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#667eea',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#667eea',
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="ค้นหาวันที่ขอเบิก"
                                    type="date"
                                    value={searchDate}
                                    onChange={e => setSearchDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            backgroundColor: 'white',
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#667eea',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#667eea',
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Alerts */}
                    <Box sx={{ p: 4, pb: 0 }}>
                        {error && (
                            <Fade in>
                                <Alert 
                                    severity="error" 
                                    sx={{ 
                                        mb: 2, 
                                        borderRadius: '12px',
                                        '& .MuiAlert-icon': {
                                            fontSize: '1.5rem'
                                        }
                                    }}
                                >
                                    {error}
                                </Alert>
                            </Fade>
                        )}
                        {success && (
                            <Fade in>
                                <Alert 
                                    severity="success" 
                                    sx={{ 
                                        mb: 2, 
                                        borderRadius: '12px',
                                        '& .MuiAlert-icon': {
                                            fontSize: '1.5rem'
                                        }
                                    }}
                                >
                                    {success}
                                </Alert>
                            </Fade>
                        )}
                    </Box>

                    {/* Table Section */}
                    <Box sx={{ p: 4 }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <CircularProgress size={60} sx={{ color: '#667eea', mb: 2 }} />
                                    <Typography variant="h6" color="textSecondary">
                                        กำลังโหลดข้อมูล...
                                    </Typography>
                                </Box>
                            </Box>
                        ) : (
                            <TableContainer 
                                sx={{ 
                                    borderRadius: '16px',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    overflow: 'hidden'
                                }}
                            >
                                <Table>
                                    <TableHead>
                                        <TableRow 
                                            sx={{ 
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                '& .MuiTableCell-head': {
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '1rem'
                                                }
                                            }}
                                        >
                                            <TableCell>เลขที่ใบเบิก</TableCell>
                                            <TableCell>วันที่ขอเบิก</TableCell>
                                            <TableCell>แผนก</TableCell>
                                            <TableCell>ผู้ขอเบิก</TableCell>
                                            <TableCell>สถานะอนุมัติ</TableCell>
                                            <TableCell>สถานะดำเนินการ</TableCell>
                                            <TableCell align="center">พิมพ์</TableCell>
                                            {(role === 'admin' || role === 'approver') && (
                                                <TableCell align="center">การดำเนินการ</TableCell>
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredRequisitions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                            <Fade in timeout={300 + index * 100} key={row.requestId}>
                                                <TableRow 
                                                    sx={{
                                                        '&:hover': {
                                                            backgroundColor: alpha('#667eea', 0.05),
                                                        },
                                                        '&:nth-of-type(odd)': {
                                                            backgroundColor: alpha('#f8fafc', 0.5),
                                                        }
                                                    }}
                                                >
                                                    <TableCell sx={{ fontWeight: 600, color: '#667eea' }}>
                                                        {row.requestNumber}
                                                    </TableCell>
                                                    <TableCell>{row.requestDate?.slice(0, 10)}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <BusinessIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#6b7280' }} />
                                                            {row.department?.department_name || '-'}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <PersonIcon sx={{ mr: 1, fontSize: '1.2rem', color: '#6b7280' }} />
                                                            {fullName || '-'}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={
                                                                row.approvalStatus === 'APPROVED'
                                                                    ? 'อนุมัติ'
                                                                    : row.approvalStatus === 'REJECTED'
                                                                    ? 'ปฏิเสธ'
                                                                    : 'รออนุมัติ'
                                                            }
                                                            color={
                                                                row.approvalStatus === 'APPROVED'
                                                                    ? 'success'
                                                                    : row.approvalStatus === 'REJECTED'
                                                                    ? 'error'
                                                                    : 'warning'
                                                            }
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                borderRadius: '20px',
                                                                px: 2
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={
                                                                row.approvalStatus === 'APPROVED'
                                                                    ? 'เสร็จสิ้น'
                                                                    : row.processingStatus === 'ISSUED'
                                                                    ? 'จ่ายแล้ว'
                                                                    : 'รอดำเนินการ'
                                                            }
                                                            color={
                                                                row.approvalStatus === 'APPROVED'
                                                                    ? 'success'
                                                                    : row.processingStatus === 'ISSUED'
                                                                    ? 'success'
                                                                    : 'default'
                                                            }
                                                            variant="outlined"
                                                            sx={{
                                                                borderRadius: '20px',
                                                                px: 2
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="พิมพ์ใบเบิก">
                                                            <IconButton 
                                                                onClick={() => handlePrint(row)}
                                                                sx={{
                                                                    color: '#667eea',
                                                                    '&:hover': {
                                                                        backgroundColor: alpha('#667eea', 0.1),
                                                                        transform: 'scale(1.1)'
                                                                    },
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                            >
                                                                <PrintIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                    {(role === 'admin' || role === 'approver') && (
                                                        <TableCell align="center">
                                                            {row.approvalStatus === 'PENDING' && (
                                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                                    <Tooltip title="อนุมัติ">
                                                                        <IconButton 
                                                                            color="success" 
                                                                            onClick={() => handleApprove(row)}
                                                                            sx={{
                                                                                '&:hover': { 
                                                                                    transform: 'scale(1.1)',
                                                                                    backgroundColor: alpha('#4ade80', 0.1)
                                                                                },
                                                                                transition: 'all 0.2s ease'
                                                                            }}
                                                                        >
                                                                            <CheckCircleIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="ปฏิเสธ">
                                                                        <IconButton 
                                                                            color="error" 
                                                                            onClick={() => handleReject(row)}
                                                                            sx={{
                                                                                '&:hover': { 
                                                                                    transform: 'scale(1.1)',
                                                                                    backgroundColor: alpha('#ef4444', 0.1)
                                                                                },
                                                                                transition: 'all 0.2s ease'
                                                                            }}
                                                                        >
                                                                            <CancelIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            </Fade>
                                        ))}
                                    </TableBody>
                                </Table>
                                <TablePagination
                                    component="div"
                                    count={filteredRequisitions.length}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    sx={{
                                        borderTop: '1px solid rgba(0,0,0,0.08)',
                                        '& .MuiTablePagination-toolbar': {
                                            px: 3
                                        }
                                    }}
                                />
                            </TableContainer>
                        )}
                    </Box>
                </Paper>
            </Fade>

            {/* Confirmation Dialog */}
            <Dialog 
                open={dialogOpen} 
                onClose={handleDialogClose}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        minWidth: '400px'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    textAlign: 'center', 
                    pt: 3,
                    color: actionType === 'approve' ? '#4ade80' : '#ef4444',
                    fontWeight: 'bold'
                }}>
                    {actionType === 'approve' ? (
                        <CheckCircleIcon sx={{ fontSize: '3rem', mb: 1, display: 'block', mx: 'auto' }} />
                    ) : (
                        <CancelIcon sx={{ fontSize: '3rem', mb: 1, display: 'block', mx: 'auto' }} />
                    )}
                    {actionType === 'approve' ? 'ยืนยันการอนุมัติ' : 'ยืนยันการปฏิเสธ'}
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', pb: 1 }}>
                    <DialogContentText sx={{ fontSize: '1.1rem' }}>
                        {actionType === 'approve'
                            ? 'คุณต้องการอนุมัติใบเบิกนี้ใช่หรือไม่'
                            : 'คุณต้องการปฏิเสธใบเบิกนี้ใช่หรือไม่'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                    <Button 
                        onClick={handleDialogClose}
                        variant="outlined"
                        sx={{ 
                            borderRadius: '25px',
                            px: 4,
                            borderColor: '#6b7280',
                            color: '#6b7280',
                            '&:hover': {
                                borderColor: '#4b5563',
                                backgroundColor: alpha('#6b7280', 0.05)
                            }
                        }}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleConfirmAction}
                        variant="contained"
                        sx={{
                            borderRadius: '25px',
                            px: 4,
                            background: actionType === 'approve' 
                                ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            '&:hover': {
                                boxShadow: `0 8px 25px ${alpha(actionType === 'approve' ? '#4ade80' : '#ef4444', 0.4)}`,
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        ยืนยัน
                    </Button>
                </DialogActions>
            </Dialog>

            {/* PDF Preview Dialog */}
            <Dialog 
                open={previewOpen} 
                onClose={() => setPreviewOpen(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        height: '80vh'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }}>
                    <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    ตัวอย่างใบเบิกวัสดุ
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {pdfPreview && (
                        <iframe
                            src={pdfPreview}
                            title="preview"
                            width="100%"
                            height="100%"
                            style={{ border: 'none', minHeight: '500px' }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ 
                    p: 3, 
                    gap: 2,
                    background: alpha('#f8fafc', 0.5),
                    justifyContent: 'center'
                }}>
                    <Button 
                        onClick={() => setPreviewOpen(false)}
                        variant="outlined"
                        sx={{ 
                            borderRadius: '25px',
                            px: 4,
                            borderColor: '#6b7280',
                            color: '#6b7280',
                            '&:hover': {
                                borderColor: '#4b5563',
                                backgroundColor: alpha('#6b7280', 0.05)
                            }
                        }}
                    >
                        ปิด
                    </Button>
                    <Button
                        onClick={() => {
                            const iframe = document.querySelector('iframe[title="preview"]');
                            iframe.contentWindow.print();
                        }}
                        variant="contained"
                        startIcon={<PrintIcon />}
                        sx={{
                            borderRadius: '25px',
                            px: 4,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                boxShadow: `0 8px 25px ${alpha('#667eea', 0.4)}`,
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        พิมพ์
                    </Button>
                    <Button
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = pdfPreview;
                            link.download = 'ใบเบิก.pdf';
                            link.click();
                        }}
                        variant="contained"
                        sx={{
                            borderRadius: '25px',
                            px: 4,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            '&:hover': {
                                boxShadow: `0 8px 25px ${alpha('#10b981', 0.4)}`,
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        ดาวน์โหลด
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default History;