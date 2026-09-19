import type { GroupStatus, GroupMemberStatus } from "@atena/api-types";

export interface GroupMember {
  id: string;
  groupId: string;
  studentId: string;
  bookingId?: string | null;
  joinedAt: string;
  status: GroupMemberStatus;
  student?: {
    id: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    taxCode?: string | null;
  };
}

export interface Group {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  courseId: string;
  courseName?: string;
  course?: any;
  teacherId?: string | null;
  teacherName?: string;
  teacher?: any;
  room?: string | null;
  maxStudents: number;
  currentEnrolledCount: number;
  status: GroupStatus;
  startDate?: string | null;
  endDate?: string | null;
  scheduleDays: number[];
  startTime?: string | null;
  endTime?: string | null;
  notes?: string | null;
  members: GroupMember[];
  lessons?: any[];
  totalLessonsCount: number;
}

export interface CreateGroupFormValues {
  name: string;
  courseId: string;
  teacherId?: string;
  room?: string;
  maxStudents: number;
  status: GroupStatus;
  startDate?: string;
  endDate?: string;
  scheduleDays: number[];
  startTime: string;
  endTime?: string;
  notes?: string;
  generateLessons?: boolean;
}

export interface UpdateGroupFormValues {
  name?: string;
  courseId?: string;
  teacherId?: string;
  room?: string;
  maxStudents?: number;
  status?: GroupStatus;
  startDate?: string;
  endDate?: string;
  scheduleDays?: number[];
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface AddGroupMemberFormValues {
  studentId: string;
  bookingId?: string;
  status?: GroupMemberStatus;
}
