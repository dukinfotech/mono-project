"use client";
import React, { ChangeEvent, Ref, useState } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type TextInputProps = {
  label: string;
  type?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId?: string;
  autoComplete?: string;
  multiline?: boolean;
  minRows?: number;
  maxRows?: number;
  size?: "small" | "medium";
};

function TextInput(
  props: TextInputProps & {
    name: string;
    value: string;
    onChange: (
      value: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onBlur: () => void;
    ref?: Ref<HTMLInputElement | HTMLTextAreaElement>;
  }
) {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const inputType =
    props.type === "password" && isShowPassword ? "text" : props.type;

  const handleTogglePassword = () => setIsShowPassword((show) => !show);

  const InputComponent = props.multiline ? "textarea" : Input;

  return (
    <div className="w-full">
      <Label htmlFor={props.name} className="mb-1 block">
        {props.label}
      </Label>
      <div className="relative">
        <InputComponent
          ref={props.ref as any}
          id={props.name}
          name={props.name}
          type={props.multiline ? undefined : inputType}
          value={props.value}
          onChange={props.onChange}
          onBlur={props.onBlur}
          autoFocus={props.autoFocus}
          disabled={props.disabled}
          readOnly={props.readOnly}
          autoComplete={props.autoComplete}
          data-testid={props.testId}
          rows={props.multiline ? props.minRows || 3 : undefined}
          className={cn(
            "w-full pr-10",
            props.error && "border-destructive focus-visible:ring-destructive",
            props.multiline && "min-h-[90px] resize-y"
          )}
        />
        {props.type === "password" && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label="toggle password visibility"
            onClick={handleTogglePassword}
          >
            {isShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {props.error && (
        <p
          className="mt-1 text-xs text-destructive"
          data-testid={`${props.testId}-error`}
        >
          {props.error}
        </p>
      )}
    </div>
  );
}

function FormTextInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue"> &
    TextInputProps
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <TextInput
          {...field}
          label={props.label}
          autoFocus={props.autoFocus}
          type={props.type}
          error={fieldState.error?.message}
          disabled={props.disabled}
          readOnly={props.readOnly}
          testId={props.testId}
          multiline={props.multiline}
          minRows={props.minRows}
          maxRows={props.maxRows}
          size={props.size}
        />
      )}
    />
  );
}

export default FormTextInput;