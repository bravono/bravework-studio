import Joi from "joi";

// Contact Form Schema
export const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().min(2).max(200).required(),
  message: Joi.string().min(10).max(5000).required(),
  department: Joi.string()
    .valid("Studio", "Academy", "Kids", "Rentals", "General")
    .optional(),
});

// Job Application Schema
export const jobApplicationSchema = Joi.object({
  role: Joi.string().required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow("").optional(),
  portfolio: Joi.string().uri().allow("").optional(),
  experience: Joi.string().required(),
  availability: Joi.string().required(),
  message: Joi.string().max(5000).allow("").optional(),
  // File validation is handled separately via the JSON parsing check in the route
});

// Newsletter Subscription Schema
export const subscriptionSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(100).required(),
  isActive: Joi.boolean().optional(),
});

// Admin Custom Offer Schema
export const customOfferSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  offerAmount: Joi.number().min(0).required(),
  description: Joi.string().min(10).required(),
  expiresAt: Joi.string().isoDate().allow(null).optional(),
  projectDuration: Joi.number().min(0).optional(),
});

// Rental Booking Schema
export const rentalBookingSchema = Joi.object({
  rentalId: Joi.string().uuid().required(),
  startTime: Joi.string().isoDate().required(),
  endTime: Joi.string().isoDate().required(),
  totalAmount: Joi.number().min(0).required(),
});
