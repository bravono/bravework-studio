import {
  Shapes,
  Home,
  Car,
  Plane,
  Ghost,
  Trees,
  GraduationCapIcon,
  Film,
  Award,
  BookOpen,
  Handshake,
  Hospital,
  Wrench,
  Heart,
  Stethoscope,
  Puzzle,
  HelpCircle,
} from "lucide-react";
interface Testimonial {
  id: number;
  avatar: string;
  heading: string;
  body: string;
  companyName: string;
  email: string;
}

interface PortfolioDetails {
  client: string;
  year: string;
  tools: string[];
  description: string;
  challenges: string[];
  solutions: string[];
}

interface Portfolio {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  details?: PortfolioDetails;
  iFrame?: string;
  otherSamples?: string[];
  sampleNames?: string[];
}

interface Services {
  title: string;
  description: string;
  icon: string;
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

interface Project {
  id: number;
  title: string;
  subtitle: string;
  owner: string;
  budget: string;
  category: string;
  description: string;
  todos: Todo[];
  startDate: string;
  endDate: string;
  status: "active" | "done" | "pending";
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    avatar: "/assets/Hans.jpg",
    heading: "What made you choose to work with us?",
    body: "I chose to work with Bravework Studio because of his impressive portfolio and expertise in 3D modeling and game development. I first found him in 2020 on Guru.com when I needed training services in Blender for an employee. His professionalism and deep knowledge made a lasting impression, so I continued working with him on multiple projects. His ability to bring historical elements to life in Unreal Engine 5, such as the Eschenheimer Tor and the Irminsul for my game Die Franken, showcased his exceptional talent and attention to detail.",
    companyName: "Visual Stirytelling GmbH",
    email: "hpbrill@gmx.de",
  },
  {
    id: 2,
    avatar: "/assets/Hans.jpg",
    heading: "What was your favorite part of working with us?",
    body: "My favorite part of working with Bravework Studio was his outstanding ability to transform historical concepts into stunning 3D models with incredible accuracy and detail. Whether it was the Eschenheimer Tor for my Wilddieb Hans Winkelsee video or the Irminsul and Saxony battle map for my game Die Franken, he consistently exceeded my expectations. His professionalism, creativity, and deep understanding of Unreal Engine 5 made every collaboration smooth and enjoyable. I also appreciated his clear communication and dedication to delivering top-quality work on time.",
    companyName: "Visual Stirytelling GmbH",
    email: "hpbrill@gmx.de",
  },
  {
    id: 3,
    avatar: "/assets/Hans.jpg",
    heading: "How did working with us impact your business/life?",
    body: "Working with Bravework Studio had a significant impact on my projects, helping me bring historical accuracy and immersive realism to my work. His expertise in 3D modeling and Unreal Engine 5 allowed me to enhance my video content and improve the visual quality of my game Die Franken. The Eschenheimer Tor added historical depth to my video about Wilddieb Hans Winkelsee, while the Irminsul and Saxony battle map elevated the authenticity of my game. His contributions not only saved me time but also ensured that I could deliver a higher-quality experience to my audience. Collaborating with Bravework Studio was an investment that truly paid off!",
    companyName: "Visual Stirytelling GmbH",
    email: "hpbrill@gmx.de",
  },
  {
    id: 4,
    avatar: "/assets/Hans.jpg",
    heading: "Would you recommend us to others? Why or why not?",
    body: 'Absolutely! I would highly recommend Bravework Studio to anyone in need of "high-quality 3D modeling, Unreal Engine assets, or game development services". His attention to detail, deep understanding of historical accuracy, and technical expertise make him a standout professional. Whether it was training in Blender, creating the "Eschenheimer Tor" for my video, or designing the "Irminsul" and "Saxony battle map" for my game *Die Franken*, he consistently delivered "exceptional results on time". His professionalism, clear communication, and dedication to quality make him a fantastic partner for any project. I would work with him again in a heartbeat!',
    companyName: "Visual Stirytelling GmbH",
    email: "hpbrill@gmx.de",
  },
  {
    id: 5,
    avatar: "/assets/Bravework_Studio-Logo-Color.png",
    heading: "What made you choose to work with us?",
    body: "Was sort of a shot in the dark.  The price was good and worth the risk of working with someone I didn't know",
    companyName: "Parker Van Lawrence",
    email: "parker@vanlawrence.co.nz",
  },
  {
    id: 6,
    avatar: "/assets/Bravework_Studio-Logo-Color.png",
    heading: "What was your favorite part of working with us?",
    body: "Your should superhuman levels of patience.",
    companyName: "Parker Van Lawrence",
    email: "parker@vanlawrence.co.nz",
  },
  {
    id: 7,
    avatar: "/assets/Bravework_Studio-Logo-Color.png",
    heading: "How did working with us impact your business/life?",
    body: "It has completely changed my son's life and launched him into a profession 10 years earlier than he could have otherwise hoped.",
    companyName: "Parker Van Lawrence",
    email: "parker@vanlawrence.co.nz",
  },
  {
    id: 8,
    avatar: "/assets/Bravework_Studio-Logo-Color.png",
    heading: "Would you recommend us to others? Why or why not?",
    body: "I frequently do.",
    companyName: "Parker Van Lawrence",
    email: "parker@vanlawrence.co.nz",
  },
];

const portfolios: Portfolio[] = [
  {
    id: 1,
    title: "Advertisement",
    category: "3D Modeling & Animation",
    image: "/services/rabbit.webp",
    description: "Fun and engaging 3D animation advertisement",
    iFrame: `<iframe width="100%" height="500" src="https://www.youtube.com/embed/-7xgbFEkMRY?si=2AD_tXTBDua3nD_C" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    otherSamples: ["https://youtu.be/zpmH4x-kRu4?si=c9wh4vsvtwPH-lLP"],
    sampleNames: ["Dog Food"],
    details: {
      client: "Medihoppr",
      year: "2022",
      tools: ["Blender", "Davinci Resolve", "SheepIt"],
      description:
        "A short, dynamic animation promoting [Service Name], a hyper-local, ultra-fast delivery service designed to bring everyday items from your neighborhood right to your doorstep in minutes.",
      challenges: [
        "Effectively conveying the core message of speed and efficiency within a very short animation timeframe (e.g., 15-30 seconds)",
        'Visually representing the "local area" concept in a way that feels familiar and relatable to the target audience without requiring hyper-specific, potentially complex landmark animation',
        "Balancing the need to clearly communicate the service's function and benefits (fast, local delivery) with creating an engaging and memorable piece of animation that holds viewer attention.",
      ],
      solutions: [
        "Utilized fast-paced editing, dynamic motion design (like speed lines, quick cuts, energetic transitions), and concise visual storytelling focusing on the rapid journey from order placement to the item arriving at the customer's door",
        "Incorporated stylized yet recognizable local elements (e.g., generic neighborhood architecture, types of local shops like bakeries or corner stores, community parks) and focused on depicting everyday convenience within these relatable settings, rather than specific addresses.",
        "Developed a clear narrative structure (e.g., identifying a need -> using the service -> quick satisfaction) combined with an appealing animation style, with a likeable character.",
      ],
    },
  },
  {
    id: 2,
    title: "Intro Animation",
    category: "3D Modeling & Animation",
    image: "/services/intro_american-football.webp",
    description: "3D intro animation for content creators",
    iFrame: `<iframe width="100%" height="500" src="https://www.youtube.com/embed/q0NoYvYiOvc?si=6P-CYKtjhgi8ndYQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    otherSamples: [],
    sampleNames: [],
    details: {
      client: "JC",
      year: "2022",
      tools: ["Blender", "Davinci Resolve", "SheepIt"],
      description:
        "An intro 3D animation for a YouTube channel, designed to be visually striking and memorable, setting the tone for the content that follows.",
      challenges: [
        "Designing a unique visual hook or logo animation that ensures the intro is instantly memorable.",
        "Achieving complex, high-impact 3D visuals/effects without excessive render times for a short sequence.",
        "Defining and executing a consistent, appealing visual style that balances artistic vision and 3D technical needs.",
      ],
      solutions: [
        "Focused animation on a strong central motif/reveal, reinforced by distinctive custom sound design.",
        "Optimized 3D scene complexity and utilized efficient rendering techniques/settings ",
        "Established clear art direction via style frames and employed custom materials/shaders for the target look.",
      ],
    },
  },
  {
    id: 3,
    title: "Children Animation",
    category: "3D Modeling & Animation",
    image: "/services/if_youre_happy.webp",
    description: "Entertaining animation for children",
    iFrame: `<iframe width="100%" height="500" src="https://www.youtube.com/embed/2y9viIBGYk4?si=Wm7_3G9Kzrpkhmxo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    otherSamples: ["https://youtu.be/IhhhFlz_Fno"],
    sampleNames: ["Happy Home"],
    details: {
      client: "Lucas Mirera",
      year: "2023",
      tools: ["Blender", "Davinci Resolve", "SheepIt"],
      description:
        "A captivating 3D animation project for young children, featuring appealing characters, vibrant worlds, and simple, engaging storytelling.",
      challenges: [
        "Achieving a vibrant, visually stimulating 3D style without being overly complex or confusing for kids.",
        "Ensuring all story themes, character actions, and visuals are safe, positive, and age-appropriate.",
        "Crafting engaging storylines simple and clear enough for young children to easily follow and understand.",
      ],
      solutions: [
        "Utilized bright, appealing color palettes, clean rendering, and distinct, uncluttered scene composition.",
        "Adhered strictly to child development guidelines and reviewed all content for suitability and messaging.",
        "Employed straightforward narrative structures, strong visual cues, and appropriate repetition for clarity.",
      ],
    },
  },
  {
    id: 5,
    title: "Children Educational Animation",
    category: "3D Modeling & Animation",
    image: "/services/abcd_english.webp",
    description: "Engaging animation for children education",
    iFrame: `<iframe width="100%" height="500" src="https://www.youtube.com/embed/o5HukmvQD1w?si=fVKDlwNcZFY06VkH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    otherSamples: ["https://youtu.be/AIm-vg3NlA4?si=oDtBpiwImEAmSGjZ"],
    sampleNames: ["Spanish Alphabet"],
    details: {
      client: "Q4 WhateverItTakes",
      year: "2023",
      tools: ["Blender", "Davinci Resolve", "SheepIt"],
      description:
        "This is a beautiful and vibrant 3D animated video designed to introduce young children to the English alphabet in an engaging way.",
      challenges: [
        "Clearly presenting each alphabet letterform and its key associations within the 3D animation.",
        "Maintaining high engagement and distinct visual interest across potentially 26 different letter segments.",
        "Designing vibrant, captivating 3D visuals that enhance learning without distracting from the letters.",
      ],
      solutions: [
        "Used large, unambiguous 3D letter models coupled with clear corresponding visuals and audio cues.",
        "Developed unique, vibrant themes or simple, appealing scenarios for each letter within a consistent style.",
        "Solution: Employed bright, appealing aesthetics with intentional composition to keep focus on educational elements.",
      ],
    },
  },
  {
    id: 6,
    title: "Game Animation",
    category: "Game Development",
    image: "/services/sir_pallinore.webp",
    description:
      "Ready to use animation for your Unity and Unreal Engine games",
    iFrame: `<iframe width="100%" height="500" src="https://www.youtube.com/embed/ahxYTHPuAhk?si=Dl9sqBHk2DMkGyaH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    otherSamples: ["https://youtu.be/QSjkVq0hG5k"],
    sampleNames: ["Aircraft"],
    details: {
      client: "Antonio Peassoto",
      year: "2022",
      tools: ["Blender"],
      description:
        "Developed a set of character animations intended for seamless integration and optimal performance within both Unity and Unreal Engine game development pipelines.",
      challenges: [
        "Ensuring the character rig structure allowed seamless import and retargeting in Unity and Unreal.",
        "Achieving high-quality animation results after retargeting onto different character models in both engines.",
        "Defining consistent FBX export settings ensuring correct scale, axis, and animation data in both engines.",
      ],
      solutions: [
        "Used standard humanoid bone naming/hierarchy conventions compatible with both engine importers.",
        "Adhered strictly to engine rig specifications and thoroughly tested retargeting within each platform.",
        "Solution: Established standardized FBX export presets tailored for both Unity and Unreal import pipelines.",
      ],
    },
  },
  {
    id: 7,
    title: "Game Assets",
    category: "Game Development",
    image: "/services/aircraft.webp",
    description: "Drag and drop ready made assests for your games",
    iFrame: `<iframe width="100%" height="500" src="https://www.youtube.com/embed/QSjkVq0hG5k?si=Sqju0lOxNznTxRAT" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    otherSamples: [],
    details: {
      client: "Random",
      year: "2025",
      tools: ["Blender"],
      description:
        "Developed a versatile pack of performance-optimized 3D game assets using PBR workflows, ensuring easy integration and visual consistency in both Unity and Unreal Engine projects.",
      challenges: [
        "Ensuring PBR textures provided consistent visual results across different Unity/Unreal render pipelines.",
        "Optimizing asset geometry and textures (LODs, resolution) for diverse performance targets across engines.",
        "Maintaining correct real-world scale and orientation consistency between Unity (meters) and Unreal (cm).",
      ],
      solutions: [
        "Adhered strictly to standardized PBR texture maps (Albedo, Normal, MRAO) and value ranges.",
        "Implemented multiple levels of detail (LODs) and offered various texture size options per asset.",
        "Modeled assets accurately to scale and used standardized FBX export settings for units and axes.",
      ],
    },
  },
  {
    id: 8,
    title: "Hummanoid Characters",
    category: "3D Modeling & Animation",
    image: "/services/india_man.webp",
    description: "Realistic character design for serious animation",
    iFrame: `<iframe width="100%" height="500" src="https://www.youtube.com/embed/kM8qd793-r8?si=FawcbpsByMw6uU9G" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    otherSamples: [],
    details: {
      client: "Random",
      year: "2025",
      tools: ["Blender"],
      description:
        "Created a highly realistic 3D digital human character for film/animation, emphasizing intricate facial detail, multi-layered skin shading, and sophisticated rigging for lifelike performance.",
      challenges: [
        "Creating realistic, dynamic digital hair/groom that holds up under close inspection and movement.",
        "Ensuring smooth, anatomically correct mesh deformation during animation, preserving volume integrity.",
        "Attaining convincing photorealism in facial sculpts and skin rendering, avoiding the uncanny valley.",
      ],
      solutions: [
        "Employed specialized grooming tools (e.g., XGen) with advanced hair shading and simulation techniques.",
        "Combined meticulous topology, precise skin weighting, and corrective blendshapes or muscle systems.",
        "Used high-res sculpting, scan data/detailed texturing, and multi-layered subsurface scattering shaders.",
      ],
    },
  },
  {
    id: 9,
    title: "Islamic Educational Animation",
    category: "3D Modeling & Animation",
    image: "services/palestine.webp",
    description: "Religious educational animation for children",
    iFrame: `<iframe width="100%" height="500" src="https://www.youtube.com/embed/4-czn9YWKHs?si=O6uN9Mo7Dzl4ZnYi" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    otherSamples: ["https://youtu.be/FYhgLz3kK2w"],
    sampleNames: ["Billal and Asmaa"],
    details: {
      client: "Islam Village",
      year: "2024",
      tools: ["Blender", "Davinci Resolve", "SheepIt"],
      description:
        "Developed an engaging 3D animated series for children, designed to gently introduce Islamic values and teachings through relatable characters, vibrant settings, and age-appropriate stories.",
      challenges: [
        "Designing appealing child characters adhering to Islamic guidelines on appropriate representation/attire.",
        "Simplifying potentially abstract Islamic concepts for clear comprehension by a young audience.",
        "Integrating educational messages about values naturally into engaging, age-appropriate narratives.",
      ],
      solutions: [
        "Created friendly, expressive characters with modest designs, vetted through cultural consultation.",
        "Used simple language, concrete examples, visual metaphors, and relatable character experiences.",
        "Wove moral lessons organically into character actions and relatable story situations for children.",
      ],
    },
  },
  {
    id: 10,
    title: "Product Visualization",
    category: "3D Modeling & Animation",
    image: "/services/bravono_energy_drink.webp",
    description: "Professional product presentation for attention",
    iFrame: `<iframe width="100%" height="500" src="https://www.youtube.com/embed/kM8qd793-r8?si=FawcbpsByMw6uU9G" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    otherSamples: [],
    details: {
      client: "Compilation",
      year: "2024",
      tools: ["Blender", "Photoshop"],
      description:
        "Executed professional 3D product visualization projects, creating photorealistic renderings/animations with accurate materials, sophisticated lighting, and dynamic cinematography to effectively showcase product features and enhance marketing appeal.",
      challenges: [
        "Designing sophisticated studio lighting that attractively reveals product form, texture, and key features.",
        "Achieving noise-free, high-resolution final renders suitable for professional use within project timelines.",
        "Accurately recreating diverse and often complex real-world product materials photorealistically in 3D.",
      ],
      solutions: [
        "Utilized realistic lighting methods (multi-point, HDRI, area lights) tailored to each product's geometry.",
        "Optimized render engine settings, employed advanced denoising methods, and utilized efficient hardware/farms.",
        "Leveraged PBR workflows, detailed procedural/textured maps, and meticulous shader parameter tuning.",
      ],
    },
  },
  {
    id: 11,
    title: "Stylized Characters",
    category: "3D Modeling & Animation",
    image: "/services/masquerade_character.webp",
    description: "Imaginary characters for imaginary stories",
    iFrame: ``,
    otherSamples: [],
    details: {
      client: "Compilation",
      year: "2024",
      tools: ["Blender", "Photoshop"],
      description:
        "Designed detailed 3D characters for short film production, balancing appealing stylized aesthetics with realistic proportions to support expressive, narrative-driven animation.",
      challenges: [
        "Translating the specific stylized aesthetic from 2D concepts into appealing 3D character forms.",
        "Balancing sufficient surface/texture detail for close-ups while preserving the stylized design's clarity.",
        "Creating shaders and materials that accurately capture the intended non-photorealistic, stylized look.",
      ],
      solutions: [
        "Developed detailed model sheets and style guides, closely iterating on the 3D sculpts from concepts.",
        "Applied detail strategically to focal points, keeping larger forms clean according to the style guide.",
        "Developed custom shaders or significantly adapted existing ones to match the target art style's render.",
      ],
    },
  },
  {
    id: 12,
    title: "Corporate Website",
    category: "Web Development",
    image: "/services/bravework_website.webp",
    description: "The current website you're on right now",
    iFrame: ``,
    otherSamples: [
      "https://easybank-landing-page-iota-peach.vercel.app",
      "https://manage-landing-page-lake.vercel.app",
    ],
    sampleNames: ["Easybank Landing Page", "Manage Landing Page"],
    details: {
      client: "Bravework Studio",
      year: "2025",
      tools: [
        "HTML",
        "CSS",
        "JavaScript",
        "TypeScript",
        "React",
        "Next.js",
        "Node.js",
        "Express.js",
        "SQL",
        "MySQL",
      ],
      description:
        "Developed a professional corporate website with a modern design, built in-house to establish an online presence, showcase our company's skills and portfolio, and integrate seamlessly with essential business tools.",
      challenges: [
        "Integrating diverse third-party business tools (CRM, analytics, etc.) reliably via potentially complex APIs.",
        "Creating a dynamic and easily navigable portfolio to effectively showcase company skills and projects.",
        "Optimizing website architecture and content for fast load times and strong search engine visibility.",
      ],
      solutions: [
        "Built custom API connectors or configured existing integrations, ensuring robust error handling and security.",
        "Implemented filterable categories and visually compelling layouts tailored to portfolio content presentation.",
        "Implemented performance best practices (caching, optimization) and foundational on-page SEO techniques.",
      ],
    },
  },
  {
    id: 17,
    title: "Vidlify",
    category: "Web Development",
    image: "/services/Screenshot 2025-06-04 152735.png",
    description: "Video rental service",
    iFrame: ``,
    otherSamples: [
      "https://easybank-landing-page-iota-peach.vercel.app",
      "https://manage-landing-page-lake.vercel.app",
    ],
    sampleNames: ["Easybank Landing Page", "Manage Landing Page"],
    details: {
      client: "Bravework Studio",
      year: "2025",
      tools: [
        "HTML",
        "Tailwind CSS",
        "JavaScript",
        "TypeScript",
        "React",
        "Next.js",
        "Node.js",
        "MongoDB",
      ],
      description:
        "Developed a full-stack video rental service website, Vidlify, enabling users to browse, rent, and manage their favorite movies online. The platform provides a seamless and intuitive experience for both customers and administrators.",
      challenges: [
        "Implementing dynamic data sorting functionality where users can sort data by the values of each column, which presented complexity in query construction and front-end state management.",
        "Designing and implementing pagination using the Lodash utility to effectively display a maximum of 10 items per page, ensuring efficient data loading and a clean user interface. Developing a robust filtering system that allows users to filter movies based on their genres, requiring careful handling of database queries and dynamic UI updates.",
        "Migrating separate frontend and backend applications into a single Next.js project for streamlined deployment and free hosting, requiring a significant learning curve with the framework.",
      ],
      solutions: [
        "Developed robust backend API endpoints with flexible query parameters to handle sorting requests based on various column values. On the frontend, implemented logic to dynamically construct and send these requests, and re-render the data accordingly.",
        "Utilized the Lodash utility functions to divide the dataset into manageable pages. Implemented front-end logic to control the display of only 10 items per page and provide navigation controls for users to move between pages.",
        "Implemented genre-based filtering by extending the backend API to accept genre parameters, filtering the movie data before sending it to the frontend. On the frontend, created interactive genre selection components that trigger these filtered data requests and update the displayed movies.",
        "Successfully refactored the project into a monolithic Next.js application, leveraging its full-stack capabilities for API routes and server-side rendering, enabling deployment to platforms offering free tiers for Next.js applications.",
      ],
    },
  },
  {
    id: 13,
    title: "SaaS Application",
    category: "Web Development",
    image: "/services/confidential_green.webp",
    description: "Bot Detector: Staying ahead of the bots",
    iFrame: ``,
    otherSamples: [],
    details: {
      client: "BuyFacts Inc.",
      year: "2025",
      tools: ["HTML/CSS", "React", "JavaScript", "Bootstrap", "Three.js"],
      description:
        "Developed a novel web-based bot detection application utilizing interactive 3D challenges (via Three.js) designed to differentiate human users from automated scripts while maintaining a seamless user experience.",
      challenges: [
        "Reliably detecting and capturing user drag input specifically occurring on complex 3D model surfaces.",
        "Designing 3D interaction tasks resistant to automated bot simulation yet intuitive for human users.",
        "Optimizing the client-side 3D rendering and interaction analysis for smooth performance across devices.",
        "Integrating 2D HTML feedback elements precisely with user interaction points on a 3D canvas object.,",
        "Ensuring consistent 3D interaction functionality and detection results across different web browsers/devices.",
      ],
      solutions: [
        "Implemented accurate Three.js raycasting from camera/input coordinates to identify 3D object intersections.",
        "Focused on challenges analyzing smooth path deviations, timing variations, and interaction subtleties.",
        "Streamlined Three.js scene complexity, optimized render loops, and minimized event listener overhead.",
        "Developed coordinate mapping logic to translate 3D interaction events to accurate 2D UI positions.",
        "Utilized responsive canvas techniques and performed comprehensive cross-browser/device testing routines.",
      ],
    },
  },
  {
    id: 15,
    title: "SaaS Application",
    category: "Web Development",
    image: "/services/confidential_yellow.webp",
    description: "Gamified Survey: Taking surveys should be fun",
    iFrame: ``,
    otherSamples: [],
    details: {
      client: "BuyFacts Inc.",
      year: "2025",
      tools: ["HTML/CSS", "React", "Redux", "JavaScript"],
      description:
        "Developed an engaging web application that gamifies the survey-taking process, aiming to increase user completion rates through interactive elements while ensuring data integrity and a smooth user experience.",
      challenges: [
        "Maintaining user survey progress and complex application state across page refreshes and navigation.",
        "Creating a responsive layout that adapts fluidly to varying screen heights, beyond typical width adjustments.",
        "Integrating gamification mechanics (points, progress bars) engagingly within the survey experience",
        "Handling diverse survey question types, input validation, and complex conditional display logic frontend.",
        "Ensuring the secure transmission and storage of user survey responses and associated data.",
      ],
      solutions: [
        "Implemented robust client-side state management using Redux, ensuring data persistence.",
        "Employed modern CSS techniques (viewport units, flexbox) to achieve seamless vertical responsiveness.",
        "Designed and implemented interactive UI elements providing real-time feedback on survey progress/achievements.",
        "Developed a modular component system and state logic capable of managing varied question formats/rules.",
        "Implemented secure API communication (HTTPS) and appropriate data validation/sanitization practices.",
      ],
    },
  },
  {
    id: 17,
    title: "Mobile App UI",
    category: "UiUx Design",
    image: "/services/hot_sauce.webp",
    description: "User interface design for a fitness tracking app",
    iFrame: ``,
    otherSamples: [],
    details: {
      client: "Bravework Studio",
      year: "2024",
      tools: ["Figma"],
      description:
        "A modern and intuitive mobile app interface design focusing on user engagement and seamless navigation for fitness tracking and workout planning.",
      challenges: [
        "Creating an engaging onboarding experience",
        "Designing intuitive workout trackinj0nmg interface",
        "Ensuring accessibility for all users",
      ],
      solutions: [
        "Developed interactive onboarding tutorials",
        "Created customizable workout dashboard",
        "Implemented comprehensive accessibility features",
      ],
    },
  },
  {
    id: 14,
    title: "3D Printing",
    category: "3D Modeling & Animation",
    image: "/services/wall_pattern.webp",
    description: "Realistic 3D visualization of a modern building",
    iFrame: ``,
    otherSamples: [],
    details: {
      client: "Compilation",
      year: "2025",
      tools: ["Blender"],
      description:
        "Designed a high-fidelity 3D model of an architectural subject, optimized specifically for successful 3D printing while preserving intricate details.",
      challenges: [
        "Designing the model to minimize difficult overhangs and the need for extensive support material.",
        "Creating a completely watertight (manifold) mesh free from errors for successful slicing software processing.",
        "Dividing large/complex architectural models into printable sections with precise assembly features.",
      ],
      solutions: [
        "Adjusted angles where feasible and strategically sectioned the model for optimal print orientation",
        "Employed mesh diagnostic tools and performed manual cleanup to guarantee a solid, error-free model",
        "Designed interlocking keys or registration marks to facilitate accurate assembly of printed parts",
      ],
    },
  },
  {
    id: 16,
    title: "Voice Acting",
    category: "Video & Voice Over",
    image: "/services/mokola_store.webp",
    description: "Voice acting for your games, books, ads and videos",
    iFrame: `<iframe width="100%" height="500" src="https://www.youtube.com/embed/7XQ85fFNZA4?si=0T1UJuvuV1hY-EBP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    otherSamples: ["https://youtu.be/3fvzNV5YodA?si=qJ-9oDxhlgKGssno"],
    sampleNames: ["Mokola Store"],
    details: {
      client: "Portfolio",
      year: "2021",
      tools: ["Primer Pro", "Audacity"],
      description:
        "Provided professional voice-over services for various projects, including video games, audiobooks, and promotional content, ensuring high-quality audio and engaging delivery.",
      challenges: [
        "Delivering a wide range of character voices and styles to suit different projects.",
        "Maintaining consistent audio quality and clarity across various recording environments.",
        "Ensuring timely delivery of voice recordings while meeting project deadlines.",
      ],
      solutions: [
        "Utilized professional recording equipment and techniques to achieve high-quality audio.",
        "Employed soundproofing and acoustic treatment to minimize background noise and echo.",
        "Collaborated closely with clients to understand their vision and provide tailored voice performances.",
      ],
    },
  },
];

const services: Services[] = [
  {
    title: "3D Modeling & Animation",
    description:
      "Professional 3D modeling, animation, and visualization services for your projects.",
    icon: "🎨",
  },
  {
    title: "Web Development",
    description:
      "Custom web applications and websites built with modern technologies.",
    icon: "🌐",
  },
  {
    title: "UI/UX Design",
    description: "User-centered design solutions that enhance user experience.",
    icon: "✨",
  },
  {
    title: "Game Development",
    description: "Engaging game development services for various platforms.",
    icon: "🎮",
  },
  {
    title: "Voice-Over Services",
    description:
      "Professional voice-over services for your videos, games, and multimedia projects.",
    icon: "🎙️",
  },
  {
    title: "Training Services",
    description:
      "You or your kids will love to learn 3D modeling and animation with our simple and easy to understand training services.",
    icon: "🤼‍♂️",
  },
];

const projects: Project[] = [
  // {
  //   id: 1,
  //   title: "Backend Integration (Braveworkstudio.com)",
  //   owner: "Bravework Studio",
  //   budget: "$2000",
  //   category: "Web Development",
  //   description:
  //     "Develop a robust backend system for the corporate website to enable key e-commerce functionalities, including user order tracking, automated update notifications, and personalized discounts based on purchase history.",
  //   todos: [
  //     { id: "1", title: "Define backend architecture", completed: true },
  //     { id: "2", title: "Implement secure user auth & auth", completed: false },
  //     { id: "3", title: "Develop API endpoints", completed: true },
  //     {
  //       id: "4",
  //       title: "Implement comprehensive unit tests and integration tests",
  //       completed: false,
  //     },
  //     {
  //       id: "5",
  //       title: "Create clear and detailed API documentation",
  //       completed: false,
  //     },
  //   ],
  //   startDate: "2025-04-15",
  //   endDate: "2025-07-15",
  //   status: "active",
  // },
  // {
  //   id: 2,
  //   title: "Full Stack Development (Vidlify)",
  //   owner: "Bravework Studio",
  //   budget: "$1000",
  //   category: "Web Development",
  //   description:
  //     "This project focuses on modernizing an existing website by migrating the existing React website to a Next.js framework. This transition will unify the frontend and backend within a single codebase, streamlining maintenance and deployment processes.",
  //   todos: [
  //     { id: "1", title: "Set up New Next.js Project", completed: true },
  //     {
  //       id: "2",
  //       title: "Migrate Existing React Components to Next.js",
  //       completed: true,
  //     },
  //     { id: "3", title: "Implement Next.js Routing", completed: true },
  //     {
  //       id: "4",
  //       title: "Configure Data Fetching (SSR, SSG, CSR)",
  //       completed: true,
  //     },
  //     {
  //       id: "5",
  //       title: "Integrate Backend Logic (API Routes or Custom Server)",
  //       completed: true,
  //     },
  //     {
  //       id: "8",
  //       title: "Thoroughly Test All Functionality and Performance",
  //       completed: false,
  //     },
  //     {
  //       id: "9",
  //       title: "Update Documentation with Next.js Specifics",
  //       completed: true,
  //     },
  //     { id: "10", title: "Deploy the New Next.js Website", completed: true },
  //   ],
  //   startDate: "2025-04-30",
  //   endDate: "2025-06-30",
  //   status: "active",
  // },
  {
    id: 2,
    title: "Software Development",
    subtitle: "Findit",
    owner: "Bravework Studio",
    budget: "$5000",
    category: "Web Development",
    description:
      "This project is about building an application that connect landlords and tenant together without the need for a middle man that charge outrageous agent fee",
    todos: [
      { id: "1", title: "User Management", completed: true },
      {
        id: "2",
        title: "Flat Rentals",
        completed: false,
      },
      { id: "3", title: "Flatmate Finder", completed: false },
      {
        id: "4",
        title: "Used Item Marketplace",
        completed: false,
      },
      {
        id: "5",
        title: "Pay To Stay",
        completed: false,
      },
      {
        id: "8",
        title: "Travel Companion",
        completed: false,
      },
      {
        id: "9",
        title: "Chores",
        completed: false,
      },
    ],
    startDate: "2025-04-20",
    endDate: "2025-12-30",
    status: "active",
  },
];

export { testimonials, portfolios, services, projects };

export const coursesData = [
  {
    id: 1,
    title: "3D Animation Training for Kids",
    tagline: "Program Title: 3D Animation Adventure for Kids",
    targetAudience: "7–14 years",
    duration: "7 weeks",
    software: "Blender and 3D Slicer(free, open-source)",
    overview:
      "This beginner-friendly program introduces kids to 3D animation through fun, hands-on projects using Blender. From creating simple shapes to animating flying cars and mysterious characters, kids will build their own 3D world while learning valuable STEM/STEAM skills. No prior experience is required. Just curiosity and creativity!",
    levels: [
      {
        level: "Level 1",
        title: "Getting Started with Blender",
        objective:
          "Learn to install and navigate Blender’s interface, building confidence in 3D software.",
        description:
          "Download and install Blender with step-by-step guidance. Explore the Blender interface through a fun, guided tour, learning basic tools like moving, scaling, and rotating objects.",
        activity:
          "Create a simple 3D cube and transform it into a colorful toy block to understand the workspace.",
        why: "Kids personalize their block with colors, making their first 3D creation in minutes!",
        outcomes: [
          "Understand software installation",
          "master basic navigation",
          "create a simple 3D object.",
        ],
        info: "Builds technical literacy and problem-solving skills, setting a foundation for future tech learning.",
        icon: Shapes,
      },
      {
        level: "Level 2",
        title: "Building a 3D Village Street",
        objective:
          "Create a simple 3D scene using basic shapes and learn lighting basics.",
        description:
          "Build a charming 3D village street using basic shapes (cubes, cylinders) in Blender. Learn to combine shapes to form houses and trees, and change lighting to turn day into night with one click.",
        activity:
          "Design a colorful street scene, experimenting with colors and lighting effects.",
        why: "Kids create their own mini-world and see how a single click transforms their scene, sparking creativity!",
        outcomes: [
          "Master basic modeling",
          "apply colors/textures",
          "adjust lighting settings.",
        ],
        info: "Encourages artistic expression and introduces kids to environmental design concepts used in games and films.",
        icon: Home,
      },
      {
        level: "Level 3",
        title: "Crafting a Hovering Car",
        objective:
          "Customize shapes to create a fantasy vehicle and introduce basic animation.",
        description:
          "Modify basic shapes to design a futuristic hovering car, learning to edit vertices and edges. Animate the car to “fly” out of the village street from Level 2.",
        activity:
          "Create and animate a unique hovering car, choosing its colors and style.",
        why: "Kids bring their sci-fi dreams to life, making their car soar through their 3D world!",
        outcomes: [
          "Understand shape editing",
          "apply basic animation techniques",
          "integrate objects into a scene.",
        ],
        info: "Fosters problem-solving and introduces animation principles used in professional studios.",
        icon: Car,
      },
      {
        level: "Level 4",
        title: "Designing a Village Island",
        objective:
          "Build a complex 3D environment and encourage creative storytelling.",
        description:
          "Expand their world by creating a 3D island village where their hovering car lands. Add details like trees, water, and houses, and share ideas for what their island includes (e.g., a park, a castle).",
        activity:
          "Design a unique island village, customizing elements based on their imagination.",
        why: "Kids become world-builders, shaping a unique island and sharing their creative ideas with the group.",
        outcomes: [
          "Master scene composition",
          "apply advanced modeling techniques",
          "practice creative collaboration.",
        ],
        info: "Enhances teamwork and storytelling skills, preparing kids for creative and technical careers.",
        icon: Trees,
      },
      {
        level: "Level 5",
        title: "Creating Mysterious Characters",
        objective:
          "Design and animate a custom 3D character to enhance storytelling skills.",
        description:
          "Create a mysterious character (e.g., a pirate, alien, or magical creature) to inhabit their island. Learn basic character modeling and simple animation (e.g., walking or waving) with instructor guidance.",
        activity:
          "Design a unique character and animate it to interact with the island village, sharing their character’s story.",
        why: "Kids invent their own character and bring it to life, telling a story through animation!",
        outcomes: [
          "Learn character modeling",
          "basic rigging",
          "storytelling through animation.",
        ],
        info: "Boosts creativity and narrative skills, aligning with media and game design industries.",
        icon: Ghost,
      },
      {
        level: "Level 6",
        title: "Animating a Flying Aircraft",
        objective:
          "Master advanced modeling and animation to create a dynamic 3D scene.",
        description:
          "Build and animate a detailed 3D aircraft (e.g., a spaceship or plane) that flies across their island. Add advanced effects like camera animation and motion blur, and optionally place a character inside.",
        activity:
          "Create a short animated sequence of their aircraft flying, choosing its design and flight path.",
        why: "Kids produce a professional-looking animation, deciding their aircraft’s story and style!",
        outcomes: [
          "Master advanced modeling",
          "animation",
          "camera techniques",
          "rendering.",
        ],
        info: "Prepares kids for advanced STEM/STEAM careers in animation, gaming, or film production.",
        icon: Plane,
      },
      {
        level: "Bonus",
        title: "FAQ & Graduation",
        objective:
          "Master advanced modeling and animation to create a dynamic 3D scene.",
        description:
          "Build and animate a detailed 3D aircraft (e.g., a spaceship or plane) that flies across their island. Add advanced effects like camera animation and motion blur, and optionally place a character inside.",
        activity:
          "Create a short animated sequence of their aircraft flying, choosing its design and flight path.",
        why: "Kids produce a professional-looking animation, deciding their aircraft’s story and style!",
        outcomes: [
          "Master advanced modeling",
          "animation",
          "camera techniques",
          "rendering.",
        ],
        info: "Prepares kids for advanced STEM/STEAM careers in animation, gaming, or film production.",
        icon: GraduationCapIcon,
      },
    ],
    details: {
      prerequisites:
        "No prior experience needed; just a computer (Windows/Mac/Linux) and enthusiasm!",
      duration:
        "8 weeks, with one 1-hour session per week (flexible for online via Zoom).",
      materials:
        "Free Blender software (download at blender.org). A mouse is recommended for easier navigation.",
      classSize: "Small groups (5–10 kids) for personalized attention.",
      feedback:
        "Weekly opportunities for kids to share ideas and showcase projects, fostering creativity and confidence.",
      certification:
        "Kids receive a Bravework Studio 3D Animation Certificate upon completion, celebrating their new skills!",
      cost: "Check www.braveworkstudio.com/courses for the updated price.",
    },
    whyChooseUs: [
      {
        title: "Fun and Engaging",
        description:
          "Projects like flying cars and mysterious characters keep kids excited and motivated.",
      },
      {
        title: "STEM/STEAM Focus",
        description:
          "Builds skills in science, technology, engineering, arts, and math, preparing kids for future careers.",
      },
      {
        title: "Tailored for Kids",
        description:
          "Designed for ages 8–14, with beginner-friendly steps and expert guidance from Ahbideen Yusuf, a 3D generalist and Bravework Studio founder.",
      },
      {
        title: "Community Impact",
        description:
          "Part of Bravework Studio’s mission is to empower local kids with creative and technical skills.",
      },
    ],
    howToJoin: [
      "Contact Ahbideen Yusuf at ahbideeny@braveworkstudio.com.",
      "Sign up for our next workshop at www.braveworkstudio.com/courses.",
      "Follow us on Bravework_studio for updates and kid-created 3D showcases!",
    ],
  },

  // Medical Course
  {
    id: 2,
    title: "3D Visualization for Medical Professionals",
    tagline: "Unlocking the Power of 3D Animation in Healthcare",
    targetAudience: "18 years above",
    duration: "4 weeks",
    software: "Blender (free, open-source)",
    overview:
      "This beginner-friendly program equips doctors with 3D design and animation skills to create medical visualizations, patient education tools, and custom prosthetics. Through hands-on projects, doctors will learn to use Blender to enhance clinical practice, improve patient communication, and support medical training. No prior 3D experience is required—just a desire to innovate in healthcare.",
    levels: [
      {
        level: "Level 1 & 2",
        title: "Introduction to Blender & Modeling",
        objective:
          "Master Blender installation and interface navigation for medical applications & Create a basic 3D anatomical model and apply simple textures for visualization.",
        description:
          " Download and install Blender with guided support. Explore the Blender interface, learning essential tools like object manipulation (move, scale, rotate) tailored for medical modeling. Build a 3D model of a heart using basic shapes (spheres, cylinders) in Blender. Learn to apply colors and basic textures to represent heart tissue, and adjust lighting to highlight details.",
        activity:
          "Create a short animation of a beating heart, customizing its rhythm and style for educational use. Design a spine model for surgical planning, customizing it based on a specific medical scenario (e.g., scoliosis correction).",
        why: "Doctors gain confidence in navigating 3D software, preparing them to visualize anatomical structures. Doctors learn to create clear, visual representations for patient education or teaching.",
        outcomes: [
          "Install Blender",
          "navigate the interface",
          "create a basic 3D model relevant to medicine",
          "Master basic modeling",
          "apply textures",
          "and adjust lighting for medical visualizations.",
        ],
        info: "Install Blender, navigate the interface, and create a basic 3D model relevant to medicine. Builds a foundation for creating precise medical visualizations, enhancing diagnostic and educational capabilities.",
        icon: Shapes,
      },
      {
        level: "Level 3 & 4",
        title: "Animation & Surgical Planning",
        objective:
          "Animate a medical process to enhance understanding of dynamic systems. Build a complex 3D anatomical model for surgical planning or education.",
        description:
          "Create a detailed 3D model of a spine or joint, combining multiple shapes and adding details (e.g., vertebrae, ligaments). Introduce importing medical imaging data (e.g., DICOM files via 3D Slicer) for real-world applications. Doctors share ideas for their model’s clinical use. Modify the heart model from Level 2 to animate a heartbeat cycle, learning basic keyframing techniques. Explore how to edit shapes for accuracy (e.g., adjusting heart chambers).",
        activity: "Learn animation basics and apply to surgical planning.",
        why: "Doctors can visualize dynamic processes (e.g., blood flow, heart function) for teaching or patient explanations. Doctors learn to create precise models for pre-surgical visualization, reducing risks and improving outcomes.",
        outcomes: [
          "Understand basic animation",
          "shape editing",
          "keyframing for medical applications",
          "apply 3D to clinical scenarios",
          "integrate medical imaging",
          "Master complex modeling",
        ],
        info: "Enhances ability to demonstrate physiological processes, supporting medical education and patient consultations. Supports surgical precision and enhances collaboration with colleagues and patients.",
        icon: Film,
      },
      {
        level: "Level 5 & 6",
        title: "Patient Education & 3D Printing",
        objective:
          "Create a 3D model for printing and master advanced animation techniques. Develop a 3D animation to explain a&rdquo; medical procedures to patients.",
        description:
          "Design a simple 3D model of an organ (e.g., a lung or kidney) and animate a medical procedure (e.g., stent placement or tumor removal). Learn basic rigging and animation to simulate the procedure. Design a 3D model of a custom prosthetic (e.g., a hand or foot) suitable for 3D printing. Learn advanced techniques like camera animation and rendering for high-quality visuals, and animate the prosthetic’s movement.",
        activity:
          "Create an animated sequence showing a stent placement in a blood vessel, tailored for patient education. Create and animate a 3D prosthetic hand model, simulating its use in a clinical scenario, and prepare it for 3D printing.",
        why: "Doctors gain skills to produce custom medical devices and professional visualizations, advancing patient care. Doctors can produce engaging visuals to explain treatments, improving patient understanding and compliance.",
        outcomes: [
          "storytelling through medical visuals",
          "basic rigging",
          "Learn advanced animation",
          "rendering for medical applications",
          "advanced animation",
          "Master 3D printing preparation",
        ],
        info: " Enhances patient communication and medical training with professional-grade animations. Enables creation of patient-specific prosthetics and high-quality educational content, enhancing clinical practice.",
        icon: BookOpen,
      },
      {
        level: "Bonus",
        title: "FAQ, Career Pathways, and Graduation Celebration",
        objective:
          "Address remaining questions, provide clear growth pathways, and celebrate achievements with professional networking.",
        description:
          "Expand their world by creating a 3D island village where their hovering car lands. Add details like trees, water, and houses, and share ideas for what their island includes (e.g., a park, a castle).",
        activity:
          "Graduation Celebration & Networking, group photograph, casual video interviews",
        why: "Addressing remaining questions, providing clear growth pathways, and celebrating achievements with professional networking opportunities.",
        outcomes: [
          "Gain clarity on next steps and future opportunities",
          "Have doubts and questions addressed",
          "Connect with peers and industry professionals through networking",
        ],
        info: "Expand professional networks, gain insights into creative and technical careers, and celebrate the completion of the 3D design journey with a sense of accomplishment and newfound confidence.",
        icon: Award,
      },
    ],
    details: {
      prerequisites:
        "No 3D experience required; basic computer skills and a computer (Windows/Mac/Linux) needed. A mouse is recommended for easier navigation.",
      duration: "4 weeks, with one 3-hour session per week",
      materials:
        "Free Blender software (download at blender.org). A mouse is recommended for easier navigation.",
      classSize:
        "Small groups (5-10 professionals) for personalized attention.",
      feedback:
        "Weekly opportunities for doctors to discuss clinical applications and share project ideas, fostering collaboration.",
      certification:
        "Participants receive a Bravework Studio's 3D Medical Visualization Certificate upon completion, enhancing professional credentials.",
      cost: "Check www.braveworkstudio.com/courses for the updated price.",
    },
    whyChooseUs: [
      {
        title: "Practical and Professional",
        description:
          "Tailored projects (e.g., heart animations, prosthetics) directly apply to clinical practice, patient education, and surgical planning.",
      },
      {
        title: "Beginner-Friendly",
        description:
          "Designed for doctors with no 3D experience, guided by Ahbideen Yusuf, a 3D generalist and Bravework Studio founder with animation and development expertise.",
      },
      {
        title: "Medical Innovation",
        description:
          "Equips doctors with cutting-edge skills to create custom visualizations and devices, aligning with modern healthcare advancements.",
      },
      {
        title: "Community Impact",
        description:
          "Part of our mission to empower local professionals with innovative 3D skills, as highlighted in our community workshops.",
      },
    ],
    howToJoin: [
      "Contact Ahbideen Yusuf at ahbideeny@braveworkstudio.com.",
      "Sign up for our next workshop at www.braveworkstudio.com/courses.",
      "Follow us on Bravework_studio for updates and doctor-created 3D showcases!",
    ],
  },
  {
    id: 3,
    title: "Medical 3D Visualization in Just 2 Hours",
    tagline: "Unlocking the Power of 3D Animation in Healthcare",
    targetAudience: "18 years above",
    duration: "2 hours",
    software: "Blender (free, open-source)",
    overview:
      "Demonstrate immediate value through a practical 3D medical visualization project, build excitement for your full program, and generate leads for paid training.",
    levels: [
      {
        level: "10 minutes",
        title: "Welcome & Icebreaker",
        objective:
          "Set professional tone, build rapport, and understand audience needs.",
        description:
          " Download and install Blender with guided support. Explore the Blender interface, learning essential tools like object manipulation (move, scale, rotate) tailored for medical modeling. Build a 3D model of a heart using basic shapes (spheres, cylinders) in Blender. Learn to apply colors and basic textures to represent heart tissue, and adjust lighting to highlight details.",
        activity: `Step-by-Step Demo: Live screen share building a simplified heart
Guided Practice: "Follow along: Build your heart model. I'll help troubleshoot."  
`,
        why: "",
        outcomes: [],
        info: "Every doctor has a basic 3D heart model by session end.",
        icon: Handshake,
      },
      {
        level: "15 minutes",
        title: "The Medical 3D Revolution",
        objective:
          "Show why 3D visualization is essential for modern medical practice.",
        description: "",
        activity: `Professional Edge: "Be the doctor who brings cutting-edge visualization to your practice."

`,
        why: "",
        outcomes: [],
        info: "You'll create what takes most doctors months to learn",
        icon: Hospital,
      },
      {
        level: "30 minutes",
        title: "From Zero to Medical Modeling",
        objective: "Blender Crash Course: From Zero to Medical Modeling",
        description: "",
        activity: `Download: "If you haven't, download Blender now (blender.org)—it's free and works on any computer."  
Guided Tour: Live demo of Blender interface. Hands-On: "Everyone: Add a cube, change its color to red, and rotate it. Perfect!"
Step-by-Step Demo: Live screen share building a simplified heart
Guided Practice: "Follow along: Build your heart model. I'll help troubleshoot."  
`,
        why: "",
        outcomes: [],
        info: "Every doctor has a basic 3D heart model by session end.",
        icon: Wrench,
      },
      {
        level: "25 minutes",
        title: "Bring Anatomy to Life",
        objective:
          "Demonstrate animation power through a simple heartbeat cycle.",
        description: "",
        activity: `Medical Application: "This same technique visualizes blood flow, stent placement, or tumor growth. Keyframing Introduction: "Animation shows dynamic processes—like a beating heart.
Live Demo: Animate the heart model. Guided Practice: "Animate your heart"  
Customization: "Make it yours—change the beat speed, add color pulses for oxygen flow."  
Troubleshooting: Live help for common issues (wrong keyframes, timeline confusion).
          `,
        why: "",
        outcomes: [],
        info: "Doctors see their 3D heart model animate—a true 'wow' moment!",
        icon: Heart,
      },
      {
        level: "15 minutes",
        title: "Applications: From Bedside to Operating Room",
        objective:
          "Connect skills to real medical applications, building excitement for advanced training.",
        description: "",
        activity: `Patient Education: "Use your heart model to explain arrhythmias—patients understand 3D better than diagrams."  
Surgical Planning: "Scale this up to full anatomical models from CT scans for pre-op visualization."  
Medical Training: "Animate procedures for residents—3D reduces training time by 30%."  
Research & Publication: "Create publication-ready 3D models for journals and conferences."

`,
        why: "",
        outcomes: [],
        info: "In our 4-week program, you'll learn: CT scan integration, 3D printing prosthetics, VR surgical simulation.",
        icon: Stethoscope,
      },
      {
        level: "15 minutes",
        title: "Hands-On Challenge & Peer Review",
        objective:
          "Build confidence through peer interaction and immediate application.",
        description: "",
        activity: `Mini-Challenge: "Enhance your heart model: Add a simple blood vessel or change the lighting for surgical viewing."  
Peer Review: "Share screens (or pass models in-person). What did you learn from each other's approaches?"  
Group Discussion: "How could you use this in your practice tomorrow?"  
Collect Feedback: Quick Google Form: "On a scale of 1-10, how likely are you to use 3D visualization?"

`,
        why: "",
        outcomes: [],
        info: "Doctors feel ownership of their creation and see practical applications.",
        icon: Puzzle,
      },
      {
        level: "10 minutes",
        title: "Q&A, Next Steps, and Call-to-Action",
        objective:
          "Answer questions, present clear enrollment path, and close strong.",
        description: "",
        activity: `Immediate Action: "Download our Medical 3D Starter Kit (templates, textures, tutorials)."  
Full Program: "Join our 4-week Medical Visualization Mastery program—next cohort starts [date]. Early bird pricing ends [date]."  
Special Offer: "Session attendees get 20% off the full program + free 1:1 consultation."  
Networking: "Stay for 15 minutes of coffee and conversation—connect with fellow 3D-curious doctors."

`,
        why: "",
        outcomes: [],
        info: "You've just created something that could change patient lives. Imagine what you'll do with 4 weeks of training. Thank you for joining Bravework Studio's medical 3D revolution",
        icon: HelpCircle,
      },
    ],
    details: {
      prerequisites:
        "No 3D experience required; basic computer skills and a computer (Windows/Mac/Linux) needed. A mouse is recommended for easier navigation.",
      duration: "4 weeks, with one 3-hour session per week",
      materials:
        "Free Blender software (download at blender.org). A mouse is recommended for easier navigation.",
      classSize:
        "Small groups (5-10 professionals) for personalized attention.",
      feedback:
        "Weekly opportunities for doctors to discuss clinical applications and share project ideas, fostering collaboration.",
      certification:
        "Participants receive a Bravework Studio's 3D Medical Visualization Certificate upon completion, enhancing professional credentials.",
      cost: "Check www.braveworkstudio.com/courses for the updated price.",
    },
    whyChooseUs: [
      {
        title: "Practical and Professional",
        description:
          "Tailored projects (e.g., heart animations, prosthetics) directly apply to clinical practice, patient education, and surgical planning.",
      },
      {
        title: "Beginner-Friendly",
        description:
          "Designed for doctors with no 3D experience, guided by Ahbideen Yusuf, a 3D generalist and Bravework Studio founder with animation and development expertise.",
      },
      {
        title: "Medical Innovation",
        description:
          "Equips doctors with cutting-edge skills to create custom visualizations and devices, aligning with modern healthcare advancements.",
      },
      {
        title: "Community Impact",
        description:
          "Part of our mission to empower local professionals with innovative 3D skills, as highlighted in our community workshops.",
      },
    ],
    howToJoin: [
      "Contact Ahbideen Yusuf at ahbideeny@braveworkstudio.com.",
      "Sign up for our next workshop at www.braveworkstudio.com/courses.",
      "Follow us on Bravework_studio for updates and doctor-created 3D showcases!",
    ],
  },
];
