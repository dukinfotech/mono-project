"use client";

import React, { Ref, useState, useRef, useEffect } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type MultipleSelectExtendedInputProps<T extends object> = {
  label: string;
  error?: string;
  testId?: string;
  disabled?: boolean;
  options: T[];
  renderSelected: (option: T[]) => React.ReactNode;
  renderOption: (option: T) => React.ReactNode;
  keyExtractor: (option: T) => string;
  onEndReached?: () => void;
} & (
  | {
      isSearchable: true;
      searchLabel: string;
      searchPlaceholder: string;
      search: string;
      onSearchChange: (search: string) => void;
    }
  | {
      isSearchable?: false;
    }
);

function MultipleSelectExtendedInput<T extends object>(
  props: MultipleSelectExtendedInputProps<T> & {
    name: string;
    value: T[] | null;
    onChange: (value: T[]) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  const [isOpen, setIsOpen] = useState(false);
  const boxRef = useRef<HTMLInputElement | null>(null);

  const valueKeys = props.value?.map(props.keyExtractor) ?? [];

  useEffect(() => {
    if (isOpen) {
      boxRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen]);

  return (
    <div className="w-full" ref={boxRef}>
      <div className="mb-1">
        <Label htmlFor={props.name}>{props.label}</Label>
        <Input
          ref={props.ref as any}
          id={props.name}
          name={props.name}
          value={props.value ? (props.renderSelected(props.value) as any) : ""}
          onBlur={props.onBlur}
          onClick={() => {
            if (props.disabled) return;
            setIsOpen((prev) => !prev);
          }}
          readOnly
          disabled={props.disabled}
          data-testid={props.testId}
          className={cn(props.error && "border-red-500")}
        />
        {props.error && (
          <p
            className="mt-1 text-sm text-red-500"
            data-testid={`${props.testId}-error`}
          >
            {props.error}
          </p>
        )}
      </div>

      {isOpen && (
        <Card className="w-full mt-2">
          <CardContent className="p-0">
            {props.isSearchable && (
              <div className="p-2">
                <Label htmlFor={`${props.name}-search`}>
                  {props.searchLabel}
                </Label>
                <Input
                  id={`${props.name}-search`}
                  placeholder={props.searchPlaceholder}
                  value={props.search}
                  onChange={(e) => props.onSearchChange?.(e.target.value)}
                  autoFocus
                  data-testid={`${props.testId}-search`}
                />
              </div>
            )}

            <ScrollArea
              className={cn(
                "max-h-80",
                props.options.length <= 6
                  ? `h-[${props.options.length * 48}px]`
                  : "h-80"
              )}
            >
              <div className="flex flex-col">
                {props.options.map((item) => {
                  const isSelected = valueKeys.includes(props.keyExtractor(item));
                  return (
                    <button
                      key={props.keyExtractor(item)}
                      type="button"
                      className={cn(
                        "px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => {
                        const newValue = props.value
                          ? isSelected
                            ? props.value.filter(
                                (selectedItem) =>
                                  props.keyExtractor(selectedItem) !==
                                  props.keyExtractor(item)
                              )
                            : [...props.value, item]
                          : [item];
                        props.onChange(newValue);
                      }}
                    >
                      {props.renderOption(item)}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FormMultipleSelectExtendedInput<
  TFieldValues extends FieldValues = FieldValues,
  T extends object = object,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue"> &
    MultipleSelectExtendedInputProps<T>
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <MultipleSelectExtendedInput<T>
          {...field}
          isSearchable={props.isSearchable}
          label={props.label}
          error={fieldState.error?.message}
          disabled={props.disabled}
          testId={props.testId}
          options={props.options}
          renderOption={props.renderOption}
          renderSelected={props.renderSelected}
          keyExtractor={props.keyExtractor}
          search={props.isSearchable ? props.search : ""}
          onSearchChange={
            props.isSearchable ? props.onSearchChange : () => undefined
          }
          onEndReached={props.isSearchable ? props.onEndReached : undefined}
          searchLabel={props.isSearchable ? props.searchLabel : ""}
          searchPlaceholder={props.isSearchable ? props.searchPlaceholder : ""}
        />
      )}
    />
  );
}

export default FormMultipleSelectExtendedInput;
