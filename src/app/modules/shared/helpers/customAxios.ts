import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { environment } from 'src/environments/environment';

let yourJWTToken = localStorage.getItem('@@auth0spajs@@::ThcIBQZrRso5QaZq67kCU5eFYTfZwTSK::https://api.usealto.com::openid profile email offline_access') || '';
yourJWTToken = JSON.parse(yourJWTToken).body.access_token


export class CustomAxios {
  static async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    if (config === undefined || (config.headers === undefined) ) {
      config = {
        headers: {
          Authorization: "Bearer " + yourJWTToken
        }
      };
    }else if (config.headers.Authorization === undefined) {
      config.headers.Authorization = "Bearer " + yourJWTToken
    }
    return axios.get(environment.apiURL+url, config);
  }

  static async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    if (config === undefined || (config.headers === undefined) ) {
      config = {
        headers: {
          Authorization: "Bearer " + yourJWTToken
        }
      };
    }else if (config.headers.Authorization === undefined) {
      config.headers.Authorization = "Bearer " + yourJWTToken
    }
    return axios.post(environment.apiURL+url, data, config);
  }

  static async patch(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    if (config === undefined || (config.headers === undefined) ) {
      config = {
        headers: {
          Authorization: "Bearer " + yourJWTToken
        }
      };
    }else if (config.headers.Authorization === undefined) {
      config.headers.Authorization = "Bearer " + yourJWTToken
    }
    return axios.patch(environment.apiURL+url, data, config);
  }

  static async delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    if (config === undefined || (config.headers === undefined) ) {
      config = {
        headers: {
          Authorization: "Bearer " + yourJWTToken
        }
      };
    }else if (config.headers.Authorization === undefined) {
      config.headers.Authorization = "Bearer " + yourJWTToken
    }
    return axios.delete(environment.apiURL+url, config);
  }

}

export class helperAxios {

  static async company2email(companyId: string): Promise<string | void | undefined> {
    return CustomAxios.get('/v1/companies/'+companyId)
    .then(function (response) {
      console.log('response in helperAxios');
      console.log(response);
      if (response.data.data.length === 0) {  return undefined;  }
      return CustomAxios.get('/v1/auth/users?q=*'+response.data.data.domain+'*')
      .then(function (response) {
        console.log('response in helperAxios 2');
        console.log(response);
        if (response.data.data.length === 0) {  return undefined;  }
        return response.data.data[0].email;
      })
    })    
  }
}