import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

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

      // Validate city
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

      // Validate category
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

      // Fetch approved businesses for city + category
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

  return (
    <>
      <Head>
        <title>{title}</title>
        {cityData && categoryData && (
          <meta
            name="description"
            content={`Explora ${categoryData.name_es} en ${cityData.name_es}. Ofertas y promociones de negocios locales.`}
          />
        )}
      </Head>

      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        {loading && <div>Cargando...</div>}
        {error && <div style={{ color: 'crimson' }}>{error}</div>}

        {!loading && !error && cityData && categoryData && (
          <>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              {categoryData.name_es} en {cityData.name_es}
            </h1>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Negocios aprobados en esta categoría
            </p>

            {businesses.length === 0 ? (
              <div>No hay negocios todavía.</div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1rem',
                }}
              >
                {businesses.map((b) => (
                  <a
                    key={b.id}
                    href={`/es/${cityData.slug}/biz/${b.slug}`}
                    style={{
                      display: 'block',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      padding: '1rem',
                      textDecoration: 'none',
                      color: '#111827',
                      background: 'white',
                    }}
                  >
                    <div
                      style={{
                        height: 120,
                        background: '#f8fafc',
                        borderRadius: 6,
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        fontSize: '0.9rem',
                      }}
                    >
                      {b.logo_url ? 'Logo' : 'Sin imagen'}
                    </div>
                    <div style={{ fontWeight: 600 }}>{b.name}</div>
                    {b.description && (
                      <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        {b.description}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
  }
