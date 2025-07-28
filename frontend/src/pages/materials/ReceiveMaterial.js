import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, MenuItem, Button, Stack, Alert, Container } from '@mui/material';
import { getMaterials, receiveMaterial } from '../../services/api';

const ReceiveMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ materialId: '', quantity: '', remark: '', locationId: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getMaterials();
        console.log("วัสดุทั้งหมดที่โหลดมา: ", data);
        setMaterials(data);
      } catch {
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลวัสดุ');
      }
    };
    fetchMaterials();
  }, []);

  const handleChange = e => {
  const { name, value } = e.target;
  if (name === 'materialId') {
    const selectedMaterial = materials.find(mat => mat.materialId === parseInt(value));
    let locationId = '';

    if (selectedMaterial) {
      if (selectedMaterial.stockLevels && selectedMaterial.stockLevels.length === 1) {
        locationId = selectedMaterial.stockLevels[0].locationId;
      } else if (selectedMaterial.locationId) {
        // ✅ fallback กรณีไม่มี stockLevels หรือมีหลายคลัง
        locationId = selectedMaterial.locationId;
      }
    }

    setForm({ ...form, materialId: value, locationId });
  } else if (name === 'locationId') {
    setForm({ ...form, locationId: value });
  } else {
    setForm({ ...form, [name]: value });
  }
};

  

  const handleSubmit = async () => {
    if (!form.materialId || !form.quantity) {
      setError('กรุณาเลือกวัสดุและระบุจำนวน');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!form.locationId) {
      setError('ไม่พบ location ของวัสดุนี้');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      await receiveMaterial({ 
        materialId: Number(form.materialId), 
        quantity: Number(form.quantity), 
        remark: form.remark, 
        locationId: Number(form.locationId)
       });
      setSuccess('รับวัสดุเข้าระบบสำเร็จ');
      setTimeout(() => setSuccess(''), 3000);
      setForm({ materialId: '', quantity: '', remark: '', locationId: '' });
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการรับวัสดุ');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={3} color="primary">รับวัสดุเข้าระบบ</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
        <Stack spacing={3}>
          <TextField
            select
            label="เลือกวัสดุ"
            name="materialId"
            value={form.materialId}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="">เลือกวัสดุ</MenuItem>
            {materials.map(mat => (
              <MenuItem key={mat.materialId} value={mat.materialId}>{mat.materialCode} - {mat.materialNameTh}</MenuItem>
            ))}
          </TextField>
          {(() => {
            const selectedMaterial = materials.find(mat => mat.materialId === parseInt(form.materialId));
            if (selectedMaterial && selectedMaterial.stockLevels.length > 1) {
              return (
                <TextField
                  select
                  label="เลือกสถานที่เก็บวัสดุ"
                  name="locationId"
                  value={form.locationId}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  <MenuItem value="">เลือกสถานที่เก็บ</MenuItem>
                  {selectedMaterial.stockLevels.map(sl => (
                    <MenuItem key={sl.locationId} value={sl.locationId}>
                      {sl.location?.locationName ? sl.location.locationName : `คลัง #${sl.locationId}`}
                    </MenuItem>
                  ))}
                </TextField>
              );
            }
            return null;
          })()}
          <TextField
            label="จำนวน"
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ min: 1 }}
          />
          <TextField
            label="หมายเหตุ"
            name="remark"
            value={form.remark}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" color="inherit" onClick={() => setForm({ materialId: '', quantity: '', remark: '' })}>ล้างข้อมูล</Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>บันทึกการรับวัสดุ</Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ReceiveMaterial;