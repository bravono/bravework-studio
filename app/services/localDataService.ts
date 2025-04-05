interface Testimonial {
    id: number;
    image: string;
    heading: string;
    body: string;
    companyName: string;
    email: string;
  }
  
  // Sample testimonials data - replace with your actual testimonials
  const testimonials: Testimonial[] = [
    {
      id: 1,
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      heading: 'What made you choose to work with us?',
      body: 'I chose to work with Bravono because of his impressive portfolio and expertise in 3D modeling and game development. I first found him in 2020 on Guru.com when I needed training services in Blender for an employee. His professionalism and deep knowledge made a lasting impression, so I continued working with him on multiple projects. His ability to bring historical elements to life in Unreal Engine 5, such as the Eschenheimer Tor and the Irminsul for my game Die Franken, showcased his exceptional talent and attention to detail.',
      companyName: 'Visual Stirytelling GmbH',
      email: 'hpbrill@gmx.de'
    },
    {
      id: 2,
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      heading: 'What was your favorite part of working with us?',
      body: 'My favorite part of working with Bravono was his outstanding ability to transform historical concepts into stunning 3D models with incredible accuracy and detail. Whether it was the Eschenheimer Tor for my Wilddieb Hans Winkelsee video or the Irminsul and Saxony battle map for my game Die Franken, he consistently exceeded my expectations. His professionalism, creativity, and deep understanding of Unreal Engine 5 made every collaboration smooth and enjoyable. I also appreciated his clear communication and dedication to delivering top-quality work on time.',
      companyName: 'Visual Stirytelling GmbH',
      email: 'hpbrill@gmx.de'
    },
    {
      id: 3,
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      heading: 'How did working with us impact your business/life?',
      body: 'Working with Bravono had a significant impact on my projects, helping me bring historical accuracy and immersive realism to my work. His expertise in 3D modeling and Unreal Engine 5 allowed me to enhance my video content and improve the visual quality of my game Die Franken. The Eschenheimer Tor added historical depth to my video about Wilddieb Hans Winkelsee, while the Irminsul and Saxony battle map elevated the authenticity of my game. His contributions not only saved me time but also ensured that I could deliver a higher-quality experience to my audience. Collaborating with Bravono was an investment that truly paid off!',
      companyName: 'Visual Stirytelling GmbH',
      email: 'hpbrill@gmx.de'
    },
    {
      id: 4,
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      heading: 'Would you recommend us to others? Why or why not?',
      body: 'Absolutely! I would highly recommend Bravono to anyone in need of **high-quality 3D modeling, Unreal Engine assets, or game development services**. His attention to detail, deep understanding of historical accuracy, and technical expertise make him a standout professional. Whether it was training in Blender, creating the **Eschenheimer Tor** for my video, or designing the **Irminsul** and **Saxony battle map** for my game *Die Franken*, he consistently delivered **exceptional results on time**. His professionalism, clear communication, and dedication to quality make him a fantastic partner for any project. I would work with him again in a heartbeat!',
      companyName: 'Visual Stirytelling GmbH',
      email: 'hpbrill@gmx.de'
    },
    {
      id: 5,
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      heading: 'What made you choose to work with us?',
      body: "Was sort of a shot in the dark.  The price was good and worth the risk of working with someone I didn't know",
      companyName: 'Parker Van Lawrence',
      email: 'parker@vanlawrence.co.nz'
    },
    {
      id: 6,
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      heading: 'What was your favorite part of working with us?',
      body: 'Your should superhuman levels of patience.',
      companyName: 'Parker Van Lawrence',
      email: 'parker@vanlawrence.co.nz'
    },
    {
      id: 7,
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      heading: 'How did working with us impact your business/life?',
      body: "It has completely changed my son's life and launched him into a profession 10 years earlier than he could have otherwise hoped.",
      companyName: 'Parker Van Lawrence',
      email: 'parker@vanlawrence.co.nz'
    },
    {
      id: 8,
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      heading: 'Would you recommend us to others? Why or why not?',
      body: 'I frequently do.',
      companyName: 'Parker Van Lawrence',
      email: 'parker@vanlawrence.co.nz'
    },
    
  ];

  export { testimonials };