export const analytics = {
  timeToFill: {
    avg: 18.4,
    byDepartment: [
      { dept: 'Finance', avg: 16.2 },
      { dept: 'Client Services', avg: 24.5 },
      { dept: 'Human Resources', avg: 12.8 },
    ],
    trend: [
      { month: 'Jan', value: 22 },
      { month: 'Feb', value: 20 },
      { month: 'Mar', value: 19.5 },
      { month: 'Apr', value: 18.1 },
      { month: 'May', value: 17.6 },
      { month: 'Jun', value: 18.4 },
    ],
  },
  costPerHire: {
    avg: 4210,
    bySource: [
      { source: 'LinkedIn', cost: 1200 },
      { source: 'Indeed', cost: 800 },
      { source: 'Employee Referral', cost: 400 },
      { source: 'Career Site', cost: 150 },
      { source: 'ZipRecruiter', cost: 650 },
    ],
  },
  offerAcceptanceRate: {
    overall: 0.92,
    byRoleType: [
      { role: 'Manager', rate: 0.88 },
      { role: 'IC', rate: 0.95 },
      { role: 'Director', rate: 0.83 },
    ],
    trend: [
      { month: 'Jan', value: 0.85 },
      { month: 'Feb', value: 0.87 },
      { month: 'Mar', value: 0.89 },
      { month: 'Apr', value: 0.90 },
      { month: 'May', value: 0.91 },
      { month: 'Jun', value: 0.92 },
    ],
  },
  interviewToOfferRatio: {
    overall: 4.2,
    byDepartment: [
      { dept: 'Finance', ratio: 3.8 },
      { dept: 'Client Services', ratio: 5.1 },
      { dept: 'Human Resources', ratio: 3.2 },
    ],
  },
  sourceRoi: [
    { source: 'LinkedIn', applicants: 84, interviews: 22, hires: 9, conversionRate: 0.107, avgDays: 16.2 },
    { source: 'Employee Referral', applicants: 31, interviews: 14, hires: 8, conversionRate: 0.258, avgDays: 12.4 },
    { source: 'Career Site', applicants: 62, interviews: 11, hires: 4, conversionRate: 0.065, avgDays: 21.1 },
    { source: 'Indeed', applicants: 94, interviews: 8, hires: 2, conversionRate: 0.021, avgDays: 24.7 },
    { source: 'ZipRecruiter', applicants: 47, interviews: 4, hires: 0, conversionRate: 0, avgDays: null },
  ],
}
