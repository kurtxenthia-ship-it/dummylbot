import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Github, Code2, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <AppLayout>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tighter uppercase mb-2">System Architect</h1>
          <p className="text-muted-foreground text-sm">Creator and maintainer information.</p>
        </div>

        <Card className="border-border/50 bg-card overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none">
            <Code2 className="w-48 h-48" />
          </div>

          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              <div className="w-24 h-24 rounded-none bg-background border border-primary/30 flex items-center justify-center shrink-0 shadow-[4px_4px_0_0_hsl(var(--primary))]">
                <TerminalSquare className="w-10 h-10 text-primary" />
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Kyle Gaspari</h2>
                  <p className="text-primary font-mono text-sm font-medium tracking-wider uppercase mt-1">Lead Developer // DUMMYL BOT</p>
                </div>

                <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed max-w-none">
                  <p>
                    Contact this person if you found any error on this web application, or if you have suggestions for improvements. 
                  </p>
                  <p>
                    As the sole developer behind DUMMYL BOT, Kyle is committed to making your bot experience smooth and reliable. 
                    For urgent issues, bug reports, or feature requests, reach out directly through the channels below.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="border-primary/30 hover:border-primary hover:bg-primary/10 text-foreground font-mono text-xs uppercase tracking-wider" asChild>
                    <a href="mailto:support@dummylbot.net" target="_blank" rel="noopener noreferrer">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Direct
                    </a>
                  </Button>
                  <Button variant="ghost" className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub Profile
                    </a>
                  </Button>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
