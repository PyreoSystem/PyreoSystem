import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

type City = { id: string; slug: string; name_es: string };
type Category = { id: string; slug: string; name_es: string };
type Business = {
  id: string;
  slug: string;
  name: string;
  desc?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  cover_image_url?: string | null;
  is_promoted?: boolean | null;
  city_id: string;
  category_id: string;
  category?: Category;
  city?: City;
  promotion?: {
    id: string;
    title: string;
    text?: string | null;
    starts_at?: string | null;
    ends_at?: string | null;
    is_active: boolean;
  } | null;
};

type Props = {
  city: City;
  business: Business;
  baseUrl: string;
};

export default function BusinessPage({ city, business, baseUrl }: Props) {
  const title = `${business.name} – ${city.name_es} | Global Hub`;
  const description =
    business.desc ||
    `Descubre ${business.name} en ${city.name_es}. Promociones, contacto y más.`;
  const canonical = `${baseUrl}/es/${city.slug}/negocio/${business.slug}`;
  const ogImage = business.cover_image_url || `${baseUrl}/og-default.jpg`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:locale" content="es_MX" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem" }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: "1rem", fontSize: ".95rem" }}>
          <Link href="/es">Inicio</Link> {" / "}
          <Link href={`/es/${city.slug}`}>{city.name_es}</Link> {" / "}
          <span style={{ color: "#666" }}>{business.name}</span>
        </nav>

        {/* Header */}
        <h1 style={{ marginBottom: ".5rem" }}>{business.name}</h1>
        {business.category?.name_es && (
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            {business.category.name_es} · {city.name_es}
          </p>
        )}

        {/* Cover */}
        <div style={{ marginBottom: "1rem" }}>
          <Image
            src={business.cover_image_url || "/og-default.jpg"}
            alt={business.name}
            width={1200}
            height={630}
            style={{ width: "100%", height: "auto", borderRadius: 12 }}
            priority
          />
        </div>

        {/* Promo */}
        {business.promotion?.is_active && (
          <div
            style={{
              background: "#fff4e5",
              border: "1px solid #ffd8a8",
              padding: "1rem",
              borderRadius: 12,
              marginBottom: "1rem",
            }}
          >
            <strong>Promoción:</strong> {business.promotion.title}
            {business.promotion.text ? ` — ${business.promotion.text}` : ""}
          </div>
        )}

        {/* Info */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: "1rem",
          }}
        >
          {business.desc && <p style={{ marginBottom: ".75rem" }}>{business.desc}</p>}
          {business.address && (
            <p style={{ marginBottom: ".5rem" }}>
              <strong>Dirección:</strong> {business.address}
            </p>
          )}
          {(business.phone || business.whatsapp) && (
            <p style={{ marginBottom: ".75rem" }}>
              <strong>Contacto:</strong>{" "}
              {business.phone && (
                <a href={`tel:${business.phone}`} style={{ marginRight: "1rem" }}>
                  Llamar
                </a>
              )}
              {business.whatsapp && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hola, vi su negocio en Global Hub y me gustaría más información.`
                  )}`}
                >
                  WhatsApp
                </a>
              )}
            </p>
          )}
          <div style={{ marginTop: "1rem" }}>
            <Link href={`/es/${city.slug}/${business.category?.slug || ""}`}>
              ← Volver a categoría
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { city: citySlug, slug } = ctx.params as { city: string; slug: string };
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    `https://${ctx.req.headers.host}`;

  // Fetch city
  const { data: city, error: cityErr } = await supabase
    .from("city")
    .select("*")
    .eq("slug", citySlug)
    .single();

  if (cityErr || !city) return { notFound: true };

  // Fetch business with relations
  const { data: business, error: bizErr } = await supabase
    .from("business")
    .select(
      `
      *,
      category:category_id ( id, slug, name_es ),
      city:city_id ( id, slug, name_es ),
      promotion:promotion!left ( id, title, text, starts_at, ends_at, is_active )
    `
    )
    .eq("city_id", city.id)
    .eq("slug", slug)
    .single();

  if (bizErr || !business) return { notFound: true };

  return {
    props: {
      city,
      business,
      baseUrl,
    },
  };
};
