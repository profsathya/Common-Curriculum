import React, { useMemo, useState } from 'react';
import {
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  BedDouble,
  MonitorSmartphone,
  FileText,
  Badge,
  Stethoscope,
  Users,
  ArrowRight,
  Shield,
  CircleHelp,
  ChevronDown,
  ChevronUp,
  Map,
} from 'lucide-react';

type Label = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  actions: string[];
  examples: string[];
};

type SignalItem = {
  id: string;
  title: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  strengths: string[];
  risks: string[];
};

type DetailCard = {
  title: string;
  summary: string;
  detail: string;
};

const labels: Label[] = [
  {
    id: 'immediate',
    title: 'Immediate MDRO Precautions',
    subtitle: 'Known or confirmed CRO status',
    icon: Shield,
    tone: 'bg-slate-900 text-white border-slate-900',
    actions: [
      'Start the MDRO precautions pathway immediately.',
      'Use placement and contact-precaution workflow per local policy.',
      'Keep the signal visible in record, paperwork, and care environment.',
    ],
    examples: ['Known CRO history in prior records', 'Newly confirmed CRO-positive case'],
  },
  {
    id: 'preemptive',
    title: 'Pre-emptive MDRO Precautions',
    subtitle: 'High-risk admission trigger',
    icon: AlertTriangle,
    tone: 'bg-slate-800 text-white border-slate-800',
    actions: [
      'Start precautions before lab confirmation.',
      'Make the risk visible across handoff and transfer.',
      'Support the clinician with the next few actions, not a long policy read.',
    ],
    examples: ['Treatment abroad >24 hours in last 12 months', 'Direct transfer from overseas hospital'],
  },
  {
    id: 'standard',
    title: 'Standard Precautions',
    subtitle: 'No current MDRO trigger identified',
    icon: CheckCircle2,
    tone: 'bg-slate-700 text-white border-slate-700',
    actions: [
      'Continue routine workflow.',
      'Do not create unnecessary MDRO friction.',
      'Keep the process simple enough that staff will actually use it.',
    ],
    examples: ['No known CRO history', 'No high-risk admission trigger present'],
  },
];

const signalStack: SignalItem[] = [
  {
    id: 'record',
    title: 'Computer record banner',
    role: 'Master signal',
    icon: MonitorSmartphone,
    text: 'Persistent status in the patient record, visible at admission, transfer, and future re-admission.',
    strengths: ['Most durable over time', 'Best for forcing the admission decision', 'Best place to preserve the alert'],
    risks: ['Only works if access is reliable', 'Not enough by itself during physical movement'],
  },
  {
    id: 'paper',
    title: 'Traveling paperwork marker',
    role: 'Operational backup',
    icon: FileText,
    text: 'A compact label on the admission sheet, file cover, or transfer form that follows the patient physically.',
    strengths: ['Visible even when digital access fails', 'Useful during handoff and transport', 'Easy to pilot quickly'],
    risks: ['Can be separated from the patient', 'Can be missed if the form is buried'],
  },
  {
    id: 'environment',
    title: 'Bed / room precautions sign',
    role: 'Point-of-care cue',
    icon: BedDouble,
    text: 'Neutral signage at the room entrance, bed space, or curtain line to trigger the right behavior before contact.',
    strengths: ['Best cue for bedside behavior', 'Helps nurses, support staff, and visitors understand precautions', 'Turns the room into part of the signal system'],
    risks: ['Only applies once a bed space is assigned', 'Should not be the first or only signal'],
  },
  {
    id: 'wristband',
    title: 'Patient-linked wristband',
    role: 'Backup patient cue',
    icon: Badge,
    text: 'A neutral band with an internal symbol or code so the signal stays on the patient if record access or paperwork fails.',
    strengths: ['Stays with the patient', 'Useful in movement between units', 'Helps when paperwork or records are unavailable'],
    risks: ['Needs training to interpret', 'Can become too subtle or too stigmatizing if poorly designed', 'Should not replace record, paper, or bed-space signals'],
  },
];

const assumptions: string[] = [
  'The highest-leverage starting point is the first admission / first-assessment moment.',
  'A small, action-first decision tool is more reliable than a descriptive risk category system.',
  'In the first version, the admission logic should focus on what is knowable immediately, not everything that may become relevant later.',
  'The hospital needs a signal system, not a single tag.',
  'A wristband can be useful as a backup patient-linked cue, but it should not carry the whole workflow by itself.',
  'The first pilot can assume a full-resources environment, while leaving space for later medium- and low-resource adaptations.',
];

const openQuestions: string[] = [
  'Are these admission triggers clinically appropriate as a first-pass rule set?',
  'Should known CRO and newly confirmed CRO remain under one action label or be separated operationally?',
  'What is the safest, least stigmatizing way to display a patient-linked signal such as a wristband?',
  'At which exact point in the real admission workflow is the label assigned: triage, doctor review, nurse intake, or ward arrival?',
  'Which signals are already feasible in the customer’s setting: record banner, paper marker, room sign, wristband?',
  'Which downstream actions should be shown directly under each label in the first pilot?',
];

const futureRevisions: Array<{ title: string; text: string }> = [
  {
    title: 'Medium- and low-resource variants',
    text: 'Once the core decision logic is validated, the same pathway can be adapted for settings with weaker digital systems, less consistent paperwork, or more limited placement options.',
  },
  {
    title: 'Secondary escalation triggers',
    text: 'The next version can incorporate high-risk unit placement, devices, ventilation, and outbreak linkage as escalation rules after admission rather than crowding the first-pass tool.',
  },
  {
    title: 'Transfer and discharge continuity',
    text: 'The same signal stack can be extended so MDRO status survives inter-unit transfer, discharge, and re-admission without starting from zero.',
  },
  {
    title: 'Attendant / family integration',
    text: 'A later phase can add a small, structured instruction set for attendants so the human environment around the patient is included in the precautions pathway.',
  },
  {
    title: 'Clinical decision support',
    text: 'Once the label system is stable, the customer could attach short action bundles, culture prompts, or transfer checklists directly to each label.',
  },
  {
    title: 'Validation and audit',
    text: 'A future phase can define metrics such as time-to-flag, correct signal persistence, and correct first-action completion so the process can be evaluated, not just deployed.',
  },
];

const problemStakeCards: DetailCard[] = [
  {
    title: 'User',
    summary: 'Admitting clinician or triage / ward nurse at first contact.',
    detail: 'The specific person is the clinician or nurse who first receives the patient and must make an early precautions decision before the patient settles into the normal workflow.',
  },
  {
    title: 'Moment',
    summary: 'The first 5–10 minutes of assessment.',
    detail: 'This is the window in which the staff member decides whether the patient should enter an MDRO precautions pathway now, before later placement, transfer, and communication decisions start to compound.',
  },
  {
    title: 'Pain point',
    summary: 'The signal is easy to miss or lose.',
    detail: 'The patient can move through assessment, transport, placement, and handoff before the right precautions begin because the signal is missed, delayed, or not carried reliably across record, paper, environment, and movement.',
  },
];

const whyStartCards: DetailCard[] = [
  {
    title: 'Early enough to matter',
    summary: 'Admission influences downstream workflow.',
    detail: 'This moment can change placement, precautions, communication, and later workflow before errors are amplified downstream.',
  },
  {
    title: 'Narrow enough to prototype',
    summary: 'It avoids redesigning everything at once.',
    detail: 'A pilot can focus on one reliable decision instead of taking on the entire hospital operations problem in version 1.',
  },
  {
    title: 'Clinically reviewable',
    summary: 'A medical reviewer can check the assumptions quickly.',
    detail: 'The customer can react directly to the admission triggers, signal placement, and workflow timing without having to approve a huge abstract system.',
  },
  {
    title: 'Reusable backbone',
    summary: 'Later versions can extend the same core.',
    detail: 'Once the admission-start signal system is validated, it can be extended into transfer, discharge, outbreak response, and lower-resource variants.',
  },
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function ExpandableCard({
  title,
  summary,
  children,
  badge,
  defaultOpen = false,
  icon: Icon,
}: {
  title: string;
  summary?: string;
  children: React.ReactNode;
  badge?: string;
  defaultOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-3xl border transition-all ${
        open ? 'border-slate-300 bg-white shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
      }`}
    >
      <button onClick={() => setOpen(!open)} className="flex w-full items-start justify-between gap-4 p-4 text-left">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <div className="rounded-2xl bg-white p-2 shadow-sm">
              <Icon className="h-5 w-5 text-slate-700" />
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              {badge ? <Pill>{badge}</Pill> : null}
            </div>
            {summary ? <p className="mt-1 text-sm leading-6 text-slate-600">{summary}</p> : null}
          </div>
        </div>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {open ? <div className="border-t border-slate-100 px-4 pb-4 pt-3">{children}</div> : null}
    </div>
  );
}

function ExpandableSection({
  id,
  title,
  subtitle,
  summary,
  icon: Icon,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  icon: React.ComponentType<{ className?: string }>;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button onClick={() => onToggle(id)} className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-2xl bg-slate-100 p-2">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            {!open ? <p className="mt-3 text-sm leading-6 text-slate-600">{summary}</p> : null}
          </div>
        </div>
        <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {open ? <div className="border-t border-slate-100 px-6 py-5">{children}</div> : null}
    </div>
  );
}

export default function MDROAdmissionPlanReview() {
  const [activeLabel, setActiveLabel] = useState('immediate');
  const [openSections, setOpenSections] = useState({
    problem: false,
    why: false,
    core: true,
    signals: false,
    assumptions: false,
    questions: false,
    future: false,
  });

  const current = useMemo(() => labels.find((x) => x.id === activeLabel) || labels[0], [activeLabel]);
  const CurrentIcon = current.icon;

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Customer review artifact</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">MDRO admission-start precautions plan</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                A focused starting proposal for the first-assessment moment: how an admitting doctor or nurse identifies an incoming patient who should enter an MDRO precautions pathway, how that signal stays visible, and why this is a strong place to start.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Click a section card to open it, then use the inner cards for one more level of detail.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ExpandableSection
            id="problem"
            title="Problem stake"
            subtitle="The specific person, moment, and pain point this proposal is designed for."
            summary="Defines who the design is for, the exact admission moment being targeted, and the failure mode this proposal is trying to reduce."
            icon={ClipboardList}
            open={openSections.problem}
            onToggle={toggleSection}
          >
            <div className="grid gap-3 md:grid-cols-3">
              {problemStakeCards.map((card) => (
                <ExpandableCard key={card.title} title={card.title} summary={card.summary}>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">{card.detail}</div>
                </ExpandableCard>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
              The proposal is intentionally narrow: not solve all MDRO operations, but make the first admission-start decision more reliable.
            </div>
          </ExpandableSection>

          <ExpandableSection
            id="why"
            title="Why this is the right starting point"
            subtitle="Why the project starts with admission instead of trying to redesign the whole system at once."
            summary="Explains why admission is high leverage, bounded enough to prototype, and strong as a base for later extensions."
            icon={Stethoscope}
            open={openSections.why}
            onToggle={toggleSection}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {whyStartCards.map((card) => (
                <ExpandableCard key={card.title} title={card.title} summary={card.summary}>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">{card.detail}</div>
                </ExpandableCard>
              ))}
            </div>
          </ExpandableSection>

          <ExpandableSection
            id="core"
            title="Core proposal"
            subtitle="An action-first label system with a small admission rule set and a multi-layer signal stack."
            summary="Shows the three labels, the small admission decision rule set, and the basic logic of the proposal."
            icon={ChevronRight}
            open={openSections.core}
            onToggle={toggleSection}
          >
            <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
              <div>
                <div className="flex flex-wrap gap-2">
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => setActiveLabel(label.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        activeLabel === label.id ? label.tone : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-sm font-semibold">{label.title}</div>
                      <div className={`mt-1 text-xs ${activeLabel === label.id ? 'text-slate-200' : 'text-slate-500'}`}>{label.subtitle}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-white p-2 shadow-sm">
                      <CurrentIcon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-slate-900">{current.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{current.subtitle}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">What staff should do</div>
                      <div className="mt-2 space-y-2">
                        {current.actions.map((action, idx) => (
                          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Typical examples</div>
                      <div className="mt-2 space-y-2">
                        {current.examples.map((item, idx) => (
                          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Admission decision shape</div>
                <div className="mt-4 space-y-3">
                  <ExpandableCard title="1. Known or confirmed CRO?" summary="If yes, assign Immediate MDRO Precautions." defaultOpen>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      This captures patients with known CRO history in prior records and patients who are already newly confirmed as CRO-positive.
                    </div>
                  </ExpandableCard>
                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>
                  <ExpandableCard
                    title="2. Treatment abroad over 24h in last 12 months or direct overseas transfer?"
                    summary="If yes, assign Pre-emptive MDRO Precautions."
                  >
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      This keeps the first-pass tool focused on what is realistically knowable at admission without adding too many secondary risk factors up front.
                    </div>
                  </ExpandableCard>
                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>
                  <ExpandableCard title="3. If neither trigger is present" summary="Use Standard Precautions.">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      The goal is to avoid unnecessary friction while keeping the system simple enough that clinicians and nurses will actually use it consistently.
                    </div>
                  </ExpandableCard>
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  Version 1 stays intentionally small. More complex triggers can be added later as escalation logic instead of overloading the first-pass admission decision.
                </div>
              </div>
            </div>
          </ExpandableSection>

          <ExpandableSection
            id="signals"
            title="Signal stack"
            subtitle="The plan is not one tag. It is a linked set of signals that help the status survive movement, handoff, and care."
            summary="Explains how record, paper, room/bed signage, and wristband each solve different parts of the signal problem."
            icon={Users}
            open={openSections.signals}
            onToggle={toggleSection}
          >
            <div className="space-y-3">
              {signalStack.map((item) => {
                const Icon = item.icon;
                return (
                  <ExpandableCard key={item.id} title={item.title} summary={item.text} badge={item.role} icon={Icon}>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Why keep it</div>
                        <div className="mt-2 space-y-2">
                          {item.strengths.map((s, idx) => (
                            <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Limitations</div>
                        <div className="mt-2 space-y-2">
                          {item.risks.map((s, idx) => (
                            <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ExpandableCard>
                );
              })}
            </div>
          </ExpandableSection>

          <ExpandableSection
            id="assumptions"
            title="Clinical assumptions to validate"
            subtitle="These are explicit so the customer can react to them directly, rather than responding to an implicit design."
            summary="Lists the assumptions that need clinical and operational confirmation before the plan should be treated as valid."
            icon={CircleHelp}
            open={openSections.assumptions}
            onToggle={toggleSection}
          >
            <div className="space-y-3">
              {assumptions.map((item, idx) => (
                <ExpandableCard key={idx} title={`Assumption ${idx + 1}`} summary={item}>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    This assumption should be confirmed, refined, or rejected by the customer based on real workflow, staffing, and clinical constraints.
                  </div>
                </ExpandableCard>
              ))}
            </div>
          </ExpandableSection>

          <ExpandableSection
            id="questions"
            title="What we need from the customer"
            subtitle="The artifact is meant to provoke focused clinical and operational feedback, not approval of every detail."
            summary="Captures the specific questions the customer should answer so the proposal can be sharpened before piloting."
            icon={ClipboardList}
            open={openSections.questions}
            onToggle={toggleSection}
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {openQuestions.map((q, idx) => (
                <ExpandableCard key={idx} title={`Question ${idx + 1}`} summary={q}>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    The customer’s answer should help determine whether the admission logic, signal design, or rollout path needs to change before piloting.
                  </div>
                </ExpandableCard>
              ))}
            </div>
          </ExpandableSection>

          <ExpandableSection
            id="future"
            title="Future revisions enabled by this starting point"
            subtitle="Why this is a strong first move even though it does not solve every MDRO situation yet."
            summary="Shows how the admission-start design can later expand into lower-resource variants, continuity, escalation, and evaluation."
            icon={Map}
            open={openSections.future}
            onToggle={toggleSection}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {futureRevisions.map((item, idx) => (
                <ExpandableCard key={idx} title={item.title} summary={item.text}>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    This future step depends on the same core admission-start signal system being validated first, rather than designing isolated fixes for each new situation.
                  </div>
                </ExpandableCard>
              ))}
            </div>
            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">
              The strategic argument is simple: a validated admission-start signal system creates a backbone that later improvements can extend. Without that backbone, every later feature becomes another isolated workaround.
            </div>
          </ExpandableSection>
        </div>
      </div>
    </div>
  );
}
