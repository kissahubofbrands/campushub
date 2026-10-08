import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync('password123', 10);

  // Department
  const dept = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: { code: 'CSE', name: 'Computer Science & Engineering' }
  });

  // Users
  const student = await prisma.user.upsert({
    where: { email: 'student@campushub.edu' },
    update: {},
    create: {
      email: 'student@campushub.edu',
      passwordHash,
      fullName: 'Hari Kumar',
      role: 'STUDENT',
      registerNo: 'CSE2026001',
      departmentId: dept.id
    }
  });

  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@campushub.edu' },
    update: {},
    create: {
      email: 'faculty@campushub.edu',
      passwordHash,
      fullName: 'Dr. Kumar',
      role: 'FACULTY',
      departmentId: dept.id
    }
  });

  await prisma.user.upsert({
    where: { email: 'admin@campushub.edu' },
    update: {},
    create: {
      email: 'admin@campushub.edu',
      passwordHash,
      fullName: 'Super Admin',
      role: 'SUPER_ADMIN',
      departmentId: dept.id
    }
  });

  // Classroom
  const classroom = await prisma.classroom.upsert({
    where: { block_roomNumber: { block: 'Block A', roomNumber: '204' } },
    update: {},
    create: { block: 'Block A', roomNumber: '204', capacity: 60, departmentId: dept.id }
  });

  // Course
  const course = await prisma.course.upsert({
    where: { code: 'CS204' },
    update: {},
    create: { code: 'CS204', title: 'Database Management Systems', departmentId: dept.id }
  });

  // Timetable
  const timetable = await prisma.timetable.create({
    data: {
      dayOfWeek: 'Thursday',
      startTime: '10:00 AM',
      endTime: '10:50 AM',
      courseId: course.id,
      classroomId: classroom.id,
      facultyId: faculty.id
    }
  });

  // Initial Attendance
  await prisma.attendance.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      timetableId: timetable.id,
      date: '2026-10-08',
      status: 'PRESENT'
    }
  });

  console.log('✓ CampusHub Database successfully populated.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());