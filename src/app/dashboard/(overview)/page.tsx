"use client";

import { useState } from "react";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Activity,
  BarChart3
} from "lucide-react";

// Mock data untuk chart dan statistik
const mockData = {
  salesData: [
    { month: "Jan", sales: 12000, orders: 150 },
    { month: "Feb", sales: 19000, orders: 220 },
    { month: "Mar", sales: 15000, orders: 180 },
    { month: "Apr", sales: 25000, orders: 300 },
    { month: "May", sales: 22000, orders: 280 },
    { month: "Jun", sales: 30000, orders: 350 },
  ],
  topProducts: [
    { name: "Smartphone X", sales: 1250, revenue: 187500 },
    { name: "Laptop Pro", sales: 890, revenue: 1335000 },
    { name: "Headphones", sales: 2100, revenue: 420000 },
    { name: "Smart Watch", sales: 750, revenue: 225000 },
    { name: "Tablet Air", sales: 600, revenue: 360000 },
  ],
  categoryDistribution: [
    { category: "Electronics", percentage: 45 },
    { category: "Fashion", percentage: 25 },
    { category: "Home & Garden", percentage: 15 },
    { category: "Sports", percentage: 10 },
    { category: "Books", percentage: 5 },
  ]
};

// Komponen Chart sederhana menggunakan CSS
const SimpleBarChart = ({ data, title }: { data: typeof mockData.salesData, title: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-24 text-sm text-gray-600">{item.month}</div>
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(item.sales / 30000) * 100}%` }}
            ></div>
          </div>
          <div className="w-16 text-sm font-medium text-gray-800">
            ${item.sales.toLocaleString("id-ID")}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SimplePieChart = ({ data, title }: { data: typeof mockData.categoryDistribution, title: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: `hsl(${index * 60}, 70%, 60%)`
              }}
            ></div>
            <span className="text-sm text-gray-600">{item.category}</span>
          </div>
          <span className="text-sm font-medium text-gray-800">{item.percentage}%</span>
        </div>
      ))}
    </div>
  </div>
);

const TopProductsTable = ({ products }: { products: typeof mockData.topProducts }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">Top Products</h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Product</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Sales</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-3 px-2 text-sm text-gray-800">{product.name}</td>
              <td className="py-3 px-2 text-sm text-gray-600">{product.sales.toLocaleString("id-ID")}</td>
              <td className="py-3 px-2 text-sm font-medium text-green-600">
                ${product.revenue.toLocaleString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6M");

  return (
    <div className="h-full w-full bg-gray-50 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace Dashboard</h1>
          <p className="text-gray-600">Monitor your marketplace performance and insights</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex space-x-2 bg-white p-1 rounded-lg border w-fit">
            {["1M", "3M", "6M", "1Y"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedPeriod === period
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value="$156,000"
            change="+12.5%"
            icon={DollarSign}
            color="bg-green-500"
          />
          <StatCard
            title="Total Orders"
            value="1,480"
            change="+8.2%"
            icon={ShoppingCart}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Users"
            value="8,920"
            change="+15.3%"
            icon={Users}
            color="bg-purple-500"
          />
          <StatCard
            title="Products Sold"
            value="5,670"
            change="+6.7%"
            icon={Package}
            color="bg-orange-500"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SimpleBarChart
            data={mockData.salesData}
            title="Monthly Sales Performance"
          />
          <SimplePieChart
            data={mockData.categoryDistribution}
            title="Category Distribution"
          />
        </div>

        {/* Top Products and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TopProductsTable products={mockData.topProducts} />

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: "New order received", time: "2 min ago", type: "order" },
                { action: "Product inventory updated", time: "15 min ago", type: "inventory" },
                { action: "Customer review posted", time: "1 hour ago", type: "review" },
                { action: "Payment processed", time: "2 hours ago", type: "payment" },
                { action: "New user registered", time: "3 hours ago", type: "user" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${activity.type === 'order' ? 'bg-blue-500' :
                    activity.type === 'inventory' ? 'bg-green-500' :
                      activity.type === 'review' ? 'bg-yellow-500' :
                        activity.type === 'payment' ? 'bg-purple-500' : 'bg-gray-500'
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Add Product", icon: Package, color: "bg-blue-500" },
              { label: "View Orders", icon: ShoppingCart, color: "bg-green-500" },
              { label: "Analytics", icon: BarChart3, color: "bg-purple-500" },
              { label: "Reports", icon: Activity, color: "bg-orange-500" },
            ].map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className={`p-3 rounded-full ${action.color} mb-2`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}