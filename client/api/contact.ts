import apiClient from '../src/lib/api';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message?: string;
  error?: string;
  timestamp?: string;
}

export const contactApi = {
  submitContactForm: async (formData: ContactFormData): Promise<ContactResponse> => {
    const response = await apiClient.post('/contact', formData);
    return response.data;
  },
};