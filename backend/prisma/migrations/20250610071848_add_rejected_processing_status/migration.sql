-- AlterTable
ALTER TABLE `requests` MODIFY `processing_status` ENUM('รอจ่าย', 'กำลังดำเนินการ', 'เบิกจ่ายแล้ว', 'ไม่อนุมัติ') NOT NULL;
