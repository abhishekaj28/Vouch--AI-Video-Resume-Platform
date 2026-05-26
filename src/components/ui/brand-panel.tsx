"use client"

import { Briefcase, Users, TrendingUp, Sparkles } from "lucide-react"

export function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-card relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-12 w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">Vouch</span>
        </div>

        {/* Main content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground leading-tight text-balance">
              Hire smarter.
              <br />
              <span className="text-primary">Build faster.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
              The intelligent hiring platform that connects exceptional talent with world-class opportunities.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="10K+"
              description="Active candidates"
            />
            <FeatureCard
              icon={<Briefcase className="w-5 h-5" />}
              title="500+"
              description="Companies hiring"
            />
            <FeatureCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="95%"
              description="Match accuracy"
            />
            <FeatureCard
              icon={<Sparkles className="w-5 h-5" />}
              title="AI-Powered"
              description="Smart matching"
            />
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-secondary/50 rounded-xl p-6 border border-border">
          <p className="text-foreground text-sm leading-relaxed mb-4">
            {`"Vouch transformed our hiring process. We reduced time-to-hire by 60% and found candidates that truly fit our culture."`}
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <span className="text-accent-foreground text-sm font-medium">SK</span>
            </div>
            <div>
              <p className="text-foreground text-sm font-medium">Sarah Kim</p>
              <p className="text-muted-foreground text-xs">VP of People, TechCorp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="bg-secondary/30 border border-border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
      <div className="text-primary mb-2">{icon}</div>
      <p className="text-foreground font-semibold">{title}</p>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
