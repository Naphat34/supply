import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CategoryIcon from "@mui/icons-material/Category";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary, getMaterials, getRecentApproved } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";


const NewDashboard = ({
  role = "staff",
  username = "User",
  firstName = "",
  lastName = "",
  departmentName = "",
}) => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [materialsData, setMaterialsData] = useState([]);
  const [recentApprovals, setRecentApprovals] = useState([]);

  const displayName =
    firstName && lastName ? `${firstName} ${lastName}` : username;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const summary = await getDashboardSummary(); // ใบเบิก + อนุมัติ
        const materials = await getMaterials(); // วัสดุทั้งหมด
        const approvals = await getRecentApproved(); // รายการอนุมัติล่าสุด
        setSummaryData(summary);
        setMaterialsData(materials);
        setRecentApprovals(approvals);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getConsumableCount = () =>
    materialsData.filter((m) => m.category?.type === "consumable").length;

  const getAllMaterialCount = () => materialsData.length;

  // ฟังก์ชันแปลงวันที่เป็นรูปแบบไทย
  const formatThaiDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const cards = [
    {
      title: "ใบเบิกทั้งหมด",
      value: summaryData?.pendingCount || 0,
      icon: <AssignmentIcon sx={{ fontSize: 120 }} />,
      color: "#673ab7", // Purple
    },
    {
      title: "จำนวนอนุมัติ",
      value: summaryData?.approvedCount || 0,
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 120 }} />,
      color: "#2196f3", // Blue
    },
    {
      title: "วัสดุสิ้นเปลือง",
      value: getConsumableCount(),
      icon: <CategoryIcon sx={{ fontSize: 120 }} />,
      color: "#4caf50", // Green
    },
    {
      title: "วัสดุทั้งหมด",
      value: getAllMaterialCount(),
      icon: <Inventory2OutlinedIcon sx={{ fontSize: 120 }} />,
      color: "#ff9800", // Orange
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f5f6fa",
      }}
    >
      <Box sx={{ flex: 1, p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          แดชบอร์ด
        </Typography>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {cards.map((card, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card
                    sx={{
                      backgroundColor: card.color,
                      color: "#fff",
                      borderRadius: 3,
                      minHeight: 100,
                      width: '355px',
                    }}
                  >
                    <CardContent>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography variant="h2" fontWeight="bold">
                            {card.value}
                          </Typography>
                          <Typography variant="body1">{card.title}</Typography>
                        </Box>
                        <IconButton sx={{ color: "#fff" }} disabled>
                          {card.icon}
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* ตารางรายการอนุมัติล่าสุด */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                รายการอนุมัติล่าสุด
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>เลขที่ใบเบิก</TableCell>
                      <TableCell>วันที่ขอเบิก</TableCell>
                      <TableCell>ผู้ขอเบิก</TableCell>
                      <TableCell>แผนก</TableCell>
                      <TableCell>วันที่อนุมัติ</TableCell>
                      <TableCell>สถานะ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentApprovals && recentApprovals.length > 0 ? (
                      recentApprovals.map((item) => (
                        <TableRow key={item.requestId} hover>
                          <TableCell>{item.requestNumber}</TableCell>
                          <TableCell>{formatThaiDate(item.requestDate)}</TableCell>
                          <TableCell>
                            {item.requester ? `${item.requester.firstName} ${item.requester.lastName}` : '-'}
                          </TableCell>
                          <TableCell>{item.department?.department_name || '-'}</TableCell>
                          <TableCell>{formatThaiDate(item.approvedDate)}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'inline-block',
                                bgcolor: '#4caf50',
                                color: 'white',
                                borderRadius: 1,
                                px: 1,
                                py: 0.5,
                                fontSize: '0.875rem',
                              }}
                            >
                              อนุมัติแล้ว
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          ไม่พบรายการอนุมัติล่าสุด
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default NewDashboard;
