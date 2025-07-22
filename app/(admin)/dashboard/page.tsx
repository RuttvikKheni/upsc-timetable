"use client";
import React, { useState, useEffect, useRef } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaHome,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaMoon,
  FaSun,
  FaChevronRight,
  FaSearch,
  FaTimes as FaClear,
} from "react-icons/fa";
import Link from "next/link";

const navLinks = [{ name: "Home", icon: FaHome, href: "/dashboard" }];

import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Download } from "lucide-react";
interface TimetableData {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  targetYear: string;
  amount: string;
  razorpayPaymentId: string;
  paymentStatus: string;
  downloadStatus: string;
  createdAt: string;
  razorpayOrderId: string;
  razorpayPaymentStatus: string;
}
export default function AdminDashboard() {
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [timetableData, setTimetableData] = useState<TimetableData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [fetchingLoading, setFetchingLoading] = useState(true);
  const router = useRouter();
  const handleLogout = () => {
    if (typeof document !== "undefined") {
      document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/;domain=${window.location.hostname}`;
    }
    localStorage.removeItem("userId");
    router.replace("/login");
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(typeof window !== "undefined" && localStorage.getItem("theme") === "dark");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [downloadStatusFilter, setDownloadStatusFilter] = useState("");
  const [activeNavItem, setActiveNavItem] = useState("Home"); // Track active navigation item
  const isApiCallInProgress = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!oldPwd || !newPwd || !confirmPwd) {
      setPwdError("All fields are required.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("New passwords do not match.");
      return;
    }
    if (newPwd.length < 6) {
      setPwdError("Password must be at least 6 characters.");
      return;
    }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPwd,
          newPwd,
          userId: localStorage.getItem("userId"),
        }),
      });
      const data = await res.json();
      if (data.message) {
        setChangePwdOpen(false);
        toast.success(data.message);
        setIsLoading(false);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Failed to change password. Please try again.");
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const storedTheme = typeof window !== "undefined" && localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };
  useEffect(() => {
    const fetchTimetableData = async () => {
      // Prevent duplicate API calls
      if (isApiCallInProgress.current) {
        console.log("API call already in progress, skipping...");
        return;
      }

      try {
        isApiCallInProgress.current = true;
        setFetchingLoading(true);
        console.log(`Fetching data: page=${currentPage}, limit=${itemsPerPage}`);

        const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
        const statusParam = paymentStatusFilter ? `&paymentStatus=${encodeURIComponent(paymentStatusFilter)}` : "";
        const downloadParam = downloadStatusFilter ? `&downloadStatus=${encodeURIComponent(downloadStatusFilter)}` : "";
        const response = await fetch(`/api/alltimetabledata?page=${currentPage}&limit=${itemsPerPage}${searchParam}${statusParam}${downloadParam}`);
        const data = await response.json();

        if (data.data && data.total !== undefined) {
          setTimetableData(data.data);
          setTotalCount(data.total);
        } else {
          setTimetableData(data);
          setTotalCount(data.length);
        }
        setFetchingLoading(false);
      } catch (error) {
        console.error("Error fetching timetable data:", error);
        setFetchingLoading(false);
      } finally {
        isApiCallInProgress.current = false;
      }
    };

    fetchTimetableData();
  }, [currentPage, itemsPerPage, searchQuery, paymentStatusFilter, downloadStatusFilter]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = timetableData;

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePaymentStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDownloadStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDownloadStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPaymentStatusFilter("");
    setDownloadStatusFilter("");
    setCurrentPage(1);
  };

  return (
    <>
      <ToastContainer
        autoClose={5000}
        position="top-center"
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
        <div>
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside
            className={`fixed h-screen w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-900 shadow-lg z-40 transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
              } lg:translate-x-0 `}
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100 dark:border-gray-900">
              <span className="text-xl font-bold text-gradient bg-primary bg-clip-text text-transparent dark:text-gray-100">
                <Link href="/dashboard">ProxyGyan</Link>
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="text-gray-700 hover:text-primary dark:hover:text-gray-100 focus:outline-none"
                  title={
                    darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                  onClick={toggleDarkMode}
                >
                  {darkMode ? (
                    <FaSun className="h-4 w-4 sm:w-5 sm:h-5" />
                  ) : (
                    <FaMoon className="h-4 w-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <button
                  className="lg:hidden text-gray-700 focus:outline-none"
                  onClick={() => setSidebarOpen(false)}
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>
            <nav className="mt-8 flex flex-col gap-2 px-4">
              {navLinks.map((link) => {
                const isActive = activeNavItem === link.name;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setActiveNavItem(link.name)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition group ${isActive
                      ? "bg-primary/20 dark:bg-blue-500/20 text-primary dark:text-blue-400 border-l-4 border-primary dark:border-blue-400"
                      : "text-gray-700 dark:text-gray-100 hover:bg-primary/15 dark:hover:bg-gray-800"
                      }`}
                  >
                    <link.icon className={`h-5 w-5 transition ${isActive
                      ? "text-primary dark:text-blue-400"
                      : "text-primary dark:text-blue-400 group-hover:text-primary dark:group-hover:text-blue-300"
                      }`} />
                    <span className={`transition ${isActive
                      ? "text-primary dark:text-blue-400 font-semibold"
                      : "group-hover:text-primary dark:group-hover:text-blue-300"
                      }`}>
                      {link.name}
                    </span>
                  </Link>
                );
              })}
              <Dialog.Root open={logoutOpen} onOpenChange={setLogoutOpen}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                    <Dialog.Title className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                      Confirm Logout
                    </Dialog.Title>
                    <p className="text-gray-700 dark:text-gray-300">
                      Are you sure you want to logout?
                    </p>
                    <div className="flex gap-2 justify-end mt-6">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                        onClick={() => setLogoutOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                    <Dialog.Close asChild>
                      <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 text-2xl">
                        ×
                      </button>
                    </Dialog.Close>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
              <Dialog.Root open={changePwdOpen} onOpenChange={setChangePwdOpen}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                    <Dialog.Title className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                      Change Password
                    </Dialog.Title>
                    <form
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-4"
                    >
                      <input
                        type="password"
                        placeholder="Old Password"
                        className="rounded-lg border px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={oldPwd}
                        onChange={(e) => setOldPwd(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder="New Password"
                        className="rounded-lg border px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        className="rounded-lg border px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                      />
                      {pwdError && (
                        <div className="text-red-600 text-sm">{pwdError}</div>
                      )}
                      <div className="flex gap-2 justify-end mt-2">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                          onClick={() => setChangePwdOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                        >
                          Change
                        </button>
                      </div>
                    </form>
                    <Dialog.Close asChild>
                      <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 text-2xl">
                        ×
                      </button>
                    </Dialog.Close>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </nav>
          </aside>
        </div>

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="lg:w-[calc(100%-256px)] h-16 sticky top-0 left-64 flex items-center px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
            <div className="flex gap-4 items-center w-full">
              <button
                className="lg:hidden text-gray-700 focus:outline-none"
                onClick={() => setSidebarOpen(true)}
              >
                <FaBars className="h-4 w-4" />
              </button>
              <h1 className="text-xl lg:text-2xl font-semibold lg:font-bold flex-1 text-start dark:text-white">
                Dashboard
              </h1>
              <div className="relative">
                <FaUserCircle
                  className="h-8 w-8 text-primary/80 dark:text-gray-100 cursor-pointer"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                />
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded shadow-lg z-50">
                    <ul className="border-b border-gray-200 dark:border-gray-700">
                      <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-100">
                        <button
                          className="block w-full text-left"
                          onClick={() => {
                            setUserMenuOpen(false);
                            setChangePwdOpen(true);
                          }}
                        >
                          Change Password
                        </button>
                      </li>
                    </ul>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-700 dark:hover:text-gray-100 text-red-500"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setLogoutOpen(true);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 bg-gray-100 dark:bg-gray-800 p-6 lg:ml-[256px]">
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Link href="/" className="hover:text-primary dark:hover:text-white transition-colors">
                  <FaHome className="h-4 w-4" />
                </Link>
                <FaChevronRight className="h-3 w-3" />
                <Link href="/dashboard" className="hover:text-primary dark:hover:text-white transition-colors">
                  Dashboard
                </Link>
                <FaChevronRight className="h-3 w-3" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  Timetable Report
                </span>
              </nav>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8 overflow-x-auto">

              {/* Search Bar and Filters */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-800">
                <div className="flex flex-wrap gap-2 lg:gap-4 items-start sm:items-center">
                  {/* Search Input */}
                  <div className="relative flex-1 md:max-w-md w-full sm:w-fit">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search by name, email, phone, or target year..."
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <FaClear className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Payment Status Filter */}
                  <div className="relative inline-block w-full sm:w-fit">
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        Payment Status:
                      </label>
                      <select
                        value={paymentStatusFilter}
                        onChange={handlePaymentStatusChange}
                        className="appearance-none w-full sm:w-fit px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors min-w-[120px]"
                      >
                        <option value="">All Status</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 top-7 sm:top-0 right-2 flex items-center">
                        <ChevronDown className="text-foreground w-4 h-4" strokeWidth={3} />
                      </div>
                    </div>
                  </div>

                  {/* Download Status Filter */}

                  <div className="relative inline-block w-full sm:w-fit">
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        Download Status:
                      </label>
                      <select
                        value={downloadStatusFilter}
                        onChange={handleDownloadStatusChange}
                        className="appearance-none w-full sm:w-fit px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors min-w-[120px]"
                      >
                        <option value="">All Status</option>
                        <option value="downloaded">Success</option>
                        <option value="downloaded failed">Failed</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 top-7 sm:top-0 right-2 flex items-center">
                        <ChevronDown className="text-foreground w-4 h-4" strokeWidth={3} />
                      </div>
                    </div>
                  </div>


                  {/* Clear All Filters Button */}
                  {(searchQuery || paymentStatusFilter || downloadStatusFilter) && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Active Filters Display */}
                {(searchQuery || paymentStatusFilter || downloadStatusFilter) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {searchQuery && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
                        Search: &quot;{searchQuery}&quot;
                      </span>
                    )}
                    {paymentStatusFilter && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
                        Payment: {paymentStatusFilter === 'success' ? 'Success' : 'Failed'}
                      </span>
                    )}
                    {downloadStatusFilter && (
                      <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-md">
                        Download: {downloadStatusFilter === 'downloaded' ? 'Success' : 'Failed'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white overflow-y-auto overflow-x-auto overflow-y-scroll h-[700px] dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
                <table className="w-full max-w-full min-h-[20px]">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      {[
                        "S.No",
                        "Name",
                        "Email",
                        "Phone",
                        "Target Year",
                        "Amount (₹)",
                        "Razorpay Payment ID",
                        "Razorpay Order ID",
                        "Payment Status",
                        "Download Status",
                        "Time",
                        "Print PDF",
                      ].map((item, index) => (
                        <th
                          key={index}
                          className={[
                            "px-4 py-2 text-left break-words font-medium text-foreground border-b border-gray-200 dark:border-gray-700 dark:text-white whitespace-nowrap",
                            [
                              "w-12", // S.No
                              "w-40", // Name
                              "w-56", // Email
                              "w-32", // Phone
                              "w-32", // Target Year
                              "w-20", // Amount
                              "w-56", // Razorpay Payment ID
                              "w-32", // Payment Status
                              "w-32", // Download Status
                              "w-56", // Time
                              "w-56", // Razorpay Order ID
                              "w-32 sticky -right-8 bg-gray-100 dark:bg-gray-800 z-10", // Print PDF - Fixed column
                            ][index],
                          ].join(" ")}
                        >
                          {item}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fetchingLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {Array.from({ length: 12 }).map((_, j) => (
                            <td
                              key={j}
                              className={[
                                "px-4 py-2 border-t border-gray-200 dark:border-gray-700 dark:text-white whitespace-nowrap",
                                [
                                  "w-12", // S.No 
                                  "w-40", // Name
                                  "w-56", // Email
                                  "w-32", // Phone
                                  "w-32", // Target Year
                                  "w-20", // Amount
                                  "w-56", // Razorpay Payment ID
                                  "w-32", // Payment Status
                                  "w-32", // Download Status
                                  "w-56", // Time
                                  "w-32 sticky right-0 bg-white dark:bg-gray-900 z-10", // Print PDF - Fixed column
                                ][j],
                              ].join(" ")}
                            >
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton-shimmer w-full"></div>
                            </td>
                          ))}
                        </tr>
                      ))
                      : currentData.map((item, index) => {
                        const createdAt = new Date(item.createdAt);
                        const globalIndex = startIndex + index;
                        return (
                          <tr
                            key={globalIndex}
                            className="hover:bg-gray-100   dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 whitespace-nowrap dark:text-[#64E9F8]">
                              {globalIndex + 1}
                            </td>
                            <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap text-sm dark:text-[#C9F7F5]">
                              {item.fullName}
                            </td>
                            <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap text-sm dark:text-[#34D399]">
                              {item.email}
                            </td>
                            <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap text-sm dark:text-[#FFD700]">
                              {item.contactNumber}
                            </td>
                            <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap text-sm dark:text-[#FF99CC]">
                              {item.targetYear}
                            </td>
                            <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap text-sm dark:text-[#FFC107]">
                              299
                            </td>
                            <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap text-sm dark:text-[#FFC107]">
                              {item.razorpayPaymentId}
                            </td>
                            <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap text-sm dark:text-[#A7FFEB]">
                              {item.razorpayOrderId}
                            </td>
                            <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap text-sm text-center">
                              <span
                                className={`px-2 py-1 rounded-full ${item.razorpayPaymentStatus === "success"
                                  ? "bg-green-100 dark:bg-green-200 text-green-500"
                                  : "bg-red-100 dark:bg-red-200 text-red-500"
                                  }`}
                              >
                                {" "}
                                {item.razorpayPaymentStatus === "failed"
                                  ? "Failed"
                                  : "Success"}
                              </span>
                            </td>
                            <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap text-sm text-center">
                              <span
                                className={`px-2 py-1 rounded-full ${item.downloadStatus === "downloaded failed"
                                  ? "bg-red-100 dark:bg-red-200 text-red-500"
                                  : "bg-green-100 dark:bg-green-200 text-green-500"
                                  }`}
                              >
                                {" "}
                                {item.downloadStatus === "downloaded failed"
                                  ? "Failed"
                                  : "Success"}
                              </span>
                            </td>
                            <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap text-sm dark:text-[#99E1D9]">
                              {new Intl.DateTimeFormat("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              }).format(createdAt)}
                            </td>
                            <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap text-sm dark:text-[#6EE7BC] sticky -right-6 bg-white dark:bg-gray-900 z-10">
                              <button className="flex items-center gap-1 text-primary dark:text-blue-400 hover:underline">
                                <Download className="h-4 w-4" />
                                Download
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalCount > 0 && (
                <div className="flex items-center justify-between -mt-6 px-6 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Show</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                    </select>
                    <label className="text-sm text-gray-700 dark:text-gray-300">entries</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                              ? 'z-10 bg-primary/15 border !font-bold border-primary text-primary dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                    >
                      Next
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
