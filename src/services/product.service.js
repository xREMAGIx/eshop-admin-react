import axios from "axios";
//import backendUrl from "../constants/index";

export const productService = {
  getAll,
  getAllNonPagination,
  getById,
  add,
  update,
  delete: _delete,
};

async function getAll(url = null) {
  const params = url === null ? `/api/products` : `/api/products` + url;

  return await axios.get(params).then(handleResponse).catch(handleError);
}

async function getAllNonPagination() {
  return await axios.get(`/api/products/`).then(handleResponse);
}

async function getById(id) {
  return await axios.get(`/api/products/${id}`).then(handleResponse);
}

async function add(product, image) {
  console.log(image);
  if (image) {
    const imageData = new FormData();

    let imageUrl = [];
    for (let i = 0; i < image.length; i++) {
      imageData.append("image", image[i].img);

      const imageDataConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const res = await axios
        .post(`/api/admin/upload`, imageData, imageDataConfig)
        .then(handleResponse)
        .catch(handleError);

      imageUrl.push({ url: res });
    }
    Object.assign(product, { images: imageUrl });
    const requestConfig = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const body = JSON.stringify(product);

    return await axios
      .post("/api/admin/products", body, requestConfig)
      .then(handleResponse)
      .catch(handleError);
  } else {
    const requestConfig = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const body = JSON.stringify(product);

    return await axios
      .post("/api/admin/products", body, requestConfig)
      .then(handleResponse)
      .catch(handleError);
  }
}

async function update(id, product, image, delImage) {
  const imageData = new FormData();

  for (let i = 0; i < image.length; i++)
    imageData.append("images", image[i].img);

  imageData.append("product", id);

  const requestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify(product);

  if (delImage.length > 0) {
    const imageRequestConfig = {
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        ids: delImage,
      },
    };
    await axios.delete(`/api/products/images`, imageRequestConfig);
  }

  if (imageData.get("images")) {
    await axios
      .put(`/api/products/${id}/`, body, requestConfig)
      .then(handleResponse);

    const configFormData = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    return await axios
      .post("/api/products/images", imageData, configFormData)
      .then(handleResponse);
  } else {
    return await axios
      .put(`/api/products/${id}/`, body, requestConfig)
      .then(handleResponse);
  }
}

// prefixed function name with underscore because delete is a reserved word in javascript
async function _delete(ids) {
  const requestConfig = {
    // headers: authHeader()
  };

  const promises = await ids.map((id) => {
    return axios.delete(`/api/products/${id}`, requestConfig);
  });
  return Promise.all(promises).then(handleResponse);
}

function handleResponse(response) {
  let data = response.data.data;

  return data;
}

function handleError(error) {
  const errorServer = error.response.data.error;
  if (errorServer) {
    if (errorServer.errors) {
      let errorkey = Object.keys(errorServer.errors)[0];

      let errorValue = errorServer.errors[errorkey][0];

      return Promise.reject(errorkey.toUpperCase() + ": " + errorValue);
    } else if (errorServer.message) {
      return Promise.reject(errorServer.message);
    } else {
      return Promise.reject(errorServer.detail);
    }
  } else {
    return Promise.reject(
      error.response.data.code + ": " + error.response.data.message
    );
  }
}