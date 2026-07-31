// ─── Complaint Details ────────────────────────────────────────────────────────

function ResolveModal({ onConfirm, onCancel }: { onConfirm: (summary: string) => void; onCancel: () => void }) {
  const [summary, setSummary] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={18} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Resolve Complaint</h3>
            <p className="text-xs text-muted-foreground">Provide a resolution summary before marking as resolved.</p>
          </div>
        </div>
        <div>
          <RequiredLabel label="Resolution Summary" />
          <textarea rows={4} value={summary} onChange={e => setSummary(e.target.value)} maxLength={2000}
            placeholder="Describe how the complaint was resolved and any actions taken..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 resize-none transition" />
          <div className="flex justify-end mt-1">
            <CharCounter current={summary.length} max={2000} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
            Cancel
          </button>
          <button onClick={() => summary.trim() && onConfirm(summary.trim())}
            disabled={!summary.trim()}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
            <CheckCircle2 size={13} />Resolve Complaint
          </button>
        </div>
      </Card>
    </div>
  );
}

function CloseModal({ onConfirm, onCancel, isResolved }: { onConfirm: () => void; onCancel: () => void; isResolved: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <X size={18} className="text-gray-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Close Complaint</h3>
          </div>
        </div>
        {!isResolved && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
            <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">This complaint has not been resolved. Closing without resolving may affect reporting.</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground mb-5">
          Are you sure you want to close this complaint? This will update the status to Closed and lock the complaint from further updates.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors flex items-center gap-1.5">
            <X size={13} />Close Complaint
          </button>
        </div>
      </Card>
    </div>
  );
}

function ComplaintDetailsScreen({ id, onNavigate }: { id: string | null; onNavigate: (s: Screen) => void }) {
  const base = COMPLAINTS.find(c => c.id === id) ?? COMPLAINTS[0];
  const [status, setStatus]             = useState<Status>(base.status);
  const [timeline, setTimeline]         = useState<TimelineEntry[]>([...base.timeline]);
  const [action, setAction]             = useState<"note" | "email" | "call" | null>(null);
  const [showResolve, setShowResolve]   = useState(false);
  const [showClose, setShowClose]       = useState(false);
  const [noteText, setNoteText]         = useState("");
  const [emailSubj, setEmailSubj]       = useState(`Re: Complaint ${base.id}`);
  const [emailBody, setEmailBody]       = useState("");
  const [callOutcome, setCallOutcome]   = useState("Spoke with customer");
  const [callDir, setCallDir]           = useState("Outbound");
  const [callNotes, setCallNotes]       = useState("");

  function addEntry(entry: Omit<TimelineEntry, "id">) {
    setTimeline(prev => [{ id: Date.now(), ...entry }, ...prev]);
  }

  function handleStatusChange(newStatus: Status) {
    setStatus(newStatus);
    addEntry({ type: "status", user: "Jangili Rao", time: nowStamp(), content: `Status changed to ${newStatus}.` });
  }

  function handleSaveNote() {
    if (!noteText.trim()) return;
    addEntry({ type: "note", user: "Jangili Rao", time: nowStamp(), content: noteText.trim() });
    setNoteText(""); setAction(null);
  }

  function handleSendEmail() {
    if (!emailBody.trim()) return;
    addEntry({ type: "email", direction: "outgoing", user: "Jangili Rao", time: nowStamp(),
      content: `Email sent. Subject: "${emailSubj}" — ${emailBody.slice(0, 80)}${emailBody.length > 80 ? "..." : ""}` });
    setEmailBody(""); setAction(null);
  }

  function handleSaveCall() {
    addEntry({ type: "phone", direction: callDir === "Outbound" ? "outgoing" : "incoming", user: "Jangili Rao",
      time: nowStamp(), content: `${callDir} call — ${callOutcome}.${callNotes.trim() ? " Notes: " + callNotes.trim() : ""}` });
    setCallNotes(""); setAction(null);
  }

  function handleResolve(summary: string) {
    setStatus("Resolved");
    addEntry({ type: "resolved", user: "Jangili Rao", time: nowStamp(), content: `Complaint resolved. ${summary}` });
    setShowResolve(false);
  }

  function handleClose() {
    setStatus("Closed");
    addEntry({ type: "closed", user: "Jangili Rao", time: nowStamp(), content: "Complaint closed." });
    setShowClose(false);
  }

  const isClosed   = status === "Closed";
  const isResolved = status === "Resolved";

  return (
    <>
      {showResolve && <ResolveModal onConfirm={handleResolve} onCancel={() => setShowResolve(false)} />}
      {showClose   && <CloseModal   onConfirm={handleClose}   onCancel={() => setShowClose(false)} isResolved={isResolved} />}

      <div className="space-y-4">
        <button onClick={() => onNavigate("complaints")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={13} />Back to Complaints
        </button>

        {/* Header */}
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <span className="font-mono text-sm font-bold text-primary">{base.id}</span>
                <StatusBadge status={status} />
                {isClosed && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">Locked</span>}
              </div>
              <h2 className="text-sm font-semibold text-foreground mb-2">{base.subject}</h2>
              <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Tag size={11} />{base.category}</span>
                <span className="flex items-center gap-1.5"><Building2 size={11} />{base.dealer}</span>
                {base.vehicle && <span className="flex items-center gap-1.5"><Car size={11} />{base.vehicle}</span>}
                <span className="flex items-center gap-1.5"><Clock size={11} />Created {base.created}</span>
                <span className="flex items-center gap-1.5"><UserCheck size={11} />
                  {base.assignedTo ?? <span className="text-red-500">Unassigned</span>}
                </span>
              </div>
            </div>
            {!isClosed && (
              <select value={status} onChange={e => handleStatusChange(e.target.value as Status)}
                className="px-3 py-2 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-medium">
                {(["New","In Progress","Awaiting Customer","Resolved","Closed"] as Status[]).map(s =>
                  <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>

          {/* Action Buttons */}
          {!isClosed && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-border flex-wrap">
              <button onClick={() => setAction(action === "note" ? null : "note")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${action === "note" ? "bg-gray-100 border-gray-300 text-gray-700" : "border-border text-muted-foreground hover:bg-muted"}`}>
                <MessageSquare size={12} />Add Note
              </button>
              <button onClick={() => setAction(action === "call" ? null : "call")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${action === "call" ? "bg-green-50 border-green-200 text-green-700" : "border-border text-muted-foreground hover:bg-muted"}`}>
                <Phone size={12} />Record Call
              </button>
              <button onClick={() => setAction(action === "email" ? null : "email")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${action === "email" ? "bg-blue-50 border-blue-200 text-blue-700" : "border-border text-muted-foreground hover:bg-muted"}`}>
                <Mail size={12} />Send Email
              </button>
              <div className="flex-1" />
              {!isResolved && (
                <button onClick={() => setShowResolve(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
                  <CheckCircle2 size={12} />Resolve
                </button>
              )}
              <button onClick={() => setShowClose(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
                <X size={12} />Close
              </button>
            </div>
          )}

          {/* Add Note panel */}
          {action === "note" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-border">
              <label className="block text-xs font-semibold text-muted-foreground mb-2">Internal Note</label>
              <textarea rows={3} value={noteText} onChange={e => setNoteText(e.target.value)} maxLength={2000}
                placeholder="Add an internal note visible only to your team..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition" />
              <div className="flex items-center justify-between mt-2">
                <CharCounter current={noteText.length} max={2000} />
                <div className="flex gap-2">
                  <button onClick={() => { setAction(null); setNoteText(""); }} className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                  <button onClick={handleSaveNote} disabled={!noteText.trim()} className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-40">Save Note</button>
                </div>
              </div>
            </div>
          )}

          {/* Send Email panel */}
          {action === "email" && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <label className="block text-xs font-semibold text-blue-700 mb-2">
                Send Email to {base.customer.name} ({base.customer.email})
              </label>
              <input type="text" value={emailSubj} onChange={e => setEmailSubj(e.target.value)} maxLength={100}
                className="w-full px-3 py-2 text-xs rounded-lg border border-blue-200 bg-white mb-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition" />
              <textarea rows={4} value={emailBody} onChange={e => setEmailBody(e.target.value)} maxLength={2000}
                placeholder="Type your message to the customer..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-blue-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 transition" />
              <div className="flex items-center justify-between mt-2">
                <CharCounter current={emailBody.length} max={2000} />
                <div className="flex gap-2">
                  <button onClick={() => { setAction(null); setEmailBody(""); }} className="px-3 py-1.5 text-xs rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors">Cancel</button>
                  <button onClick={handleSendEmail} disabled={!emailBody.trim()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40">
                    <Send size={11} />Send Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Record Call panel */}
          {action === "call" && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <label className="block text-xs font-semibold text-green-700 mb-3">Record Phone Interaction</label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Call Outcome</label>
                  <select value={callOutcome} onChange={e => setCallOutcome(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-300 transition">
                    <option>Spoke with customer</option>
                    <option>No answer — voicemail left</option>
                    <option>No answer — no voicemail</option>
                    <option>Inbound call from customer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Direction</label>
                  <select value={callDir} onChange={e => setCallDir(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-300 transition">
                    <option>Outbound</option><option>Inbound</option>
                  </select>
                </div>
              </div>
              <textarea rows={3} value={callNotes} onChange={e => setCallNotes(e.target.value)} maxLength={2000}
                placeholder="Call notes..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-green-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-green-300 transition" />
              <div className="flex items-center justify-between mt-2">
                <CharCounter current={callNotes.length} max={2000} />
                <div className="flex gap-2">
                  <button onClick={() => { setAction(null); setCallNotes(""); }} className="px-3 py-1.5 text-xs rounded-lg border border-green-200 text-green-700 hover:bg-green-100 transition-colors">Cancel</button>
                  <button onClick={handleSaveCall} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
                    <Mic size={11} />Save Call Record
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Body — description + timeline + sidebar */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <Card className="p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Description</h3>
              <p className="text-sm text-foreground leading-relaxed">{base.description}</p>
            </Card>

            <Card className="p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Activity & Communication Timeline
              </h3>
              {timeline.map((entry, i) => {
                const cfg = TIMELINE_CFG[entry.type] ?? TIMELINE_CFG.created;
                return (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${cfg.iconBg}`}>
                        {cfg.icon({ size: 13, className: cfg.iconColor })}
                      </div>
                      {i < timeline.length - 1 && <div className="w-px flex-1 bg-border my-1 min-h-3" />}
                    </div>
                    <div className={`flex-1 ${i < timeline.length - 1 ? "pb-4" : "pb-0"}`}>
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">{entry.user}</span>
                        {entry.direction && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            entry.direction === "outgoing" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                          }`}>{entry.direction}</span>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">{entry.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{entry.content}</p>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Customer</h3>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  {base.customer.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">{base.customer.name}</div>
                  {base.customer.customerId && <div className="text-xs text-muted-foreground font-mono">{base.customer.customerId}</div>}
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Mail size={11} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-foreground truncate">{base.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={11} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-foreground">{base.customer.mobile}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
