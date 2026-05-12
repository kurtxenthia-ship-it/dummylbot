import { 
  useListUsers, 
  getListUsersQueryKey, 
  useGetAdminStats, 
  getGetAdminStatsQueryKey,
  useBanUser,
  useUnbanUser,
  useDeleteUser
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Activity, Ban, Database, Shield, MoreVertical, Trash2, ShieldAlert } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useGetAdminStats({
    query: {
      enabled: !!user?.isAdmin,
      queryKey: getGetAdminStatsQueryKey()
    }
  });

  const { data: users, isLoading: usersLoading } = useListUsers({
    query: {
      enabled: !!user?.isAdmin,
      queryKey: getListUsersQueryKey()
    }
  });

  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();
  const deleteMutation = useDeleteUser();

  if (authLoading) return null;
  if (!user || !user.isAdmin) return <Redirect href="/dashboard" />;

  const handleAction = async (action: 'ban' | 'unban' | 'delete', targetUserId: number, targetUsername: string) => {
    try {
      if (action === 'ban') {
        await banMutation.mutateAsync({ userId: targetUserId });
        toast({ title: "User banned", description: `${targetUsername} access revoked.` });
      } else if (action === 'unban') {
        await unbanMutation.mutateAsync({ userId: targetUserId });
        toast({ title: "User unbanned", description: `${targetUsername} access restored.` });
      } else if (action === 'delete') {
        if (!confirm(`Are you sure you want to permanently delete ${targetUsername}?`)) return;
        await deleteMutation.mutateAsync({ userId: targetUserId });
        toast({ title: "User deleted", description: `${targetUsername} has been purged from the system.` });
      }
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      
    } catch (err: any) {
      toast({ title: "Action failed", description: err?.error || "Unknown error", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tighter uppercase mb-2 text-primary">God Mode</h1>
          <p className="text-muted-foreground text-sm">System administration and access control.</p>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Total Nodes</p>
                    <p className="text-3xl font-light tracking-tighter">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-5 w-5 text-primary opacity-70" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Active</p>
                    <p className="text-3xl font-light tracking-tighter text-green-500">{stats.activeUsers}</p>
                  </div>
                  <Activity className="h-5 w-5 text-green-500 opacity-70" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Banned</p>
                    <p className="text-3xl font-light tracking-tighter text-destructive">{stats.bannedUsers}</p>
                  </div>
                  <Ban className="h-5 w-5 text-destructive opacity-70" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Sessions</p>
                    <p className="text-3xl font-light tracking-tighter text-blue-500">{stats.totalSessions}</p>
                  </div>
                  <Database className="h-5 w-5 text-blue-500 opacity-70" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Users Table */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-mono uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Access Roster
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {usersLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !users?.length ? (
              <div className="p-12 text-center text-muted-foreground font-mono">NO RECORDS FOUND</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="font-mono text-xs uppercase tracking-wider h-10 text-muted-foreground">ID</TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider h-10 text-muted-foreground">Operator</TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider h-10 text-muted-foreground">Email</TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider h-10 text-muted-foreground">Status</TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider h-10 text-muted-foreground">Activity</TableHead>
                      <TableHead className="font-mono text-xs uppercase tracking-wider h-10 text-muted-foreground text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="border-border/50 hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-mono text-xs text-muted-foreground">#{u.id}</TableCell>
                        <TableCell>
                          <div className="font-medium flex items-center gap-2">
                            {u.username}
                            {u.isAdmin && <ShieldAlert className="h-3 w-3 text-primary" title="Administrator" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm font-mono">{u.email}</TableCell>
                        <TableCell>
                          {u.isBanned ? (
                            <Badge variant="destructive" className="font-mono text-[10px] uppercase tracking-wider">Banned</Badge>
                          ) : (
                            <Badge variant="outline" className="border-green-500/30 text-green-500 font-mono text-[10px] uppercase tracking-wider">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.lastActiveAt ? formatDistanceToNow(new Date(u.lastActiveAt), { addSuffix: true }) : 'Never'}
                          <div className="text-[10px] opacity-70 mt-0.5">{u.sessionCount || 0} sessions</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary transition-colors" data-testid={`button-actions-${u.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-card border-border/50 font-mono text-xs uppercase tracking-wider">
                              <DropdownMenuLabel>Command Roster</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-border/50" />
                              
                              {u.id !== user.id && (
                                <>
                                  {u.isBanned ? (
                                    <DropdownMenuItem className="text-green-500 cursor-pointer focus:bg-green-500/10 focus:text-green-500" onClick={() => handleAction('unban', u.id, u.username)}>
                                      <Shield className="mr-2 h-4 w-4" /> Restore Access
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem className="text-yellow-500 cursor-pointer focus:bg-yellow-500/10 focus:text-yellow-500" onClick={() => handleAction('ban', u.id, u.username)}>
                                      <Ban className="mr-2 h-4 w-4" /> Revoke Access
                                    </DropdownMenuItem>
                                  )}
                                  
                                  <DropdownMenuSeparator className="bg-border/50" />
                                  <DropdownMenuItem className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive" onClick={() => handleAction('delete', u.id, u.username)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Purge Record
                                  </DropdownMenuItem>
                                </>
                              )}
                              {u.id === user.id && (
                                <DropdownMenuItem disabled className="opacity-50">
                                  Cannot modify self
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
