import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, User, FileText, Calendar, Building, Lock, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CreateStudentPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    diagnosis: '',
    supportLevel: 'Low',
    assessmentTest: '',
    assignedSpecialist: '',
    notes: '',
    email: '',
    password: ''
  });

  const [passwordEdited, setPasswordEdited] = useState(false);

  // Auto-generate password based on first name and DOB year if untouched
  useEffect(() => {
    if (!passwordEdited && formData.firstName) {
      let year = '2026';
      if (formData.dob) {
        year = formData.dob.split('-')[0];
      }
      setFormData(prev => ({
        ...prev,
        password: `${prev.firstName.toLowerCase().replace(/\s+/g, '')}${year}`
      }));
    }
  }, [formData.firstName, formData.dob, passwordEdited]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordEdited(true);
    handleChange(e);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call to create student account
    console.log("Creating new student account:", formData);
    navigate('/students'); // go back after creation
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="w-fit text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            Add New Student
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
            Create an account and set up the profile for a new patient/student.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-4xl max-w-full">
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 pb-6">
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> General Information
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Basic identification and medical details.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Photo Upload Area */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium text-center px-2">Upload Photo</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Student Photo (Optional)</p>
                Upload a square image, ideally 256x256 in PNG or JPG format.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="firstName" name="firstName" required
                  value={formData.firstName} onChange={handleChange}
                  placeholder="e.g. Liam"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="lastName" name="lastName" required
                  value={formData.lastName} onChange={handleChange}
                  placeholder="e.g. Johnson"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" /> Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="dob" name="dob" type="date" required
                  value={formData.dob} onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" /> Primary Diagnosis
                </Label>
                <Input 
                  id="diagnosis" name="diagnosis" 
                  value={formData.diagnosis} onChange={handleChange}
                  placeholder="e.g. Autism Spectrum Disorder"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportLevel" className="text-gray-700 dark:text-gray-300">Support Level</Label>
                <Select
                  value={formData.supportLevel}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, supportLevel: value }))}
                >
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessmentTest" className="text-gray-700 dark:text-gray-300">Assessment Test</Label>
                <Input 
                  id="assessmentTest" name="assessmentTest" 
                  value={formData.assessmentTest} onChange={handleChange}
                  placeholder="e.g. ADOS-2"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100" 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="assignedSpecialist" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" /> Assigned Specialist
                </Label>
                <Input 
                  id="assignedSpecialist" name="assignedSpecialist" 
                  value={formData.assignedSpecialist} onChange={handleChange}
                  placeholder="e.g. Dr. Sarah Lee"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100" 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">Initial Notes</Label>
                <textarea 
                  id="notes" name="notes" rows="3"
                  value={formData.notes} onChange={handleChange}
                  placeholder="Any preliminary observations or history..."
                  className="flex w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                ></textarea>
              </div>
            </div>
          </CardContent>

          {/* Account Creation Section */}
          <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 p-6 md:px-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-500" /> Account Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" /> Parent / Guardian Email <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="email" name="email" type="email" required
                  value={formData.email} onChange={handleChange}
                  placeholder="e.g. parent@email.com"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Initial Password</Label>
                <Input 
                  id="password" name="password" required
                  value={formData.password} onChange={handlePasswordChange}
                  placeholder={formData.firstName ? "Auto-generated" : "First Name + Birth Year (e.g. liam2019)"}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100" 
                />
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Default format: First Name + Birth Year (e.g. liam2019)
                </p>
              </div>
            </div>
          </div>

          <CardFooter className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Account
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}