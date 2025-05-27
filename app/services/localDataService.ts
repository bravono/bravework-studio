interface Testimonial {
  id: number;
  image: string;
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
  owner: string;
  budget: string;
  category: string;
  description: string;
  todos: Todo[];
  startDate: string;
  endDate: string;
  status: "active" | "done" | "pending";
}

interface BudgetRanges {
  value: string;
  label: string;
}

interface Timelines {
  value: string;
  label: string;
}

interface Order {
  title: string;
  description: string;
  icon: string;
  acceptedFiles: string;
  budgetRanges: BudgetRanges[];
  timelines: Timelines[];
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    image: "/assets/Bravework_Studio-Logo-Color.png",
    heading: "What made you choose to work with us?",
    body: "I chose to work with Bravework Studio because of his impressive portfolio and expertise in 3D modeling and game development. I first found him in 2020 on Guru.com when I needed training services in Blender for an employee. His professionalism and deep knowledge made a lasting impression, so I continued working with him on multiple projects. His ability to bring historical elements to life in Unreal Engine 5, such as the Eschenheimer Tor and the Irminsul for my game Die Franken, showcased his exceptional talent and attention to detail.",
    companyName: "Visual Stirytelling GmbH",
    email: "hpbrill@gmx.de",
  },
  {
    id: 2,
    image: "/assets/Bravework_Studio-Logo-Color.png",
    heading: "What was your favorite part of working with us?",
    body: "My favorite part of working with Bravework Studio was his outstanding ability to transform historical concepts into stunning 3D models with incredible accuracy and detail. Whether it was the Eschenheimer Tor for my Wilddieb Hans Winkelsee video or the Irminsul and Saxony battle map for my game Die Franken, he consistently exceeded my expectations. His professionalism, creativity, and deep understanding of Unreal Engine 5 made every collaboration smooth and enjoyable. I also appreciated his clear communication and dedication to delivering top-quality work on time.",
    companyName: "Visual Stirytelling GmbH",
    email: "hpbrill@gmx.de",
  },
  {
    id: 3,
    image: "/assets/Bravework_Studio-Logo-Color.png",
    heading: "How did working with us impact your business/life?",
    body: "Working with Bravework Studio had a significant impact on my projects, helping me bring historical accuracy and immersive realism to my work. His expertise in 3D modeling and Unreal Engine 5 allowed me to enhance my video content and improve the visual quality of my game Die Franken. The Eschenheimer Tor added historical depth to my video about Wilddieb Hans Winkelsee, while the Irminsul and Saxony battle map elevated the authenticity of my game. His contributions not only saved me time but also ensured that I could deliver a higher-quality experience to my audience. Collaborating with Bravework Studio was an investment that truly paid off!",
    companyName: "Visual Stirytelling GmbH",
    email: "hpbrill@gmx.de",
  },
  {
    id: 4,
    image: "/assets/Bravework_Studio-Logo-Color.png",
    heading: "Would you recommend us to others? Why or why not?",
    body: 'Absolutely! I would highly recommend Bravework Studio to anyone in need of "high-quality 3D modeling, Unreal Engine assets, or game development services". His attention to detail, deep understanding of historical accuracy, and technical expertise make him a standout professional. Whether it was training in Blender, creating the "Eschenheimer Tor" for my video, or designing the "Irminsul" and "Saxony battle map" for my game *Die Franken*, he consistently delivered "exceptional results on time". His professionalism, clear communication, and dedication to quality make him a fantastic partner for any project. I would work with him again in a heartbeat!',
    companyName: "Visual Stirytelling GmbH",
    email: "hpbrill@gmx.de",
  },
  {
    id: 5,
    image: "/assets/Bravework_Studio-Logo-Color.png",
    heading: "What made you choose to work with us?",
    body: "Was sort of a shot in the dark.  The price was good and worth the risk of working with someone I didn't know",
    companyName: "Parker Van Lawrence",
    email: "parker@vanlawrence.co.nz",
  },
  {
    id: 6,
    image: "/assets/Bravework_Studio-Logo-Color.png",
    heading: "What was your favorite part of working with us?",
    body: "Your should superhuman levels of patience.",
    companyName: "Parker Van Lawrence",
    email: "parker@vanlawrence.co.nz",
  },
  {
    id: 7,
    image: "/assets/Bravework_Studio-Logo-Color.png",
    heading: "How did working with us impact your business/life?",
    body: "It has completely changed my son's life and launched him into a profession 10 years earlier than he could have otherwise hoped.",
    companyName: "Parker Van Lawrence",
    email: "parker@vanlawrence.co.nz",
  },
  {
    id: 8,
    image: "/assets/Bravework_Studio-Logo-Color.png",
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
    category: "3D Services",
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
    category: "3D Services",
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
    category: "3D Services",
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
    category: "3D Services",
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
    category: "3D Services",
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
    category: "3D Services",
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
    category: "3D Services",
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
    category: "3D Services",
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
    category: "3D Services",
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
    category: "3D Services",
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
    otherSamples: [],
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
    category: "UI/UX Design",
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
    category: "3D Services",
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
    category: "Voice Services",
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
      "Your kids will love to learn 3D modeling and animation with our simple and easy to understand training services.",
    icon: "🤼‍♂️",
  },
];

const projects: Project[] = [
  {
    id: 1,
    title: "Backend Integration",
    owner: "Bravework Studio",
    budget: "$5000",
    category: "Web Development",
    description:
      "Develop a robust backend system for the corporate website to enable key e-commerce functionalities, including user order tracking, automated update notifications, and personalized discounts based on purchase history.",
    todos: [
      { id: "1", title: "Define backend architecture", completed: false },
      { id: "2", title: "Implement secure user auth & auth", completed: false },
      { id: "3", title: "Develop API endpoints", completed: false },
      {
        id: "4",
        title: "Implement comprehensive unit tests and integration tests",
        completed: false,
      },
      {
        id: "5",
        title: "Create clear and detailed API documentation",
        completed: false,
      },
    ],
    startDate: "2025-04-15",
    endDate: "2025-05-15",
    status: "active",
  },
  {
    id: 2,
    title: "Full Stack Development",
    owner: "Bravework Studio",
    budget: "$5000",
    category: "Web Development",
    description:
      "This project focuses on modernizing an existing website by migrating the existing React website to a Next.js framework. This transition will unify the frontend and backend within a single codebase, streamlining maintenance and deployment processes.",
    todos: [
      { id: "1", title: "Set up New Next.js Project", completed: false },
      {
        id: "2",
        title: "Migrate Existing React Components to Next.js",
        completed: false,
      },
      { id: "3", title: "Implement Next.js Routing", completed: false },
      {
        id: "4",
        title: "Configure Data Fetching (SSR, SSG, CSR)",
        completed: false,
      },
      {
        id: "5",
        title: "Integrate Backend Logic (API Routes or Custom Server)",
        completed: false,
      },
      {
        id: "8",
        title: "Thoroughly Test All Functionality and Performance",
        completed: false,
      },
      {
        id: "9",
        title: "Update Documentation with Next.js Specifics",
        completed: true,
      },
      { id: "10", title: "Deploy the New Next.js Website", completed: false },
    ],
    startDate: "2025-04-30",
    endDate: "2025-05-30",
    status: "pending",
  },
];

const orders: Order[] = [
  {
    title: "3D Modeling & Animation",
    description:
      "Professional 3D modeling, animation, and visualization services for your projects.",
    icon: "🎨",
    acceptedFiles: ".fbx,.obj,.blend,.3ds,.max,.dae,.glb,.stl",
    budgetRanges: [
      { value: "500-1000", label: "$500 - $1,000" },
      { value: "1000-2000", label: "$1,000 - $2,000" },
      { value: "2000-3000", label: "$2,000 - $3,000" },
      { value: "3000+", label: "$3000+" },
    ],
    timelines: [
      { value: "1-2months", label: "1-2 months" },
      { value: "2-3months", label: "2-3 months" },
      { value: "3-6months", label: "3-6 months" },
    ],
  },
  {
    title: "Web Development",
    description:
      "Custom web applications and websites built with modern technologies.",
    icon: "🌐",
    acceptedFiles: ".zip,.rar,.pdf,.doc,.docx,.txt.,ai,.psd,.fig,.png,.jpg",
    budgetRanges: [
      { value: "200-500", label: "$200 - $500" },
      { value: "500-1000", label: "$500 - $1000" },
      { value: "1000-3000", label: "$1000 - $3000" },
      { value: "3000+", label: "$3000+" },
    ],
    timelines: [
      { value: "2-4weeks", label: "2-4 weeks" },
      { value: "1-2months", label: "1-2 months" },
      { value: "2-4months", label: "2-4 months" },
      { value: "4months+", label: "4 months+" },
    ],
  },
  {
    title: "UI/UX Design",
    description: "User-centered design solutions that enhance user experience.",
    icon: "✨",
    acceptedFiles: ".psd,.ai,.sketch,.fig,.xd,.pdf,.png,.jpg",
    budgetRanges: [
      { value: "100-500", label: "$100 - $500" },
      { value: "500-1000", label: "$500 - $1000" },
      { value: "1000-2000", label: "$1000 - $2000" },
      { value: "2000+", label: "$2000+" },
    ],
    timelines: [
      { value: "2-4weeks", label: "2-4 weeks" },
      { value: "1-2months", label: "1-2 months" },
      { value: "2-4months", label: "2-4 months" },
      { value: "4months+", label: "4 months+" },
    ],
  },
  {
    title: "Game Development",
    description: "Engaging game development services for various platforms.",
    icon: "🎮",
    acceptedFiles: ".unity,.uproject,.fbx,.obj,.blend,.pdf,.zip,.rar,.docx",
    budgetRanges: [
      { value: "1000-2000", label: "$1,000 - $2,000" },
      { value: "2000-4000", label: "$2000 - $4000" },
      { value: "4000-8000", label: "$4000 - $8000" },
      { value: "8000+", label: "$8000+" },
    ],
    timelines: [
      { value: "3-6months", label: "3-6 months" },
      { value: "6-12months", label: "6-12 months" },
      { value: "12months+", label: "12 months+" },
    ],
  },
  {
    title: "Voice-Over Services",
    description:
      "Professional voice-over services for your videos, games, and multimedia projects.",
    icon: "🎙️",
    acceptedFiles: ".mp3,.wav,.ogg,.aac,.m4a,.pdf,.docx,.txt,.png,.jpg",
    budgetRanges: [
      { value: "20-50", label: "$20 - $50" },
      { value: "50-100", label: "$50 - $100" },
      { value: "100-500", label: "$100 - $500" },
      { value: "500+", label: "$500+" },
    ],
    timelines: [
      { value: "1-2days", label: "1-2 days" },
      { value: "2-5days", label: "2-5 days" },
      { value: "5-10days", label: "5-10 days" },
      { value: "10days+", label: "10 days+" },
    ],
  },
];

export { testimonials, portfolios, services, projects, orders };
