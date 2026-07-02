"use client";
import React, { useEffect, useState, useContext } from "react";
import { AdminContext } from "../_components/AdminLayoutClient";
import DataTable from "../_components/DataTable";
import { Users } from "lucide-react";

const AdminUsers = () => {
  const { userEmail } = useContext(AdminContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `/api/admin/users?email=${encodeURIComponent(userEmail)}&search=${encodeURIComponent(search)}`
        );
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) fetchUsers();
  }, [userEmail, search]);

  const columns = [
    {
      header: "User",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatarUrl ? (
            <img
              src={row.avatarUrl}
              alt={row.name || row.email}
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              {(row.name || row.email || "?")[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-slate-800 dark:text-white font-medium text-sm">{row.name || "—"}</p>
            <p className="text-slate-500 text-xs">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Interviews",
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-500/30">
          {row.interviewCount}
        </span>
      ),
    },
    {
      header: "Aptitude Tests",
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold border border-purple-200 dark:border-purple-500/30">
          {row.aptitudeCount}
        </span>
      ),
    },
    {
      header: "Logins",
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-500/30">
          {row.loginCount}
        </span>
      ),
    },
    {
      header: "Last Active",
      accessor: "lastActive",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          Users
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {users.length} registered user{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by email..."
        emptyMessage="No users found"
      />
    </div>
  );
};

export default AdminUsers;
