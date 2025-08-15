// Sample data for Library LMS (frontend only)
(function () {
  const courses = [
    {
      id: 'c-html-basics',
      title: 'HTML Foundation',
      author: 'Grace Hopper',
      level: 'Beginner',
      durationMinutes: 120,
      tags: ['html', 'web', 'frontend'],
      description: 'Learn the building blocks of the web with semantic HTML and accessible structure.',
      lessons: [
        { id: 'l1', title: 'The Document Structure', minutes: 15 },
        { id: 'l2', title: 'Headings and Text', minutes: 20 },
        { id: 'l3', title: 'Links and Navigation', minutes: 20 },
        { id: 'l4', title: 'Media and Embeds', minutes: 25 },
        { id: 'l5', title: 'Forms Basics', minutes: 40 }
      ]
    },
    {
      id: 'c-css-library-theme',
      title: 'CSS: crafting',
      author: 'Ada Lovelace',
      level: 'Intermediate',
      durationMinutes: 180,
      tags: ['css', 'design', 'ui'],
      description: 'Design a classic library-inspired interface with modern CSS and responsive layouts.',
      lessons: [
        { id: 'l1', title: 'Design Tokens & Variables', minutes: 25 },
        { id: 'l2', title: 'Layout Systems', minutes: 30 },
        { id: 'l3', title: 'Components & States', minutes: 45 },
        { id: 'l4', title: 'Responsive Strategies', minutes: 40 },
        { id: 'l5', title: 'Polish & Performance', minutes: 40 }
      ]
    },
    {
      id: 'c-js-vanilla-spa',
      title: 'Java Script ',
      author: 'Donald Knuth',
      level: 'Intermediate',
      durationMinutes: 200,
      tags: ['javascript', 'spa', 'frontend'],
      description: 'Build single-page applications with zero frameworks: routing, state, and rendering.',
      lessons: [
        { id: 'l1', title: 'Routing with Hashes', minutes: 35 },
        { id: 'l2', title: 'LocalStorage State', minutes: 30 },
        { id: 'l3', title: 'Rendering & Diffing', minutes: 45 },
        { id: 'l4', title: 'Events & Accessibility', minutes: 40 },
        { id: 'l5', title: 'Composition & Reuse', minutes: 50 }
      ]
    },
    {
      id: 'c-accessible-web',
      title: 'Accessible Web Interfaces',
      author: 'Tim Berners-Lee',
      level: 'All Levels',
      durationMinutes: 150,
      tags: ['a11y', 'web', 'semantics'],
      description: 'Create inclusive experiences with semantic HTML, ARIA, and keyboard navigation.',
      lessons: [
        { id: 'l1', title: 'Semantics First', minutes: 30 },
        { id: 'l2', title: 'Keyboard & Focus', minutes: 30 },
        { id: 'l3', title: 'ARIA Where Needed', minutes: 45 },
        { id: 'l4', title: 'Color & Contrast', minutes: 45 }
      ]
    }
  ];

  const tags = Array.from(new Set(courses.flatMap(c => c.tags))).sort();

  window.LMS_DATA = { courses, tags };
})();


