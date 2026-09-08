const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("./db");

const DEFAULT_PASS = bcrypt.hashSync("Password123!", 10);

console.log("Seeding users...");

const additionalUsers = [
  {
    id: uuidv4(),
    name: "Priya Sharma",
    email: "priya@test.edu",
    password: DEFAULT_PASS,
    role: "student",
    department: "Mechanical Engineering",
  },
  {
    id: uuidv4(),
    name: "Aarav Patel",
    email: "aarav@test.edu",
    password: DEFAULT_PASS,
    role: "student",
    department: "Electronics & Communication",
  },
  {
    id: uuidv4(),
    name: "Ananya Iyer",
    email: "ananya@test.edu",
    password: DEFAULT_PASS,
    role: "student",
    department: "Biotechnology",
  },
  {
    id: uuidv4(),
    name: "Rohan Verma",
    email: "rohan@test.edu",
    password: DEFAULT_PASS,
    role: "student",
    department: "Computer Science",
  },
  {
    id: uuidv4(),
    name: "Suresh Electrician",
    email: "electrician@test.edu",
    password: DEFAULT_PASS,
    role: "repairman",
    department: "Electrical Maintenance",
  },
  {
    id: uuidv4(),
    name: "Dr. Sunita Rao",
    email: "hod.mech@test.edu",
    password: DEFAULT_PASS,
    role: "hod",
    department: "Mechanical Engineering",
  },
  {
    id: uuidv4(),
    name: "Meena Kumari",
    email: "warden.girls@test.edu",
    password: DEFAULT_PASS,
    role: "warden",
    department: "Girls Hostel B",
  },
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, name, email, password, role, department, created_at)
  VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))
`);

additionalUsers.forEach((u, i) => {
  insertUser.run(u.id, u.name, u.email, u.password, u.role, u.department, `-${i + 2} days`);
  console.log(`User created: ${u.name} (${u.role})`);
});

// Fetch all students and staff for complaint mapping
const students = db.prepare("SELECT id, name, department FROM users WHERE role = 'student'").all();
const staff = db.prepare("SELECT id, name, role, department FROM users WHERE role != 'student'").all();

const findStaff = (role, nameSub) =>
  staff.find((s) => s.role === role && (!nameSub || s.name.includes(nameSub))) || staff.find((s) => s.role === role);

const rajesh = findStaff("repairman", "Rajesh");
const suresh = findStaff("repairman", "Suresh");
const proctor = findStaff("proctor");
const warden = findStaff("warden", "Hostel");
const meena = findStaff("warden", "Meena");
const hodCS = findStaff("hod", "CS");
const hodMech = findStaff("hod", "Sunita");
const admin = findStaff("admin");

console.log("Seeding complaints...");

const complaintsData = [
  // Facilities / Maintenance
  {
    title: "Ceiling fan making loud screeching noise in Lecture Hall 102",
    category: "Campus Facilities & Maintenance",
    description: "The third fan from the front chalkboard makes a continuous metal squeal, making lectures difficult to hear.",
    department: "Academic Block 1",
    status: "in_review",
    assigned: suresh,
    responder: suresh,
    response: "Motor bearing inspected. Replacement part ordered from vendor; will replace tomorrow morning.",
    daysAgo: 3,
    updatedDaysAgo: 1,
  },
  {
    title: "AC unit in Central Library silent zone blowing warm air",
    category: "Campus Facilities & Maintenance",
    description: "The 2-ton cassette AC near reference rack 4 has stopped chilling. The study hall is uncomfortably hot.",
    department: "Central Library",
    status: "submitted",
    assigned: null,
    responder: null,
    response: null,
    daysAgo: 1,
    updatedDaysAgo: 1,
  },
  {
    title: "Fluorescent tubelights flickering in Chemistry Lab 3",
    category: "Campus Facilities & Maintenance",
    description: "Two overhead lights flicker rapidly during titrations, creating a strain during evening lab hours.",
    department: "Science Block",
    status: "resolved",
    assigned: suresh,
    responder: suresh,
    response: "Replaced electronic choke and tubes with energy-efficient LED fixtures. Illuminance verified.",
    daysAgo: 7,
    updatedDaysAgo: 4,
  },
  {
    title: "Broken desk handles and loose benches in Seminar Hall 2",
    category: "Campus Facilities & Maintenance",
    description: "Row D desks are unstable with screws protruding, posing risk of tearing backpacks and clothing.",
    department: "Main Auditorium",
    status: "in_review",
    assigned: rajesh,
    responder: rajesh,
    response: "Carpentry team dispatched. Re-anchored loose desk tops in Row D.",
    daysAgo: 4,
    updatedDaysAgo: 2,
  },
  {
    title: "High-pressure tap valve loose in ground floor washroom",
    category: "Campus Facilities & Maintenance",
    description: "Tap spraying water uncontrollably on the mirror and floor near CSE seminar room.",
    department: "Engineering Wing",
    status: "resolved",
    assigned: rajesh,
    responder: rajesh,
    response: "Valve spindle replaced and pressure regulator calibrated. Washroom reopened.",
    daysAgo: 10,
    updatedDaysAgo: 8,
  },

  // Hostel & Mess
  {
    title: "Hot water geyser tripping MCB breaker on 3rd floor Hostel A",
    category: "Hostel & Mess",
    description: "Whenever the geyser is switched on in the 3rd floor west bathroom, the entire wing circuit breaker trips.",
    department: "Hostel Block A",
    status: "in_review",
    assigned: suresh,
    responder: suresh,
    response: "Detected ground leakage in heating coil. Replacing the 25L element this afternoon.",
    daysAgo: 2,
    updatedDaysAgo: 1,
  },
  {
    title: "Water purifier filters in Mess Block overdue for maintenance",
    category: "Hostel & Mess",
    description: "The RO drinking water station tastes saline and TDS meter reads 420 ppm. Service indicator is red.",
    department: "Hostel Mess 1",
    status: "submitted",
    assigned: warden,
    responder: null,
    response: null,
    daysAgo: 2,
    updatedDaysAgo: 2,
  },
  {
    title: "Laundry room front-loading washing machine 2 drum jammed",
    category: "Hostel & Mess",
    description: "Machine displays error code E04 mid-cycle and locks door. Student clothes stuck inside.",
    department: "Girls Hostel B",
    status: "resolved",
    assigned: rajesh,
    responder: meena,
    response: "Technician cleared trapped coin from drain pump. Clothes retrieved and cycle tested.",
    daysAgo: 8,
    updatedDaysAgo: 6,
  },
  {
    title: "Stray dog entering ground floor corridor through broken screen gate",
    category: "Hostel & Mess",
    description: "Rear entrance latch is broken, allowing animals into the residential block at night.",
    department: "Hostel Block A",
    status: "resolved",
    assigned: warden,
    responder: warden,
    response: "Heavy-duty latch and spring closer installed on rear door. Security patrol briefed.",
    daysAgo: 12,
    updatedDaysAgo: 10,
  },

  // Discipline & Safety
  {
    title: "Motorbike speeding and rash driving in campus pedestrian pathway",
    category: "Discipline & Safety",
    description: "Two modified exhaust bikes repeatedly speeding past student walkway near gate 3 between 5-6 PM.",
    department: "Proctorial Office",
    status: "in_review",
    assigned: proctor,
    responder: proctor,
    response: "CCTV footage retrieved from Gate 3 camera. Vehicle registration numbers identified. Owners summoned.",
    daysAgo: 4,
    updatedDaysAgo: 2,
  },
  {
    title: "Unauthorized loud speakers in courtyard after 10 PM quiet hours",
    category: "Discipline & Safety",
    description: "Loud Bluetooth sound systems played in quadrangle disturbing students preparing for exam week.",
    department: "Student Affairs",
    status: "resolved",
    assigned: proctor,
    responder: proctor,
    response: "Security warned students involved and confiscated sound equipment for the examination period.",
    daysAgo: 9,
    updatedDaysAgo: 7,
  },
  {
    title: "Lost student ID card and wallet found in Cafeteria lounge",
    category: "Discipline & Safety",
    description: "Brown leather wallet with college ID card handed over to counter staff; filing here for notice.",
    department: "Student Center",
    status: "resolved",
    assigned: proctor,
    responder: proctor,
    response: "Owner contacted via student portal directory and wallet claimed safely.",
    daysAgo: 15,
    updatedDaysAgo: 14,
  },

  // Academic & Curriculum
  {
    title: "Examination schedule conflict between Open Elective and Distributed Systems",
    category: "Academic & Curriculum",
    description: "Both exams are scheduled for September 24th forenoon session (9:30 AM - 12:30 PM).",
    department: "Computer Science",
    status: "in_review",
    assigned: hodCS,
    responder: hodCS,
    response: "Conflict acknowledged. Controller of Examinations notified to reschedule Open Elective slot to Sept 26.",
    daysAgo: 3,
    updatedDaysAgo: 1,
  },
  {
    title: "Fluid Mechanics Lab setup missing calibrated manometer sensors",
    category: "Academic & Curriculum",
    description: "Experiment 4 venturimeter rig has broken manometer tube. Three batches unable to record readings.",
    department: "Mechanical Engineering",
    status: "resolved",
    assigned: hodMech,
    responder: hodMech,
    response: "Two spare U-tube manometers installed and calibrated. Make-up lab slot arranged for affected batches.",
    daysAgo: 11,
    updatedDaysAgo: 8,
  },
  {
    title: "Course notes and slides for Unit 4 not uploaded to portal",
    category: "Academic & Curriculum",
    description: "Course instructor was on conference leave and study slides for Compiler Design are still missing.",
    department: "Computer Science",
    status: "resolved",
    assigned: hodCS,
    responder: hodCS,
    response: "Slide decks and previous year question solutions have been published to the Google Classroom.",
    daysAgo: 6,
    updatedDaysAgo: 4,
  },

  // Faculty & Teaching
  {
    title: "Request for tutorial problem solving hour for Engineering Mathematics III",
    category: "Faculty & Teaching",
    description: "Students struggling with Fourier Transform numerical questions. Requesting 1 extra weekly tutorial.",
    department: "Electronics & Communication",
    status: "resolved",
    assigned: hodCS,
    responder: hodCS,
    response: "Faculty advisor has scheduled a weekly review workshop on Thursdays 4:30 PM in Room 305.",
    daysAgo: 14,
    updatedDaysAgo: 11,
  },

  // Fees & Accounts
  {
    title: "Double debit during online semester registration payment gateway",
    category: "Fees & Accounts",
    description: "Payment gateway timed out on UPI app, and account was debited twice for Rs. 42,500.",
    department: "Finance & Accounts",
    status: "in_review",
    assigned: admin,
    responder: admin,
    response: "Bank merchant reference numbers verified with ICICI gateway. Charge reversal initiated.",
    daysAgo: 5,
    updatedDaysAgo: 2,
  },
  {
    title: "Late fee penalty charged despite approved government scholarship delay",
    category: "Fees & Accounts",
    description: "Post-matric scholarship portal was down state-wide; college portal added late fee penalty of Rs. 2,000.",
    department: "Office of the Dean",
    status: "resolved",
    assigned: admin,
    responder: admin,
    response: "Late fee waived across all scholarship recipients. Revised fee receipt generated in student portal.",
    daysAgo: 16,
    updatedDaysAgo: 13,
  },

  // Other / Rejection example
  {
    title: "Request to change semester elective after 3 weeks of classes",
    category: "Other",
    description: "I want to switch from Machine Learning to Cyber Security because timetable is inconvenient.",
    department: "Academic Section",
    status: "rejected",
    assigned: hodCS,
    responder: hodCS,
    response: "As per university academic regulations clause 4.2, elective change window closed on day 7 of semester.",
    daysAgo: 8,
    updatedDaysAgo: 7,
  },
];

const insertComplaint = db.prepare(`
  INSERT INTO complaints (
    id, student_id, title, category, description, department,
    status, hod_response, assigned_to, assigned_to_name,
    responder_role, responder_name, created_at, updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))
`);

complaintsData.forEach((c, index) => {
  const student = students[index % students.length];
  const compId = uuidv4();
  insertComplaint.run(
    compId,
    student.id,
    c.title,
    c.category,
    c.description,
    c.department,
    c.status,
    c.response,
    c.assigned ? c.assigned.id : null,
    c.assigned ? c.assigned.name : null,
    c.responder ? c.responder.role : null,
    c.responder ? c.responder.name : null,
    `-${c.daysAgo} days`,
    `-${c.updatedDaysAgo} days`
  );
  console.log(`Seeded complaint: [${c.category}] ${c.title.substring(0, 35)}... (${c.status})`);
});

console.log("\nSeeding complete!");
const counts = db.prepare("SELECT status, count(*) as count FROM complaints GROUP BY status").all();
console.log("Complaints breakdown:", counts);
