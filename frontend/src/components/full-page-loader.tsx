import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

type FullPageLoaderType = {
  isLoading: boolean;
};

export function FullPageLoader({ isLoading }: FullPageLoaderType) {
  return (
    <Dialog open={isLoading}>
      <DialogContent className="flex flex-col items-center justify-center bg-transparent shadow-none border-none">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
      </DialogContent>
    </Dialog>
  );
}