"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Linkedin, Twitter, Globe } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  links?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    name: "Ahbideen Yusuf",
    role: "Founder & Creative Director",
    bio: "Visionary leader and software engineer with a background in mass communication. Brings 8 years of 3D design expertise and a passion for digital innovation across Africa.",
    image: "/assets/ahbideen_yusuf.jpg",
    links: {
      linkedin: "https://www.linkedin.com/in/ahbideen-y-74a232179",
      twitter: "https://twitter.com/yahbideen",
    },
  },
  {
    name: "Musa Mbaya Ibrahim Biu",
    role: "Systems Strengthening Specialist",
    bio: "Systems and development specialist with 15+ years of experience in climate change, healthcare delivery, and community resilience. PhD candidate in project management with extensive work across international development organizations.",
    image: "/assets/Bravework_Studio-Logo-White.png",
    links: {
      linkedin: "#",
      twitter: "#",
    },
  },
  {
    name: "Hussain Biodun Abdulmajeed",
    role: "Writer & Researcher",
    bio: "Researcher and author with expertise in literary arts and business strategy. Published works include 'The Necessities for Choosing a Career' and 'A Rough Road'.",
    image: "/assets/Bravework_Studio-Logo-White.png",
    links: {
      linkedin: "#",
      twitter: "#",
    },
  },
  {
    name: "Kudus Yusuf",
    role: "Software Engineer & UI/UX Designer",
    bio: "Software engineer and UI/UX designer with a background in mass communication. Specializes in creating intuitive digital products that merge technical excellence with user-centered design.",
    image: "/assets/Bravework_Studio-Logo-White.png",
    links: {
      linkedin:
        "https://www.linkedin.com/in/kudus-yusuf-4b3a9233b?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      twitter: "#",
    },
  },
  {
    name: "Titus Yohanna",
    role: "Strategic Academy Coach & Partnerships Lead",
    bio: "Strategic coach supporting Bravework Studio Academy learners and partners. Combines leadership development, mentorship, policy research, and applied data insights to foster impact-driven learning and career growth.",
    image: "/assets/team/titus_yohanna.jpeg",
    links: {
      linkedin: "#",
      twitter: "#",
    },
  },
];

export default function TeamGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
      {teamMembers.map((member, index) => (
        <motion.div
          key={member.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden group"
        >
          <div className="relative h-64 bg-gray-200">
            <Image
              src={member.image}
              alt={member.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {member.name}
            </h3>
            <p className="text-blue-600 font-medium mb-4">{member.role}</p>
            <p className="text-gray-600 mb-6">{member.bio}</p>
            <div className="flex gap-4">
              {member.links?.linkedin && (
                <a
                  href={member.links.linkedin}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {member.links?.twitter && (
                <a
                  href={member.links.twitter}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {member.links?.website && (
                <a
                  href={member.links.website}
                  className="text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
