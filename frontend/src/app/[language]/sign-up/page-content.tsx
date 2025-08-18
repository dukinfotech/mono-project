"use client";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import {
  useAuthLoginService,
  useAuthSignUpService,
} from "@/services/api/services/auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import FormTextInput from "@/components/form/text-input/form-text-input";
import FormCheckboxInput from "@/components/form/checkbox/form-checkbox";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import NextLink from "next/link";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import SocialAuth from "@/services/social-auth/social-auth";
import { isGoogleAuthEnabled } from "@/services/social-auth/google/google-config";
import { isFacebookAuthEnabled } from "@/services/social-auth/facebook/facebook-config";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type TPolicy = {
  id: string;
  name: string;
};

type SignUpFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  policy: TPolicy[];
};

const useValidationSchema = () => {
  const { t } = useTranslation("sign-up");

  return yup.object().shape({
    firstName: yup
      .string()
      .required(t("sign-up:inputs.firstName.validation.required")),
    lastName: yup
      .string()
      .required(t("sign-up:inputs.lastName.validation.required")),
    email: yup
      .string()
      .email(t("sign-up:inputs.email.validation.invalid"))
      .required(t("sign-up:inputs.email.validation.required")),
    password: yup
      .string()
      .min(6, t("sign-up:inputs.password.validation.min"))
      .required(t("sign-up:inputs.password.validation.required")),
    policy: yup
      .array()
      .min(1, t("sign-up:inputs.policy.validation.required"))
      .required(),
  });
};

function FormActions() {
  const { t } = useTranslation("sign-up");
  const { isSubmitting } = useFormState();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      data-testid="sign-up-submit"
      className="w-full"
    >
      {t("sign-up:actions.submit")}
    </Button>
  );
}

function Form() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const fetchAuthLogin = useAuthLoginService();
  const fetchAuthSignUp = useAuthSignUpService();
  const { t } = useTranslation("sign-up");
  const validationSchema = useValidationSchema();
  const policyOptions = [
    { id: "policy", name: t("sign-up:inputs.policy.agreement") },
  ];

  const methods = useForm<SignUpFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      policy: [],
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data: dataSignUp, status: statusSignUp } =
      await fetchAuthSignUp(formData);

    if (statusSignUp === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(dataSignUp.errors) as Array<keyof SignUpFormData>).forEach(
        (key) => {
          setError(key, {
            type: "manual",
            message: t(
              `sign-up:inputs.${key}.validation.server.${dataSignUp.errors[key]}`
            ),
          });
        }
      );

      return;
    }

    const { data: dataSignIn, status: statusSignIn } = await fetchAuthLogin({
      email: formData.email,
      password: formData.password,
    });

    if (statusSignIn === HTTP_CODES_ENUM.OK) {
      setTokensInfo({
        token: dataSignIn.token,
        refreshToken: dataSignIn.refreshToken,
        tokenExpires: dataSignIn.tokenExpires,
      });
      setUser(dataSignIn.user);
    }
  });

  return (
    <FormProvider {...methods}>
      <div className="flex justify-center items-center min-h-[80vh]">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg shadow p-8"
        >
          <h1 className="text-2xl font-semibold mb-6">{t("sign-up:title")}</h1>
          <div className="space-y-4">
            <FormTextInput<SignUpFormData>
              name="firstName"
              label={t("sign-up:inputs.firstName.label")}
              type="text"
              autoFocus
              testId="first-name"
            />
            <FormTextInput<SignUpFormData>
              name="lastName"
              label={t("sign-up:inputs.lastName.label")}
              type="text"
              testId="last-name"
            />
            <FormTextInput<SignUpFormData>
              name="email"
              label={t("sign-up:inputs.email.label")}
              type="email"
              testId="email"
            />
            <FormTextInput<SignUpFormData>
              name="password"
              label={t("sign-up:inputs.password.label")}
              type="password"
              testId="password"
            />
            <FormCheckboxInput
              name="policy"
              label=""
              testId="privacy"
              options={policyOptions}
              keyValue="id"
              keyExtractor={(option) => option.id.toString()}
              renderOption={(option) => (
                <span>
                  {option.name}{" "}
                  <NextLink
                    href="/privacy-policy"
                    target="_blank"
                    className="underline text-blue-600"
                  >
                    {t("sign-up:inputs.policy.label")}
                  </NextLink>
                </span>
              )}
            />
            <FormActions />
            <Button
              variant="outline"
              asChild
              className="w-full mt-2"
              data-testid="login"
            >
              <NextLink href="/sign-in">
                {t("sign-up:actions.accountAlreadyExists")}
              </NextLink>
            </Button>
            {[isGoogleAuthEnabled, isFacebookAuthEnabled].some(Boolean) && (
              <>
                <div className="flex items-center my-4">
                  <Separator className="flex-1" />
                  <span className="mx-2 text-xs text-muted-foreground">
                    {t("sign-up:or")}
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

function SignUp() {
  return <Form />;
}

export default withPageRequiredGuest(SignUp);