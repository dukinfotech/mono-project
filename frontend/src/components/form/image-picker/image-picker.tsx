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
import { X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type ImagePickerProps = {
  error?: string;
  onChange: (value: FileEntity | null) => void;
  onBlur: () => void;
  value?: FileEntity;
  disabled?: boolean;
  testId?: string;
  label?: React.ReactNode;
};

function ImagePicker(props: ImagePickerProps) {
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

  const removeImageHandle = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    onChange(null);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center w-full p-4 mt-2 border border-dashed rounded-lg cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/30 hover:border-foreground"
      )}
    >
      {isDragActive && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-lg">
          <p className="text-white font-semibold text-lg">
            {t("common:formInputs.singleImageInput.dropzoneText")}
          </p>
        </div>
      )}

      {props?.value ? (
        <div className="relative w-full max-w-xs overflow-hidden rounded-md">
          <Image
            src={props.value.path}
            alt="uploaded"
            width={400}
            height={250}
            className="object-cover w-full h-64 rounded-md"
          />
          <button
            onClick={removeImageHandle}
            className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 hover:opacity-100 transition-opacity"
          >
            <X className="w-10 h-10 text-white" />
          </button>
        </div>
      ) : null}

      <div className="mt-2">
        <Button
          variant="default"
          asChild
          disabled={isLoading}
          data-testid={props.testId}
          onClick={(e) => e.stopPropagation()}
        >
          <label>
            {isLoading
              ? t("common:loading")
              : t("common:formInputs.singleImageInput.selectFile")}
            <input {...getInputProps()} className="hidden" />
          </label>
        </Button>
      </div>

      <div className="mt-1 text-sm text-muted-foreground">
        {t("common:formInputs.singleImageInput.dragAndDrop")}
      </div>

      {props.error && (
        <div className="mt-1 text-sm text-red-500">{props.error}</div>
      )}
    </div>
  );
}

function FormImagePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue"> & {
    disabled?: boolean;
    testId?: string;
    label?: React.ReactNode;
  }
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <ImagePicker
          onChange={field.onChange}
          onBlur={field.onBlur}
          value={field.value}
          error={fieldState.error?.message}
          disabled={props.disabled}
          testId={props.testId}
          label={props.label}
        />
      )}
    />
  );
}

export default FormImagePicker;
