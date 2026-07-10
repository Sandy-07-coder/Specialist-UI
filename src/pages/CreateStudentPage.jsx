import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, User, FileText, Calendar, Lock, Mail, Users, Copy, Check, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentStore } from '@/store/useStudentStore';
import { useAuthStore } from '@/store';

export function CreateStudentPage() {
  const navigate = useNavigate();
  const { addStudent, isAdding } = useStudentStore();
  const { token } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    parentName: '',
    email: '',
    dob: '',
    gender: '',
    diagnosis: '',
    notes: '',
  });

  const [previewCredentials, setPreviewCredentials] = useState({ username: '', password: '' });
  const [copiedField, setCopiedField] = useState(null);   // 'username' | 'password'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); // { username, defaultPassword }

  // Live-preview the auto-generated credentials as the specialist types
  useEffect(() => {
    const studentFirst = formData.firstName.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const parentFirst  = formData.parentName.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'parent';
    const username     = studentFirst && `${studentFirst}_${parentFirst}`;

    let password = '';
    if (formData.firstName && formData.dob) {
      const year     = formData.dob.split('-')[0] || '????';
      const namePart = studentFirst.slice(0, 4).padEnd(4, '0');
      password       = `${namePart}${year}`;
    }

    setPreviewCredentials({ username: username || '', password });
  }, [formData.firstName, formData.parentName, formData.dob]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return setError('First and last name are required.');
    }
    if (!formData.dob) return setError('Date of birth is required.');
    if (!formData.gender) return setError('Gender is required.');
    if (!formData.diagnosis.trim()) return setError('Primary diagnosis is required.');

    // Format DOB as dd/mm/yyyy for the API
    const [year, month, day] = formData.dob.split('-');
    const dobFormatted = `${day}/${month}/${year}`;

    const payload = {
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      parentName: formData.parentName.trim(),
      email: formData.email.trim(),
      dob: dobFormatted,
      gender: formData.gender,
      diagnosis: formData.diagnosis.trim(),
      notes: formData.notes.trim(),
    };

    const result = await addStudent(token, payload);

    if (!result.success) {
      setError(result.error || 'Failed to create student.');
      return;
    }

    // Show success banner with the credentials that were auto-generated
    setSuccess({
      username:        result.username        || result.student?.username,
      defaultPassword: result.defaultPassword || '—',
    });
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-xl mx-auto py-8">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Student Created!</h2>
          <p className="text-muted-foreground text-sm">
            Share these auto-generated credentials with the student or parent/guardian.
            The password can be changed later from the student's profile page.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-left">
            {/* Username */}
            <div className="bg-white dark:bg-gray-800 border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Username</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono font-bold text-foreground text-sm">{success.username}</p>
                <button onClick={() => copyToClipboard(success.username, 'username')} className="text-muted-foreground hover:text-primary transition-colors">
                  {copiedField === 'username' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="bg-white dark:bg-gray-800 border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Default Password</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono font-bold text-foreground text-sm">{success.defaultPassword}</p>
                <button onClick={() => copyToClipboard(success.defaultPassword, 'password')} className="text-muted-foreground hover:text-primary transition-colors">
                  {copiedField === 'password' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate('/students')}>
            Back to Students
          </Button>
          <Button onClick={() => { setSuccess(null); setFormData({ firstName:'', lastName:'', parentName:'', email:'', dob:'', gender:'', diagnosis:'', notes:'' }); }}>
            Add Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-fit bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Add Student</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Credentials are auto-generated and can be customised after creation.
          </p>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <Card className="border-border bg-card text-card-foreground shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden transition-all duration-300">
          
          {/* ── General Information ──────────────────────────────────── */}
          <CardHeader className="border-b border-border bg-muted/50 pb-6">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" /> General Information
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Basic identification and clinical details.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">

            {/* Photo Upload */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/50 text-muted-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium text-center px-2">Upload Photo</span>
              </div>
              <div className="text-sm text-muted-foreground max-w-sm">
                <p className="font-medium text-foreground mb-1">Student Photo (Optional)</p>
                Upload a square image, ideally 256×256 in PNG or JPG format.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Student Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground">First Name <span className="text-red-500">*</span></Label>
                <Input id="firstName" name="firstName" required
                  value={formData.firstName} onChange={handleChange}
                  placeholder="e.g. Liam"
                  className="bg-muted border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground">Last Name <span className="text-red-500">*</span></Label>
                <Input id="lastName" name="lastName" required
                  value={formData.lastName} onChange={handleChange}
                  placeholder="e.g. Johnson"
                  className="bg-muted border-border text-foreground" />
              </div>

              {/* Parent / Guardian Name */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="parentName" className="text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Parent / Guardian Name <span className="text-red-500">*</span>
                </Label>
                <Input id="parentName" name="parentName" required
                  value={formData.parentName} onChange={handleChange}
                  placeholder="e.g. Sarah Johnson"
                  className="bg-muted border-border text-foreground" />
                <p className="text-xs text-muted-foreground">
                  Used to build the student's login username automatically.
                </p>
              </div>

              {/* DOB */}
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" /> Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input id="dob" name="dob" type="date" required
                  value={formData.dob} onChange={handleChange}
                  className="bg-muted border-border text-foreground [color-scheme:light] dark:[color-scheme:dark]" />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-foreground">Gender <span className="text-red-500">*</span></Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData(p => ({ ...p, gender: v }))}>
                  <SelectTrigger className="w-full bg-muted border-border text-foreground">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Diagnosis */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="diagnosis" className="text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" /> Primary Diagnosis <span className="text-red-500">*</span>
                </Label>
                <Input id="diagnosis" name="diagnosis" required
                  value={formData.diagnosis} onChange={handleChange}
                  placeholder="e.g. Autism Spectrum Disorder"
                  className="bg-muted border-border text-foreground" />
              </div>

              {/* Notes */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes" className="text-foreground">Initial Notes</Label>
                <textarea id="notes" name="notes" rows="3"
                  value={formData.notes} onChange={handleChange}
                  placeholder="Any preliminary observations or history..."
                  className="flex w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </CardContent>

          {/* ── Account Setup ────────────────────────────────────────── */}
          <div className="border-t border-border bg-muted/50 p-6 md:px-6 space-y-5">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-500" /> Account Setup
            </h3>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" /> Parent / Guardian Email
              </Label>
              <Input id="email" name="email" type="email"
                value={formData.email} onChange={handleChange}
                placeholder="e.g. parent@email.com"
                className="bg-muted border-border text-foreground max-w-md" />
            </div>

            {/* Live Preview of generated credentials */}
            {(previewCredentials.username || previewCredentials.password) && (
              <div className="rounded-xl border border-dashed border-border bg-background p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Auto-generated Credentials Preview
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {previewCredentials.username && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Username</p>
                      <p className="font-mono text-sm font-bold text-foreground bg-muted px-3 py-2 rounded-lg">
                        {previewCredentials.username}
                      </p>
                    </div>
                  )}
                  {previewCredentials.password && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Default Password</p>
                      <p className="font-mono text-sm font-bold text-foreground bg-muted px-3 py-2 rounded-lg">
                        {previewCredentials.password}
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pattern: <span className="font-medium">student_parent</span> for username · <span className="font-medium">first4chars + birth year</span> for password. Both editable after creation.
                </p>
              </div>
            )}
          </div>

          <CardFooter className="p-6 border-t border-border bg-muted flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="border-border text-foreground hover:bg-accent transition-colors">
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding} className="shadow-md shadow-primary/20 active:scale-[0.98] transition-all">
              {isAdding ? 'Creating…' : 'Create Student'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}