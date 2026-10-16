import api from '../../../config/api';

export interface Business {
  id: string;
  user_id: string | null;
  city_id: string;
  name: string;
  type: string;
  ruc?: string;
  legal_name?: string;
  logo_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessDTO {
  name: string;
  type: string; // 'transport' | 'tourism_agency' | 'local_commerce'
  city_id: string;
  ruc?: string;
}

export const businessService = {
  getBusinesses: async (): Promise<Business[]> => {
    const response = await api.get<Business[]>('/v1/businesses');
    return response.data;
  },

  createBusiness: async (data: CreateBusinessDTO): Promise<Business> => {
    const response = await api.post<Business>('/v1/businesses', data);
    return response.data;
  }
};
