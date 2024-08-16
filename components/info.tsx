import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export default function Info({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoCircledIcon className="w-4 h-4 cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent className="w-[12rem]">{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
