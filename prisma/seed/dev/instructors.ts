import { prisma } from "../client";

export async function seedInstructors() {
    const instructors = [
        {
            instructor_id: 1,
            first_name: "Ahbideen",
            last_name: "Yusuf",
            bio: "Lead 3D artist and instructor with 10+ years of experience in Blender.",
            photo_url: "",
            email: "ahbideeny@braveworkstudio.com",
        },
    ];

    for (const instructor of instructors) {
        await prisma.instructors.upsert({
            where: { instructor_id: instructor.instructor_id },
            update: {
                first_name: instructor.first_name,
                last_name: instructor.last_name,
                bio: instructor.bio,
                photo_url: instructor.photo_url,
                email: instructor.email,
            },
            create: instructor,
        });
    }
}

