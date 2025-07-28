const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await prisma.request.findMany({
            include: {
                requester: true,
                department: true,
                approver: true,
                requestItems: {
                    include: {
                        material: true
                    }
                },
                issuances: true
            }
        });
        res.json(requests);
    } catch (error) {
        
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอ'
        });
    }
};
exports.getRequestById = async (req, res) => {
    const id = parseInt(req.params.id);
    
    // เพิ่มการตรวจสอบค่า id
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'รหัสใบเบิกไม่ถูกต้อง กรุณาระบุเป็นตัวเลขเท่านั้น'
        });
    }

    try {
        const request = await prisma.request.findUnique({
            where: { requestId: id },
            include: {
                requester: true,
                department: true,
                approver: true,
                requestItems: {
                    include: {
                        material: true
                    }
                },
                issuances: true
            }
        });
        
        if (!request) {
            return res.status(404).json({ error: 'ไม่พบข้อมูลคำขอ' });
        }
        
        res.json(request);
    } catch (error) {
        console.error('Error fetching request by id:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเบิก' });
    }
};

exports.createRequest = async (req, res) => {
    const {
        requesterId,
        departmentId,
        requestDate,
        requestReason,
        requestItems
    } = req.body;

    try {
        // Validate requester
        const user = await prisma.user.findUnique({
            where: { userId: parseInt(requesterId) }
        });

        if (!user) {
            return res.status(400).json({ error: 'Requester not found' });
        }

        // Validate department (optional, for safety)
        const department = await prisma.departments.findUnique({
            where: { department_id: parseInt(departmentId) }
        });

        if (!department) {
            return res.status(400).json({ error: 'Department not found' });
        }

        // Generate request number
        const currentDate = new Date();
        const buddhistYear = currentDate.getFullYear() + 543;

        const latestRequest = await prisma.request.findFirst({
            where: {
                requestNumber: {
                    startsWith: `REQ${buddhistYear}`
                }
            },
            orderBy: {
                requestNumber: 'desc'
            }
        });

        let sequenceNumber = '0001';
        if (latestRequest) {
            const lastSequence = parseInt(latestRequest.requestNumber.slice(-4));
            sequenceNumber = (lastSequence + 1).toString().padStart(4, '0');
        }

        const requestNumber = `REQ${buddhistYear}${sequenceNumber}`;

        const request = await prisma.request.create({
            data: {
                requestNumber,
                requesterId: parseInt(requesterId),
                departmentId: parseInt(departmentId),
                requestDate: new Date(requestDate),
                requestReason,
                approvalStatus: 'PENDING',
                processingStatus: 'PENDING_ISSUE',
                requestItems: {
                    create: requestItems.map(item => ({
                        materialId: parseInt(item.materialId),
                        requestedQuantity: parseInt(item.requestedQuantity),
                        note: item.note
                    }))
                }
            },
            include: {
                requester: true,
                department: true,
                requestItems: {
                    include: {
                        material: true
                    }
                }
            }
        });

        res.json(request);
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการสร้างคำขอ'
        });
    }
};


exports.updateRequest = async (req, res) => {
    const id = parseInt(req.params.id);
    const {
        requestReason,
        requestItems
    } = req.body;

    try {
        // ตรวจสอบว่ามีคำขอที่ต้องการแก้ไขหรือไม่
        const existingRequest = await prisma.request.findUnique({
            where: { requestId: id },
            include: {
                requestItems: true
            }
        });

        if (!existingRequest) {
            return res.status(404).json({
                error: 'ไม่พบคำขอที่ต้องการแก้ไข'
            });
        }

        // ตรวจสอบสถานะการอนุมัติ
        if (existingRequest.approvalStatus !== 'PENDING') {
            return res.status(400).json({
                error: 'ไม่สามารถแก้ไขคำขอที่ผ่านการอนุมัติหรือปฏิเสธแล้ว'
            });
        }

        // อัพเดทข้อมูลคำขอ
        const updatedRequest = await prisma.request.update({
            where: { requestId: id },
            data: {
                requestReason,
                requestItems: {
                    // ลบรายการเดิม
                    deleteMany: {},
                    // สร้างรายการใหม่
                    create: requestItems.map(item => ({
                        materialId: parseInt(item.materialId),
                        requestedQuantity: parseInt(item.requestedQuantity),
                        note: item.note
                    }))
                }
            },
            include: {
                requester: true,
                department: true,
                requestItems: {
                    include: {
                        material: true
                    }
                }
            }
        });

        res.json(updatedRequest);
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการแก้ไขคำขอ'
        });
    }
};

exports.deleteRequest = async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        // ตรวจสอบว่ามีคำขอที่ต้องการลบหรือไม่
        const existingRequest = await prisma.request.findUnique({
            where: { requestId: id },
            include: {
                issuances: true
            }
        });

        if (!existingRequest) {
            return res.status(404).json({
                error: 'ไม่พบคำขอที่ต้องการลบ'
            });
        }

        // ตรวจสอบว่ามีการเบิกจ่ายที่เกี่ยวข้องหรือไม่
        if (existingRequest.issuances.length > 0) {
            return res.status(400).json({
                error: 'ไม่สามารถลบคำขอที่มีการเบิกจ่ายแล้ว'
            });
        }

        // ตรวจสอบสถานะการอนุมัติ
        if (existingRequest.approvalStatus !== 'PENDING') {
            return res.status(400).json({
                error: 'ไม่สามารถลบคำขอที่ผ่านการอนุมัติหรือปฏิเสธแล้ว'
            });
        }

        // ลบคำขอและรายการที่เกี่ยวข้อง
        await prisma.request.delete({
            where: { requestId: id }
        });

        res.json({ message: 'ลบคำขอเรียบร้อยแล้ว' });
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการลบคำขอ'
        });
    }
};

// อนุมัติหรือปฏิเสธใบเบิก
exports.updateRequestApproval = async (req, res) => {
    const { requestId } = req.params;
    const { approvalStatus, approvalReason, approverId } = req.body;

    try {
        // ตรวจสอบว่าใบเบิกมีอยู่จริง
        const existingRequest = await prisma.request.findUnique({
            where: { requestId: parseInt(requestId) },
            include: {
                requestItems: true,
                requester: true,
                department: true
            }
        });

        if (!existingRequest) {
            return res.status(404).json({ message: 'ไม่พบใบเบิกที่ระบุ' });
        }

        // ตรวจสอบว่าใบเบิกอยู่ในสถานะที่สามารถอนุมัติได้
        if (existingRequest.approvalStatus !== 'PENDING') {
            return res.status(400).json({ 
                message: 'ไม่สามารถอนุมัติใบเบิกนี้ได้ เนื่องจากไม่ได้อยู่ในสถานะรอการอนุมัติ' 
            });
        }

        // อัพเดทสถานะการอนุมัติ
        const updatedRequest = await prisma.request.update({
            where: { requestId: parseInt(requestId) },
            data: {
                approvalStatus,
                approvalReason,
                approvedBy: parseInt(approverId),
                approvedDate: new Date(),
                updatedAt: new Date()
            },
            include: {
                requestItems: true,
                requester: true,
                department: true,
                approver: true
            }
        });

        res.json(updatedRequest);
    } catch (error) {
        console.error('Error updating request approval:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะการอนุมัติ' });
    }
};

// ดึงรายการใบเบิกที่รอการอนุมัติ
exports.getPendingRequests = async (req, res) => {
    try {
        const pendingRequests = await prisma.request.findMany({
            where: {
                approvalStatus: 'PENDING'
            },
            include: {
                requester: true,
                department: true,
                requestItems: {
                    include: {
                        material: true
                    }
                }
            },
            orderBy: {
                requestDate: 'desc'
            }
        });

        res.json(pendingRequests);
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเบิกที่รอการอนุมัติ' });
    }
};


exports.getNextRequisitionNumber = async (req, res) => {
    try {
        const currentDate = new Date();
        const buddhistYear = currentDate.getFullYear() + 543;

        // หาเลขที่ใบขอล่าสุดของปีนี้
        const latest = await prisma.request.findFirst({
            where: {
                requestNumber: {
                    startsWith: `REQ${buddhistYear.toString()}`
                }
            },
            orderBy: {
                requestNumber: 'desc'
            }
        });

        let sequenceNumber = '0001';
        if (latest) {
            const lastSeq = parseInt(latest.requestNumber.slice(-4), 10);
            sequenceNumber = (lastSeq + 1).toString().padStart(4, '0');
        }

        const nextNumber = `REQ${buddhistYear}${sequenceNumber}`;
        res.json({ requestNumber: nextNumber });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status, approvedBy, approvalStatus, processingStatus } = req.body;
    try {
        const updateData = {
            approvalStatus: approvalStatus || status, // ใช้ค่าที่ส่งมาจาก frontend
            approvedDate: new Date(),
            approvedBy: approvedBy,
            processingStatus: processingStatus || (approvalStatus === 'APPROVED' ? 'PENDING_ISSUE' : 'REJECTED')
        };

        const updated = await prisma.request.update({
            where: { requestId: Number(id) },
            data: updateData,
        });
        res.json(updated);
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะ' });
    }
};

// ประวัติใบเบิก
exports.getRequestApprovalHistory = async (req, res) => {
    try {
        const requisitions = await prisma.request.findMany({
            where: {
                approvalStatus: { not: 'PENDING' },
                processingStatus: 'PENDING_ISSUE',
                issuances: { none: {} } 
            },
            include: {
                requester: true,
                approver: true,
                department: true,
                requestItems: {
                    include: { material: true }
                },
                issuances: true
            },
            orderBy: { requestDate: 'desc' }
        });
        
        res.json(requisitions);
    } catch (error) {
        console.error('Error fetching approval history:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};

// ดึงสถิติใบขอเบิก
exports.getRequisitionStats = async (req, res) => {
    try {
        // นับจำนวนแต่ละสถานะ
        const [
            total,
            pending,
            approved,
            rejected,
            pendingIssue,
            issued
        ] = await Promise.all([
            prisma.request.count(),
            prisma.request.count({ where: { approvalStatus: 'PENDING' } }),
            prisma.request.count({ where: { approvalStatus: 'APPROVED' } }),
            prisma.request.count({ where: { approvalStatus: 'REJECTED' } }),
            prisma.request.count({ where: { processingStatus: 'PENDING_ISSUE' } }),
            prisma.request.count({ where: { processingStatus: 'ISSUED' } }),
        ]);

        res.json({
            total,
            pending,
            approved,
            rejected,
            pendingIssue,
            issued
        });
    } catch (error) {
        console.error('Error fetching requisition stats:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงสถิติใบขอเบิก' });
    }
};
