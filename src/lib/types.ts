export interface User {
  id: string;
  name: string;
  faceDataUri: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  dueDate: string; // ISO string
  isCompleted: boolean;
}

export interface CollabMember {
    id: string;
    name: string;
    tasks: Task[];
}

export interface CollabGroup {
    id: string;
    members: CollabMember[];
    purpose?: 'normal' | 'exams';
    examName?: string;
    examDuration?: 30 | 60 | 90 | 120;
}

export interface Purpose {
  type: 'normal' | 'exams';
  examName?: string;
  examDuration?: 30 | 60 | 90 | 120;
}
