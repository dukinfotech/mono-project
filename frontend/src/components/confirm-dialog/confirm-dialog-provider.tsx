"use client";

import { Button } from "@/components/ui/button"
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import {
  ConfirmDialogActionsContext,
  ConfirmDialogOptions,
} from "./confirm-dialog-context";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/services/i18n/client";

function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation("confirm-dialog");

  const defaultConfirmDialogInfo = useMemo<ConfirmDialogOptions>(
    () => ({
      title: t("title"),
      message: t("message"),
      successButtonText: t("actions.yes"),
      cancelButtonText: t("actions.no"),
    }),
    [t]
  );

  const [confirmDialogInfo, setConfirmDialogInfo] =
    useState<ConfirmDialogOptions>(defaultConfirmDialogInfo);
  const resolveRef = useRef<(value: boolean) => void>(undefined);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const onCancel = () => {
    setIsOpen(false);
    resolveRef.current?.(false);
  };

  const onSuccess = () => {
    setIsOpen(false);
    resolveRef.current?.(true);
  };

  const confirmDialog = useCallback(
    (options: Partial<ConfirmDialogOptions> = {}) => {
      return new Promise<boolean>((resolve) => {
        setConfirmDialogInfo({
          ...defaultConfirmDialogInfo,
          ...options,
        });
        setIsOpen(true);
        resolveRef.current = resolve;
      });
    },
    [defaultConfirmDialogInfo]
  );

  const contextActions = useMemo(
    () => ({
      confirmDialog,
    }),
    [confirmDialog]
  );

  return (
    <>
      <ConfirmDialogActionsContext.Provider value={contextActions}>
        {children}
      </ConfirmDialogActionsContext.Provider>
      <Dialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {confirmDialogInfo.title}
        </DialogTitle>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription id="alert-dialog-description">
              {confirmDialogInfo.message}</DialogDescription>
          </DialogHeader>
        </DialogContent>
        < DialogFooter>
          <Button onClick={onCancel} asChild>
            {confirmDialogInfo.cancelButtonText}
          </Button>
          <Button onClick={onSuccess} asChild autoFocus>
            {confirmDialogInfo.successButtonText}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default ConfirmDialogProvider;
