import axios from "axios";
const baseUrl = "/api/blogs";

let token = null;

const setToken = (newToken) => {
  token = `bearer ${newToken}`;
};

const getAll = () => {
  const request = axios.get(baseUrl);
  return request.then((response) => response.data);
};

const create = async (blog) => {
  const config = {
    headers: { Authorization: token },
  };

  try {
    const response = await axios.post(baseUrl, blog, config);
    return response;
  } catch (error) {
    message: "Error: Missing 'title' and/or 'url'";
    status: 400;
  }
};

const update = async (blog) => {
  const config = {
    headers: { Authorization: token },
  };

  const response = await axios.put(`${baseUrl}/${blog.id}`, blog, config);
  return response.data;
};

export default { getAll, create, update, setToken };
