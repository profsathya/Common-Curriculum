/**
 * Career Intelligence Form — Question Bank
 */

export const QUESTIONS = {

  // ===== Q1: Fixed =====
  q1_situation: {
    id: 'q1_situation',
    step: 1,
    text: "What's your current situation with what comes after graduation? Are you actively job searching, weighing options, or focused on something else? Whatever is true — there's no wrong answer here.",
    fixed: true,
  },

  // ===== Q2 Bank =====
  q2_active_unfocused: {
    id: 'q2_active_unfocused',
    step: 2,
    text: "You mentioned you've been applying to things. Walk me through your last few applications — how did you choose those specific opportunities? What was your thinking?",
  },
  q2_alternative_path: {
    id: 'q2_alternative_path',
    step: 2,
    text: "You mentioned considering a different direction. I'm curious — what would the ideal version of that path look like for you? And is there anything that might make you reconsider?",
  },
  q2_paralyzed: {
    id: 'q2_paralyzed',
    step: 2,
    text: "It sounds like the job search feels heavy right now. When you think about it, what specifically feels hardest? Not the market in general — what's the thing that makes YOU feel stuck?",
  },
  q2_underemployed: {
    id: 'q2_underemployed',
    step: 2,
    text: "You have something lined up, but it sounds like it's not quite where you want to be. If you could describe the right opportunity specifically — not just 'better' but what it actually looks like — what would you say?",
  },
  q2_strategic: {
    id: 'q2_strategic',
    step: 2,
    text: "It sounds like you have a clear direction. What's the biggest risk to this plan — the thing that could go wrong or that you're least certain about?",
  },

  // ===== Q3 Bank =====
  q3_credentials_only: {
    id: 'q3_credentials_only',
    step: 3,
    text: "If an employer asked 'why should we hire you specifically, over other recent graduates with the same degree?' — what would you say right now?",
  },
  q3_has_experience_unframed: {
    id: 'q3_has_experience_unframed',
    step: 3,
    text: "You've mentioned some real experiences — but I want to push you. Think about a specific moment in that work where YOU made a difference that someone else in your position might not have. What happened?",
  },
  q3_strong_self_knowledge: {
    id: 'q3_strong_self_knowledge',
    step: 3,
    text: "You have a good sense of who you are. Now let's flip it — from the employer's side: what problem would you be solving for them? Not your skills — their need. What's the pain point you're the answer to?",
  },
  q3_avoidant_needs_grounding: {
    id: 'q3_avoidant_needs_grounding',
    step: 3,
    text: "Let's try something concrete. Think about any experience — a class project, a part-time job, volunteering, even something personal — where you handled something complex or ambiguous and figured it out. What was it, and what did you actually do?",
  },
  q3_already_strategic: {
    id: 'q3_already_strategic',
    step: 3,
    text: "You seem to know your direction well. What's the thing about you that's hardest to communicate in a resume or interview — the thing that's real but doesn't fit neatly into bullet points?",
  },
};

export const Q2_BANK = Object.values(QUESTIONS).filter(q => q.step === 2);
export const Q3_BANK = Object.values(QUESTIONS).filter(q => q.step === 3);
