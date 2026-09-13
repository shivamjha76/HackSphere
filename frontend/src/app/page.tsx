"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Activity,
  CheckCircle2,
  Sparkles,
  Search,
  Plus,
  Trophy,
  Users,
  Calendar,
  Layers,
  Award,
} from "lucide-react";

interface HealthData {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function checkBackend() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${apiUrl}/health`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setHealth(data);
      } catch (err: any) {
        setError(err.message || "Could not reach backend");
      } finally {
        setLoading(false);
      }
    }

    checkBackend();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Navigation Preview */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <BrandLogo variant="full" />
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <span className="text-blue-600 font-semibold cursor-pointer">Explore</span>
            <span className="hover:text-slate-900 cursor-pointer">Organizations</span>
            <span className="hover:text-slate-900 cursor-pointer">How It Works</span>
            <span className="hover:text-slate-900 cursor-pointer">Prizes</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 ring-1 ring-blue-500/20">
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <p className="font-semibold text-slate-800">Shivam Jha</p>
                <p className="text-slate-500">Level 3 • 1250 XP</p>
              </div>
            </div>
            <Button size="sm" variant="default">Sign Up</Button>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        {/* Banner Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Step 4 Complete: Design System & shadcn/ui Primitives Ready</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            HackSphere Component Library
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Atomic components configured matching the 59 screens design specifications.
          </p>
        </div>

        {/* Backend Connectivity Status Bar */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">FastAPI Backend Status</p>
              <p className="text-xs text-slate-500">Target: <code>http://localhost:8000/api/v1/health</code></p>
            </div>
          </div>
          <div>
            {loading ? (
              <Badge variant="outline">Connecting...</Badge>
            ) : error ? (
              <Badge variant="warning">Backend Offline (Run <code>python run.py</code>)</Badge>
            ) : (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Online (v{health?.version})
              </Badge>
            )}
          </div>
        </div>

        {/* Interactive Primitives Showcase */}
        <Tabs defaultValue="cards" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="cards">Cards & Badges</TabsTrigger>
              <TabsTrigger value="buttons">Buttons & Dialogs</TabsTrigger>
              <TabsTrigger value="forms">Inputs & Search</TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Cards & Badges */}
          <TabsContent value="cards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Event Card Sample */}
              <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-4 flex flex-col justify-between text-white">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="bg-white/90 text-slate-900 font-bold">
                      Online
                    </Badge>
                    <Badge variant="success">Registration Open</Badge>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-tight">AI Hack Summit 2026</h4>
                    <p className="text-xs text-blue-100">By TechNova Labs</p>
                  </div>
                </div>
                <CardContent className="p-5 space-y-4">
                  <p className="text-xs text-slate-600 line-clamp-2">
                    Build innovative AI and Machine Learning solutions solving real-world challenges.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>₹50,000 Pool</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>2-4 Members</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0 flex gap-2">
                  <Button size="sm" variant="default" className="w-full">Register Now</Button>
                  <Button size="sm" variant="outline">Details</Button>
                </CardFooter>
              </Card>

              {/* Team Card Sample */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">CodeCrafters</CardTitle>
                    <Badge variant="brand">Shortlisted</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Project: SmartAssist AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-600">
                  <p>AI-powered assistant for smarter task management and team workflows.</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <div className="flex -space-x-1.5">
                      <Avatar className="h-6 w-6 border-2 border-white"><AvatarFallback>A</AvatarFallback></Avatar>
                      <Avatar className="h-6 w-6 border-2 border-white"><AvatarFallback>R</AvatarFallback></Avatar>
                      <Avatar className="h-6 w-6 border-2 border-white"><AvatarFallback>S</AvatarFallback></Avatar>
                    </div>
                    <span className="text-slate-400 font-medium">3 Members</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button size="sm" variant="outline" className="w-full">View Submission</Button>
                </CardFooter>
              </Card>

              {/* Status Badges Showcase */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Badges</CardTitle>
                  <CardDescription className="text-xs">All 6 state styles</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge variant="default">HackSphere Gradient</Badge>
                  <Badge variant="success">Registered</Badge>
                  <Badge variant="warning">Under Review</Badge>
                  <Badge variant="destructive">Disqualified</Badge>
                  <Badge variant="brand">Verified Org</Badge>
                  <Badge variant="outline">Draft Mode</Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Buttons & Dialogs */}
          <TabsContent value="buttons" className="space-y-6">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Button Variants & Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default">Primary Gradient</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large Action</Button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Modal Dialog Trigger</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Team Modal Demo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a New Team</DialogTitle>
                      <DialogDescription>
                        Give your team a unique name and invite your teammates.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-3">
                      <div className="space-y-1">
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input id="team-name" placeholder="e.g. CodeX Innovators" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="track">Hackathon Track</Label>
                        <Input id="track" placeholder="e.g. AI & Automation" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button variant="default" onClick={() => setIsDialogOpen(false)}>Create Team</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </TabsContent>

          {/* Tab 3: Forms & Inputs */}
          <TabsContent value="forms" className="space-y-6">
            <Card className="p-6 max-w-xl mx-auto space-y-4">
              <div className="space-y-1">
                <Label htmlFor="search-hackathons">Search Hackathons</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="search-hackathons" placeholder="Search by name, organization, or theme..." className="pl-9" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="Shivam" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Jha" />
                </div>
              </div>

              <Button className="w-full">Submit Form</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
