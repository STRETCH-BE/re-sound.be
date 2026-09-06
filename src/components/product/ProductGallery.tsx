import Image from 'next/image';

export interface GalleryImage {
  src: string;
  alt: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  tag: string;
  title: string;
  /** Optional id for the sticky nav; defaults to "gallery" */
  id?: string;
}

/**
 * "Projects & Installations" — server component.
 *
 * A static, lazy-loaded image grid. There is no lightbox on any product
 * page today, so nothing needs JavaScript; if one is added later it should
 * be loaded with next/dynamic from a client island, not from here.
 */
export default function ProductGallery({ images, tag, title, id = 'gallery' }: ProductGalleryProps) {
  if (images.length === 0) return null;

  return (
    <section id={id} className="ps-section ps-gallery">
      <div className="ps-header">
        <span className="section-tag">{tag}</span>
        <h2>{title}</h2>
      </div>

      <ul className="ps-gallery-grid">
        {images.map((img) => (
          <li key={img.src} className="ps-gallery-item">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
