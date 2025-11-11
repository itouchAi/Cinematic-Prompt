import { PublishedImage } from "./context/AuthContext";

export interface Option {
  value: string;
  label: string;
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
  },
  {
    title: 'Enchanted Forest',
    scene: 'A mystical deer with glowing antlers drinks from a shimmering pond in an ancient, enchanted forest.',
    style: 'Beyond-Reality Optics',
    camera: 'Sony Venice',
    lens: 'Cooke S4/i 50mm',
    light: 'Volumetric Light',
    postProd: 'LUT Cinematic Look',
  },
  {
    title: 'Historical Portrait',
    scene: 'A regal queen from the 18th century, adorned in lavish silk and jewels, poses for a portrait in her opulent throne room.',
    style: 'Cine-Portrait Perfection',
    camera: 'Hasselblad H6D-400c',
    lens: 'Zeiss Master Prime 50mm',
    light: 'Soft Fill Light',
    postProd: 'FilmConvert Film Emulation',
  },
   {
    title: 'Desert Wanderer',
    scene: 'A solitary wanderer treks across a vast, sun-scorched desert, with dramatic sand dunes stretching to the horizon.',
    style: 'Reality-Defining Photograph',
    camera: 'ARRI Alexa Mini LF',
    lens: 'Panavision Primo 50mm',
    light: 'Golden Hour Sunlight',
    postProd: 'DaVinci Resolve Color Grade',
  },
  {
    title: "Noir Detective's Office",
    scene: "A gritty 1940s private detective's office, shadows cast by Venetian blinds on a smoky room, a single desk lamp illuminating a mysterious file.",
    style: 'Archival Frame of a Forgotten Film',
    camera: 'Canon C300 Mark III',
    lens: 'Leica Summilux-C 50mm',
    light: 'Cinematic Spotlight',
    postProd: 'FilmConvert Film Emulation',
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