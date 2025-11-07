import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";

const ADMIN_EMAIL = "warrenokumu98@gmail.com";

const SupportChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Get current user, always refresh on auth state change
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  // Get admin id from profiles
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("profiles").select("id").eq("email", ADMIN_EMAIL).single();
      if (data && data.id) setAdminId(data.id);
      else setAdminId(null);
    })();
  }, []);

  // Fetch messages between user and admin
  const fetchMessages = async (uid: string, aid: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select()
      .or(`and(sender_id.eq.${uid},receiver_id.eq.${aid}),and(sender_id.eq.${aid},receiver_id.eq.${uid})`)
      .order("created_at");
    setMessages(data || []);
  };

  // Real-time subscribe and fallback polling
  useEffect(() => {
    if (!user?.id || !adminId) return;
    fetchMessages(user.id, adminId);
    let stopped = false;
    const poll = () => {
      if (stopped) return;
      fetchMessages(user.id, adminId);
      setTimeout(poll, 10000); // every 10s
    };
    const channel = supabase
      .channel("support_chat_widget")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        fetchMessages(user.id, adminId);
      })
      .subscribe();
    poll();
    return () => {
      stopped = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id, adminId]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages, open]);

  const handleSend = async (e: any) => {
    e.preventDefault();
    setError(null);
    if (!newMessage.trim() || !user?.id || !adminId) {
      setError("Support unavailable or message empty.");
      return;
    }
    const { error } = await supabase.from("messages").insert({ sender_id: user.id, receiver_id: adminId, content: newMessage });
    if (error) {
      setError(error.message);
      return;
    }
    setNewMessage("");
  };

  // Guest or not ready
  if (!user)
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <Button size="icon" className="bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all" onClick={() => window.location.href = '/login'}>
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    );
  // No admin available
  if (!adminId) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <Button disabled size="icon" className="bg-gray-400 text-white shadow-lg">!</Button>
        <div className="absolute right-0 bottom-[4.5rem] bg-white text-gray-700 p-2 rounded shadow text-xs mt-2 w-48">Support is temporarily unavailable. Please try later.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed right-4 bottom-4 z-50">
        <Button
          size="icon"
          className="bg-blue-600 text-white shadow-lg rounded-full hover:bg-blue-700"
          onClick={() => setOpen(true)}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-1 md:max-w-md w-full rounded-lg flex flex-col">
          <div className="border-b py-3 px-4 text-lg font-bold flex items-center gap-2 bg-blue-50 text-blue-700">Support Chat</div>
          <div ref={chatRef} className="h-72 md:h-80 overflow-y-auto flex flex-col gap-2 px-2 py-2 bg-muted/10">
            {messages.map((m) => (
              <div key={m.id} className={`max-w-[80%] px-3 py-2 my-1 rounded-lg text-sm ${m.sender_id === user.id ? 'self-end bg-blue-600 text-white' : 'self-start bg-gray-200 text-gray-900'}`}>
                {m.content}
                <div className="text-[10px] text-muted-foreground mt-1 text-right">{new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
              </div>
            ))}
            {messages.length === 0 && <div className="m-auto text-muted-foreground py-8 text-xs">No messages yet.</div>}
          </div>
          <form className="flex gap-2 px-2 pb-3" onSubmit={handleSend} autoComplete="off">
            <Input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="rounded-full bg-white"
            />
            <Button type="submit" size="sm" className="rounded-full" disabled={!newMessage.trim()}>Send</Button>
          </form>
          {error && <div className="text-xs text-red-600 px-3 py-1">{error}</div>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportChatWidget;
