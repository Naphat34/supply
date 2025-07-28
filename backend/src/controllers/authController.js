const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const JWT_SECRET = process.env.JWT_SECRET || 'd7b91c088af8f9abd270b0e61700167a';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

//  Login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ 
    where: { username },
    include: { department: true },
  });
  if (!user) {
    return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (user)' });
  }

  const isMatch = await bcrypt.compare(password, user.password);


  if (!isMatch) {
    return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (password)' });
  }

  const token = jwt.sign({ userId: user.userId, role: user.role }, JWT_SECRET, {
    expiresIn: '1d',
  });

  res.cookie('token', token, COOKIE_OPTIONS);
  res.json({
    user: {
      userId: user.userId,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
       department: user.department
        ? { 
          id: user.department.department_id,
          name: user.department.department_name }
        : null
    }
  });
};


//  Get Current User
exports.getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      console.log(token);
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { userId: Number(decoded.userId) },
      select: { 
        userId: true, 
        firstName: true,
        lastName: true, 
        role: true,
        department: { select: { department_name: true } }
      }
    });

    if (!user) {
      console.warn('Authentication failed: User not found for userId', decoded.userId);
      return res.status(401).json({ message: 'ไม่พบผู้ใช้งาน' });
    }

    res.json({ user: {
      ...user,
      departmentName: user.department?.department_name || ''
    }});
  } catch (err) {
    console.error('Authentication error:', err.name);
    return res.status(401).json({ message: 'Token หมดอายุหรือไม่ถูกต้อง' });
  }
};


//  Logout
exports.logout = (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ message: 'ออกจากระบบแล้ว' });
};
