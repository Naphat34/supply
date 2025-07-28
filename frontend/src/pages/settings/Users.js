import React, { useState, useEffect } from 'react';
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Box,
    Chip,
    TablePagination,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Collapse,

} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUsers, createUser, updateUser, deleteUser, getDepartments } from '../../services/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
        loadDepartments();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            if (Array.isArray(data)) {
                setUsers(data);
                setError(''); // Clear any existing errors
            } else {
                setError('รูปแบบข้อมูลผู้ใช้งานไม่ถูกต้อง');
                setUsers([]); // Reset users if data format is invalid
            }
        } catch (error) {
            console.error('Error loading users:', error);
            setError(error?.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้');
            setUsers([]); // Reset users on error
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const data = await getDepartments();
            if (Array.isArray(data)) {
                setDepartments(data);
                setError('');
            } else {
                setError('ไม่พบข้อมูลแผนก');
                setDepartments([]);
            }
        } catch (error) {
            console.error('Error loading departments:', error);
            setError('ไม่สามารถโหลดข้อมูลแผนกได้');
            setDepartments([]);
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'error';
            case 'approver':
                return 'success';
            default:
                return 'primary';
        }
    };

    const getRoleText = (role) => {
        switch (role) {
            case 'admin':
                return 'ผู้ดูแลระบบ';
            case 'approver':
                return 'หัวหน้าแผนก';
            default:
                return 'ผู้ใช้งานทั่วไป';
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const [openModal, setOpenModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        role: 'user',
        departmentId: ''  // ต้องตรงกับ department_id จาก API
    });
    const [departments, setDepartments] = useState([]);
    const [success, setSuccess] = useState('');

    const handleOpenModal = () => {
        setOpenModal(true);
        setFormData({
            username: '',
            password: '',
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            role: 'user',
            departmentId: ''
        });
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setOpenEditModal(false);
        setSelectedUser(null);
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Format the data before sending
            const userData = {
                username: formData.username,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                role: formData.role,
                departmentId: formData.departmentId
            };
            
            await createUser(userData);
            setSuccess('เพิ่มผู้ใช้งานสำเร็จ');
            setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
            loadUsers();
            handleCloseModal();
        } catch (error) {
            console.error('Create user error:', error);
            setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            departmentId: user.department?.department_id || '',  // แก้ไขตรงนี้
            password: ''
        });
        setOpenEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Format the data before sending
            const userData = {
                username: formData.username,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                role: formData.role,
                departmentId: formData.departmentId
            };
            
            // Only include password if it was changed
            if (formData.password) {
                userData.password = formData.password;
            }
            
            if(!selectedUser?.userId){
                console.error('❌ ไม่พบ userId ของผู้ใช้ที่เลือก');
                setError('ไม่สามารถแก้ไขผู้ใช้ได้: ไม่มี userId');
                return;
            }

            await updateUser(selectedUser.userId, userData);
            setSuccess('แก้ไขข้อมูลผู้ใช้งานสำเร็จ');
            setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
            loadUsers();
            handleCloseModal();
 
        } catch (error) {
            console.error('Update user error:', error);
            setError(error.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
            setTimeout(() => setError(''), 3000); // Clear error message after 3 seconds
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?')) {
            try {
                await deleteUser(userId);
                setSuccess('ลบผู้ใช้งานสำเร็จ');
                setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
                loadUsers();
            } catch (error) {
                setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
                setTimeout(() => setError(''), 3000); // Clear error message after 3 seconds
            }
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            p: 4 
        }}>
            <Paper 
                elevation={0}
                sx={{ 
                    p: 3, 
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {/* Header Section */}
                <Box 
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 4,
                        pb: 3,
                        borderBottom: '1px solid rgba(0,0,0,0.1)'
                    }}
                >
                    <Box>
                        <Typography 
                            variant="h4" 
                            fontWeight={800}
                            sx={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            จัดการผู้ใช้งาน
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ color: 'text.secondary', mt: 1 }}
                        >
                            จัดการข้อมูลผู้ใช้งานระบบทั้งหมด
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenModal}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            px: 3,
                            py: 1,
                            borderRadius: 2,
                            '&:hover': {
                                boxShadow: '0 8px 16px rgba(102,126,234,0.3)',
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        เพิ่มผู้ใช้งานใหม่
                    </Button>
                </Box>

                {/* Alerts */}
                <Collapse in={!!success}>
                    <Alert 
                        severity="success" 
                        sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            '& .MuiAlert-icon': { fontSize: '1.5rem' }
                        }}
                    >
                        {success}
                    </Alert>
                </Collapse>

                <Collapse in={!!error}>
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            '& .MuiAlert-icon': { fontSize: '1.5rem' }
                        }}
                    >
                        {error}
                    </Alert>
                </Collapse>

                {/* Table Section */}
                <TableContainer 
                    sx={{ 
                        borderRadius: 3,
                        border: '1px solid rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                    }}
                >
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'primary.main' }}>
                                    <TableCell sx={{ color: 'white' }}>#</TableCell>
                                    <TableCell sx={{ color: 'white' }}>ชื่อผู้ใช้</TableCell>
                                    <TableCell sx={{ color: 'white' }}>ชื่อ-นามสกุล</TableCell>
                                    <TableCell sx={{ color: 'white' }}>แผนก</TableCell>
                                    <TableCell sx={{ color: 'white' }}>สิทธิ์การใช้งาน</TableCell>
                                    <TableCell sx={{ color: 'white' }}>การดำเนินการ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((user, index) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell>
                                                {user.firstName} {user.lastName}
                                            </TableCell>
                                            <TableCell>
                                                {user.department?.department_name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getRoleText(user.role)}
                                                    color={getRoleColor(user.role)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => handleEdit(user)}
                                                    >
                                                        แก้ไข
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="error"
                                                        startIcon={<DeleteIcon />}
                                                        onClick={() => handleDelete(user.userId)}
                                                    >
                                                        ลบ
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>

                {/* Pagination */}
                {!loading && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <TablePagination
                            component="div"
                            count={users.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="แถวต่อหน้า"
                            labelDisplayedRows={({ from, to, count }) => 
                                `${from}-${to} จาก ${count}`
                            }
                            sx={{
                                '.MuiTablePagination-select': {
                                    borderRadius: 1,
                                    backgroundColor: 'white'
                                }
                            }}
                        />
                    </Box>
                )}
            </Paper>

            {/* Modal เพิ่มผู้ใช้งาน */}
            <Dialog 
                open={openModal} 
                onClose={handleCloseModal}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        minWidth: { xs: '90%', sm: '500px' }
                    }
                }}
            >
                <DialogTitle sx={{ 
                    pb: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    เพิ่มผู้ใช้งานใหม่
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            name="username"
                            label="ชื่อผู้ใช้"
                            value={formData.username}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <TextField
                            name="password"
                            label="รหัสผ่าน"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <TextField
                            name="firstName"
                            label="ชื่อ"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                         <TextField
                            name="lastName"
                            label="นามสกุล"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <TextField
                            name="email"
                            label="อีเมล"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <TextField
                            name="phoneNumber"
                            label="เบอร์โทรศัพท์"  
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>แผนก</InputLabel>
                            <Select
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleInputChange}
                                label="แผนก"
                            >
                                {departments.map((dept) => (
                                    <MenuItem 
                                        key={dept.department_id} 
                                        value={dept.department_id}
                                    >
                                        {dept.department_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>สิทธิ์การใช้งาน</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                label="สิทธิ์การใช้งาน"
                            >
                                <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
                                <MenuItem value="staff">ผู้ใช้งานทั่วไป</MenuItem>
                                <MenuItem value="approver">ผู้อนุมัติ</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2, background: 'rgba(0,0,0,0.01)' }}>
                        <Button 
                            onClick={handleCloseModal}
                            sx={{ 
                                color: 'text.secondary',
                                '&:hover': { background: 'rgba(0,0,0,0.05)' }
                            }}
                        >
                            ยกเลิก
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                                }
                            }}
                        >
                            บันทึก
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Modal แก้ไขผู้ใช้งาน */}
            <Dialog open={openEditModal} onClose={handleCloseModal}>
                <DialogTitle>แก้ไขข้อมูลผู้ใช้งาน</DialogTitle>
                <form onSubmit={handleUpdate}>
                    <DialogContent>
                        <TextField
                            name="username"
                            label="ชื่อผู้ใช้"
                            value={formData.username}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            disabled
                        />
                        <TextField
                            name="password"
                            label="รหัสผ่าน (เว้นว่างถ้าไม่ต้องการเปลี่ยน)"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            name="firstName"
                            label="ชื่อ"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <TextField
                            name="lastName"
                            label="นามสกุล"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <TextField
                            name="email"
                            label="อีเมล"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <TextField
                            name="phoneNumber"
                            label="เบอร์โทรศัพท์"  
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>แผนก</InputLabel>
                            <Select
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleInputChange}
                                label="แผนก"
                            >
                                {departments.map((dept) => (
                                    <MenuItem 
                                        key={dept.department_id} 
                                        value={dept.department_id}
                                    >
                                        {dept.department_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>สิทธิ์การใช้งาน</InputLabel>
                            <Select
                                label="สิทธิ์การใช้งาน"
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
                                <MenuItem value="user">ผู้ใช้งานทั่วไป</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal}>ยกเลิก</Button>
                        <Button type="submit" variant="contained">บันทึก</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Users;