import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ icon: Icon, label, value, color, bg, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay }}
      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="size-6" />
        </div>
        {/* Optional: Add a subtle trend indicator here if needed */}
      </div>

      <div>
        <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
