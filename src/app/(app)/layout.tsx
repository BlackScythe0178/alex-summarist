import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/layout/SearchBar";

/** Shared shell for every page except / and /choose-plan. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <Sidebar />
      <div className="wrapper">
        <SearchBar />
        {children}
      </div>
    </div>
  );
}
