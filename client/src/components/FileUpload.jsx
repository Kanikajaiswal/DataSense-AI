import { useState } from "react";
import axios from "axios";

function FileUpload() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Select a CSV file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/upload",
        formData
      );

      console.log(res.data);

      alert("CSV Uploaded Successfully");
    } catch (error) {
      console.log(error);
      alert("Upload Failed");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        className="bg-white text-black p-2 rounded"
      />

      <button
        onClick={handleUpload}
        className="bg-cyan-500 px-6 py-2 rounded font-bold"
      >
        Upload CSV
      </button>
    </div>
  );
}

export default FileUpload;