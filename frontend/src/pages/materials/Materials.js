import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    CardHeader,
    Avatar,
    IconButton,
    Chip,
    Skeleton,
    Alert,
    Container,
    Stack,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
} from '@mui/material';
import { 
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Inventory as InventoryIcon,
    FilterList as FilterListIcon,
    Search as SearchIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial, getCategories, getLocations} from '../../services/api';
import TablePagination from '@mui/material/TablePagination';



const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [locations, setLocations] = useState([]);
    const [formData, setFormData] = useState({
        materialCode: '',
        materialNameTh: '',
        materialNameEn: '',
        unit: '',
        categoryId: '',
        reorderPoint: '',
        safetyStock: '',
        description: '',
        locationId: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const filteredMaterials = materials.filter(material => {
        const matchesSearch = material.materialNameTh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.materialCode?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory ? material.categoryId === filterCategory : true;
        return matchesSearch && matchesCategory;
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);
    const paginatedMaterials = filteredMaterials.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const data = await getMaterials();
            setMaterials(data);
        } catch (error) {
            setError('เกิดข้อผิดพลาดในการดึงข้อมูลวัสดุ');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            setError('เกิดข้อผิดพลาดในการดึงข้อมูลประเภทวัสดุ');
        }
    };

    useEffect(() => {
        fetchMaterials();
        fetchCategories();
    }, []);

    useEffect(() => {
        getLocations()
            .then(setLocations)
            .catch(() => setError('เกิดข้อผิดพลาดในการดึงข้อมูลที่จัดเก็บ'));
    }, []);

    const handleOpen = () => {
        setOpen(true);
        setEditMode(false);
        setFormData({
            materialCode: '',
            materialNameTh: '',
            materialNameEn: '',
            unit: '',
            categoryId: '',
            reorderPoint: '',
            safetyStock: '',
            description: '',
            locationId: ''
        });
    };

    const handleEdit = async (material) => {
  try {
    // 🔄 เรียก API แบบเจาะจงเพื่อดึงข้อมูลล่าสุดและรวม location ด้วย
    const res = await axios.get(`/api/material/${material.materialId}`);
    const fullMaterial = res.data;

    setSelectedMaterial(fullMaterial);
    setFormData({
      materialCode: fullMaterial.materialCode || '',
      materialNameTh: fullMaterial.materialNameTh || '',
      materialNameEn: fullMaterial.materialNameEn || '',
      unit: fullMaterial.unit || '',
      categoryId: fullMaterial.categoryId || '',
      reorderPoint: fullMaterial.reorderPoint || '',
      safetyStock: fullMaterial.safetyStock || '',
      description: fullMaterial.description || '',
      locationId: fullMaterial.locationId || ''
    });

    setEditMode(true);
    setOpen(true);
  } catch (err) {
    console.error('Error loading material detail:', err);
    setError('ไม่สามารถโหลดข้อมูลวัสดุได้');
  }
};

    const handleClose = () => {
        setOpen(false);
        setSelectedMaterial(null);
        setFormData({
            materialCode: '',
            materialNameTh: '',
            materialNameEn: '',
            unit: '',
            categoryId: '',
            reorderPoint: '',
            safetyStock: '',
            description: '',
            locationId: ''
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async () => {
    try {
        if (!formData.materialCode || !formData.materialNameTh || !formData.unit || !formData.categoryId) {
            setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
            return;
        }

        const payload = {
            ...formData,
            reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint) : null,
            safetyStock: formData.safetyStock ? parseInt(formData.safetyStock) : null,
            categoryId: parseInt(formData.categoryId),
            locationId: parseInt(formData.locationId),
        };
        
        if (editMode) {
            await updateMaterial(selectedMaterial.materialId, payload);
            setSuccess('แก้ไขข้อมูลวัสดุสำเร็จ');
            setTimeout(() => setSuccess(''), 3000);
        } else {
            await createMaterial(payload);
            setSuccess('เพิ่มวัสดุใหม่สำเร็จ');
            setTimeout(() => setSuccess(''), 3000);
        }

        fetchMaterials();
        handleClose();
    } catch (error) {
        console.error(error); // ดูข้อความ error จาก backend
        setError(error?.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
};


    const handleDelete = async (id) => {
        if (window.confirm('คุณต้องการลบวัสดุนี้ใช่หรือไม่?')) {
            try {
                await deleteMaterial(id);
                setSuccess('ลบวัสดุสำเร็จ');
                fetchMaterials();
                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            } catch (error) {
                setError('เกิดข้อผิดพลาดในการลบวัสดุ');
                setTimeout(() => {
                    setError('');
                }, 3000);
            }
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box p={3}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <InventoryIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight={600} gutterBottom>
                            จัดการข้อมูลวัสดุ
                        </Typography>
                        <Typography color="text.secondary">
                            จัดการและติดตามข้อมูลวัสดุในระบบ
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

            {/* Control Panel */}
            <Paper sx={{ mb: 4, p: 3, borderRadius: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="ค้นหาวัสดุ..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                    }}
                    sx={{ minWidth: 260, flex: 1 }}
                />
                <TextField
                    select
                    variant="outlined"
                    size="small"
                    label="ประเภทวัสดุ"
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    InputProps={{
                        startAdornment: <FilterListIcon sx={{ color: 'action.active', mr: 1 }} />
                    }}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">ทุกประเภท</MenuItem>
                    {categories.map((category) => (
                        <MenuItem key={category.categoryId} value={category.categoryId}>
                            {category.categoryName}
                        </MenuItem>
                    ))}
                </TextField>
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
                    เพิ่มวัสดุใหม่
                </Button>
            </Paper>

            {/* Materials Table */}
            <Card elevation={0} sx={{ borderRadius: 4, border: theme => `1px solid ${theme.palette.divider}` }}>
                <CardHeader
                    title={
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            รายการวัสดุทั้งหมด
                        </Typography>
                    }
                    sx={{
                        bgcolor: theme => theme.palette.background.default,
                        borderBottom: theme => `1px solid ${theme.palette.divider}`
                    }}
                />
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ p: 3 }}>
                            {[...Array(5)].map((_, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                    <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <>
                        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: theme => theme.palette.background.paper }}>
                                        <TableCell sx={{ fontWeight: 600 }}>รหัสวัสดุ</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>ชื่อวัสดุ (ไทย)</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>ประเภท</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>หน่วยนับ</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>จุดสั่งซื้อ</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>สต็อกขั้นต่ำ</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>คงเหลือ</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>สถานที่จัดเก็บ</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedMaterials.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                                                <InventoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                                <Typography variant="body1" color="text.disabled">
                                                    ไม่พบข้อมูลวัสดุที่ค้นหา
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {paginatedMaterials.map((material) => (
                                        <TableRow key={material.materialId || material.materialCode} hover>
                                            <TableCell>{material.materialCode}</TableCell>
                                            <TableCell>{material.materialNameTh}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={
                                                        categories.find(cat => cat.categoryId === material.categoryId)?.categoryName || '-'
                                                    }
                                                    color="primary"
                                                    size="small"
                                                    sx={{ fontWeight: 600, borderRadius: 2}}
                                                />
                                            </TableCell>
                                            <TableCell>{material.unit}</TableCell>
                                            <TableCell>{material.reorderPoint !== undefined && material.reorderPoint !== null && material.reorderPoint !== '' ? material.reorderPoint : '-'}</TableCell>
                                            <TableCell>{material.safetyStock !== undefined && material.safetyStock !== null && material.safetyStock !== '' ? material.safetyStock : '-'}</TableCell>
                                            <TableCell>
                                                <span style={{ color: material.stock <= material.reorderPoint ? 'red' : 'inherit', fontWeight: 600 }}>
                                                    {material.stock !== undefined && material.stock !== null && material.stock !== '' ? material.stock : '-'}
                                                </span>
                                            </TableCell>
                                             <TableCell>{material.location?.locationName || '-'}</TableCell> 
                                            <TableCell>
                                                <IconButton color="primary" onClick={() => handleEdit(material)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleDelete(material.materialId)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[10]}
                                count={filteredMaterials.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={(event, newPage) => setPage(newPage)}
                                labelRowsPerPage="แสดงต่อหน้า"
                                component="div"
                            />
                        </TableContainer>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Material Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editMode ? 'แก้ไขข้อมูลวัสดุ' : 'เพิ่มวัสดุใหม่'}
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
                            label="รหัสวัสดุ"
                            value={formData.materialCode}
                            onChange={e => setFormData({ ...formData, materialCode: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="ชื่อวัสดุ (ไทย)"
                            value={formData.materialNameTh}
                            onChange={e => setFormData({ ...formData, materialNameTh: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="ชื่อวัสดุ (อังกฤษ)"
                            value={formData.materialNameEn}
                            onChange={e => setFormData({ ...formData, materialNameEn: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="หน่วยนับ"
                            value={formData.unit}
                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            select
                            label="ประเภทวัสดุ"
                            value={formData.categoryId}
                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            fullWidth
                            required
                        >
                            <MenuItem value="">เลือกประเภทวัสดุ</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category.categoryId} value={category.categoryId}>
                                    {category.categoryName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="จุดสั่งซื้อ"
                                type="number"
                                value={formData.reorderPoint}
                                onChange={e => setFormData({ ...formData, reorderPoint: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="สต็อกขั้นต่ำ"
                                type="number"
                                value={formData.safetyStock}
                                onChange={e => setFormData({ ...formData, safetyStock: e.target.value })}
                                fullWidth
                            />
                        </Stack>
                        <TextField
                            label="รายละเอียด"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                        />
                        <TextField
  select
  label="สถานที่จัดเก็บ"
  value={formData.locationId}
  onChange={e => setFormData({ ...formData, locationId: parseInt(e.target.value) })}
  fullWidth
  required
>
  <MenuItem value="">เลือกสถานที่จัดเก็บ</MenuItem>
  {locations.map((loc) => (
    <MenuItem key={loc.locationId} value={loc.locationId}>
      {loc.locationName}
    </MenuItem>
  ))}
</TextField>
    
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined" color="inherit">
                        ยกเลิก
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editMode ? 'บันทึกการแก้ไข' : 'เพิ่มวัสดุ'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Materials;