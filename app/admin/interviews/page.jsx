"use client";
import React, { useEffect, useState, useContext } from "react";
import { AdminContext } from "../_components/AdminLayoutClient";
import DataTable from "../_components/DataTable";
import { MessageSquare, Eye, Star } from "lucide-react";
import { useRouter } from "next/navigation";

const AdminInterviews = () => {
  const { userEmail } = useContext(AdminContext);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          email: userEmail,
          page: page.toString(),
          limit: "15",
        });
        if (search) params.set("userEmail", search);

        const res = await fetch(`/api/admin/interviews?${params}`);
        if (res.ok) {
          const data = await res.json();
          setInterviews(data.interviews);
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        console.error("Failed to fetch interviews:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) fetchInterviews();
  }, [userEmail, page, search]);

  const columns = [
    {
      header: "User",
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-300 text-sm">{row.createdBy}</span>
      ),
    },
    {
      header: "Position",
      render: (row) => (
        <span className="text-slate-800 dark:text-white font-medium text-sm">
          {row.jobPosition}
        </span>
      ),
    },
    {
      header: "Experience",
      render: (row) => (
        <span className="text-slate-500 dark:text-slate-400 text-sm">{row.jobExperience} yrs</span>
      ),
    },
    {
      header: "Questions",
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-500/30">
          {row.questionCount}
        </span>
      ),
    },
    {
      header: "Avg Rating",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Star
            className={`w-3.5 h-3.5 ${
              parseFloat(row.avgRating) > 0
                ? "text-amber-400 fill-amber-400"
                : "text-slate-600"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              parseFloat(row.avgRating) > 0 ? "text-amber-400" : "text-slate-600"
            }`}
          >
            {parseFloat(row.avgRating) > 0 ? row.avgRating : "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Date",
      render: (row) => (
        <span className="text-slate-500 text-xs">{row.createdAt}</span>
      ),
    },
    {
      header: "",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/interviews/${row.mockId}`);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          All Interviews
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Review mock interviews across all users
        </p>
      </div>

      <DataTable
        columns={columns}
        data={interviews}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by user email or position..."
        emptyMessage="No interviews found"
        onRowClick={(row) => router.push(`/admin/interviews/${row.mockId}`)}
      />
    </div>
  );
};

export default AdminInterviews;
