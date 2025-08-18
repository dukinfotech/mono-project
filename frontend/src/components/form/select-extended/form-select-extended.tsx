"use client";

import React, { Ref, useState, useRef, useEffect } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Virtuoso, ItemProps, ListProps } from "react-virtuoso";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type SelectExtendedInputProps<T extends object> = {
  label: string;
  error?: string;
  testId?: string;
  disabled?: boolean;
  options: T[];
  renderSelected: (option: T) => React.ReactNode;
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

const ShadcnComponents = {
  List: function ListWrapper({
    style,
    children,
    ref,
  }: ListProps & { ref?: Ref<HTMLDivElement> }) {
    return (
      <div
        ref={ref}
        style={{ padding: 0, margin: 0, ...style }}
        className="flex flex-col"
      >
        {children}
      </div>
    );
  },

  Item: ({ children, ...props }: ItemProps<unknown>) => {
    return (
      <div {...props} className="flex w-full items-center">
        {children}
      </div>
    );
  },
};

function SelectExtendedInput<T extends object>(
  props: SelectExtendedInputProps<T> & {
    name: string;
    value: T | undefined | null;
    onChange: (value: T) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // đóng khi click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="w-full">
      <div className="mb-1">
        <Label htmlFor={props.name}>{props.label}</Label>
        <Input
          ref={inputRef}
          id={props.name}
          name={props.name}
          value={props.value ? (props.renderOption(props.value) as string) : ""}
          onBlur={props.onBlur}
          readOnly
          disabled={props.disabled}
          data-testid={props.testId}
          onClick={() => {
            if (!props.disabled) setIsOpen((prev) => !prev);
          }}
          className={cn(props.error && "border-red-500")}
        />
        {props.error && (
          <p
            className="text-sm text-red-500 mt-1"
            data-testid={`${props.testId}-error`}
          >
            {props.error}
          </p>
        )}
      </div>

      {isOpen && (
        <Card className="mt-2 shadow-lg">
          <CardContent className="p-0">
            {props.isSearchable && (
              <div className="p-2">
                <Label>{props.searchLabel}</Label>
                <Input
                  placeholder={props.searchPlaceholder}
                  value={props.search}
                  onChange={(e) => props.onSearchChange?.(e.target.value)}
                  autoFocus
                  data-testid={`${props.testId}-search`}
                />
              </div>
            )}

            <Virtuoso
              style={{
                height:
                  props.options.length <= 6 ? props.options.length * 48 : 320,
              }}
              data={props.options}
              endReached={props.onEndReached}
              components={ShadcnComponents}
              itemContent={(index, item) => (
                <button
                  type="button"
                  className={cn(
                    "w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground",
                    props.value &&
                      props.keyExtractor(item) ===
                        props.keyExtractor(props.value) &&
                      "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    props.onChange(item);
                    setIsOpen(false);
                  }}
                >
                  {item ? props.renderOption(item) : null}
                </button>
              )}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FormSelectExtendedInput<
  TFieldValues extends FieldValues = FieldValues,
  T extends object = object,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue"> &
    SelectExtendedInputProps<T>
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <SelectExtendedInput<T>
          {...field}
          isSearchable={props.isSearchable}
          label={props.label}
          error={fieldState.error?.message}
          disabled={props.disabled}
          testId={props.testId}
          options={props.options}
          renderSelected={props.renderSelected}
          renderOption={props.renderOption}
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

export default FormSelectExtendedInput;
