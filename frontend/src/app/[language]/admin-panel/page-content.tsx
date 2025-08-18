"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";

function AdminPanel() {
  const { t } = useTranslation("admin-panel-home");

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6">
      <div className="flex flex-col space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(AdminPanel, { roles: [RoleEnum.ADMIN] });
