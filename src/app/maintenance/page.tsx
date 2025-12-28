"use client";

import { Construction, Wrench, Clock } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full" />
            <div className="relative bg-primary/10 p-6 rounded-full">
              <Construction className="h-16 w-16 text-primary" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Under Development
          </h1>
          <p className="text-xl text-muted-foreground">
            We&apos;re working on something awesome!
          </p>
        </div>

        {/* Info cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-card border rounded-lg p-4 text-left">
            <div className="flex items-center gap-3 mb-2">
              <Wrench className="h-5 w-5 text-primary" />
              <span className="font-medium">In Progress</span>
            </div>
            <p className="text-sm text-muted-foreground">
              New features and improvements
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4 text-left">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">Coming Soon</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The site will be back shortly
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="bg-muted/50 rounded-lg p-4 border border-dashed">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            <span className="text-muted-foreground">
              Development mode active
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-muted-foreground">
          LogsDB - The Universal Log Encyclopedia
        </p>
      </div>
    </div>
  );
}
