import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Home, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = "warrenokumu98@gmail.com";

const UserDashboard = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const { toast } = useToast();
  const chatRef = useRef<HTMLDivElement>(null);

  // Fetch user and admin id
  useEffect(() => {
    const getUserAndAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      // Fetch admin id
      const { data, error } = await supabase.from('profiles').select('id').eq('email', ADMIN_EMAIL).single();
      if (data) setAdminId(data.id);
    };
    getUserAndAdmin();
  }, []);

  // Fetch messages
  const fetchMessages = async (uid: string, aid: string) => {
    const { data, error } = await supabase.from('messages')
      .select()
      .or(`and(sender_id.eq.${uid},receiver_id.eq.${aid}),and(sender_id.eq.${aid},receiver_id.eq.${uid})`)
      .order('created_at');
    if (!error) setMessages(data || []);
  };

  // Real-time subscription
  useEffect(() => {
    if (!user?.id || !adminId) return;
    fetchMessages(user.id, adminId);
    const channel = supabase
      .channel('messages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages(user.id, adminId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, adminId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  // Send a new message
  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id || !adminId) return;
    const { error } = await supabase.from('messages').insert({ sender_id: user.id, receiver_id: adminId, content: newMessage });
    if (error) toast({ title: 'Error sending', description: error.message, variant: 'destructive' });
    setNewMessage("");
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, manage your rental information</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Room</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Deluxe Suite</div>
              <p className="text-xs text-muted-foreground">Room 204</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh 45,000</div>
              <p className="text-xs text-muted-foreground">Due on 1st of each month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
              <Badge className="bg-green-500">Paid</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Current</div>
              <p className="text-xs text-muted-foreground">Next payment: Feb 1, 2025</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent rent payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { month: "January 2025", amount: 45000, status: "Paid", date: "2025-01-01" },
                  { month: "December 2024", amount: 45000, status: "Paid", date: "2024-12-01" },
                  { month: "November 2024", amount: 45000, status: "Paid", date: "2024-11-01" }
                ].map((payment, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.month}</p>
                      <p className="text-sm text-muted-foreground">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">KSh {payment.amount.toLocaleString()}</p>
                      <Badge variant="secondary" className="text-xs">{payment.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* --- Support Chat --- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Support Chat
              </CardTitle>
              <CardDescription>Chat with our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={chatRef} className="h-72 overflow-y-auto bg-muted/30 rounded p-2 mb-2 flex flex-col gap-2">
                {messages.map((msg, idx) => (
                  <div key={msg.id || idx} className={`max-w-sm px-3 py-2 rounded-lg text-sm whitespace-pre-line ${msg.sender_id === user?.id ? 'self-end bg-primary text-primary-foreground' : 'self-start bg-muted text-foreground border'}`}>
                    {msg.content}
                    <div className="text-[10px] text-muted-foreground mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                ))}
                {messages.length === 0 && <div className="mt-8 text-center text-muted-foreground">No messages yet.</div>}
              </div>
              <form className="flex gap-2" onSubmit={handleSend} autoComplete="off">
                <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type your message..." />
                <Button type="submit" disabled={!newMessage.trim()}>Send</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default UserDashboard;
