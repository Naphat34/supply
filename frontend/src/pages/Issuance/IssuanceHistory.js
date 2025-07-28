import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Box,
    Alert,
    Button,
    TextField,
    InputAdornment,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Tooltip,
    Fade,
    Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InventoryIcon from '@mui/icons-material/Inventory';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';

const API_URL = 'http://localhost:5000/api';

// Custom styled components
const HeaderCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
    color: 'white',
    borderRadius: 20,
    marginBottom: theme.spacing(3),
    overflow: 'hidden',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 0v4h-2V0h-4v2h4v4h2V2h4V0h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 2V0H4v2H0v2h4v4h2V2h4V0H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat',
        opacity: 0.1
    }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    overflow: 'hidden'
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    '& .MuiTableCell-head': {
        color: 'white',
        fontWeight: 600,
        fontSize: '0.95rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: 'rgba(25, 118, 210, 0.02)',
    },
    '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.05)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease-in-out'
    },
    transition: 'all 0.2s ease-in-out'
}));

const StyledSearchField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: 'rgba(255,255,255,1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        '&.Mui-focused': {
            backgroundColor: 'rgba(255,255,255,1)',
            boxShadow: '0 6px 20px rgba(25, 118, 210, 0.2)'
        }
    }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    borderRadius: 20,
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    '&.department-chip': {
        background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
        color: 'white'
    },
    '&.person-chip': {
        background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
        color: 'white'
    }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
    borderRadius: 12,
    padding: 8,
    margin: '0 2px',
    transition: 'all 0.2s ease',
    '&.print-button': {
        background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
        color: 'white',
        '&:hover': {
            background: 'linear-gradient(45deg, #1976d2, #2196f3)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)'
        }
    }
}));

const IssuanceHistory = () => {
    const [issuances, setIssuances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [selectedIssuance, setSelectedIssuance] = useState(null);
    const [pdfPreview, setPdfPreview] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        fetchIssuances();
    }, []);

    const fetchIssuances = async () => {
        try {
            const response = await axios.get(`${API_URL}/issuances`);
            setIssuances(response.data);
            setError(null);
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการดึงข้อมูลใบจ่าย');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // ฟิลเตอร์ข้อมูลตามเลขที่ใบจ่าย
    const filteredIssuances = issuances.filter(i =>
        i.issuanceNumber.toLowerCase().includes(search.toLowerCase())
    );

    const handlePrint = (issuance) => {
        const doc = new jsPDF();
        doc.setFont('THSarabunNew', 'normal');
        doc.setFontSize(22);
        doc.text('รายการเบิก - จ่ายวัสดุหน่วยงาน', 105, 18, { align: 'center' });

        doc.setFontSize(16);

        // ข้อมูลใบจ่าย (ซ้าย) และใบขอเบิก (ขวา) แถวเดียวกัน
        const leftX = 14;
        const rightX = 120;
        let y = 30;

        // ข้อมูลใบจ่าย (ซ้าย)
        doc.text(`เลขที่ใบจ่าย: ${issuance.issuanceNumber || '-'}`, leftX, y);
        doc.text(`วันที่จ่าย: ${issuance.issuedDate ? new Date(issuance.issuedDate).toLocaleDateString('th-TH') : '-'}`, leftX, y + 8);
        doc.text(`ผู้จ่าย: ${issuance.issuer ? `${issuance.issuer.firstName || ''} ${issuance.issuer.lastName || ''}` : '-'}`, leftX, y + 16);
        doc.text(`หมายเหตุ: ${issuance.note || '-'}`, leftX, y + 24);

        // ข้อมูลใบขอเบิก (ขวา)
        if (issuance.request) {
            doc.text('ข้อมูลใบขอเบิก', rightX, y);
            doc.text(`เลขที่ใบขอเบิก: ${issuance.request.requestNumber || '-'}`, rightX, y + 8);
            doc.text(`วันที่ขอเบิก: ${issuance.request.requestDate ? new Date(issuance.request.requestDate).toLocaleDateString('th-TH') : '-'}`, rightX, y + 16);
            doc.text(`แผนก: ${issuance.request.department?.department_name || issuance.request.department?.departmentName || issuance.request.department?.name || '-'}`, rightX, y + 24);
            doc.text(`ผู้ขอเบิก: ${issuance.request.requester ? `${issuance.request.requester.firstName || ''} ${issuance.request.requester.lastName || ''}` : '-'}`, rightX, y + 32);
        } else {
            doc.text('ข้อมูลใบขอเบิก: -', rightX, y);
        }

        // ตารางรายการ
        const items =
            (Array.isArray(issuance.issuanceItems) && issuance.issuanceItems.length > 0 && issuance.issuanceItems) ||
            (Array.isArray(issuance.items) && issuance.items.length > 0 && issuance.items) ||
            (Array.isArray(issuance.itemsList) && issuance.itemsList.length > 0 && issuance.itemsList) ||
            (issuance.request && Array.isArray(issuance.request.requestItems) && issuance.request.requestItems.length > 0 && issuance.request.requestItems) ||
            (issuance.request && Array.isArray(issuance.request.items) && issuance.request.items.length > 0 && issuance.request.items) ||
            [];

        autoTable(doc, {
            startY: 70,
            head: [['ลำดับ', 'ชื่อวัสดุ', 'จำนวนขอเบิก', 'จำนวนจ่าย', 'หมายเหตุ']],
            body: items.map((item, idx) => [
                idx + 1,
                item.material?.materialNameTh
                    || item.material?.materialName
                    || item.materialNameTh
                    || item.materialName
                    || item.name
                    || '-',
                item.requestItem?.requestedQuantity
                    || item.requestedQuantity
                    || item.qtyRequest
                    || item.quantity
                    || '-',
                item.issuedQuantity
                    || item.quantityIssued
                    || item.qtyIssued
                    || item.qty
                    || '-',
                item.note || '-'
            ]),
            styles: { font: 'THSarabunNew', fontStyle: 'normal', fontSize: 16 },
            headStyles: { font: 'THSarabunNew', fontStyle: 'normal', fontSize: 16 }
        });

        // Footer: ลายเซ็นและข้อมูลผู้ขอเบิก/ผู้จ่าย (อยู่ล่างสุดของกระดาษ)
        const pageHeight = doc.internal.pageSize.getHeight();
        const footerY = pageHeight - 35;

        // ชื่อผ้ขอเบิกและผู้จ่าย
        const requesterName = issuance.request?.requester
            ? `${issuance.request.requester.firstName || ''} ${issuance.request.requester.lastName || ''}`
            : '-';
        const issuerName = issuance.issuer
            ? `${issuance.issuer.firstName || ''} ${issuance.issuer.lastName || ''}`
            : '-';

        // วันเวลา
        const now = new Date();
        const dateStr = now.toLocaleDateString('th-TH');
        const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

        doc.setFontSize(16);
        doc.text(`ลงชื่อ..................................................... (ผู้ขอเบิก)`, leftX, footerY);
        doc.text(`ชื่อ: ${requesterName}`, leftX, footerY + 8);
        doc.text(`ลงชื่อ..................................................... (ผู้จ่าย)`, rightX, footerY);
        doc.text(`ชื่อ: ${issuerName}`, rightX, footerY + 8);

        doc.setFontSize(14);
        doc.text(`วันที่พิมพ์: ${dateStr} เวลา: ${timeStr}`, leftX, pageHeight - 10);

        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfPreview(pdfUrl);
        setSelectedIssuance(issuance);
        setPreviewOpen(true);
    };

    const LoadingSkeleton = () => (
        <Box>
            {[...Array(5)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
            ))}
        </Box>
    );

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', p: 4 }}>
                <HeaderCard>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <InventoryIcon sx={{ fontSize: 40, mr: 2 }} />
                            <Typography variant="h4" fontWeight="bold">
                                ประวัติการจ่ายวัสดุ
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            ระบบจัดการและติดตามการจ่ายวัสดุทั้งหมด
                        </Typography>
                    </CardContent>
                </HeaderCard>

                <StyledPaper>
                    <Box p={4}>
                        <LoadingSkeleton />
                    </Box>
                </StyledPaper>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', p: 4 }}>
                <Fade in>
                    <Alert 
                        severity="error" 
                        sx={{ 
                            borderRadius: 3,
                            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)'
                        }}
                    >
                        {error}
                    </Alert>
                </Fade>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
            p: 4 
        }}>
            <Fade in timeout={800}>
                <div>
                    <HeaderCard>
                        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                            <Grid container alignItems="center" justifyContent="space-between">
                                <Grid item xs={12} md={8}>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <InventoryIcon sx={{ fontSize: 40, mr: 2 }} />
                                        <div>
                                            <Typography variant="h4" fontWeight="bold">
                                                ประวัติการจ่ายวัสดุ
                                            </Typography>
                                            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                                                ระบบจัดการและติดตามการจ่ายวัสดุทั้งหมด
                                            </Typography>
                                        </div>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                                        <StyledSearchField
                                            placeholder="ค้นหาเลขที่ใบจ่าย..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            size="small"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ color: 'rgba(0,0,0,0.5)' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ minWidth: 280 }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            <Grid container spacing={3} sx={{ mt: 2 }}>
                                <Grid item xs={12} sm={4}>
                                    <Box display="flex" alignItems="center">
                                        <Box sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)', 
                                            borderRadius: 2, 
                                            p: 1, 
                                            mr: 2 
                                        }}>
                                            <InventoryIcon />
                                        </Box>
                                        <div>
                                            <Typography variant="h6" fontWeight="bold">
                                                {issuances.length}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                รายการทั้งหมด
                                            </Typography>
                                        </div>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box display="flex" alignItems="center">
                                        <Box sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)', 
                                            borderRadius: 2, 
                                            p: 1, 
                                            mr: 2 
                                        }}>
                                            <SearchIcon />
                                        </Box>
                                        <div>
                                            <Typography variant="h6" fontWeight="bold">
                                                {filteredIssuances.length}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                ผลการค้นหา
                                            </Typography>
                                        </div>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box display="flex" alignItems="center">
                                        <Box sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)', 
                                            borderRadius: 2, 
                                            p: 1, 
                                            mr: 2 
                                        }}>
                                            <CalendarTodayIcon />
                                        </Box>
                                        <div>
                                            <Typography variant="h6" fontWeight="bold">
                                                วันนี้
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                {new Date().toLocaleDateString('th-TH')}
                                            </Typography>
                                        </div>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </HeaderCard>

                    <StyledPaper>
                        <TableContainer>
                            <Table>
                                <StyledTableHead>
                                    <TableRow>
                                        <TableCell>เลขที่ใบจ่าย</TableCell>
                                        <TableCell>วันที่จ่าย</TableCell>
                                        <TableCell>แผนกที่ขอเบิก</TableCell>
                                        <TableCell>ผู้ขอเบิก</TableCell>
                                        <TableCell>ผู้จ่าย</TableCell>
                                        <TableCell>หมายเหตุ</TableCell>
                                        <TableCell align="center">การดำเนินการ</TableCell>
                                    </TableRow>
                                </StyledTableHead>
                                <TableBody>
                                    {filteredIssuances
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((issuance) => (
                                            <StyledTableRow key={issuance.issuanceId}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600" color="primary">
                                                        {issuance.issuanceNumber}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                        <Typography variant="body2">
                                                            {new Date(issuance.issuedDate).toLocaleDateString('th-TH')}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <StyledChip
                                                        className="department-chip"
                                                        label={issuance.request.department?.department_name
                                                            || issuance.request.department?.departmentName
                                                            || issuance.request.department?.name
                                                            || '-'}
                                                        size="small"
                                                        icon={<BusinessIcon />}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <StyledChip
                                                        className="person-chip"
                                                        label={`${issuance.request.requester.firstName} ${issuance.request.requester.lastName}`}
                                                        size="small"
                                                        icon={<PersonIcon />}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {`${issuance.issuer.firstName} ${issuance.issuer.lastName}`}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {issuance.note || '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="พิมพ์และดูตัวอย่าง">
                                                        <ActionButton
                                                            className="print-button"
                                                            onClick={() => handlePrint(issuance)}
                                                        >
                                                            <PrintIcon fontSize="small" />
                                                        </ActionButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </StyledTableRow>
                                        ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredIssuances.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="แถวต่อหน้า"
                                sx={{
                                    borderTop: '1px solid rgba(224, 224, 224, 1)',
                                    bgcolor: 'rgba(0, 0, 0, 0.02)'
                                }}
                            />
                        </TableContainer>
                    </StyledPaper>
                </div>
            </Fade>

            <Dialog 
                open={previewOpen} 
                onClose={() => setPreviewOpen(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <VisibilityIcon sx={{ mr: 1 }} />
                    รายการเบิก-จ่ายวัสดุหน่วยงาน
                    {selectedIssuance && (
                        <Chip 
                            label={selectedIssuance.issuanceNumber}
                            size="small"
                            sx={{ ml: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                    )}
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {pdfPreview && (
                        <iframe
                            src={pdfPreview}
                            title="preview"
                            width="100%"
                            height="600px"
                            style={{ border: 'none' }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button 
                        onClick={() => setPreviewOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
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
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #2196f3, #42a5f5)'
                        }}
                    >
                        พิมพ์
                    </Button>
                    <Button
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = pdfPreview;
                            link.download = `ใบจ่ายวัสดุ_${selectedIssuance?.issuanceNumber || ''}.pdf`;
                            link.click();
                        }}
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        sx={{ 
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
                        }}
                    >
                        ดาวน์โหลด
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default IssuanceHistory;