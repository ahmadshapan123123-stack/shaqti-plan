import type { FurnitureCategory } from '../constants/furnitureCategories';

export type FurnitureSeedItem = {
  id: string;
  name: string;
  category: FurnitureCategory;
  imageUrl: string;
  realWidth: number;
  realHeight: number;
  realDepth?: number; // Height from floor to ceiling
};

const svgToDataUrl = (svg: string) => {
  const encoded = new TextEncoder().encode(svg);
  let binary = '';
  encoded.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `data:image/svg+xml;base64,${btoa(binary)}`;
};

const wrapSvg = (body: string, viewBox = '0 0 100 100') =>
  svgToDataUrl(
    `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="transparent"/>
      ${body}
    </svg>`
  );

const createItem = (
  id: string,
  name: string,
  category: FurnitureCategory,
  realWidth: number,
  realHeight: number,
  svg: string,
  realDepth?: number
): FurnitureSeedItem => ({
  id,
  name,
  category,
  realWidth,
  realHeight,
  realDepth,
  imageUrl: wrapSvg(svg),
});

export const DEFAULT_FURNITURE_ITEMS: FurnitureSeedItem[] = [
  createItem(
    'sofa-three-seat',
    'كنبة ثلاثية',
    'living room',
    2.2,
    0.9,
    `
      <rect x="8" y="18" width="84" height="64" rx="8" fill="#dbeafe" stroke="#374151" stroke-width="2"/>
      <rect x="8" y="18" width="12" height="64" rx="4" fill="#93c5fd" stroke="#374151" stroke-width="1.5"/>
      <rect x="80" y="18" width="12" height="64" rx="4" fill="#93c5fd" stroke="#374151" stroke-width="1.5"/>
      <line x1="20" y1="62" x2="80" y2="62" stroke="#374151" stroke-width="1.5"/>
      <line x1="40" y1="62" x2="40" y2="82" stroke="#374151" stroke-width="1.5"/>
      <line x1="60" y1="62" x2="60" y2="82" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'armchair',
    'كرسي مفرد',
    'living room',
    0.9,
    0.9,
    `
      <rect x="18" y="18" width="64" height="64" rx="14" fill="#dbeafe" stroke="#374151" stroke-width="2"/>
      <rect x="18" y="28" width="12" height="44" rx="4" fill="#93c5fd" stroke="#374151" stroke-width="1.5"/>
      <rect x="70" y="28" width="12" height="44" rx="4" fill="#93c5fd" stroke="#374151" stroke-width="1.5"/>
      <rect x="30" y="28" width="40" height="36" rx="8" fill="#eff6ff" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'coffee-table',
    'طاولة قهوة',
    'living room',
    1.2,
    0.6,
    `
      <rect x="12" y="30" width="76" height="40" rx="8" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <line x1="24" y1="30" x2="24" y2="70" stroke="#374151" stroke-width="1.5"/>
      <line x1="76" y1="30" x2="76" y2="70" stroke="#374151" stroke-width="1.5"/>
      <line x1="12" y1="50" x2="88" y2="50" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'tv-unit',
    'تلفزيون + وحدة',
    'living room',
    1.8,
    0.45,
    `
      <rect x="8" y="34" width="84" height="22" rx="4" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <rect x="22" y="24" width="56" height="10" rx="2" fill="#dbeafe" stroke="#374151" stroke-width="1.5"/>
      <line x1="36" y1="34" x2="36" y2="56" stroke="#374151" stroke-width="1.5"/>
      <line x1="64" y1="34" x2="64" y2="56" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'bookshelf',
    'رف كتب',
    'living room',
    1,
    0.3,
    `
      <rect x="16" y="20" width="68" height="60" rx="4" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <line x1="32" y1="20" x2="32" y2="80" stroke="#374151" stroke-width="1.5"/>
      <line x1="50" y1="20" x2="50" y2="80" stroke="#374151" stroke-width="1.5"/>
      <line x1="68" y1="20" x2="68" y2="80" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'double-bed',
    'سرير مزدوج',
    'bedroom',
    2,
    1.8,
    `
      <rect x="18" y="12" width="64" height="76" rx="6" fill="#eff6ff" stroke="#374151" stroke-width="2"/>
      <rect x="18" y="12" width="64" height="12" rx="4" fill="#93c5fd" stroke="#374151" stroke-width="1.5"/>
      <rect x="24" y="28" width="24" height="18" rx="4" fill="#ffffff" stroke="#374151" stroke-width="1.5"/>
      <rect x="52" y="28" width="24" height="18" rx="4" fill="#ffffff" stroke="#374151" stroke-width="1.5"/>
      <line x1="50" y1="24" x2="50" y2="88" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'single-bed',
    'سرير مفرد',
    'bedroom',
    2,
    1,
    `
      <rect x="28" y="10" width="44" height="80" rx="6" fill="#eff6ff" stroke="#374151" stroke-width="2"/>
      <rect x="28" y="10" width="44" height="12" rx="4" fill="#93c5fd" stroke="#374151" stroke-width="1.5"/>
      <rect x="34" y="26" width="32" height="18" rx="4" fill="#ffffff" stroke="#374151" stroke-width="1.5"/>
      <line x1="28" y1="56" x2="72" y2="56" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'wardrobe',
    'دولاب ملابس',
    'bedroom',
    2,
    0.6,
    `
      <rect x="12" y="22" width="76" height="56" rx="4" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <line x1="50" y1="22" x2="50" y2="78" stroke="#374151" stroke-width="1.5"/>
      <circle cx="44" cy="50" r="1.5" fill="#374151"/>
      <circle cx="56" cy="50" r="1.5" fill="#374151"/>
    `
  ),
  createItem(
    'nightstand',
    'كومودينو',
    'bedroom',
    0.5,
    0.5,
    `
      <rect x="24" y="24" width="52" height="52" rx="6" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <line x1="24" y1="50" x2="76" y2="50" stroke="#374151" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="2" fill="#374151"/>
    `
  ),
  createItem(
    'dressing-table',
    'تسريحة',
    'bedroom',
    1.2,
    0.45,
    `
      <rect x="16" y="34" width="68" height="28" rx="4" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <rect x="34" y="16" width="32" height="14" rx="3" fill="#dbeafe" stroke="#374151" stroke-width="1.5"/>
      <line x1="28" y1="62" x2="28" y2="78" stroke="#374151" stroke-width="1.5"/>
      <line x1="72" y1="62" x2="72" y2="78" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'refrigerator',
    'ثلاجة',
    'kitchen',
    0.75,
    0.75,
    `
      <rect x="24" y="12" width="52" height="76" rx="6" fill="#eff6ff" stroke="#374151" stroke-width="2"/>
      <line x1="24" y1="48" x2="76" y2="48" stroke="#374151" stroke-width="1.5"/>
      <line x1="68" y1="28" x2="68" y2="40" stroke="#374151" stroke-width="1.5"/>
      <line x1="68" y1="56" x2="68" y2="72" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'stove',
    'بوتاجاز',
    'kitchen',
    0.6,
    0.6,
    `
      <rect x="22" y="22" width="56" height="56" rx="6" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <circle cx="38" cy="38" r="7" fill="#eff6ff" stroke="#374151" stroke-width="1.5"/>
      <circle cx="62" cy="38" r="7" fill="#eff6ff" stroke="#374151" stroke-width="1.5"/>
      <circle cx="38" cy="62" r="7" fill="#eff6ff" stroke="#374151" stroke-width="1.5"/>
      <circle cx="62" cy="62" r="7" fill="#eff6ff" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'kitchen-sink',
    'حوض مطبخ',
    'kitchen',
    0.8,
    0.5,
    `
      <rect x="16" y="28" width="68" height="44" rx="6" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <ellipse cx="50" cy="50" rx="18" ry="10" fill="#dbeafe" stroke="#374151" stroke-width="1.5"/>
      <line x1="66" y1="34" x2="74" y2="28" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'dining-table-4',
    'طاولة طعام 4 أشخاص',
    'kitchen',
    1.4,
    0.8,
    `
      <rect x="24" y="30" width="52" height="40" rx="6" fill="#eff6ff" stroke="#374151" stroke-width="2"/>
      <rect x="34" y="16" width="12" height="10" rx="2" fill="#f8fafc" stroke="#374151" stroke-width="1.5"/>
      <rect x="54" y="16" width="12" height="10" rx="2" fill="#f8fafc" stroke="#374151" stroke-width="1.5"/>
      <rect x="34" y="74" width="12" height="10" rx="2" fill="#f8fafc" stroke="#374151" stroke-width="1.5"/>
      <rect x="54" y="74" width="12" height="10" rx="2" fill="#f8fafc" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'toilet',
    'مرحاض',
    'bathroom',
    0.4,
    0.65,
    `
      <rect x="34" y="16" width="32" height="18" rx="3" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <ellipse cx="50" cy="56" rx="18" ry="24" fill="#eff6ff" stroke="#374151" stroke-width="2"/>
      <ellipse cx="50" cy="60" rx="8" ry="12" fill="#ffffff" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'bathtub',
    'حوض استحمام',
    'bathroom',
    1.7,
    0.75,
    `
      <rect x="16" y="24" width="68" height="52" rx="18" fill="#eff6ff" stroke="#374151" stroke-width="2"/>
      <rect x="24" y="32" width="52" height="36" rx="14" fill="#ffffff" stroke="#374151" stroke-width="1.5"/>
      <circle cx="26" cy="72" r="2" fill="#374151"/>
      <circle cx="74" cy="72" r="2" fill="#374151"/>
    `
  ),
  createItem(
    'shower',
    'دش',
    'bathroom',
    0.9,
    0.9,
    `
      <rect x="18" y="18" width="64" height="64" rx="6" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <line x1="18" y1="18" x2="82" y2="82" stroke="#374151" stroke-width="1.5"/>
      <line x1="18" y1="82" x2="82" y2="18" stroke="#374151" stroke-width="1.5"/>
      <path d="M22 30 Q32 20 42 22" fill="none" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'bathroom-sink',
    'حوض غسيل',
    'bathroom',
    0.5,
    0.45,
    `
      <rect x="26" y="26" width="48" height="40" rx="6" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <ellipse cx="50" cy="46" rx="12" ry="8" fill="#dbeafe" stroke="#374151" stroke-width="1.5"/>
      <line x1="50" y1="20" x2="50" y2="26" stroke="#374151" stroke-width="1.5"/>
      <line x1="44" y1="22" x2="56" y2="22" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  // Doors and Windows
  createItem(
    'door-single',
    'باب غرفة',
    'doors windows',
    0.9,
    0.15,
    `
      <rect x="10" y="10" width="80" height="80" rx="4" fill="#a98467" stroke="#5c4033" stroke-width="2"/>
      <rect x="20" y="25" width="20" height="30" rx="2" fill="#d4a574" stroke="#5c4033" stroke-width="1"/>
      <circle cx="78" cy="50" r="3" fill="#5c4033"/>
    `
  ),
  createItem(
    'door-double',
    'باب مزدوج',
    'doors windows',
    1.8,
    0.15,
    `
      <rect x="5" y="10" width="42" height="80" rx="4" fill="#a98467" stroke="#5c4033" stroke-width="2"/>
      <rect x="12" y="25" width="15" height="30" rx="2" fill="#d4a574" stroke="#5c4033" stroke-width="1"/>
      <circle cx="42" cy="50" r="3" fill="#5c4033"/>
      <rect x="53" y="10" width="42" height="80" rx="4" fill="#a98467" stroke="#5c4033" stroke-width="2"/>
      <rect x="73" y="25" width="15" height="30" rx="2" fill="#d4a574" stroke="#5c4033" stroke-width="1"/>
      <circle cx="90" cy="50" r="3" fill="#5c4033"/>
    `
  ),
  createItem(
    'door-balcony',
    'باب شرفة',
    'doors windows',
    1.2,
    0.15,
    `
      <rect x="10" y="10" width="80" height="80" rx="4" fill="#6b8e23" stroke="#3d4a1d" stroke-width="2"/>
      <line x1="50" y1="10" x2="50" y2="90" stroke="#3d4a1d" stroke-width="1.5"/>
      <line x1="15" y1="30" x2="45" y2="30" stroke="#8fbc8f" stroke-width="1"/>
      <line x1="15" y1="50" x2="45" y2="50" stroke="#8fbc8f" stroke-width="1"/>
      <line x1="15" y1="70" x2="45" y2="70" stroke="#8fbc8f" stroke-width="1"/>
      <line x1="55" y1="30" x2="85" y2="30" stroke="#8fbc8f" stroke-width="1"/>
      <line x1="55" y1="50" x2="85" y2="50" stroke="#8fbc8f" stroke-width="1"/>
      <line x1="55" y1="70" x2="85" y2="70" stroke="#8fbc8f" stroke-width="1"/>
    `
  ),
  createItem(
    'window-single',
    'شباك غرفة',
    'doors windows',
    1.2,
    0.1,
    `
      <rect x="10" y="20" width="80" height="60" rx="2" fill="#87ceeb" stroke="#4682b4" stroke-width="2"/>
      <line x1="10" y1="50" x2="90" y2="50" stroke="#4682b4" stroke-width="1.5"/>
      <line x1="50" y1="20" x2="50" y2="80" stroke="#4682b4" stroke-width="1.5"/>
    `
  ),
  createItem(
    'window-bathroom',
    'شباك حمام',
    'doors windows',
    0.6,
    0.1,
    `
      <rect x="20" y="25" width="60" height="50" rx="2" fill="#87ceeb" stroke="#4682b4" stroke-width="2"/>
      <line x1="20" y1="50" x2="80" y2="50" stroke="#4682b4" stroke-width="1.5"/>
    `
  ),
  createItem(
    'window-kitchen',
    'شباك مطبخ',
    'doors windows',
    1.5,
    0.1,
    `
      <rect x="10" y="20" width="80" height="60" rx="2" fill="#87ceeb" stroke="#4682b4" stroke-width="2"/>
      <line x1="10" y1="50" x2="90" y2="50" stroke="#4682b4" stroke-width="1.5"/>
      <line x1="30" y1="20" x2="30" y2="80" stroke="#4682b4" stroke-width="1.5"/>
      <line x1="70" y1="20" x2="70" y2="80" stroke="#4682b4" stroke-width="1.5"/>
    `
  ),
  // Office Category
  createItem(
    'office-desk-large',
    'مكتب كبير',
    'office',
    2.0,
    0.8,
    `
      <rect x="10" y="20" width="80" height="60" rx="4" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <rect x="15" y="25" width="70" height="50" rx="2" fill="#ffffff" stroke="#374151" stroke-width="1"/>
      <rect x="25" y="35" width="50" height="30" rx="2" fill="#dbeafe" stroke="#374151" stroke-width="1"/>
      <line x1="10" y1="20" x2="20" y2="10" stroke="#374151" stroke-width="1.5"/>
      <line x1="90" y1="20" x2="80" y2="10" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  createItem(
    'office-chair',
    'كرسي مكتب',
    'office',
    0.6,
    0.6,
    `
      <circle cx="50" cy="50" r="25" fill="#374151" stroke="#1f2937" stroke-width="2"/>
      <rect x="35" y="30" width="30" height="40" rx="10" fill="#4b5563" stroke="#1f2937" stroke-width="1.5"/>
      <rect x="25" y="45" width="5" height="20" rx="2" fill="#1f2937"/>
      <rect x="70" y="45" width="5" height="20" rx="2" fill="#1f2937"/>
    `
  ),
  createItem(
    'filing-cabinet',
    'خزانة ملفات',
    'office',
    0.8,
    0.5,
    `
      <rect x="15" y="15" width="70" height="70" rx="4" fill="#f1f5f9" stroke="#374151" stroke-width="2"/>
      <line x1="15" y1="40" x2="85" y2="40" stroke="#374151" stroke-width="1.5"/>
      <line x1="15" y1="65" x2="85" y2="65" stroke="#374151" stroke-width="1.5"/>
      <rect x="42" y="30" width="16" height="4" rx="2" fill="#64748b"/>
      <rect x="42" y="55" width="16" height="4" rx="2" fill="#64748b"/>
      <rect x="42" y="80" width="16" height="4" rx="2" fill="#64748b"/>
    `
  ),
  // Outdoor Category
  createItem(
    'garden-table-round',
    'طاولة حديقة دائرية',
    'outdoor',
    1.2,
    1.2,
    `
      <circle cx="50" cy="50" r="40" fill="#fef9c3" stroke="#854d0e" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="5" fill="#854d0e"/>
      <path d="M50 10 L50 90 M10 50 L90 50" stroke="#854d0e" stroke-width="0.5" opacity="0.3"/>
    `
  ),
  createItem(
    'garden-chair',
    'كرسي حديقة',
    'outdoor',
    0.5,
    0.5,
    `
      <rect x="25" y="25" width="50" height="50" rx="4" fill="#fef9c3" stroke="#854d0e" stroke-width="2"/>
      <line x1="25" y1="40" x2="75" y2="40" stroke="#854d0e" stroke-width="1.5"/>
      <line x1="25" y1="55" x2="75" y2="55" stroke="#854d0e" stroke-width="1.5"/>
    `
  ),
  createItem(
    'sun-lounger',
    'سرير استرخاء',
    'outdoor',
    2.0,
    0.7,
    `
      <rect x="15" y="10" width="70" height="80" rx="4" fill="#dbeafe" stroke="#1e40af" stroke-width="2"/>
      <rect x="15" y="10" width="70" height="25" rx="2" fill="#93c5fd" stroke="#1e40af" stroke-width="1.5"/>
      <line x1="15" y1="45" x2="85" y2="45" stroke="#1e40af" stroke-width="1"/>
      <line x1="15" y1="55" x2="85" y2="55" stroke="#1e40af" stroke-width="1"/>
      <line x1="15" y1="65" x2="85" y2="65" stroke="#1e40af" stroke-width="1"/>
    `
  ),
  // Decor Category
  createItem(
    'potted-plant-large',
    'نبات ضخم',
    'decor',
    0.8,
    0.8,
    `
      <circle cx="50" cy="50" r="15" fill="#92400e" stroke="#451a03" stroke-width="2"/>
      <path d="M50 35 Q65 15 80 30" fill="none" stroke="#166534" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 35 Q35 15 20 30" fill="none" stroke="#166534" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 35 Q75 45 70 65" fill="none" stroke="#166534" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 35 Q25 45 30 65" fill="none" stroke="#166534" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="18" fill="none" stroke="#4ade80" stroke-width="2" opacity="0.2"/>
    `
  ),
  createItem(
    'grand-piano',
    'بيانو كبير',
    'decor',
    1.5,
    1.5,
    `
      <path d="M20 20 L80 20 Q95 20 95 40 L95 80 Q95 95 75 95 L25 95 Q10 95 10 80 L10 40 Q10 20 20 20" fill="#0f172a" stroke="#000" stroke-width="2"/>
      <rect x="15" y="80" width="70" height="12" fill="#fff" stroke="#000" stroke-width="1"/>
      <line x1="20" y1="80" x2="20" y2="92" stroke="#000" stroke-width="0.5"/>
      <line x1="25" y1="80" x2="25" y2="92" stroke="#000" stroke-width="0.5"/>
      <line x1="30" y1="80" x2="30" y2="92" stroke="#000" stroke-width="0.5"/>
      <line x1="35" y1="80" x2="35" y2="92" stroke="#000" stroke-width="0.5"/>
    `
  ),
  createItem(
    'round-rug',
    'سجادة دائرية',
    'decor',
    2.5,
    2.5,
    `
      <circle cx="50" cy="50" r="48" fill="#fde68a" stroke="#d97706" stroke-width="1" stroke-dasharray="4 2"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#d97706" stroke-width="1" opacity="0.5"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#d97706" stroke-width="2" opacity="0.3"/>
    `
  ),
  createItem(
    'floor-lamp',
    'أباجورة أرضية',
    'decor',
    0.4,
    0.4,
    `
      <circle cx="50" cy="50" r="15" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <circle cx="50" cy="50" r="25" fill="#fef9c3" opacity="0.4"/>
      <line x1="50" y1="50" x2="50" y2="0" stroke="#374151" stroke-width="2"/>
    `
  ),
  // Kitchen extra
  createItem(
    'kitchen-island',
    'جزيرة مطبخ',
    'kitchen',
    1.8,
    0.9,
    `
      <rect x="5" y="10" width="90" height="80" rx="4" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <rect x="15" y="20" width="70" height="60" rx="2" fill="#ffffff" stroke="#374151" stroke-width="1"/>
      <circle cx="30" cy="50" r="8" fill="#dbeafe" stroke="#374151"/>
      <circle cx="70" cy="50" r="8" fill="#dbeafe" stroke="#374151"/>
    `
  ),
  createItem(
    'dishwasher',
    'غسالة أطباق',
    'kitchen',
    0.6,
    0.6,
    `
      <rect x="20" y="20" width="60" height="60" rx="4" fill="#f1f5f9" stroke="#374151" stroke-width="2"/>
      <rect x="25" y="25" width="50" height="10" rx="1" fill="#374151"/>
      <circle cx="30" cy="30" r="2" fill="#4ade80"/>
      <rect x="35" y="45" width="30" height="2" rx="1" fill="#94a3b8"/>
    `
  ),
  // Living room extra
  createItem(
    'fireplace',
    'مدفأة',
    'living room',
    1.5,
    0.5,
    `
      <rect x="10" y="20" width="80" height="60" rx="2" fill="#451a03" stroke="#271105" stroke-width="2"/>
      <rect x="25" y="40" width="50" height="30" fill="#000" rx="2"/>
      <path d="M35 65 Q45 40 50 65 Q55 40 65 65" fill="#f97316"/>
      <rect x="10" y="15" width="80" height="8" rx="2" fill="#92400e"/>
    `
  ),
  createItem(
    'gaming-pc',
    'كمبيوتر ألعاب',
    'office',
    1.2,
    0.6,
    `
      <rect x="10" y="20" width="80" height="60" rx="4" fill="#1e293b" stroke="#000" stroke-width="2"/>
      <rect x="15" y="25" width="50" height="35" rx="2" fill="#000" stroke="#3b82f6" stroke-width="1"/>
      <rect x="70" y="25" width="15" height="45" rx="2" fill="#0f172a" stroke="#3b82f6" stroke-width="1.5"/>
      <rect x="20" y="65" width="40" height="5" rx="1" fill="#3b82f6" opacity="0.6"/>
    `
  ),
  createItem(
    'washing-machine',
    'غسالة ملابس',
    'bathroom',
    0.6,
    0.6,
    `
      <rect x="20" y="10" width="60" height="80" rx="4" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <circle cx="50" cy="45" r="20" fill="#dbeafe" stroke="#374151" stroke-width="1.5"/>
      <circle cx="50" cy="45" r="15" fill="#eff6ff" stroke="#374151" stroke-width="0.5" opacity="0.5"/>
      <rect x="25" y="15" width="10" height="4" rx="1" fill="#374151"/>
      <circle cx="70" cy="17" r="3" fill="#3b82f6"/>
    `
  ),
  createItem(
    'sofa-l-shape',
    'كنبة ركنية (L-Shape)',
    'living room',
    3.0,
    2.2,
    `
      <path d="M10 10 L90 10 L90 70 L60 70 L60 90 L10 90 Z" fill="#dbeafe" stroke="#374151" stroke-width="2"/>
      <rect x="10" y="10" width="10" height="80" fill="#93c5fd" stroke="#374151" stroke-width="1"/>
      <rect x="10" y="10" width="80" height="10" fill="#93c5fd" stroke="#374151" stroke-width="1"/>
    `
  ),
  createItem(
    'coffee-corner',
    'ركن القهوة',
    'living room',
    1.2,
    0.4,
    `
      <rect x="10" y="20" width="80" height="60" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <circle cx="30" cy="50" r="4" fill="#374151"/>
      <rect x="50" y="40" width="20" height="20" rx="2" fill="#dbeafe" stroke="#374151"/>
    `
  ),
  createItem(
    'baby-crib',
    'سرير أطفال',
    'bedroom',
    1.2,
    0.7,
    `
      <rect x="15" y="20" width="70" height="60" rx="2" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <line x1="25" y1="20" x2="25" y2="80" stroke="#94a3b8" stroke-width="1"/>
      <line x1="35" y1="20" x2="35" y2="80" stroke="#94a3b8" stroke-width="1"/>
      <line x1="45" y1="20" x2="45" y2="80" stroke="#94a3b8" stroke-width="1"/>
      <line x1="55" y1="20" x2="55" y2="80" stroke="#94a3b8" stroke-width="1"/>
      <line x1="65" y1="20" x2="65" y2="80" stroke="#94a3b8" stroke-width="1"/>
    `
  ),
  createItem(
    'bidet',
    'بيديه',
    'bathroom',
    0.4,
    0.6,
    `
      <ellipse cx="50" cy="50" rx="15" ry="25" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <circle cx="50" cy="30" r="3" fill="#cbd5e1"/>
    `
  ),
  createItem(
    'patio-umbrella',
    'مظلة حديقة',
    'outdoor',
    2.5,
    2.5,
    `
      <circle cx="50" cy="50" r="45" fill="#fde68a" stroke="#d97706" stroke-width="2"/>
      <line x1="50" y1="5" x2="50" y2="95" stroke="#d97706" stroke-width="1"/>
      <line x1="5" y1="50" x2="95" y2="50" stroke="#d97706" stroke-width="1"/>
      <circle cx="50" cy="50" r="4" fill="#d97706"/>
    `
  ),
  // --- New Creative Items for Living Room ---
  createItem(
    'luxury-sofa-curved',
    'كنبة فاخرة منحنية',
    'living room',
    3.2,
    1.2,
    `
      <path d="M10 80 Q50 10 90 80 L80 90 Q50 30 20 90 Z" fill="#dbeafe" stroke="#1e40af" stroke-width="2"/>
    `
  ),
  createItem(
    'media-console-modern',
    'وحدة وسائط مودرن',
    'living room',
    2.4,
    0.5,
    `
      <rect x="5" y="20" width="90" height="60" rx="4" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <rect x="15" y="30" width="20" height="40" rx="2" fill="#e2e8f0" stroke="#374151" stroke-width="1"/>
      <rect x="65" y="30" width="20" height="40" rx="2" fill="#e2e8f0" stroke="#374151" stroke-width="1"/>
      <rect x="40" y="35" width="20" height="40" rx="2" fill="#000" stroke="#374151" stroke-width="1"/>
    `
  ),
  createItem(
    'accent-chair-round',
    'كرسي دائري عصري',
    'living room',
    0.8,
    0.8,
    `
      <circle cx="50" cy="50" r="40" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
      <path d="M20 50 Q50 10 80 50" fill="none" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>
    `
  ),
  // --- New Creative Items for Bedroom ---
  createItem(
    'king-size-bed-luxury',
    'سرير ملكي ضخم',
    'bedroom',
    2.2,
    2.4,
    `
      <rect x="10" y="5" width="80" height="90" rx="4" fill="#eff6ff" stroke="#374151" stroke-width="2"/>
      <rect x="10" y="5" width="80" height="15" rx="2" fill="#d1d5db" stroke="#374151" stroke-width="1"/>
      <rect x="15" y="25" width="30" height="20" rx="4" fill="#fff" stroke="#374151" stroke-width="1"/>
      <rect x="55" y="25" width="30" height="20" rx="4" fill="#fff" stroke="#374151" stroke-width="1"/>
      <rect x="10" y="70" width="80" height="25" rx="2" fill="#bfdbfe" stroke="#374151" stroke-width="1"/>
    `
  ),
  createItem(
    'vanity-desk-mirror',
    'تسريحة بمرآة مضيئة',
    'bedroom',
    1.2,
    0.5,
    `
      <rect x="10" y="30" width="80" height="60" rx="4" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <rect x="20" y="10" width="60" height="15" rx="2" fill="#dbeafe" stroke="#374151" stroke-width="1"/>
      <circle cx="25" cy="18" r="2" fill="#fde68a"/>
      <circle cx="35" cy="18" r="2" fill="#fde68a"/>
      <circle cx="45" cy="18" r="2" fill="#fde68a"/>
      <circle cx="55" cy="18" r="2" fill="#fde68a"/>
      <circle cx="65" cy="18" r="2" fill="#fde68a"/>
      <circle cx="75" cy="18" r="2" fill="#fde68a"/>
    `
  ),
  createItem(
    'walk-in-closet-unit',
    'وحدة خزانة ملابس',
    'bedroom',
    2.5,
    0.6,
    `
      <rect x="5" y="20" width="90" height="60" fill="#f1f5f9" stroke="#374151" stroke-width="2"/>
      <line x1="33" y1="20" x2="33" y2="80" stroke="#374151" stroke-width="1"/>
      <line x1="66" y1="20" x2="66" y2="80" stroke="#374151" stroke-width="1"/>
      <rect x="10" y="30" width="15" height="40" rx="1" fill="#cbd5e1"/>
      <rect x="42" y="30" width="15" height="40" rx="1" fill="#cbd5e1"/>
      <rect x="75" y="30" width="15" height="40" rx="1" fill="#cbd5e1"/>
    `
  ),
  // --- New Creative Items for Kitchen ---
  createItem(
    'microwave-oven',
    'ميكروويف',
    'kitchen',
    0.6,
    0.4,
    `
      <rect x="15" y="25" width="70" height="50" rx="4" fill="#1e293b" stroke="#000" stroke-width="2"/>
      <rect x="20" y="30" width="45" height="40" rx="1" fill="#0ea5e9" opacity="0.4"/>
      <rect x="70" y="35" width="10" height="5" rx="1" fill="#94a3b8"/>
      <rect x="70" y="45" width="10" height="5" rx="1" fill="#94a3b8"/>
      <rect x="70" y="55" width="10" height="5" rx="1" fill="#94a3b8"/>
    `
  ),
  createItem(
    'kitchen-pantry-tall',
    'دولاب خزين طويل',
    'kitchen',
    0.8,
    0.6,
    `
      <rect x="10" y="10" width="80" height="80" rx="4" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <line x1="50" y1="10" x2="50" y2="90" stroke="#374151" stroke-width="1"/>
      <circle cx="44" cy="50" r="2" fill="#374151"/>
      <circle cx="56" cy="50" r="2" fill="#374151"/>
    `
  ),
  createItem(
    'coffee-espresso-machine',
    'ماكينة إسبريسو',
    'kitchen',
    0.4,
    0.3,
    `
      <rect x="25" y="20" width="50" height="60" rx="4" fill="#475569" stroke="#000" stroke-width="2"/>
      <rect x="35" y="65" width="30" height="10" rx="1" fill="#cbd5e1"/>
      <circle cx="40" cy="35" r="3" fill="#ef4444"/>
      <circle cx="60" cy="35" r="3" fill="#10b981"/>
      <path d="M45 50 Q50 40 55 50" fill="none" stroke="#fff" stroke-width="1.5"/>
    `
  ),
  // --- New Creative Items for Bathroom ---
  createItem(
    'jacuzzi-bathtub-corner',
    'جاكوزي ركني',
    'bathroom',
    1.6,
    1.6,
    `
      <path d="M10 10 L90 10 Q90 90 10 90 Z" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
      <path d="M25 25 L75 25 Q75 75 25 75 Z" fill="#fff" stroke="#3b82f6" stroke-width="1.5"/>
      <circle cx="35" cy="35" r="3" fill="#3b82f6" opacity="0.3"/>
      <circle cx="55" cy="55" r="3" fill="#3b82f6" opacity="0.3"/>
      <circle cx="65" cy="25" r="3" fill="#3b82f6" opacity="0.3"/>
    `
  ),
  createItem(
    'double-vanity-bathroom',
    'حوض غسيل مزدوج',
    'bathroom',
    1.8,
    0.5,
    `
      <rect x="5" y="25" width="90" height="50" rx="4" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <ellipse cx="30" cy="50" rx="15" ry="10" fill="#dbeafe" stroke="#374151" stroke-width="1.5"/>
      <ellipse cx="70" cy="50" rx="15" ry="10" fill="#dbeafe" stroke="#374151" stroke-width="1.5"/>
      <circle cx="30" cy="30" r="2" fill="#94a3b8"/>
      <circle cx="70" cy="30" r="2" fill="#94a3b8"/>
    `
  ),
  createItem(
    'towel-rack-modern',
    'نشافة مناشف مودرن',
    'bathroom',
    0.6,
    0.2,
    `
      <rect x="10" y="30" width="80" height="40" rx="2" fill="#f1f5f9" stroke="#374151" stroke-width="2"/>
      <line x1="20" y1="30" x2="20" y2="70" stroke="#374151" stroke-width="1.5"/>
      <line x1="40" y1="30" x2="40" y2="70" stroke="#374151" stroke-width="1.5"/>
      <line x1="60" y1="30" x2="60" y2="70" stroke="#374151" stroke-width="1.5"/>
      <line x1="80" y1="30" x2="80" y2="70" stroke="#374151" stroke-width="1.5"/>
    `
  ),
  // --- New Creative Items for Office ---
  createItem(
    'standing-desk-electric',
    'مكتب واقف كهربائي',
    'office',
    1.6,
    0.7,
    `
      <rect x="10" y="20" width="80" height="60" rx="4" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <rect x="80" y="50" width="10" height="20" rx="1" fill="#1e293b"/>
      <rect x="30" y="30" width="40" height="40" rx="2" fill="#000" stroke="#374151" stroke-width="1"/>
    `
  ),
  createItem(
    'conference-table-large',
    'طاولة اجتماعات ضخمة',
    'office',
    3.6,
    1.4,
    `
      <rect x="5" y="20" width="90" height="60" rx="30" fill="#f8fafc" stroke="#374151" stroke-width="3"/>
      <circle cx="20" cy="50" r="4" fill="#cbd5e1"/>
      <circle cx="40" cy="50" r="4" fill="#cbd5e1"/>
      <circle cx="60" cy="50" r="4" fill="#cbd5e1"/>
      <circle cx="80" cy="50" r="4" fill="#cbd5e1"/>
    `
  ),
  createItem(
    'whiteboard-wall-mount',
    'سبورة بيضاء حائطية',
    'office',
    1.2,
    0.05,
    `
      <rect x="5" y="45" width="90" height="10" fill="#fff" stroke="#374151" stroke-width="1"/>
      <rect x="10" y="45" width="5" height="10" fill="#3b82f6"/>
    `
  ),
  createItem(
    'corner-workstation',
    'محطة عمل ركنية',
    'office',
    1.8,
    1.8,
    `
      <path d="M10 10 L90 10 L90 40 L40 40 L40 90 L10 90 Z" fill="#f8fafc" stroke="#374151" stroke-width="2"/>
      <rect x="15" y="15" width="25" height="15" rx="1" fill="#000"/>
      <rect x="15" y="35" width="20" height="5" rx="1" fill="#94a3b8"/>
    `
  ),
  // --- New Creative Items for Outdoor ---
  createItem(
    'bbq-grill-station',
    'محطة شواء (BBQ)',
    'outdoor',
    1.4,
    0.6,
    `
      <rect x="10" y="25" width="80" height="50" rx="4" fill="#334155" stroke="#0f172a" stroke-width="2"/>
      <rect x="20" y="30" width="30" height="40" rx="2" fill="#0f172a"/>
      <line x1="25" y1="35" x2="45" y2="35" stroke="#ef4444" stroke-width="1"/>
      <line x1="25" y1="40" x2="45" y2="40" stroke="#ef4444" stroke-width="1"/>
      <rect x="60" y="40" width="20" height="20" rx="10" fill="#94a3b8"/>
    `
  ),
  createItem(
    'outdoor-fountain',
    'نافورة مياه',
    'outdoor',
    1.5,
    1.5,
    `
      <circle cx="50" cy="50" r="45" fill="#dbeafe" stroke="#1e40af" stroke-width="2"/>
      <circle cx="50" cy="50" r="25" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="8" fill="#fff" stroke="#3b82f6" stroke-width="1"/>
      <path d="M50 50 L60 20 M50 50 L40 20 M50 50 L80 50 M50 50 L20 50" fill="none" stroke="#60a5fa" stroke-width="1" opacity="0.6"/>
    `
  ),
  createItem(
    'privacy-fence-section',
    'قسم سياج خشبي',
    'outdoor',
    2.0,
    0.15,
    `
      <rect x="5" y="40" width="90" height="20" fill="#78350f" stroke="#451a03" stroke-width="1"/>
      <line x1="15" y1="40" x2="15" y2="60" stroke="#451a03" stroke-width="1"/>
      <line x1="30" y1="40" x2="30" y2="60" stroke="#451a03" stroke-width="1"/>
      <line x1="45" y1="40" x2="45" y2="60" stroke="#451a03" stroke-width="1"/>
      <line x1="60" y1="40" x2="60" y2="60" stroke="#451a03" stroke-width="1"/>
      <line x1="75" y1="40" x2="75" y2="60" stroke="#451a03" stroke-width="1"/>
    `
  ),
  // --- New Creative Items for Decor ---
  createItem(
    'abstract-wall-art-tall',
    'لوحة جدارية تجريدية',
    'decor',
    1.0,
    0.1,
    `
      <rect x="10" y="40" width="80" height="20" fill="#fff" stroke="#000" stroke-width="2"/>
      <path d="M15 50 L85 50" stroke="#f43f5e" stroke-width="4" stroke-linecap="round"/>
      <circle cx="30" cy="50" r="3" fill="#3b82f6"/>
      <circle cx="60" cy="50" r="3" fill="#facc15"/>
    `
  ),
  createItem(
    'full-length-mirror',
    'مرآة طولية',
    'decor',
    0.6,
    0.1,
    `
      <rect x="20" y="42" width="60" height="15" rx="2" fill="#dbeafe" stroke="#94a3b8" stroke-width="2"/>
      <path d="M30 45 L50 45" stroke="#fff" stroke-width="1" opacity="0.6"/>
    `
  ),
  createItem(
    'cowhide-rug-natural',
    'سجادة جلد طبيعي',
    'decor',
    2.0,
    1.8,
    `
      <path d="M10 50 Q10 10 50 10 Q90 10 90 50 Q90 90 50 90 Q10 90 10 50" fill="#fef3c7" stroke="#d97706" stroke-width="1" stroke-dasharray="2 2"/>
      <path d="M25 30 Q35 25 40 40 Q45 55 30 60 Q20 40 25 30" fill="#92400e" opacity="0.4" stroke="none"/>
      <path d="M60 60 Q75 55 80 70 Q75 85 65 75 Q55 65 60 60" fill="#92400e" opacity="0.4" stroke="none"/>
    `
  ),
  // --- New Creative Items for Doors/Windows ---
  createItem(
    'sliding-glass-door',
    'باب زجاجي سحاب',
    'doors windows',
    2.4,
    0.15,
    `
      <rect x="5" y="40" width="90" height="20" rx="2" fill="#f8fafc" stroke="#374151" stroke-width="1"/>
      <rect x="10" y="43" width="38" height="14" rx="1" fill="#87ceeb" opacity="0.5" stroke="#4682b4" stroke-width="1"/>
      <rect x="52" y="43" width="38" height="14" rx="1" fill="#87ceeb" opacity="0.5" stroke="#4682b4" stroke-width="1"/>
      <line x1="45" y1="43" x2="45" y2="57" stroke="#374151" stroke-width="2"/>
    `
  ),
  createItem(
    'arched-window-large',
    'نفاذة مقوسة كبيرة',
    'doors windows',
    1.8,
    0.1,
    `
      <rect x="10" y="45" width="80" height="10" rx="5" fill="#87ceeb" stroke="#374151" stroke-width="2"/>
      <line x1="30" y1="45" x2="30" y2="55" stroke="#374151" stroke-width="1"/>
      <line x1="50" y1="45" x2="50" y2="55" stroke="#374151" stroke-width="1"/>
      <line x1="70" y1="45" x2="70" y2="55" stroke="#374151" stroke-width="1"/>
    `
  ),
  createItem(
    'sofa-u-shape-luxury',
    'كنبة ملكية (U-Shape)',
    'living room',
    4.0,
    3.0,
    `
      <path d="M10 10 L90 10 L90 90 L70 90 L70 30 L30 30 L30 90 L10 90 Z" fill="#dbeafe" stroke="#1e40af" stroke-width="2"/>
      <rect x="10" y="10" width="80" height="15" fill="#93c5fd" stroke="#1e40af" stroke-width="1"/>
    `
  ),
  createItem(
    'dining-table-grand-12',
    'طاولة طعام (12 شخص)',
    'kitchen',
    4.5,
    1.2,
    `
      <rect x="5" y="25" width="90" height="50" rx="10" fill="#f8fafc" stroke="#374151" stroke-width="3"/>
      ${Array.from({ length: 12 }).map((_, i) => {
        const x = i < 6 ? 15 + i * 14 : 15 + (i - 6) * 14;
        const y = i < 6 ? 10 : 80;
        return `<rect x="${x}" y="${y}" width="10" height="10" rx="2" fill="#e2e8f0" stroke="#374151"/>`;
      }).join('')}
    `
  ),
  createItem(
    'luxury-canopy-bed',
    'سرير ملكي بأعمدة',
    'bedroom',
    2.2,
    2.2,
    `
      <rect x="10" y="10" width="80" height="80" rx="4" fill="#eff6ff" stroke="#1e40af" stroke-width="2"/>
      <circle cx="10" cy="10" r="4" fill="#1e40af"/>
      <circle cx="90" cy="10" r="4" fill="#1e40af"/>
      <circle cx="10" cy="90" r="4" fill="#1e40af"/>
      <circle cx="90" cy="90" r="4" fill="#1e40af"/>
      <rect x="15" y="20" width="30" height="15" rx="2" fill="#fff" stroke="#374151"/>
      <rect x="55" y="20" width="30" height="15" rx="2" fill="#fff" stroke="#374151"/>
    `
  ),
  createItem(
    'modern-corner-office',
    'مكتب زجاجي ركني فخم',
    'office',
    2.2,
    2.2,
    `
      <path d="M10 10 L90 10 L90 40 L40 40 L40 90 L10 90 Z" fill="#f1f5f9" stroke="#374151" stroke-width="2"/>
      <path d="M12 12 L88 12 L88 38 L38 38 L38 88 L12 88 Z" fill="#87ceeb" opacity="0.3"/>
      <rect x="15" y="15" width="20" height="12" rx="1" fill="#000"/>
    `
  ),
  createItem(
    'indoor-fountain-zen',
    'نافورة زينة داخلية',
    'decor',
    1.2,
    1.2,
    `
      <circle cx="50" cy="50" r="40" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
      <circle cx="50" cy="50" r="20" fill="#eff6ff" stroke="#3b82f6" stroke-width="1"/>
      <path d="M50 30 Q60 50 50 70 Q40 50 50 30" fill="#60a5fa" opacity="0.6"/>
    `
  ),
  createItem(
    'luxury-wine-rack',
    'خزانة مشروبات فاخرة',
    'kitchen',
    1.5,
    0.4,
    `
      <rect x="5" y="20" width="90" height="60" rx="4" fill="#451a03" stroke="#000" stroke-width="2"/>
      ${Array.from({ length: 15 }).map((_, i) => `<circle cx="${15 + (i % 5) * 17}" cy="${35 + Math.floor(i / 5) * 15}" r="4" fill="#1e1b4b" opacity="0.8"/>`).join('')}
    `
  ),
  createItem(
    'swimming-pool-large',
    'مسبح كبير فخم',
    'outdoor',
    8.0,
    4.0,
    `
      <rect x="5" y="10" width="90" height="80" rx="15" fill="#0ea5e9" stroke="#0369a1" stroke-width="4"/>
      <rect x="15" y="20" width="70" height="60" rx="10" fill="#38bdf8" opacity="0.6"/>
      <path d="M10 20 L25 20 M10 30 L25 30" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    `
  ),
];
