
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { BookOpen, FileText, Clock, BarChart, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const features = [
  {
    icon: <FileText className="h-6 w-6 text-study-600 dark:text-primary" />,
    title: "Upload or Paste Text",
    description:
      "Easily upload PDFs, Word documents, or paste text directly into the application.",
  },
  {
    icon: <BarChart className="h-6 w-6 text-study-600 dark:text-primary" />,
    title: "Customizable Summaries",
    description:
      "Choose between short, medium, long, or custom length summaries to fit your needs.",
  },
  {
    icon: <Clock className="h-6 w-6 text-study-600 dark:text-primary" />,
    title: "Save Time",
    description:
      "Quickly extract key information from lengthy academic papers and study materials.",
  },
];

const benefits = [
  "Improve comprehension of complex texts",
  "Focus your study time on what matters most",
  "Create concise notes for review and memorization",
  "Track your summary history for easy reference",
  "Generate summaries in seconds, not hours",
];

const Index = () => {
  const { theme } = useTheme();
  
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                AI-Powered Text Summarizer for Students
              </h1>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Transform lengthy papers and study materials into concise, easy-to-understand summaries with our intelligent AI summarizer.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/summarize">Start Summarizing</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="glass rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground">Research Paper</h3>
                      <p className="text-sm text-muted-foreground">12 pages, 4500 words</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-muted rounded-full" />
                    <div className="h-2 bg-muted rounded-full w-5/6" />
                    <div className="h-2 bg-muted rounded-full" />
                    <div className="h-2 bg-muted rounded-full w-4/6" />
                  </div>
                  <div className="mt-6 rounded-lg glass-hover p-4">
                    <h4 className="font-medium text-primary mb-2">Summary:</h4>
                    <div className="space-y-2">
                      <div className="h-2 bg-primary/10 rounded-full" />
                      <div className="h-2 bg-primary/10 rounded-full w-5/6" />
                      <div className="h-2 bg-primary/10 rounded-full w-4/6" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-xl bg-secondary/30 -z-10" />
                <div className="absolute -top-6 -left-6 h-16 w-16 rounded-xl bg-primary/20 -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter text-foreground">How StudyScribe Works</h2>
            <p className="text-muted-foreground mt-2 md:text-lg/relaxed">
              Effortlessly condense complex texts into clear, digestible summaries
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center glass p-6 rounded-xl shadow-sm"
              >
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-xl mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter text-foreground">
                Why Students Trust StudyScribe
              </h2>
              <p className="text-muted-foreground md:text-lg/relaxed">
                Our AI summarizer is designed specifically for academic content, helping students save time and improve understanding.
              </p>
              <ul className="space-y-2">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 dark:text-green-400" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/summarize">Try it now</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md glass rounded-2xl p-8 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="glass-hover rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium mb-2 text-foreground">Original Text</h4>
                    <div className="space-y-1">
                      <div className="h-2 bg-muted rounded-full" />
                      <div className="h-2 bg-muted rounded-full w-5/6" />
                      <div className="h-2 bg-muted rounded-full" />
                      <div className="h-2 bg-muted rounded-full w-4/6" />
                      <div className="h-2 bg-muted rounded-full" />
                      <div className="h-2 bg-muted rounded-full w-5/6" />
                    </div>
                  </div>
                  <div className="text-center font-medium text-primary">
                    <div className="flex items-center justify-center">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-primary">AI Summary</h4>
                    <div className="space-y-1">
                      <div className="h-2 bg-primary/20 rounded-full" />
                      <div className="h-2 bg-primary/20 rounded-full w-4/6" />
                      <div className="h-2 bg-primary/20 rounded-full w-5/6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter text-primary-foreground">
              Ready to transform how you study?
            </h2>
            <p className="text-primary-foreground/80 md:text-lg/relaxed mx-auto max-w-2xl">
              Join thousands of students who are saving time and improving comprehension with StudyScribe's AI summarization.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild variant="secondary">
                <Link to="/register">Get Started for Free</Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                <Link to="/summarize">Try Without Signing Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
