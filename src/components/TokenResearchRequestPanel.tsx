import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  FileArchive,
  FileText,
  FolderOpen,
  Image,
  Loader2,
  Lock,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import {
  deleteTokenResearchEvidence,
  loadTokenResearchEvidence,
  loadTokenResearchRequests,
  openTokenResearchEvidence,
  submitTokenResearchRequest,
  uploadTokenResearchEvidence,
  type ResearchEvidenceKind,
  type TokenResearchEvidence,
  type TokenResearchRequest,
} from "../lib/tokenResearchClient";
import { useOttAuthSession } from "../lib/useOttAuthSession";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

const ADDRESS = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;
const CURRENCY = /^(?:[\x21-\x7E]{3}|[0-9A-Fa-f]{40})$/;

const evidenceKinds: Array<{ id: ResearchEvidenceKind; en: string; nl: string }> = [
  { id: "whitepaper", en: "Whitepaper", nl: "Whitepaper" },
  { id: "roadmap", en: "Roadmap", nl: "Roadmap" },
  { id: "audit", en: "Audit", nl: "Audit" },
  { id: "legal", en: "Legal / registration", nl: "Juridisch / registratie" },
  { id: "issuer", en: "Issuer evidence", nl: "Issuerbewijs" },
  { id: "liquidity", en: "Liquidity", nl: "Liquiditeit" },
  { id: "holders", en: "Holders / supply", nl: "Houders / supply" },
  { id: "team", en: "Team", nl: "Team" },
  { id: "market", en: "Market data", nl: "Marktdata" },
  { id: "screenshot", en: "Screenshot", nl: "Screenshot" },
  { id: "other", en: "Other evidence", nl: "Overig bewijs" },
];

export function TokenResearchRequestPanel() {
  const { language } = useTerminalLanguage();
  const en = language === "en";
  const { signedIn, loading: authLoading, user } = useOttAuthSession();
  const [requests, setRequests] = useState<TokenResearchRequest[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [evidence, setEvidence] = useState<TokenResearchEvidence[]>([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [issuerAddress, setIssuerAddress] = useState("");
  const [officialWebsite, setOfficialWebsite] = useState("");
  const [claimedCountry, setClaimedCountry] = useState("");
  const [claimedLegalEntity, setClaimedLegalEntity] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [summary, setSummary] = useState("");
  const [evidenceKind, setEvidenceKind] = useState<ResearchEvidenceKind>("whitepaper");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedId) ?? requests[0] ?? null,
    [requests, selectedId],
  );

  function databaseSetupError(value: unknown) {
    const text = value instanceof Error
      ? value.message
      : typeof value === "object" && value !== null && "message" in value
        ? String((value as { message?: unknown }).message ?? "")
        : String(value ?? "");
    return /token_research_requests|submit_ott_token_research_request|schema cache|does not exist/i.test(text);
  }

  async function loadRequests(silent = false) {
    if (!signedIn) return;
    if (!silent) setBusy("load");
    try {
      const next = await loadTokenResearchRequests();
      setRequests(next);
      setSetupRequired(false);
      setError("");
      setSelectedId((current) => current && next.some((item) => item.id === current)
        ? current
        : next[0]?.id ?? "");
    } catch (nextError) {
      if (databaseSetupError(nextError)) {
        setSetupRequired(true);
        setError("");
      } else {
        setError(nextError instanceof Error ? nextError.message : (en ? "Research requests could not be loaded." : "Researchaanvragen konden niet worden geladen."));
      }
    } finally {
      if (!silent) setBusy("");
    }
  }

  async function loadEvidence(requestId: string, silent = false) {
    if (!requestId || !signedIn || setupRequired) {
      setEvidence([]);
      return;
    }
    if (!silent) setBusy("evidence");
    try {
      setEvidence(await loadTokenResearchEvidence(requestId));
      setError("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : (en ? "Evidence could not be loaded." : "Bewijs kon niet worden geladen."));
    } finally {
      if (!silent) setBusy("");
    }
  }

  useEffect(() => {
    if (!authLoading && signedIn) void loadRequests(true);
    if (!signedIn) {
      setRequests([]);
      setSelectedId("");
      setEvidence([]);
    }
  }, [authLoading, signedIn]);

  useEffect(() => {
    if (selectedRequest?.id) void loadEvidence(selectedRequest.id, true);
    else setEvidence([]);
  }, [selectedRequest?.id]);

  async function submitRequest() {
    const currency = currencyCode.trim().toUpperCase();
    const issuer = issuerAddress.trim();
    if (tokenName.trim().length < 2) {
      setError(en ? "Enter the project or token name." : "Vul de project- of tokennaam in.");
      return;
    }
    if (!CURRENCY.test(currency)) {
      setError(en ? "Use a 3-character or 40-hex XRPL currency code." : "Gebruik een XRPL-currencycode van 3 tekens of 40 hextekens.");
      return;
    }
    if (!ADDRESS.test(issuer)) {
      setError(en ? "Enter a valid XRPL issuer r-address." : "Vul een geldig XRPL issuer-r-adres in.");
      return;
    }

    setBusy("submit");
    setError("");
    setMessage("");
    try {
      const requestId = await submitTokenResearchRequest({
        tokenName,
        currencyCode: currency,
        issuerAddress: issuer,
        officialWebsite,
        claimedCountry,
        claimedLegalEntity,
        claimedRegistrationNumber: registrationNumber,
        requesterSummary: summary,
      });
      await loadRequests(true);
      setSelectedId(requestId);
      setMessage(en
        ? "Research request stored. You can now attach private evidence."
        : "Researchaanvraag opgeslagen. Je kunt nu privébewijs toevoegen.");
      setSetupRequired(false);
    } catch (nextError) {
      if (databaseSetupError(nextError)) setSetupRequired(true);
      else setError(nextError instanceof Error ? nextError.message : (en ? "Request could not be stored." : "Aanvraag kon niet worden opgeslagen."));
    } finally {
      setBusy("");
    }
  }

  async function uploadFiles() {
    if (!selectedRequest || selectedFiles.length === 0) return;
    setBusy("upload");
    setError("");
    setMessage("");
    try {
      for (let index = 0; index < selectedFiles.length; index += 1) {
        const file = selectedFiles[index];
        setMessage(`${en ? "Uploading" : "Uploaden"} ${index + 1}/${selectedFiles.length}: ${file.name}`);
        await uploadTokenResearchEvidence({
          requestId: selectedRequest.id,
          file,
          evidenceKind,
          notes: evidenceNotes,
        });
      }
      setSelectedFiles([]);
      setEvidenceNotes("");
      await loadEvidence(selectedRequest.id, true);
      setMessage(en ? "All evidence files were stored privately." : "Alle bewijsbestanden zijn privé opgeslagen.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : (en ? "Upload failed." : "Upload is mislukt."));
    } finally {
      setBusy("");
    }
  }

  async function removeEvidence(item: TokenResearchEvidence) {
    setBusy(`delete:${item.id}`);
    setError("");
    try {
      await deleteTokenResearchEvidence(item);
      if (selectedRequest) await loadEvidence(selectedRequest.id, true);
      setMessage(en ? "Evidence removed." : "Bewijs verwijderd.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : (en ? "Evidence could not be removed." : "Bewijs kon niet worden verwijderd."));
    } finally {
      setBusy("");
    }
  }

  if (authLoading) {
    return <LoadingPanel text={en ? "Checking OTT account…" : "OTT-account controleren…"} />;
  }

  if (!signedIn) {
    return (
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-7 text-center">
            <Lock className="mx-auto text-blue-700" size={30} />
            <h2 className="mt-4 text-2xl font-semibold">{en ? "Sign in to submit evidence" : "Log in om bewijs aan te leveren"}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-blue-950">
              {en ? "Research requests and uploads are private to the submitting OTT account until a founder review is published." : "Researchaanvragen en uploads blijven privé voor het aanleverende OTT-account totdat een founderreview wordt gepubliceerd."}
            </p>
            <a href="/?tab=wallet" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-950 px-5 py-3 text-sm font-semibold text-white">
              <ShieldCheck size={18} /> {en ? "Open account login" : "Open accountlogin"}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700"><FolderOpen size={17} /> OTT Research Intake</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{en ? "Submit facts first. Scoring comes after review." : "Lever eerst feiten aan. Scoring volgt na beoordeling."}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{en ? "Your issuer, project claims and private files remain attached to one research case. OTT does not award a score merely because documents were uploaded; every source must be checked for origin, date, consistency and relevance." : "Issuer, projectclaims en privébestanden blijven aan één researchcase gekoppeld. OTT kent niet alleen omdat documenten zijn geüpload een score toe; iedere bron wordt gecontroleerd op herkomst, datum, consistentie en relevantie."}</p>
          </div>
          <button type="button" onClick={() => void loadRequests()} disabled={Boolean(busy)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
            {busy === "load" ? <Loader2 className="animate-spin" size={17} /> : <RefreshCcw size={17} />}{en ? "Refresh cases" : "Cases vernieuwen"}
          </button>
        </div>

        {setupRequired && (
          <div className="mt-7 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-800" size={22} />
            <div><p className="font-semibold text-amber-950">{en ? "Research database activation required" : "Researchdatabase moet nog worden geactiveerd"}</p><p className="mt-2 text-sm leading-6 text-amber-900">{en ? "No files can be selected or uploaded until the protected token-research migrations are installed in Supabase." : "Er kunnen geen bestanden worden geselecteerd of geüpload totdat de beveiligde tokenresearchmigraties in Supabase zijn uitgevoerd."}</p></div>
          </div>
        )}

        {message && <p className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">{message}</p>}
        {error && <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950">{error}</p>}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_390px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
              <div className="flex items-center gap-3"><Plus className="text-blue-700" size={21} /><h3 className="text-xl font-semibold">{en ? "Create or update a research case" : "Maak of actualiseer een researchcase"}</h3></div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label={en ? "Token / project name" : "Token- / projectnaam"} value={tokenName} setValue={setTokenName} placeholder="Project name" />
                <Field label="Currency code" value={currencyCode} setValue={(value) => setCurrencyCode(value.toUpperCase())} placeholder="ABC or 40-hex" mono />
                <Field label="Issuer wallet" value={issuerAddress} setValue={setIssuerAddress} placeholder="r..." mono wide />
                <Field label={en ? "Official website" : "Officiële website"} value={officialWebsite} setValue={setOfficialWebsite} placeholder="https://" wide />
                <Field label={en ? "Claimed country" : "Opgegeven vestigingsland"} value={claimedCountry} setValue={setClaimedCountry} placeholder={en ? "Country claimed by project" : "Land volgens project"} />
                <Field label={en ? "Claimed legal entity" : "Opgegeven juridische entiteit"} value={claimedLegalEntity} setValue={setClaimedLegalEntity} placeholder="Company / foundation" />
                <Field label={en ? "Registration number" : "Registratienummer"} value={registrationNumber} setValue={setRegistrationNumber} placeholder="Company number / LEI" wide />
                <label className="md:col-span-2"><span className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">{en ? "Why should OTT research this token?" : "Waarom moet OTT dit token onderzoeken?"}</span><textarea value={summary} onChange={(event) => setSummary(event.target.value.slice(0, 5000))} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              </div>
              <button type="button" onClick={() => void submitRequest()} disabled={Boolean(busy) || setupRequired} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40">
                {busy === "submit" ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}{en ? "Store research case" : "Researchcase opslaan"}
              </button>
            </section>

            {selectedRequest && !setupRequired && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{selectedRequest.currency_code}</p><h3 className="mt-2 text-xl font-semibold">{selectedRequest.token_name}</h3><p className="mt-2 break-all font-mono text-xs text-slate-500">{selectedRequest.issuer_address}</p></div><StatusBadge status={selectedRequest.status} /></div>

                <div className="mt-6 grid gap-4 md:grid-cols-[220px_1fr]">
                  <label><span className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">{en ? "Evidence category" : "Bewijscategorie"}</span><select value={evidenceKind} onChange={(event) => setEvidenceKind(event.target.value as ResearchEvidenceKind)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold">{evidenceKinds.map((kind) => <option key={kind.id} value={kind.id}>{en ? kind.en : kind.nl}</option>)}</select></label>
                  <label><span className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">{en ? "Evidence note" : "Notitie bij bewijs"}</span><input value={evidenceNotes} onChange={(event) => setEvidenceNotes(event.target.value.slice(0, 1000))} placeholder={en ? "Origin, date or what this file claims" : "Herkomst, datum of wat dit bestand claimt"} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" /></label>
                </div>

                <label className="mt-5 block rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-blue-400">
                  <Upload className="mx-auto text-blue-700" size={28} />
                  <p className="mt-3 font-semibold">{en ? "Choose private evidence files" : "Kies privébewijsbestanden"}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">PDF, DOC(X), ODT, RTF, TXT, MD, CSV, JSON, JPG, PNG, WebP, HEIC/HEIF · max 15 MB</p>
                  <input type="file" multiple accept=".pdf,.doc,.docx,.odt,.rtf,.txt,.md,.csv,.json,.jpg,.jpeg,.png,.webp,.heic,.heif" onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))} className="sr-only" />
                </label>

                {selectedFiles.length > 0 && <div className="mt-4 space-y-2">{selectedFiles.map((file) => <div key={`${file.name}:${file.size}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm"><span className="min-w-0 truncate">{file.name}</span><span className="shrink-0 text-xs text-slate-500">{formatBytes(file.size)}</span></div>)}</div>}

                <button type="button" onClick={() => void uploadFiles()} disabled={Boolean(busy) || selectedFiles.length === 0} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-40">
                  {busy === "upload" ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}{en ? `Upload ${selectedFiles.length || ""} files` : `Upload ${selectedFiles.length || ""} bestanden`}
                </button>

                <div className="mt-7 border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between gap-3"><h4 className="font-semibold">{en ? "Stored evidence" : "Opgeslagen bewijs"}</h4><span className="text-xs text-slate-500">{evidence.length}</span></div>
                  <div className="mt-4 space-y-3">
                    {evidence.length > 0 ? evidence.map((item) => <EvidenceRow key={item.id} item={item} busy={busy === `delete:${item.id}`} onOpen={() => void openTokenResearchEvidence(item.storage_path)} onDelete={() => void removeEvidence(item)} />) : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">{en ? "No evidence uploaded for this case." : "Nog geen bewijs geüpload voor deze case."}</p>}
                  </div>
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white xl:sticky xl:top-24">
              <div className="flex items-center gap-3"><ShieldCheck className="text-blue-300" size={21} /><h3 className="font-semibold">{en ? "Your research cases" : "Jouw researchcases"}</h3></div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{user?.email}</p>
              <div className="mt-5 space-y-3">
                {requests.length > 0 ? requests.map((request) => <button key={request.id} type="button" onClick={() => setSelectedId(request.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedRequest?.id === request.id ? "border-blue-400 bg-blue-400/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}><div className="flex items-center justify-between gap-3"><span className="font-semibold">{request.token_name}</span><span className="text-xs text-blue-200">{request.currency_code}</span></div><p className="mt-2 truncate font-mono text-[11px] text-slate-400">{request.issuer_address}</p><p className="mt-2 text-xs text-slate-400">{request.status} · {new Date(request.updated_at).toLocaleDateString()}</p></button>) : <p className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300">{setupRequired ? (en ? "Activation pending." : "Activering in behandeling.") : (en ? "No research cases yet." : "Nog geen researchcases.")}</p>}
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-slate-300"><p className="font-semibold text-white">55% research threshold</p><p className="mt-2">{en ? "Reaching 55% means enough verified evidence exists for continued research. It is never an instruction to buy or a prediction of performance." : "55% betekent dat genoeg geverifieerd bewijs bestaat voor verder onderzoek. Het is nooit een koopinstructie of rendementsvoorspelling."}</p></div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, setValue, placeholder, mono = false, wide = false }: { label: string; value: string; setValue: (value: string) => void; placeholder: string; mono?: boolean; wide?: boolean }) {
  return <label className={wide ? "md:col-span-2" : ""}><span className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">{label}</span><input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} spellCheck={!mono} className={`mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${mono ? "font-mono" : ""}`} /></label>;
}

function StatusBadge({ status }: { status: string }) {
  return <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold capitalize text-blue-800">{status.replace("-", " ")}</span>;
}

function EvidenceRow({ item, busy, onOpen, onDelete }: { item: TokenResearchEvidence; busy: boolean; onOpen: () => void; onDelete: () => void }) {
  const Icon = item.mime_type.startsWith("image/") ? Image : item.mime_type.includes("zip") ? FileArchive : FileText;
  return <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><Icon className="mt-0.5 shrink-0 text-blue-700" size={20} /><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.file_name}</p><p className="mt-1 text-xs text-slate-500">{item.evidence_kind} · {formatBytes(item.size_bytes)} · {new Date(item.created_at).toLocaleDateString()}</p>{item.notes && <p className="mt-2 text-xs leading-5 text-slate-600">{item.notes}</p>}</div></div><div className="flex shrink-0 gap-2"><button type="button" onClick={onOpen} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"><FolderOpen size={15} />Open</button><button type="button" onClick={onDelete} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}</button></div></div>;
}

function LoadingPanel({ text }: { text: string }) {
  return <section className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-16 text-sm text-slate-600"><Loader2 className="animate-spin" size={20} />{text}</div></section>;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
