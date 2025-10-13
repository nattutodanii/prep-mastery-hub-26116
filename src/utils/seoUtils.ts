
export const generateExamStructuredData = (exam: any, courses: any[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": exam.name,
    "description": exam.detailed_description || exam.description,
    "url": `${window.location.origin}/exam/${exam.id}`,
    "foundingDate": exam.established_year?.toString(),
    "address": {
      "@type": "PostalAddress",
      "addressLocality": exam.location,
      "addressCountry": "India"
    },
    "knowsAbout": courses.map((course: any) => course.name),
    "educationalCredentialAwarded": courses.map((course: any) => ({
      "@type": "EducationalOccupationalCredential",
      "name": course.name,
      "description": course.description,
      "educationalLevel": "Graduate"
    })),
    "hasCredential": exam.recognition,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${window.location.origin}/exam/${exam.id}`
    }
  };
};

export const generateExamKeywords = (exam: any, courses: any[]) => {
  const keywords = [
    exam.name,
    `${exam.name} entrance exam`,
    `${exam.name} admission`,
    `${exam.name} preparation`,
    `${exam.name} syllabus`,
    `${exam.name} exam pattern`,
    `${exam.name} eligibility`,
    exam.location && `${exam.location} entrance exam`,
    'entrance exam preparation',
    'competitive exam',
    'online test preparation',
    'mock tests',
    'previous year questions',
    ...courses.map(course => course.name),
    ...courses.map(course => `${course.name} admission`),
  ].filter(Boolean);

  return keywords.join(', ');
};

export const generateSEOTitle = (exam: any) => {
  return `${exam.name} Entrance Exam 2024: Complete Guide, Syllabus, Preparation | MastersUp`;
};

export const generateSEODescription = (exam: any) => {
  return `Complete guide for ${exam.name} entrance exam 2024. Get detailed syllabus, exam pattern, preparation tips, mock tests, and previous year questions. Start your ${exam.name} preparation journey with MastersUp.`;
};
