export interface Profile {
  name: string;
  initials: string;
  role: string;
  shortRole: string;
  email: string;
  phone: string;
  phoneHref: string;
  location: string;
  linkedin: string;
  github?: string;
  resumePdf: string;
  resumeSummary: string;
  shortLine: string;
  quote: string;
  targetRoles: string[];
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Skill {
  atomicNumber: number;
  symbol: string;
  name: string;
  family: 'Tools & Software' | 'Data Analytics' | 'Business Analysis' | 'Reporting & BI' | 'Automation';
  isBrand: boolean;
  logo: string;
  description: string;
  projects: string[];
}

export interface PrimaryProject {
  id: string;
  index: string;
  title: string;
  kicker: string;
  description: string;
  focus: string;
  features: string[];
  tech: string[];
  impact: string;
  image: string;
}

export interface SecondaryProject {
  id: string;
  index: string;
  title: string;
  kicker: string;
  description: string;
  impact: string;
  tech: string[];
}

export interface ExperienceItem {
  id: string;
  period: string;
  title: string;
  organization: string;
  location: string;
  type: 'experience' | 'education';
  details: string[];
  metrics?: string;
}

export interface Achievement {
  id: string;
  index: string;
  label: string;
  caption: string;
  detail: string;
  metric: number;
  prefix?: string;
  suffix?: string;
  logo: string;
  brandColor: string;
}

export const PROFILE: Profile = {
  name: 'Sakshi Shukla',
  initials: 'SS',
  role: 'Data Analyst | Business Analyst | BI & Reporting | Process Automation',
  shortRole: 'Data & Business Analyst',
  email: 'sakshishukla1167@gmail.com',
  phone: '8200619139',
  phoneHref: 'tel:8200619139',
  location: 'Surat, Gujarat, India',
  linkedin: 'https://linkedin.com/in/sakshi-shukla-7047252a0',
  resumePdf: '/Sakshi_Shukla_Data_Business_Analyst_Resume.pdf',
  resumeSummary:
    'Data and business analytics professional with 2+ years of experience in MIS reporting, dashboard development, data analysis, process automation, workflow design, and business process improvement. Experienced in converting business requirements and operational data into structured reports, dashboards, automated workflows, and software solutions across financial, inventory, operational, and franchise-management processes.',
  shortLine:
    'Strong ability to understand business processes, identify inefficiencies, structure requirements, and translate them into practical data and technology solutions.',
  quote:
    'Converting raw operational datasets into structured MIS reports, KPI dashboards, and automated business workflows.',
  targetRoles: [
    'Data Analyst',
    'Business Analyst',
    'BI Analyst',
    'Reporting Analyst',
    'MIS Analyst',
    'Junior Data Analyst',
    'Business Process Analyst',
    'MIS / Reporting Team Lead'
  ]
};

export const NAV: NavItem[] = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Achievements', href: '#achievements' },
  { label: 'Contact', href: '#contact' }
];

export const SKILL_GROUPS = [
  'All',
  'Tools & Software',
  'Data Analytics',
  'Business Analysis',
  'Reporting & BI',
  'Automation'
] as const;

export const SKILLS: Skill[] = [
  // Tools & Software (Brand logos)
  {
    atomicNumber: 1,
    symbol: 'Ex',
    name: 'Excel',
    family: 'Tools & Software',
    isBrand: true,
    logo: 'excel.svg',
    description: 'Advanced Excel dashboards, KPI cards, complex formulas, and macro automation.',
    projects: ['Coral BIOS Daily Report', 'Loan Application', 'Godown Management']
  },
  {
    atomicNumber: 2,
    symbol: 'Pb',
    name: 'Power BI',
    family: 'Tools & Software',
    isBrand: true,
    logo: 'powerbi.svg',
    description: 'Interactive business intelligence reports, KPI visualizations, and data models.',
    projects: ['Coral BIOS Daily Report', 'Performance Analytics']
  },
  {
    atomicNumber: 3,
    symbol: 'Sq',
    name: 'SQL',
    family: 'Tools & Software',
    isBrand: true,
    logo: 'sql.svg',
    description: 'Data querying, validation, cleaning, and structured transaction data architecture.',
    projects: ['Coral BIOS FMS', 'Godown Management', 'Data Management']
  },
  {
    atomicNumber: 4,
    symbol: 'Gs',
    name: 'Google Sheets',
    family: 'Tools & Software',
    isBrand: true,
    logo: 'googlesheets.svg',
    description: 'Dynamic cloud reporting, multi-department sheets integration, and custom views.',
    projects: ['Coral BIOS Daily Report', 'Payroll Analytics', 'Productivity Tracker']
  },
  {
    atomicNumber: 5,
    symbol: 'As',
    name: 'Google Apps Script',
    family: 'Tools & Software',
    isBrand: true,
    logo: 'googleappsscript.svg',
    description: 'Automated email distribution, PDF document generation, and workflow scripting.',
    projects: ['Coral BIOS Daily Report', 'Payroll Analytics']
  },
  {
    atomicNumber: 6,
    symbol: 'Py',
    name: 'Python',
    family: 'Tools & Software',
    isBrand: true,
    logo: 'python.svg',
    description: 'Data manipulation and analysis scripting (currently learning).',
    projects: ['Coral BIOS Daily Report']
  },

  // Data Analytics
  {
    atomicNumber: 7,
    symbol: 'Dc',
    name: 'Data Cleaning',
    family: 'Data Analytics',
    isBrand: false,
    logo: 'concept-clean',
    description: 'Data scrubbing, standardization, handling missing values and anomalies.',
    projects: ['Data Management', 'Godown Management']
  },
  {
    atomicNumber: 8,
    symbol: 'Da',
    name: 'Data Analysis',
    family: 'Data Analytics',
    isBrand: false,
    logo: 'concept-analysis',
    description: 'Converting raw operational data into structured insights and comparative analysis.',
    projects: ['Coral BIOS Daily Report', 'Performance Analytics']
  },
  {
    atomicNumber: 9,
    symbol: 'Kp',
    name: 'KPI Analysis',
    family: 'Data Analytics',
    isBrand: false,
    logo: 'concept-kpi',
    description: 'Tracking key performance indicators across department-wise and field operations.',
    projects: ['Coral BIOS Daily Report', 'Loan Application']
  },
  {
    atomicNumber: 10,
    symbol: 'Ta',
    name: 'Trend Analysis',
    family: 'Data Analytics',
    isBrand: false,
    logo: 'concept-trend',
    description: 'Evaluating Today vs Yesterday, weekly, and monthly performance trends.',
    projects: ['Coral BIOS Daily Report', 'Workforce Attendance']
  },
  {
    atomicNumber: 11,
    symbol: 'Ca',
    name: 'Comparative Analysis',
    family: 'Data Analytics',
    isBrand: false,
    logo: 'concept-compare',
    description: 'Departmental benchmarks, period-over-period comparison, and variance tracking.',
    projects: ['Data Management', 'Coral BIOS Daily Report']
  },
  {
    atomicNumber: 12,
    symbol: 'Dv',
    name: 'Data Validation',
    family: 'Data Analytics',
    isBrand: false,
    logo: 'concept-validate',
    description: 'Ensuring data accuracy, exception tracking, mismatch, shortage and damage audit.',
    projects: ['Godown Management', 'Loan Application']
  },

  // Business Analysis
  {
    atomicNumber: 13,
    symbol: 'Rg',
    name: 'Requirements Gathering',
    family: 'Business Analysis',
    isBrand: false,
    logo: 'concept-req',
    description: 'Translating department operational needs into functional system specifications.',
    projects: ['Coral BIOS FMS', 'Loan Application']
  },
  {
    atomicNumber: 14,
    symbol: 'Pm',
    name: 'Process Mapping',
    family: 'Business Analysis',
    isBrand: false,
    logo: 'concept-map',
    description: 'End-to-end lifecycle mapping: Application to Closure, Purchase to Dispatch.',
    projects: ['Godown Management', 'Coral BIOS FMS', 'Loan Application']
  },
  {
    atomicNumber: 15,
    symbol: 'Wd',
    name: 'Workflow Design',
    family: 'Business Analysis',
    isBrand: false,
    logo: 'concept-workflow',
    description: 'Structuring sequential approvals, status tracking, and role-based permissions.',
    projects: ['Coral BIOS FMS', 'Operational Productivity Tracker']
  },
  {
    atomicNumber: 16,
    symbol: 'Bp',
    name: 'Process Improvement',
    family: 'Business Analysis',
    isBrand: false,
    logo: 'concept-improve',
    description: 'Identifying bottlenecks, repetitive work, and operational reporting gaps.',
    projects: ['Payroll Analytics', 'Performance Analytics']
  },

  // Reporting & BI
  {
    atomicNumber: 17,
    symbol: 'Mr',
    name: 'MIS Reporting',
    family: 'Reporting & BI',
    isBrand: false,
    logo: 'concept-mis',
    description: 'Daily, weekly, monthly, and custom-period management reporting views.',
    projects: ['Coral BIOS Daily Report', 'Data Management']
  },
  {
    atomicNumber: 18,
    symbol: 'Dd',
    name: 'Dashboard Development',
    family: 'Reporting & BI',
    isBrand: false,
    logo: 'concept-dash',
    description: 'Building dynamic interactive dashboards with totals, averages, min/max, and raw values.',
    projects: ['Coral BIOS Daily Report', 'Performance Analytics']
  },
  {
    atomicNumber: 19,
    symbol: 'Mg',
    name: 'Management Reporting',
    family: 'Reporting & BI',
    isBrand: false,
    logo: 'concept-mgmt',
    description: 'Executive reporting, department comparisons, and summary scorecards.',
    projects: ['Coral BIOS Daily Report', 'Coral BIOS FMS']
  },

  // Automation
  {
    atomicNumber: 20,
    symbol: 'Ea',
    name: 'Excel Automation',
    family: 'Automation',
    isBrand: false,
    logo: 'concept-auto-excel',
    description: 'Automating repetitive spreadsheets, report generation, and data formulas.',
    projects: ['Payroll Analytics', 'Coral BIOS Daily Report']
  },
  {
    atomicNumber: 21,
    symbol: 'Ga',
    name: 'Google Sheets Automation',
    family: 'Automation',
    isBrand: false,
    logo: 'concept-auto-sheets',
    description: 'Automating cloud sheets, Drive storage, and cross-department syncing.',
    projects: ['Payroll Analytics', 'Coral BIOS Daily Report']
  },
  {
    atomicNumber: 22,
    symbol: 'Em',
    name: 'Email Automation',
    family: 'Automation',
    isBrand: false,
    logo: 'concept-email',
    description: 'One-click email distribution for payslips, automated reports, and notices.',
    projects: ['Payroll Analytics & Automation Platform']
  },
  {
    atomicNumber: 23,
    symbol: 'Ra',
    name: 'Report Automation',
    family: 'Automation',
    isBrand: false,
    logo: 'concept-report-auto',
    description: 'Reducing report preparation time from days to minutes.',
    projects: ['Performance Analytics Dashboard']
  },
  {
    atomicNumber: 24,
    symbol: 'Wa',
    name: 'Workflow Automation',
    family: 'Automation',
    isBrand: false,
    logo: 'concept-workflow-auto',
    description: 'Automating end-to-end task assignment and pipeline tracking.',
    projects: ['Operational Productivity Tracker']
  }
];

export const PRIMARY_PROJECTS: PrimaryProject[] = [
  {
    id: 'coral-bios-daily-report',
    index: '01',
    title: 'Coral BIOS Daily Report',
    kicker: 'Data Analytics • MIS • KPI Reporting',
    focus: 'Data Analytics • MIS • Dashboard Development • KPI Reporting',
    description:
      'Designed a dynamic reporting and analytics system connected with Google Sheets across multiple departments. Structured department and field-based reporting with KPI views, total entries, performance analysis, and Today vs Yesterday / weekly / monthly comparisons.',
    features: [
      'Multi-department Google Sheets integration',
      'Online, Offline & Floor Manager reporting views',
      'Totals, averages, min/max & raw-value analysis',
      'Date range filtering (Today, Yesterday, Weekly, Monthly)'
    ],
    tech: ['Google Sheets', 'Google Apps Script', 'Power BI', 'Excel'],
    impact: 'Centralized analytical visibility and reduced manual report analysis using real operational data.',
    image: '/projects/project-1.png'
  },
  {
    id: 'coral-bios-fms',
    index: '02',
    title: 'Coral BIOS FMS',
    kicker: 'Business Analysis • CRM • MIS • Operations',
    focus: 'Business Analysis • CRM • Workflow Design • MIS • Operations',
    description:
      'Designed the franchise lifecycle: Lead → Interested → Plan Selected → Token Received → Survey → Approval → Agreement → Setup → Training → Purchase → Launch → Active. Structured lead management, assignments, calls, follow-ups, requirements, objections, lead-to-franchise conversion, and linked Lead ID / Franchise ID records.',
    features: [
      '10-stage franchise lifecycle tracking (Lead to Active)',
      'Centralized Franchise 360 view for payments, GR & complaints',
      'Lead-to-Franchise conversion & document versioning',
      'Role-based access & franchise growth dashboard KPIs'
    ],
    tech: ['Business Analysis', 'SQL', 'MIS Reporting', 'Workflow Design'],
    impact: 'Connected separate franchise processes into one centralized system and improved visibility into the complete franchise journey.',
    image: '/projects/project-5.png'
  },
  {
    id: 'loan-application',
    index: '03',
    title: 'Loan Application',
    kicker: 'Financial Workflow • Data Management • Automation',
    focus: 'Financial Workflow • Data Management • Automation • Reporting',
    description:
      'Mapped the complete loan lifecycle: Application → Approval → EMI Schedule → Deduction → Adjustment → Outstanding → Closure. Structured employee-wise loan records and designed loan application, approval, EMI schedule, repayment, deduction, adjustment, outstanding, and closure workflows.',
    features: [
      'Mapped complete loan lifecycle (Application to Closure)',
      'Structured employee-wise loan records & EMI schedules',
      'Defined active loans, pending EMIs & recovery reporting',
      'Centralized financial data & eliminated manual records'
    ],
    tech: ['Excel', 'Google Sheets', 'Google Apps Script', 'MIS Reporting'],
    impact: 'Centralized loan information, reduced scattered manual records, and improved financial visibility.',
    image: '/projects/project-3.png'
  },
  {
    id: 'godown-management',
    index: '04',
    title: 'Godown Management',
    kicker: 'Inventory • Warehouse Operations • QC • Dispatch',
    focus: 'Inventory • Warehouse Operations • QC • Dispatch • MIS',
    description:
      'Mapped warehouse workflow: Purchase → Inward → QC → Stock → Picking → Checking → Scanning → Packing → Parcel → Dispatch. Designed inward, outward, GR/return, QC, picking, packing, parcel, courier, and transport workflows with operational statuses and pending-work tracking.',
    features: [
      '10-step warehouse workflow from Purchase to Dispatch',
      'Exception tracking for mismatch, damage, shortage & missing items',
      'Structured transaction data connecting POs, debit/credit notes',
      'Operational status tracking & bottleneck detection'
    ],
    tech: ['Excel', 'Google Sheets', 'Google Apps Script', 'Power BI', 'SQL'],
    impact: 'Improved visibility into warehouse operations and enabled management to identify pending work and bottlenecks.',
    image: '/projects/project-4.png'
  },
  {
    id: 'data-management',
    index: '05',
    title: 'Data Management',
    kicker: 'Data Architecture • Department Sync • Consolidation',
    focus: 'Data Cleaning • Comparative Analysis • Operational Data',
    description:
      'Worked with large operational datasets and converted raw information into structured reports; performed data validation, cleaning, consolidation, and comparative analysis across department-level work trends.',
    features: [
      'Data validation, cleaning & consolidation',
      'Departmental comparative analysis & trend tracking',
      'Raw-value analysis & total entries breakdown',
      'Centralized data architecture for executive reporting'
    ],
    tech: ['Excel', 'Google Sheets', 'SQL', 'Data Analytics'],
    impact: 'Centralized analytical visibility across multiple business departments and streamlined decision-making.',
    image: '/projects/project-2.png'
  }
];

export const SECONDARY_PROJECTS: SecondaryProject[] = [
  {
    id: 'sec-payroll',
    index: '01',
    title: 'Payroll Analytics & Automation Platform',
    kicker: 'Payroll • Automation',
    description: 'Automated payroll calculations and one-click payslip distribution; reduced payroll-related queries by more than 90%.',
    impact: 'Reduced payroll-related queries by >90%',
    tech: ['Excel', 'Google Sheets', 'Google Apps Script', 'Automation']
  },
  {
    id: 'sec-performance',
    index: '02',
    title: 'Performance Analytics Dashboard',
    kicker: 'Performance • Reporting',
    description: 'Integrated attendance, daily reporting and productivity data; reduced report generation from 2–3 days to approximately 30 minutes.',
    impact: 'Report prep cut from 2-3 days to ~30 mins',
    tech: ['Google Sheets', 'Google Apps Script', 'Power BI']
  },
  {
    id: 'sec-attendance',
    index: '03',
    title: 'Workforce Attendance Analytics',
    kicker: 'Attendance • Planning',
    description: 'Tracked late arrivals, half-days and attendance trends to support data-driven workforce discipline and planning.',
    impact: 'Data-driven workforce discipline & planning',
    tech: ['Excel', 'Google Sheets', 'Data Analytics']
  },
  {
    id: 'sec-productivity',
    index: '04',
    title: 'Operational Productivity Tracker',
    kicker: 'Productivity • Reminders',
    description: 'Enabled task assignment, automated reminders and completion visibility; improved productivity by approximately 30%.',
    impact: 'Improved team productivity by ~30%',
    tech: ['Google Sheets', 'Google Apps Script', 'Workflow Design']
  },
  {
    id: 'sec-warehouse',
    index: '05',
    title: 'Warehouse Picking Automation',
    kicker: 'Logistics • Efficiency',
    description: 'Generated rack, row and bin-level picking slips to reduce product search time and improve warehouse efficiency.',
    impact: 'Reduced search time & improved warehouse efficiency',
    tech: ['Excel', 'SQL', 'Process Mapping']
  },
  {
    id: 'sec-content',
    index: '06',
    title: 'Content Workflow Analytics',
    kicker: 'Pipeline • Workload',
    description: 'Centralised video editing workload and pipeline tracking; increased team productivity by approximately 40% and improved data accuracy to 80–85%.',
    impact: 'Increased team productivity by ~40% (80-85% accuracy)',
    tech: ['Google Sheets', 'MIS Reporting', 'Dashboard Development']
  }
];

export const PROJECTS = PRIMARY_PROJECTS; // Backward compatibility

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: 'exp-1',
    period: 'Present',
    title: 'MIS / Business Operations & Process Automation',
    organization: 'AJIT ZONE PVT. LTD.',
    location: 'Surat, Gujarat',
    type: 'experience',
    details: [
      'Worked across business reporting, operational data management, dashboards, automation, and process improvement.',
      'Prepared and maintained structured MIS reports for business operations and analyzed department-wise performance, productivity, operational activity, and trends.',
      'Worked with large operational datasets and converted raw information into structured reports; performed data validation, cleaning, consolidation, and comparative analysis.',
      'Created KPI-based reports and dashboards for management review, including daily, weekly, monthly, and custom-period reporting views.',
      'Developed Excel and Google Sheets dashboards with KPI cards, trend analysis, department comparisons, and performance views.',
      'Automated repetitive business workflows using Excel, Google Sheets, and Google Apps Script.',
      'Designed automated payroll and payslip workflows including calculations, deductions, document generation, storage, and email distribution.',
      'Reduced payroll-related queries from approximately 20–30 per month to around 2–3 per month through improved process visibility and automation.',
      'Automated performance reporting workflows and reduced report preparation time from approximately 2–3 days to around 30 minutes.',
      'Analyzed existing business processes to identify repetitive work, bottlenecks, and reporting gaps; converted business requirements into structured workflows and system requirements.',
      'Coordinated with different departments to understand operational requirements and designed solutions combining business processes, data, reporting, and automation.'
    ],
    metrics: 'Reduced payroll queries by >90% & reporting prep from 3 days to 30 mins'
  },
  {
    id: 'edu-1',
    period: 'Graduate',
    title: 'Bachelor of Business Administration (BBA)',
    organization: 'Surat University / College',
    location: 'Surat, Gujarat',
    type: 'education',
    details: [
      'Specialization: Human Resources',
      'Focused on organizational operations, human resource management, workflow optimization, and business analytics fundamentals.'
    ]
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    index: '01 / 05',
    label: 'Payroll Query Reduction',
    caption: 'Process Visibility & Email Automation',
    detail: 'Reduced monthly payroll queries from 20-30 down to 2-3 through automated calculation & distribution.',
    metric: 90,
    suffix: '%',
    logo: 'excel.svg',
    brandColor: '#107c41'
  },
  {
    id: 'ach-2',
    index: '02 / 05',
    label: 'Report Preparation Saved',
    caption: 'Performance Workflow Automation',
    detail: 'Automated performance reporting workflows, reducing preparation time from 2-3 days to 30 minutes.',
    metric: 95,
    suffix: '%',
    logo: 'googleappsscript.svg',
    brandColor: '#4285f4'
  },
  {
    id: 'ach-3',
    index: '03 / 05',
    label: 'Productivity Improvement',
    caption: 'Task Productivity Tracker',
    detail: 'Supported ~30% improvement in department productivity through task assignment & completion tracking.',
    metric: 30,
    suffix: '%',
    logo: 'googlesheets.svg',
    brandColor: '#0f9d58'
  },
  {
    id: 'ach-4',
    index: '04 / 05',
    label: 'Analytics Experience',
    caption: 'MIS & Business Operations',
    detail: '2+ years of hands-on experience converting business requirements & operational data into KPI dashboards.',
    metric: 2,
    prefix: '',
    suffix: '+ Yrs',
    logo: 'powerbi.svg',
    brandColor: '#f2c811'
  },
  {
    id: 'ach-5',
    index: '05 / 05',
    label: 'Core Analytics Systems',
    caption: 'Featured Enterprise Solutions',
    detail: 'Designed & delivered 5 primary visual software analytics solutions across Loan, Inventory, Daily MIS, and Franchise CRM.',
    metric: 5,
    suffix: ' Systems',
    logo: 'sql.svg',
    brandColor: '#336791'
  }
];

export const CERTIFICATIONS = [];
