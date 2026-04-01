import React from "react";
import { 
  Building, 
  Briefcase, 
  Award, 
  BookOpen, 
  ClipboardCheck, 
  GraduationCap 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function ProfilePage() {
  const profile = {
    name: "Alex Johnson",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher",
    domain: "Special Educator",
    institution: "Sunrise Inclusive Academy",
    experience: "8 years",
    serviceDomains: [
      "Early Intervention",
      "Academic Intervention",
      "Vocational Support"
    ],
    assessmentMethods: [] // Intentionally empty as requested
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Specialist Portfolio
        </h1>
        <p className="text-muted-foreground mt-2">
          Your professional snapshot
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Left Column - Essential Info */}
        <Card className="col-span-1 border-border bg-card text-card-foreground shadow-sm flex flex-col items-center p-6 text-center">
          <div className="w-32 h-32 rounded-full border-4 border-border shadow-sm overflow-hidden mb-5">
            <img
              src={profile.photo}
              alt={profile.name}
              className="w-full h-full object-cover bg-muted"
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
          <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary">
            {profile.domain}
          </Badge>

          <Separator className="my-6 w-full" />

          <div className="w-full space-y-4 text-left">
            <div className="flex items-center gap-3 text-foreground">
              <Building className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Institution</p>
                <p className="text-sm font-medium">{profile.institution}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="text-sm font-medium">{profile.experience}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column - Domains & Assessments */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          
          {/* Service Domains */}
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <Award className="w-5 h-5 text-indigo-500" /> 
                Service Domains
              </CardTitle>
              <CardDescription>Areas of expertise and intervention.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {profile.serviceDomains.map((domain, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-md border border-indigo-100 dark:border-indigo-800/50 text-sm font-medium">
                    <BookOpen className="w-4 h-4" />
                    {domain}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Methods */}
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <ClipboardCheck className="w-5 h-5 text-emerald-500" /> 
                Assessment Methods
              </CardTitle>
              <CardDescription>Preferred evaluation and diagnostic tools.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {profile.assessmentMethods.length > 0 ? (
                <ul className="space-y-2">
                  {profile.assessmentMethods.map((method, idx) => (
                    <li key={idx} className="text-sm text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      {method}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/50">
                  <GraduationCap className="w-8 h-8 mb-2 opacity-50 text-muted-foreground" />
                  <p className="text-sm italic">No assessment methods currently specified.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
