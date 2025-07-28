import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Card,
    CardHeader,
    CardContent,
    Avatar,
    Stack,
    IconButton,
    Alert,
    Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import CloseIcon from '@mui/icons-material/Close';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/api';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [formData, setFormData] = useState({
        department_name: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (error) {
            setError('เกิดข้อผิดพลาดในการดึงข้อมูลแผนก');
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleOpen = () => {
        setOpen(true);
        setEditMode(false);
        setFormData({ department_name: '', description: '' });
    };

    const handleEdit = (department) => {
        setSelectedDepartment(department);
        setFormData({
            department_name: department.department_name,
            description: department.description || ''
        });
        setEditMode(true);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedDepartment(null);
        setFormData({ department_name: '', description: '' });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async () => {
        try {
            if (!formData.department_name) {
                setError('กรุณากรอกชื่อแผนก');
                return;
            }
            if (editMode) {
                await updateDepartment(selectedDepartment.department_id, formData);
                setSuccess('แก้ไขข้อมูลแผนกสำเร็จ');
            } else {
                await createDepartment(formData);
                setSuccess('เพิ่มแผนกใหม่สำเร็จ');
            }
            fetchDepartments();
            handleClose();
        } catch (error) {
            setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('คุณต้องการลบแผนกนี้ใช่หรือไม่?')) {
            try {
                await deleteDepartment(id);
                setSuccess('ลบแผนกสำเร็จ');
                fetchDepartments();
            } catch (error) {
                setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <BusinessIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight={800} color="primary">
                            จัดการข้อมูลแผนก
                        </Typography>
                        <Typography color="text.secondary">
                            จัดการและติดตามข้อมูลแผนกในระบบ
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Paper sx={{ mb: 4, p: 3, borderRadius: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <Box sx={{ flex: 1 }} />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                    sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                        fontWeight: 600
                    }}
                >
                    เพิ่มแผนก
                </Button>
            </Paper>

            <Card elevation={0} sx={{ borderRadius: 4, border: theme => `1px solid ${theme.palette.divider}` }}>
                <CardHeader
                    title={
                        <Typography variant="h6" fontWeight={700}>
                            รายการแผนกทั้งหมด
                        </Typography>
                    }
                    sx={{
                        bgcolor: theme => theme.palette.background.default,
                        borderBottom: theme => `1px solid ${theme.palette.divider}`
                    }}
                />
                <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: theme => theme.palette.background.paper }}>
                                    <TableCell sx={{ fontWeight: 600 }}>ชื่อแผนก</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>คำอธิบาย</TableCell>
                                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>จัดการ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {departments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                                            <BusinessIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                            <Typography variant="body1" color="text.disabled">
                                                ไม่พบข้อมูลแผนก
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {departments.map((department) => (
                                    <TableRow key={department.department_id} hover>
                                        <TableCell>{department.department_name}</TableCell>
                                        <TableCell>{department.description}</TableCell>
                                        <TableCell align="center">
                                            <IconButton color="primary" onClick={() => handleEdit(department)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(department.department_id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editMode ? 'แก้ไขแผนก' : 'เพิ่มแผนกใหม่'}
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: theme => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2}>
                        <TextField
                            autoFocus
                            label="ชื่อแผนก *"
                            type="text"
                            fullWidth
                            value={formData.department_name}
                            onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                            required
                        />
                        <TextField
                            label="คำอธิบาย"
                            type="text"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined" color="inherit">
                        ยกเลิก
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editMode ? 'บันทึกการแก้ไข' : 'เพิ่มแผนก'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Departments;