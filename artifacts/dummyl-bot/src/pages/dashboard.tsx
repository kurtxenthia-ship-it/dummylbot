import { useGetBotCommands, getGetBotCommandsQueryKey, usePlayMusic } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Music, Command as CommandIcon, Search, Play, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: commands, isLoading } = useGetBotCommands({
    query: {
      queryKey: getGetBotCommandsQueryKey()
    }
  });

  const [search, setSearch] = useState("");
  const [musicQuery, setMusicQuery] = useState("");
  
  const playMusic = usePlayMusic();
  const { toast } = useToast();

  const handlePlayMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicQuery.trim()) return;

    try {
      await playMusic.mutateAsync({ data: { query: musicQuery } });
      toast({ title: "Music requested", description: `Playing: ${musicQuery}` });
      setMusicQuery("");
    } catch (err: any) {
      toast({ title: "Failed to play music", description: err?.error || "Unknown error", variant: "destructive" });
    }
  };

  const filteredCommands = commands?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, typeof commands>);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tighter uppercase mb-2">Control Interface</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">Access all subroutines, modules, and entertainment systems for DUMMYL BOT.</p>
        </div>

        {/* Music Player Module */}
        <Card className="border-primary/20 bg-card overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent"></div>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Music Module [!p]
            </CardTitle>
            <CardDescription>Queue audio directly to active voice threads.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePlayMusic} className="flex gap-2">
              <div className="relative flex-1">
                <Music className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Enter song name or URL..." 
                  className="pl-9 font-mono bg-background border-border/50 focus-visible:ring-primary"
                  value={musicQuery}
                  onChange={(e) => setMusicQuery(e.target.value)}
                  disabled={playMusic.isPending}
                  data-testid="input-music-query"
                />
              </div>
              <Button type="submit" disabled={playMusic.isPending || !musicQuery.trim()} className="font-bold tracking-wider" data-testid="button-play-music">
                {playMusic.isPending ? "CONNECTING..." : <><Play className="h-4 w-4 mr-2" /> PLAY</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Commands Module */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-mono font-bold flex items-center gap-2">
              <CommandIcon className="h-5 w-5 text-primary" />
              Command Registry
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search commands..." 
                className="pl-9 bg-card border-border/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-commands"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full rounded-md" />
              <Skeleton className="h-[200px] w-full rounded-md" />
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-mono font-bold text-primary uppercase tracking-widest border-b border-border/50 pb-2">
                    // {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cmds.map((cmd) => (
                      <Card key={cmd.name} className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-md font-mono text-foreground font-bold tracking-tight">
                            {cmd.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                          <p className="text-sm text-muted-foreground line-clamp-2" title={cmd.description}>{cmd.description}</p>
                          <div className="bg-background rounded p-2 text-xs font-mono text-primary/80 mt-2 border border-border/30">
                            {cmd.usage}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(groupedCommands).length === 0 && (
                <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card/20">
                  <p className="text-muted-foreground font-mono">No commands found matching "{search}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
