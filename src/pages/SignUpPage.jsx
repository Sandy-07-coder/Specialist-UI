import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";

const countryList = [
  { code: "US", flag: "🇺🇸", dialCode: "+1" },
  { code: "IN", flag: "🇮🇳", dialCode: "+91" },
  { code: "GB", flag: "🇬🇧", dialCode: "+44" },
  { code: "AU", flag: "🇦🇺", dialCode: "+61" },
  { code: "CA", flag: "🇨🇦", dialCode: "+1" },
];

export function SignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profileImage, setProfileImage] = useState(null);
  const [phoneDialCode, setPhoneDialCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const totalSteps = 4;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [experience, setExperience] = useState("");
  const [serviceDomain, setServiceDomain] = useState("");
  const [focusAreas, setFocusAreas] = useState([]);
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhoneNumber(val);
    
    // Auto-detect country code from input if they paste it
    for (const country of countryList) {
      if (val.startsWith(country.dialCode) && val !== country.dialCode && country.dialCode !== "+1") {
        setPhoneDialCode(country.dialCode);
        break;
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImage(url);
    }
  };

  const handleFocusAreaChange = (area) => {
    setFocusAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setError("");

    if (step === 1 && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      try {
        const fullPhone = `${phoneDialCode}${phoneNumber.replace(/^\+\d+/, '')}`;
        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            name,
            phone: fullPhone,
            institutionName,
            experience: Number(experience),
            serviceDomain,
            focusAreas
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/dashboard");
        } else {
          setError(data.message || "Registration failed");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred during registration. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <ThemeToggle />
      </div>
      {/* Horizontal Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Step {step} of {totalSteps}</span>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {step === 1 ? 'Account Details' : step === 2 ? 'Email Verification' : step === 3 ? 'Professional Info' : 'Assessment Setup'}
          </span>
        </div>
        <div className="w-full bg-white dark:bg-gray-800 rounded-full h-2.5 shadow-sm border border-gray-100 dark:border-gray-700 flex overflow-hidden">
          <div className={`h-full bg-indigo-600 transition-all duration-300 ${step === 1 ? 'w-1/4' : step === 2 ? 'w-2/4' : step === 3 ? 'w-3/4' : 'w-full'}`}></div>
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Create Account</CardTitle>
          <CardDescription className="text-center text-gray-500 dark:text-gray-400">
            {step === 1 && "Set up your login credentials"}
            {step === 2 && "Verify your email address"}
            {step === 3 && "Tell us about your professional background"}
            {step === 4 && "Configure your assessment tools"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleNext}>
          <CardContent className="space-y-4">
            {error && <div className="text-sm font-medium text-red-500 text-center">{error}</div>}
            
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="m@example.com" required className="dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 dark:text-gray-100">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-900 dark:text-gray-100">Confirm Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    We've sent a 6-digit verification code to your email.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-gray-900 dark:text-gray-100">Verification Code</Label>
                  <Input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} className="text-center tracking-[1em] font-mono text-lg dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100" required />
                </div>
                <div className="text-center">
                  <Button variant="link" type="button" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm">
                    Resend Code
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <div className="flex justify-center mb-6">
                  <div className="relative w-24 h-24">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <label htmlFor="photo-upload" className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full text-white cursor-pointer hover:bg-indigo-700 transition-colors shadow-sm">
                      <Camera className="w-4 h-4" />
                      <input 
                        id="photo-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-900 dark:text-gray-100">Full Name</Label>
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Doe" required className="dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-900 dark:text-gray-100">Phone Number</Label>
                  <div className="flex gap-2">
                    <Select value={phoneDialCode} onValueChange={(val) => {
                      setPhoneDialCode(val);
                      if (!phoneNumber.startsWith(val)) {
                        setPhoneNumber(val + (phoneNumber.replace(/^\+\d+/, '') || ''));
                      }
                    }}>
                      <SelectTrigger className="w-[100px] shrink-0 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
                        <SelectValue>
                          {countryList.find(c => c.dialCode === phoneDialCode)?.flag} {phoneDialCode}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
                        {countryList.map((country, idx) => (
                          <SelectItem key={`${country.code}-${idx}`} value={country.dialCode} className="flex items-center gap-2">
                            <span className="mr-2">{country.flag}</span> {country.code} ({country.dialCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="(555) 000-0000" 
                      required 
                      className="flex-1 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inst-name" className="text-gray-900 dark:text-gray-100">Institution/Clinic Name</Label>
                  <Input id="inst-name" type="text" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} placeholder="Health Center" required className="dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-gray-900 dark:text-gray-100">Years of Experience</Label>
                  <Input id="experience" type="number" min="0" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="5" required className="dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-gray-100">Service Domain</Label>
                  <Select required value={serviceDomain} onValueChange={setServiceDomain}>
                    <SelectTrigger className="dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
                      <SelectValue placeholder="Select a domain" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
                      <SelectItem value="early-intervention">Early Intervention</SelectItem>
                      <SelectItem value="academic-intervention">Academic Intervention</SelectItem>
                      <SelectItem value="vocational-support">Vocational Support</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <div className="space-y-4">
                  <Label className="text-base text-gray-900 dark:text-gray-100">Focus Assessment Areas</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Select the primary methods you use for evaluation.</p>
                  
                  <div className="grid gap-3">
                    <label className="flex items-start space-x-3 p-3 border dark:border-gray-800 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <input type="checkbox" checked={focusAreas.includes("Autism")} onChange={() => handleFocusAreaChange("Autism")} className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-600" />
                      <div>
                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Autism Spectrum Assessment tools</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">Social communication & behavior observation</span>
                      </div>
                    </label>
                    <label className="flex items-start space-x-3 p-3 border dark:border-gray-800 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <input type="checkbox" checked={focusAreas.includes("ADHD")} onChange={() => handleFocusAreaChange("ADHD")} className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-600" />
                      <div>
                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">ADHD Evaluation Protocol</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">Attention, hyperactivity, and executive function</span>
                      </div>
                    </label>
                    <label className="flex items-start space-x-3 p-3 border dark:border-gray-800 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <input type="checkbox" checked={focusAreas.includes("Cognitive")} onChange={() => handleFocusAreaChange("Cognitive")} className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-600" />
                      <div>
                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Cognitive & Developmental</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">Standardized developmental milestones</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex w-full gap-3">
              {step > 1 && (
                <Button type="button" variant="outline" className="w-full dark:bg-transparent dark:border-gray-700 dark:text-gray-100" onClick={handleBack} disabled={isLoading}>
                  Back
                </Button>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Please wait..." : (step === totalSteps ? "Create Account" : "Next")}
              </Button>
            </div>
            
            {step === 1 && (
              <div className="text-sm text-center text-gray-500 dark:text-gray-400 w-full">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                  Sign in
                </Link>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}