import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import { Trans } from "react-i18next/TransWithoutContext";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "home");

  return {
    title: t("title"),
  };
}

export default async function Home(props: Props) {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "home");

  return (
    <>Page content</>
  );
}
