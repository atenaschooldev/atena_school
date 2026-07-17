import React from 'react';
import { env } from '@/config/env';

interface CourseSchemaProps {
  name: string;
  description: string;
  image?: string;
  provider?: string;
  price?: string;
  currency?: string;
}

export default function CourseSchema({ 
  name, 
  description, 
  image, 
  provider = "Atena School",
  price,
  currency = "EUR"
}: CourseSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": name,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": provider,
      "sameAs": env.NEXT_PUBLIC_SITE_URL
    },
    ...(image && { "image": image }),
    ...(price && {
      "offers": {
        "@type": "Offer",
        "price": price.replace('€', '').trim(),
        "priceCurrency": currency,
        "availability": "https://schema.org/InStock"
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
