"use client";

import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { useAuthResetPasswordService } from "@/services/api/services/auth";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "@/hooks/use-snackbar";
import { useRouter } from "next/navigation";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

type PasswordChangeFormData = {
  password: string;
  passwordConfirmation: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("password-change");

  return yup.object().shape({
    password: yup
      .string()
      .min(6, t("password-change:inputs.password.validation.min"))
      .required(t("password-change:inputs.password.validation.required")),
    passwordConfirmation: yup
      .string()
      .oneOf(
        [yup.ref("password")],
        t("password-change:inputs.passwordConfirmation.validation.match")
      )
      .required(
        t("password-change:inputs.passwordConfirmation.validation.required")
      ),
  });
};

function FormActions() {
  const { t } = useTranslation("password-change");
  const { isSubmitting } = useFormState();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      data-testid="set-password"
      className="w-full"
    >
      {t("password-change:actions.submit")}
    </Button>
  );
}

function ExpiresAlert() {
  const { t } = useTranslation("password-change");
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const expires = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return Number(params.get("expires"));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      if (expires < now) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expires]);

  const isExpired = expires < currentTime;

  return (
    isExpired && (
      <Alert variant="destructive" data-testid="reset-link-expired-alert">
        <AlertTitle>{t("password-change:alerts.expired")}</AlertTitle>
        <AlertDescription>
          {t("password-change:alerts.expired")}
        </AlertDescription>
      </Alert>
    )
  );
}

function Form() {
  const { enqueueSnackbar } = useSnackbar();
  const fetchAuthResetPassword = useAuthResetPasswordService();
  const { t } = useTranslation("password-change");
  const validationSchema = useValidationSchema();
  const router = useRouter();

  const methods = useForm<PasswordChangeFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const params = new URLSearchParams(window.location.search);
    const hash = params.get("hash");
    if (!hash) return;

    const { data, status } = await fetchAuthResetPassword({
      password: formData.password,
      hash,
    });

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(data.errors) as Array<keyof PasswordChangeFormData>).forEach(
        (key) => {
          setError(key, {
            type: "manual",
            message: t(
              `password-change:inputs.${key}.validation.server.${data.errors[key]}`
            ),
          });
        }
      );
      return;
    }

    if (status === HTTP_CODES_ENUM.NO_CONTENT) {
      enqueueSnackbar(t("password-change:alerts.success"), {
        variant: "success",
      });
      router.replace("/sign-in");
    }
  });

  return (
    <FormProvider {...methods}>
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {t("password-change:title")}
            </CardTitle>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <ExpiresAlert />
              <FormTextInput<PasswordChangeFormData>
                name="password"
                label={t("password-change:inputs.password.label")}
                type="password"
                testId="password"
              />
              <FormTextInput<PasswordChangeFormData>
                name="passwordConfirmation"
                label={t("password-change:inputs.passwordConfirmation.label")}
                type="password"
                testId="password-confirmation"
              />
            </CardContent>
            <CardFooter>
              <FormActions />
            </CardFooter>
          </form>
        </Card>
      </div>
    </FormProvider>
  );
}

function PasswordChange() {
  return <Form />;
}

export default withPageRequiredGuest(PasswordChange);
