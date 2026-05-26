import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 1. Fetch live jobs to map titles
    const { data: jobs } = await supabaseAdmin.from('jobs').select('*')
    const jobsMap = new Map(jobs?.map(j => [j.id, j]) || [])

    // 2. Fetch live applications with profiles & video resumes
    const { data: dbApps, error: appErr } = await supabaseAdmin
      .from('applications')
      .select('*, profiles(*), video_resumes(*)')
      .order('created_at', { ascending: false })

    if (appErr) throw appErr

    // 3. Fetch all completed video resumes to show in the general candidate pool
    const { data: dbResumes, error: resumeErr } = await supabaseAdmin
      .from('video_resumes')
      .select('*, profiles:candidate_id(*)')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (resumeErr) throw resumeErr

    const candidatesList: any[] = []
    const processedCandidateIds = new Set<string>()

    // First, process actual job applications
    if (dbApps && dbApps.length > 0) {
      dbApps.forEach((app: any) => {
        if (!app.video_resumes) return
        
        candidatesList.push({
          id: app.video_resume_id || app.id,
          applicationId: app.id,
          candidate_id: app.candidate_id,
          profiles: app.profiles,
          ...app.video_resumes,
          pipelineStatus: app.stage ? (app.stage[0].toUpperCase() + app.stage.slice(1)) : 'Applied',
          jobTitle: jobsMap.get(app.job_id)?.title || 'Frontend Engineer',
          jobId: app.job_id
        })
        processedCandidateIds.add(app.candidate_id)
      })
    }

    // Next, add general completed resumes to the pool
    if (dbResumes && dbResumes.length > 0) {
      dbResumes.forEach((resume: any) => {
        if (processedCandidateIds.has(resume.candidate_id)) return
        
        candidatesList.push({
          id: resume.id,
          applicationId: null,
          candidate_id: resume.candidate_id,
          profiles: resume.profiles,
          ...resume,
          pipelineStatus: 'Applied',
          jobTitle: 'General Talent Pool',
          jobId: null
        })
        processedCandidateIds.add(resume.candidate_id)
      })
    }

    return NextResponse.json(candidatesList)

  } catch (error: any) {
    console.error('Secure recruiter candidates fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
