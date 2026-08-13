import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { Screen, Customer } from "../../types";
import { CUSTOMER_DB, DEALER_AGENTS } from "../../data";
import { ALL_CATEGORIES, ALL_AGENTS } from "../../utils";
import { SearchableSelect } from "../../components/ui/searchable-select";
import * as Icons from "../../services/iconService";
import { SSO_USER } from "../../constants";

// ─── Local Helpers ─────────────────────────────────────────────────────────────

function RequiredLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-foreground mb-1.5">
      {children} <span className="text-red-500">*</span>
    </label>
  );
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const pct = current / max;
  return (
    <span
      className={`text-xs ${pct >= 1 ? "text-red-500" : pct >= 0.85 ? "text-amber-500" : "text-muted-foreground"}`}
    >
      {current}/{max}
    </span>
  );
}

// ─── AccordionSection ──────────────────────────────────────────────────────────

function AccordionSection({
  title,
  step,
  newSteps,
  onToggle,
  children,
  complete,
}: {
  title: string;
  step: number;
  newSteps: Set<number>;
  onToggle: (s: number) => void;
  children: ReactNode;
  complete: boolean;
}) {
  const isNew = newSteps.has(step);
  return (
    <div
      className={`bg-card border rounded-lg transition-colors ${isNew ? "border-primary/40 ring-1 ring-primary/10" : "border-border"}`}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4"
        onClick={() => onToggle(step)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${complete ? "bg-green-500 text-white" : isNew ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
          >
            {complete ? <Icons.Check size={12} /> : step}
          </div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {complete && (
            <span className="text-xs text-green-600 font-medium">Complete</span>
          )}
        </div>
        <Icons.ChevronDown
          size={15}
          className={`text-muted-foreground transition-transform ${isNew ? "rotate-180" : ""}`}
        />
      </button>
      {isNew && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── VehicleSelect ─────────────────────────────────────────────────────────────

function VehicleSelect({
  vehicles,
  value,
  onChange,
}: {
  vehicles: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);
  useEffect(() => {
    setQ(value);
  }, [value]);

  const filtered = vehicles.filter((v) =>
    v.toLowerCase().includes(q.toLowerCase()),
  );
  const exactMatch = vehicles.some((v) => v.toLowerCase() === q.toLowerCase());
  const showAdd = q.trim().length > 0 && !exactMatch;

  const select = (v: string) => {
    onChange(v);
    setQ(v);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center gap-2 px-3 py-2 text-xs border rounded-lg bg-card transition-colors ${open ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
      >
        <Icons.Search
          size={11}
          className="text-muted-foreground flex-shrink-0"
        />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            onChange(e.target.value);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search or enter registration…"
          className="flex-1 bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground text-xs"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              onChange("");
              inputRef.current?.focus();
            }}
          >
            <Icons.X
              size={10}
              className="text-muted-foreground hover:text-foreground"
            />
          </button>
        )}
      </div>
      {open && (filtered.length > 0 || showAdd) && (
        <div className="absolute z-[500] top-full mt-1.5 left-0 right-0 bg-card border border-border rounded-lg shadow-2xl overflow-hidden ring-1 ring-black/5">
          {filtered.length > 0 && (
            <div className="px-3 pt-2.5 pb-0.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-1">
                Registered vehicles
              </p>
            </div>
          )}
          <div className="max-h-44 overflow-y-auto px-1.5 pb-1.5 pt-1">
            {filtered.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => select(v)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-all
                  ${value === v ? "bg-primary text-white font-medium shadow-sm" : "text-foreground hover:bg-muted"}`}
              >
                <Icons.Car
                  size={11}
                  className={`flex-shrink-0 ${value === v ? "text-white/70" : "text-muted-foreground"}`}
                />
                {v}
                {value === v && (
                  <Icons.Check size={10} className="text-white ml-auto" />
                )}
              </button>
            ))}
          </div>
          {showAdd && (
            <div
              className={`px-1.5 pb-1.5 ${filtered.length > 0 ? "border-t border-border pt-1.5 mt-0.5" : "pt-1.5"}`}
            >
              <button
                type="button"
                onClick={() => select(q.trim())}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-all border border-dashed border-primary/30"
              >
                <Icons.Plus size={11} className="flex-shrink-0" />
                Add &ldquo;{q.trim()}&rdquo; as new vehicle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CustomerSearch ────────────────────────────────────────────────────────────

function CustomerSearch({
  onSelect,
  onSearchStart,
}: {
  onSelect: (c: Customer) => void;
  onSearchStart?: () => void;
}) {
  const [mode, setMode] = useState<"email-mobile" | "postcode-lastname">(
    "email-mobile",
  );
  const [emailMobile, setEmailMobile] = useState("");
  const [postcode, setPostcode] = useState("");
  const [lastname, setLastname] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Customer[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newPostcode, setNewPostcode] = useState("");
  const [newVehicles, setNewVehicles] = useState<string[]>([""]);
  const setVehicleAt = (i: number, v: string) =>
    setNewVehicles((prev) =>
      prev.map((x, idx) => (idx === i ? v.toUpperCase() : x)),
    );
  const addVehicleRow = () => setNewVehicles((prev) => [...prev, ""]);
  const removeVehicleRow = (i: number) =>
    setNewVehicles((prev) =>
      prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i),
    );

  const runSearch = () => {
    setShowNewForm(false);
    onSearchStart?.();
    let found: Customer[] = [];
    if (mode === "email-mobile") {
      const q = emailMobile.trim().toLowerCase();
      if (!q) return;
      found = CUSTOMER_DB.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          c.mobile.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
      );
    } else {
      const pc = postcode.trim().toLowerCase();
      const sn = lastname.trim().toLowerCase();
      if (!pc && !sn) return;
      found = CUSTOMER_DB.filter((c) => {
        const matchPc = !pc || (c.postcode ?? "").toLowerCase().includes(pc);
        const matchSn =
          !sn || c.name.split(" ").pop()!.toLowerCase().includes(sn);
        return matchPc && matchSn;
      });
    }
    setResults(found);
    setSearched(true);
  };

  const reset = () => {
    setEmailMobile("");
    setPostcode("");
    setLastname("");
    setResults([]);
    setSearched(false);
    setShowNewForm(false);
    setNewFirst("");
    setNewLast("");
    setNewEmail("");
    setNewMobile("");
    setNewPostcode("");
    setNewVehicles([""]);
  };

  const handleAddNew = () => {
    const id = `CUST-${Math.floor(6300 + Math.random() * 900)}`;
    const c: Customer = {
      id,
      name: `${newFirst} ${newLast}`.trim(),
      email: newEmail,
      mobile: newMobile,
      vehicles: newVehicles.map((v) => v.trim()).filter(Boolean),
      postcode: newPostcode,
    };
    CUSTOMER_DB.push(c);
    onSelect(c);
    reset();
    toast.success("New customer added and selected.");
  };

const newFormValid = newFirst.trim() && newLast.trim() && (newEmail.trim() || newMobile.trim());

  const Mail = Icons.Mail;
  const MapPin = Icons.MapPin;

  return (
    <div className="space-y-3">
      <div className="flex rounded-lg border border-border overflow-hidden bg-muted/30 p-1 gap-1">
        {(
          [
            ["email-mobile", "Email / Mobile", Mail],
            ["postcode-lastname", "Postcode & Lastname", MapPin],
          ] as const
        ).map(([m, label, Icon]) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m as typeof mode);
              reset();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all
              ${mode === m ? "bg-card text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {mode === "email-mobile" ? (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <input
              value={emailMobile}
              onChange={(e) => setEmailMobile(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && emailMobile.trim() && runSearch()
              }
              placeholder="Enter email address or mobile number…"
              className="flex-1 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
            />
            {emailMobile && (
              <button type="button" onClick={reset}>
                <Icons.X
                  size={11}
                  className="text-muted-foreground hover:text-foreground"
                />
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all w-36">
              <input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  postcode.trim() &&
                  lastname.trim() &&
                  runSearch()
                }
                placeholder="Postcode…"
                className="w-full text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <input
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  postcode.trim() &&
                  lastname.trim() &&
                  runSearch()
                }
                placeholder="Lastname…"
                className="flex-1 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={runSearch}
          disabled={
            mode === "email-mobile"
              ? !emailMobile.trim()
              : !postcode.trim() || !lastname.trim()
          }
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icons.Search size={12} />
          Search
        </button>
      </div>

      {searched && (
        <div className="rounded-lg border border-border overflow-hidden shadow-sm">
          {showNewForm ? (
            <div className="border-t border-border bg-muted/20 px-4 py-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">
                New Customer Details
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {(
                  [
                    ["First Name", newFirst, setNewFirst],
                    ["Last Name", newLast, setNewLast],
                  ] as const
                ).map(([label, val, set]) => (
                  <div key={label}>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      placeholder={label}
                      className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Email {!newMobile.trim() && <span className="text-red-500">*</span>}
                    {newMobile.trim() && <span className="text-muted-foreground/60 font-normal">(optional)</span>}
                  </label>
                  <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email address"
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Mobile {!newEmail.trim() && <span className="text-red-500">*</span>}
                    {newEmail.trim() && <span className="text-muted-foreground/60 font-normal">(optional)</span>}
                  </label>
                  <input value={newMobile} onChange={e => setNewMobile(e.target.value)} placeholder="Mobile number"
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Postcode
                  </label>
                  <input
                    value={newPostcode}
                    onChange={(e) => setNewPostcode(e.target.value)}
                    placeholder="e.g. DE1 3AT"
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-muted-foreground">
                      Vehicle Registrations
                    </label>
                    <button
                      type="button"
                      onClick={addVehicleRow}
                      className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      <Icons.Plus size={11} />
                      Add another
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newVehicles.map((v, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                          <Icons.Car
                            size={11}
                            className="text-muted-foreground flex-shrink-0"
                          />
                          <input
                            value={v}
                            onChange={(e) => setVehicleAt(i, e.target.value)}
                            placeholder="e.g. AB12 XYZ"
                            className="flex-1 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground uppercase tracking-widest"
                          />
                        </div>
                        {(newVehicles.length > 1 || v) && (
                          <button
                            type="button"
                            onClick={() => removeVehicleRow(i)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Icons.X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddNew}
                  disabled={!newFormValid}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  <Icons.Plus size={12} />
                  Add & Select Customer
                </button>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-border max-h-52 overflow-y-auto">
              <div className="px-4 py-2 bg-muted/40 border-b border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {results.length} customer{results.length > 1 ? "s" : ""} found
                </p>
              </div>
              {results.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onSelect(c);
                    reset();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-xs font-bold">
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {c.email} · {c.mobile}
                    </p>
                    {c.postcode && (
                      <p className="text-[11px] text-muted-foreground">
                        {c.postcode}
                        {c.vehicles.length > 0
                          ? ` · ${c.vehicles.join(", ")}`
                          : ""}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    Select →
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-5 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                <Icons.User size={18} className="text-muted-foreground" />
              </div>
              <p className="text-xs font-semibold text-foreground mb-0.5">
                No customers found
              </p>
              <p className="text-[11px] text-muted-foreground mb-3">
                No match for your search. Add them as a new customer.
              </p>
              <button
                type="button"
                onClick={() => setShowNewForm(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors mx-auto border border-primary/20"
              >
                <Icons.Plus size={12} />
                Add New Customer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── NewComplaintScreen ────────────────────────────────────────────────────────

interface NewComplaintScreenProps {
  onNavigate: (s: Screen) => void;
}

export function NewComplaintScreen({ onNavigate }: NewComplaintScreenProps) {
  const [newSteps, setnewSteps] = useState<Set<number>>(new Set([1]));
  const toggleStep = useCallback((step: number) => {
    setnewSteps((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  }, []);

  const [dealer, setDealer] = useState("");
  const [assignedTo, setAssignedTo] = useState(SSO_USER.name);
  const [source, setSource] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    const parts = c.name.trim().split(" ");
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" ") ?? "");
    setVehicleReg("");
  };

  const sec1Complete = Boolean(dealer && assignedTo);
  const sec2Complete = Boolean(selectedCustomer);
  const sec3Complete = Boolean(
    subject.trim() && category && description.trim(),
  );

  useEffect(() => {
    if (sec1Complete) setnewSteps((prev) => new Set([...prev, 2]));
  }, [sec1Complete]);
  useEffect(() => {
    if (sec2Complete) setnewSteps((prev) => new Set([...prev, 3]));
  }, [sec2Complete]);

  const availableAgents = dealer
  ? Array.from(
      new Set([SSO_USER.name, ...(DEALER_AGENTS[dealer] ?? ALL_AGENTS)]),
    )
  : ALL_AGENTS;

  const handleSubmit = () => {
    const e: Record<string, boolean> = {};
    if (!dealer) e.dealer = true;
    if (!assignedTo) e.agent = true;
    if (!selectedCustomer) e.customer = true;
    if (!subject.trim()) e.subject = true;
    if (!category) e.category = true;
    if (!description.trim()) e.desc = true;
    if (Object.keys(e).length > 0) {
      setErrors(e);
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitted(true);
    toast.success("Complaint registered successfully.");
  };

  const resetForm = () => {
    setSubmitted(false);
    setSelectedCustomer(null);
    setFirstName("");
    setLastName("");
    setVehicleReg("");
    setSubject("");
    setCategory("");
    setDescription("");
    setPriority("");
    setAssignedTo(SSO_USER.name);
    setDealer("");
    setSource("");
    setnewSteps(new Set([1]));
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <Icons.CheckCircle2 size={28} className="text-green-600" />
          </div>
          <h2 className="text-base font-bold text-foreground mb-1">
            Complaint Registered
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            The complaint has been logged and assigned successfully.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => onNavigate("complaints")}
              className="px-4 py-2 text-xs border border-border rounded-lg hover:bg-muted transition-colors"
            >
              View All
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              New Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <AccordionSection
          title="Dealer Details"
          step={1}
          newSteps={newSteps}
          onToggle={toggleStep}
          complete={sec1Complete}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <RequiredLabel>Dealer</RequiredLabel>
              <SearchableSelect
                value={dealer}
                onChange={(v) => {
                  setDealer(v);
                  setAssignedTo(SSO_USER.name);
                }}
                options={Object.keys(DEALER_AGENTS)}
                placeholder="Select dealer…"
                error={errors.dealer}
              />
              {errors.dealer && (
                <p className="text-xs text-red-500 mt-1">Dealer is required.</p>
              )}
            </div>
            <div>
              <RequiredLabel>Assign To</RequiredLabel>
              <SearchableSelect
                value={assignedTo}
                onChange={setAssignedTo}
                options={availableAgents}
                placeholder="Select agent…"
                error={errors.agent}
                disabled={!dealer}
              />
              {errors.agent && (
                <p className="text-xs text-red-500 mt-1">
                  Assign To is required.
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Source
            </label>
            <SearchableSelect
              value={source}
              onChange={setSource}
              options={[
                "Inbound",
                "Online Booking",
                "Email",
                "Company Portal",
                "Telephonic System",
              ]}
              placeholder="Select source…"
            />
          </div>
        </AccordionSection>

        <AccordionSection
          title="Customer Details"
          step={2}
          newSteps={newSteps}
          onToggle={toggleStep}
          complete={sec2Complete}
        >
          <div>
            <RequiredLabel>Search Customer</RequiredLabel>
            <CustomerSearch
              onSelect={handleSelectCustomer}
              onSearchStart={() => setSelectedCustomer(null)}
            />
            {errors.customer && (
              <p className="text-xs text-red-500 mt-1">
                Please select a customer.
              </p>
            )}
          </div>
          {selectedCustomer && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  First Name
                </label>
                <input
                  readOnly
                  value={firstName}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-muted/60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Last Name
                </label>
                <input
                  readOnly
                  value={lastName}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-muted/60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Email Address
                </label>
                <input
                  readOnly
                  value={selectedCustomer.email}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-muted/60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Mobile Number
                </label>
                <input
                  readOnly
                  value={selectedCustomer.mobile}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-muted/60 cursor-not-allowed"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Vehicle Registration
                </label>
                <VehicleSelect
                  vehicles={selectedCustomer.vehicles}
                  value={vehicleReg}
                  onChange={setVehicleReg}
                />
              </div>
            </div>
          )}
        </AccordionSection>

        <AccordionSection
          title="Complaint Details"
          step={3}
          newSteps={newSteps}
          onToggle={toggleStep}
          complete={sec3Complete}
        >
          <div>
            <RequiredLabel>Subject</RequiredLabel>
            <input
              maxLength={50}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary…"
              className={`w-full px-3 py-2 text-xs border rounded-lg bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 ${errors.subject ? "border-red-400" : "border-border"}`}
            />
            <div className="flex justify-end mt-1">
              <CharCounter current={subject.length} max={50} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <RequiredLabel>Category</RequiredLabel>
              <SearchableSelect
                value={category}
                onChange={setCategory}
                options={ALL_CATEGORIES}
                placeholder="Select category…"
                error={errors.category}
              />
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">
                  Category is required.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Priority
              </label>
              <SearchableSelect
                value={priority}
                onChange={setPriority}
                options={["High", "Medium", "Low"]}
                placeholder="Select priority…"
              />
            </div>
          </div>
          <div>
            <RequiredLabel>Description</RequiredLabel>
            <textarea
              maxLength={2000}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the complaint in detail…"
              className={`w-full px-3 py-2 text-xs border rounded-lg bg-card resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 ${errors.desc ? "border-red-400" : "border-border"}`}
            />
            <div className="flex justify-end mt-1">
              <CharCounter current={description.length} max={2000} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Submit Complaint
            </button>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}
