"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "donorix_disclaimer_v1_seen";
const DISCLAIMER_EVENT = "donorix:disclaimer-seen";

export function DisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  const handleContinue = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    window.dispatchEvent(new CustomEvent(DISCLAIMER_EVENT));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Important Disclaimer</DialogTitle>
          <DialogDescription>
            Donorix is a blood donor matching platform, not a medical service.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>We connect donors and recipients but do not guarantee donor availability or blood safety.</li>
          <li>In a life-threatening emergency, call 112 or your nearest hospital immediately.</li>
          <li>All medical decisions should be made with qualified healthcare professionals.</li>
          <li>By using Donorix, you agree to our Terms of Use and Privacy Policy.</li>
        </ul>
        <DialogFooter>
          <Button onClick={handleContinue}>I Understand - Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
