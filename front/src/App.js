import React, { useState ,useEffect } from "react";


function App() {
  const [command, setCommand] = useState("");
  

  const [sites, setSites] = useState([]);
  const [output, setOutput] = useState("");

  // Fetch real sites on load
  useEffect(() => {
    fetch("http://localhost:5000/sites")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSites(data.sites);
        }
      })
      .catch((err) => console.error(err));
  }, []);





  const [newSite, setNewSite] = useState({
    subdomain: "",
    folder: "",
    files: [],
  });

  const runCommand = async () => {
    try {
      const res = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      setOutput(data.output || data.error);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
    setCommand("");
  };

  const handleApache = async (action) => {
    try {
      const res = await fetch("http://localhost:5000/apache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setOutput(data.output || data.error);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
  };

  const handleAction = (site, action) => {
    fetch("http://localhost:5000/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site: site.name, action }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOutput(`${site.name} → ${action.toUpperCase()}`);
          // Refresh site list
          return fetch("http://localhost:5000/sites")
            .then((res) => res.json())
            .then((data) => setSites(data.sites));
        }
      });
  };

  const handleNewSiteChange = (e) => {
    const { name, value } = e.target;
    setNewSite((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewSite((prev) => ({ ...prev, files: Array.from(e.target.files) }));
  };

  const handleDeploy = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("subdomain", newSite.subdomain);
    formData.append("folder", newSite.folder);
    newSite.files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    try {
      const res = await fetch("http://localhost:5000/site/add", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSites((prevSites) => [
          ...prevSites,
          {
            name: newSite.subdomain,
            domain: `${newSite.subdomain}.local`,
            status: "enabled",
          },
        ]);
        setOutput(`Site ${newSite.subdomain} deployed: ${data.output}`);
        setNewSite({ subdomain: "", folder: "", files: [] });
      } else {
        setOutput(`Error: ${data.error}`);
      }
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
  };

  return (





    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1>⚡ Hosting Manager Dashboard</h1>

      {/* Command Runner */}
      <section style={{ marginTop: "20px" }}>
        <h2>💻 Run Command</h2>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command"
          style={{ padding: "5px", width: "300px" }}
        />
        <button onClick={runCommand} style={{ marginLeft: "10px" }}>
          Run
        </button>
        <p><b>Output:</b> {output}</p>
      </section>

      {/* Apache Controls */}
      <section style={{ marginTop: "20px" }}>
        <h2>🌐 Apache Controls</h2>
        <button onClick={() => handleApache("start")}>Start Apache</button>{" "}
        <button onClick={() => handleApache("stop")}>Stop Apache</button>{" "}
        <button onClick={() => handleApache("restart")}>Restart Apache</button>
      </section>

      {/* Add New Site */}
      <section style={{ marginTop: "30px" }}>
        <h2>➕ Add New Site</h2>
        <form onSubmit={handleDeploy}>
          <div>
            <label>Subdomain (e.g., newsite):</label>
            <input
              type="text"
              name="subdomain"
              value={newSite.subdomain}
              onChange={handleNewSiteChange}
              placeholder="newsite"
              style={{ padding: "5px", width: "200px", margin: "10px" }}
              required
            />
          </div>
          <div>
            <label>Folder Name (e.g., newsite):</label>
            <input
              type="text"
              name="folder"
              value={newSite.folder}
              onChange={handleNewSiteChange}
              placeholder="newsite"
              style={{ padding: "5px", width: "200px", margin: "10px" }}
              required
            />
          </div>
          <div>
            <label>Upload Files:</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ margin: "10px" }}
              required
            />
          </div>
          <button type="submit" style={{ margin: "10px" }}>
            Deploy
          </button>
        </form>
      </section>

      {/* Website Manager */}
      <section style={{ marginTop: "30px" }}>
        <h2>📂 Website Manager</h2>
   
   
   
        <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Site Name</th>
            <th>Domain</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site, index) => (
            <tr key={index}>
              <td>{site.name}</td>
              <td>{site.domain}</td>
              <td>
                {site.status === "enabled"
                  ? "🟢 Enabled"
                  : site.status === "disabled"
                  ? "🔴 Disabled"
                  : "🟡 Maintenance"}
              </td>
              <td>
                <button onClick={() => handleAction(site, "enable")}>Enable</button>{" "}
                <button onClick={() => handleAction(site, "disable")}>Disable</button>{" "}
                <button onClick={() => handleAction(site, "maintenance")}>Maintenance</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p><b>Output:</b> {output}</p>



      </section>
    </div>
  );
}

export default App;