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
    TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        category_name: '',
        description: ''
    });

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            setCategories(response.data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpen = () => {
        setOpen(true);
        setEditMode(false);
        setFormData({ category_name: '', description: '' });
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setFormData({
            category_name: category.categoryName,
            description: category.description || ''
        });
        setEditMode(true);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedCategory(null);
        setFormData({ category_name: '', description: '' });
    };

    const handleSubmit = async () => {
        try {
            if (editMode) {
                await axios.put(`/api/categories/${selectedCategory.categoryId}`, formData);
            } else {
                await axios.post('/api/categories', formData);
            }
            fetchCategories();
            handleClose();
        } catch (error) {
            console.error('Error saving category:', error);
            alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่?')) {
            try {
                await axios.delete(`/api/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
                alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Typography variant="h6" gutterBottom>
                        จัดการหมวดหมู่วัสดุ
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpen}
                    >
                        เพิ่มหมวดหมู่
                    </Button>
                </div>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ชื่อหมวดหมู่</TableCell>
                                <TableCell>คำอธิบาย</TableCell>
                                <TableCell align="right">จัดการ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.categoryId}>
                                    <TableCell>{category.categoryName}</TableCell>
                                    <TableCell >{category.description}</TableCell>
                                    <TableCell align="right">
                                        <Button
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEdit(category)}
                                        >
                                            แก้ไข
                                        </Button>
                                        <Button
                                            startIcon={<DeleteIcon />}
                                            color="error"
                                            onClick={() => handleDelete(category.categoryId)}
                                        >
                                            ลบ
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {editMode ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="ชื่อหมวดหมู่"
                        type="text"
                        fullWidth
                        value={formData.category_name}
                        onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="คำอธิบาย"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>ยกเลิก</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editMode ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Categories;