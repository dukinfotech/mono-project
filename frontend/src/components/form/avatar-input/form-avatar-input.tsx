"use client";

import { useFileUploadService } from "@/services/api/services/files";
import { FileEntity } from "@/services/api/types/file-entity";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export type AvatarInputProps = {
  error?: string;
  onChange: (value: FileEntity | null) => void;
  onBlur: () => void;
  value?: FileEntity;
  disabled?: boolean;
  testId?: string;
};

function AvatarInput(props: AvatarInputProps) {
  const { onChange } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const fetchFileUpload = useFileUploadService();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsLoading(true);
      const { status, data } = await fetchFileUpload(acceptedFiles[0]);
      if (status === HTTP_CODES_ENUM.CREATED) {
        onChange(data.file);
      }
      setIsLoading(false);
    },
    [fetchFileUpload, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/jpg": [],
      "image/webp": [],
    },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 2, // 2MB
    disabled: isLoading || props.disabled,
  });

  const removeAvatarHandle = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    onChange(null);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center relative p-4 mt-4 border border-dashed rounded-md cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/30 hover:border-foreground"
      )}
    >
      {isDragActive && (
        <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
          <p className="text-white font-bold text-lg">
            {t("common:formInputs.avatarInput.dropzoneText")}
          </p>
        </div>
      )}

      {props?.value ? (
        <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden group">
          <img
            src={props.value?.path}
            alt="avatar"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={removeAvatarHandle}
              className="p-2 rounded-full hover:bg-white/20"
            >
              <X className="w-10 h-10 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-[100px] h-[100px] rounded-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">No avatar</span>
        </div>
      )}

      <div className="mt-2">
        <Button
          variant="default"
          size="sm"
          disabled={isLoading}
          data-testid={props.testId}
          onClick={(e) => e.stopPropagation()}
          asChild
        >
          <label>
            {isLoading
              ? t("common:loading")
              : t("common:formInputs.avatarInput.selectFile")}
            <input {...getInputProps()} hidden />
          </label>
        </Button>
      </div>

      <div className="mt-1">
        <p className="text-sm text-muted-foreground">
          {t("common:formInputs.avatarInput.dragAndDrop")}
        </p>
      </div>

      {props.error && (
        <p className="mt-1 text-sm text-red-500">{props.error}</p>
      )}
    </div>
  );
}

function FormAvatarInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue"> & {
    disabled?: boolean;
    testId?: string;
  }
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <AvatarInput
          onChange={field.onChange}
          onBlur={field.onBlur}
          value={field.value}
          error={fieldState.error?.message}
          disabled={props.disabled}
          testId={props.testId}
        />
      )}
    />
  );
}

export default FormAvatarInput;
