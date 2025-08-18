"use client";

import { useForm, FormProvider, useFormState } from "react-hook-form";
import { useAuthPatchMeService } from "@/services/api/services/auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useEffect } from "react";
import useAuth from "@/services/auth/use-auth";
import { useSnackbar } from "@/hooks/use-snackbar";
import NextLink from "next/link";
import FormAvatarInput from "@/components/form/avatar-input/form-avatar-input";
import { FileEntity } from "@/services/api/types/file-entity";
import useLeavePage from "@/services/leave-page/use-leave-page";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import { UserProviderEnum } from "@/services/api/types/user";

type EditProfileBasicInfoFormData = {
  firstName: string;
  lastName: string;
  photo?: FileEntity;
};

type EditProfileChangePasswordFormData = {
  oldPassword: string;
  password: string;
  passwordConfirmation: string;
};

type EditProfileChangeEmailFormData = {
  email: string;
  emailConfirmation: string;
};

const useValidationBasicInfoSchema = () => {
  const { t } = useTranslation("profile");

  return yup.object().shape({
    firstName: yup
      .string()
      .required(t("profile:inputs.firstName.validation.required")),
    lastName: yup
      .string()
      .required(t("profile:inputs.lastName.validation.required")),
  });
};

const useValidationChangeEmailSchema = () => {
  const { t } = useTranslation("profile");
  const { user } = useAuth();

  return yup.object().shape({
    email: yup
      .string()
      .notOneOf(
        [user?.email],
        t("profile:inputs.email.validation.currentEmail")
      )
      .email(t("profile:inputs.email.validation.email"))
      .required(t("profile:inputs.email.validation.required")),
    emailConfirmation: yup
      .string()
      .oneOf(
        [yup.ref("email")],
        t("profile:inputs.emailConfirmation.validation.match")
      )
      .required(t("profile:inputs.emailConfirmation.validation.required")),
  });
};

const useValidationChangePasswordSchema = () => {
  const { t } = useTranslation("profile");

  return yup.object().shape({
    oldPassword: yup
      .string()
      .min(6, t("profile:inputs.password.validation.min"))
      .required(t("profile:inputs.password.validation.required")),
    password: yup
      .string()
      .min(6, t("profile:inputs.password.validation.min"))
      .required(t("profile:inputs.password.validation.required")),
    passwordConfirmation: yup
      .string()
      .oneOf(
        [yup.ref("password")],
        t("profile:inputs.passwordConfirmation.validation.match")
      )
      .required(t("profile:inputs.passwordConfirmation.validation.required")),
  });
};

function BasicInfoFormActions() {
  const { t } = useTranslation("profile");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button type="submit" disabled={isSubmitting} data-testid="save-profile">
      {t("profile:actions.submit")}
    </Button>
  );
}

function ChangeEmailFormActions() {
  const { t } = useTranslation("profile");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button type="submit" disabled={isSubmitting} data-testid="save-email">
      {t("profile:actions.submit")}
    </Button>
  );
}

function ChangePasswordFormActions() {
  const { t } = useTranslation("profile");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button type="submit" disabled={isSubmitting} data-testid="save-password">
      {t("profile:actions.submit")}
    </Button>
  );
}

function FormBasicInfo() {
  const { setUser } = useAuthActions();
  const { user } = useAuth();
  const fetchAuthPatchMe = useAuthPatchMeService();
  const { t } = useTranslation("profile");
  const validationSchema = useValidationBasicInfoSchema();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<EditProfileBasicInfoFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      photo: undefined,
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchAuthPatchMe(formData);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (
        Object.keys(data.errors) as Array<keyof EditProfileBasicInfoFormData>
      ).forEach((key) => {
        setError(key, {
          type: "manual",
          message: t(
            `profile:inputs.${key}.validation.server.${data.errors[key]}`
          ),
        });
      });

      return;
    }

    if (status === HTTP_CODES_ENUM.OK) {
      setUser(data);

      enqueueSnackbar(t("profile:alerts.profile.success"), {
        variant: "success",
      });
    }
  });

  useEffect(() => {
    reset({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      photo: user?.photo,
    });
  }, [user, reset]);

  return (
    <FormProvider {...methods}>
      <Card className="max-w-xl mx-auto my-6">
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">{t("profile:title1")}</h2>

            <FormAvatarInput<EditProfileBasicInfoFormData>
              name="photo"
              testId="photo"
            />

            <FormTextInput<EditProfileBasicInfoFormData>
              name="firstName"
              label={t("profile:inputs.firstName.label")}
              testId="first-name"
            />

            <FormTextInput<EditProfileBasicInfoFormData>
              name="lastName"
              label={t("profile:inputs.lastName.label")}
              testId="last-name"
            />

            <div className="flex items-center gap-2">
              <BasicInfoFormActions />
              <Button variant="secondary" asChild>
                <NextLink href="/profile" data-testid="cancel-edit-profile">
                  {t("profile:actions.cancel")}
                </NextLink>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}

function FormChangeEmail() {
  const fetchAuthPatchMe = useAuthPatchMeService();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("profile");
  const validationSchema = useValidationChangeEmailSchema();
  const { user } = useAuth();

  const methods = useForm<EditProfileChangeEmailFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      emailConfirmation: "",
    },
  });

  const { handleSubmit, reset, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchAuthPatchMe({
      email: formData.email,
    });

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (
        Object.keys(data.errors) as Array<keyof EditProfileChangeEmailFormData>
      ).forEach((key) => {
        setError(key, {
          type: "manual",
          message: t(
            `profile:inputs.${key}.validation.server.${data.errors[key]}`
          ),
        });
      });

      return;
    }

    if (status === HTTP_CODES_ENUM.OK) {
      reset();

      enqueueSnackbar(t("profile:alerts.email.success"), {
        variant: "success",
        autoHideDuration: 15000,
      });
    }
  });

  return (
    <FormProvider {...methods}>
      <Card className="max-w-xl mx-auto my-6">
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">{t("profile:title2")}</h2>

            <p className="text-sm text-muted-foreground">{user?.email}</p>

            <FormTextInput<EditProfileChangeEmailFormData>
              name="email"
              label={t("profile:inputs.email.label")}
              type="email"
              testId="email"
            />

            <FormTextInput<EditProfileChangeEmailFormData>
              name="emailConfirmation"
              label={t("profile:inputs.emailConfirmation.label")}
              type="email"
              testId="email-confirmation"
            />

            <div className="flex items-center gap-2">
              <ChangeEmailFormActions />
              <Button variant="secondary" asChild>
                <NextLink href="/profile" data-testid="cancel-edit-email">
                  {t("profile:actions.cancel")}
                </NextLink>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}

function FormChangePassword() {
  const fetchAuthPatchMe = useAuthPatchMeService();
  const { t } = useTranslation("profile");
  const validationSchema = useValidationChangePasswordSchema();
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<EditProfileChangePasswordFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchAuthPatchMe({
      password: formData.password,
      oldPassword: formData.oldPassword,
    });

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (
        Object.keys(data.errors) as Array<
          keyof EditProfileChangePasswordFormData
        >
      ).forEach((key) => {
        setError(key, {
          type: "manual",
          message: t(
            `profile:inputs.${key}.validation.server.${data.errors[key]}`
          ),
        });
      });

      return;
    }

    if (status === HTTP_CODES_ENUM.OK) {
      reset();

      enqueueSnackbar(t("profile:alerts.password.success"), {
        variant: "success",
      });
    }
  });

  return (
    <FormProvider {...methods}>
      <Card className="max-w-xl mx-auto my-6">
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">{t("profile:title3")}</h2>

            <FormTextInput<EditProfileChangePasswordFormData>
              name="oldPassword"
              label={t("profile:inputs.oldPassword.label")}
              type="password"
              testId="old-password"
            />

            <FormTextInput<EditProfileChangePasswordFormData>
              name="password"
              label={t("profile:inputs.password.label")}
              type="password"
              testId="new-password"
            />

            <FormTextInput<EditProfileChangePasswordFormData>
              name="passwordConfirmation"
              label={t("profile:inputs.passwordConfirmation.label")}
              type="password"
              testId="password-confirmation"
            />

            <div className="flex items-center gap-2">
              <ChangePasswordFormActions />
              <Button variant="secondary" asChild>
                <NextLink href="/profile" data-testid="cancel-edit-password">
                  {t("profile:actions.cancel")}
                </NextLink>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}

function FormChangeEmailWrapper() {
  const { user } = useAuth();
  return user?.provider === UserProviderEnum.EMAIL ? <FormChangeEmail /> : null;
}

function FormChangePasswordWrapper() {
  const { user } = useAuth();
  return user?.provider === UserProviderEnum.EMAIL ? (
    <FormChangePassword />
  ) : null;
}

function EditProfile() {
  return (
    <>
      <FormBasicInfo />
      <Separator className="my-8" />
      <FormChangeEmailWrapper />
      <Separator className="my-8" />
      <FormChangePasswordWrapper />
    </>
  );
}

export default withPageRequiredAuth(EditProfile);
