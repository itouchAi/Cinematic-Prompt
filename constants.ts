import { PublishedImage } from "./context/AuthContext";

export interface Option {
  value: string;
  label: string;
  isHeader?: boolean;
}

export interface CameraSettingConfig {
  id: string;
  label: string;
  options: string[];
}

export const styles: Option[] = [
  { value: 'Filmic Ultra-Real Vision', label: 'Filmic Ultra-Real Vision' },
  { value: 'Studio-Cinematic Hybrid Reality', label: 'Studio-Cinematic Hybrid Reality' },
  { value: 'Cine-Portrait Perfection', label: 'Cine-Portrait Perfection' },
  { value: 'Archival Frame of a Forgotten Film', label: 'Archival Frame of a Forgotten Film' },
  { value: 'Reality-Defining Photograph', label: 'Reality-Defining Photograph' },
  { value: 'Dolby Depth Perception', label: 'Dolby Depth Perception' },
  { value: 'Human-Lens Resonance', label: 'Human-Lens Resonance' },
  { value: 'The Unreal Photograph of Reality', label: 'The Unreal Photograph of Reality' },
  { value: 'Timeless Frame Capture', label: 'Timeless Frame Capture' },
  { value: 'Beyond-Reality Optics', label: 'Beyond-Reality Optics' },
];

export const cameras: Option[] = [
  { value: 'ARRI Alexa 65', label: 'ARRI Alexa 65' },
  { value: 'ARRI Alexa Mini LF', label: 'ARRI Alexa Mini LF' },
  { value: 'RED Komodo 6K', label: 'RED Komodo 6K' },
  { value: 'RED Monstro 8K VV', label: 'RED Monstro 8K VV' },
  { value: 'Sony Venice', label: 'Sony Venice' },
  { value: 'Canon C300 Mark III', label: 'Canon C300 Mark III' },
  { value: 'Blackmagic URSA Mini Pro 12K', label: 'Blackmagic URSA Mini Pro 12K' },
  { value: 'IMAX Digital Camera', label: 'IMAX Digital Camera' },
  { value: 'Panavision Millennium DXL2', label: 'Panavision Millennium DXL2' },
  { value: 'Hasselblad H6D-400c', label: 'Hasselblad H6D-400c' },
];

export const lenses: Option[] = [
  { value: 'Leica Summilux-C 35mm', label: 'Leica Summilux-C 35mm' },
  { value: 'Leica Summilux-C 50mm', label: 'Leica Summilux-C 50mm' },
  { value: 'Zeiss Master Prime 35mm', label: 'Zeiss Master Prime 35mm' },
  { value: 'Zeiss Master Prime 50mm', label: 'Zeiss Master Prime 50mm' },
  { value: 'Canon CN-E 24mm', label: 'Canon CN-E 24mm' },
  { value: 'Canon CN-E 50mm', label: 'Canon CN-E 50mm' },
  { value: 'Panavision Primo 35mm', label: 'Panavision Primo 35mm' },
  { value: 'Panavision Primo 50mm', label: 'Panavision Primo 50mm' },
  { value: 'Cooke S4/i 25mm', label: 'Cooke S4/i 25mm' },
  { value: 'Cooke S4/i 50mm', label: 'Cooke S4/i 50mm' },
  { value: 'Fujinon Cabrio 19-90mm', label: 'Fujinon Cabrio 19-90mm' },
  { value: 'Angenieux Optimo 24-290mm', label: 'Angenieux Optimo 24-290mm' },
];

export const lighting: Option[] = [
    { value: 'Volumetric Light', label: 'Volumetric Light' },
    { value: 'Soft Rim Light', label: 'Soft Rim Light' },
    { value: 'Hard Key Light', label: 'Hard Key Light' },
    { value: 'Soft Fill Light', label: 'Soft Fill Light' },
    { value: 'Backlight', label: 'Backlight' },
    { value: 'Practical Light', label: 'Practical Light' },
    { value: 'Neon Light', label: 'Neon Light' },
    { value: 'Cinematic Spotlight', label: 'Cinematic Spotlight' },
    { value: 'HDRI Lighting', label: 'HDRI Lighting' },
    { value: 'Golden Hour Sunlight', label: 'Golden Hour Sunlight' },
    { value: 'Blue Hour Ambient', label: 'Blue Hour Ambient' },
    { value: 'Fluorescent Indoor Light', label: 'Fluorescent Indoor Light' },
];

export const postProduction: Option[] = [
  { value: 'Dolby Vision HDR', label: 'Dolby Vision HDR' },
  { value: 'Company 3 Color Grading', label: 'Company 3 Color Grading' },
  { value: 'DaVinci Resolve Color Grade', label: 'DaVinci Resolve Color Grade' },
  { value: 'FilmConvert Film Emulation', label: 'FilmConvert Film Emulation' },
  { value: 'ACES Color Workflow', label: 'ACES Color Workflow' },
  { value: 'Lightroom Color Correction', label: 'Lightroom Color Correction' },
  { value: 'LUT Cinematic Look', label: 'LUT Cinematic Look' },
  { value: 'Tone Mapping HDR', label: 'Tone Mapping HDR' },
  { value: 'VFX Compositing', label: 'VFX Compositing' },
  { value: 'Motion Blur Enhancement', label: 'Motion Blur Enhancement' },
  { value: 'Depth of Field Enhancement', label: 'Depth of Field Enhancement' },
  { value: 'Noise Reduction', label: 'Noise Reduction' },
];

export const cameraAngles: Option[] = [
  { value: '', label: 'None' },
  { value: 'Eye-Level Angle', label: 'Eye-Level Angle' },
  { value: 'High Angle', label: 'High Angle' },
  { value: 'Low Angle', label: 'Low Angle' },
  { value: 'Bird’s Eye View', label: 'Bird’s Eye View' },
  { value: 'Worm’s Eye View', label: 'Worm’s Eye View' },
  { value: 'Dutch Angle', label: 'Dutch Angle' },
  { value: 'Close-Up', label: 'Close-Up' },
  { value: 'Extreme Close-Up', label: 'Extreme Close-Up' },
  { value: 'Medium Shot', label: 'Medium Shot' },
  { value: 'Full Shot', label: 'Full Shot' },
  { value: 'Cowboy Shot', label: 'Cowboy Shot' },
  { value: 'Wide Shot', label: 'Wide Shot' },
  { value: 'Extreme Wide Shot', label: 'Extreme Wide Shot' },
  { value: 'POV Shot', label: 'POV Shot' },
  { value: 'Over-The-Shoulder Shot', label: 'Over-The-Shoulder Shot' },
  { value: 'Profile Shot', label: 'Profile Shot' },
  { value: 'Three-Quarter Angle', label: 'Three-Quarter Angle' },
  { value: 'Back Shot', label: 'Back Shot' },
  { value: 'Reverse Angle', label: 'Reverse Angle' },
  { value: 'Aerial Shot', label: 'Aerial Shot' },
];

export const cameraSettingsConfig: CameraSettingConfig[] = [
  {
    id: 'aperture',
    label: 'Aperture Priority (A / Av)',
    options: ['f/1.2', 'f/1.4', 'f/1.8', 'f/2.0', 'f/2.8', 'f/4', 'f/5.6', 'f/8', 'f/11', 'f/16', 'f/22']
  },
  {
    id: 'exposure',
    label: 'Exposure Compensation',
    options: ['−3EV', '−2EV', '−1EV', '0EV', '+1EV', '+2EV', '+3EV']
  },
  {
    id: 'shutter',
    label: 'Shutter Speed',
    options: ['1/30', '1/60', '1/125', '1/250', '1/500', '1/1000', '1/2000', '1/4000', '1/8000']
  },
  {
    id: 'iso',
    label: 'ISO',
    options: ['100', '200', '400', '800', '1600', '3200', '6400']
  },
  {
    id: 'noise',
    label: 'Noise Reduction',
    options: ['0.0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0']
  },
  {
    id: 'log',
    label: 'Log Mode',
    options: ['C-Log', 'C-Log2', 'S-Log2', 'S-Log3', 'V-Log', 'N-Log']
  },
  {
    id: 'dynamicRange',
    label: 'Dynamic Range',
    options: ['10', '11', '12', '13', '14', '15']
  },
  {
    id: 'bitDepthLog',
    label: 'Bit Depth (Log)',
    options: ['8-bit', '10-bit', '12-bit']
  },
  {
    id: 'colorSpace',
    label: 'Color Space',
    options: ['Rec.709', 'Rec.2020', 'DCI-P3']
  },
  {
    id: 'rawType',
    label: 'RAW Type',
    options: ['Compressed RAW', 'Lossless RAW', 'Uncompressed RAW']
  },
  {
    id: 'bitDepthRaw',
    label: 'Bit Depth (RAW)',
    options: ['12-bit', '14-bit', '16-bit']
  },
  {
    id: 'peakingColor',
    label: 'Peaking Color',
    options: ['Red', 'Blue', 'Yellow', 'White']
  },
  {
    id: 'peakingIntensity',
    label: 'Peaking Intensity',
    options: ['Low', 'Medium', 'High']
  },
  {
    id: 'syncSpeed',
    label: 'Sync Speed',
    options: ['1/200', '1/250', '1/320', '1/400', '1/500', '1/640', '1/800', '1/1000', '1/1250', '1/1600', '1/2000', '1/2500', '1/3200', '1/4000', '1/5000', '1/6400', '1/8000']
  },
  {
    id: 'flashPower',
    label: 'Flash Power',
    options: ['1/1', '1/2', '1/4', '1/8', '1/16']
  },
  {
    id: 'whiteBalance',
    label: 'White Balance Preset Mode',
    options: [
      'Daylight – 5500K', 'Cloudy – 6000K', 'Shade – 7000K', 'Tungsten – 3200K', 'Fluorescent – 4000K',
      '2500', '2600', '2700', '2800', '2900', '3000', '3200', '3400', '3600', '3800', '4000', '4200',
      '4400', '4600', '4800', '5000', '5200', '5400', '5600', '5800', '6000', '6200', '6400', '6600',
      '6800', '7000', '7200', '7400', '7600', '7800', '8000'
    ]
  }
];

export const effects: Option[] = [
  { value: '', label: 'None' },
  // Optical Effects
  { value: 'header_optical', label: '✨ Optical Effects', isHeader: true },
  { value: 'Optical Effect: Bokeh', label: 'Bokeh' },
  { value: 'Optical Effect: Lens Flare', label: 'Lens Flare' },
  { value: 'Optical Effect: Chromatic Aberration', label: 'Chromatic Aberration' },
  { value: 'Optical Effect: Glare', label: 'Glare' },
  { value: 'Optical Effect: Bloom', label: 'Bloom' },
  { value: 'Optical Effect: Vignetting', label: 'Vignetting' },
  { value: 'Optical Effect: Soft Focus', label: 'Soft Focus' },
  { value: 'Optical Effect: Film Halation', label: 'Film Halation' },
  { value: 'Optical Effect: Barrel Distortion', label: 'Barrel Distortion' },
  { value: 'Optical Effect: Pincushion Distortion', label: 'Pincushion Distortion' },

  // Film / Analog Effects
  { value: 'header_film', label: '🎞️ Film / Analog Effects', isHeader: true },
  { value: 'Film Effect: Film Grain', label: 'Film Grain' },
  { value: 'Film Effect: Dust and Scratches', label: 'Dust and Scratches' },
  { value: 'Film Effect: Retro Color Fade', label: 'Retro Color Fade' },
  { value: 'Film Effect: Film Burn', label: 'Film Burn' },
  { value: 'Film Effect: Kodak Color Profile', label: 'Kodak Color Profile' },
  { value: 'Film Effect: Fuji Color Profile', label: 'Fuji Color Profile' },
  { value: 'Film Effect: Cinematic LUT', label: 'Cinematic LUT' },
  { value: 'Film Effect: Warm Matte Look', label: 'Warm Matte Look' },
  { value: 'Film Effect: Moody Film Tone', label: 'Moody Film Tone' },

  // Atmospheric Effects
  { value: 'header_atmos', label: '🌬️ Atmospheric Effects', isHeader: true },
  { value: 'Atmospheric Effect: Fog', label: 'Fog' },
  { value: 'Atmospheric Effect: Mist', label: 'Mist' },
  { value: 'Atmospheric Effect: Haze', label: 'Haze' },
  { value: 'Atmospheric Effect: Smoke', label: 'Smoke' },
  { value: 'Atmospheric Effect: Rain', label: 'Rain' },
  { value: 'Atmospheric Effect: Snow', label: 'Snow' },
  { value: 'Atmospheric Effect: Dust Particles', label: 'Dust Particles' },
  { value: 'Atmospheric Effect: Light Rays', label: 'Light Rays' },
  { value: 'Atmospheric Effect: God Rays', label: 'God Rays' },
  { value: 'Atmospheric Effect: Backlight Glow', label: 'Backlight Glow' },

  // Lighting & Shadow Effects
  { value: 'header_light', label: '💡 Lighting & Shadow Effects', isHeader: true },
  { value: 'Lighting Effect: Hard Shadows', label: 'Hard Shadows' },
  { value: 'Lighting Effect: Soft Shadows', label: 'Soft Shadows' },
  { value: 'Lighting Effect: Rim Light', label: 'Rim Light' },
  { value: 'Lighting Effect: Split Lighting', label: 'Split Lighting' },
  { value: 'Lighting Effect: Loop Lighting', label: 'Loop Lighting' },
  { value: 'Lighting Effect: Rembrandt Lighting', label: 'Rembrandt Lighting' },
  { value: 'Lighting Effect: Edge Light', label: 'Edge Light' },
  { value: 'Lighting Effect: Backlight Highlighting', label: 'Backlight Highlighting' },
  { value: 'Lighting Effect: Directional Lighting', label: 'Directional Lighting' },

  // Reflection & Glass Effects
  { value: 'header_reflect', label: '🪞 Reflection & Glass Effects', isHeader: true },
  { value: 'Reflection Effect: Glass Reflection', label: 'Glass Reflection' },
  { value: 'Reflection Effect: Double Reflection', label: 'Double Reflection' },
  { value: 'Reflection Effect: Prism Rainbow Effect', label: 'Prism Rainbow Effect' },
  { value: 'Reflection Effect: Mirror Reflection', label: 'Mirror Reflection' },
  { value: 'Reflection Effect: Wet Surface Reflection', label: 'Wet Surface Reflection' },
  { value: 'Reflection Effect: Metal Surface Reflection', label: 'Metal Surface Reflection' },

  // Digital & Stylized Effects
  { value: 'header_digital', label: '💻 Digital & Stylized Effects', isHeader: true },
  { value: 'Digital Effect: HDR Rendering', label: 'HDR Rendering' },
  { value: 'Digital Effect: High Contrast Punch', label: 'High Contrast Punch' },
  { value: 'Digital Effect: Glow Highlights', label: 'Glow Highlights' },
  { value: 'Digital Effect: Neon Glare', label: 'Neon Glare' },
  { value: 'Digital Effect: Cyberpunk Glow', label: 'Cyberpunk Glow' },
  { value: 'Digital Effect: Depth Blur', label: 'Depth Blur' },
  { value: 'Digital Effect: AI Halation', label: 'AI Halation' },
  { value: 'Digital Effect: Oversharp Digital Look', label: 'Oversharp Digital Look' },

  // Motion & Dynamic Effects
  { value: 'header_motion', label: '🌀 Motion & Dynamic Effects', isHeader: true },
  { value: 'Motion Effect: Motion Blur', label: 'Motion Blur' },
  { value: 'Motion Effect: Long Exposure Light Trails', label: 'Long Exposure Light Trails' },
  { value: 'Motion Effect: Action Freeze', label: 'Action Freeze' },
  { value: 'Motion Effect: Zoom Burst Effect', label: 'Zoom Burst Effect' },
  { value: 'Motion Effect: Panning Motion Blur', label: 'Panning Motion Blur' },
  { value: 'Motion Effect: Dynamic Camera Shake', label: 'Dynamic Camera Shake' },
  { value: 'Motion Effect: Speed Lines', label: 'Speed Lines' },
];

export const aspectRatios: Option[] = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '16:9', label: 'Cinematic (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
];

export const imageCounts: Option[] = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '4', label: '4' },
];

export const subjects: Option[] = [
  { value: 'random', label: 'subject_random' },
  { value: 'men', label: 'subject_men' },
  { value: 'women', label: 'subject_women' },
  { value: 'animal', label: 'subject_animal' },
  { value: 'car', label: 'subject_car' },
  { value: 'sports', label: 'subject_sports' },
  { value: 'music', label: 'subject_music' },
  { value: 'nature', label: 'subject_nature' },
  { value: 'food', label: 'subject_food' },
  { value: 'jewelry', label: 'subject_jewelry' },
  { value: 'fashion', label: 'subject_fashion' },
];

export const subCategories: Record<string, Option[]> = {
  men: [
    { value: 'random', label: 'subject_random' },
    { value: 'hot', label: 'subcategory_men_hot' },
    { value: 'athletic', label: 'subcategory_men_athletic' },
    { value: 'casual', label: 'subcategory_men_casual' },
    { value: 'professional', label: 'subcategory_men_professional' },
    { value: 'futuristic', label: 'subcategory_men_futuristic' },
  ],
  women: [
    { value: 'random', label: 'subject_random' },
    { value: 'glamorous', label: 'subcategory_women_glamorous' },
    { value: 'cute', label: 'subcategory_women_cute' },
    { value: 'elegant', label: 'subcategory_women_elegant' },
    { value: 'sporty', label: 'subcategory_women_sporty' },
    { value: 'futuristic', label: 'subcategory_women_futuristic' },
  ],
  animal: [
    { value: 'random', label: 'subject_random' },
    { value: 'wildlife', label: 'subcategory_animal_wildlife' },
    { value: 'pet', label: 'subcategory_animal_pet' },
    { value: 'fantasy', label: 'subcategory_animal_fantasy' },
    { value: 'underwater', label: 'subcategory_animal_underwater' },
    { value: 'mythical', label: 'subcategory_animal_mythical' },
  ],
  car: [
    { value: 'random', label: 'subject_random' },
    { value: 'sports', label: 'subcategory_car_sports' },
    { value: 'classic', label: 'subcategory_car_classic' },
    { value: 'luxury', label: 'subcategory_car_luxury' },
    { value: 'futuristic', label: 'subcategory_car_futuristic' },
    { value: 'offroad', label: 'subcategory_car_offroad' },
  ],
  sports: [
    { value: 'random', label: 'subject_random' },
    { value: 'soccer', label: 'subcategory_sports_soccer' },
    { value: 'basketball', label: 'subcategory_sports_basketball' },
    { value: 'martial_arts', label: 'subcategory_sports_martial_arts' },
    { value: 'surfing', label: 'subcategory_sports_surfing' },
    { value: 'racing', label: 'subcategory_sports_racing' },
  ],
  music: [
    { value: 'random', label: 'subject_random' },
    { value: 'concert', label: 'subcategory_music_concert' },
    { value: 'studio', label: 'subcategory_music_studio' },
    { value: 'vinyl', label: 'subcategory_music_vinyl' },
    { value: 'street', label: 'subcategory_music_street' },
    { value: 'dj', label: 'subcategory_music_dj' },
  ],
  nature: [
    { value: 'random', label: 'subject_random' },
    { value: 'forest', label: 'subcategory_nature_forest' },
    { value: 'mountain', label: 'subcategory_nature_mountain' },
    { value: 'ocean', label: 'subcategory_nature_ocean' },
    { value: 'desert', label: 'subcategory_nature_desert' },
    { value: 'aurora', label: 'subcategory_nature_aurora' },
  ],
  food: [
    { value: 'random', label: 'subject_random' },
    { value: 'gourmet', label: 'subcategory_food_gourmet' },
    { value: 'street', label: 'subcategory_food_street' },
    { value: 'dessert', label: 'subcategory_food_dessert' },
    { value: 'vegan', label: 'subcategory_food_vegan' },
    { value: 'cultural', label: 'subcategory_food_cultural' },
  ],
  jewelry: [
    { value: 'random', label: 'subject_random' },
    { value: 'diamond', label: 'subcategory_jewelry_diamond' },
    { value: 'boho', label: 'subcategory_jewelry_boho' },
    { value: 'minimalist', label: 'subcategory_jewelry_minimalist' },
    { value: 'fantasy', label: 'subcategory_jewelry_fantasy' },
    { value: 'cultural', label: 'subcategory_jewelry_cultural' },
  ],
  fashion: [
    { value: 'random', label: 'subject_random' },
    { value: 'couture', label: 'subcategory_fashion_couture' },
    { value: 'streetwear', label: 'subcategory_fashion_streetwear' },
    { value: 'chic', label: 'subcategory_fashion_chic' },
    { value: 'retro', label: 'subcategory_fashion_retro' },
    { value: 'techwear', label: 'subcategory_fashion_techwear' },
  ],
};

export interface Example {
  title: string;
  scene: string;
  style: string;
  camera: string;
  lens: string;
  light: string;
  postProd: string;
  cameraAngle?: string;
  cameraMode?: string;
  effect?: string;
}

export const examples: Example[] = [
  {
    title: 'Cyberpunk Alley',
    scene: 'A lone detective in a trench coat stands in a rain-soaked neon alley, smoke rising from a sewer grate.',
    style: 'Filmic Ultra-Real Vision',
    camera: 'RED Komodo 6K',
    lens: 'Canon CN-E 24mm',
    light: 'Neon Light',
    postProd: 'Company 3 Color Grading',
    cameraAngle: 'Low Angle',
    cameraMode: 'Aperture Priority: f/1.4',
    effect: 'Digital Effect: Neon Glare',
  },
  {
    title: 'Enchanted Forest',
    scene: 'A mystical deer with glowing antlers drinks from a shimmering pond in an ancient, enchanted forest.',
    style: 'Beyond-Reality Optics',
    camera: 'Sony Venice',
    lens: 'Cooke S4/i 50mm',
    light: 'Volumetric Light',
    postProd: 'LUT Cinematic Look',
    cameraAngle: 'Eye-Level Angle',
    cameraMode: 'Shutter Priority: 1/60',
    effect: 'Atmospheric Effect: God Rays',
  },
  {
    title: 'Historical Portrait',
    scene: 'A regal queen from the 18th century, adorned in lavish silk and jewels, poses for a portrait in her opulent throne room.',
    style: 'Cine-Portrait Perfection',
    camera: 'Hasselblad H6D-400c',
    lens: 'Zeiss Master Prime 50mm',
    light: 'Soft Fill Light',
    postProd: 'FilmConvert Film Emulation',
    cameraAngle: 'Medium Shot',
    cameraMode: 'ISO Priority: 100',
    effect: 'Optical Effect: Soft Focus',
  },
   {
    title: 'Desert Wanderer',
    scene: 'A solitary wanderer treks across a vast, sun-scorched desert, with dramatic sand dunes stretching to the horizon.',
    style: 'Reality-Defining Photograph',
    camera: 'ARRI Alexa Mini LF',
    lens: 'Panavision Primo 50mm',
    light: 'Golden Hour Sunlight',
    postProd: 'DaVinci Resolve Color Grade',
    cameraAngle: 'Extreme Wide Shot',
    cameraMode: 'Full Auto Exposure: ISO 100–800',
    effect: 'Atmospheric Effect: Haze',
  },
  {
    title: "Noir Detective's Office",
    scene: "A gritty 1940s private detective's office, shadows cast by Venetian blinds on a smoky room, a single desk lamp illuminating a mysterious file.",
    style: 'Archival Frame of a Forgotten Film',
    camera: 'Canon C300 Mark III',
    lens: 'Leica Summilux-C 50mm',
    light: 'Cinematic Spotlight',
    postProd: 'FilmConvert Film Emulation',
    cameraAngle: 'Dutch Angle',
    cameraMode: 'Log Mode: S-Log3',
    effect: 'Film Effect: Film Grain',
  },
];

export const communityGalleryItems: PublishedImage[] = [
  {
    id: 'static-1',
    imageUrl: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=1',
    prompt: 'A breathtaking aerial shot of a winding road through a dense, foggy forest during autumn. Style: Dolby Depth Perception. Shot on: ARRI Alexa 65. Lighting: Golden Hour Sunlight.',
    creatorNickname: 'CinematicAI',
    creatorEmail: 'system@cinematic.ai',
  },
  {
    id: 'static-2',
    imageUrl: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=1',
    prompt: 'A solitary wooden cabin by a calm, misty lake, with snow-capped mountains in the background. Style: Archival Frame of a Forgotten Film. Shot on: Sony Venice. Lighting: Blue Hour Ambient.',
    creatorNickname: 'CinematicAI',
    creatorEmail: 'system@cinematic.ai',
  },
  {
    id: 'static-3',
    imageUrl: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=1',
    prompt: 'A lone astronaut standing on a desolate alien planet, gazing at two suns setting on the horizon. Style: Beyond-Reality Optics. Shot on: RED Monstro 8K VV. Lighting: Volumetric Light.',
    creatorNickname: 'CinematicAI',
    creatorEmail: 'system@cinematic.ai',
  },
  {
    id: 'static-4',
    imageUrl: 'https://images.pexels.com/photos/1528640/pexels-photo-1528640.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=1',
    prompt: "A figure stands silhouetted in the entrance of a massive ice cave, glowing with an ethereal blue light. Style: Cine-Portrait Perfection. Shot on: Panavision Millennium DXL2. Lighting: Soft Rim Light.",
    creatorNickname: 'CinematicAI',
    creatorEmail: 'system@cinematic.ai',
  },
  {
    id: 'static-5',
    imageUrl: 'https://images.pexels.com/photos/36717/amazing-animal-beautiful-beautifull.jpg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=1',
    prompt: "An ancient, mystical tree with glowing leaves in the heart of an enchanted forest at night. Style: Timeless Frame Capture. Shot on: Canon C300 Mark III. Lighting: Practical Light.",
    creatorNickname: 'CinematicAI',
    creatorEmail: 'system@cinematic.ai',
  },
  {
    id: 'static-6',
    imageUrl: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=1',
    prompt: "An impossible, majestic mountain peak reflected perfectly in a mirror-like turquoise lake. Style: Reality-Defining Photograph. Shot on: Hasselblad H6D-400c. Lighting: HDRI Lighting.",
    creatorNickname: 'CinematicAI',
    creatorEmail: 'system@cinematic.ai',
  },
  {
    id: 'static-7',
    imageUrl: 'https://images.pexels.com/photos/775201/pexels-photo-775201.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=1',
    prompt: "A lone adventurer crossing a precarious rope bridge suspended high above a lush jungle canyon. Style: Human-Lens Resonance. Shot on: Blackmagic URSA Mini Pro 12K. Lighting: Hard Key Light.",
    creatorNickname: 'CinematicAI',
    creatorEmail: 'system@cinematic.ai',
  },
  {
    id: 'static-8',
    imageUrl: 'https://images.pexels.com/photos/147411/italy-mountains-dawn-dusk-147411.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=1',
    prompt: "The jagged peaks of the Dolomites mountains piercing through a sea of clouds at sunrise. Style: Filmic Ultra-Real Vision. Shot on: ARRI Alexa Mini LF. Lighting: Golden Hour Sunlight.",
    creatorNickname: 'CinematicAI',
    creatorEmail: 'system@cinematic.ai',
  },
];