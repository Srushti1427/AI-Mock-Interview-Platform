"use client";
import React, { useEffect, useState, useContext } from "react";
import { AdminContext } from "../_components/AdminLayoutClient";
import DataTable from "../_components/DataTable";
import { BookOpen } from "lucide-react";

const AdminAptitude = () => {
  const { userEmail } = useContext(AdminContext);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          email: userEmail,
          page: page.toString(),
          limit: "15",
        });
        if (search) params.set("userEmail", search);

        const res = await fetch(`/api/admin/aptitude?${params}`);
        if (res.ok) {
          const data = await res.json();
          setTests(data.tests);
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        console.error("Failed to fetch aptitude tests:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) fetchTests();
  }, [userEmail, page, search]);

  const getDifficultyColor = (diff) => {
    const d = (diff || "").toLowerCase();
    if (d === "easy")
      return "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30";
    if (d === "medium")
      return "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30";
    if (d === "hard")
      return "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20 border-rose-200 dark:border-rose-500/30";
    return "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/20 border-slate-200 dark:border-slate-500/30";
  };

  const columns = [
    {
      header: "User",
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-300 text-sm">{row.createdBy}</span>
      ),
    },
    {
      header: "Topic",
      render: (row) => (
        <span className="text-slate-800 dark:text-white font-medium text-sm">{row.topic}</span>
      ),
    },
    {
      header: "Difficulty",
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border capitalize ${getDifficultyColor(
            row.difficulty
          )}`}
        >
          {row.difficulty}
        </span>
      ),
    },
    {
      header: "Date",
      render: (row) => (
        <span className="text-slate-500 text-xs">{row.createdAt}</span>
      ),
    },
    {
      header: "Mock ID",
      render: (row) => (
        <span className="text-slate-600 text-xs font-mono">
          {row.mockId?.substring(0, 8)}...
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          Aptitude Tests
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Review aptitude tests taken by all users
        </p>
      </div>

      <DataTable
        columns={columns}
        data={tests}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by user email..."
        emptyMessage="No aptitude tests found"
      />
    </div>
  );
};

export default AdminAptitude;
