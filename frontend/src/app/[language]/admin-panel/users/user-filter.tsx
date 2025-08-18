"use client";

import FormMultipleSelectInput from "@/components/form/multiple-select/form-multiple-select";
import { Role, RoleEnum } from "@/services/api/types/role";
import { useTranslation } from "@/services/i18n/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { UserFilterType } from "./user-filter-types";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type UserFilterFormData = UserFilterType;

function UserFilter() {
  const { t } = useTranslation("admin-panel-users");
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<UserFilterFormData>({
    defaultValues: {
      roles: [],
    },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter) {
      const filterParsed = JSON.parse(filter);
      reset(filterParsed);
    }
  }, [searchParams, reset]);

  return (
    <FormProvider {...methods}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="default">
            {t("admin-panel-users:filter.actions.filter")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <form
            onSubmit={handleSubmit((data) => {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set("filter", JSON.stringify(data));
              router.push(
                window.location.pathname + "?" + searchParams.toString()
              );
            })}
            className="flex flex-col gap-4"
          >
            <FormMultipleSelectInput<UserFilterFormData, Pick<Role, "id">>
              name="roles"
              testId="roles"
              label={t("admin-panel-users:filter.inputs.role.label")}
              options={[
                { id: RoleEnum.ADMIN },
                { id: RoleEnum.USER },
              ]}
              keyValue="id"
              renderOption={(option) =>
                t(`admin-panel-users:filter.inputs.role.options.${option.id}`)
              }
              renderValue={(values) =>
                values
                  .map((value) =>
                    t(
                      `admin-panel-users:filter.inputs.role.options.${value.id}`
                    )
                  )
                  .join(", ")
              }
            />
            <Button type="submit" variant="default">
              {t("admin-panel-users:filter.actions.apply")}
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </FormProvider>
  );
}

export default UserFilter;
