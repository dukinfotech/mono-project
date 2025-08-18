"use client";

import { PropsWithChildren, useContext, useMemo, useState } from "react";
import { Button } from "@/components/ui/button"
import {
  LeavePageActionsContext,
  LeavePageContext,
  LeavePageContextParamsType,
  LeavePageInfoContext,
  LeavePageModalContext,
} from "./leave-page-context";
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog"

// Need for leave page logic
// eslint-disable-next-line no-restricted-imports
import NextLink from "next/link";
import { useTranslation } from "../i18n/client";

function Provider(props: PropsWithChildren<{}>) {
  const [isOpen, setIsOpen] = useState(false);
  const [leavePage, setLeavePage] = useState<LeavePageContextParamsType>(null);
  const [leavePageCounter, setIsLeavePage] = useState(0);

  const contextModalValue = useMemo(
    () => ({
      isOpen,
    }),
    [isOpen]
  );

  const contextValue = useMemo(
    () => ({
      isLeavePage: leavePageCounter !== 0,
    }),
    [leavePageCounter]
  );

  const contextInfoValue = useMemo(
    () => ({
      leavePage,
    }),
    [leavePage]
  );

  const contextActionsValue = useMemo(
    () => ({
      trackLeavePage: () => {
        setIsLeavePage((prevValue) => prevValue + 1);
      },
      setLeavePage: (params: LeavePageContextParamsType) => {
        setLeavePage(params);
      },
      untrackLeavePage: () => {
        setLeavePage(null);
        setIsLeavePage((prevValue) => prevValue - 1);
      },
      openModal: () => {
        setIsOpen(true);
      },
      closeModal: () => {
        setIsOpen(false);
      },
    }),
    []
  );

  return (
    <LeavePageContext.Provider value={contextValue}>
      <LeavePageModalContext.Provider value={contextModalValue}>
        <LeavePageActionsContext.Provider value={contextActionsValue}>
          <LeavePageInfoContext.Provider value={contextInfoValue}>
            {props.children}
          </LeavePageInfoContext.Provider>
        </LeavePageActionsContext.Provider>
      </LeavePageModalContext.Provider>
    </LeavePageContext.Provider>
  );
}

function Modal() {
  const { t } = useTranslation("common");
  const { isOpen } = useContext(LeavePageModalContext);
  const { leavePage } = useContext(LeavePageInfoContext);
  const { closeModal } = useContext(LeavePageActionsContext);

  const href = (leavePage?.push ?? leavePage?.replace) || "";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={closeModal}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      data-testid="want-to-leave-modal"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle id="alert-dialog-title">
            {t("common:leavePage.title")}
          </DialogTitle>
          <DialogDescription id="alert-dialog-description">
          {t("common:leavePage.message")}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
      <DialogFooter>
        <DialogClose
          asChild
          autoFocus
          data-testid="stay"
        >
          {t("common:leavePage.stay")}
        </DialogClose>
        <Button
          onClick={closeModal}
          data-testid="leave"
        > 
        <NextLink href={href} replace={!!leavePage?.replace}>
          {t("common:leavePage.leave")}
          </NextLink>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default function LeavePageProvider(props: PropsWithChildren<{}>) {
  return (
    <Provider>
      {props.children}
      <Modal />
    </Provider>
  );
}
