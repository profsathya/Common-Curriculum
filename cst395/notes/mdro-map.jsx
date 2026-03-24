import React, { useState } from 'react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const sections = [
  { id: 'context', title: '1. Context & Scope', purpose: 'Defines the MDRO/CRO problem and the scope of the guideline.', key: ['Organisms in scope', 'Why transmission control matters', 'What the guideline is trying to achieve'] },
  { id: 'identification', title: '2. Early Identification', purpose: 'How high-risk patients are recognized and flagged early.', key: ['Admission risk recognition', 'Prior MDRO/CRO history', 'Treatment or hospitalization abroad', 'Cultures and lab confirmation'] },
  { id: 'roles', title: '3. Roles & Responsibilities', purpose: 'Assigns responsibilities across the hospital system.', key: ['IPC team', 'AMS team', 'Doctors and nurses', 'Lab staff', 'Support staff and management'] },
  { id: 'control', title: '4. Transmission Control', purpose: 'The operational core: how spread is prevented during routine care.', key: ['Patient placement', 'Hand hygiene', 'PPE use', 'Shared equipment rules', 'Transfers and communication', 'Visitor controls'] },
  { id: 'environment', title: '5. Environmental Controls', purpose: 'Covers non-clinical pathways of spread.', key: ['Cleaning and disinfection', 'Linen and waste handling', 'Terminal cleaning', 'Environmental services workflow'] },
  { id: 'patient', title: '6. Patient Lifecycle', purpose: 'What happens as the patient moves through and out of the system.', key: ['Patient education', 'Discharge advice', 'Re-admission alerts', 'Clearance criteria'] },
  { id: 'treatment', title: '7. Treatment & Stewardship', purpose: 'Antimicrobial treatment guidance linked to stewardship.', key: ['Treatment logic', 'Restricted antibiotic use', 'Need for ID/AMS oversight', 'Therapy vs transmission control'] },
  { id: 'training', title: '8. System Enablement', purpose: 'How the hospital sustains the guideline over time.', key: ['Staff training', 'Audits and surveillance', 'Feedback loops', 'Annexures and tools'] },
];

const assumptions = {
  context: 'Assumes staff need a common definition and shared framing of the problem.',
  identification: 'Assumes high-risk patients can be recognized early enough to trigger precautions.',
  roles: 'Assumes responsibilities are clear and actionable across departments.',
  control: 'Assumes frontline execution is the main mechanism for stopping spread.',
  environment: 'Assumes cleaning workflows are reliable enough to interrupt indirect transmission.',
  patient: 'Assumes patient status can be tracked across discharge and re-admission.',
  treatment: 'Assumes drug access, lab support, and stewardship oversight are available.',
  training: 'Assumes training, audit, and management reinforcement can sustain behavior change.',
};

const sectionLogic = {
  context: ['Define the threat.', 'Explain why it matters.', 'Set the scope of action.'],
  identification: ['Spot high-risk patients early.', 'Flag them visibly.', 'Trigger cultures and precautions.'],
  roles: ['Assign ownership.', 'Reduce ambiguity.', 'Coordinate the response.'],
  control: ['Reduce contact opportunities.', 'Use barriers and separation.', 'Prevent spread during routine care.'],
  environment: ['Remove contamination.', 'Standardize cleaning.', 'Reduce indirect transmission.'],
  patient: ['Educate patient and family.', 'Maintain status through transfer.', 'Preserve continuity on re-entry.'],
  treatment: ['Treat appropriately.', 'Avoid unnecessary selection pressure.', 'Link prescribing to stewardship.'],
  training: ['Train staff.', 'Audit reliability.', 'Improve over time.'],
};

const overallPolicyLogic = [
  'Define the problem.',
  'Detect risk early.',
  'Assign responsibility.',
  'Stop spread during care.',
  'Clean the environment.',
  'Manage discharge and re-entry.',
  'Treat appropriately.',
  'Sustain through training and audit.',
];

const foundations = {
  science: [
    { id: 'colonization', title: 'Colonization vs Infection', summary: 'Patients can carry an MDRO without obvious illness and still drive transmission.', why: ['Transmission control often starts before obvious infection', 'Colonized patients can spread organisms silently', 'Clinical cultures do not capture every carrier'] },
    { id: 'resistance', title: 'Resistance Emergence & Spread', summary: 'Resistance spreads through both organisms and genes, and antibiotic use shapes that ecosystem.', why: ['Broad-spectrum use creates selection pressure', 'Resistance can spread within wards quickly', 'Treatment choices affect future transmission burden'] },
    { id: 'transmission', title: 'Chain of Transmission', summary: 'Transmission happens through a source, a route, and a susceptible host.', why: ['Hands, equipment, and surfaces become routes', 'Crowding raises transmission probability', 'Control measures target different links in the chain'] },
  ],
  process: [
    { id: 'patient-flow', title: 'Patient Flow', summary: 'Risk moves with the patient across admission, transfer, discharge, and re-admission.', why: ['Most failures happen at transitions', 'Late flags create delayed precautions', 'Handoffs determine whether risk stays visible'] },
    { id: 'decision-workflow', title: 'Clinical Decision Workflow', summary: 'Frontline staff act based on what they see, what is visible in the chart, and how quickly the system supports action.', why: ['Recognition has to trigger orders fast', 'Cultures, antibiotics, and bed placement interact', 'Workload distorts ideal policy flow'] },
    { id: 'ipc-execution', title: 'IPC Execution Workflow', summary: 'Repeated correct behavior is the hard part: hand hygiene, PPE, cleaning, equipment handling, and coordination.', why: ['Policy fails when execution is inconsistent', 'Supplies and sequencing matter', 'This is where most improvement leverage sits'] },
  ],
};

const personas = {
  doctor: {
    title: 'Doctor',
    subtitle: 'Composite: emergency / ward doctor',
    framing: 'Research-grounded composite, not a literal diary.',
    cards: [
      { id: 'doctor-1', title: 'Admission & first-pass decisions', summary: 'Rapid assessment, prioritization, deciding who needs urgent intervention, cultures, antibiotics, or isolation.', details: ['Triage and acuity drive first actions.', 'The doctor has to notice MDRO risk early enough to change workflow.', 'The challenge is timely recognition in a crowded system.'] },
      { id: 'doctor-2', title: 'Orders & coordination', summary: 'Assessment becomes orders, consults, antibiotic choices, and coordination with nurses and lab.', details: ['Specimens, treatment, and handoffs must stay aligned.', 'Referral hospitals sit inside a larger referral chain.', 'Technical decisions only work if the surrounding process carries them correctly.'] },
      { id: 'doctor-3', title: 'Review & handoff', summary: 'Results are reviewed, treatment updated, and responsibility transferred.', details: ['Culture results, isolation status, and discharge planning must stay aligned.', 'The plan fails if the next team does not inherit the same risk picture.', 'This is where clinical reasoning meets system continuity.'] },
    ],
  },
  nurse: {
    title: 'Nurse',
    subtitle: 'Composite: inpatient / emergency nurse',
    framing: 'Research-grounded composite based on Bhutan nursing, patient safety, and IPC guidance.',
    cards: [
      { id: 'nurse-1', title: 'Handover & patient identification', summary: 'Receiving handover, identifying patients correctly, and forming a safe picture of the unit.', details: ['Patient identity and handover are safety-critical.', 'Nurse-to-nurse transfer is a key point for risk status.', 'Rushed handover creates hidden risk from the first minutes of the shift.'] },
      { id: 'nurse-2', title: 'Continuous bedside execution', summary: 'Monitoring, medications, specimens, device care, PPE use, and many repeated decisions.', details: ['Hand hygiene is the central proven measure.', 'The nurse is the role most exposed to interruptions.', 'This is where policy becomes physical behavior.'] },
      { id: 'nurse-3', title: 'Education, transfer & continuity', summary: 'The nurse often becomes the bridge between the medical plan and what the patient, family, and next team will do.', details: ['Safety spans admission through discharge.', 'Continuity often survives or breaks here.', 'The challenge is translating policy into action people can follow.'] },
    ],
  },
  support: {
    title: 'Support Staff',
    subtitle: 'Composite: environmental / housekeeping',
    framing: '"Staff" here means support and environmental services — highly consequential for MDRO control.',
    cards: [
      { id: 'support-1', title: 'Setup & room awareness', summary: 'Understanding which rooms are routine versus high-risk and preparing PPE, tools, and cleaning routes.', details: ['Cleaning schedules and PPE matter before work begins.', 'If support staff are not told which rooms are high-risk, they start with the wrong assumptions.', 'This is a communication problem as much as a cleaning problem.'] },
      { id: 'support-2', title: 'Environmental cleaning & waste', summary: 'Moving through clinical spaces where a small error can become a transmission pathway.', details: ['Separate tools and waste rules matter.', 'This work is repetitive and often invisible.', 'The technical issue is contamination control; the human issue is reliability.'] },
      { id: 'support-3', title: 'Room turnover & reporting', summary: 'Leaving rooms, tools, and hazards in a safe state for the next team.', details: ['Terminal cleaning and room reset are high-stakes transitions.', 'Support staff need a channel to report incomplete cleaning or missing supplies.', 'The system cannot expect reliability without enough information.'] },
    ],
  },
};

const touchpoints = {
  doctor: [
    { id: 'doc-touch-1', moment: 'First assessment / admission', why: 'High-risk patients need to be recognized early enough to trigger precautions and cultures.', remember: ['Prior CRO/MDRO history', 'Treatment or hospitalization abroad', 'Need for pre-emptive isolation', 'Baseline cultures on admission'], coverage: 'explicit', references: ['2.1 High-Risk Patient Identification', '3.2 Clinician', '3.5 Emergency Department Staff'], failure: 'Late recognition delays precautions and increases exposure.', gap: 'Covered as policy, not as a compact admission decision aid.' },
    { id: 'doc-touch-2', moment: 'Before ordering antibiotics', why: 'The doctor has to connect infection severity, MDRO risk, and stewardship before choosing empiric therapy.', remember: ['Whether risk factors change empiric choices', 'Avoid unnecessary carbapenem use', 'Need for AMS or ID review', 'Cultures before antibiotics when possible'], coverage: 'partial', references: ['3.2 Clinician', '8.1 Antimicrobial Stewardship', '8.2 Treatment Protocol'], failure: 'Overly broad therapy increases selection pressure; overly narrow therapy can miss severe infection.', gap: 'The risk-to-treatment link is not packaged as a simple frontline pathway.' },
    { id: 'doc-touch-3', moment: 'When culture results return', why: 'Diagnosis, isolation, and treatment all need to be updated together.', remember: ['Colonization vs true infection', 'Need to escalate or de-escalate therapy', 'Whether isolation status changes', 'Whether IPC notification is needed'], coverage: 'explicit', references: ['2.4 Laboratory Identification', '3.4 Laboratory Staff', '3.2 Clinician', '8.1.3 Review and Adjust Therapy'], failure: 'Wrong therapy or wrong precautions can persist after the data changes.', gap: 'Strong on responsibilities, weaker on a single cross-team review workflow.' },
    { id: 'doc-touch-4', moment: 'Before transfer', why: 'The receiving team needs the infectious risk and required precautions before the patient arrives.', remember: ['Document MDRO status clearly', 'Communicate to receiving clinician and ward', 'Minimize non-essential movement', 'Preserve separation needs'], coverage: 'explicit', references: ['3.2 Clinician', '3.3 Nurse', '4.6 Moving between Wards'], failure: 'Transfer breaks can delay precautions and spread risk.', gap: 'Well covered, but not turned into a transfer checklist.' },
    { id: 'doc-touch-5', moment: 'At discharge / follow-up', why: 'MDRO status has to survive discharge so future admissions do not start blind.', remember: ['Flag status in discharge summary', 'Give patient and family advice', 'Preserve future alerting logic', 'Understand clearance criteria'], coverage: 'explicit', references: ['6.2 Patient Education on Discharge', '7 Clearance of CRO', '7.1 Clearance Criteria'], failure: 'If status disappears after discharge, the next admission starts blind.', gap: 'Clear policy; weaker on making the discharge signal highly visible later.' },
  ],
  nurse: [
    { id: 'nurse-touch-1', moment: 'Start-of-shift handover', why: 'The nurse needs to know which patients are positive, suspected, isolated, or high-risk before routine care starts.', remember: ['Current isolation/contact status', 'Dedicated equipment requirements', 'Pending cultures or alerts', 'What the receiving nurse must know'], coverage: 'partial', references: ['3.3 Nurse', '7 Clearance of CRO', '7.1 Clearance Criteria'], failure: 'If the risk signal is missing in handover, the shift starts with hidden exposure.', gap: 'The guideline implies this, but does not define a shift-handover workflow.' },
    { id: 'nurse-touch-2', moment: 'First room entry / patient contact', why: 'This is where policy becomes physical behavior: hand hygiene, PPE, and room-entry discipline.', remember: ['Contact-precaution signage', 'Hand hygiene before and after contact', 'Correct PPE use', 'Change PPE between patients'], coverage: 'explicit', references: ['4.1 Patient Placement', '4.3 Hand Hygiene', '4.4 PPE'], failure: 'A single incorrect room entry can carry contamination onward.', gap: 'Strongly covered; a door-side job aid would help.' },
    { id: 'nurse-touch-3', moment: 'Medication / specimen / device care', why: 'High-touch tasks where contamination risk, specimen quality, and patient safety overlap.', remember: ['Hand hygiene sequence', 'PPE and aseptic technique', 'Shared-equipment cleaning rules', 'Correct specimen handling'], coverage: 'partial', references: ['4.3 Hand Hygiene', '4.4 PPE', '4.5 Linen Management', '2.3 Screening Methods'], failure: 'If technique slips during routine tasks, contamination can spread silently.', gap: 'Rules exist but are fragmented across sections, not presented as a bedside task flow.' },
    { id: 'nurse-touch-4', moment: 'Ongoing care during interruptions', why: 'This is where real work departs from the ideal sequence and staff rely on memory under pressure.', remember: ['Return to hand hygiene after interruption', 'Avoid cross-patient contamination', 'Preserve isolation logic during multitasking', 'Do not let documentation gaps erase status'], coverage: 'weak', references: ['4.3 Hand Hygiene', '4.4 PPE'], failure: 'Interruptions increase the chance that sequence or status tracking breaks.', gap: 'The guideline assumes compliance but does not address interruption-heavy execution.' },
    { id: 'nurse-touch-5', moment: 'Preparing for transfer or discharge', why: 'The nurse often becomes the final carrier of the risk signal from one team or setting to the next.', remember: ['Notify receiving nurse/unit', 'Educate patient and family', 'Preserve documentation of MDRO status', 'Minimize unnecessary movement'], coverage: 'explicit', references: ['3.3 Nurse', '4.6 Moving between Wards', '6.1 Patient Information', '6.2 Patient Education on Discharge'], failure: 'If the nurse handoff is incomplete, continuity breaks even when the policy exists on paper.', gap: 'Well covered; a concise handoff checklist would help.' },
  ],
  support: [
    { id: 'support-touch-1', moment: 'Start of shift / assignment briefing', why: 'Support staff need to know which rooms and tasks are routine versus high-risk before they start.', remember: ['Which rooms need special cleaning', 'What PPE is required', 'Which tools belong where', 'Whether isolation status changes workflow'], coverage: 'partial', references: ['3.8 Supporting Staff', '5 Environmental Cleaning and Disinfection', '5.2 Terminal Cleaning'], failure: 'If the shift starts without risk-aware assignment, cleaners may enter high-risk areas with routine assumptions.', gap: 'Covers responsibilities and cleaning protocols, but not a start-of-shift briefing process.' },
    { id: 'support-touch-2', moment: 'Before entering a patient room', why: 'The worker needs to read the room correctly before crossing the threshold.', remember: ['Check room precaution signals', 'Wear the right PPE', 'Follow hand hygiene expectations', 'Know whether equipment is dedicated'], coverage: 'explicit', references: ['3.8 Supporting Staff', '4.1 Patient Placement', '4.4 PPE'], failure: 'Incorrect entry behavior exposes the worker and creates downstream contamination.', gap: 'Clear enough in policy; still not packaged as a one-glance pre-entry cue.' },
    { id: 'support-touch-3', moment: 'During cleaning of patient environment', why: 'This is the central environmental-control moment where indirect transmission is either interrupted or amplified.', remember: ['High-touch surface focus', 'Correct disinfectant and frequency', 'Cleaning order and separation of tools', 'Avoid cross-room contamination'], coverage: 'explicit', references: ['3.8 Supporting Staff', '5.1 Environmental Cleaning', '4.1 Patient Placement'], failure: 'Poor cleaning quality leaves viable contamination behind or spreads it between rooms.', gap: 'Strong on protocol, weaker on practical verification of cleaning quality.' },
    { id: 'support-touch-4', moment: 'Waste & linen handling', why: 'Waste and linen are technical handling tasks with direct infection-control consequences.', remember: ['Proper waste disposal', 'Infectious linen handling', 'Do not mix categories', 'Use PPE correctly'], coverage: 'explicit', references: ['3.8 Supporting Staff', '4.5 Linen Management'], failure: 'If linen or waste handling is wrong, contamination can spread beyond the patient space.', gap: 'Well covered as policy; visual segregation cues would help.' },
    { id: 'support-touch-5', moment: 'Terminal cleaning / room turnover', why: 'A room reset is a high-stakes transition point before the next patient enters.', remember: ['Trigger for terminal cleaning', 'Correct disinfectant use', 'Vacancy time before reuse', 'Communicate incomplete cleaning or supply issues'], coverage: 'explicit', references: ['5.2 Terminal Cleaning', '4.1.2 ICU/HDU placement'], failure: 'If turnover is incomplete or rushed, the next patient inherits environmental risk immediately.', gap: 'Good protocol coverage; room-turnover confirmation would help.' },
  ],
};

const sources = [
  { id: 'src1', title: 'JDWNRH — National Referral Hospital', org: 'Jigme Dorji Wangchuck National Referral Hospital', note: 'Emergency team composition, triage flow, service units, and workload context.', url: 'https://jdwnrh.gov.bt/' },
  { id: 'src2', title: 'Nursing Services Standard', org: 'Ministry of Health, Bhutan', note: 'Nursing mission, staffing expectations, and nursing presence across hospital units.', url: 'https://moh.gov.bt/wp-content/uploads/2025/01/NursingServStandard_2007.pdf' },
  { id: 'src3', title: 'Patient Safety Guideline', org: 'Ministry of Health, Bhutan', note: 'Patient identification, specimen labeling, transfer handover, and admission-to-discharge safety workflow.', url: 'https://moh.gov.bt/wp-content/uploads/2025/01/Patient-safety.pdf' },
  { id: 'src4', title: 'Infection Control & Medical Waste Guideline', org: 'Ministry of Health, Bhutan', note: 'Hand hygiene, PPE, housekeeping, cleaning sequence, and waste segregation requirements.', url: 'https://moh.gov.bt/wp-content/uploads/2025/01/ICMWM-guideline.pdf' },
  { id: 'src5', title: 'National Health Policy', org: 'Ministry of Health, Bhutan', note: 'Three-tier referral structure and role of referral hospitals in the broader system.', url: 'https://moh.gov.bt/wp-content/uploads/2025/01/National-Health-Policy.pdf' },
];

const personaSourceMap = {
  doctor: ['src1', 'src3', 'src5'],
  nurse: ['src2', 'src3', 'src4'],
  support: ['src3', 'src4', 'src5'],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function coverageBadge(cov) {
  const m = {
    explicit: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', label: 'Explicit' },
    partial: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', label: 'Partial' },
    weak: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', label: 'Weak' },
  };
  const s = m[cov] || m.partial;
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function MDROGuidelineMap() {
  const [selectedId, setSelectedId] = useState('control');
  const [foundationTab, setFoundationTab] = useState('science');
  const [personaTab, setPersonaTab] = useState('doctor');
  const [view, setView] = useState('day'); // 'day' | 'touchpoints'
  const [openCard, setOpenCard] = useState('doctor-1');
  const [openTouch, setOpenTouch] = useState('doc-touch-1');

  const sel = sections.find((s) => s.id === selectedId) || sections[0];
  const fItems = foundations[foundationTab] || foundations.science;
  const persona = personas[personaTab] || personas.doctor;
  const tps = touchpoints[personaTab] || touchpoints.doctor;
  const pSources = (personaSourceMap[personaTab] || []).map((id) => sources.find((s) => s.id === id)).filter(Boolean);

  // ─── Tab button helper ───
  const Tab = ({ active, onClick, children, color = 'slate' }) => {
    const colors = {
      slate: active ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400',
      blue: active ? 'bg-blue-700 text-white border-blue-700' : 'bg-blue-50 text-blue-900 border-blue-200 hover:border-blue-400',
      emerald: active ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:border-emerald-400',
    };
    return (
      <button onClick={onClick} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${colors[color]}`}>
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">

        {/* ─── HEADER ───────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Interactive Document Map</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">Bhutan MDRO Guideline</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            A connected view of the guideline: policy structure, knowledge foundations, and frontline roles. 
            Use this to orient yourself before you pick a specific human moment to design for.
          </p>
          <div className="mt-3 rounded-xl bg-slate-100 px-4 py-2.5 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Core read:</span> this is primarily an operational transmission-control document, with treatment guidance layered on top.
          </div>
        </div>

        {/* ─── OVERALL POLICY LOGIC ──────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">End-to-end strategy</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">Overall Policy Logic</h2>
          <p className="mt-1 text-sm text-slate-500">The full sequence behind the document — this doesn't change by section.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            {overallPolicyLogic.map((step, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white text-xs font-bold">{i + 1}</span>
                <span className="text-slate-700">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SECTION EXPLORER ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Section list */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5">
            <h2 className="text-lg font-bold">Document Structure</h2>
            <p className="mt-1 text-xs text-slate-500">Click a section to see what's inside, what it assumes, and its internal logic.</p>
            <div className="mt-4 space-y-2">
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                    sel.id === s.id
                      ? 'border-slate-800 bg-slate-800 text-white shadow-md'
                      : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      sel.id === s.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>{i + 1}</span>
                    <div>
                      <div className="font-semibold text-sm">{s.title}</div>
                      <div className={`text-xs mt-0.5 ${sel.id === s.id ? 'text-slate-300' : 'text-slate-500'}`}>{s.purpose}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section detail */}
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Selected section</p>
              <h2 className="mt-1 text-xl font-bold">{sel.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{sel.purpose}</p>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">What lives here</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {sel.key.map((k) => (
                    <span key={k} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">{k}</span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Internal logic</p>
                <div className="mt-2 space-y-1.5">
                  {(sectionLogic[sel.id] || []).map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="text-slate-400 font-mono text-xs">{i + 1}.</span> {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Underlying assumption</p>
                <p className="mt-1 text-sm text-amber-900">{assumptions[sel.id]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── FOUNDATIONS ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 md:p-7 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Prerequisite knowledge</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Foundations</h2>
          <p className="mt-1 text-sm text-slate-600">What you need to understand before the policy logic makes sense.</p>

          <div className="mt-4 flex gap-2">
            <Tab active={foundationTab === 'science'} onClick={() => setFoundationTab('science')} color="blue">Science</Tab>
            <Tab active={foundationTab === 'process'} onClick={() => setFoundationTab('process')} color="blue">Healthcare Process</Tab>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {fItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-blue-200 bg-white p-4">
                <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.summary}</p>
                <div className="mt-3 space-y-1.5">
                  {item.why.map((w, i) => (
                    <div key={i} className="rounded-lg border border-blue-100 bg-blue-50/60 px-2.5 py-1.5 text-xs text-slate-700">{w}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── FRONTLINE ROLES ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 md:p-7 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Frontline execution</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Roles & Decision Moments</h2>
          <p className="mt-1 text-sm text-slate-600">
            Composite personas built from Bhutan healthcare sources. Each has a "day arc" (what their shift looks like) and "touchpoints" (specific moments the guideline cares about).
          </p>

          {/* Persona tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(personas).map(([key, p]) => (
              <Tab
                key={key}
                active={personaTab === key}
                onClick={() => {
                  setPersonaTab(key);
                  setOpenCard(p.cards[0]?.id);
                  setOpenTouch(touchpoints[key]?.[0]?.id);
                }}
                color="emerald"
              >
                {p.title}
              </Tab>
            ))}
          </div>

          {/* Persona header */}
          <div className="mt-4 rounded-xl border border-emerald-200 bg-white px-4 py-3">
            <div className="flex items-baseline gap-2">
              <h3 className="font-bold text-slate-900">{persona.title}</h3>
              <span className="text-xs text-slate-500">— {persona.subtitle}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 italic">{persona.framing}</p>
          </div>

          {/* View toggle */}
          <div className="mt-3 flex gap-2">
            <Tab active={view === 'day'} onClick={() => setView('day')} color="slate">Day Arc</Tab>
            <Tab active={view === 'touchpoints'} onClick={() => setView('touchpoints')} color="slate">Guideline Touchpoints</Tab>
          </div>

          {/* Day arc cards */}
          {view === 'day' && (
            <div className="mt-4 space-y-3">
              {persona.cards.map((card) => {
                const isOpen = openCard === card.id;
                return (
                  <div key={card.id} className={`rounded-xl border transition-all ${isOpen ? 'border-slate-800 bg-slate-800 text-white shadow-lg' : 'border-slate-200 bg-white'}`}>
                    <button onClick={() => setOpenCard(isOpen ? null : card.id)} className="w-full p-4 text-left">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h4 className="font-semibold text-sm">{card.title}</h4>
                          <p className={`mt-1 text-xs leading-relaxed ${isOpen ? 'text-slate-300' : 'text-slate-500'}`}>{card.summary}</p>
                        </div>
                        <span className={`text-lg font-bold ${isOpen ? 'text-white' : 'text-slate-400'}`}>{isOpen ? '−' : '+'}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/20 px-4 pb-4 pt-3 space-y-2">
                        {card.details.map((d, i) => (
                          <div key={i} className="rounded-lg bg-white/10 px-3 py-2 text-xs leading-relaxed text-slate-200">{d}</div>
                        ))}
                        <div className="pt-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sources used for this persona</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {pSources.map((src) => (
                              <a key={src.id} href={src.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] text-white underline underline-offset-2 hover:bg-white/20">
                                {src.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Touchpoints */}
          {view === 'touchpoints' && (
            <div className="mt-4 space-y-3">
              {tps.map((tp) => {
                const isOpen = openTouch === tp.id;
                return (
                  <div key={tp.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <button onClick={() => setOpenTouch(isOpen ? null : tp.id)} className="w-full p-4 text-left hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-sm text-slate-900">{tp.moment}</h4>
                            {coverageBadge(tp.coverage)}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">{tp.why}</p>
                        </div>
                        <span className="text-lg font-bold text-slate-400">{isOpen ? '−' : '+'}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-200 p-4 space-y-4 bg-slate-50/50">
                        {/* What they need to remember */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">What they need to remember</p>
                          <div className="mt-1.5 space-y-1">
                            {tp.remember.map((r, i) => (
                              <div key={i} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">{r}</div>
                            ))}
                          </div>
                        </div>

                        {/* References */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Guideline references</p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {tp.references.map((ref, i) => (
                              <span key={i} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">{ref}</span>
                            ))}
                          </div>
                        </div>

                        {/* Failure + Gap */}
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Failure risk if missed</p>
                            <p className="mt-1 text-xs leading-relaxed text-rose-900">{tp.failure}</p>
                          </div>
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Design gap</p>
                            <p className="mt-1 text-xs leading-relaxed text-amber-900">{tp.gap}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── SOURCES ────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Reference documents</p>
          <h2 className="mt-1 text-xl font-bold">Sources</h2>
          <p className="mt-1 text-sm text-slate-500">The Bhutan government documents used to build the personas and validate the guideline analysis.</p>
          <div className="mt-4 space-y-2">
            {sources.map((src) => (
              <a
                key={src.id}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-slate-200 bg-slate-50 p-3 hover:bg-white hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{src.title}</div>
                    <div className="text-xs text-slate-500">{src.org}</div>
                    <div className="mt-1 text-xs text-slate-600">{src.note}</div>
                  </div>
                  <span className="flex-shrink-0 text-xs text-blue-600 underline underline-offset-2">Open ↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ─── HOW TO USE THIS ────────────────────────────────────────── */}
        <div className="rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/40 p-5 md:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Sprint 3 starting point</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">How to Use This Map</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700 leading-relaxed">
            <p><span className="font-bold">1. Orient:</span> Read the overall policy logic and skim the 8 sections to get the system picture. Don't try to memorize — just get the shape.</p>
            <p><span className="font-bold">2. Pick a role:</span> Choose doctor, nurse, or support staff. Read their day arc first (how the shift flows), then look at the touchpoints (where the guideline intersects their real work).</p>
            <p><span className="font-bold">3. Find your moment:</span> Look for a touchpoint with a "Partial" or "Weak" coverage badge and a design gap that interests you. That's a real human moment where the guideline fails the person who needs it.</p>
            <p><span className="font-bold">4. Stake your problem:</span> Use the touchpoint details — what they need to remember, the failure risk, the gap — to write a specific problem statement. Vague problems produce vague solutions.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-4 text-center text-xs text-slate-400">
          CST395 — Sprint 3: Complexity — Bhutan MDRO Guideline Map
        </div>
      </div>
    </div>
  );
}
