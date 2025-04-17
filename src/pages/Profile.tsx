
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, MapPin, Phone, Globe, CheckCircle2, AlertCircle } from "lucide-react";
import { ApiKeyInput } from "@/components/ApiKeyInput";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
      location: user?.location || "",
      phone: user?.phone || "",
      website: user?.website || "",
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await updateProfile(values);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (!user) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-lg">Please log in to view your profile.</p>
        </div>
      </MainLayout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* User Info Card */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profilePicture} />
                  <AvatarFallback className="bg-indigo-600 dark:bg-indigo-800 text-white text-xl">
                    {getInitials(user.name || user.email)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{user.name || user.email.split('@')[0]}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="mt-2">
                {user.isVerified ? (
                  <Badge className="bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100 gap-1">
                    <CheckCircle2 size={14} />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-100 gap-1">
                    <AlertCircle size={14} />
                    Unverified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                {user.bio && (
                  <div className="text-center text-muted-foreground dark:text-gray-300">
                    {user.bio}
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                    <User size={16} />
                    <span>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  
                  {user.location && (
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                      <MapPin size={16} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  
                  {user.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                      <Phone size={16} />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  
                  {user.website && (
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                      <Globe size={16} />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        {user.website.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Settings Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="profile">
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details and public profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="City, Country" />
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
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input {...field} type="tel" placeholder="+1 (555) 123-4567" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://yourwebsite.com" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        
                          <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Tell us about yourself"
                                    className="resize-none h-24"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="api-keys">
                <ApiKeyInput />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
