import React, { useState, useEffect } from 'react';
import {
    Typography, 
    Paper, 
    Grid, 
    TextField, 
    Button, 
    Box,
    Autocomplete, 
    Alert, 
    IconButton, 
    Card, 
    CardContent, 
    Divider,
    Fade
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    Receipt as ReceiptIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { getMaterials, createRequisition, getNextRequisitionNumber, getCurrentUser } from '../../services/api';

// Styled Components
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

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    borderRadius: 12,
    boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.08)',
    background: '#f9fafc',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px 0 rgba(31, 38, 135, 0.12)'
    }
}));

const Create = () => {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [items, setItems] = useState([{ material_id: '', requested_quantity: '', note: '', unit: '' }]);
    const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
    const [requisitionNumber, setRequisitionNumber] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await getCurrentUser();
                setUser(res.data || res);
            } catch {
                setUser(null);
            }
        }
        fetchUser();
        loadMaterials();
        fetchRequisitionNumber();
    }, []);
    
    const fetchRequisitionNumber = async () => {
        try {
            const reqNumber = await getNextRequisitionNumber();
            setRequisitionNumber(reqNumber);
        } catch (err) {
            setError('ไม่สามารถโหลดเลขที่ใบเบิกได้');
        }
    };

    const loadMaterials = async () => {
        try {
            const response = await getMaterials(); 
            const mapped = response.map(m => ({
                ...m,
                id: m.id || m.material_id,
                name: m.materialNameTh || m.name || m.material_name
            }));
    
            setMaterials(mapped);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลวัสดุได้');
        }
    };

    const handleAddItem = () => {
        setItems([...items, { material_id: '', requested_quantity: '', note: '', unit: '' }]);
    };

    const handleRemoveItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleMaterialChange = (index, value) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            material_id: value?.id || '',
            unit: value?.unit || ''
        };
        setItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!user?.userId || !user.department.department_id) {
            setError('ข้อมูลผู้ใช้ไม่ถูกต้อง');
            setLoading(false);
            return;
        }

        for (const item of items) {
            if (!item.material_id || !item.requested_quantity || item.requested_quantity <= 0) {
                setError('กรุณากรอกข้อมูลวัสดุและจำนวนที่ต้องการเบิกให้ครบถ้วน');
                setLoading(false);
                return;
            }
        }

        try {
            const requisitionData = {
                requestDate: requestDate,
                requestReason: reason,
                requesterId: user?.userId,
                departmentId: user?.department.department_id,
                requestItems: items.map(item => ({
                    materialId: item.material_id,
                    requestedQuantity: parseInt(item.requested_quantity),
                    note: item.note
                }))
            };
            
            await createRequisition(requisitionData);
            setSuccess('บันทึกใบขอเบิกสำเร็จ');
            setTimeout(() => navigate('/requisitions/history'), 1500);
        } catch (err) {
            setError('ไม่สามารถบันทึกรายการเบิกได้');
            console.error('API error:', err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Box sx={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
            p: 4 }}>
            <Fade in timeout={800}>
                <div>
                    <HeaderCard>
                        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                            <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
                                <Grid item xs={12} md={8}>
                                    <Box display="flex" alignItems="center">
                                        <ReceiptIcon sx={{ fontSize: 40, mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" fontWeight="bold">
                                                ขอเบิกวัสดุหน่วยงานจ่ายกลาง
                                            </Typography>
                                            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                                                กรอกข้อมูลเพื่อขอเบิกวัสดุในระบบ
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Button
                                            variant="contained"
                                            onClick={() => navigate('/requisitions/history')}
                                            sx={{
                                                borderRadius: 2,
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255,255,255,0.3)'
                                                }
                                            }}
                                        >
                                            กลับไปหน้าประวัติ
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </HeaderCard>

                    <StyledPaper>
                        <Box p={4}>
                            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="วันที่ขอเบิก"
                                            type="date"
                                            value={requestDate}
                                            onChange={(e) => setRequestDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="เลขที่ใบเบิก"
                                            value={requisitionNumber}
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="เหตุผลการขอเบิก"
                                            multiline
                                            rows={1}
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            
                                        />
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 4 }} />

                                <Typography variant="h6" sx={{ mb: 3 }} color="primary">
                                    รายการวัสดุที่ขอเบิก
                                </Typography>

                                {items.map((item, index) => (
                                    <StyledCard key={index}>
                                        <CardContent>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} md={5} width={'45ch'}>
                                                    <Autocomplete
                                                        options={materials}
                                                        getOptionLabel={(option) => option.name || ''}
                                                        value={materials.find(m => m.id === item.material_id) || null}
                                                        onChange={(_, value) => handleMaterialChange(index, value)}
                                                        renderInput={(params) => (
                                                            <TextField {...params} label="เลือกวัสดุ" required />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="จำนวน"
                                                        type="number"
                                                        value={item.requested_quantity}
                                                        onChange={(e) => handleItemChange(index, 'requested_quantity', e.target.value)}
                                                        required
                                                        InputProps={{ inputProps: { min: 1 } }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="หมายเหตุ"
                                                        value={item.note || ''}
                                                        onChange={(e) => handleItemChange(index, 'note', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={1}>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleRemoveItem(index)}
                                                        disabled={items.length === 1}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </StyledCard>
                                ))}

                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={handleAddItem}
                                    variant="outlined"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    เพิ่มรายการวัสดุ
                                </Button>

                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CancelIcon />}
                                        onClick={() => navigate('/requisitions/history')}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        disabled={loading}
                                        sx={{
                                            borderRadius: 2,
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                                            boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
                                        }}
                                    >
                                        บันทึกใบขอเบิก
                                    </Button>
                                </Box>
                            </form>
                        </Box>
                    </StyledPaper>
                </div>
            </Fade>
        </Box>
    );
};

export default Create;