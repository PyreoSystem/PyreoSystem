import { GetServerSideProps } from "next";
import Head from "next/head";
import { supabase } from "../../../lib/supabaseClient";
type Biz = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
  whatsapp_number: string | null;
  logo_url: string | null;
};

type Props = { businesses: Biz[] };

export default function RestaurantesPage({ businesses }: Props) {
  return (
    <>
      <Head><title>Restaurantes en Cancún | Global Hub</title></Head>
      <main style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
        <h1>Restaurantes en Cancún</h1>
        {businesses.length === 0 ? (
          <p>No hay negocios aprobados aún.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
            {businesses.map((b) => (
              <li key={b.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
                <a href={`/es/business/${b.slug}`} style={{ fontWeight: 600 }}>{b.name}</a>
                {b.description && <p style={{ margin: "6px 0" }}>{b.description}</p>}
                <div style={{ display: "flex", gap: 12, fontSize: 14 }}>
                  {b.website_url && <a href={b.website_url} target="_blank" rel="noreferrer">Website</a>}
                  {b.whatsapp_number && (
                    <a href={`https://wa.me/${b.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { data: cityRow } = await supabase
    .from("city")
    .select("id")
    .eq("slug", "cancun")
    .single();

  const { data: catRow } = await supabase
    .from("category")
    .select("id")
    .eq("slug", "restaurantes")
    .single();

  if (!cityRow || !catRow) return { props: { businesses: [] } };

  const { data: businesses } = await supabase
    .from("business")
    .select("id, name, slug, description, website_url, whatsapp_number, logo_url")
    .eq("city_id", cityRow.id)
    .eq("category_id", catRow.id)
    .eq("is_approved", true)
    .order("name");

  return { props: { businesses: businesses ?? [] } };
};
