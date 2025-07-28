import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true // Send cookies with every request
});


api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ระบบ ยืนยันตัวตน
export const login = async (username, password) => {
    try {
        const res = await axios.post('/api/auth/login', { username, password }, { withCredentials: true }); 
        return res.data;
    } catch (error) {
        if (!error.response) {
            throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อของท่าน');
        }
        if (error.response?.status === 500) {
            throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล กรุณาลองใหม่อีกครั้ง');
        }
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
};

export const logout = async () => {
  await axios.post('/api/auth/logout', {}, { withCredentials: true });
};

export const getCurrentUser = async () => {
  const res = await axios.get('/api/auth/me', { withCredentials: true,
    headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'If-Modified-Since': ''
    }
   });
  return res.data;
};

//Material
export const getMaterials = async () => {
    const response = await api.get('/material');
    return response.data.map(material => ({
        id: material.materialId,
        materialId: material.materialId,
        materialCode: material.materialCode,
        materialNameTh: material.materialNameTh,
        unit: material.unit,
        stock: material.stock,
        stockLevels: Array.isArray(material.StockLevel) ? material.StockLevel.map(sl => ({
            locationId: sl.locationId,
            quantity: sl.quantity
        })) : [],
        categoryId: material.categoryId,
        reorderPoint: material.reorderPoint,
        safetyStock: material.safetyStock,
        description: material.description
    }));
};

export const createRequisition = async (payload) => {
    try {
        const response = await api.post('/requisitions', payload);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
};



export const getRequisitionHistory = async () => {
    try {
        const response = await api.get('/requisitions');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
};

export const updateRequisition = async (id, status) => {
    try {
        const response = await api.put(`/requisitions/${id}/status`, { status });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
    }
};

export const deleteRequisition = async (id) => {
    try {
        const response = await api.delete(`/requisitions/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
    }
};

export const getRequisitionStats = async () => {
    try {
        const response = await api.get('/requisitions/stats');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ');
    }
};

export const updateRequisitionStatus = async (id, { approvalStatus, processingStatus }) => {
    try {
        const response = await api.put(`/requisitions/${id}/status`, {
            status: approvalStatus,
            processingStatus
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดทสถานะ');
    }
};


export const getDepartments = async () => {
    try {
        const response = await api.get('/departments');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
};

export const createDepartment = async (data) => {
    try {
        const response = await api.post('/departments', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
};

export const updateDepartment = async (id, data) => {
    try {
        const response = await api.put(`/departments/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    }
};

export const deleteDepartment = async (id) => {
    try {
        const response = await api.delete(`/departments/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
    }
};



export const createMaterial = async (materialData) => {
    try {
        const response = await api.post('/material', materialData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลวัสดุ');
    }
};

export const updateMaterial = async (id, materialData) => {
    try {
        const response = await api.put(`/material/${id}`, materialData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลวัสดุ');
    }
};

export const deleteMaterial = async (id) => {
    try {
        const response = await api.delete(`/material/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูลวัสดุ');
    }
};

export const getUsers = async () => {
    try {
        // เปลี่ยนจาก '/users' เป็น '/user' ให้ตรงกับ endpoint ที่มีอยู่จริง
        const response = await api.get('/users');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
};

export const createUser = async (data) => {
    try {
        const response = await api.post('/users', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
};

export const updateUser = async (id, data) => {
    try {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
    }
};

export const getUserById = async (id) => {
    try {
        const response = await api.get(`/users/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
};

export const approveRequisition = async (requisitionId) => {
    try {
        const response = await api.post(`/approvals/requisitions/${requisitionId}/approve`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติรายการเบิก');
    }
};

export const rejectRequisition = async (requisitionId, reason) => {
    try {
        const response = await api.post(`/approvals/requisitions/${requisitionId}/reject`, { reason });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธรายการเบิก');
    }
};

export const getStats = async () => {
    try {
        const response = await api.get('/stats');
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message);
        }
        throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
};
//เลขที่ใบเบิก ล่าสุด
export const getNextRequisitionNumber = async () => {
    const res = await api.get('/requisitions/next-number');
    return res.data.requestNumber;
};

export const createIssuance = async (data) => {
    try {
        const response = await api.post('/issuances', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกใบจ่าย');
    }
};

export const getRequisitionById = async (id) => {
    try {
        const response = await api.get(`/requisitions/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'ไม่พบข้อมูลใบขอเบิก');
    }
};

export const getLocations = async () => {
    const response = await api.get('/location');
    return response.data;
};

export const getCategories = async () => {
    try {
        const response = await api.get('/category');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลประเภทวัสดุ');
    }
};


export const getDashboardSummary = async () => {
    try {
        const response = await api.get('/dashboard/summary');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล dashboard');
    }
};

export const getRecentApproved = async () => {
    try {
        const response = await api.get('/dashboard/recent-approved');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูลรายการอนุมัติ');
    }
};

// รายงานตามชื่อหน่วยงาน
export const getReportByDepartment = async () => {
    try {
        const response = await api.get('/requisitions'); // ใช้ข้อมูลจาก requisitions ที่มีอยู่
        
        // จัดกลุ่มข้อมูลตามแผนก
        const departmentStats = response.data.reduce((acc, req) => {
            const deptName = req.department?.department_name || 'ไม่ระบุแผนก';
            
            if (!acc[deptName]) {
                acc[deptName] = {
                    departmentName: deptName,
                    requisitionCount: 0,
                    materialCount: 0
                };
            }
            
            acc[deptName].requisitionCount += 1;
            acc[deptName].materialCount += req.requestItems?.length || 0;
            
            return acc;
        }, {});

        return Object.values(departmentStats);
    } catch (error) {
        throw new Error('เกิดข้อผิดพลาดในการโหลดรายงานตามหน่วยงาน');
    }
};

// รายงานตามผู้ขอเบิก
export const getReportByRequester = async () => {
    try {
        const response = await api.get('/requisitions');
        
        const requesterStats = response.data.reduce((acc, req) => {
            const requesterName = `${req.requester?.firstName || ''} ${req.requester?.lastName || ''}`.trim() || 'ไม่ระบุผู้ขอเบิก';
            
            if (!acc[requesterName]) {
                acc[requesterName] = {
                    requesterName: requesterName,
                    departmentName: req.department?.department_name || 'ไม่ระบุแผนก',
                    requisitionCount: 0
                };
            }
            
            acc[requesterName].requisitionCount += 1;
            return acc;
        }, {});

        return Object.values(requesterStats);
    } catch (error) {
        throw new Error('เกิดข้อผิดพลาดในการโหลดรายงานตามผู้ขอเบิก');
    }
};

// รายงานประจำเดือน
export const getReportByMonth = async () => {
    try {
        const response = await api.get('/requisitions');
        
        const monthlyStats = response.data.reduce((acc, req) => {
            const date = new Date(req.requestDate);
            const monthYear = date.toLocaleString('th-TH', { month: 'long', year: 'numeric' });
            
            if (!acc[monthYear]) {
                acc[monthYear] = {
                    month: monthYear,
                    requisitionCount: 0,
                    materialCount: 0
                };
            }
            
            acc[monthYear].requisitionCount += 1;
            acc[monthYear].materialCount += req.requestItems?.length || 0;
            
            return acc;
        }, {});

        return Object.values(monthlyStats);
    } catch (error) {
        throw new Error('เกิดข้อผิดพลาดในการโหลดรายงานประจำเดือน');
    }
};

// รายงานวัสดุทั้งหมด
export const getAllMaterials = async () => {
    try {
        // แก้จาก '/materials' เป็น '/material' ให้ตรงกับ endpoint ที่มีอยู่
        const response = await api.get('/material');
        
        // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการแสดงในรายงาน
        return response.data.map(material => ({
            materialCode: material.materialCode,
            materialNameTh: material.materialNameTh,
            categoryName: material.category?.categoryName || '-',
            stock: material.stock || 0
        }));
    } catch (error) {
        throw new Error('เกิดข้อผิดพลาดในการโหลดรายงานวัสดุทั้งหมด');
    }
};

// Stock adjustment APIs
export const adjustStock = async (data) => {
    try {
        const response = await api.post('/stock/adjust', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการปรับปรุงสต๊อก');
    }
};

export const getStockHistory = async () => {
    try {
        const response = await api.get('/stock/history');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงประวัติการปรับสต๊อก');
    }
};


//รับวัสดุเข้าระบบ (เพิ่มสต๊อก)
export const receiveMaterial = async ({ materialId, quantity, remark, locationId }) => {
    const response = await api.post('/stock/receive', { materialId, quantity, description: remark, locationId });
    return response.data;
};

