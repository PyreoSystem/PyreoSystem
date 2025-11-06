import Skeleton, { ShimmerStyle } from '../../../components/Skeleton';
// trigger deploy
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Skeleton, { ShimmerStyle } from '../../components/Skeleton';

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
  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <ShimmerStyle />
      <div style={{ marginBottom: '1rem' }}>
        <Skeleton width={240} height={32} />
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Skeleton width={360} height={18} />
      </div>
      <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1rem',
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '1rem',
            background: 'white',
          }}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            <Skeleton width="70%" height={18} />
          </div>
          <Skeleton width="50%" height={14} />
        </div>
      ))}
    </div>
  </div>
);
