"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { useAuthLoginService } from "@/services/api/services/auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import NextLink from "next/link";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import SocialAuth from "@/services/social-auth/social-auth";
import { isGoogleAuthEnabled } from "@/services/social-auth/google/google-config";
import { isFacebookAuthEnabled } from "@/services/social-auth/facebook/facebook-config";
import { IS_SIGN_UP_ENABLED } from "@/services/auth/config";

type SignInFormData = {
  email: string;
  password: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("sign-in");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("sign-in:inputs.email.validation.invalid"))
      .required(t("sign-in:inputs.email.validation.required")),
    password: yup
      .string()
      .min(6, t("sign-in:inputs.password.validation.min"))
      .required(t("sign-in:inputs.password.validation.required")),
  });
};

function FormActions() {
  const { t } = useTranslation("sign-in");
  const { isSubmitting } = useFormState();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      data-testid="sign-in-submit"
      className="w-full"
    >
      {t("sign-in:actions.submit")}
    </Button>
  );
}

function Form() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const fetchAuthLogin = useAuthLoginService();
  const { t } = useTranslation("sign-in");
  const validationSchema = useValidationSchema();

  const methods = useForm<SignInFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchAuthLogin(formData);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(data.errors) as Array<keyof SignInFormData>).forEach(
        (key) => {
          setError(key, {
            type: "manual",
            message: t(
              `sign-in:inputs.${key}.validation.server.${data.errors[key]}`
            ),
          });
        }
      );

      return;
    }

    if (status === HTTP_CODES_ENUM.OK) {
      setTokensInfo({
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpires: data.tokenExpires,
      });
      setUser(data.user);
    }
  });

  return (
    <FormProvider {...methods}>
      <div className="flex justify-center items-center min-h-[80vh]">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg shadow p-8"
        >
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2">
              {t("sign-in:title")}
            </h1>
          </div>
          <div className="space-y-4">
            <FormTextInput<SignInFormData>
              name="email"
              label={t("sign-in:inputs.email.label")}
              type="email"
              testId="email"
              autoFocus
            />
            <FormTextInput<SignInFormData>
              name="password"
              label={t("sign-in:inputs.password.label")}
              type="password"
              testId="password"
            />
            <div className="flex justify-end">
              <NextLink
                href="/forgot-password"
                data-testid="forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                {t("sign-in:actions.forgotPassword")}
              </NextLink>
            </div>
            <FormActions />
            {IS_SIGN_UP_ENABLED && (
              <Button
                variant="outline"
                asChild
                className="w-full mt-2"
                data-testid="create-account"
              >
                <NextLink href="/sign-up">
                  {t("sign-in:actions.createAccount")}
                </NextLink>
              </Button>
            )}
            {[isGoogleAuthEnabled, isFacebookAuthEnabled].some(Boolean) && (
              <>
                <div className="flex items-center my-4">
                  <Separator className="flex-1" />
                  <span className="mx-2 text-xs text-muted-foreground">
                    {t("sign-in:or")}
                  </span>
                  <Separator className="flex-1" />
                </div>
                <SocialAuth />
              </>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

function SignIn() {
  return <Form />;
}

export default withPageRequiredGuest(SignIn);