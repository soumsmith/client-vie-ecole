const getFullUrl = () => {
  const { protocol, hostname, port } = window.location;
  const portPart = port ? `:${port}` : '';
  return `${protocol}//${hostname}/`;
  //return `https://guineeticket.com/`;
  // return `http://192.168.1.5/`;
  // return process.env.REACT_APP_API_URL || "http://localhost:8080/"; // PARAMETRE DOCKER
};


export const rootUrl = getFullUrl() + "CRUDPHP/api/";
export const baseUrl = getFullUrl() ;
export const urlBaseImage = getFullUrl() + "eticketbackend/backoffice/";
// export const urlBaseImage = getFullUrl() + "eticketbackend/backoffice/images/product/"; // PARAMETRE DOCKER

export default getFullUrl;
