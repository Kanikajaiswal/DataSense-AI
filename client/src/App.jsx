import { useDropzone } from "react-dropzone";
import { useState } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

function App() {

  const [file, setFile] = useState(null);

  const [csvData, setCsvData] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  // DRAG DROP

  const onDrop = (acceptedFiles) => {

    const uploadedFile = acceptedFiles[0];

    setFile(uploadedFile);
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({

    onDrop,

    accept: {
      "text/csv": [".csv"],
    },

    multiple: false,
  });

  const COLORS = [
    "#06b6d4",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  // UPLOAD CSV

  const handleUpload = async () => {

    if (!file) {
      alert("Please select CSV file");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {

      const res = await axios.post(
        "http://localhost:5000/api/upload",
        formData
      );

      setCsvData(res.data.data);

      alert("CSV Uploaded Successfully");

    } catch (error) {

      console.log(error);

      alert("Upload Failed");
    }
  };

  // FIND KEYS

  const salesKey =
    csvData.length > 0
      ? Object.keys(csvData[0]).find(
          (key) =>
            key.toLowerCase().includes("sales") ||
            key.toLowerCase().includes("revenue")
        )
      : null;

  const profitKey =
    csvData.length > 0
      ? Object.keys(csvData[0]).find(
          (key) =>
            key.toLowerCase().includes("profit")
        )
      : null;

  const categoryKey =
  csvData.length > 0
    ? Object.keys(csvData[0]).find(
        (key) =>
          key.toLowerCase() ===
          "category"
      )
    : null;

  // FILTER DATA

  const filteredData = csvData.filter(
    (item) => {

      const matchesSearch =
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesCategory =
        selectedCategory === "All"
          ? true
          : item[categoryKey] ===
            selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  // KPI CALCULATIONS

  const totalSales = salesKey
    ? filteredData.reduce(
        (acc, item) =>
          acc + Number(item[salesKey] || 0),
        0
      )
    : 0;

  const totalProfit = profitKey
    ? filteredData.reduce(
        (acc, item) =>
          acc + Number(item[profitKey] || 0),
        0
      )
    : 0;

  const totalOrders = filteredData.length;

  // CHART DATA

  const chartData = filteredData
    .slice(0, 10)
    .map((item, index) => {

      const firstKey =
        Object.keys(item)[0];

      const labelKey =

        Object.keys(item).find(
          (key) =>
            key
              .toLowerCase()
              .includes("product name")
        )

        ||

        Object.keys(item).find(
          (key) =>
            key
              .toLowerCase()
              .includes("sub-category")
        )

        ||

        Object.keys(item).find(
          (key) =>
            key
              .toLowerCase()
              .includes("category")
        )

        ||

        firstKey;

      return {

        name:
          item[labelKey] ||
          `Row ${index + 1}`,

        sales:
          Number(
            item[salesKey] || 0
          ),

        profit:
          Number(
            item[profitKey] || 0
          ),
      };
    });

  // INSIGHTS

  const highestSales =
    chartData.length > 0
      ? [...chartData].sort(
          (a, b) =>
            b.sales - a.sales
        )[0]
      : null;

  const lowestProfit =
    chartData.length > 0
      ? [...chartData].sort(
          (a, b) =>
            a.profit - b.profit
        )[0]
      : null;

  const averageSales =
    totalOrders > 0
      ? totalSales / totalOrders
      : 0;

  return (

    <div className="min-h-screen bg-slate-950 text-white p-10">

      {/* HEADER */}

      <div className="flex flex-col items-center gap-6">

        <h1 className="text-6xl font-bold text-cyan-400 text-center">
          DataSense AI
        </h1>

        <p className="text-slate-400 text-lg text-center">
          AI-Powered Business Analytics Dashboard
        </p>

        {/* DRAG DROP */}

        <div
          {...getRootProps()}
          className={`
            w-full max-w-2xl
            border-4 border-dashed
            rounded-3xl
            p-12
            text-center
            cursor-pointer
            transition-all duration-300
            shadow-2xl

            ${
              isDragActive
                ? "border-cyan-400 bg-cyan-500/10 scale-105"
                : "border-slate-600 bg-slate-900 hover:border-cyan-400"
            }
          `}
        >

          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-4">

            <div className="text-6xl">
              📂
            </div>

            <h2 className="text-3xl font-bold text-cyan-400">
              Drag & Drop CSV File
            </h2>

            <p className="text-slate-400 text-lg">
              or click to browse files
            </p>

            {file && (

              <div className="mt-4 bg-cyan-500/20 px-6 py-3 rounded-xl">

                <p className="text-cyan-300 font-semibold">
                  {file.name}
                </p>

              </div>
            )}

          </div>

        </div>

        {/* UPLOAD BUTTON */}

        <button
          onClick={handleUpload}
          className="bg-cyan-500 hover:bg-cyan-600 transition-all duration-300 px-8 py-3 rounded-xl text-xl font-bold shadow-lg"
        >
          Upload CSV
        </button>

      </div>

      {/* SEARCH FILTER */}

      {csvData.length > 0 && (

        <div className="sticky top-0 z-50 flex flex-col md:flex-row gap-6 mt-6 mb-10 bg-slate-950 py-4">

          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="
              bg-slate-900
              border border-cyan-500
              p-4
              rounded-2xl
              w-full
              text-white
              shadow-lg
              outline-none
            "
          />

          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value
              )
            }
            className="
              bg-slate-900
              border border-cyan-500
              p-4
              rounded-2xl
              text-white
              shadow-lg
              min-w-[250px]
              outline-none
            "
          >

            <option value="All">
              All Categories
            </option>

            {[
              ...new Set(
                csvData.map(
                  (item) =>
                    item[categoryKey]
                )
              ),
            ].map((category, index) => (

              <option
                key={index}
                value={category}
              >
                {category}
              </option>

            ))}

          </select>

        </div>
      )}

      {/* KPI CARDS */}

      {csvData.length > 0 && (

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-cyan-500">

            <h2 className="text-xl text-slate-300">
              Total Sales
            </h2>

            <p className="text-4xl mt-3 font-bold text-cyan-400">
              ₹ {totalSales.toFixed(2)}
            </p>

          </div>

          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-green-500">

            <h2 className="text-xl text-slate-300">
              Total Profit
            </h2>

            <p className="text-4xl mt-3 font-bold text-green-400">
              ₹ {totalProfit.toFixed(2)}
            </p>

          </div>

          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-pink-500">

            <h2 className="text-xl text-slate-300">
              Total Orders
            </h2>

            <p className="text-4xl mt-3 font-bold text-pink-400">
              {totalOrders}
            </p>

          </div>

        </div>
      )}

      {/* INSIGHTS */}

      {csvData.length > 0 && (

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

          <div className="bg-slate-900 p-6 rounded-2xl border border-cyan-500 shadow-xl">

            <h2 className="text-xl text-cyan-400 font-bold">
              🏆 Highest Sales
            </h2>

            <p className="mt-4 text-2xl font-bold">
              {highestSales?.name}
            </p>

            <p className="text-slate-400 mt-2">
              ₹ {highestSales?.sales}
            </p>

          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-red-500 shadow-xl">

            <h2 className="text-xl text-red-400 font-bold">
              📉 Lowest Profit
            </h2>

            <p className="mt-4 text-2xl font-bold">
              {lowestProfit?.name}
            </p>

            <p className="text-slate-400 mt-2">
              ₹ {lowestProfit?.profit}
            </p>

          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-green-500 shadow-xl">

            <h2 className="text-xl text-green-400 font-bold">
              💰 Average Sales
            </h2>

            <p className="mt-4 text-2xl font-bold">
              ₹ {averageSales.toFixed(2)}
            </p>

            <p className="text-slate-400 mt-2">
              Per Order Revenue
            </p>

          </div>

        </div>
      )}

      {/* CHARTS */}

      {csvData.length > 0 && (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-14">

          {/* BAR CHART */}

          <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-700">

            <h2 className="text-2xl font-bold mb-6 text-cyan-400">
              Sales Analytics
            </h2>

            <ResponsiveContainer width="100%" height={300}>

              <BarChart data={chartData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  stroke="#ffffff"
                />

                <YAxis stroke="#ffffff" />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="sales"
                  fill="#06b6d4"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

          {/* LINE CHART */}

          <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-700">

            <h2 className="text-2xl font-bold mb-6 text-green-400">
              Profit Trend
            </h2>

            <ResponsiveContainer width="100%" height={300}>

              <LineChart data={chartData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  stroke="#ffffff"
                />

                <YAxis stroke="#ffffff" />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#22c55e"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* PIE CHART */}

          <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-700">

            <h2 className="text-2xl font-bold mb-6 text-pink-400">
              Sales Distribution
            </h2>

            <ResponsiveContainer width="100%" height={300}>

              <PieChart>

                <Pie
                  data={chartData}
                  dataKey="sales"
                  nameKey="name"
                  outerRadius={100}
                  label
                >

                  {chartData.map((entry, index) => (

                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index % COLORS.length
                        ]
                      }
                    />

                  ))}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

          {/* AREA CHART */}

          <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-700">

            <h2 className="text-2xl font-bold mb-6 text-yellow-400">
              Revenue Growth
            </h2>

            <ResponsiveContainer width="100%" height={300}>

              <AreaChart data={chartData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  stroke="#ffffff"
                />

                <YAxis stroke="#ffffff" />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>
      )}

      {/* TABLE */}

      {filteredData.length > 0 && (

        <div className="mt-14 overflow-x-auto">

          <h2 className="text-3xl font-bold mb-6 text-cyan-300">
            Data Preview
          </h2>

          <table className="w-full border border-slate-700">

            <thead className="bg-slate-800">

              <tr>

                {Object.keys(
                  filteredData[0] || {}
                ).map((key) => (

                  <th
                    key={key}
                    className="border border-slate-700 p-3"
                  >
                    {key}
                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {filteredData
                .slice(0, 10)
                .map((row, index) => (

                  <tr
                    key={index}
                    className="hover:bg-slate-800"
                  >

                    {Object.values(row).map(
                      (value, i) => (

                        <td
                          key={i}
                          className="border border-slate-700 p-3"
                        >
                          {value}
                        </td>

                      )
                    )}

                  </tr>

                ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default App;
