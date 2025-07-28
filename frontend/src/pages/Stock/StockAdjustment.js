import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, TextField, Button,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Alert, Fade,
    CircularProgress, Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getMaterials, adjustStock } from '../../services/api';

const StockAdjustment = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = async () => {
        try {
            setLoading(true);
            const data = await getMaterials();
            setMaterials(data);
        } catch (error) {
            setError('ไม่สามารถโหลดข้อมูลวัสดุได้');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMaterial || !quantity) {
        setError('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    try {
        setLoading(true);
        const payload = {
            materialId: selectedMaterial.id,
            newQuantity: parseInt(quantity),
            remark: note
        };
        console.log('Adjust stock payload:', payload); // เพิ่มบรรทัดนี้
        await adjustStock(payload);
        setSuccess('ปรับปรุงสต๊อกเรียบร้อย');
        loadMaterials();
        setSelectedMaterial(null);
        setQuantity('');
        setNote('');
    } catch (error) {
        setError(error.message || 'เกิดข้อผิดพลาดในการปรับปรุงสต๊อก');
    } finally {
        setLoading(false);
    }
};
    return (
        <Box sx={{ p: 4, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Fade in timeout={800}>
                <Paper elevation={0} sx={{
                    p: 3,
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <Typography variant="h4" sx={{
                        mb: 4,
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        ปรับปรุงสต๊อกวัสดุ
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                            <Autocomplete
                                options={materials}
                                getOptionLabel={(option) => `${option.materialCode} - ${option.materialNameTh}`}
                                value={selectedMaterial}
                                onChange={(_, newValue) => setSelectedMaterial(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="เลือกวัสดุ"
                                        required
                                        fullWidth
                                    />
                                )}
                                sx={{ flexGrow: 1 }}
                            />
                            <TextField
                                type="number"
                                label="จำนวน"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                sx={{ width: 150 }}
                            />
                            <TextField
                                label="หมายเหตุ"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                sx={{ width: 250 }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<AddIcon />}
                                disabled={loading}
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    px: 4,
                                    '&:hover': {
                                        boxShadow: '0 8px 16px rgba(102,126,234,0.3)'
                                    }
                                }}
                            >
                                เพิ่มสต๊อก
                            </Button>
                        </Box>
                    </form>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>รหัสวัสดุ</TableCell>
                                    <TableCell>ชื่อวัสดุ</TableCell>
                                    <TableCell align="right">จำนวนคงเหลือ</TableCell>
                                    <TableCell>หน่วยนับ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    materials.map((material) => (
                                        <TableRow key={material.id}>
                                            <TableCell>{material.materialCode}</TableCell>
                                            <TableCell>{material.materialNameTh}</TableCell>
                                            <TableCell align="right">{material.stock}</TableCell>
                                            <TableCell>{material.unit}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Fade>
        </Box>
    );
};

export default StockAdjustment;