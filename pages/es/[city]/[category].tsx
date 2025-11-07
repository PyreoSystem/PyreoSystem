import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

type City = { id: string; name_es: string; slug: string };
type Category = { id: string; name_es: string; slug: string };
type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
};

export default function CategoryPage() {
  const router = useRouter();
  const { city, category } = router.query;

  const [cityData, setCityData] = useState<City | null>(null);
  const [categoryData, setCategoryData] = useState<Category | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city || !category) return;
    if (typeof city !== 'string' || typeof category !== 'string') return;
    fetchData(city, category);
  }, [city, category]);

  async function fetchData(citySlug: string, categorySlug: string) {
    try {
      setLoading(true);
      setError(null);

      const { data: cityInfo, error: cityErr } = await supabase
        .from('city')
        .select('id, name_es, slug')
        .eq('slug', citySlug)
        .maybeSingle();
      if (cityErr) throw cityErr;
      if (!cityInfo) {
        setError('Ciudad no encontrada');
        setLoading(false);
        return;
      }
      setCityData(cityInfo);

      const { data: catInfo, error: catErr } = await supabase
        .from('category')
        .select('id, name_es, slug')
        .eq('slug', categorySlug)
        .maybeSingle();
      if (catErr) throw catErr;
      if (!catInfo) {
        setError('Categoría no encontrada');
        setLoading(false);
        return;
      }
      setCategoryData(catInfo);

      const { data: biz, error: bizErr } = await supabase
        .from('business')
        .select('id, name, slug, description, logo_url')
        .eq('city_id', cityInfo.id)
        .eq('category_id', catInfo.id)
        .eq('is_approved', true)
        .order('name', { ascending: true });
      if (bizErr) throw bizErr;

      setBusinesses(biz || []);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  const title =
    cityData && categoryData
      ? `${categoryData.name_es} en ${cityData.name_es} | Global Hub`
      : 'Global Hub';
  const baseUrl = 'https://pyreo-system.vercel.app';
const canonicalUrl =
  cityData && categoryData
    ? `${baseUrl}/es/${cityData.slug}/${categoryData.slug}`
    : baseUrl;

const metaDescription =
  cityData && categoryData
    ? `Explora ${categoryData.name_es} en ${cityData.name_es}. Ofertas y promociones de negocios locales.`
    : 'Explora negocios y categorías en Global Hub.';

  if (loading)
    return (
      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        Cargando…
      </div>
    );

  if (error)
    return (
      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', color: 'crimson' }}>
        {error}
      </div>
    );

  if (!cityData || !categoryData)
    return (
      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        Página no disponible.
      </div>
    );

  return (
    <>
      <Head>
  <title>{title}</title>
  <meta name="description" content={metaDescription} />
  <link rel="canonical" href={canonicalUrl} />

  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={`${baseUrl}/og-default.jpg`} />
  <meta property="og:locale" content="es_MX" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={metaDescription} />
  <meta name="twitter:image" content={`${baseUrl}/og-default.jpg`} />
</Head>

      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {categoryData.name_es} en {cityData.name_es}
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Negocios aprobados en esta categoría
        </p>

        {businesses.length === 0 ? (
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '1rem',
              background: 'white',
              color: '#6b7280',
            }}
          >
            No hay negocios todavía.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {businesses.map((b) => (
              <div
                key={b.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: '1rem',
                  background: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    height: 140,
                    background: '#f8fafc',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                  }}
                >
                  {b.logo_url ? 'Logo' : 'Sin imagen'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <a
                    href={`/es/${cityData.slug}/biz/${b.slug}`}
                    style={{
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      color: '#111827',
                      textDecoration: 'none',
                    }}
                  >
                    {b.name}
                  </a>
                  {b.description && (
                    <div style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.4 }}>
                      {b.description}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: 'auto',
                    flexWrap: 'wrap',
                  }}
                >
                  <a
                    href={`/es/${cityData.slug}/biz/${b.slug}`}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: 8,
                      background: '#111827',
                      color: 'white',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}
                  >
                    Ver negocio
                  </a>
                  <a
                    href={`/es/${cityData.slug}`}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      color: '#111827',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      background: 'white',
                    }}
                  >
                    Volver a categorías
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
