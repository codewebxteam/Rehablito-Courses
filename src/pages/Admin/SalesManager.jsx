import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  X,
  ChevronDown,
  Calendar,
  Eye,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
  Copy,
  Check,
} from "lucide-react";
import { listenToAllOrders } from "../../firebase/orders.service";

const SalesManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Filters State
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [typeFilter, setTypeFilter] = useState("All"); // All | Course | Ebook
  const [copiedText, setCopiedText] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- 1. Real-time Listener ---
  useEffect(() => {
    const unsubscribe = listenToAllOrders((orders) => {
      const formatted = orders.map((order) => ({
        ...order,
        createdAt: order.createdAt?.toDate
          ? order.createdAt.toDate()
          : new Date(),
      }));
      
      // Deduplicate orders
      const uniqueOrders = [];
      const seen = new Set();
      formatted.forEach((txn) => {
        if (txn.userId && (txn.courseId || txn.ebookId || txn.productName)) {
          const itemKey = txn.courseId || txn.ebookId || txn.productName;
          const key = `${txn.userId}_${itemKey}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueOrders.push(txn);
          }
        } else {
          uniqueOrders.push(txn);
        }
      });

      setTransactions(uniqueOrders);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. Filter Logic (Date + Type + Search) ---
  const filteredData = useMemo(() => {
    let data = transactions;

    // A. Date Filter
    const now = new Date();
    let startDate = null;

    if (timeFilter !== "All Time") {
      startDate = new Date();
      switch (timeFilter) {
        case "Today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "7D":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30D":
          startDate.setDate(now.getDate() - 30);
          break;
        case "6M":
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "1Y":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case "Custom":
          startDate = customRange.start ? new Date(customRange.start) : null;
          break;
        default:
          startDate = null;
      }
    }

    if (startDate) {
      data = data.filter((txn) => {
        if (timeFilter === "Custom" && customRange.end) {
          const endDate = new Date(customRange.end);
          endDate.setHours(23, 59, 59, 999);
          return txn.createdAt >= startDate && txn.createdAt <= endDate;
        }
        return txn.createdAt >= startDate;
      });
    }

    // B. Type Filter (Courses / Ebooks)
    if (typeFilter !== "All") {
      data = data.filter((txn) =>
        typeFilter === "Course"
          ? txn.productType === "course"
          : txn.productType === "ebook",
      );
    }

    // C. Search Filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (txn) =>
          txn.studentName?.toLowerCase().includes(lowerQuery) ||
          txn.studentEmail?.toLowerCase().includes(lowerQuery) ||
          txn.productName?.toLowerCase().includes(lowerQuery) ||
          txn.id?.toLowerCase().includes(lowerQuery),
      );
    }

    return data;
  }, [transactions, searchQuery, timeFilter, customRange, typeFilter]);

  // --- 3. Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, searchQuery, typeFilter]);

  // --- 4. KPI Calculations ---
  const totalRevenue = filteredData.reduce(
    (sum, t) => sum + (Number(t.price) || 0),
    0,
  );
  const totalSales = filteredData.length;

  // Calculate Top Selling Product
  const topProduct = useMemo(() => {
    if (filteredData.length === 0) return { name: "N/A", count: 0 };

    const counts = {};
    filteredData.forEach((txn) => {
      const name = txn.productName || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });

    let maxName = "";
    let maxCount = 0;

    Object.entries(counts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxName = name;
      }
    });

    return { name: maxName, count: maxCount };
  }, [filteredData]);

  // CSV Export
  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Transaction ID,Student,Product,Type,Amount,Status\n" +
      filteredData
        .map(
          (e) =>
            `${e.createdAt.toLocaleDateString()},${e.id},${e.studentName},${e.productName},${e.productType},${e.price},Paid`,
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${timeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* HEADER SECTION (Centered on Mobile) */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Financial Overview
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Track earnings, invoices, and transaction history.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 transition-all flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          label="Total Earnings"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="emerald"
        />
        <KPICard
          label="Total Transactions"
          value={totalSales}
          icon={<ShoppingBag size={24} />}
          color="indigo"
        />
        {/* Top Selling Product Card */}
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="size-14 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
            <TrendingUp size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Top Selling
            </p>
            <h3
              className="text-lg font-black text-slate-900 truncate"
              title={topProduct.name}
            >
              {topProduct.name}
            </h3>
            <p className="text-xs font-bold text-slate-500">
              {topProduct.count} Units Sold
            </p>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full xl:max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by student, email, course, or ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Type Filter Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {["All", "Course", "Ebook"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${typeFilter === type
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {type === "All" ? "All" : type + "s"}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
          <AnimatePresence>
            {timeFilter === "Custom" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <input
                  type="date"
                  className="text-xs font-bold bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                  onChange={(e) =>
                    setCustomRange({ ...customRange, start: e.target.value })
                  }
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="date"
                  className="text-xs font-bold bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                  onChange={(e) =>
                    setCustomRange({ ...customRange, end: e.target.value })
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date Dropdown */}
          <div className="relative w-full sm:w-40">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <Calendar size={16} />
            </div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-10 pr-10 py-3 rounded-xl outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              {["All Time", "Today", "7D", "30D", "6M", "1Y", "Custom"].map(
                (range) => (
                  <option key={range} value={range}>
                    {range === "7D" ? "Last 7 Days" : range}
                  </option>
                ),
              )}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Transaction ID
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Student
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Item
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Date
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Amount
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {currentItems.length > 0 ? (
                  currentItems.map((txn, index) => (
                    <motion.tr
                      key={txn.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTxn(txn)}
                    >
                      <td className="p-6">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          #{txn.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                            {txn.studentName?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">
                              {txn.studentName}
                            </p>
                            <div className="flex items-center gap-2 group/copy">
                              <p className="text-xs text-slate-400">
                                {txn.studentEmail}
                              </p>
                              {txn.studentEmail && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(txn.studentEmail);
                                  }}
                                  className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-indigo-500 transition-all cursor-pointer flex items-center"
                                  title="Copy Email"
                                >
                                  {copiedText === txn.studentEmail ? (
                                    <span className="text-emerald-500 flex items-center gap-1 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                      <Check size={12} /> Copied!
                                    </span>
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-black uppercase ${txn.productType === "ebook" ? "bg-orange-50 text-orange-600" : "bg-indigo-50 text-indigo-600"}`}
                          >
                            {txn.productType}
                          </span>
                          <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                            {txn.productName}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-slate-500 whitespace-nowrap">
                          <Clock size={14} />
                          <span className="text-xs font-bold">
                            {txn.createdAt.toLocaleString("en-US", {
                              year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <span className="text-sm font-black text-slate-900">
                          ₹{txn.price}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <button className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                          <Eye size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                        <DollarSign size={24} />
                      </div>
                      <p className="text-slate-500 font-medium">
                        No transactions found.
                      </p>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredData.length)} of{" "}
              {filteredData.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="size-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="size-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILS MODAL (No Download Button) */}
      <AnimatePresence>
        {selectedTxn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-950 p-6 flex justify-between items-start">
                <div>
                  <h3 className="text-white text-lg font-bold">
                    Transaction Details
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    ID: #{selectedTxn.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center size-16 bg-emerald-50 text-emerald-500 rounded-full mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">
                    ₹{selectedTxn.price}
                  </h2>
                  <p className="text-emerald-600 font-bold text-sm mt-1">
                    Payment Successful
                  </p>
                </div>

                <div className="space-y-4 border-t border-b border-slate-100 py-6">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm font-medium">
                      Student
                    </span>
                    <span className="text-slate-900 text-sm font-bold text-right">
                      {selectedTxn.studentName}
                      <br />
                      <span className="text-slate-400 text-xs font-normal">
                        {selectedTxn.studentEmail}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm font-medium">
                      Product
                    </span>
                    <span className="text-slate-900 text-sm font-bold">
                      {selectedTxn.productName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm font-medium">
                      Date & Time
                    </span>
                    <span className="text-slate-900 text-sm font-bold">
                      {selectedTxn.createdAt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm font-medium">
                      Payment Method
                    </span>
                    <span className="text-slate-900 text-sm font-bold flex items-center gap-1">
                      <CreditCard size={14} /> Online
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Reusable Stats Card ---
const KPICard = ({ label, value, icon, color }) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
      <div
        className={`size-14 rounded-2xl flex items-center justify-center ${colors[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
      </div>
    </div>
  );
};

export default SalesManager;