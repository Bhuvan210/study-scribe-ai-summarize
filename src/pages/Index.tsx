
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { BookOpen, FileText, Clock, BarChart, Check } from "lucide-react";

const features = [
  {
    icon: <FileText className="h-6 w-6 text-study-600" />,
    title: "Upload or Paste Text",
    description:
      "Easily upload PDFs, Word documents, or paste text directly into the application.",
  },
  {
    icon: <BarChart className="h-6 w-6 text-study-600" />,
    title: "Customizable Summaries",
    description:
      "Choose between short, medium, long, or custom length summaries to fit your needs.",
  },
  {
    icon: <Clock className="h-6 w-6 text-study-600" />,
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
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                AI-Powered Text Summarizer for Students
              </h1>
              <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Transform lengthy papers and study materials into concise, easy-to-understand summaries with our intelligent AI summarizer.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild className="bg-study-600 hover:bg-study-700">
                  <Link to="/summarize">Start Summarizing</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="bg-study-50 rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-study-100 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-study-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Research Paper</h3>
                      <p className="text-sm text-gray-500">12 pages, 4500 words</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-study-100 rounded-full" />
                    <div className="h-2 bg-study-100 rounded-full w-5/6" />
                    <div className="h-2 bg-study-100 rounded-full" />
                    <div className="h-2 bg-study-100 rounded-full w-4/6" />
                  </div>
                  <div className="mt-6 rounded-lg bg-white p-4">
                    <h4 className="font-medium text-study-700 mb-2">Summary:</h4>
                    <div className="space-y-2">
                      <div className="h-2 bg-study-50 rounded-full" />
                      <div className="h-2 bg-study-50 rounded-full w-5/6" />
                      <div className="h-2 bg-study-50 rounded-full w-4/6" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-xl bg-study-100 -z-10" />
                <div className="absolute -top-6 -left-6 h-16 w-16 rounded-xl bg-study-200 -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter">How StudyScribe Works</h2>
            <p className="text-gray-500 mt-2 md:text-lg/relaxed">
              Effortlessly condense complex texts into clear, digestible summaries
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow-sm"
              >
                <div className="rounded-full bg-study-100 p-3 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">
                Why Students Trust StudyScribe
              </h2>
              <p className="text-gray-500 md:text-lg/relaxed">
                Our AI summarizer is designed specifically for academic content, helping students save time and improve understanding.
              </p>
              <ul className="space-y-2">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Button asChild className="bg-study-600 hover:bg-study-700">
                  <Link to="/summarize">Try it now</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md bg-gradient-to-b from-study-50 to-gray-50 rounded-2xl p-8 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium mb-2 text-gray-800">Original Text</h4>
                    <div className="space-y-1">
                      <div className="h-2 bg-gray-100 rounded-full" />
                      <div className="h-2 bg-gray-100 rounded-full w-5/6" />
                      <div className="h-2 bg-gray-100 rounded-full" />
                      <div className="h-2 bg-gray-100 rounded-full w-4/6" />
                      <div className="h-2 bg-gray-100 rounded-full" />
                      <div className="h-2 bg-gray-100 rounded-full w-5/6" />
                    </div>
                  </div>
                  <div className="text-center font-medium text-study-600">
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
                  <div className="bg-study-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-study-800">AI Summary</h4>
                    <div className="space-y-1">
                      <div className="h-2 bg-study-100 rounded-full" />
                      <div className="h-2 bg-study-100 rounded-full w-4/6" />
                      <div className="h-2 bg-study-100 rounded-full w-5/6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-study-600 py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter text-white">
              Ready to transform how you study?
            </h2>
            <p className="text-study-100 md:text-lg/relaxed mx-auto max-w-2xl">
              Join thousands of students who are saving time and improving comprehension with StudyScribe's AI summarization.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild variant="secondary">
                <Link to="/register">Get Started for Free</Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent text-white border-white hover:text-study-600 hover:bg-white">
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
