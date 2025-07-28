import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, MenuItem } from '@mui/material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';

const StockReport = () => {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:5000/api/reports/stock');
        setMaterials(response.data);
      } catch (error) {
        console.error('Error fetching stock report:', error);
      }
    }
    fetchData();
    axios.get('http://localhost:5000/api/category').then(res => {
      console.log('หมวดหมู่:', res.data);
      setCategories(res.data);
    });
  }, []);

  const filtered = materials.filter(m =>
    (category ? m.categoryId === parseInt(category) : true) &&
    (search ? (m.materialNameTh?.includes(search) || m.materialCode?.includes(search)) : true)
  );

  const getStatus = (qty, reorder) => {
    if (qty <= reorder) return 'ต่ำกว่าจุดสั่งซื้อ ⚠️';
    return 'ปกติ';
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(m => ({
      'รหัสวัสดุ': m.materialCode,
      'ชื่อวัสดุ': m.materialNameTh,
      'ประเภทวัสดุ': m.category?.categoryName,
      'หน่วยนับ': m.unit,
      'จำนวนคงเหลือ': m.StockLevel?.[0]?.quantity || 0,
      'จุดสั่งซื้อ': m.reorderPoint,
      'สถานะ': getStatus(m.StockLevel?.[0]?.quantity || 0, m.reorderPoint)
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StockReport');
    XLSX.writeFile(wb, 'StockReport.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('รายงานวัสดุคงเหลือ', 14, 16);
    doc.autoTable({
      head: [[
        'รหัสวัสดุ', 'ชื่อวัสดุ', 'ประเภทวัสดุ', 'หน่วยนับ', 'จำนวนคงเหลือ', 'จุดสั่งซื้อ', 'สถานะ'
      ]],
      body: filtered.map(m => [
        m.materialCode,
        m.materialNameTh,
        m.category?.categoryName,
        m.unit,
        m.StockLevel?.[0]?.quantity || 0,
        m.reorderPoint,
        getStatus(m.StockLevel?.[0]?.quantity || 0, m.reorderPoint)
      ]),
      startY: 24
    });
    doc.save('StockReport.pdf');
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={2}>รายงานวัสดุคงเหลือ</Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField label="ค้นหาชื่อ/รหัสวัสดุ" value={search} onChange={e => setSearch(e.target.value)} />
        <TextField select label="ประเภทวัสดุ" value={category} onChange={e => setCategory(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="">ทั้งหมด</MenuItem>
          {categories.map(cat => <MenuItem key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</MenuItem>)}
        </TextField>
        <Button variant="contained" onClick={exportExcel}>Export Excel</Button>
        <Button variant="contained" color="secondary" onClick={exportPDF}>Export PDF</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>รหัสวัสดุ</TableCell>
              <TableCell>ชื่อวัสดุ</TableCell>
              <TableCell>ประเภทวัสดุ</TableCell>
              <TableCell>หน่วยนับ</TableCell>
              <TableCell>จำนวนคงเหลือ</TableCell>
              <TableCell>จุดสั่งซื้อ</TableCell>
              <TableCell>สถานะ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {filtered.map(m => (
            <TableRow key={m.materialId}>
              <TableCell>{m.materialCode}</TableCell>
              <TableCell>{m.materialNameTh}</TableCell>
              <TableCell>{m.category?.categoryName}</TableCell>
              <TableCell>{m.unit}</TableCell>
              <TableCell>{m.StockLevel?.[0]?.quantity || 0}</TableCell>
              <TableCell>{m.reorderPoint}</TableCell>
              <TableCell>{getStatus(m.StockLevel?.[0]?.quantity || 0, m.reorderPoint)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StockReport;