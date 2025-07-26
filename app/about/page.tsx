"use client";

import React from "react";
import Navbar from "../components/Navbar";
import { Nosifer } from "next/font/google";

const nosifer = Nosifer({ subsets: ["latin"], weight: "400" });

export default function About() {
  return (
    <main>
      <section className="about-section">
        <div className="container">
          <h1 className={`section-title ${nosifer.className}`}>
            About Bravework Studio
          </h1>
          <div className="about-content">
            <div className="about-text">
              <p>
                Bravework Studio is a creative powerhouse specializing in 3D
                services, web development, and UI/UX design. Founded with a
                passion for bringing ideas to life, we combine technical
                expertise with artistic vision to deliver exceptional results
                for our clients.
              </p>
              <p>
                Our team of skilled professionals brings together years of
                experience in various fields, allowing us to offer comprehensive
                solutions that meet the unique needs of each project.
              </p>
              <p>
                We believe in the power of collaboration and innovation, working
                closely with our clients to understand their vision and bring it
                to reality through cutting-edge technology and creative
                solutions.
              </p>
            </div>
            <div className="about-stats">
              <div className="stat-item">
                <h3>8+</h3>
                <p>Years Experience</p>
              </div>
              <div className="stat-item">
                <h3>100+</h3>
                <p>Projects Completed</p>
              </div>
              <div className="stat-item">
                <h3>50+</h3>
                <p>Happy Clients</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
