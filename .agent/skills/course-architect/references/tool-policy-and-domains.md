# Tool Policy and Domain Example Standards

This reference specifies the tool selection rules, open-source alternatives directory, and domain example standards for the Course Architect Agent.

---

## Tool Selection Policy

### Permitted Tools
Only tools meeting at least one of these criteria are allowed:
1. **Free and Open-Source Software (FOSS)**: Licensed under GPL, MIT, Apache, BSD, MPL, or equivalent open licenses.
2. **Freeware / Non-Commercial Free Versions**: Permanently free tiers with zero time-limited expiration (e.g. DaVinci Resolve Free, Unreal Engine standard developer license).

### Strictly Forbidden Tools
- Paid commercial subscriptions or upfront licenses (e.g., Autodesk Maya, 3ds Max, SolidWorks, Cinema 4D, Substance Painter, Adobe Creative Cloud).
- Time-limited trials (e.g., 7-day, 14-day, or 30-day trial versions).
- Proprietary software that forces payment to save, export, or compile files.

### Tool Equivalence Catalog

| Commercial / Paid Standard | Approved Free / Open-Source Alternative | Primary Domain |
| :--- | :--- | :--- |
| Autodesk Maya / 3ds Max | Blender (FOSS) | 3D Modeling, Rigging, Animation |
| SolidWorks / Autodesk Inventor | FreeCAD (FOSS), OpenSCAD (FOSS) | Parametric CAD & Mechanical Design |
| Substance 3D Painter / Designer | Material Maker (FOSS), ArmorPaint (Open), Krita | Procedural Texturing & 3D Painting |
| CLO 3D / Marvelous Designer | **PROHIBITED** (Fashion / Apparel domain forbidden) | N/A |
| Adobe Photoshop | GIMP (FOSS), Krita (FOSS) | Raster Image Processing & Texturing |
| Adobe Illustrator | Inkscape (FOSS) | Vector Drafting & Technical Schematics |
| Adobe Premiere Pro / After Effects | DaVinci Resolve (Free tier), Natron (FOSS) | Video Editing & Node-Based VFX |
| Unity / Unreal Commercial | Godot Engine (FOSS), Unreal Engine (Free Tier) | Real-Time Simulation & Game Engines |
| MATLAB | GNU Octave (FOSS), Python + NumPy/SciPy | Numerical Computing & Kinematics |

---

## Domain Example Diversity Standards

### Prohibited Domain
- **Fashion Visualization & Apparel Mockups**: Strictly forbidden. Never use garment draping, shirt mockups, sneaker visualizations, fabric runway simulations, or apparel tailoring as exercise examples.

### Mandatory Domain Areas
Practical exercises must be drawn exclusively from these five approved domains:

#### 1. Technical Design & Precision Drafting
- Parametric mounting brackets with tolerance offsets
- Multi-component enclosure design with snap-fit joints and fastener clearances
- Generative heat-sink fin layouts optimized for airflow
- Orthographic engineering drawings with dimensioning standards

#### 2. 3D and Hard-Surface Workflows
- Low-poly to high-poly subdivision modeling of robotic sensory turrets
- Sci-fi mechanical door airlock with bevel modifier workflows and normal decal projection
- Heavy equipment hydraulic excavator boom assembly
- Drone airframe with modular battery bay and propeller motor housings

#### 3. Industrial Mechanics & Kinematics
- Planetary gearbox transmission with spur gear involute profiling
- 6-DOF robotic manipulator arm with forward and inverse kinematic bone constraints
- Cam-and-follower reciprocating mechanism with collision physics
- Linear actuator rail guide with recirculating ball bearing simulation

#### 4. Architectural Spaces & Spatial Systems
- Concrete brutalist pavilion with daylighting sun-path studies and shadow sweeps
- Modular steel structural space-frame truss with node connector detailing
- Parametric facade louver system driven by sun angle math nodes
- Interior acoustics and spatial circulation study of an industrial warehouse conversion

#### 5. Digital Media Pipelines & Simulation
- Real-time hard-surface asset export pipeline (GLTF/FBX) with automated LOD generation
- Procedural dust and sparks simulation using GPU particle emitters in Godot
- Node-based VFX compositing of mechanical HUD overlays over 3D rendered passes
- Automated asset validation script in Python checking polycount and texture resolution
