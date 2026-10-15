export type GalleryCategory = 'exterior' | 'mainRoom' | 'bungalow1' | 'bungalow2';

export const GALLERY_CATEGORIES: GalleryCategory[] = ['exterior', 'mainRoom', 'bungalow1', 'bungalow2'];

export const GALLERY_IMAGES: Record<GalleryCategory, string[]> = {
  exterior: [
    '/imgs/OaxacaPicture_1.jpg',
    '/imgs/OaxacaPicture_2.jpg',
    '/imgs/OaxacaPicture_3.jpg',
    '/imgs/OaxacaPicture_4.jpg',
    '/imgs/OaxacaPicture_5.jpg',
    '/imgs/OaxacaPicture_6.jpg',
    '/imgs/OaxacaPicture_7.png',
    '/imgs/OaxacaPicture_8.jpg',
    '/imgs/OaxacaPicture_9.jpg',
    '/imgs/OaxacaPicture_10.jpg',
  ],
  mainRoom: [
    '/imgs/Room/Main.jpg',
    '/imgs/Room/exterior1.jpg',
    '/imgs/Room/Exterior3.jpg',
    '/imgs/Room/bathroom.jpg',
    '/imgs/Room/bed1.jpg',
    '/imgs/Room/bed2.jpg',
    '/imgs/Room/kitchen.jpg',
  ],
  bungalow1: [
    '/imgs/Bungalow1/Main.jpg',
    '/imgs/Bungalow1/Exterior1.jpg',
    '/imgs/Bungalow1/Exterior2.jpg',
    '/imgs/Bungalow1/Exterior3.jpg',
    '/imgs/Bungalow1/Exterior4.jpg',
    '/imgs/Bungalow1/bathroom.jpg',
    '/imgs/Bungalow1/bed1.jpg',
    '/imgs/Bungalow1/bed2.jpg',
    '/imgs/Bungalow1/kitchenette1.jpg',
    '/imgs/Bungalow1/kitchennete2.jpg',
  ],
  bungalow2: [
    '/imgs/Bungalow2/Main.jpg',
    '/imgs/Bungalow2/Exterior1.jpg',
    '/imgs/Bungalow2/Bathroom1.jpg',
    '/imgs/Bungalow2/Bed1.jpg',
    '/imgs/Bungalow2/Table1.jpg',
    '/imgs/Bungalow2/QqWao.jpg',
  ],
};

export const getGalleryImages = (selected: Set<GalleryCategory>) =>
  GALLERY_CATEGORIES.filter((c) => selected.has(c)).flatMap((c) => GALLERY_IMAGES[c]);
