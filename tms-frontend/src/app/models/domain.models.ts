export interface Course {
  courseId: number;
  courseName: string;
  description?: string;
  durationDays?: number;
  createdOn?: string;
   calendars?: CourseCalendar[];
}

export interface CourseCalendar {
  calendarId: number;
  courseId: number;
  startDate: string;
  endDate: string;
  // backend currently marks Course as JsonIgnored on CourseCalendar; when you return the calendar in other endpoints (batches) it's populated
  course?: Course;
  batches?: Batch[];
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
export interface FeedbackReadDto {
  feedbackId: number;
  batchId: number;
  username: string;
  rating: number;
  feedbackText: string;
}