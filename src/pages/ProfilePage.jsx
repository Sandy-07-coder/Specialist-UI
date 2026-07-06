import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building,
  Briefcase,
  Award,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Users,
  ListTodo,
  CheckSquare,
  Edit,
  Camera,
  Loader2,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { studentsData } from "@/data/students";
import { useUserStore, useAuthStore } from "@/store";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";

export function ProfilePage() {
  const { name } = useParams();
  const isPersonal = !name;

  // ── Store ─────────────────────────────────────────────────────────────────
  const {
    isProfileLoaded,
    isLoading,
    fetchProfile,
    updateProfile,
    uploadPhoto,
    getDisplayProfile,
  } = useUserStore();
  const token = useAuthStore((s) => s.token);
  const profileUrl = useUserStore((s) => s.profileUrl);

  const [isUploading, setIsUploading] = useState(false);

  // Fetch full profile on mount if it hasn't been loaded yet
  useEffect(() => {
    if (isPersonal && !isProfileLoaded && token) {
      fetchProfile(token);
    }
  }, [isPersonal, isProfileLoaded, token, fetchProfile]);

  // ── Derived profile data ───────────────────────────────────────────────────
  const storeProfile = getDisplayProfile();

  // For another specialist's page we still fall back to mock data
  const specialistName = isPersonal
    ? (storeProfile.name ?? "Specialist")
    : decodeURIComponent(name);

  // Local edit state (mirrors store for personal profile; isolated for others)
  const [editForm, setEditForm] = useState({
    name: "",
    domain: "",
    institution: "",
    experience: "",
    serviceDomains: "",
    assessmentMethods: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenEdit = () => {
    setEditForm({
      name: storeProfile.name ?? "",
      domain: storeProfile.serviceDomain ?? "",
      institution: storeProfile.institutionName ?? "",
      experience: storeProfile.experience ?? "",
      serviceDomains: (storeProfile.focusAreas ?? []).join(", "),
      assessmentMethods: "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    updateProfile({
      name: editForm.name,
      serviceDomain: editForm.domain,
      institutionName: editForm.institution,
      experience: editForm.experience,
      focusAreas: editForm.serviceDomains.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setIsModalOpen(false);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    await uploadPhoto(file, token);
    setIsUploading(false);
  };

  // ── Statistics ────────────────────────────────────────────────────────────
  const { assignedStudents, totalTasks, completedTasks } = useMemo(() => {
    const studentsAssigned = studentsData.filter((s) =>
      s.assigned_specialists.includes(specialistName)
    );
    let tTasks = 0;
    let cTasks = 0;
    studentsAssigned.forEach((student) => {
      if (student.tasks && Array.isArray(student.tasks)) {
        tTasks += student.tasks.length;
        cTasks += student.tasks.filter((t) => t.status === "Completed").length;
      }
    });
    return { assignedStudents: studentsAssigned.length, totalTasks: tTasks, completedTasks: cTasks };
  }, [specialistName]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isPersonal && isLoading && !isProfileLoaded) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Specialist Portfolio
        </h1>
        <p className="text-muted-foreground mt-2">
          {name ? `Professional profile of ${specialistName}` : "Your professional snapshot"}
        </p>
      </header>

      {/* ── Email verification warning (personal profile only) ── */}
      {isPersonal && <EmailVerificationBanner />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Left Column - Essential Info */}
        <Card className="col-span-1 border-border bg-card text-card-foreground shadow-sm flex flex-col items-center p-6 text-center relative">
          {isPersonal && (
            <Button onClick={handleOpenEdit} variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
              <Edit className="w-4 h-4" />
            </Button>
          )}
          <div className="relative w-32 h-32 rounded-full border-4 border-border shadow-sm overflow-hidden mb-5 group flex items-center justify-center bg-gray-200 dark:bg-gray-800">
            {profileUrl ? (
              <img src={profileUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            )}
            {isPersonal && (
              <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white z-10">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium tracking-wide">Edit</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={isUploading} />
              </label>
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground">{storeProfile.name ?? specialistName}</h2>
          <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary">
            {storeProfile.serviceDomain ?? "Specialist"}
          </Badge>

          <Separator className="my-6 w-full" />

          <div className="w-full space-y-4 text-left">
            <div className="flex items-center gap-3 text-foreground">
              <Building className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Institution</p>
                <p className="text-sm font-medium">{storeProfile.institutionName ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="text-sm font-medium">{storeProfile.experience ?? "—"}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column - Domains & Assessments */}
        <div className="col-span-1 md:col-span-2 space-y-6">

          {/* Key Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-border bg-card text-card-foreground shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{assignedStudents}</h3>
                <p className="text-xs text-muted-foreground mt-1">Assigned Students</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card text-card-foreground shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-3">
                  <ListTodo className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{totalTasks}</h3>
                <p className="text-xs text-muted-foreground mt-1">Total Tasks</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card text-card-foreground shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-3">
                  <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{completedTasks}</h3>
                <p className="text-xs text-muted-foreground mt-1">Completed Tasks</p>
              </CardContent>
            </Card>
          </div>

          {/* Service Domains */}
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1.5">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Award className="w-5 h-5 text-indigo-500" />
                  Focus Areas
                </CardTitle>
                <CardDescription>Areas of expertise and intervention.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {(storeProfile.focusAreas ?? []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {storeProfile.focusAreas.map((area, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-md border border-indigo-100 dark:border-indigo-800/50 text-sm font-medium">
                      <BookOpen className="w-4 h-4" />
                      {area}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/50">
                  <BookOpen className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm italic">No focus areas specified yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Domain Detail */}
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1.5">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <ClipboardCheck className="w-5 h-5 text-emerald-500" />
                  Service Domain
                </CardTitle>
                <CardDescription>Primary intervention category.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {storeProfile.serviceDomain ? (
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-3 py-2 rounded-md border border-emerald-100 dark:border-emerald-800/50 text-sm font-medium w-fit">
                  <ClipboardCheck className="w-4 h-4" />
                  {storeProfile.serviceDomain}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/50">
                  <GraduationCap className="w-8 h-8 mb-2 opacity-50 text-muted-foreground" />
                  <p className="text-sm italic">No service domain currently specified.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Profile Information</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 mt-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-foreground">Name</Label>
              <Input id="name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="col-span-3 text-gray-800 dark:text-gray-200" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="domain" className="text-right text-foreground">Domain</Label>
              <Input id="domain" value={editForm.domain} onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })} className="col-span-3 text-gray-800 dark:text-gray-200" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="institution" className="text-right text-foreground">Institution</Label>
              <Input id="institution" value={editForm.institution} onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })} className="col-span-3 text-gray-800 dark:text-gray-200" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experience" className="text-right text-foreground">Experience</Label>
              <Input id="experience" value={editForm.experience} onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })} className="col-span-3 text-gray-800 dark:text-gray-200" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serviceDomains" className="text-right text-foreground">Focus Areas</Label>
              <Input placeholder="Comma separated values" id="serviceDomains" value={editForm.serviceDomains} onChange={(e) => setEditForm({ ...editForm, serviceDomains: e.target.value })} className="col-span-3 text-foreground" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
