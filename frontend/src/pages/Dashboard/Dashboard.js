import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    useTheme,
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
    LinearProgress,
    Fade,
    Skeleton,
    Alert,
    Container,
    Stack,
} from '@mui/material';
import { 
    TrendingUp, 
    Assignment, 
    Inventory, 
    CheckCircle,
    Refresh,
    MoreVert,
    ArrowUpward,
    ArrowDownward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary, getRecentApproved } from '../../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [stats, setStats] = useState({
        pendingCount: 0,
        approvedCount: 0,
        materialCount: 0,
        userCount: 0
    });
    const [approvedRequisitions, setApprovedRequisitions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // โหลดข้อมูลเมื่อ component mount
    useEffect(() => {
        loadDashboardData();
    }, []);

    // โหลดข้อมูล dashboard summary และ recent approved
    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            // เรียก API ทั้งสองพร้อมกัน
            const [summary, recent] = await Promise.all([
                getDashboardSummary(),
                getRecentApproved()
            ]);
            
            // อัปเดตข้อมูลสถิติ
            setStats({
                pendingCount: summary?.pendingCount ?? 0,
                approvedCount: summary?.approvedCount ?? 0,
                materialCount: summary?.materialCount ?? 0,
                userCount: summary?.userCount ?? 0
            });
            // map ข้อมูล recent ให้ตรงกับ key ที่ใช้แสดงผล
            const mapped = (recent || []).map((item, idx) => ({
            id: item.id,
            requisition_number: item.requestNumber || item.requisition_number || item.number || `REQ-${String(idx + 1).padStart(3, '0')}`,
            requester_name: 
                item.requester_name ||
                (item.requester?.firstName && item.requester?.lastName
                    ? `${item.requester.firstName} ${item.requester.lastName}`
                    : item.requester?.name) ||
                'ไม่ระบุ',
            department: 
                typeof item.department === 'string'
                    ? item.department
                    : item.department?.department_name || item.department?.name || 'ไม่ระบุ',
            approved_date: item.approved_date || item.approvedDate || item.created_at,
            status: item.status || item.approvalStatus || 'อนุมัติแล้ว'
        }));
            setApprovedRequisitions(mapped);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูล dashboard ได้');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // ปุ่ม refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
    };

    // ฟอร์แมตวันที่
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date)) return '';
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // ฟอร์แมตเวลา
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date)) return '';
        return date.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // การ์ดสถิติ
    const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, loading }) => (
        <Fade in timeout={300}>
            <Card 
                elevation={0}
                sx={{
                    height: '100%',
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8],
                        borderColor: color,
                    },
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ fontWeight: 500, mb: 1 }}
                            >
                                {title}
                            </Typography>
                            {loading ? (
                                <Skeleton variant="text" width={80} height={48} />
                            ) : (
                                <Typography 
                                    variant="h3" 
                                    sx={{ 
                                        fontWeight: 700,
                                        color: theme.palette.text.primary,
                                        mb: 1
                                    }}
                                >
                                    {value?.toLocaleString() || 0}
                                </Typography>
                            )}
                            {trend && !loading && (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    {trend === 'up' ? (
                                        <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                                    ) : (
                                        <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
                                    )}
                                    <Typography 
                                        variant="caption" 
                                        color={trend === 'up' ? 'success.main' : 'error.main'}
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {trendValue}% จากเดือนที่แล้ว
                                    </Typography>
                                </Stack>
                            )}
                        </Box>
                        <Avatar
                            sx={{
                                bgcolor: `${color}15`,
                                color: color,
                                width: 56,
                                height: 56,
                            }}
                        >
                            <Icon sx={{ fontSize: 28 }} />
                        </Avatar>
                    </Box>
                </CardContent>
            </Card>
        </Fade>
    );

    // ข้อมูลการ์ดสถิติ
    const statsData = [
        {
            title: 'รายการเบิกใหม่',
            value: stats.pendingCount,
            icon: Assignment,
            color: theme.palette.primary.main,
            trend: 'up',
            trendValue: 12
        },
        {
            title: 'อนุมัติแล้ว',
            value: stats.approvedCount,
            icon: CheckCircle,
            color: theme.palette.success.main,
            trend: 'up',
            trendValue: 8
        },
        {
            title: 'จำนวนวัสดุทั้งหมด',
            value: stats.materialCount,
            icon: Inventory,
            color: theme.palette.info.main,
            trend: 'up',
            trendValue: 15
        },
        {
            title: 'ผู้ใช้งาน',
            value: stats.userCount,
            icon: TrendingUp,
            color: theme.palette.warning.main,
            trend: 'down',
            trendValue: 3
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    justifyContent="space-between" 
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                >
                    <Box>
                        <Typography 
                            variant="h3" 
                            sx={{ 
                                fontWeight: 800,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1
                            }}
                        >
                            Dashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            ภาพรวมระบบเบิก-จ่ายหน่วยงานจ่ายกลาง
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleRefresh}
                        disabled={refreshing}
                        sx={{
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            '&:hover': {
                                bgcolor: theme.palette.primary.dark,
                            }
                        }}
                    >
                        <Refresh sx={{ 
                            animation: refreshing ? 'spin 1s linear infinite' : 'none',
                            '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' }
                            }
                        }} />
                    </IconButton>
                </Stack>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 3, borderRadius: 2 }}
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)'
                    },
                    gap: 4,
                    mb: 4
                }}
            >
                {statsData.map((stat, index) => (
                    <Box key={index}>
                        <StatCard {...stat} loading={loading} />
                    </Box>
                ))}
            </Box>

            {/* Recent Approved Requisitions */}
            <Fade in timeout={600}>
                <Card 
                    elevation={0}
                    sx={{ 
                        borderRadius: 4,
                        border: `1px solid ${theme.palette.divider}`,
                        overflow: 'hidden'
                    }}
                >
                    <CardHeader
                        title={
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                รายการที่อนุมัติล่าสุด
                            </Typography>
                        }
                        subheader="รายการเบิกจ่ายที่ได้รับการอนุมัติแล้ว"
                        action={
                            <IconButton>
                                <MoreVert />
                            </IconButton>
                        }
                        sx={{
                            bgcolor: theme.palette.background.default,
                            borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                    />
                    <CardContent sx={{ p: 0 }}>
                        {loading ? (
                            <Box sx={{ p: 3 }}>
                                {[...Array(5)].map((_, index) => (
                                    <Box key={index} sx={{ mb: 2 }}>
                                        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                                    </Box>
                                ))}
                            </Box>
                        ) : approvedRequisitions.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: theme.palette.background.paper }}>
                                            <TableCell sx={{ fontWeight: 600 }}>รหัสเบิก</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>ผู้เบิก</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>แผนก</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>วันที่อนุมัติ</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>สถานะ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {approvedRequisitions.map((req, index) => (
                                            <TableRow 
                                                key={req.id || `fallback-key-${index}`} 
                                                sx={{
                                                    '&:hover': { bgcolor: theme.palette.action.hover },
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {req.requisition_number || `REQ-${String(index + 1).padStart(3, '0')}`}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {req.requester_name || 'ไม่ระบุ'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {req.department || 'ไม่ระบุ'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack spacing={0.5}>
                                                        <Typography variant="body2">
                                                            {formatDate(req.approved_date || req.created_at)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatTime(req.approved_date || req.created_at)}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={req.status}
                                                        color="success"
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 600,
                                                            borderRadius: 2
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ p: 6, textAlign: 'center' }}>
                                <Assignment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    ไม่มีรายการที่อนุมัติ
                                </Typography>
                                <Typography variant="body2" color="text.disabled">
                                    ยังไม่มีรายการเบิกจ่ายที่ได้รับการอนุมัติ
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Fade>

            {/* Loading Progress */}
            {refreshing && (
                <LinearProgress 
                    sx={{ 
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: theme.zIndex.appBar + 1
                    }} 
                />
            )}
        </Container>
    );
};

export default Dashboard;