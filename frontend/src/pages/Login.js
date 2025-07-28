import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { login } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';


const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await login(username, password);
      setUser(user);
      navigate('/dashboard');
      if (!user) {
        setError('ไม่มีสิทธิ์เข้าใช้งาน');
      }
    } catch {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" align="center" gutterBottom>
          เข้าสู่ระบบ
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              )
            }}
          />
          <TextField
            fullWidth
            label="รหัสผ่าน"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Box mt={3}>
            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'เข้าสู่ระบบ'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
