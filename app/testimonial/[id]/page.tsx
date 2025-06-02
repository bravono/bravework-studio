import React from "react";
import { notFound } from "next/navigation";
import { testimonials } from "../../services/localDataService";

export default async function TestimonialDetailPage({
  params,
}: {
  params: { id: number };
}) {
  const testimonial = testimonials.find((t) => t.id === Number(params.id));

  if (!testimonial) {
    notFound();
  }

  const customerTestimony = testimonial
    ? testimonials.filter((t) => t.companyName === testimonial.companyName)
    : [];

  return (
    <div
      className="testimonial-detail-container"
      style={{
        maxWidth: 600,
        margin: "100px auto",
        padding: 24,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      }}
    >
      <div>
        <img
          src={testimonial.avatar}
          alt={testimonial.companyName}
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            objectFit: "cover",
            marginRight: 24,
            border: "1px solid #008751",
          }}
        />
        <h2 style={{ marginBottom: 25 }}>{testimonial.companyName}</h2>
      </div>
      {customerTestimony.map((testimonial) => (
        <>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 50 }}
          >
            <div>
              <div style={{ fontWeight: 900 }}>{testimonial.heading}</div>

              <blockquote
                style={{
                  fontSize: 15,
                  fontStyle: "italic",
                  color: "#222",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                “{testimonial.body}”
              </blockquote>
            </div>
          </div>
        </>
      ))}
    </div>
  );
}
