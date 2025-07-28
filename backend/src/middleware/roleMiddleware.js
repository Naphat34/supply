

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้เฉพาะ Admin เท่านั้น' });
    }
};

exports.isStaff = (req, res, next) => {
    if (req.user && req.user.role === 'staff') {
        next();
    } else {
        return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้เฉพาะ Staff เท่านั้น' });
    }
};

exports.isApprover = (req, res, next) => {
    if (req.user && req.user.role === 'approver') {
        next();
    } else {
        return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้เฉพาะ Approver เท่านั้น' });
    }
};