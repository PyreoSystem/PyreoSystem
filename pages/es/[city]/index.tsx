// trigger deploy
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

type City = {
  id: string;
  name_es: string;
  slug: string;
};

type Category = {
  id: string;
  name_es: string;
  slug: string;
};

export default function CityPage() {
  const router = useRouter();
  const { city } = router.query;

  const [cityData, setCityData] = useState<City | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city || typeof city !== 'string') return;
    fetchData(city);
  }, [city]);

  async function fetchData(citySlug: string) {
    try {
      setLoading(true);
      setError(null);

      // Get city info
      const { data: cityInfo, error: cityErr } = await supabase
        .from('city')
        .select('id, name_es, slug')
        .eq('slug', citySlug)
        .maybeSingle();

      if (cityErr) throw cityErr;
      setCityData(cityInfo);

      // Get categories (public)
      const { data: cats, error: catsErr } = await supabase
        .from('category')
        .select('id, name_es, slug')
        .order('name_es', { ascending: true });

      if (catsErr) throw catsErr;
      setCategories(cats || []);
    } catch (e: any) {
      setError(e.message ?? 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return <div style={{ padding: '2rem' }}>Cargando...</div>;
  if (error)
    return (
      <div style={{ padding: '2rem', color: 'crimson' }}>
        {error}
      </div>
    );
  if (!cityData)
    return <div style={{ padding: '2rem' }}>Ciudad no encontrada</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
        {cityData.name_es}
      </h1>

      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Explora negocios locales por categoría
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/es/${cityData.slug}/${cat.slug}`}
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
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
              {cat.name_es}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Ver negocios
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
