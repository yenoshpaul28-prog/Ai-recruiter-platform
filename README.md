# Clear Talent Insights

BUILD THE COMPLETE CLEAR TALENT AI MVP

Build a complete, polished, working recruitment SaaS application called Clear Talent AI.

This is a single-prompt full MVP build.

Do NOT split the application into phases.

Do NOT create only mockup screens.

Build the complete working MVP including:

Frontend

Backend/data layer

Authentication-ready architecture

Job creation

Candidate management

Candidate matching

Transparent scoring

Explainable ranking

Evidence system

Weight Studio

Candidate comparison

Shortlisting

Bias Audit

Demo data

Responsive design

Loading states

Error handling

Empty states

GitHub-ready project structure

The final application should be usable as a hackathon MVP immediately after generation.

1. PRODUCT PURPOSE

Clear Talent AI is an explainable talent matching platform for recruiters.

The main idea is:

"Don't just show recruiters who matches. Show them WHY."

The system helps recruiters:

Create a job

Define job requirements

Define skill weights

Add candidates

Analyze candidate evidence

Calculate transparent match scores

Rank candidates

Explain every score

Identify skill gaps

Shortlist candidates

Compare candidates

Review potential fairness/bias signals

The platform is a decision-support tool.

It must NEVER automatically:

Reject a candidate

Hire a candidate

Contact a candidate

Make the final hiring decision

The recruiter always makes the final decision.

2. IMPORTANT PRODUCT PRINCIPLE

The core differentiator is:

EXPLAINABLE MATCHING

Never show only:

"Candidate Score: 68.7"

Instead show:

"Candidate Score: 68.7"

and explain:

Python contributed 22.3

SQL contributed 18.5

REST APIs contributed 16

Communication contributed 11.9

Then explain:

Why the score is high

Strong Python project evidence.

Good SQL assessment performance.

Relevant REST API project.

What lowered the score

Limited advanced REST API evidence.

Communication evidence is based mainly on assessment.

The recruiter must always be able to understand the score.

3. DESIGN STYLE

Create a premium, realistic HR SaaS product.

It should feel like a real recruitment platform, not a hackathon dashboard.

Design characteristics:

Clean

Professional

Trustworthy

Modern

Minimal

Human-centered

Easy to scan

Use:

Light neutral background

White cards

Subtle borders

Soft shadows

10–14px border radius

Strong typography hierarchy

Generous whitespace

One primary brand color

Green for positive/verified

Amber for warnings

Red for critical issues

Avoid:

Neon colors

Excessive gradients

Excessive glassmorphism

Excessive animations

Cartoon-style cards

Huge decorative elements

Dense paragraphs

Generic AI visual effects

The application must look credible to a recruiter.

4. APPLICATION NAVIGATION

Create a responsive sidebar.

Navigation:

Dashboard

Jobs

Candidates

Shortlists

Bias Audit

Settings

Header:

Page title

Global search

Notifications

Recruiter avatar

Recruiter name

Mobile:

Convert sidebar into a mobile navigation menu.

5. DASHBOARD

Create a professional recruiter dashboard.

Header:

"Good morning, Recruiter"

Subtitle:

"Here's an overview of your recruitment activity."

Primary button:

"+ Create Job"

KPI cards:

Active Jobs

3

Total Candidates

124

Shortlisted

18

Average Match

67.4%

Bias Signals

2

Then:

Active Jobs

Show:

Python Developer

Pune, India

0–2 years

42 candidates

68.4% average match

6 shortlisted

Active

Full Stack Developer

Hyderabad, India

1–3 years

38 candidates

64.2% average match

5 shortlisted

Active

Data Analyst

Bengaluru, India

0–2 years

44 candidates

69.1% average match

7 shortlisted

Active

Then:

Top Candidates

Show candidate cards/table.

Each candidate:

Name

Role

Match score

Match status

Top skills

Evidence strength

Job

View Profile

Shortlist

Then:

Recent Activity

Examples:

"12 candidates added to Python Developer"

"Anjali Rathod shortlisted"

"Python Developer rubric updated"

"Bias audit completed"

6. JOB MANAGEMENT

Create Jobs page.

Features:

Search jobs

Filter Active/Draft/Closed

Create Job

Edit Job

View Job

Duplicate Job

Close Job

Each job:

Job title

Location

Experience

Job type

Candidates

Average match

Shortlisted

Status

Created date

7. CREATE JOB WORKFLOW

Create a complete working job creation form.

Sections:

Basic Information

Job Title

Location

Job Type

Experience Required

Job Description

Skills

Required Skills

Must-Have Skills

Optional Skills

Allow adding/removing skill chips.

Example:

Python

SQL

REST APIs

Git

Docker

AWS

Evidence Preferences

Recruiter can select:

Projects

Assessments

Certifications

Work Experience

Portfolio

Verified Credentials

SCORING RUBRIC

Allow recruiter to assign weights.

Example:

Python — 30%

SQL — 25%

REST APIs — 20%

Problem Solving — 15%

Communication — 10%

Weights must always total exactly 100%.

Show:

Total Weight: 100%

Prevent saving if total is not 100%.

8. WEIGHT STUDIO

Create an interactive Weight Studio.

Use sliders.

Example:

Python
30%

SQL
25%

REST APIs
20%

Problem Solving
15%

Communication
10%

When recruiter changes a weight:

Recalculate candidate scores

Reorder ranking

Update skill contribution

Update explanations

Show:

Ranking Preview

#1 Anjali Rathod — 68.7

#2 Priya Deshmukh — 68.5

#3 Sandeep Kumar — 60.1

If changing the weight changes ranking, clearly display:

"Ranking changed because Python now has a higher weight."

This should work in real time.

9. CANDIDATE MANAGEMENT

Create Candidates page.

Features:

Search

Filters

Candidate list

Candidate profile

Add candidate

Upload resume

Upload multiple candidates

Manual candidate creation

CSV import interface

For the MVP, if real resume parsing is unavailable, create a structured resume upload flow and map uploaded/demo candidate data into the candidate model.

DO NOT falsely claim that an external AI model parsed the resume if no AI service is connected.

10. CANDIDATE DATA MODEL

Each candidate should contain:

Name

Email

Phone

Location

Experience

Education

College

College tier

Skills

Projects

Certifications

Assessments

Work experience

Portfolio

Evidence

Skill gaps

11. MATCHING ENGINE

Implement a transparent scoring engine.

Use this formula:

Skill Contribution

Candidate Skill Level × Job Skill Weight

Overall Score

Sum of all weighted skill contributions.

Normalize final score to 100.

Example:

Python:

Candidate skill = 80/100

Weight = 30%

Contribution = 24 points

SQL:

Candidate skill = 70/100

Weight = 25%

Contribution = 17.5 points

The score must be reproducible.

Do NOT create an unexplained random AI score.

12. EVIDENCE SYSTEM

Every candidate skill must have evidence.

Evidence types:

Project

Assessment

Certification

Work Experience

Portfolio

Verified Credential

Self-reported

Evidence confidence:

HIGH

Strong supporting evidence.

MEDIUM

Some supporting evidence.

LOW

Weak supporting evidence.

NOT VERIFIED

No reliable supporting evidence.

Self-reported information must be clearly marked.

Do not represent self-reported skills as verified.

13. CANDIDATE RANKING

Inside each job, show:

Candidate Ranking

Columns:

Rank

Candidate

Match Score

Top Skills

Evidence

Skill Gaps

Status

Actions

Example:

#1 Anjali Rathod
68.7
Strong Match

#2 Priya Deshmukh
68.5
Strong Match

#3 Sandeep Kumar
60.1
Good Match

Allow sorting and filtering.

14. CANDIDATE PROFILE

Create a detailed candidate profile.

Header:

Candidate name

Target role

Location

Match score

Match status

Buttons:

Shortlist

Compare

View Evidence

PROFILE SUMMARY

Show:

Experience

Education

Location

Top Skills

Projects

Assessment Status

MATCH BREAKDOWN

Show progress bars:

Python
22.3 / 30

SQL
18.5 / 25

REST APIs
16 / 20

Communication
11.9 / 15

15. EXPLAIN SCORE

Create a major section:

Why did this candidate receive 68.7?

Show contribution breakdown.

Then:

What increased the score?

Strong Python project evidence.

Good SQL assessment.

Relevant REST API experience.

What lowered the score?

Limited advanced REST API evidence.

Communication evidence is medium confidence.

This explanation must be written in normal recruiter-friendly language.

16. SKILL GAPS

Show:

Skill Gaps

REST APIs

Required:
Advanced

Candidate:
Intermediate

Impact:
Reduced match score

Docker

Required:
Preferred

Candidate:
No evidence

Impact:
No contribution

Do not simply label candidates as "bad".

Explain the gap.

17. EVIDENCE DETAILS

For every important skill show:

Skill

Evidence Type

Evidence Description

Confidence

Source

Example:

Python

Project Evidence

"Inventory Management System built using Python."

Confidence:

High

Source:

Resume / Project

18. SHORTLISTING

Create working shortlist functionality.

Recruiter can:

Shortlist

Remove from shortlist

Add notes

Compare

View candidate

Create Shortlists page.

Show:

Job

Candidate

Score

Shortlisted Date

Recruiter Notes

Status

Important:

AI recommends.

Recruiter decides.

19. CANDIDATE COMPARISON

Allow recruiter to select 2–3 candidates.

Compare:

Overall Score

Python

SQL

REST APIs

Communication

Evidence Strength

Projects

Assessments

Skill Gaps

Use a clean comparison table.

20. BIAS AUDIT

Create a functional Bias Audit system based on available demo/application data.

IMPORTANT:

The audit should identify potential disparities.

It must NOT automatically change candidate rankings.

Show:

Fairness Overview

Example:

"No critical fairness issues detected."

Then:

Candidate Distribution

Tier 1

25%

Tier 2

42%

Tier 3

33%

Then:

Ranking Distribution

Average score by college tier.

Then:

Shortlist Distribution

Show how shortlisted candidates are distributed.

Then:

Signals

Example:

"Tier-3 candidates represent 33% of applicants but 12% of the shortlist."

Status:

Review Recommended

Explanation:

"This is a fairness signal for recruiter review. It does not automatically indicate discrimination."

21. CRITICAL FAIRNESS RULE

NEVER use these as candidate scoring factors:

College name

College tier

Gender

Religion

Caste

Race

Personal background

The matching score must be based on job-relevant evidence.

College information may appear in the audit for analysis, but it must never increase or decrease the candidate's score.

22. HUMAN-IN-THE-LOOP

Create a reusable component:

Human-in-the-loop

"AI recommends and explains. The recruiter makes the final decision."

Show this subtly throughout the product.

23. SETTINGS

Create Settings page.

Sections:

Profile

Organization

Notifications

Preferences

Responsible AI

Responsible AI section:

"Candidate recommendations are decision-support information."

"Recruiters remain responsible for final hiring decisions."

"AI does not automatically reject or hire candidates."

24. AUTHENTICATION

Implement basic authentication if Supabase is available.

Include:

Sign up

Login

Logout

Protected dashboard

Recruiter profile

If Supabase credentials are not available yet, create the authentication architecture cleanly so credentials can be added through environment variables.

Do not expose secrets in frontend code.

25. DATABASE

Use Supabase for persistent data if available.

Create appropriate tables/models:

users

organizations

jobs

job_skills

job_rubrics

candidates

candidate_skills

candidate_evidence

candidate_scores

shortlists

recruiter_notes

bias_audits

Use proper relationships.

A job can have many candidates.

A candidate can be considered for multiple jobs.

Scores should be calculated from job rubric + candidate evidence.

Do not hard-code rankings into UI.

26. DEMO DATA

Seed realistic demo data.

Create:

3 jobs

12 candidates

5 shortlisted candidates

Different skill levels

Different evidence types

Different match scores

Different skill gaps

Different college tiers

Some bias audit signals

Use realistic Indian names and locations.

Clearly label data as demo/sample data where appropriate.

27. RESPONSIVE DESIGN

The application must work properly on:

Desktop

Laptop

Tablet

Mobile

On mobile:

Sidebar becomes menu

Tables become cards or horizontal scroll

Candidate profile remains readable

Buttons remain accessible

Charts resize

Forms remain usable

28. UI STATES

Implement:

Loading states

Skeleton loaders

Empty states

Error states

Success notifications

Confirmation dialogs

Examples:

"Loading candidates..."

"Calculating match..."

"Running fairness audit..."

"No candidates found."

"Weight total must equal 100%."

"Candidate shortlisted."

29. SEARCH AND FILTERS

Implement functional search/filtering where appropriate.

Candidates:

Search name

Job

Score

Skills

Evidence

Location

Experience

Shortlisted

Jobs:

Search

Active

Draft

Closed

30. ACCESSIBILITY

Use:

Good color contrast

Semantic HTML

Keyboard navigation

Focus states

Accessible labels

Readable typography

Do not rely only on color to communicate status.

31. PERFORMANCE

Keep the application fast.

Use reusable components.

Avoid unnecessary animations.

Avoid unnecessary API calls.

Do not duplicate large components.

Keep architecture clean and scalable.

32. SECURITY

Never expose API keys or service-role keys in frontend code.

Use environment variables.

If Supabase is used:

Authentication

Row-level security where appropriate

User-specific data access

Recruiters should only access their organization's data.

33. IMPORTANT IMPLEMENTATION RULE

DO NOT create fake functionality just to make the interface look complete.

If a feature is implemented, it should actually work.

If an advanced AI integration cannot be implemented because no API credentials/service is available:

Build the correct UI

Build the data structure

Use deterministic/demo logic

Clearly separate it from future AI integration

Do not falsely claim that a real AI model is running.

34. DO NOT OVERBUILD

This is a hackathon MVP.

Do not add:

Payroll

Interview scheduling

Employee management

Attendance

Complex CRM

Automated email campaigns

Video interviews

Chatbots

Unnecessary enterprise features

Focus on the core product.

35. FINAL USER JOURNEY

The completed application must allow this complete flow:

Recruiter signs in

↓

Dashboard

↓

Create Job

↓

Enter job requirements

↓

Add skills

↓

Set scoring weights

↓

Save job

↓

Add/upload candidates

↓

Candidates appear

↓

System calculates transparent match scores

↓

Candidates are ranked

↓

Recruiter opens candidate

↓

Recruiter sees:

Score

Skill breakdown

Evidence

Skill gaps

Why score is high

What lowered score

↓

Recruiter changes Weight Studio

↓

Ranking updates

↓

Recruiter compares candidates

↓

Recruiter runs Bias Audit

↓

Recruiter shortlists candidates

↓

Recruiter makes final decision

36. FINAL PRODUCT QUALITY

Before completing the build, verify:

All navigation works

All major buttons work

Job creation works

Candidate creation works

Candidate profiles work

Ranking works

Scoring is deterministic

Weight changes update ranking

Evidence is displayed

Shortlisting works

Comparison works

Bias audit works

Search works

Filters work

Loading states exist

Empty states exist

Error states exist

Mobile layout works

No broken pages

No console errors

No fake AI claims

No scoring based on college tier

No automatic hiring/rejection

FINAL PRODUCT PRINCIPLE

The entire application must communicate one simple idea:

"CLEAR TALENT AI DOESN'T JUST TELL RECRUITERS WHO MATCHES. IT SHOWS THEM WHY."

Build the complete working MVP now.

Do not stop after creating the landing page.

Do not stop after creating static dashboard screens.

Implement the complete application workflow described above.

Make the application feel like a real, polished recruitment SaaS product that can be demonstrated in a hackathon.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fec7d034-0a17-4853-99b4-66dfef92c0a9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
