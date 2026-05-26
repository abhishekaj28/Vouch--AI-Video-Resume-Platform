export type UserRole = 'candidate' | 'recruiter'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface VideoResume {
  id: string
  candidate_id: string
  video_url: string
  transcript?: string
  ai_summary?: string
  communication_score?: number
  confidence_score?: number
  clarity_score?: number
  technical_score?: number
  overall_score?: number
  skills?: string[]
  status: 'processing' | 'completed' | 'failed'
  created_at: string
  profiles?: Profile
}

export interface Job {
  id: string
  recruiter_id: string
  title: string
  company: string
  location?: string
  description?: string
  required_skills?: string[]
  created_at: string
}

export interface Application {
  id: string
  candidate_id: string
  job_id: string
  video_resume_id: string
  stage: 'applied' | 'reviewed' | 'interview' | 'hired' | 'rejected'
  created_at: string
  profiles?: Profile
  jobs?: Job
  video_resumes?: VideoResume
}