export interface Course {
  courseId: number;
  courseName: string;
  description?: string;
  durationDays?: number;
  createdOn?: string;
}

export interface CourseCalendar {
  calendarId: number;
  courseId: number;
  startDate: string;
  endDate: string;
  // backend currently marks Course as JsonIgnored on CourseCalendar; when you return the calendar in other endpoints (batches) it's populated
  course?: Course;
}

export interface Batch {
  batchId: number;
  calendarId: number;
  batchName: string;
  createdOn?: string;
  isActive?: boolean;
  modifiedBy?: string;
  calendar?: CourseCalendar & { course?: Course };
}

export interface EnrollmentDto {
  enrollmentId: number;
  employeeName: string;
  courseName: string;
  batchId:number;
  batchName: string;
  status: string;
  approvedBy?: string | null;
}

export interface FeedbackCreateDto {
  feedbackText?: string;
  rating: number;
}
