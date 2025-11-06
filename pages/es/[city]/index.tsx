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
    if (!city) return;

    async function fetchData() {
      try {
        setLoading(true);

        // Get city info by slug
        const { data: cityInfo, error: cityErr } = await supabase
          .from('city')
          .select('*')
          .eq('slug', city)
          .single();

        if (cityErr) throw cityErr;

        // Get all categories (Spanish name)
        const { data: cats, error: catErr } = await supabase
          .from('category')
          .select('*')
          .order('name_es', { ascending: true });

        if (catErr) throw catErr;

        setCityData(cityInfo as City);
        setCategories((cats || []) as Category[]);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [city]);

  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'crimson' }}>{error}</div>;
  if (!cityData) return <div style={{ padding: '2rem' }}>Ciudad no encontrada</div>;

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
</div>
  </div>
);
