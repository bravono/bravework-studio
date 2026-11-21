-- 1. Ensure categories exist and have accurate descriptions
INSERT INTO course_categories (category_name, description) VALUES
  ('Software Development', 'Learn to build modern software, web applications and scalable products'),
  ('3D Animation', 'Master 3D modeling, visualization, animation and visual effects'),
  ('2D Animation', 'Create stunning 2D animations, motion graphics and storytelling'),
  ('AI', 'Artificial Intelligence, autonomous agents, RAG and local models'),
  ('UI/UX Design', 'Design intuitive user interfaces, prototypes and design systems'),
  ('Video Editing', 'Professional video editing, color grading and post-production'),
  ('Game Development', 'Master game design, Unity, Unreal Engine, mechanics and multiplayer'),
  ('Computer Fundamentals', 'Digital literacy, operating systems, and essential productivity tools')
ON CONFLICT (category_name) DO UPDATE SET description = EXCLUDED.description;

-- 2. Update courses with accurate categories
-- 3D Animation courses (fix courses previously miscategorized as Software Development)
UPDATE courses 
SET course_category_id = (SELECT category_id FROM course_categories WHERE category_name = '3D Animation')
WHERE course_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 19, 20, 21);

-- AI courses
UPDATE courses 
SET course_category_id = (SELECT category_id FROM course_categories WHERE category_name = 'AI')
WHERE course_id IN (11, 16, 17, 18);

-- Software Development courses
UPDATE courses 
SET course_category_id = (SELECT category_id FROM course_categories WHERE category_name = 'Software Development')
WHERE course_id IN (13, 27, 28, 29);

-- Computer Fundamentals courses
UPDATE courses 
SET course_category_id = (SELECT category_id FROM course_categories WHERE category_name = 'Computer Fundamentals')
WHERE course_id IN (14, 24, 25, 26);

-- UI/UX Design courses
UPDATE courses 
SET course_category_id = (SELECT category_id FROM course_categories WHERE category_name = 'UI/UX Design')
WHERE course_id IN (15, 30, 31, 32);

-- Game Development courses (fix courses previously miscategorized as 3D Animation or AI)
UPDATE courses 
SET course_category_id = (SELECT category_id FROM course_categories WHERE category_name = 'Game Development')
WHERE course_id IN (22, 23, 33, 34, 35, 36, 37, 38, 39, 40, 79, 80);

-- 3. Clean up obsolete tags and populate standardized tags
DELETE FROM course_tags;

DELETE FROM tags 
WHERE tag_name IN ('Doctors', 'Lawyers', 'Engineers', 'Fashion', 'Designers', 'Tailors', 'Chef', 'UiUx', 'Kids');

INSERT INTO tags (tag_name) VALUES
  ('3D Animation'),
  ('3D Modeling'),
  ('Agentic AI'),
  ('Artificial Intelligence'),
  ('Autonomous Agents'),
  ('Backend'),
  ('Beginner Friendly'),
  ('Blender'),
  ('C#'),
  ('Character Design'),
  ('Computer Basics'),
  ('Content Creation'),
  ('Design Systems'),
  ('Digital Literacy'),
  ('Engineering & Architecture'),
  ('Enterprise'),
  ('Fashion & Apparel'),
  ('Figma'),
  ('Free'),
  ('Frontend'),
  ('Full-Stack'),
  ('Game Development'),
  ('Game Mechanics'),
  ('Kids & Teens'),
  ('Level Design'),
  ('Local AI'),
  ('Mastery & Advanced'),
  ('Medical & Healthcare'),
  ('Multiplayer'),
  ('Office Tools'),
  ('Ollama'),
  ('Portfolio Ready'),
  ('Productivity'),
  ('Prototyping'),
  ('SaaS'),
  ('Teaser Course'),
  ('UI/UX Design'),
  ('Unity'),
  ('Unreal Engine'),
  ('Visualization'),
  ('Web Development')
ON CONFLICT (tag_name) DO NOTHING;

-- 4. Rebuild course_tags relations
INSERT INTO course_tags (course_id, tag_id)
SELECT c.course_id, t.tag_id
FROM (VALUES
  (1, '3D Animation'), (1, '3D Modeling'), (1, 'Blender'), (1, 'Kids & Teens'), (1, 'Beginner Friendly'),
  (2, 'Visualization'), (2, '3D Modeling'), (2, 'Blender'), (2, 'Medical & Healthcare'), (2, 'Teaser Course'), (2, 'Free'),
  (3, 'Visualization'), (3, '3D Modeling'), (3, 'Blender'), (3, 'Medical & Healthcare'), (3, 'Beginner Friendly'),
  (4, 'Visualization'), (4, '3D Modeling'), (4, 'Blender'), (4, 'Beginner Friendly'),
  (5, 'Visualization'), (5, '3D Modeling'), (5, 'Blender'), (5, 'Engineering & Architecture'), (5, 'Teaser Course'), (5, 'Free'),
  (6, 'Visualization'), (6, '3D Modeling'), (6, 'Blender'), (6, 'Engineering & Architecture'), (6, 'Portfolio Ready'),
  (7, '3D Animation'), (7, 'Blender'), (7, 'Content Creation'), (7, 'Teaser Course'),
  (8, '3D Animation'), (8, 'Character Design'), (8, 'Blender'), (8, 'Content Creation'), (8, 'Portfolio Ready'),
  (9, '3D Modeling'), (9, 'Blender'), (9, 'Fashion & Apparel'), (9, 'Visualization'), (9, 'Teaser Course'), (9, 'Free'),
  (10, '3D Modeling'), (10, 'Blender'), (10, 'Fashion & Apparel'), (10, 'Visualization'), (10, 'Portfolio Ready'),
  (11, 'Artificial Intelligence'), (11, 'Local AI'), (11, 'Ollama'), (11, 'Productivity'), (11, 'Autonomous Agents'),
  (12, 'Artificial Intelligence'), (12, '3D Modeling'), (12, 'Blender'), (12, 'Teaser Course'), (12, 'Free'),
  (13, 'Web Development'), (13, 'Full-Stack'), (13, 'Artificial Intelligence'), (13, 'Teaser Course'), (13, 'Free'),
  (14, 'Computer Basics'), (14, 'Digital Literacy'), (14, 'Productivity'), (14, 'Teaser Course'), (14, 'Free'),
  (15, 'UI/UX Design'), (15, 'Figma'), (15, 'Prototyping'), (15, 'Artificial Intelligence'), (15, 'Teaser Course'), (15, 'Free'),
  (16, 'Artificial Intelligence'), (16, 'Local AI'), (16, 'Ollama'), (16, 'Productivity'), (16, 'Beginner Friendly'),
  (17, 'Artificial Intelligence'), (17, 'Local AI'), (17, 'Agentic AI'), (17, 'Autonomous Agents'), (17, 'Productivity'),
  (18, 'Artificial Intelligence'), (18, 'Local AI'), (18, 'Agentic AI'), (18, 'Autonomous Agents'), (18, 'Enterprise'),
  (19, '3D Modeling'), (19, '3D Animation'), (19, 'Blender'), (19, 'Artificial Intelligence'), (19, 'Beginner Friendly'),
  (20, '3D Modeling'), (20, 'Blender'), (20, 'Artificial Intelligence'), (20, 'Portfolio Ready'),
  (21, '3D Modeling'), (21, 'Blender'), (21, 'Artificial Intelligence'), (21, 'Mastery & Advanced'),
  (22, 'Game Development'), (22, 'Game Mechanics'), (22, 'Level Design'), (22, '3D Modeling'),
  (23, 'Game Development'), (23, 'Unreal Engine'), (23, 'Multiplayer'), (23, 'Portfolio Ready'), (23, 'Mastery & Advanced'),
  (24, 'Computer Basics'), (24, 'Digital Literacy'), (24, 'Productivity'), (24, 'Beginner Friendly'),
  (25, 'Computer Basics'), (25, 'Digital Literacy'), (25, 'Productivity'), (25, 'Office Tools'),
  (26, 'Computer Basics'), (26, 'Digital Literacy'), (26, 'Productivity'), (26, 'Portfolio Ready'),
  (27, 'Web Development'), (27, 'Frontend'), (27, 'Artificial Intelligence'), (27, 'Beginner Friendly'),
  (28, 'Web Development'), (28, 'Full-Stack'), (28, 'Backend'), (28, 'Artificial Intelligence'),
  (29, 'Web Development'), (29, 'Full-Stack'), (29, 'SaaS'), (29, 'Artificial Intelligence'), (29, 'Mastery & Advanced'),
  (30, 'UI/UX Design'), (30, 'Figma'), (30, 'Prototyping'), (30, 'Artificial Intelligence'), (30, 'Beginner Friendly'),
  (31, 'UI/UX Design'), (31, 'Figma'), (31, 'Design Systems'), (31, 'Prototyping'), (31, 'Artificial Intelligence'),
  (32, 'UI/UX Design'), (32, 'Figma'), (32, 'Design Systems'), (32, 'Enterprise'), (32, 'Mastery & Advanced'),
  (33, 'Unity'), (33, 'Game Development'), (33, 'C#'), (33, 'Teaser Course'), (33, 'Free'),
  (34, 'Unity'), (34, 'Game Development'), (34, 'C#'), (34, 'Game Mechanics'), (34, 'Beginner Friendly'),
  (35, 'Unity'), (35, 'Game Development'), (35, 'C#'), (35, 'Game Mechanics'), (35, 'Artificial Intelligence'),
  (36, 'Unity'), (36, 'Game Development'), (36, 'Multiplayer'), (36, 'Portfolio Ready'), (36, 'Mastery & Advanced'),
  (37, 'Unreal Engine'), (37, 'Game Development'), (37, 'Artificial Intelligence'), (37, 'Teaser Course'), (37, 'Free'),
  (38, 'Unreal Engine'), (38, 'Game Development'), (38, 'Artificial Intelligence'), (38, 'Beginner Friendly'),
  (39, 'Unreal Engine'), (39, 'Game Development'), (39, 'Game Mechanics'), (39, 'Artificial Intelligence'),
  (40, 'Unreal Engine'), (40, 'Game Development'), (40, 'Portfolio Ready'), (40, 'Mastery & Advanced'),
  (79, 'Unreal Engine'), (79, 'Game Development'), (79, 'Game Mechanics'), (79, 'Artificial Intelligence'),
  (80, 'Unreal Engine'), (80, 'Game Development'), (80, 'Portfolio Ready'), (80, 'Mastery & Advanced')
) AS mapping(course_id, tag_name)
JOIN courses c ON c.course_id = mapping.course_id
JOIN tags t ON t.tag_name = mapping.tag_name
ON CONFLICT (course_id, tag_id) DO NOTHING;
