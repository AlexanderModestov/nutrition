"use client";

import Link from "next/link";
import { BookOpen, Search, Menu } from "lucide-react";

const KnowledgeHubHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="knowledge-gradient p-2 rounded-lg group-hover:knowledge-glow transition-all">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Knowledge Hub</h1>
              <p className="text-xs text-muted-foreground">Expert Resources</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-secondary"
            >
              Home
            </Link>
            <Link
              href="/materials"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-secondary"
            >
              All Materials
            </Link>
            <Link
              href="/quizes"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-secondary"
            >
              Quizes
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary">
              <Search className="h-5 w-5" />
            </button>
            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default KnowledgeHubHeader;