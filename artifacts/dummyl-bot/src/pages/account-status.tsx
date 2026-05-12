import { useGetBotStatus, getGetBotStatusQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Users, MessageSquare, Bell, Fingerprint, Heart, User, Power, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AccountStatus() {
  const { data: status, isLoading } = useGetBotStatus({
    query: {
      queryKey: getGetBotStatusQueryKey()
    }
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tighter uppercase mb-2">Account Telemetry</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">Live diagnostic data and connection status for the primary bot profile.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 col-span-full rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        ) : !status ? (
          <div className="text-center py-12 border border-dashed border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
            <p className="font-mono">FAILED TO FETCH TELEMETRY DATA</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Primary Status Card */}
            <Card className="col-span-full border-border/50 bg-card overflow-hidden relative">
              <div className={cn(
                "absolute top-0 left-0 w-1 h-full",
                status.isOnline ? "bg-green-500" : "bg-destructive"
              )} />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center border-2 border-border relative">
                      <User className="h-8 w-8 text-muted-foreground" />
                      <div className={cn(
                        "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card",
                        status.isOnline ? "bg-green-500" : "bg-destructive"
                      )} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">{status.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-mono text-xs border-border/50 bg-background text-muted-foreground">
                          ID: {status.profileId}
                        </Badge>
                        <Badge variant={status.isOnline ? "default" : "destructive"} className={cn(
                          "font-mono text-xs uppercase",
                          status.isOnline ? "bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/30" : ""
                        )}>
                          {status.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 px-4 py-3 bg-background rounded-md border border-border/50">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Health</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <ShieldCheck className={cn(
                          "h-4 w-4",
                          status.accountHealth === 'Good' ? "text-green-500" : "text-yellow-500"
                        )} />
                        <span className="font-bold text-sm">{status.accountHealth}</span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Uptime</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-mono font-bold text-sm">{status.uptime || '00:00:00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {status.bio && (
                  <div className="mt-6 pt-4 border-t border-border/30">
                    <p className="text-sm italic text-muted-foreground border-l-2 border-primary/50 pl-4 py-1">"{status.bio}"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metrics */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Network Reach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-light tracking-tighter">{status.totalFriends.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Connected Profiles</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Active Threads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-light tracking-tighter">{status.totalGc.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Group Conversations</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Pending Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-light tracking-tighter">{status.notifCenter || 0}</div>
                <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Notification Center</p>
              </CardContent>
            </Card>

            {/* Additional Meta */}
            {status.relationshipStatus && (
              <Card className="col-span-full md:col-span-1 border-border/50 bg-card/30">
                 <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    Relationship
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-medium">{status.relationshipStatus}</div>
                </CardContent>
              </Card>
            )}

          </div>
        )}
      </div>
    </AppLayout>
  );
}
