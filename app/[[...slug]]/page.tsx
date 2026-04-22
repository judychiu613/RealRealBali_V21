import type { Metadata } from "next";
import { buildMetadataForSlug } from "@/lib/seo/build-metadata";
import SpaApp from "./spa-app";

type PageProps = {
  params: { slug?: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  return buildMetadataForSlug(params.slug, searchParams);
}

export default function Page() {
  return <SpaApp />;
}
