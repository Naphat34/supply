import React from 'react';
import { Container, Grid, Paper, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HistoryIcon from '@mui/icons-material/History';

const UserDashboard = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                แดชบอร์ดผู้ใช้งาน
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 3,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minHeight: 200,
                            justifyContent: 'center'
                        }}
                        onClick={() => navigate('/requisitions/create')}
                    >
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <AddCircleOutlineIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6" gutterBottom>เบิกวัสดุ</Typography>
                            <Typography variant="body2" color="text.secondary">
                                สร้างรายการเบิกวัสดุใหม่
                            </Typography>
                        </Box>
                        <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<AddCircleOutlineIcon />}
                        >
                            สร้างรายการเบิกใหม่
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 3,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minHeight: 200,
                            justifyContent: 'center'
                        }}
                        onClick={() => navigate('/requisitions/history')}
                    >
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <HistoryIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6" gutterBottom>ประวัติการเบิก</Typography>
                            <Typography variant="body2" color="text.secondary">
                                ดูรายการเบิกวัสดุย้อนหลัง
                            </Typography>
                        </Box>
                        <Button 
                            variant="outlined" 
                            color="primary"
                            startIcon={<HistoryIcon />}
                        >
                            ดูประวัติการเบิก
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default UserDashboard;