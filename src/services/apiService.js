const API_URL = "/api";

// Projects
export const getProjects = async () => {
  const response = await fetch(`${API_URL}/projects`);
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
};

export const getProjectById = async (id) => {
  const response = await fetch(`${API_URL}/projects/${id}`);
  if (!response.ok) throw new Error("Failed to fetch project");
  return response.json();
};

export const createProject = async (projectData) => {
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData),
  });
  if (!response.ok) throw new Error("Failed to create project");
  return response.json();
};

export const deleteProject = async (id) => {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete project");
};

// Bids
export const getBids = async () => {
  const response = await fetch(`${API_URL}/bids`);
  if (!response.ok) throw new Error("Failed to fetch bids");
  return response.json();
};

export const getBidsByProject = async (projectId) => {
  const response = await fetch(`${API_URL}/bids?projectId=${projectId}`);
  if (!response.ok) throw new Error("Failed to fetch project bids");
  return response.json();
};

export const getBidsByContractor = async (contractorId) => {
  const response = await fetch(`${API_URL}/bids?contractorId=${contractorId}`);
  if (!response.ok) throw new Error("Failed to fetch contractor bids");
  return response.json();
};

export const createBid = async (bidData) => {
  const response = await fetch(`${API_URL}/bids`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bidData),
  });
  if (!response.ok) throw new Error("Failed to create bid");
  return response.json();
};

// Legacy aliases for backward compatibility
export const fetchProjects = getProjects;
export const fetchProject = getProjectById;
export const fetchBids = getBids;
export const submitBid = createBid;
