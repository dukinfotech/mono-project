"use client";

import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { useAuthForgotPasswordService } from "@/services/api/services/auth";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "@/hooks/use-snackbar";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

type ForgotPasswordFormData = {
  email: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("forgot-password");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("forgot-password:inputs.email.validation.invalid"))
      .required(t("forgot-password:inputs.email.validation.required")),
  });
};

function FormActions() {
  const { t } = useTranslation("forgot-password");
  const { isSubmitting } = useFormState();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      data-testid="send-email"
      className="w-full"
    >
      {t("forgot-password:actions.submit")}
    </Button>
  );
}

function Form() {
  const { enqueueSnackbar } = useSnackbar();
  const fetchAuthForgotPassword = useAuthForgotPasswordService();
  const { t } = useTranslation("forgot-password");
  const validationSchema = useValidationSchema();

  const methods = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchAuthForgotPassword(formData);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(data.errors) as Array<keyof ForgotPasswordFormData>).forEach(
        (key) => {
          setError(key, {
            type: "manual",
            message: t(
              `forgot-password:inputs.${key}.validation.server.${data.errors[key]}`
            ),
          });
        }
      );
      return;
    }

    if (status === HTTP_CODES_ENUM.NO_CONTENT) {
      enqueueSnackbar(t("forgot-password:alerts.success"), {
        variant: "success",
      });
    }
  });

  return (
    <FormProvider {...methods}>
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {t("forgot-password:title")}
            </CardTitle>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <FormTextInput<ForgotPasswordFormData>
                name="email"
                label={t("forgot-password:inputs.email.label")}
                type="email"
                testId="email"
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

function ForgotPassword() {
  return <Form />;
}

export default withPageRequiredGuest(ForgotPassword);
