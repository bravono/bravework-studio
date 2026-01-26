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
    name: "Shaka",
    role: "Founder & Creative Director",
    bio: "Visionary leader driving digital innovation in Nigeria.",
    image: "/team/shaka.jpg", // Replace with real paths later
    links: {
      linkedin: "#",
      twitter: "#",
    },
  },
  {
    name: "Jane Doe",
    role: "Head of Academy",
    bio: "Passionate educator with 10+ years in tech education.",
    image: "/team/jane.jpg",
    links: {
      linkedin: "#",
    },
  },
  {
    name: "John Smith",
    role: "Lead 3D Artist",
    bio: "Expert in creating immersive 3D experiences.",
    image: "/team/john.jpg",
    links: {
      twitter: "#",
      website: "#",
    },
  },
  // Add more members as needed
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
            {/* Using a placeholder if image doesn't exist */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <span className="text-4xl font-black">{member.name[0]}</span>
            </div>
            {/* <Image src={member.image} alt={member.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" /> */}
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
