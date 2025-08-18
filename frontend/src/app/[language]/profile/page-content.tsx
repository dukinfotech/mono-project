"use client";

import useAuth from "@/services/auth/use-auth";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import NextLink from "next/link";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation("profile");

  return (
    <div className="max-w-sm mx-auto px-4 pt-6">
      <div className="flex gap-6">
        <Avatar className="w-20 h-20 md:w-32 md:h-32">
          <AvatarImage src={user?.photo?.path || ""} alt={`${user?.firstName} ${user?.lastName}`} />
          <AvatarFallback>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col justify-center flex-1">
          <h1 className="text-2xl font-bold mb-1" data-testid="user-name">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-lg text-muted-foreground mb-3" data-testid="user-email">
            {user?.email}
          </p>

          <Button asChild data-testid="edit-profile">
            <NextLink href="/profile/edit">
              {t("profile:actions.edit")}
            </NextLink>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(Profile);
