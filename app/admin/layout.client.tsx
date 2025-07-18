"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  Gift,
  Users,
  Menu,
  X,
  Settings,
  LogOut,
  User,
  MessageSquare,
<<<<<<< HEAD
=======
  BarChart3,
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";

const navigationSections = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      }
    ]
  },
  {
    title: "Management",
    items: [
      {
<<<<<<< HEAD
        name: "CHQ Timeline",
=======
        name: "Calendar",
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        href: "/admin/timeline",
        icon: Clock,
      },
      {
        name: "Checklist",
        href: "/admin/checklist",
        icon: CheckSquare,
      },
      {
        name: "Benefits",
        href: "/admin/benefits",
        icon: Gift,
      },
      {
        name: "User Management",
        href: "/admin/users",
        icon: Users,
      },
      {
<<<<<<< HEAD
        name: "Chatbot Instructions",
        href: "/admin/instructions",
        icon: MessageSquare,
      }
=======
        name: "Google Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
      {
        name: "Chatbot Instructions",
        href: "/admin/instructions",
        icon: MessageSquare,
      },
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    ]
  }
];

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<{ email: string; fullName: string } | null>(null);
  const supabase = createClient();

  // Set sidebar open by default on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Call initially
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch user details from business_info
        const { data } = await supabase
          .from('business_info')
          .select('full_name, email')
          .eq('user_id', user.id)
          .single();
          
        if (data) {
          setUserDetails({
            email: data.email,
            fullName: data.full_name
          });
        } else {
          setUserDetails({
            email: user.email || 'admin@example.com',
            fullName: 'Admin User'
          });
        }
      }
    };

    fetchUserDetails();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      {/* Backdrop for mobile - appears when sidebar is open on small screens */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-blue-100 transform transition-transform duration-200 ease-in-out flex flex-col h-full",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto p-2 text-gray-500 hover:bg-blue-50 rounded-md lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {navigationSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <h2 className="text-xs font-semibold text-gray-500 px-3 uppercase tracking-wider">
                  {section.title}
                </h2>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          // Close sidebar on mobile when clicking a link
                          if (window.innerWidth < 1024) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-1 text-sm font-medium transition-colors",
                          "hover:bg-blue-50/80 hover:text-blue-700",
                          isActive ? "bg-blue-50/60 text-blue-700" : "text-gray-600"
                        )}
                      >
                        <item.icon 
                          className={cn(
                            "h-4 w-4 transition-transform group-hover:scale-110",
                            isActive ? "text-blue-600" : "text-blue-500"
                          )}
                          strokeWidth={2}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="sticky top-0 z-20 bg-white border-b border-blue-100 h-16">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-gray-600 hover:bg-blue-50 rounded-md lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            
            {userDetails && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-8 w-8 border border-blue-100">
                      <AvatarFallback className="bg-gray-100 text-blue-600 text-xs">
                        {userDetails.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userDetails.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userDetails.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 