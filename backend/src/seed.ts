import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import Candidate from './models/Candidate';
import CandidateSkill from './models/CandidateSkill';
import Employer from './models/Employer';
import Job from './models/Job';
import Application from './models/Application';
import Notification from './models/Notification';

dotenv.config();

async function seed() {
  const uri = process.env.MONGODB_URI as string;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Candidate.deleteMany({}),
    CandidateSkill.deleteMany({}),
    Employer.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  const hashedPassword = await bcrypt.hash('Tester@123', 10);

  // ── Users ──────────────────────────────────────────────
  const [
    candidateUser,
    employer1User,
    employer2User,
    // Additional candidates
    c2User, c3User, c4User, c5User, c6User, c7User, c8User, c9User,
  ] = await User.insertMany([
    { email: 'tester@gmail.com',      password: hashedPassword, role: 'candidate', isEmailVerified: true },
    { email: 'hr@infosys.com',        password: hashedPassword, role: 'employer',  isEmailVerified: true },
    { email: 'hr@wipro.com',          password: hashedPassword, role: 'employer',  isEmailVerified: true },
    { email: 'priya.nair@gmail.com',  password: hashedPassword, role: 'candidate', isEmailVerified: true },
    { email: 'arjun.dev@gmail.com',   password: hashedPassword, role: 'candidate', isEmailVerified: true },
    { email: 'sneha.data@gmail.com',  password: hashedPassword, role: 'candidate', isEmailVerified: true },
    { email: 'vikram.ops@gmail.com',  password: hashedPassword, role: 'candidate', isEmailVerified: true },
    { email: 'anjali.java@gmail.com', password: hashedPassword, role: 'candidate', isEmailVerified: true },
    { email: 'rohit.mobile@gmail.com',password: hashedPassword, role: 'candidate', isEmailVerified: true },
    { email: 'meera.ui@gmail.com',    password: hashedPassword, role: 'candidate', isEmailVerified: true },
    { email: 'karan.qa@gmail.com',    password: hashedPassword, role: 'candidate', isEmailVerified: true },
  ]);
  console.log('Created users');

  // ── Candidate profiles ──────────────────────────────────
  const candidateProfile = await Candidate.create({
    user: candidateUser._id,
    firstName: 'Rahul', lastName: 'Sharma',
    phone: '+91-9876543210', location: 'Bangalore, India',
    bio: 'Full-stack developer with 3 years of experience building web applications using React, Node.js, and cloud technologies.',
    yearsOfExperience: 3, githubUrl: 'https://github.com/rahulsharma',
  });
  await CandidateSkill.insertMany([
    { candidateId: candidateProfile._id, skillName: 'JavaScript', rating: 4 },
    { candidateId: candidateProfile._id, skillName: 'TypeScript', rating: 4 },
    { candidateId: candidateProfile._id, skillName: 'React',      rating: 4 },
    { candidateId: candidateProfile._id, skillName: 'Node.js',    rating: 3 },
    { candidateId: candidateProfile._id, skillName: 'Python',     rating: 3 },
    { candidateId: candidateProfile._id, skillName: 'MongoDB',    rating: 3 },
    { candidateId: candidateProfile._id, skillName: 'AWS',        rating: 2 },
    { candidateId: candidateProfile._id, skillName: 'Docker',     rating: 2 },
  ]);

  const priyaProfile = await Candidate.create({
    user: c2User._id,
    firstName: 'Priya', lastName: 'Nair',
    phone: '+91-9123456780', location: 'Chennai, India',
    bio: 'Frontend developer specialising in React and Angular with a passion for pixel-perfect UIs and smooth user experiences.',
    yearsOfExperience: 4, githubUrl: 'https://github.com/priyanair',
  });
  await CandidateSkill.insertMany([
    { candidateId: priyaProfile._id, skillName: 'React',      rating: 5 },
    { candidateId: priyaProfile._id, skillName: 'TypeScript', rating: 4 },
    { candidateId: priyaProfile._id, skillName: 'Angular',    rating: 4 },
    { candidateId: priyaProfile._id, skillName: 'Redux',      rating: 4 },
    { candidateId: priyaProfile._id, skillName: 'CSS',        rating: 5 },
    { candidateId: priyaProfile._id, skillName: 'Jest',       rating: 3 },
    { candidateId: priyaProfile._id, skillName: 'RxJS',       rating: 3 },
  ]);

  const arjunProfile = await Candidate.create({
    user: c3User._id,
    firstName: 'Arjun', lastName: 'Menon',
    phone: '+91-9988776655', location: 'Hyderabad, India',
    bio: 'Backend engineer with 5 years building scalable Node.js microservices and REST APIs for fintech clients.',
    yearsOfExperience: 5, githubUrl: 'https://github.com/arjunmenon',
  });
  await CandidateSkill.insertMany([
    { candidateId: arjunProfile._id, skillName: 'Node.js',    rating: 5 },
    { candidateId: arjunProfile._id, skillName: 'Express.js', rating: 5 },
    { candidateId: arjunProfile._id, skillName: 'MongoDB',    rating: 4 },
    { candidateId: arjunProfile._id, skillName: 'TypeScript', rating: 4 },
    { candidateId: arjunProfile._id, skillName: 'Docker',     rating: 4 },
    { candidateId: arjunProfile._id, skillName: 'Redis',      rating: 3 },
    { candidateId: arjunProfile._id, skillName: 'GraphQL',    rating: 3 },
  ]);

  const snehaProfile = await Candidate.create({
    user: c4User._id,
    firstName: 'Sneha', lastName: 'Kulkarni',
    phone: '+91-9876001234', location: 'Pune, India',
    bio: 'Data engineer with expertise in building ETL pipelines and large-scale data warehouses on AWS.',
    yearsOfExperience: 4, githubUrl: 'https://github.com/snehakulkarni',
  });
  await CandidateSkill.insertMany([
    { candidateId: snehaProfile._id, skillName: 'Python',        rating: 5 },
    { candidateId: snehaProfile._id, skillName: 'SQL',           rating: 5 },
    { candidateId: snehaProfile._id, skillName: 'Apache Spark',  rating: 4 },
    { candidateId: snehaProfile._id, skillName: 'AWS',           rating: 4 },
    { candidateId: snehaProfile._id, skillName: 'Airflow',       rating: 4 },
    { candidateId: snehaProfile._id, skillName: 'Kafka',         rating: 3 },
    { candidateId: snehaProfile._id, skillName: 'dbt',           rating: 3 },
  ]);

  const vikramProfile = await Candidate.create({
    user: c5User._id,
    firstName: 'Vikram', lastName: 'Singh',
    phone: '+91-9001122334', location: 'Bangalore, India',
    bio: 'DevOps engineer with 6 years managing cloud infrastructure across AWS and Azure with heavy IaC experience.',
    yearsOfExperience: 6, githubUrl: 'https://github.com/vikramsingh',
  });
  await CandidateSkill.insertMany([
    { candidateId: vikramProfile._id, skillName: 'AWS',        rating: 5 },
    { candidateId: vikramProfile._id, skillName: 'Docker',     rating: 5 },
    { candidateId: vikramProfile._id, skillName: 'Kubernetes', rating: 5 },
    { candidateId: vikramProfile._id, skillName: 'Terraform',  rating: 4 },
    { candidateId: vikramProfile._id, skillName: 'Jenkins',    rating: 4 },
    { candidateId: vikramProfile._id, skillName: 'Azure',      rating: 3 },
    { candidateId: vikramProfile._id, skillName: 'Ansible',    rating: 3 },
  ]);

  const anjaliProfile = await Candidate.create({
    user: c6User._id,
    firstName: 'Anjali', lastName: 'Verma',
    phone: '+91-9123000456', location: 'Hyderabad, India',
    bio: 'Java Spring Boot developer with strong experience in microservices architecture for banking and insurance sectors.',
    yearsOfExperience: 5, githubUrl: 'https://github.com/anjaliverma',
  });
  await CandidateSkill.insertMany([
    { candidateId: anjaliProfile._id, skillName: 'Java',          rating: 5 },
    { candidateId: anjaliProfile._id, skillName: 'Spring Boot',   rating: 5 },
    { candidateId: anjaliProfile._id, skillName: 'Microservices', rating: 4 },
    { candidateId: anjaliProfile._id, skillName: 'PostgreSQL',    rating: 4 },
    { candidateId: anjaliProfile._id, skillName: 'Kafka',         rating: 4 },
    { candidateId: anjaliProfile._id, skillName: 'Docker',        rating: 3 },
    { candidateId: anjaliProfile._id, skillName: 'AWS',           rating: 3 },
  ]);

  const rohitProfile = await Candidate.create({
    user: c7User._id,
    firstName: 'Rohit', lastName: 'Desai',
    phone: '+91-9988001122', location: 'Mumbai, India',
    bio: 'React Native developer with 3 years delivering cross-platform mobile apps for e-commerce and logistics clients.',
    yearsOfExperience: 3, githubUrl: 'https://github.com/rohitdesai',
  });
  await CandidateSkill.insertMany([
    { candidateId: rohitProfile._id, skillName: 'React Native', rating: 5 },
    { candidateId: rohitProfile._id, skillName: 'JavaScript',   rating: 5 },
    { candidateId: rohitProfile._id, skillName: 'TypeScript',   rating: 4 },
    { candidateId: rohitProfile._id, skillName: 'Redux',        rating: 4 },
    { candidateId: rohitProfile._id, skillName: 'Firebase',     rating: 4 },
    { candidateId: rohitProfile._id, skillName: 'Swift',        rating: 2 },
  ]);

  const meeraProfile = await Candidate.create({
    user: c8User._id,
    firstName: 'Meera', lastName: 'Iyer',
    phone: '+91-9765432100', location: 'Bangalore, India',
    bio: 'UI/UX designer with 5 years crafting design systems and user research-led experiences for SaaS products.',
    yearsOfExperience: 5, githubUrl: 'https://github.com/meeraiyer',
  });
  await CandidateSkill.insertMany([
    { candidateId: meeraProfile._id, skillName: 'Figma',         rating: 5 },
    { candidateId: meeraProfile._id, skillName: 'User Research',  rating: 5 },
    { candidateId: meeraProfile._id, skillName: 'Prototyping',    rating: 5 },
    { candidateId: meeraProfile._id, skillName: 'Adobe XD',       rating: 4 },
    { candidateId: meeraProfile._id, skillName: 'CSS',            rating: 3 },
    { candidateId: meeraProfile._id, skillName: 'Zeplin',         rating: 3 },
  ]);

  const karanProfile = await Candidate.create({
    user: c9User._id,
    firstName: 'Karan', lastName: 'Mehta',
    phone: '+91-9012345678', location: 'Pune, India',
    bio: 'QA automation engineer with expertise in Selenium, API testing, and building CI/CD quality gates.',
    yearsOfExperience: 3, githubUrl: 'https://github.com/karanmehta',
  });
  await CandidateSkill.insertMany([
    { candidateId: karanProfile._id, skillName: 'Selenium',     rating: 5 },
    { candidateId: karanProfile._id, skillName: 'Java',         rating: 4 },
    { candidateId: karanProfile._id, skillName: 'TestNG',       rating: 4 },
    { candidateId: karanProfile._id, skillName: 'REST Assured',  rating: 4 },
    { candidateId: karanProfile._id, skillName: 'Jenkins',      rating: 3 },
    { candidateId: karanProfile._id, skillName: 'Python',       rating: 3 },
  ]);
  console.log('Created candidate profiles and skills');

  // ── Employer profiles ──────────────────────────────────
  const employer1 = await Employer.create({
    user: employer1User._id,
    companyName: 'Infosys',
    industry: 'Information Technology',
    website: 'https://www.infosys.com',
    description: 'Infosys is a global leader in next-generation digital services and consulting.',
  });

  const employer2 = await Employer.create({
    user: employer2User._id,
    companyName: 'Wipro',
    industry: 'Information Technology',
    website: 'https://www.wipro.com',
    description: 'Wipro Limited is a leading technology services and consulting company.',
  });
  console.log('Created employer profiles');

  // ── Jobs ───────────────────────────────────────────────
  const jobsData = [
    {
      employer: employer1._id, title: 'Senior React Developer',
      description: 'We are looking for a Senior React Developer to build high-performance, scalable web applications.',
      responsibilities: 'Develop new user-facing features using React.js. Build reusable components. Optimize for performance.',
      jobType: 'full-time', workMode: 'hybrid', location: 'Bangalore, India',
      experienceMin: 3, experienceMax: 7,
      skills: [
        { skillName: 'React', required: true }, { skillName: 'TypeScript', required: true },
        { skillName: 'Redux', required: true }, { skillName: 'CSS', required: false }, { skillName: 'Jest', required: false },
      ],
      status: 'published',
    },
    {
      employer: employer1._id, title: 'Backend Engineer - Node.js',
      description: 'Join our backend team to design and implement scalable APIs and microservices using Node.js.',
      responsibilities: 'Design and implement RESTful APIs. Manage database schemas and optimize queries.',
      jobType: 'full-time', workMode: 'onsite', location: 'Pune, India',
      experienceMin: 2, experienceMax: 5,
      skills: [
        { skillName: 'Node.js', required: true }, { skillName: 'Express.js', required: true },
        { skillName: 'MongoDB', required: true }, { skillName: 'TypeScript', required: false }, { skillName: 'Docker', required: false },
      ],
      status: 'published',
    },
    {
      employer: employer1._id, title: 'Python Data Engineer',
      description: 'We need a skilled Data Engineer to build and maintain data pipelines.',
      responsibilities: 'Design and build ETL/ELT data pipelines. Optimize data warehouse performance.',
      jobType: 'full-time', workMode: 'remote', location: 'Hyderabad, India',
      experienceMin: 3, experienceMax: 6,
      skills: [
        { skillName: 'Python', required: true }, { skillName: 'SQL', required: true },
        { skillName: 'Apache Spark', required: true }, { skillName: 'AWS', required: false }, { skillName: 'Airflow', required: false },
      ],
      status: 'published',
    },
    {
      employer: employer1._id, title: 'DevOps Engineer',
      description: 'Looking for a DevOps Engineer to streamline CI/CD pipelines and manage cloud infrastructure.',
      responsibilities: 'Build and maintain CI/CD pipelines. Manage AWS cloud infrastructure using IaC.',
      jobType: 'full-time', workMode: 'hybrid', location: 'Bangalore, India',
      experienceMin: 3, experienceMax: 8,
      skills: [
        { skillName: 'AWS', required: true }, { skillName: 'Docker', required: true },
        { skillName: 'Kubernetes', required: true }, { skillName: 'Terraform', required: false }, { skillName: 'Jenkins', required: false },
      ],
      status: 'published',
    },
    {
      employer: employer1._id, title: 'Full Stack Developer',
      description: 'Hiring a Full Stack Developer to work on end-to-end feature development.',
      responsibilities: 'Develop features across the full stack. Participate in code reviews.',
      jobType: 'full-time', workMode: 'onsite', location: 'Chennai, India',
      experienceMin: 2, experienceMax: 5,
      skills: [
        { skillName: 'React', required: true }, { skillName: 'Node.js', required: true },
        { skillName: 'MongoDB', required: true }, { skillName: 'TypeScript', required: false }, { skillName: 'GraphQL', required: false },
      ],
      status: 'published',
    },
    {
      employer: employer1._id, title: 'Machine Learning Engineer',
      description: 'Seeking an ML Engineer to develop and deploy ML models at scale.',
      responsibilities: 'Train and fine-tune ML models. Build end-to-end ML pipelines.',
      jobType: 'full-time', workMode: 'hybrid', location: 'Bangalore, India',
      experienceMin: 2, experienceMax: 6,
      skills: [
        { skillName: 'Python', required: true }, { skillName: 'TensorFlow', required: true },
        { skillName: 'SQL', required: true }, { skillName: 'PyTorch', required: false }, { skillName: 'Docker', required: false },
      ],
      status: 'published',
    },
    {
      employer: employer1._id, title: 'iOS Developer',
      description: 'We are looking for an experienced iOS Developer to design and build advanced mobile applications.',
      responsibilities: 'Design and build applications for the iOS platform.',
      jobType: 'full-time', workMode: 'onsite', location: 'Mumbai, India',
      experienceMin: 2, experienceMax: 5,
      skills: [
        { skillName: 'Swift', required: true }, { skillName: 'SwiftUI', required: true },
        { skillName: 'Xcode', required: true }, { skillName: 'Core Data', required: false }, { skillName: 'REST APIs', required: false },
      ],
      status: 'published',
    },
    {
      employer: employer2._id, title: 'Java Spring Boot Developer',
      description: 'Wipro is hiring a Java Developer with strong Spring Boot experience to build enterprise-grade microservices.',
      responsibilities: 'Develop microservices using Spring Boot. Write unit and integration tests.',
      jobType: 'full-time', workMode: 'hybrid', location: 'Hyderabad, India',
      experienceMin: 3, experienceMax: 7,
      skills: [
        { skillName: 'Java', required: true }, { skillName: 'Spring Boot', required: true },
        { skillName: 'Microservices', required: true }, { skillName: 'PostgreSQL', required: false }, { skillName: 'Kafka', required: false },
      ],
      status: 'published',
    },
    {
      employer: employer2._id, title: 'Cloud Solutions Architect',
      description: 'We need a Cloud Solutions Architect to design and implement cloud-native solutions.',
      responsibilities: 'Design cloud architecture for enterprise applications. Mentor development teams.',
      jobType: 'full-time', workMode: 'remote', location: 'Delhi NCR, India',
      experienceMin: 6, experienceMax: 12,
      skills: [
        { skillName: 'AWS', required: true }, { skillName: 'Azure', required: true },
        { skillName: 'Terraform', required: true }, { skillName: 'Kubernetes', required: false }, { skillName: 'Python', required: false },
      ],
      status: 'published',
    },
    {
      employer: employer2._id, title: 'QA Automation Engineer',
      description: 'Join Wipro as a QA Automation Engineer to design and execute automated test suites.',
      responsibilities: 'Design and implement automated test frameworks. Perform API and performance testing.',
      jobType: 'full-time', workMode: 'onsite', location: 'Pune, India',
      experienceMin: 2, experienceMax: 5,
      skills: [
        { skillName: 'Selenium', required: true }, { skillName: 'Java', required: true },
        { skillName: 'TestNG', required: true }, { skillName: 'REST Assured', required: false }, { skillName: 'Jenkins', required: false },
      ],
      status: 'published',
    },
    {
      employer: employer2._id, title: 'Angular Frontend Developer',
      description: 'We are seeking a skilled Angular Developer to build responsive enterprise web applications.',
      responsibilities: 'Build dynamic web applications using Angular. Integrate with RESTful APIs.',
      jobType: 'full-time', workMode: 'hybrid', location: 'Chennai, India',
      experienceMin: 2, experienceMax: 5,
      skills: [
        { skillName: 'Angular', required: true }, { skillName: 'TypeScript', required: true },
        { skillName: 'RxJS', required: true }, { skillName: 'NgRx', required: false }, { skillName: 'CSS', required: false },
      ],
      status: 'published',
    },
    {
      employer: employer2._id, title: 'React Native Developer',
      description: 'We are hiring a React Native Developer to build cross-platform mobile applications.',
      responsibilities: 'Develop cross-platform mobile apps. Optimize app performance.',
      jobType: 'full-time', workMode: 'hybrid', location: 'Mumbai, India',
      experienceMin: 2, experienceMax: 5,
      skills: [
        { skillName: 'React Native', required: true }, { skillName: 'JavaScript', required: true },
        { skillName: 'TypeScript', required: true }, { skillName: 'Redux', required: false }, { skillName: 'Firebase', required: false },
      ],
      status: 'published',
    },
    {
      employer: employer1._id, title: 'UI/UX Designer',
      description: 'Infosys is seeking a talented UI/UX Designer to craft intuitive and visually appealing interfaces.',
      responsibilities: 'Create wireframes, prototypes, and high-fidelity mockups. Conduct user research.',
      jobType: 'full-time', workMode: 'hybrid', location: 'Bangalore, India',
      experienceMin: 2, experienceMax: 6,
      skills: [
        { skillName: 'Figma', required: true }, { skillName: 'User Research', required: true },
        { skillName: 'Prototyping', required: true }, { skillName: 'Adobe XD', required: false }, { skillName: 'CSS', required: false },
      ],
      status: 'published',
    },
  ];

  const createdJobs = await Job.insertMany(jobsData);
  console.log(`Created ${createdJobs.length} jobs`);

  // Map job titles to their IDs for convenience
  const jobMap = new Map(createdJobs.map((j) => [j.title, j._id]));

  // Helper to calculate match score
  function matchScore(
    candidateSkillNames: string[],
    jobSkills: { skillName: string; required: boolean }[]
  ): number {
    const required = jobSkills.filter((s) => s.required);
    if (!required.length) return 100;
    const set = new Set(candidateSkillNames.map((s) => s.toLowerCase()));
    return Math.round(required.filter((s) => set.has(s.skillName.toLowerCase())).length / required.length * 100);
  }

  // ── Applications ────────────────────────────────────────
  const applicationData = [
    // Rahul (React, Node, TypeScript, Python, MongoDB)
    { candidateId: candidateProfile._id, jobTitle: 'Senior React Developer',     skills: ['JavaScript','TypeScript','React','Node.js','Python','MongoDB','AWS','Docker'] },
    { candidateId: candidateProfile._id, jobTitle: 'Full Stack Developer',        skills: ['JavaScript','TypeScript','React','Node.js','Python','MongoDB','AWS','Docker'] },
    // Priya (React, Angular, TypeScript, Redux, CSS)
    { candidateId: priyaProfile._id,     jobTitle: 'Senior React Developer',     skills: ['React','TypeScript','Angular','Redux','CSS','Jest','RxJS'] },
    { candidateId: priyaProfile._id,     jobTitle: 'Angular Frontend Developer', skills: ['React','TypeScript','Angular','Redux','CSS','Jest','RxJS'] },
    // Arjun (Node.js, Express, MongoDB, Docker, TypeScript)
    { candidateId: arjunProfile._id,     jobTitle: 'Backend Engineer - Node.js', skills: ['Node.js','Express.js','MongoDB','TypeScript','Docker','Redis','GraphQL'] },
    { candidateId: arjunProfile._id,     jobTitle: 'Full Stack Developer',       skills: ['Node.js','Express.js','MongoDB','TypeScript','Docker','Redis','GraphQL'] },
    // Sneha (Python, SQL, Spark, AWS, Airflow)
    { candidateId: snehaProfile._id,     jobTitle: 'Python Data Engineer',       skills: ['Python','SQL','Apache Spark','AWS','Airflow','Kafka','dbt'] },
    // Vikram (AWS, Docker, Kubernetes, Terraform, Jenkins)
    { candidateId: vikramProfile._id,    jobTitle: 'DevOps Engineer',            skills: ['AWS','Docker','Kubernetes','Terraform','Jenkins','Azure','Ansible'] },
    { candidateId: vikramProfile._id,    jobTitle: 'Cloud Solutions Architect',  skills: ['AWS','Docker','Kubernetes','Terraform','Jenkins','Azure','Ansible'] },
    // Anjali (Java, Spring Boot, Microservices, Kafka, PostgreSQL)
    { candidateId: anjaliProfile._id,    jobTitle: 'Java Spring Boot Developer', skills: ['Java','Spring Boot','Microservices','PostgreSQL','Kafka','Docker','AWS'] },
    // Rohit (React Native, JavaScript, TypeScript, Redux, Firebase)
    { candidateId: rohitProfile._id,     jobTitle: 'React Native Developer',     skills: ['React Native','JavaScript','TypeScript','Redux','Firebase','Swift'] },
    // Meera (Figma, User Research, Prototyping, Adobe XD, CSS)
    { candidateId: meeraProfile._id,     jobTitle: 'UI/UX Designer',             skills: ['Figma','User Research','Prototyping','Adobe XD','CSS','Zeplin'] },
    // Karan (Selenium, Java, TestNG, REST Assured, Jenkins)
    { candidateId: karanProfile._id,     jobTitle: 'QA Automation Engineer',     skills: ['Selenium','Java','TestNG','REST Assured','Jenkins','Python'] },
  ];

  const applications = await Promise.all(
    applicationData.map(({ candidateId, jobTitle, skills }) => {
      const jobId = jobMap.get(jobTitle);
      if (!jobId) return null;
      const jobSkills = (jobsData.find((j) => j.title === jobTitle)?.skills) ?? [];
      return Application.create({
        candidate: candidateId,
        job: jobId,
        matchScore: matchScore(skills, jobSkills),
        status: 'applied',
      });
    })
  );
  console.log(`Created ${applications.filter(Boolean).length} applications`);

  console.log('\n── Seed complete ──');
  console.log('Job Seeker login:  tester@gmail.com / Tester@123');
  console.log('Employer 1 login:  hr@infosys.com / Tester@123');
  console.log('Employer 2 login:  hr@wipro.com / Tester@123');
  console.log('Extra candidates:  priya.nair@gmail.com, arjun.dev@gmail.com, sneha.data@gmail.com,');
  console.log('                   vikram.ops@gmail.com, anjali.java@gmail.com, rohit.mobile@gmail.com,');
  console.log('                   meera.ui@gmail.com, karan.qa@gmail.com  (all: Tester@123)');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
