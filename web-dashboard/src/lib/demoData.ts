export type Lead = {
  id: string;
  from: string;
  message: string;
  address: string;
  receivedAt: string;
};

export type JobStatus = "New" | "Scheduled" | "In Progress" | "Completed";

export type Job = {
  id: string;
  title: string;
  customer: string;
  phone: string;
  address: string;
  status: JobStatus;
  scheduledFor?: string;
  notes: string[];
};

export const leads: Lead[] = [
  {
    id: "l-2001",
    from: "Sarah M.",
    message:
      "Hey! Our kitchen lights keep flickering and one outlet is warm. Can you come take a look?",
    address: "St. Louis Park, MN",
    receivedAt: "Today 9:12 AM",
  },
  {
    id: "l-2002",
    from: "Mike R.",
    message:
      "Need an EV charger installed in the garage. Panel is 200A. What’s the next step?",
    address: "Edina, MN",
    receivedAt: "Today 10:03 AM",
  },
  {
    id: "l-2003",
    from: "Amina K.",
    message:
      "Basement finish. Need estimate for 14 can lights + new circuits. I can send photos.",
    address: "Minneapolis, MN",
    receivedAt: "Today 11:27 AM",
  },
];

export const jobs: Job[] = [
  {
    id: "j-1001",
    title: "Service Call — Flicker + Warm Receptacle",
    customer: "Sarah M.",
    phone: "(612) 555-0139",
    address: "St. Louis Park, MN",
    status: "New",
    notes: [
      "Customer reports warm receptacle — prioritize safety.",
      "Ask for photo of panel + outlet location.",
    ],
  },
  {
    id: "j-1002",
    title: "EV Charger Install — Garage",
    customer: "Mike R.",
    phone: "(952) 555-0191",
    address: "Edina, MN",
    status: "Scheduled",
    scheduledFor: "Mon 2:00 PM",
    notes: [
      "200A panel reported; confirm load calc + breaker space.",
      "Recommend 60A circuit + 48A charger (depending on unit).",
    ],
  },
  {
    id: "j-1003",
    title: "Basement Finish — Lighting + Circuits",
    customer: "Amina K.",
    phone: "(763) 555-0110",
    address: "Minneapolis, MN",
    status: "In Progress",
    scheduledFor: "Thu 9:00 AM",
    notes: ["Waiting on photos + ceiling plan.", "Drafting estimate ranges."],
  },
  {
    id: "j-1004",
    title: "Panel Label + Circuit Cleanup",
    customer: "Jeff T.",
    phone: "(651) 555-0142",
    address: "Roseville, MN",
    status: "Completed",
    notes: ["Delivered final panel directory + photo log.", "Upsold surge protection."],
  },
];

export function getJob(id: string) {
  return jobs.find((j) => j.id === id);
}

