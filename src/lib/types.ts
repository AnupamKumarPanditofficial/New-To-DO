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
