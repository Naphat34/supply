import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, Tabs, Tab, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, CircularProgress
} from '@mui/material';
import { getReportByDepartment, getReportByRequester, getReportByMonth, getAllMaterials } from '../../services/api';

const Reports = () => {
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        setLoading(true);
        let fetchFn;
        switch (tab) {
            case 0: fetchFn = getReportByDepartment; break;
            case 1: fetchFn = getReportByRequester; break;
            case 2: fetchFn = getReportByMonth; break;
            case 3: fetchFn = getAllMaterials; break;
            default: fetchFn = getReportByDepartment;
        }
        fetchFn().then(res => setData(res)).finally(() => setLoading(false));
    }, [tab]);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight={800} color="primary" sx={{ mb: 3 }}>
                ระบบรายงาน
            </Typography>
            <Paper sx={{ mb: 4 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary" textColor="primary" variant="scrollable">
                    <Tab label="รายงานตามหน่วยงาน" />
                    <Tab label="รายงานตามผู้ขอเบิก" />
                    <Tab label="รายงานประจำเดือน" />
                    <Tab label="รายงานวัสดุทั้งหมด" />
                </Tabs>
            </Paper>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {tab === 0 && (
                                        <>
                                            <TableCell>หน่วยงาน</TableCell>
                                            <TableCell>จำนวนใบเบิก</TableCell>
                                            <TableCell>จำนวนวัสดุที่เบิก</TableCell>
                                        </>
                                    )}
                                    {tab === 1 && (
                                        <>
                                            <TableCell>ชื่อผู้ขอเบิก</TableCell>
                                            <TableCell>หน่วยงาน</TableCell>
                                            <TableCell>จำนวนใบเบิก</TableCell>
                                        </>
                                    )}
                                    {tab === 2 && (
                                        <>
                                            <TableCell>เดือน</TableCell>
                                            <TableCell>จำนวนใบเบิก</TableCell>
                                            <TableCell>จำนวนวัสดุที่เบิก</TableCell>
                                        </>
                                    )}
                                    {tab === 3 && (
                                        <>
                                            <TableCell>รหัสวัสดุ</TableCell>
                                            <TableCell>ชื่อวัสดุ</TableCell>
                                            <TableCell>ประเภท</TableCell>
                                            <TableCell>คงเหลือ</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                                            ไม่พบข้อมูลรายงาน
                                        </TableCell>
                                    </TableRow>
                                )}
                                {data.map((row, idx) => (
                                    <TableRow key={idx}>
                                        {tab === 0 && (
                                            <>
                                                <TableCell>{row.departmentName}</TableCell>
                                                <TableCell>{row.requisitionCount}</TableCell>
                                                <TableCell>{row.materialCount}</TableCell>
                                            </>
                                        )}
                                        {tab === 1 && (
                                            <>
                                                <TableCell>{row.requesterName}</TableCell>
                                                <TableCell>{row.departmentName}</TableCell>
                                                <TableCell>{row.requisitionCount}</TableCell>
                                            </>
                                        )}
                                        {tab === 2 && (
                                            <>
                                                <TableCell>{row.month}</TableCell>
                                                <TableCell>{row.requisitionCount}</TableCell>
                                                <TableCell>{row.materialCount}</TableCell>
                                            </>
                                        )}
                                        {tab === 3 && (
                                            <>
                                                <TableCell>{row.materialCode}</TableCell>
                                                <TableCell>{row.materialNameTh}</TableCell>
                                                <TableCell>{row.categoryName}</TableCell>
                                                <TableCell>{row.stock}</TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
};

export default Reports;