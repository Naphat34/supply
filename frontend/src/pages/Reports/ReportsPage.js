import React, { useState } from 'react';
import {
  Container, Typography, Paper, Grid, Card, CardContent,
  CardActions, Button, Box, Divider, List, ListItem,
  ListItemText, ListItemIcon
} from '@mui/material';
import {
  BarChart as ChartIcon,
  Description as ReportIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ReportsPage = () => {
  const navigate = useNavigate();
  
  const reports = [
    {
      id: 'inventory',
      title: 'รายงานสินค้าคงคลัง',
      description: 'แสดงข้อมูลวัสดุคงเหลือในคลัง จำนวนที่ต่ำกว่าจุดสั่งซื้อ และมูลค่ารวม',
      path: '/reports/inventory'
    },
    {
      id: 'requisition',
      title: 'รายงานการเบิกจ่าย',
      description: 'แสดงข้อมูลการเบิกจ่ายวัสดุตามช่วงเวลา แผนก หรือประเภทวัสดุ',
      path: '/reports/requisition'
    },
    {
      id: 'department',
      title: 'รายงานการเบิกตามแผนก',
      description: 'แสดงข้อมูลการเบิกวัสดุแยกตามแผนก เพื่อวิเคราะห์การใช้งานวัสดุ',
      path: '/reports/requisition-by-department'
    },
    {
      id: 'material',
      title: 'รายงานการใช้วัสดุ',
      description: 'แสดงข้อมูลการใช้วัสดุแต่ละชนิด เพื่อวิเคราะห์อัตราการใช้งาน',
      path: '/reports/material-usage'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>รายงาน</Typography>
      <Typography variant="body1" paragraph>
        เลือกรายงานที่ต้องการเรียกดูหรือพิมพ์
      </Typography>
      
      <Grid container spacing={3}>
        {reports.map((report) => (
          <Grid item xs={12} md={6} key={report.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ChartIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">{report.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {report.description}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<ReportIcon />}
                  onClick={() => navigate(report.path)}
                >
                  ดูรายงาน
                </Button>
                <Button 
                  size="small" 
                  startIcon={<PrintIcon />}
                >
                  พิมพ์
                </Button>
                <Button 
                  size="small" 
                  startIcon={<DownloadIcon />}
                >
                  ดาวน์โหลด PDF
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ReportsPage;