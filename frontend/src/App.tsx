import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { AddProblemPage } from "@/pages/AddProblemPage";
import { ProgressPage } from "@/pages/ProgressPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/add" element={<AddProblemPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
