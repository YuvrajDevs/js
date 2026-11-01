export type Status = "new" | "ranked" | "tailored" | "applied" | "interview" | "offer" | "rejected" | "skipped";
export interface Job { id: string; source: string; company: string; title: string; location: string; url: string; description: string; postedAt?: string; country?: string; lang?: string; remoteFromIndia?: boolean | null; visa?: boolean | null; relocation?: boolean | null; langRequired?: string; salaryInrMonthly?: number | null; req?: Req; competition?: "low" | "medium" | "high"; score?: number; reason?: string; status: Status }

export interface Req { must: string[]; nice: string[]; tech: string[]; ai: string[]; responsibilities: string[]; signals: string[]; seniority?: string }
