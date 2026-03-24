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
    bio: "Visionary leader and Software Engineer with a degree in Mass Communication. With 8 years of experience in 3D design, he is a tech enthusiast and serial learner driving digital innovation in Nigeria.",
    image: "/assets/Profile_Picture.jpg",
    links: {
      linkedin: "https://www.linkedin.com/in/ahbideen-y-74a232179",
      twitter: "https://twitter.com/yahbideen",
    },
  },
  {
    name: "Musa Mbaya Ibrahim Biu",
    role: "Systems Strengthening Specialist",
    bio: "Systems strengthening and development specialist with over 15 years of expertise in climate change, healthcare delivery, and community resilience. PhD candidate in Project Management with extensive experience working with USAID, FCDO, and the Global Fund.",
    image: "/assets/musa-mbaya.png",
    links: {
      linkedin: "#",
      twitter: "#",
    },
  },
  {
    name: "Hussain Biodun Abdulmajeed",
    role: "Writer & Researcher",
    bio: "Emerging researcher, poet, and public relations enthusiast. Author of 'The Necessities for Choosing a Career' and 'A Rough Road', with a profound passion for literary arts and business planning.",
    image: "/assets/hussain-biodun.png",
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
