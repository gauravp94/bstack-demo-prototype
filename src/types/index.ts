// User types
export type UserRole = 'dev' | 'design' | 'pm';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

// PRD types
export type PRDStatus = 'draft' | 'in_review' | 'approved';

export interface PRD {
  id: number;
  title: string;
  content: string;
  version: number;
  status: PRDStatus;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  creator?: User;
  commentCounts?: {
    red: number;
    yellow: number;
    green: number;
    total: number;
  };
  hasApproved?: boolean;
  lastReadVersion?: number;
  currentUserApproval?: boolean;
}

export interface PRDVersion {
  id: number;
  prdId: number;
  version: number;
  content: string;
  changedBy: number;
  createdAt: Date;
  changer?: User;
}

// Comment types
export type CommentCategory = 'red' | 'yellow' | 'green';

export interface Comment {
  id: number;
  prdId: number;
  userId: number;
  parentId?: number | null;
  lineNumber?: number | null;
  sectionId?: string | null;
  selectedText?: string | null;
  scrollPosition?: number | null;
  content: string;
  category: CommentCategory;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  replies?: Comment[];
}

export interface CommentInput {
  content: string;
  category: CommentCategory;
  parentId?: number;
  sectionId?: string;
  selectedText?: string;
  scrollPosition?: number;
  lineNumber?: number;
}

// Approval types
export interface Approval {
  id: number;
  prdId: number;
  userId: number;
  approvedAt: Date;
  user?: User;
}

// Reading log types
export interface ReadingLog {
  id: number;
  prdId: number;
  userId: number;
  versionRead: number;
  timeSpent: number;
  lastReadAt: Date;
  isReading: boolean;
}

// Diff types
export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffSection {
  lines: DiffLine[];
  hasChanges: boolean;
}

// AI response types
export interface AIRephraseResponse {
  original: string;
  rephrased: string;
  success: boolean;
}

export interface SOPCheckResponse {
  isActionable: boolean;
  suggestions: string[];
  score: number;
  feedback: string;
}

export interface AISummaryResponse {
  summary: string;
  bulletPoints: string[];
}

export interface AISuggestedReply {
  suggestions: string[];
  context: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Session types
export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}
