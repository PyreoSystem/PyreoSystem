import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient'; 

type City = { id: string; name_es: string; slug: string };
type Category = { id: string; name_es: string; slug: string };

export default function CityPage({ cityData: initialCityData, base }: any) {
  const staticBaseUrl = base; 
  const router = useRouter();
  const { city } = router.query;

  const [cityData, setCityData] = useState<City | null>(initialCityData);

  useEffect(() => {
    if (!city || typeof city !== 'string') return;
    fetchData(city);
  }, [city]);

  async function fetchData(citySlug: string) {
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

      const { data: cats, error: catErr } = await supabase
        .from('category')
        .select('id, name_es, slug')
        .order('name_es', { ascending: true });

      if (catErr) throw catErr;

      setCategories(cats || []);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  const title = cityData ? `${cityData.name_es} | Global Hub` : 'Global Hub';
  const baseUrl = 'https://pyreo-system.vercel.app';
const canonicalUrl = cityData ? `${baseUrl}/es/${cityData.slug}` : baseUrl;
const metaDescription = cityData
  ? `Explora categorías y negocios en ${cityData.name_es}. Ofertas y promociones de negocios locales.`
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

  if (!cityData)
    return (
      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        Ciudad no encontrada.
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
  <meta property="og:image" content={`${staticbaseUrl}/og-default.jpg`} />
  <meta property="og:image" content="https://pyreo-system.vercel.app/og-default.jpg" /> 
  <meta property="og:locale" content="es_MX" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={metaDescription} />
  <meta name="twitter:image" content={`${staticbaseUrl}/og-default.jpg`} />
</Head> 

      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {cityData.name_es}
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Selecciona una categoría
        </p>

        {categories.length === 0 ? (
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '1rem',
              background: 'white',
              color: '#6b7280',
            }}
          >
            No hay categorías todavía.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            {categories.map((c) => (
              <a
                key={c.id}
                href={`/es/${cityData.slug}/${c.slug}`}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: '1rem',
                  background: 'white',
                  textDecoration: 'none',
                  color: '#111827',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  {c.name_es}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                  Ver negocios
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
// --- Server‑Side Rendering for Meta Tags (so Facebook can read them) ---
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { city } = context.params!; // get the city slug from the URL

  // Fetch city data from Supabase on the server
  const { data: cityData, error } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', city)
    .single();

  const baseUrl = 'https://pyreo-system.vercel.app';

  if (error || !cityData) {
    return { notFound: true }; // show 404 if not found
  }

  return {
  props: {
    cityData,
    base: baseUrl,
  },
};
