const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stockController = require('./stockController');

// ดึงรายการใบจ่ายทั้งหมด
exports.getAllIssuances = async (req, res) => {
    try {
        const issuances = await prisma.issuance.findMany({
            include: {
                request: {
                    include: {
                        requester: true,
                        department: true
                    }
                },
                issuer: true,
                issuanceItems: {
                    include: {
                        material: true,
                        requestItem: true // เพิ่มตรงนี้
                    }
                }
            },
            orderBy: {
                issuedDate: 'desc'
            }
        });
        res.json(issuances);
    } catch (error) {
        console.error('Error fetching issuances:', error);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบจ่าย'
        });
    }
};

// ดึงข้อมูลใบจ่ายตาม ID
exports.getIssuanceById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const issuance = await prisma.issuance.findUnique({
            where: { issuanceId: id },
            include: {
                request: {
                    include: {
                        requester: true,
                        department: true
                    }
                },
                issuer: true,
                issuanceItems: {
                    include: {
                        material: true
                    }
                }
            }
        });

        if (!issuance) {
            return res.status(404).json({ error: 'ไม่พบใบจ่ายที่ต้องการ' });
        }

        res.json(issuance);
    } catch (error) {
        console.error('Error fetching issuance:', error);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบจ่าย'
        });
    }
};

// สร้างใบจ่ายใหม่
exports.createIssuance = async (req, res) => {
    try {
        const { requestId, issuanceItems, items, issuedBy, note } = req.body;
        const reqId = parseInt(requestId);
        if (!reqId || isNaN(reqId)) {
            return res.status(400).json({ error: 'requestId ไม่ถูกต้อง' });
        }

        // ตรวจสอบว่ามีใบคำขอที่ระบุหรือไม่
        const request = await prisma.request.findUnique({
            where: { requestId: reqId },
            include: {
                department: true,
                issuances: true,
                requestItems: true
            }
        });

        if (!request) {
            return res.status(404).json({ error: 'ไม่พบใบคำขอที่ระบุ' });
        }

        // ตรวจสอบว่าใบคำขอนี้มีการสร้างใบจ่ายไปแล้วหรือไม่
        if (request.issuances.length > 0) {
            return res.status(400).json({ error: 'ใบคำขอนี้มีการสร้างใบจ่ายไปแล้ว' });
        }

        // สร้างเลขที่ใบจ่ายอัตโนมัติ
        const currentDate = new Date();
        const buddhistYear = currentDate.getFullYear() + 543;
        const latestIssuance = await prisma.issuance.findFirst({
            where: {
                issuanceNumber: {
                    startsWith: `IS${buddhistYear}`
                }
            },
            orderBy: {
                issuanceNumber: 'desc'
            }
        });

        let sequenceNumber = '0001';
        if (latestIssuance) {
            const lastSequence = parseInt(latestIssuance.issuanceNumber.slice(-4));
            sequenceNumber = (lastSequence + 1).toString().padStart(4, '0');
        }
        const issuanceNumber = `IS${buddhistYear}${sequenceNumber}`;

        // เตรียม issuanceItems: รองรับทั้ง issuanceItems หรือ items
        const rawItems = issuanceItems || items || [];
        const mappedIssuanceItems = rawItems.map(item => ({
            requestItemId: item.requestItemId,
            materialId: item.materialId,
            issuedQuantity: item.issuedQuantity || item.quantity,
            note: item.note || null
        }));

        if (mappedIssuanceItems.length === 0) {
            return res.status(400).json({ error: 'ต้องมีรายการวัสดุอย่างน้อย 1 รายการ' });
        }

        // สร้างใบจ่าย
        const issuance = await prisma.issuance.create({
            data: {
                issuanceNumber,
                requestId: reqId,
                issuedBy: issuedBy ? parseInt(issuedBy) : null,
                note: note || '',
                issuanceItems: {
                    create: mappedIssuanceItems
                }
            },
            include: {
                request: { include: { requester: true, department: true } },
                issuer: true,
                issuanceItems: { 
                    include: { 
                        material: true, 
                        requestItem: true // เพิ่มตรงนี้
                    } 
                }
            }
        });

        // อัพเดทสถานะการดำเนินการของใบคำขอ
        await prisma.request.update({
            where: { requestId: reqId },
            data: {
                processingStatus: 'ISSUED'
            }
        });

        // ตัดสต็อกวัสดุแต่ละรายการ
        for (const item of mappedIssuanceItems) {
            // ต้องมี locationId ในแต่ละ requestItem
            const requestItem = request.requestItems.find(ri => ri.requestItemId === item.requestItemId);
            if (requestItem && requestItem.locationId) {
                await stockController.issueStock({
                    body: {
                        materialId: item.materialId,
                        quantity: item.issuedQuantity,
                        locationId: requestItem.locationId,
                        remark: `จ่ายวัสดุตามใบขอเลขที่ ${request.requestNumber}`
                    }
                }, { status: () => ({ json: () => {} }) });
            }
        }
        res.json(issuance);
    } catch (error) {
        console.error('Error creating issuance:', error);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการสร้างใบจ่าย'
        });
    }
};

// อัพเดทข้อมูลใบจ่าย
exports.updateIssuance = async (req, res) => {
    const id = parseInt(req.params.id);
    const { note, issuanceItems } = req.body;

    try {
        // ตรวจสอบว่ามีใบจ่ายที่ต้องการแก้ไขหรือไม่
        const existingIssuance = await prisma.issuance.findUnique({
            where: { issuanceId: id },
            include: {
                issuanceItems: true
            }
        });

        if (!existingIssuance) {
            return res.status(404).json({
                error: 'ไม่พบใบจ่ายที่ต้องการแก้ไข'
            });
        }

        // อัพเดทข้อมูลใบจ่าย
        const updatedIssuance = await prisma.issuance.update({
            where: { issuanceId: id },
            data: {
                note,
                issuanceItems: {
                    deleteMany: {},
                    create: issuanceItems.map(item => ({
                        materialId: parseInt(item.materialId),
                        issuedQuantity: parseInt(item.issuedQuantity),
                        note: item.note
                    }))
                }
            },
            include: {
                request: {
                    include: {
                        requester: true,
                        department: true
                    }
                },
                issuer: true,
                issuanceItems: {
                    include: {
                        material: true
                    }
                }
            }
        });

        res.json(updatedIssuance);
    } catch (error) {
        console.error('Error updating issuance:', error);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการแก้ไขใบจ่าย'
        });
    }
};

// ลบใบจ่าย
exports.deleteIssuance = async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        // ตรวจสอบว่ามีใบจ่ายที่ต้องการลบหรือไม่
        const existingIssuance = await prisma.issuance.findUnique({
            where: { issuanceId: id },
            include: {
                request: true
            }
        });

        if (!existingIssuance) {
            return res.status(404).json({
                error: 'ไม่พบใบจ่ายที่ต้องการลบ'
            });
        }

        // ลบใบจ่าย
        await prisma.issuance.delete({
            where: { issuanceId: id }
        });

        // อัพเดทสถานะการดำเนินการของใบคำขอกลับเป็น PENDING_ISSUE
        await prisma.request.update({
            where: { requestId: existingIssuance.requestId },
            data: {
                processingStatus: 'PENDING_ISSUE'
            }
        });

        res.json({ message: 'ลบใบจ่ายเรียบร้อยแล้ว' });
    } catch (error) {
        console.error('Error deleting issuance:', error);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการลบใบจ่าย'
        });
    }
};