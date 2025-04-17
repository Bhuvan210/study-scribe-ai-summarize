
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  History,
  Calendar,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  Globe,
  Clock,
  Badge as BadgeIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  birthday: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  website: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// This simulates getting data from localStorage - in a real app, this would be from the backend
const getProfileData = (email: string): ProfileFormValues => {
  const storedData = localStorage.getItem(`profile_${email}`);
  return storedData 
    ? JSON.parse(storedData)
    : {
        name: "",
        bio: "",
        birthday: "",
        location: "",
        phone: "",
        occupation: "",
        education: "",
        website: "",
      };
};

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [joinDate] = useState(() => {
    // Simulate join date - in a real app, this would come from the user object
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  });

  const defaultValues = user ? getProfileData(user.email) : {} as ProfileFormValues;
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const onSubmit = (data: ProfileFormValues) => {
    if (user) {
      localStorage.setItem(`profile_${user.email}`, JSON.stringify(data));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      setIsEditing(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl py-8 px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            My Profile
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-lg mx-auto">
            Manage your account information and track your activity on StudyScribe
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Sidebar with avatar and stats */}
          <div>
            <Card className="mb-8 overflow-hidden border-0 shadow-lg">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-24" />
              <div className="px-6 pb-6 relative">
                <div className="absolute -mt-12 flex justify-center left-0 right-0">
                  <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md">
                    <div className="h-full w-full overflow-hidden rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                      <User className="h-12 w-12 text-indigo-500" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
                
                <div className="mt-16 text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {defaultValues.name || user?.email?.split('@')[0] || "User"}
                  </h2>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  
                  <div className="mt-2 flex justify-center">
                    <Badge variant="outline" className="text-xs flex items-center border-indigo-200 text-indigo-700 bg-indigo-50">
                      <BadgeIcon className="h-3 w-3 mr-1" />
                      Active User
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">Joined</span>
                  </div>
                  <span className="text-sm font-medium">{joinDate}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500">
                    <History className="h-4 w-4 mr-2" />
                    <span className="text-sm">Summaries</span>
                  </div>
                  <Badge className="bg-indigo-500">3</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">Last active</span>
                  </div>
                  <span className="text-sm font-medium">Today</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/summaries">
                    <History className="h-4 w-4 mr-2" />
                    View My Summaries
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Profile information */}
          <Card className="md:col-span-2 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </div>
              
              {!isEditing && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  Edit Profile
                </Button>
              )}
            </CardHeader>
            
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="birthday"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Birthday</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us a bit about yourself" 
                              className="resize-none" 
                              rows={3} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="San Francisco, CA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Occupation</FormLabel>
                            <FormControl>
                              <Input placeholder="Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Education</FormLabel>
                            <FormControl>
                              <Input placeholder="Stanford University" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-6">
                  {defaultValues.bio && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
                      <p className="text-gray-800">{defaultValues.bio}</p>
                    </div>
                  )}
                  
                  <div className="grid gap-6 sm:grid-cols-2">
                    {defaultValues.name && (
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-3 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Full name</p>
                          <p className="text-gray-800">{defaultValues.name}</p>
                        </div>
                      </div>
                    )}
                    
                    {defaultValues.birthday && (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Birthday</p>
                          <p className="text-gray-800">{defaultValues.birthday}</p>
                        </div>
                      </div>
                    )}
                    
                    {defaultValues.location && (
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="text-gray-800">{defaultValues.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {defaultValues.phone && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-3 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="text-gray-800">{defaultValues.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {defaultValues.occupation && (
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-3 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Occupation</p>
                          <p className="text-gray-800">{defaultValues.occupation}</p>
                        </div>
                      </div>
                    )}
                    
                    {defaultValues.education && (
                      <div className="flex items-center">
                        <GraduationCap className="h-5 w-5 mr-3 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Education</p>
                          <p className="text-gray-800">{defaultValues.education}</p>
                        </div>
                      </div>
                    )}
                    
                    {defaultValues.website && (
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 mr-3 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Website</p>
                          <a 
                            href={defaultValues.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline"
                          >
                            {defaultValues.website}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <BadgeIcon className="h-5 w-5 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Member status</p>
                        <Badge variant="secondary" className="mt-1 bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                          Active User
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
