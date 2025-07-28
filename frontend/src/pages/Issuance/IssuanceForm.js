import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Divider,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Skeleton,
    Container,
    Fade,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Assignment,
    Save,
    Person,
    CalendarToday,
    Inventory,
    CheckCircle,
    Warning,
    Info,
    Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

const IssuanceForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchingRequests, setFetchingRequests] = useState(true);
    const [error, setError] = useState('');
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [issuanceData, setIssuanceData] = useState({
        requestId: '',
        issuanceNumber: '',
        note: '',
        issuanceItems: []
    });

    // ดึงรายการคำขอที่อนุมัติแล้ว
    const fetchApprovedRequests = async () => {
        setFetchingRequests(true);
        try {
            const response = await api.getRequisitionHistory();
            const requests = Array.isArray(response) ? response : (response?.data || []);
            const filtered = requests.filter(
                req =>
                    req.approvalStatus === 'APPROVED' &&
                    (!req.issuances || req.issuances.length === 0)
            );
            setApprovedRequests(filtered);
            setError('');
        } catch (error) {
            setError('ไม่สามารถดึงข้อมูลคำขอที่อนุมัติได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setFetchingRequests(false);
        }
    };

    useEffect(() => {
        fetchApprovedRequests();
    }, []);

    // เมื่อเลือกคำขอ
    const handleRequestSelect = async (requestId) => {
        if (!requestId) {
            setSelectedRequest(null);
            return;
        }

        try {
            setError('');
            const id = Number(requestId);
            const request = await api.getRequisitionById(id);
            
            if (!request) throw new Error('ไม่พบข้อมูลคำขอ');
            
            setSelectedRequest(request);
            setIssuanceData({
                requestId: request.requestId,
                issuanceNumber: `ISS-${new Date().getTime()}`,
                note: '',
                issuanceItems: (request.requestItems || []).map(item => ({
                    requestItemId: item.requestItemId,
                    materialId: item.materialId || item.material?.materialId,
                    quantity: item.requestedQuantity
                }))
            });
        } catch (error) {
            setError('ไม่สามารถดึงข้อมูลคำขอได้ กรุณาลองใหม่อีกครั้ง');
        }
    };

    // ตรวจสอบความถูกต้องของข้อมูล
    const validateForm = () => {
        const errors = {};
        
        if (!selectedRequest) {
            errors.request = 'กรุณาเลือกคำขอที่ต้องการจ่าย';
        }

        const hasInvalidQuantity = issuanceData.issuanceItems.some(item => {
            const requestItem = selectedRequest?.requestItems.find(
                ri => ri.requestItemId === item.requestItemId
            );
            return item.quantity <= 0 || item.quantity > requestItem?.requestedQuantity;
        });

        if (hasInvalidQuantity) {
            errors.quantities = 'จำนวนที่จ่ายต้องมากกว่า 0 และไม่เกินจำนวนที่ขอเบิก';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // บันทึกใบจ่าย
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // อัพเดทสถานะการเบิกเป็น ISSUED
            await api.updateRequisitionStatus(issuanceData.requestId, {
                approvalStatus: 'APPROVED',
                processingStatus: 'ISSUED'
            });

            // สร้างใบจ่ายใหม่
            const user = JSON.parse(localStorage.getItem('user'));
            const issuancePayload = {
                requestId: issuanceData.requestId,
                issuanceNumber: issuanceData.issuanceNumber,
                issuedBy: user?.userId || user?.id,
                note: issuanceData.note,
                items: issuanceData.issuanceItems.map(i => ({
                    requestItemId: i.requestItemId,
                    issuedQuantity: i.quantity,
                    materialId: i.materialId
                }))
            };
            
            await api.createIssuance(issuancePayload);
            navigate('/issuances/IssuanceHistory');
        } catch (error) {
            setError(error.response?.data?.message || 'ไม่สามารถบันทึกใบจ่ายได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    // อัพเดทจำนวนที่จ่าย
    const updateIssuanceQuantity = (requestItemId, quantity) => {
        const newItems = issuanceData.issuanceItems.map(i =>
            i.requestItemId === requestItemId
                ? { ...i, quantity: Math.max(0, parseInt(quantity) || 0) }
                : i
        );
        setIssuanceData({ ...issuanceData, issuanceItems: newItems });
        
        // ล้างข้อผิดพลาดเมื่อมีการเปลี่ยนแปลง
        if (validationErrors.quantities) {
            setValidationErrors({ ...validationErrors, quantities: '' });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                    <Assignment sx={{ mr: 2, verticalAlign: 'middle' }} />
                    สร้างใบจ่ายวัสดุ
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    เลือกคำขอที่อนุมัติแล้วเพื่อสร้างใบจ่ายวัสดุ
                </Typography>
                <Divider sx={{ mt: 2 }} />
            </Box>

            {error && (
                <Fade in={true}>
                    <Alert 
                        severity="error" 
                        sx={{ mb: 3 }}
                        action={
                            <IconButton
                                color="inherit"
                                size="small"
                                onClick={() => setError('')}
                            >
                                ×
                            </IconButton>
                        }
                    >
                        {error}
                    </Alert>
                </Fade>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card elevation={2}>
                        <CardHeader 
                            title="เลือกคำขอเบิกวัสดุ"
                            action={
                                <Tooltip title="รีเฟรชข้อมูล">
                                    <IconButton onClick={fetchApprovedRequests} disabled={fetchingRequests}>
                                        <Refresh />
                                    </IconButton>
                                </Tooltip>
                            }
                        />
                        <CardContent>
                            {fetchingRequests ? (
                                <Skeleton variant="rectangular" height={56} />
                            ) : (
                                <FormControl fullWidth>
                                    <InputLabel>เลือกคำขอที่อนุมัติแล้ว</InputLabel>
                                    <Select
                                        value={selectedRequest?.requestId || ''}
                                        label="เลือกคำขอที่อนุมัติแล้ว"
                                        onChange={(e) => handleRequestSelect(e.target.value)}
                                    >
                                        {approvedRequests.map((request) => (
                                            <MenuItem key={request.requestId} value={request.requestId}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                    <Typography variant="body1">
                                                        {request.requestNumber}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ผู้ขอ: {request.requester.firstName} {request.requester.lastName}
                                                        {request.requestDate && ` | วันที่: ${formatDate(request.requestDate)}`}
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            {approvedRequests.length === 0 && !fetchingRequests && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    <Info sx={{ mr: 1 }} />
                                    ไม่พบคำขอที่อนุมัติแล้วสำหรับการสร้างใบจ่าย
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {selectedRequest && (
                        <Fade in={true}>
                            <Card elevation={2} sx={{ mt: 3 }}>
                                <CardHeader title="รายการวัสดุที่จะจ่าย" />
                                <CardContent>
                                    {validationErrors.quantities && (
                                        <Alert severity="warning" sx={{ mb: 2 }}>
                                            <Warning sx={{ mr: 1 }} />
                                            {validationErrors.quantities}
                                        </Alert>
                                    )}

                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>รหัสวัสดุ</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>ชื่อวัสดุ</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>จำนวนที่ขอเบิก</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>จำนวนที่จ่าย</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedRequest.requestItems.map((item) => {
                                                    const issuanceItem = issuanceData.issuanceItems.find(
                                                        i => i.requestItemId === item.requestItemId
                                                    );

                                                    return (
                                                        <TableRow key={item.requestItemId} hover>
                                                            <TableCell>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {item.material.materialCode}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {item.material.materialNameTh}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Chip 
                                                                    label={item.requestedQuantity} 
                                                                    size="small" 
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <TextField
                                                                    type="number"
                                                                    size="small"
                                                                    value={issuanceItem?.quantity || 0}
                                                                    onChange={e => updateIssuanceQuantity(item.requestItemId, e.target.value)}
                                                                    InputProps={{ 
                                                                        inputProps: { 
                                                                            min: 0, 
                                                                            max: item.requestedQuantity,
                                                                            style: { textAlign: 'center' }
                                                                        } 
                                                                    }}
                                                                    sx={{ width: 80 }}
                                                                    error={issuanceItem?.quantity > item.requestedQuantity}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Fade>
                    )}
                </Grid>

                <Grid item xs={12} md={4}>
                    {selectedRequest && (
                        <Fade in={true}>
                            <Stack spacing={3}>
                                <Card elevation={2}>
                                    <CardHeader title="ข้อมูลคำขอ" />
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    เลขที่คำขอ
                                                </Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {selectedRequest.requestNumber}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    ผู้ขอเบิก
                                                </Typography>
                                                <Typography variant="body1">
                                                    <Person sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                                    {selectedRequest.requester.firstName} {selectedRequest.requester.lastName}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    วันที่ขอเบิก
                                                </Typography>
                                                <Typography variant="body1">
                                                    <CalendarToday sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                                    {formatDate(selectedRequest.requestDate)}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    สถานะ
                                                </Typography>
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Chip 
                                                        label="อนุมัติแล้ว" 
                                                        color="success" 
                                                        size="small"
                                                        icon={<CheckCircle />}
                                                    />
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                <Card elevation={2}>
                                    <CardHeader title="รายละเอียดใบจ่าย" />
                                    <CardContent>
                                        <form onSubmit={handleSubmit}>
                                            <Stack spacing={2}>
                                                <TextField
                                                    fullWidth
                                                    label="เลขที่ใบจ่าย"
                                                    value={issuanceData.issuanceNumber}
                                                    disabled
                                                    size="small"
                                                />
                                                <TextField
                                                    fullWidth
                                                    label="หมายเหตุ"
                                                    multiline
                                                    rows={3}
                                                    size="small"
                                                    value={issuanceData.note}
                                                    onChange={(e) => setIssuanceData({ ...issuanceData, note: e.target.value })}
                                                    placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
                                                />
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    size="large"
                                                    disabled={loading}
                                                    startIcon={loading ? null : <Save />}
                                                    sx={{ mt: 2 }}
                                                >
                                                    {loading ? 'กำลังบันทึก...' : 'บันทึกใบจ่าย'}
                                                </Button>
                                            </Stack>
                                        </form>
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Fade>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default IssuanceForm;