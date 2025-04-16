
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Summary, SummaryHistory, SummaryParams } from "@/types";
import { summaryService } from "@/services/summary";
import { useToast } from "@/components/ui/use-toast";

interface SummaryContextType extends SummaryHistory {
  summarizeText: (params: SummaryParams) => Promise<Summary>;
  deleteSummary: (id: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

const initialState: SummaryHistory = {
  summaries: [],
  isLoading: false,
};

const SummaryContext = createContext<SummaryContextType | undefined>(undefined);

export function SummaryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SummaryHistory>(initialState);
  const { toast } = useToast();

  // Load summaries on initial load
  useEffect(() => {
    refreshHistory();
  }, []);

  const refreshHistory = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const summaries = await summaryService.getSummaryHistory();
      setState({
        summaries,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      toast({
        title: "Failed to load summaries",
        description: "There was an error loading your summary history.",
        variant: "destructive",
      });
    }
  };

  const summarizeText = async (params: SummaryParams) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const summary = await summaryService.summarizeText(params);
      await refreshHistory();
      return summary;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      toast({
        title: "Summarization failed",
        description: "There was an error generating the summary.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSummary = async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await summaryService.deleteSummary(id);
      await refreshHistory();
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      toast({
        title: "Delete failed",
        description: "There was an error deleting the summary.",
        variant: "destructive",
      });
    }
  };

  const value = {
    ...state,
    summarizeText,
    deleteSummary,
    refreshHistory,
  };

  return <SummaryContext.Provider value={value}>{children}</SummaryContext.Provider>;
}

export function useSummary() {
  const context = useContext(SummaryContext);
  if (context === undefined) {
    throw new Error("useSummary must be used within a SummaryProvider");
  }
  return context;
}
