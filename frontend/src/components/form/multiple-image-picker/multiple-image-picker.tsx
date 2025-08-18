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
import { cn } from "@/lib/utils";

export type MultipleImagePickerProps = {
  error?: string;
  onChange: (value: FileEntity[] | null) => void;
  onBlur: () => void;
  value?: FileEntity[];
  disabled?: boolean;
  testId?: string;
  label?: React.ReactNode;
};

function MultipleImagePicker(props: MultipleImagePickerProps) {
  const { onChange, value } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const fetchFileUpload = useFileUploadService();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsLoading(true);
      const { status, data } = await fetchFileUpload(acceptedFiles[0]);
      if (status === HTTP_CODES_ENUM.CREATED) {
        onChange([...(value ?? []), data.file]);
      }
      setIsLoading(false);
    },
    [fetchFileUpload, onChange, value]
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

  const removeImageHandle =
    (id: FileEntity["id"]) =>
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      onChange(value?.filter((item) => item.id !== id) ?? []);
    };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center p-4 mt-2 border border-dashed rounded-md cursor-pointer transition-colors",
        "hover:border-foreground",
        props.disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {isDragActive && (
        <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
          <p className="text-white font-bold text-lg">
            {t("common:formInputs.multipleImageInput.dropzoneText")}
          </p>
        </div>
      )}

      {props?.value?.length ? (
        <div className="grid grid-cols-3 gap-2 w-full">
          {props.value.map((item) => (
            <div key={item.id} className="relative group h-60 overflow-hidden">
              <img
                src={item.path}
                loading="lazy"
                className="object-cover w-full h-full rounded-md"
              />
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={removeImageHandle(item.id)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition"
                >
                  <X className="w-10 h-10 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4">
        <Button
          variant="default"
          disabled={isLoading}
          data-testid={props.testId}
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading
            ? t("common:loading")
            : t("common:formInputs.multipleImageInput.selectFile")}
          <input {...getInputProps()} className="hidden" />
        </Button>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {t("common:formInputs.multipleImageInput.dragAndDrop")}
      </p>

      {props.error && (
        <p className="mt-1 text-sm text-red-500">{props.error}</p>
      )}
    </div>
  );
}

function FormMultipleImagePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
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
        <MultipleImagePicker
          onChange={field.onChange}
          onBlur={field.onBlur}
          value={field.value}
          error={fieldState.error?.message}
          disabled={props.disabled}
          label={props.label}
          testId={props.testId}
        />
      )}
    />
  );
}

export default FormMultipleImagePicker;
