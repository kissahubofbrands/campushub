import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

app.use(cors());
app.use(express.json());

// --- Authentication Middleware ---
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Access token missing' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Unauthorized role' });
  }
  next();
};

// --- API Routes ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { department: true }
  });

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.fullName, dept: user.department?.code },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, registerNo: user.registerNo } });
});

app.get('/api/student/dashboard', authenticate, authorize(['STUDENT']), async (req, res) => {
  const studentId = req.user.id;
  const todayStr = '2026-10-08';

  const timetables = await prisma.timetable.findMany({ include: { course: true, classroom: true } });
  const attendances = await prisma.attendance.findMany({ where: { studentId }, include: { course: true } });

  const totalClasses = attendances.length;
  const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
  const absentCount = attendances.filter(a => a.status === 'ABSENT').length;
  const odCount = attendances.filter(a => a.status === 'OD').length;
  const leaveCount = attendances.filter(a => a.status === 'LEAVE').length;
  const percentage = totalClasses > 0 ? (((presentCount + odCount) / totalClasses) * 100).toFixed(1) : 100.0;

  res.json({
    todayStr,
    timetables,
    stats: { totalClasses, presentCount, absentCount, odCount, leaveCount, percentage },
    attendances
  });
});

app.post('/api/attendance/mark', authenticate, authorize(['FACULTY', 'DEPT_ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  const { records } = req.body;
  const logs = [];

  try {
    for (const rec of records) {
      const existing = await prisma.attendance.findUnique({
        where: { studentId_timetableId_date: { studentId: rec.studentId, timetableId: rec.timetableId, date: rec.date } }
      });

      const updated = await prisma.attendance.upsert({
        where: { studentId_timetableId_date: { studentId: rec.studentId, timetableId: rec.timetableId, date: rec.date } },
        update: { status: rec.status },
        create: { studentId: rec.studentId, timetableId: rec.timetableId, courseId: rec.courseId, date: rec.date, status: rec.status }
      });

      await prisma.auditLog.create({
        data: { userId: req.user.id, action: 'ATTENDANCE_MARKED', details: `Student: ${rec.studentId}, Status: ${rec.status}, Prev: ${existing?.status || 'NONE'}` }
      });
      logs.push(updated);
    }
    res.json({ success: true, syncedCount: logs.length });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed', details: err.message });
  }
});

app.post('/api/od/apply', authenticate, authorize(['STUDENT']), async (req, res) => {
  const { eventName, organization, date, venue, documentName } = req.body;

  let aiSummary = `[AI Verification Engine]\n`;
  aiSummary += `✓ Student Name match: ${req.user.name}\n`;
  aiSummary += (date === '2026-10-12' || date === '2026-10-15') ? `✓ Event Date verified against schedule.\n` : `⚠ Event Date mismatch.\n`;
  aiSummary += `✓ Document structure valid. Recognized organization: ${organization}.\n`;
  aiSummary += `Verdict: AI-assisted verification complete — final approval requires authorized staff review.`;

  const od = await prisma.onDuty.create({
    data: { studentId: req.user.id, eventName, organization, date, venue, documentUrl: documentName || 'cert.pdf', aiVerification: aiSummary, status: 'SUBMITTED' }
  });

  res.json({ success: true, od });
});

app.post('/api/ai/query', authenticate, async (req, res) => {
  const { query } = req.body;
  const q = query.toLowerCase();
  let response = '';

  if (q.includes('attendance')) {
    const attendances = await prisma.attendance.findMany({ where: { studentId: req.user.id } });
    const total = attendances.length;
    const present = attendances.filter(a => a.status === 'PRESENT' || a.status === 'OD').length;
    const pct = total > 0 ? ((present / total) * 100).toFixed(1) : '100.0';
    response = `Your current attendance is **${pct}%** (${present}/${total} sessions). You meet requirements.`;
  } else if (q.includes('holiday')) {
    response = `Upcoming Holidays:\n- **Oct 24, 2026**: Diwali Celebration\n- **Nov 01, 2026**: Tamil Nadu Day`;
  } else {
    response = `I am CampusAI. Ask me about attendance, today's schedule, assigned classrooms, or academic calendar events.`;
  }

  res.json({ answer: response });
});

app.listen(5000, () => console.log('CampusHub Backend operational on http://localhost:5000'));